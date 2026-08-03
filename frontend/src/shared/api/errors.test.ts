import {
  ApiError,
  AuthError,
  NetworkError,
  NotFoundError,
  ServerError,
  ValidationError,
  toApiError,
} from './errors';

/**
 * Les erreurs sont typées par CAUSE, pas par code HTTP — A1 §9 distingue un échec réseau
 * d'un échec d'authentification, et les traite à l'opposé l'un de l'autre : le premier ne
 * doit surtout pas déconnecter.
 *
 * `toApiError` est le point UNIQUE de traduction. Si elle se trompe, toute l'app se
 * trompe, et dans le sens le plus coûteux : déconnecter quelqu'un dont le métro a coupé
 * le réseau.
 */
function erreurAxios(reponse?: { status: number; data?: unknown }, code?: string) {
  return {
    isAxiosError: true,
    code,
    response: reponse,
    message: 'échec axios',
    config: {},
    name: 'AxiosError',
  };
}

describe('hiérarchie des erreurs', () => {
  it('toutes descendent d’ApiError, ce qui permet un seul catch', () => {
    expect(new NetworkError()).toBeInstanceOf(ApiError);
    expect(new AuthError()).toBeInstanceOf(ApiError);
    expect(new ValidationError({})).toBeInstanceOf(ApiError);
    expect(new NotFoundError()).toBeInstanceOf(ApiError);
    expect(new ServerError(500)).toBeInstanceOf(ApiError);
  });

  /**
   * `Object.setPrototypeOf` dans le constructeur : sans lui, `instanceof` échoue une fois
   * transpilé. C'est le piège classique des classes qui étendent `Error` en TypeScript.
   */
  it('survit à la transpilation — instanceof distingue les types entre eux', () => {
    expect(new NetworkError()).toBeInstanceOf(NetworkError);
    expect(new NetworkError()).not.toBeInstanceOf(AuthError);
    expect(new AuthError()).not.toBeInstanceOf(NetworkError);
  });

  it('porte le nom de sa classe', () => {
    expect(new AuthError().name).toBe('AuthError');
    expect(new ValidationError({}).name).toBe('ValidationError');
  });
});

describe('toApiError — traduction', () => {
  it('laisse passer une ApiError déjà traduite, sans la réemballer', () => {
    const origine = new AuthError('Session expirée.');
    expect(toApiError(origine)).toBe(origine);
  });

  it('traduit une erreur quelconque en ServerError', () => {
    const traduite = toApiError(new Error('boum'));
    expect(traduite).toBeInstanceOf(ServerError);
    expect(traduite.message).toBe('boum');
  });

  it('traduit une valeur non-Error sans lever', () => {
    expect(toApiError('une chaîne')).toBeInstanceOf(ServerError);
  });

  it('traduit un timeout en NetworkError, marqué comme tel', () => {
    const traduite = toApiError(erreurAxios(undefined, 'ECONNABORTED')) as NetworkError;

    expect(traduite).toBeInstanceOf(NetworkError);
    expect(traduite.timedOut).toBe(true);
  });

  it('traduit ETIMEDOUT de la même façon', () => {
    expect(toApiError(erreurAxios(undefined, 'ETIMEDOUT'))).toBeInstanceOf(NetworkError);
  });

  /** Pas de réponse du tout : DNS, réseau coupé, serveur éteint. */
  it('traduit une absence de réponse en NetworkError non expirée', () => {
    const traduite = toApiError(erreurAxios(undefined)) as NetworkError;

    expect(traduite).toBeInstanceOf(NetworkError);
    expect(traduite.timedOut).toBe(false);
  });

  it('traduit un 401 en AuthError', () => {
    expect(toApiError(erreurAxios({ status: 401 }))).toBeInstanceOf(AuthError);
  });

  it('traduit un 404 en NotFoundError', () => {
    expect(toApiError(erreurAxios({ status: 404 }))).toBeInstanceOf(NotFoundError);
  });

  /** IsOwner filtre par queryset et rend plutôt 404, mais un 403 reste possible. */
  it('traduit un 403 en AuthError avec son propre message', () => {
    const traduite = toApiError(erreurAxios({ status: 403 }));

    expect(traduite).toBeInstanceOf(AuthError);
    expect(traduite.message).toContain('accès');
  });

  it('traduit un 500 en ServerError qui conserve le statut', () => {
    const traduite = toApiError(erreurAxios({ status: 503 })) as ServerError;

    expect(traduite).toBeInstanceOf(ServerError);
    expect(traduite.status).toBe(503);
  });

  it('traduit un 400 sans corps exploitable en ServerError', () => {
    expect(toApiError(erreurAxios({ status: 400, data: 'texte brut' }))).toBeInstanceOf(
      ServerError,
    );
  });
});

describe('toApiError — les trois formes d’erreur de DRF', () => {
  /**
   * DRF n'est pas homogène : selon le sérialiseur on reçoit `{champ: [messages]}`,
   * `{detail: 'message'}` ou `{non_field_errors: [...]}`. Les trois sont ramenées à une
   * seule forme pour que les écrans n'aient qu'un cas à traiter.
   */
  it('aplatit une liste de messages par champ', () => {
    const traduite = toApiError(
      erreurAxios({ status: 400, data: { pseudo: ['Déjà pris.'] } }),
    ) as ValidationError;

    expect(traduite.fields.pseudo).toEqual(['Déjà pris.']);
    expect(traduite.fieldError('pseudo')).toBe('Déjà pris.');
  });

  it('enveloppe un message seul dans une liste', () => {
    const traduite = toApiError(
      erreurAxios({ status: 400, data: { detail: 'Requête invalide.' } }),
    ) as ValidationError;

    expect(traduite.fields.detail).toEqual(['Requête invalide.']);
  });

  it('conserve non_field_errors sous sa propre clé', () => {
    const traduite = toApiError(
      erreurAxios({ status: 400, data: { non_field_errors: ['Incohérent.'] } }),
    ) as ValidationError;

    expect(traduite.fieldError('non_field_errors')).toBe('Incohérent.');
  });

  it('aplatit une erreur imbriquée en une ligne lisible', () => {
    const traduite = toApiError(
      erreurAxios({ status: 400, data: { sets: { 0: ['reps invalide'] } } }),
    ) as ValidationError;

    expect(traduite.fields.sets).toHaveLength(1);
    expect(traduite.fields.sets[0]).toContain('reps');
  });

  it('rend plusieurs champs en erreur simultanément — A3 §10', () => {
    const traduite = toApiError(
      erreurAxios({
        status: 400,
        data: { email: ['Déjà utilisé.'], pseudo: ['Déjà pris.'] },
      }),
    ) as ValidationError;

    expect(traduite.fieldError('email')).toBe('Déjà utilisé.');
    expect(traduite.fieldError('pseudo')).toBe('Déjà pris.');
  });

  it('renvoie undefined pour un champ sans erreur', () => {
    const traduite = new ValidationError({ email: ['Déjà utilisé.'] });
    expect(traduite.fieldError('pseudo')).toBeUndefined();
  });

  it('convertit en chaînes des messages qui n’en sont pas', () => {
    const traduite = toApiError(
      erreurAxios({ status: 400, data: { reps: [1, 2] } }),
    ) as ValidationError;

    expect(traduite.fields.reps).toEqual(['1', '2']);
  });
});
