import { isAxiosError } from 'axios';

/**
 * Erreurs d'API — typées par CAUSE, pas par code HTTP.
 *
 * La spec d'interface distingue les causes, pas les codes. A1 §9 en particulier :
 *   BR-4 : un refresh échouant en AUTH déclenche logout + redirection
 *   BR-5 : un refresh échouant en RÉSEAU ne déclenche PAS de logout
 *
 * Un intercepteur qui ne verrait que « la requête a échoué » ne saurait pas laquelle
 * des deux règles appliquer. D'où ces classes : l'appelant discrimine sur le type,
 * jamais sur un `error.response?.status` disséminé dans les écrans.
 */

/** Racine commune — permet `catch (e) { if (e instanceof ApiError) ... }`. */
export abstract class ApiError extends Error {
  protected constructor(message: string) {
    super(message);
    // Sans cette ligne, `instanceof` échoue sur les classes qui étendent Error une
    // fois transpilées : le prototype est perdu. Piège classique de TypeScript.
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = new.target.name;
  }
}

/**
 * Le serveur est injoignable, ou n'a pas répondu à temps.
 *
 * Déclenche l'accès optimiste de A1 §9 BR-5 et la bannière « Réessayer » de A2 §8.
 * Ne JAMAIS déconnecter sur cette erreur.
 */
export class NetworkError extends ApiError {
  constructor(
    message = 'Serveur injoignable. Vérifie ta connexion.',
    /** Vrai si la requête a été coupée par le timeout plutôt que par l'absence de réseau. */
    readonly timedOut = false,
  ) {
    super(message);
  }
}

/**
 * Le serveur a rejeté l'authentification (401).
 *
 * Après échec du rafraîchissement, c'est le cas de A1 §9 BR-4 : purge des tokens et
 * retour au Login avec « Session expirée ».
 */
export class AuthError extends ApiError {
  constructor(message = 'Session expirée.') {
    super(message);
  }
}

/**
 * Le serveur a rejeté les données envoyées (400).
 *
 * `fields` reprend la forme de DRF : `{ email: ['Cette adresse existe déjà.'] }`.
 * C'est ce qui permet à A3 §8 d'afficher l'erreur SOUS le bon champ plutôt qu'en
 * bannière générique.
 */
export class ValidationError extends ApiError {
  constructor(
    readonly fields: Record<string, string[]>,
    message = 'Les informations saisies sont invalides.',
  ) {
    super(message);
  }

  /** Premier message d'erreur d'un champ, ou `undefined`. Pour la prop `error` d'Input. */
  fieldError(name: string): string | undefined {
    return this.fields[name]?.[0];
  }
}

/** La ressource n'existe pas, ou n'appartient pas à l'utilisateur (404 via IsOwner). */
export class NotFoundError extends ApiError {
  constructor(message = 'Ressource introuvable.') {
    super(message);
  }
}

/** Le serveur a échoué (5xx), ou a répondu quelque chose d'inattendu. */
export class ServerError extends ApiError {
  constructor(
    readonly status: number,
    message = 'Le serveur a rencontré un problème.',
  ) {
    super(message);
  }
}

/**
 * Normalise une erreur axios en erreur métier.
 *
 * Point unique de traduction HTTP → domaine. Aucun écran ne doit jamais inspecter un
 * statut : si un nouveau cas apparaît, il se traite ici.
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (!isAxiosError(error)) {
    return new ServerError(0, error instanceof Error ? error.message : 'Erreur inconnue.');
  }

  // Timeout : axios pose ECONNABORTED, ou ERR_CANCELED si l'AbortController a coupé.
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new NetworkError('Le serveur met trop de temps à répondre.', true);
  }

  // Pas de réponse du tout : DNS, réseau coupé, serveur éteint.
  if (!error.response) {
    return new NetworkError();
  }

  const { status, data } = error.response;

  if (status === 401) return new AuthError();
  if (status === 404) return new NotFoundError();

  if (status === 400 && data && typeof data === 'object') {
    return new ValidationError(normalizeFieldErrors(data as Record<string, unknown>));
  }

  // 403 inclus : IsOwner renvoie plutôt 404 par filtrage de queryset, mais un 403
  // reste possible sur les endpoints qui vérifient la permission d'objet.
  if (status === 403) return new AuthError("Tu n'as pas accès à cette ressource.");

  return new ServerError(status);
}

/**
 * Aplatit la réponse d'erreur de DRF en `{ champ: [messages] }`.
 *
 * DRF n'est pas homogène : selon le sérialiseur on reçoit `{ email: ['...'] }`,
 * `{ detail: '...' }`, ou `{ non_field_errors: ['...'] }`. Cette fonction ramène les
 * trois formes à une seule pour que les écrans n'aient qu'un cas à traiter.
 */
function normalizeFieldErrors(data: Record<string, unknown>): Record<string, string[]> {
  const out: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      out[key] = [value];
    } else if (Array.isArray(value)) {
      out[key] = value.map(String);
    } else if (value && typeof value === 'object') {
      // Erreurs imbriquées d'un sérialiseur nested — aplaties en une ligne lisible.
      out[key] = [JSON.stringify(value)];
    }
  }

  return out;
}
