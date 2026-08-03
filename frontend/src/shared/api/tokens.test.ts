import type * as SecureStoreModule from 'expo-secure-store';

/**
 * `tokens.ts` tient un CACHE MÉMOIRE devant SecureStore, invalidé par `setTokens` et
 * `clearTokens`. C'est lui qui rend A1 §13 tenable — une session résolue en moins de
 * 100 ms — mais c'est aussi lui qui, mal invalidé, ferait survivre un jeton après une
 * déconnexion.
 */
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

/**
 * Recharge le module testé ET son mock, ensemble.
 *
 * `jest.resetModules()` vide le registre : le module reçoit alors un cache vierge, ce
 * qu'on veut, mais la fabrique de `jest.mock` est rejouée elle aussi et produit de
 * NOUVELLES fonctions espionnes. Garder une référence prise avant le reset ferait
 * observer un mock que le module n'utilise plus — les appels resteraient invisibles.
 */
function charger() {
  jest.resetModules();

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const stockage = require('expo-secure-store') as jest.Mocked<typeof SecureStoreModule>;
  stockage.getItemAsync.mockResolvedValue(null);
  stockage.setItemAsync.mockResolvedValue(undefined);
  stockage.deleteItemAsync.mockResolvedValue(undefined);

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const tokens = require('./tokens') as typeof import('./tokens');

  return { tokens, stockage };
}

describe('lecture des jetons', () => {
  it('renvoie null quand rien n’est stocké', async () => {
    const { tokens } = charger();
    expect(await tokens.getAccessToken()).toBeNull();
  });

  it('lit le stockage une seule fois, puis sert le cache', async () => {
    const { tokens, stockage } = charger();
    stockage.getItemAsync.mockResolvedValue('jeton-1');

    await tokens.getAccessToken();
    await tokens.getAccessToken();
    await tokens.getAccessToken();

    expect(stockage.getItemAsync).toHaveBeenCalledTimes(1);
  });

  /**
   * `undefined` veut dire « jamais lu », `null` veut dire « lu, et il n'y avait rien ».
   * Sans cette distinction, un utilisateur déconnecté relirait le stockage sécurisé du
   * système à chaque requête.
   */
  it('ne relit pas le stockage quand la première lecture a rendu null', async () => {
    const { tokens, stockage } = charger();

    await tokens.getRefreshToken();
    await tokens.getRefreshToken();

    expect(stockage.getItemAsync).toHaveBeenCalledTimes(1);
  });

  it('sépare le jeton d’accès du jeton de rafraîchissement', async () => {
    const { tokens, stockage } = charger();
    stockage.getItemAsync.mockImplementation(async (cle: string) =>
      cle === 'lift.access_token' ? 'acces' : 'rafraichissement',
    );

    expect(await tokens.getAccessToken()).toBe('acces');
    expect(await tokens.getRefreshToken()).toBe('rafraichissement');
  });
});

describe('setTokens', () => {
  it('écrit les deux jetons et rend le cache immédiatement cohérent', async () => {
    const { tokens, stockage } = charger();

    await tokens.setTokens({ access: 'a1', refresh: 'r1' });

    expect(await tokens.getAccessToken()).toBe('a1');
    expect(await tokens.getRefreshToken()).toBe('r1');
    // Le cache répond seul : aucune lecture du stockage n'a été nécessaire.
    expect(stockage.getItemAsync).not.toHaveBeenCalled();
  });

  /** A1 §9 BR-3 : un rafraîchissement remplace les DEUX jetons, rotation oblige. */
  it('remplace un jeton déjà en cache', async () => {
    const { tokens } = charger();

    await tokens.setTokens({ access: 'a1', refresh: 'r1' });
    await tokens.setTokens({ access: 'a2', refresh: 'r2' });

    expect(await tokens.getAccessToken()).toBe('a2');
    expect(await tokens.getRefreshToken()).toBe('r2');
  });

  it('écrit sous les deux clés attendues', async () => {
    const { tokens, stockage } = charger();

    await tokens.setTokens({ access: 'a1', refresh: 'r1' });

    expect(stockage.setItemAsync).toHaveBeenCalledWith('lift.access_token', 'a1');
    expect(stockage.setItemAsync).toHaveBeenCalledWith('lift.refresh_token', 'r1');
  });
});

describe('clearTokens', () => {
  it('vide le cache, pas seulement le stockage', async () => {
    const { tokens } = charger();
    await tokens.setTokens({ access: 'a1', refresh: 'r1' });

    await tokens.clearTokens();

    expect(await tokens.getAccessToken()).toBeNull();
    expect(await tokens.getRefreshToken()).toBeNull();
  });

  /** D1 §9 BR-4 : la déconnexion purge aussi l'utilisateur mémorisé. */
  it('efface les deux jetons ET l’utilisateur', async () => {
    const { tokens, stockage } = charger();

    await tokens.clearTokens();

    const cles = stockage.deleteItemAsync.mock.calls.map(([cle]) => cle);
    expect(cles).toEqual(
      expect.arrayContaining(['lift.access_token', 'lift.refresh_token', 'lift.user']),
    );
  });

  it('ne relit pas le stockage après une purge', async () => {
    const { tokens, stockage } = charger();

    await tokens.clearTokens();
    await tokens.getAccessToken();

    expect(stockage.getItemAsync).not.toHaveBeenCalled();
  });
});

describe('utilisateur mémorisé', () => {
  it('sérialise et relit un utilisateur', async () => {
    const { tokens, stockage } = charger();
    const utilisateur = { id: 'u1', pseudo: 'MaxLift', email: 'max@lift.com' };

    await tokens.setStoredUser(utilisateur);

    const dernierAppel = stockage.setItemAsync.mock.calls.at(-1);
    expect(dernierAppel?.[0]).toBe('lift.user');

    stockage.getItemAsync.mockResolvedValue(dernierAppel?.[1] as string);
    expect(await tokens.getStoredUser()).toEqual(utilisateur);
  });

  it('renvoie null quand rien n’est stocké', async () => {
    const { tokens } = charger();
    expect(await tokens.getStoredUser()).toBeNull();
  });

  /**
   * Un JSON corrompu est traité comme une absence, jamais comme une erreur : le pire cas
   * doit être une salutation sans pseudo, pas un plantage au démarrage.
   */
  it('renvoie null sur un contenu illisible, sans lever', async () => {
    const { tokens, stockage } = charger();
    stockage.getItemAsync.mockResolvedValue('{ceci nest pas du json');

    expect(await tokens.getStoredUser()).toBeNull();
  });

  it('renvoie null sur une chaîne vide', async () => {
    const { tokens, stockage } = charger();
    stockage.getItemAsync.mockResolvedValue('');

    expect(await tokens.getStoredUser()).toBeNull();
  });
});
