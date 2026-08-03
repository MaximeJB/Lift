import { create, isAxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

import { API_BASE_URL, AUTH_PATHS, REFRESH_TIMEOUT_MS, REQUEST_TIMEOUT_MS } from './config';
import { AuthError, NetworkError, toApiError } from './errors';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './tokens';

/**
 * Client HTTP unique de l'application.
 *
 * Trois responsabilités, et rien d'autre :
 *   1. injecter le jeton d'accès dans chaque requête
 *   2. rafraîchir ce jeton quand il a expiré, une seule fois même si dix requêtes
 *      échouent en même temps
 *   3. traduire toute erreur HTTP en erreur métier (voir errors.ts)
 *
 * Aucun écran ne doit jamais importer axios directement.
 */

/** Marque une requête déjà rejouée, pour ne jamais boucler sur un 401 persistant. */
type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

/**
 * Appelé quand la session est définitivement perdue.
 *
 * A1 §9 BR-4 : « un refresh échouant avec une erreur d'authentification déclenche
 * logout() + redirection Login avec message Session expirée ».
 *
 * Le client ne connaît ni React ni la navigation : il ne peut pas rediriger lui-même.
 * L'AuthContext (étape 7) enregistre ici ce qu'il faut faire. Tant que personne ne
 * s'abonne, les jetons sont purgés et l'appelant reçoit une AuthError — comportement
 * dégradé mais jamais incohérent.
 */
let onSessionExpired: (() => void) | null = null;

/** Enregistre le gestionnaire de session expirée. Appelé une fois par l'AuthContext. */
export function setSessionExpiredHandler(handler: (() => void) | null): void {
  onSessionExpired = handler;
}

/**
 * Instance dédiée au rafraîchissement.
 *
 * SÉPARÉE À DESSEIN : si elle passait par le client principal, son propre échec 401
 * déclencherait un intercepteur qui tenterait un rafraîchissement, qui échouerait,
 * qui déclencherait un intercepteur — boucle infinie. Elle n'a donc aucun intercepteur.
 */
const refreshClient = create({
  baseURL: API_BASE_URL,
  timeout: REFRESH_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Rafraîchissement en cours, partagé par tous les appelants.
 *
 * A1 §10 : « deux tentatives de refresh simultanées → mutex ». Sans ce partage, dix
 * requêtes expirant ensemble lanceraient dix rafraîchissements ; comme le backend a
 * `ROTATE_REFRESH_TOKENS: True`, chacun invaliderait le précédent et neuf sur dix
 * échoueraient — déconnectant l'utilisateur sans raison.
 *
 * Le premier appelant crée la promesse, les suivants s'y accrochent.
 */
let refreshInFlight: Promise<string> | null = null;

/**
 * Rafraîchit le jeton d'accès et renvoie le nouveau.
 *
 * Distingue les deux échecs que la spec traite différemment :
 *   - AuthError : le refresh token est refusé → session perdue (BR-4)
 *   - NetworkError : le serveur est injoignable → surtout PAS de déconnexion (BR-5)
 *
 * @throws {AuthError} le rafraîchissement est refusé, ou aucun refresh token n'existe
 * @throws {NetworkError} le serveur n'a pas répondu
 */
async function refreshAccessToken(): Promise<string> {
  const refresh = await getRefreshToken();

  // A1 §10 : « refresh token corrompu/illisible → traité comme absent ».
  if (!refresh) {
    throw new AuthError('Aucune session à restaurer.');
  }

  try {
    const { data } = await refreshClient.post<{ access: string; refresh?: string }>(
      AUTH_PATHS.refresh,
      { refresh },
    );

    // ROTATE_REFRESH_TOKENS étant actif côté Django, la réponse contient un nouveau
    // refresh token. On le conserve : garder l'ancien reviendrait à stocker un jeton
    // que le serveur ne reconnaîtra plus après la prochaine rotation.
    await setTokens({ access: data.access, refresh: data.refresh ?? refresh });

    return data.access;
  } catch (error) {
    const apiError = toApiError(error);

    // Le réseau a lâché : la session n'est pas invalide, seulement inatteignable.
    // La purger déconnecterait un utilisateur dont le token est peut-être encore bon.
    if (apiError instanceof NetworkError) throw apiError;

    await clearTokens();
    onSessionExpired?.();
    throw new AuthError();
  }
}

/**
 * Point d'entrée du rafraîchissement, protégé par le mutex.
 *
 * `finally` remet le verrou à zéro dans tous les cas — sans quoi un échec figerait
 * définitivement la promesse rejetée et toute requête ultérieure échouerait sans même
 * réessayer.
 */
function refreshOnce(): Promise<string> {
  refreshInFlight ??= refreshAccessToken().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

/**
 * Force un rafraîchissement, hors de tout 401.
 *
 * Sert au démarrage de l'app (A1 §9 BR-2) : le jeton d'accès est expiré, on tente de le
 * renouveler AVANT d'envoyer quoi que ce soit. A1 §15 interdit d'appeler `/api/auth/me/`
 * à chaque lancement pour provoquer un 401 — ce serait un aller-retour inutile et un
 * budget de 100 ms intenable.
 *
 * Partage le même verrou que le rafraîchissement automatique : si une requête déclenche
 * un 401 pendant le démarrage, les deux se rejoignent sur la même promesse.
 *
 * @throws {AuthError} session définitivement perdue — BR-4
 * @throws {NetworkError} serveur injoignable — BR-5, ne pas déconnecter
 */
export function refreshSession(): Promise<string> {
  return refreshOnce();
}

/** Instance principale. Tout passe par elle. */
export const http: AxiosInstance = create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
  /**
   * Un paramètre à valeurs multiples est répété tel quel, sans crochets.
   *
   *   indexes: null  →  ?muscle_group=CHEST&muscle_group=BACK
   *   défaut d'axios →  ?muscle_group[]=CHEST&muscle_group[]=BACK
   *
   * Django lit ces valeurs avec `request.GET.getlist('muscle_group')`, qui ne connaît
   * pas la clé `muscle_group[]` : la forme par défaut d'axios ferait silencieusement
   * ignorer tous les filtres. C1 §9 BR-3 en dépend — c'est ce qui rend le OU possible
   * entre les chips.
   */
  paramsSerializer: { indexes: null },
});

/** Injecte le jeton d'accès, s'il existe. Les endpoints publics fonctionnent sans. */
http.interceptors.request.use(async (config) => {
  const access = await getAccessToken();
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

/**
 * Rejoue une seule fois toute requête refusée en 401, après rafraîchissement.
 *
 * Trois garde-fous contre la boucle :
 *   - `_retried` : une requête n'est rejouée qu'une fois
 *   - le chemin de rafraîchissement lui-même est exclu
 *   - `refreshClient` n'a aucun intercepteur
 */
http.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error) || !error.config) {
      throw toApiError(error);
    }

    const config = error.config as RetriableConfig;
    const isAuthFailure = error.response?.status === 401;
    const isRefreshCall = config.url === AUTH_PATHS.refresh;

    if (!isAuthFailure || config._retried || isRefreshCall) {
      throw toApiError(error);
    }

    config._retried = true;

    try {
      const access = await refreshOnce();
      config.headers.Authorization = `Bearer ${access}`;
      return await http.request(config);
    } catch (refreshError) {
      // Remonte l'erreur du RAFRAÎCHISSEMENT, pas le 401 initial : c'est elle qui
      // porte la distinction auth / réseau dont l'appelant a besoin.
      throw toApiError(refreshError);
    }
  },
);
