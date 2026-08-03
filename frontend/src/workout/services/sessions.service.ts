import { api, type Paginated, type WorkoutSession, type WorkoutSet } from '../../shared/api';

/**
 * Séances et séries — C5 (séance en cours), C6 (finalisation), C7 (historique),
 * C8 (détail d'une séance passée).
 *
 * TOUTES CES RESSOURCES SONT PRIVÉES. `WorkoutSessionViewSet.get_queryset` filtre sur
 * `user.workouts`, et `SetViewSet` sur `workout_session__user`. Une séance appartenant
 * à quelqu'un d'autre ne renvoie donc pas 403 mais 404 : elle n'existe simplement pas
 * dans la vue de l'utilisateur courant.
 */

const SESSIONS = '/api/lift/workout_session/';
const SETS = '/api/lift/set/';

/**
 * Historique des séances — C7.
 *
 * Déjà triées par date décroissante côté serveur (`ordering = ['-date', '-start_time']`
 * dans le Meta du modèle). C7 §9 BR-1 : le regroupement par mois se fait CÔTÉ CLIENT,
 * sur ces données déjà triées.
 *
 * Chaque séance arrive avec ses séries imbriquées — `WorkoutSessionSerializer` déclare
 * `sets = SetSerializer(many=True)`.
 */
export function listSessions(offset = 0): Promise<Paginated<WorkoutSession>> {
  return api.get<Paginated<WorkoutSession>>(SESSIONS, { offset });
}

/**
 * Une séance avec toutes ses séries — C8.
 *
 * @throws {NotFoundError} séance inexistante, ou appartenant à un autre utilisateur
 */
export function getSession(id: string): Promise<WorkoutSession> {
  return api.get<WorkoutSession>(`${SESSIONS}${id}/`);
}

/**
 * Champs acceptés à la création d'une séance.
 *
 * `user` est ABSENT à dessein : `WorkoutSessionViewSet.perform_create` le pose depuis
 * la requête authentifiée, et le sérialiseur le déclare `read_only`. L'envoyer serait
 * ignoré en silence.
 *
 * `date` est optionnel : le modèle a `default=date.today`.
 */
export type CreateSessionInput = {
  title: string;
  /** UUID d'un template, ou `null` pour une séance libre — C3 §9 BR-1. */
  template?: string | null;
  /** Format `AAAA-MM-JJ`. Omis, le serveur met la date du jour. */
  date?: string;
  /**
   * Instant de début, en ISO 8601 complet — `2026-08-03T14:32:05.000Z`.
   *
   * MALGRÉ SON NOM, c'est un `DateTimeField` côté Django, pas un `TimeField`. Une heure
   * seule (`14:32:05`) est refusée avec « Datetime has wrong format », et la création de
   * séance échoue avant que l'utilisateur ait saisi quoi que ce soit.
   */
  start_time?: string;
  notes?: string;
};

/**
 * Crée une séance — C4 (« Démarrer la séance ») et C3 (« Séance libre »).
 *
 * C4 §9 BR-3 : cette requête part au tap sur le bouton, JAMAIS à l'affichage de l'écran.
 * C3 §9 BR-1 : une séance libre se crée avec `template: null`.
 */
export function createSession(input: CreateSessionInput): Promise<WorkoutSession> {
  return api.post<WorkoutSession>(SESSIONS, input);
}

/**
 * Met à jour une séance — C6 (finalisation) et C8 (correction).
 *
 * C6 §9 BR-1 : « Enregistrer » envoie `title`, `notes`, `end_time` et
 * `duration_minutes`. Cette dernière est calculée par le client, pas par le serveur.
 */
export type UpdateSessionInput = Partial<
  Pick<WorkoutSession, 'title' | 'notes' | 'end_time' | 'duration_minutes' | 'date'>
>;

export function updateSession(
  id: string,
  changes: UpdateSessionInput,
): Promise<WorkoutSession> {
  return api.patch<WorkoutSession>(`${SESSIONS}${id}/`, changes);
}

/**
 * Supprime une séance et TOUTES ses séries.
 *
 * La cascade vient du modèle : `Set.workout_session` déclare `on_delete=CASCADE`.
 * Irréversible côté serveur.
 *
 * C6 §9 BR-4 et C8 §9 BR-2 : toujours derrière une confirmation explicite.
 */
export function deleteSession(id: string): Promise<void> {
  return api.delete(`${SESSIONS}${id}/`);
}

/**
 * Champs d'une série.
 *
 * `weight_kg` est une CHAÎNE : DRF sérialise les `DecimalField` ainsi pour ne pas
 * perdre de précision en JSON. Envoyer un nombre fonctionne, mais la réponse contiendra
 * une chaîne — toute arithmétique doit convertir d'abord.
 *
 * `set_number` : C5 §9 BR-3 — auto-incrémenté par le CLIENT, par exercice, jamais saisi.
 */
export type CreateSetInput = {
  workout_session: string;
  exercise: string;
  set_number: number;
  weight_kg: string | number;
  reps: number;
  rpe?: number | null;
  duration_seconds?: number | null;
  rest_seconds?: number | null;
  notes?: string;
  is_warmup?: boolean;
  is_failure?: boolean;
};

/**
 * Enregistre une série — C5.
 *
 * C5 §9 BR-2 : la validation (poids > 0, reps ≥ 1) se fait CÔTÉ CLIENT avant l'appel.
 * Le modèle Django n'a aucun validateur sur ces champs, une série absurde serait
 * acceptée telle quelle.
 *
 * C5 §14 : appelée 15 à 30 fois par séance. C'est la requête la plus fréquente de
 * l'app — d'où l'écriture optimiste prévue par la spec.
 */
export function createSet(input: CreateSetInput): Promise<WorkoutSet> {
  return api.post<WorkoutSet>(SETS, input);
}

/**
 * Corrige une série — C5 (édition inline) et C8.
 *
 * C5 §9 BR-5 : sert aussi à enregistrer le temps de repos réellement écoulé, patché sur
 * la série qui vient d'être complétée.
 */
export type UpdateSetInput = Partial<Omit<CreateSetInput, 'workout_session'>>;

export function updateSet(id: string, changes: UpdateSetInput): Promise<WorkoutSet> {
  return api.patch<WorkoutSet>(`${SETS}${id}/`, changes);
}

/** Supprime une série — C5, swipe sur une ligne. */
export function deleteSet(id: string): Promise<void> {
  return api.delete(`${SETS}${id}/`);
}
