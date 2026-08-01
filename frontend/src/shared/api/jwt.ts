import { jwtDecode } from 'jwt-decode';

/**
 * Inspection locale des jetons JWT.
 *
 * A1 §9 BR-1 : « décodage local du JWT (comparaison `exp`), aucun appel réseau si le
 * token est valide ». A1 §13 exige une décision en moins de 100 ms au démarrage — un
 * aller-retour réseau ne tiendrait pas ce budget.
 *
 * CE N'EST PAS UNE VÉRIFICATION DE SIGNATURE. On lit la charge utile sans vérifier
 * quoi que ce soit : c'est le serveur qui valide, toujours. Ce décodage sert uniquement
 * à éviter d'envoyer une requête qu'on sait vouée à un 401.
 */

/** Claims que SimpleJWT place dans ses jetons d'accès. Seul `exp` nous intéresse. */
type JwtPayload = {
  /** Expiration, en SECONDES depuis epoch — pas en millisecondes. */
  exp?: number;
};

/**
 * Marge de sécurité avant l'expiration réelle.
 *
 * Un jeton expirant dans deux secondes est considéré comme déjà mort : le temps que la
 * requête parte et arrive, il le serait. Évite un aller-retour garanti perdant suivi
 * d'un rafraîchissement.
 */
const EXPIRY_MARGIN_SECONDS = 30;

/**
 * Le jeton est-il encore utilisable ?
 *
 * Renvoie `false` dans TOUS les cas douteux — jeton illisible, `exp` absent, expiré.
 * A1 §10 : « refresh token corrompu/illisible → traité comme absent ». Un jeton qu'on
 * ne sait pas lire est un jeton en qui on ne peut pas avoir confiance.
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;

  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    if (typeof exp !== 'number') return false;

    const nowSeconds = Date.now() / 1000;
    return exp - EXPIRY_MARGIN_SECONDS > nowSeconds;
  } catch {
    return false;
  }
}
