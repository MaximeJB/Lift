/**
 * Le client HTTP — trois responsabilités, trois familles de bugs silencieux.
 *
 * Les intercepteurs sont CAPTURÉS puis appelés directement : c'est la seule façon
 * d'exercer la vraie logique — mutex compris — sans réseau ni serveur. Le module est
 * rechargé à chaque test, parce que la promesse de rafraîchissement partagée est un état
 * de module qui fuiterait d'un cas à l'autre.
 */

type Gestionnaire = (erreur: unknown) => unknown;
type Injecteur = (config: { headers: Record<string, string>; url?: string }) => unknown;

type FausseInstance = {
  post: jest.Mock;
  request: jest.Mock;
  interceptors: {
    request: { use: jest.Mock };
    response: { use: jest.Mock };
  };
  injecteur?: Injecteur;
  surErreur?: Gestionnaire;
};

const instances: FausseInstance[] = [];

jest.mock('axios', () => {
  const creer = () => {
    const instance: FausseInstance = {
      post: jest.fn(),
      request: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn((fn: Injecteur) => {
            instance.injecteur = fn;
          }),
        },
        response: {
          use: jest.fn((_ok: unknown, err: Gestionnaire) => {
            instance.surErreur = err;
          }),
        },
      },
    };

    instances.push(instance);
    return instance;
  };

  return {
    __esModule: true,
    create: jest.fn(creer),
    isAxiosError: (e: unknown) => Boolean((e as { isAxiosError?: boolean })?.isAxiosError),
  };
});

jest.mock('./tokens', () => ({
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  setTokens: jest.fn(),
  clearTokens: jest.fn(),
}));

/** Erreur au format axios, seule forme que les intercepteurs savent lire. */
function erreurAxios(statut: number, url = '/api/lift/exercise/', dejaRejouee = false) {
  return {
    isAxiosError: true,
    response: { status: statut, data: {} },
    config: { url, headers: {} as Record<string, string>, _retried: dejaRejouee },
    message: 'échec',
  };
}

function charger() {
  instances.length = 0;
  jest.resetModules();
  jest.clearAllMocks();

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const jetons = require('./tokens') as jest.Mocked<typeof import('./tokens')>;
  jetons.getAccessToken.mockResolvedValue(null);
  jetons.getRefreshToken.mockResolvedValue('refresh-valide');
  jetons.setTokens.mockResolvedValue(undefined);
  jetons.clearTokens.mockResolvedValue(undefined);

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const client = require('./client') as typeof import('./client');

  // L'ordre de création est celui du fichier : l'instance de rafraîchissement d'abord,
  // l'instance principale ensuite.
  const [rafraichisseur, principal] = instances;

  return { client, jetons, rafraichisseur, principal };
}

describe('injection du jeton', () => {
  it('pose l’en-tête d’autorisation quand un jeton existe', async () => {
    const { jetons, principal } = charger();
    jetons.getAccessToken.mockResolvedValue('jeton-1');

    const config = { headers: {} as Record<string, string> };
    await principal.injecteur?.(config);

    expect(config.headers.Authorization).toBe('Bearer jeton-1');
  });

  /** Les endpoints publics fonctionnent sans jeton : ne rien poser est un cas normal. */
  it('ne pose rien quand il n’y a pas de jeton', async () => {
    const { principal } = charger();

    const config = { headers: {} as Record<string, string> };
    await principal.injecteur?.(config);

    expect(config.headers.Authorization).toBeUndefined();
  });
});

describe('traduction des échecs', () => {
  it('traduit une erreur sans config, sans tenter de rejouer', async () => {
    const { principal } = charger();

    await expect(principal.surErreur?.(new Error('boum'))).rejects.toThrow();
  });

  it('traduit un 404 sans rafraîchir', async () => {
    const { principal, rafraichisseur } = charger();

    await expect(principal.surErreur?.(erreurAxios(404))).rejects.toMatchObject({
      name: 'NotFoundError',
    });
    expect(rafraichisseur.post).not.toHaveBeenCalled();
  });

  it('traduit un 500 sans rafraîchir', async () => {
    const { principal, rafraichisseur } = charger();

    await expect(principal.surErreur?.(erreurAxios(503))).rejects.toMatchObject({
      name: 'ServerError',
    });
    expect(rafraichisseur.post).not.toHaveBeenCalled();
  });
});

describe('rafraîchissement sur 401', () => {
  it('rafraîchit puis rejoue la requête avec le nouveau jeton', async () => {
    const { principal, rafraichisseur } = charger();
    rafraichisseur.post.mockResolvedValue({ data: { access: 'a2', refresh: 'r2' } });
    principal.request.mockResolvedValue({ data: 'ok' });

    const erreur = erreurAxios(401);
    await principal.surErreur?.(erreur);

    expect(rafraichisseur.post).toHaveBeenCalledTimes(1);
    expect(principal.request).toHaveBeenCalledTimes(1);
    expect(erreur.config.headers.Authorization).toBe('Bearer a2');
  });

  /** A1 §9 BR-3 : la rotation renvoie un nouveau refresh, l'ignorer périmerait la session. */
  it('conserve le nouveau jeton de rafraîchissement', async () => {
    const { principal, rafraichisseur, jetons } = charger();
    rafraichisseur.post.mockResolvedValue({ data: { access: 'a2', refresh: 'r2' } });
    principal.request.mockResolvedValue({ data: 'ok' });

    await principal.surErreur?.(erreurAxios(401));

    expect(jetons.setTokens).toHaveBeenCalledWith({ access: 'a2', refresh: 'r2' });
  });

  it('réutilise l’ancien refresh si le serveur n’en renvoie pas', async () => {
    const { principal, rafraichisseur, jetons } = charger();
    rafraichisseur.post.mockResolvedValue({ data: { access: 'a2' } });
    principal.request.mockResolvedValue({ data: 'ok' });

    await principal.surErreur?.(erreurAxios(401));

    expect(jetons.setTokens).toHaveBeenCalledWith({
      access: 'a2',
      refresh: 'refresh-valide',
    });
  });

  /** Trois garde-fous contre la boucle : `_retried`, le chemin exclu, l'instance séparée. */
  it('ne rejoue jamais deux fois la même requête', async () => {
    const { principal, rafraichisseur } = charger();

    await expect(
      principal.surErreur?.(erreurAxios(401, '/api/lift/exercise/', true)),
    ).rejects.toMatchObject({ name: 'AuthError' });

    expect(rafraichisseur.post).not.toHaveBeenCalled();
  });

  it('n’intercepte pas un 401 venant du chemin de rafraîchissement', async () => {
    const { principal, rafraichisseur } = charger();

    await expect(
      principal.surErreur?.(erreurAxios(401, '/api/auth/token/refresh/')),
    ).rejects.toMatchObject({ name: 'AuthError' });

    expect(rafraichisseur.post).not.toHaveBeenCalled();
  });

  /**
   * A1 §10 — LE MUTEX. Sans lui, dix requêtes expirant ensemble lanceraient dix
   * rafraîchissements ; comme le backend fait tourner les jetons, chacun invaliderait le
   * précédent et neuf sur dix échoueraient, déconnectant sans raison.
   */
  it('ne lance qu’UN rafraîchissement pour dix requêtes expirées ensemble', async () => {
    const { principal, rafraichisseur } = charger();

    let resoudre: (v: unknown) => void = () => {};
    rafraichisseur.post.mockReturnValue(
      new Promise((r) => {
        resoudre = r;
      }),
    );
    principal.request.mockResolvedValue({ data: 'ok' });

    const requetes = Array.from({ length: 10 }, () => principal.surErreur?.(erreurAxios(401)));
    resoudre({ data: { access: 'a2', refresh: 'r2' } });
    await Promise.all(requetes);

    expect(rafraichisseur.post).toHaveBeenCalledTimes(1);
    expect(principal.request).toHaveBeenCalledTimes(10);
  });

  it('relance un rafraîchissement après coup, le verrou étant relâché', async () => {
    const { principal, rafraichisseur } = charger();
    rafraichisseur.post.mockResolvedValue({ data: { access: 'a2', refresh: 'r2' } });
    principal.request.mockResolvedValue({ data: 'ok' });

    await principal.surErreur?.(erreurAxios(401));
    await principal.surErreur?.(erreurAxios(401));

    expect(rafraichisseur.post).toHaveBeenCalledTimes(2);
  });
});

describe('échec du rafraîchissement — les deux issues de A1 §9', () => {
  /** BR-5 : le serveur est injoignable, la session n'est pas invalide. NE PAS purger. */
  it('sur échec RÉSEAU : NetworkError, et les jetons sont conservés', async () => {
    const { principal, rafraichisseur, jetons } = charger();
    rafraichisseur.post.mockRejectedValue({ isAxiosError: true, response: undefined });

    await expect(principal.surErreur?.(erreurAxios(401))).rejects.toMatchObject({
      name: 'NetworkError',
    });

    expect(jetons.clearTokens).not.toHaveBeenCalled();
  });

  /** BR-4 : le refresh est refusé, la session est morte. Purger et prévenir. */
  it('sur échec d’AUTHENTIFICATION : purge et gestionnaire appelé', async () => {
    const { client, principal, rafraichisseur, jetons } = charger();
    const prevenu = jest.fn();
    client.setSessionExpiredHandler(prevenu);

    rafraichisseur.post.mockRejectedValue({
      isAxiosError: true,
      response: { status: 401, data: {} },
    });

    await expect(principal.surErreur?.(erreurAxios(401))).rejects.toMatchObject({
      name: 'AuthError',
    });

    expect(jetons.clearTokens).toHaveBeenCalledTimes(1);
    expect(prevenu).toHaveBeenCalledTimes(1);
  });

  it('fonctionne sans gestionnaire enregistré', async () => {
    const { principal, rafraichisseur, jetons } = charger();
    rafraichisseur.post.mockRejectedValue({
      isAxiosError: true,
      response: { status: 401, data: {} },
    });

    await expect(principal.surErreur?.(erreurAxios(401))).rejects.toMatchObject({
      name: 'AuthError',
    });
    expect(jetons.clearTokens).toHaveBeenCalled();
  });

  /** A1 §10 : « refresh token corrompu ou illisible → traité comme absent ». */
  it('sans jeton de rafraîchissement : AuthError, sans appel réseau', async () => {
    const { principal, rafraichisseur, jetons } = charger();
    jetons.getRefreshToken.mockResolvedValue(null);

    await expect(principal.surErreur?.(erreurAxios(401))).rejects.toMatchObject({
      name: 'AuthError',
    });
    expect(rafraichisseur.post).not.toHaveBeenCalled();
  });
});

describe('refreshSession', () => {
  /**
   * A1 §9 BR-2 : au démarrage, on renouvelle AVANT d'envoyer quoi que ce soit. A1 §15
   * interdit d'appeler `/me/` pour provoquer un 401 — ce serait un aller-retour perdu.
   */
  it('rafraîchit hors de tout 401 et rend le nouveau jeton', async () => {
    const { client, rafraichisseur } = charger();
    rafraichisseur.post.mockResolvedValue({ data: { access: 'a2', refresh: 'r2' } });

    await expect(client.refreshSession()).resolves.toBe('a2');
  });

  it('partage le même verrou que le rafraîchissement automatique', async () => {
    const { client, rafraichisseur } = charger();

    let resoudre: (v: unknown) => void = () => {};
    rafraichisseur.post.mockReturnValue(
      new Promise((r) => {
        resoudre = r;
      }),
    );

    const deux = Promise.all([client.refreshSession(), client.refreshSession()]);
    resoudre({ data: { access: 'a2', refresh: 'r2' } });
    await deux;

    expect(rafraichisseur.post).toHaveBeenCalledTimes(1);
  });

  it('laisse repartir un rafraîchissement après un échec', async () => {
    const { client, rafraichisseur } = charger();
    rafraichisseur.post.mockRejectedValue({ isAxiosError: true, response: undefined });

    await expect(client.refreshSession()).rejects.toBeDefined();

    rafraichisseur.post.mockResolvedValue({ data: { access: 'a2', refresh: 'r2' } });
    await expect(client.refreshSession()).resolves.toBe('a2');
  });
});

describe('setSessionExpiredHandler', () => {
  it('accepte null pour se désabonner', async () => {
    const { client, principal, rafraichisseur } = charger();
    const prevenu = jest.fn();

    client.setSessionExpiredHandler(prevenu);
    client.setSessionExpiredHandler(null);

    rafraichisseur.post.mockRejectedValue({
      isAxiosError: true,
      response: { status: 401, data: {} },
    });
    await expect(principal.surErreur?.(erreurAxios(401))).rejects.toBeDefined();

    expect(prevenu).not.toHaveBeenCalled();
  });
});
