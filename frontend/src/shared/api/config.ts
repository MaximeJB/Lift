/**
 * Configuration réseau — valeurs issues de la spec d'interface et du backend Django.
 *
 * Aucune de ces constantes n'est arbitraire : chacune cite sa source.
 */

/**
 * URL de base de l'API, sans slash final.
 *
 * Lue depuis `EXPO_PUBLIC_API_URL`. Le préfixe `EXPO_PUBLIC_` est obligatoire pour
 * qu'Expo l'injecte dans le bundle client — une variable sans ce préfixe serait
 * `undefined` à l'exécution, sans avertissement.
 *
 * En développement c'est l'IP locale de la machine (`http://192.168.1.13:8000`) :
 * `localhost` désignerait le téléphone lui-même, pas le serveur.
 */
const RAW_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!RAW_BASE_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL n'est pas définie.\n" +
      '  1. Copier .env.example vers .env\n' +
      "  2. Y mettre l'IP locale de la machine qui fait tourner Django\n" +
      '     (ipconfig sous Windows, ifconfig sous macOS/Linux)\n' +
      '  3. Relancer avec `npx expo start -c` — les variables sont lues au démarrage',
  );
}

/** Sans slash final : les chemins des services commencent tous par `/`. */
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

/**
 * Délai maximal d'une requête ordinaire.
 *
 * Source : LIFT_Specification_Interface_V1.md, A2 §13 et A3 §13 — « timeout client 10s ».
 */
export const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Délai maximal d'une tentative de rafraîchissement de token.
 *
 * Plus court que le timeout ordinaire, à dessein : l'utilisateur attend derrière un
 * écran de démarrage. Source : A1 §9 BR-6 — « timeout de la tentative de refresh fixé
 * à 5s » — et A1 §13, « timeout réseau dur à 5s ».
 */
export const REFRESH_TIMEOUT_MS = 5_000;

/**
 * Taille de page du backend.
 *
 * Source : Lift/settings.py — `DEFAULT_PAGINATION_CLASS: LimitOffsetPagination`,
 * `PAGE_SIZE: 25`. Répliqué ici pour que les appelants n'aient pas à la deviner.
 */
export const PAGE_SIZE = 25;

/** Chemins d'authentification, tirés de accounts/urls.py. */
export const AUTH_PATHS = {
  login: '/api/auth/login/',
  register: '/api/auth/register/',
  refresh: '/api/auth/token/refresh/',
  me: '/api/auth/me/',
} as const;
