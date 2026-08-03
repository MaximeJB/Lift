import { isTokenValid } from './jwt';

/**
 * A1 §13 : la session se résout en local, sous 100 ms, sans le moindre appel réseau. Tout
 * repose sur cette fonction — si elle se trompe, l'app part en boucle de rafraîchissement
 * au démarrage, ou laisse entrer avec un jeton mort.
 *
 * Les jetons sont fabriqués ici plutôt qu'importés : un jeton figé en dur expirerait, et
 * la suite deviendrait rouge un matin sans que rien n'ait changé.
 */
function jetonExpirantDans(secondes: number): string {
  const entete = { alg: 'HS256', typ: 'JWT' };
  const charge = { exp: Math.floor(Date.now() / 1000) + secondes };

  const encode = (objet: unknown) =>
    Buffer.from(JSON.stringify(objet)).toString('base64url');

  return `${encode(entete)}.${encode(charge)}.signature-non-verifiee`;
}

function jetonSansExpiration(): string {
  const encode = (objet: unknown) =>
    Buffer.from(JSON.stringify(objet)).toString('base64url');

  return `${encode({ alg: 'HS256' })}.${encode({ sub: 'utilisateur' })}.signature`;
}

describe('isTokenValid', () => {
  it('accepte un jeton qui expire dans une heure', () => {
    expect(isTokenValid(jetonExpirantDans(3600))).toBe(true);
  });

  it('refuse un jeton déjà expiré', () => {
    expect(isTokenValid(jetonExpirantDans(-10))).toBe(false);
  });

  /**
   * La marge de 30 secondes est le cœur de la fonction : un jeton expirant dans deux
   * secondes serait mort avant d'arriver au serveur. L'accepter garantirait un 401 suivi
   * d'un rafraîchissement — un aller-retour perdu à chaque démarrage.
   */
  it('refuse un jeton qui expire dans 10 secondes, à cause de la marge', () => {
    expect(isTokenValid(jetonExpirantDans(10))).toBe(false);
  });

  it('accepte un jeton qui expire juste au-delà de la marge', () => {
    expect(isTokenValid(jetonExpirantDans(45))).toBe(true);
  });

  it('refuse `null` — aucun jeton stocké', () => {
    expect(isTokenValid(null)).toBe(false);
  });

  it('refuse une chaîne vide', () => {
    expect(isTokenValid('')).toBe(false);
  });

  /** A1 §10 : « refresh token corrompu/illisible → traité comme absent ». */
  it('refuse un jeton illisible sans lever', () => {
    expect(isTokenValid('pas-du-tout-un-jwt')).toBe(false);
  });

  it('refuse un jeton dont la charge utile n’est pas du JSON', () => {
    expect(isTokenValid('entete.charge-cassee.signature')).toBe(false);
  });

  it('refuse un jeton sans champ `exp`', () => {
    expect(isTokenValid(jetonSansExpiration())).toBe(false);
  });

  /**
   * `exp` est en SECONDES depuis epoch. Le lire comme des millisecondes ferait passer
   * tous les jetons pour expirés depuis cinquante ans — l'erreur classique.
   */
  it('lit `exp` en secondes, pas en millisecondes', () => {
    const encode = (objet: unknown) =>
      Buffer.from(JSON.stringify(objet)).toString('base64url');
    const enMillisecondes = `${encode({ alg: 'HS256' })}.${encode({
      exp: Date.now() + 3600_000,
    })}.sig`;

    // Interprété en secondes, cet `exp` est très loin dans le futur : donc valide.
    expect(isTokenValid(enMillisecondes)).toBe(true);
  });
});
