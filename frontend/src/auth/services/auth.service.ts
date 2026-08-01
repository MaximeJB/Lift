import {
  api,
  clearTokens,
  setStoredUser,
  setTokens,
  type AuthUser,
  type LoginResponse,
  type RegisterResponse,
  type UserProfile,
} from '../../shared/api';

/**
 * Authentification — A2 (connexion), A3 (inscription), D1 (profil).
 *
 * CES FONCTIONS ÉCRIVENT LA SESSION. `login` et `register` persistent les jetons ET
 * l'utilisateur avant de rendre la main : à leur retour, l'utilisateur est réellement
 * connecté et tout appel ultérieur portera l'en-tête d'autorisation. L'AuthContext n'a
 * plus qu'à refléter l'état, il n'a rien à mémoriser lui-même.
 *
 * L'utilisateur est persisté pour que A1 §9 BR-5 soit applicable : quand le
 * rafraîchissement échoue faute de réseau, l'accueil doit rester affichable avec le
 * pseudo connu.
 */

const PATHS = {
  login: '/api/auth/login/',
  register: '/api/auth/register/',
  me: '/api/auth/me/',
} as const;

/** Ce que `login` et `register` renvoient tous les deux, quelle que soit la forme brute. */
export type Session = {
  access: string;
  refresh: string;
  user: AuthUser;
};

/**
 * Connexion — A2.
 *
 * A2 §9 BR-3 : « succès → access/refresh/user stockés, navigation vers B1 ». Les jetons
 * sont écrits ici même.
 *
 * A2 §9 BR-2 : en cas d'identifiants faux, le backend renvoie 400 et le client reçoit
 * une `ValidationError`. Le message affiché doit rester GÉNÉRIQUE — ne jamais révéler
 * lequel des deux champs est faux, cela permettrait d'énumérer les comptes existants.
 *
 * A2 §10 : l'email est nettoyé de ses espaces avant envoi.
 *
 * @throws {ValidationError} identifiants refusés (400)
 * @throws {NetworkError} serveur injoignable ou trop lent
 */
export async function login(email: string, password: string): Promise<Session> {
  const response = await api.post<LoginResponse>(PATHS.login, {
    email: email.trim(),
    password,
  });

  await setTokens({ access: response.access, refresh: response.refresh });
  await setStoredUser(response.user);

  return response;
}

/** Champs attendus par `UserRegistrationSerializer`. */
export type RegisterInput = {
  email: string;
  password: string;
  passwordConfirm: string;
  pseudo: string;
};

/**
 * Inscription — A3.
 *
 * NORMALISE UNE INCOHÉRENCE DE L'API. `LoginView` place les jetons à la racine de sa
 * réponse, `RegisterView.create` les greffe sous une clé `tokens`. Pire :
 * `UserRegistrationSerializer` n'expose que `email` et `pseudo`, donc la réponse ne
 * contient ni `id` ni `email_verified` — deux champs que `LoginResponse` promet.
 *
 * D'où l'appel supplémentaire à `/api/auth/me/`, explicitement autorisé par A3 §9 BR-5 :
 * « un appel à GET /api/auth/me/ est acceptable en filet de sécurité si la forme de la
 * réponse pose problème à l'implémentation ». C'est exactement ce cas.
 *
 * L'ordre compte : les jetons sont écrits AVANT d'appeler `/me/`, sinon la requête
 * partirait sans autorisation et échouerait en 401.
 *
 * A3 §9 BR-6 : email et pseudo nettoyés, email normalisé en minuscules.
 * A3 §9 BR-1 : la comparaison des deux mots de passe se fait CÔTÉ ÉCRAN, avant
 * d'appeler cette fonction — le backend lève une ValidationError au message vide sur ce
 * cas, ce qui n'afficherait rien d'utile.
 *
 * @throws {ValidationError} email ou pseudo déjà pris (400) — voir `fields`
 * @throws {NetworkError} serveur injoignable ou trop lent
 */
export async function register(input: RegisterInput): Promise<Session> {
  const response = await api.post<RegisterResponse>(PATHS.register, {
    email: input.email.trim().toLowerCase(),
    password: input.password,
    password_confirm: input.passwordConfirm,
    pseudo: input.pseudo.trim(),
  });

  await setTokens(response.tokens);

  // Complète ce que la réponse d'inscription ne fournit pas.
  const profile = await getMe();

  const user: AuthUser = {
    id: profile.id,
    email: profile.email,
    email_verified: profile.email_verified,
    // `pseudo` vient de la réponse d'inscription : `PrivateUserSerializer` ne l'expose
    // pas encore. Voir la note sur `UserProfile` dans types.ts.
    pseudo: response.pseudo,
  };

  await setStoredUser(user);

  return {
    access: response.tokens.access,
    refresh: response.tokens.refresh,
    user,
  };
}

/**
 * Profil de l'utilisateur connecté — D1.
 *
 * A1 §15 : ne PAS appeler cette fonction à chaque lancement de l'app. La validité du
 * jeton se vérifie en local par décodage, sans requête réseau.
 *
 * @throws {AuthError} aucune session valide
 */
export function getMe(): Promise<UserProfile> {
  return api.get<UserProfile>(PATHS.me);
}

/**
 * Modification partielle du profil — D1 §9 BR-1.
 *
 * `Partial` rend toutes les propriétés optionnelles : on n'envoie que ce qui change,
 * ce qui est exactement la sémantique d'un PATCH.
 *
 * Les champs en lecture seule (`id`, `email`, `created_at`, `email_verified`) sont
 * exclus du type d'entrée : les envoyer serait silencieusement ignoré par DRF, et rien
 * n'avertirait l'appelant que sa modification n'a pas pris.
 *
 * @throws {ValidationError} valeur refusée (400)
 * @throws {AuthError} aucune session valide
 */
export type ProfileUpdate = Partial<Pick<UserProfile, 'first_name' | 'last_name' | 'profile_visibility'>>;

export function updateMe(changes: ProfileUpdate): Promise<UserProfile> {
  return api.patch<UserProfile>(PATHS.me, changes);
}

/**
 * Déconnexion — D1 §9 BR-4 : « invalide les tokens localement (purge SecureStore) ».
 *
 * Purement locale : aucun endpoint de déconnexion n'existe côté Django, et
 * `BLACKLIST_AFTER_ROTATION` est à `False`. Un refresh token volé AVANT la déconnexion
 * reste donc valable jusqu'à son expiration — un jour, d'après `SIMPLE_JWT`.
 * C'est une limite du backend, pas de cette fonction.
 */
export function logout(): Promise<void> {
  return clearTokens();
}
