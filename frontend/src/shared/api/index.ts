import { http } from './client';
import { toApiError } from './errors';

/**
 * Surface publique du service API.
 *
 * Les fonctions de service (`src/auth/services/`, `src/workout/services/`) passent
 * exclusivement par `api`. Personne n'importe axios ni `http` directement : c'est ce
 * qui garantit que TOUTE requête bénéficie de l'injection de jeton, du rafraîchissement
 * et de la traduction d'erreurs.
 *
 * Chaque méthode est générique sur la forme de la réponse :
 *
 *   const session = await api.get<WorkoutSession>('/api/lift/workout_session/42/');
 *
 * Ce paramètre n'est PAS vérifié à l'exécution — TypeScript fait confiance à ce qu'on
 * lui déclare. Les types de `types.ts` sont donc relevés dans le code Django, jamais
 * devinés : une déclaration fausse compile parfaitement et casse à l'affichage.
 */
export const api = {
  /**
   * Requête GET.
   *
   * @param path Chemin absolu commençant par `/`, base URL exclue.
   * @param params Paramètres de requête. `undefined` est omis par axios.
   * @throws {NetworkError | AuthError | NotFoundError | ServerError}
   */
  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const { data } = await http.get<T>(path, { params });
      return data;
    } catch (error) {
      throw toApiError(error);
    }
  },

  /**
   * Requête POST.
   *
   * @throws {ValidationError} le serveur a rejeté les données (400) — voir `fields`
   * @throws {NetworkError | AuthError | ServerError}
   */
  async post<T>(path: string, body?: unknown): Promise<T> {
    try {
      const { data } = await http.post<T>(path, body);
      return data;
    } catch (error) {
      throw toApiError(error);
    }
  },

  /** Requête PATCH — mise à jour partielle, la seule utilisée par la spec. */
  async patch<T>(path: string, body?: unknown): Promise<T> {
    try {
      const { data } = await http.patch<T>(path, body);
      return data;
    } catch (error) {
      throw toApiError(error);
    }
  },

  /**
   * Requête DELETE.
   *
   * Le backend répond 204 sans contenu ; la fonction ne renvoie donc rien.
   */
  async delete(path: string): Promise<void> {
    try {
      await http.delete(path);
    } catch (error) {
      throw toApiError(error);
    }
  },
};

export { refreshSession, setSessionExpiredHandler } from './client';
export { PAGE_SIZE } from './config';
export {
  ApiError,
  AuthError,
  NetworkError,
  NotFoundError,
  ServerError,
  ValidationError,
} from './errors';
export { isTokenValid } from './jwt';
export {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setStoredUser,
  setTokens,
} from './tokens';
export type { TokenPair } from './tokens';
export type * from './types';
