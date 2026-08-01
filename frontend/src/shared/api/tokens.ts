import * as SecureStore from 'expo-secure-store';

/**
 * Accès aux jetons JWT — source de vérité du service API.
 *
 * DÉCISION D'ARCHITECTURE : le service lit le stockage lui-même, il n'attend pas qu'on
 * lui injecte le token. L'AuthContext (étape 7) ÉCRIT ici, le service LIT ici, et les
 * deux s'ignorent. Aucune dépendance circulaire, et le service fonctionne hors de React
 * — ce qui est indispensable, puisque le rafraîchissement se déclenche depuis un
 * intercepteur axios, en dehors de tout composant.
 *
 * SecureStore chiffre au repos : Keychain sur iOS, Keystore sur Android. C'est ce
 * qu'exige la spec (A1 §14, D1 §9 BR-4) pour des jetons de session.
 *
 * CACHE MÉMOIRE : SecureStore est asynchrone et touche le stockage sécurisé du système.
 * Le relire à chaque requête serait coûteux et inutile puisque le service est le seul
 * à écrire. Le cache est invalidé par `setTokens` et `clearTokens`, jamais deviné.
 */

const ACCESS_KEY = 'lift.access_token';
const REFRESH_KEY = 'lift.refresh_token';
const USER_KEY = 'lift.user';

export type TokenPair = {
  access: string;
  refresh: string;
};

/**
 * `undefined` = jamais lu depuis le stockage.
 * `null` = lu, et il n'y avait rien.
 * La distinction évite de relire le stockage à chaque requête quand l'utilisateur est
 * déconnecté.
 */
let cachedAccess: string | null | undefined;
let cachedRefresh: string | null | undefined;

/** Jeton d'accès courant, ou `null` si l'utilisateur n'est pas connecté. */
export async function getAccessToken(): Promise<string | null> {
  if (cachedAccess === undefined) {
    cachedAccess = await SecureStore.getItemAsync(ACCESS_KEY);
  }
  return cachedAccess;
}

/** Jeton de rafraîchissement courant, ou `null`. */
export async function getRefreshToken(): Promise<string | null> {
  if (cachedRefresh === undefined) {
    cachedRefresh = await SecureStore.getItemAsync(REFRESH_KEY);
  }
  return cachedRefresh;
}

/**
 * Écrit la paire de jetons.
 *
 * A1 §9 BR-3 : « un refresh réussi remplace access ET refresh token localement ».
 * Le backend a `ROTATE_REFRESH_TOKENS: True` — chaque rafraîchissement renvoie un
 * nouveau refresh token, et ignorer celui-ci reviendrait à conserver un jeton périmé.
 */
export async function setTokens({ access, refresh }: TokenPair): Promise<void> {
  cachedAccess = access;
  cachedRefresh = refresh;
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_KEY, access),
    SecureStore.setItemAsync(REFRESH_KEY, refresh),
  ]);
}

/**
 * Purge les jetons.
 *
 * D1 §9 BR-4 : « la déconnexion invalide les tokens localement (purge SecureStore) ».
 * Également appelé par A1 §9 BR-4 quand le rafraîchissement échoue en authentification.
 */
export async function clearTokens(): Promise<void> {
  cachedAccess = null;
  cachedRefresh = null;
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
}

/**
 * Conserve l'utilisateur connu localement.
 *
 * POURQUOI STOCKER L'UTILISATEUR ET PAS SEULEMENT LES JETONS : A1 §9 BR-5 exige que
 * l'app reste utilisable quand le rafraîchissement échoue POUR CAUSE RÉSEAU. Sans
 * utilisateur en local, cet « accès optimiste » afficherait un accueil amputé — B1 §6
 * y attend une salutation avec le pseudo.
 *
 * Le stockage est le même que celui des jetons : SecureStore les efface ensemble, il
 * n'existe donc aucun état où l'on aurait un utilisateur sans session.
 *
 * @param user Sérialisable en JSON. Aucune donnée sensible : `AuthUser` ne contient
 *   qu'identifiant, pseudo, email et drapeau de vérification.
 */
export async function setStoredUser(user: unknown): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

/**
 * Relit l'utilisateur conservé.
 *
 * Renvoie `null` si rien n'est stocké OU si le contenu est illisible — un JSON corrompu
 * est traité comme une absence, jamais comme une erreur. Le pire cas est alors une
 * salutation sans pseudo, pas un plantage au démarrage.
 */
export async function getStoredUser<T>(): Promise<T | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
