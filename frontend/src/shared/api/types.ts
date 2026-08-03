/**
 * Formes de réponse du backend Django.
 *
 * Chaque type est relevé DANS LE CODE Django, pas supposé. La source est citée pour
 * que la vérification soit possible sans deviner.
 */

/** Enveloppe de pagination — `LimitOffsetPagination`, Lift/settings.py. */
export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

/**
 * Utilisateur tel que renvoyé par `LoginView`.
 *
 * Source : accounts/views.py, LoginView.post — le dictionnaire est construit à la main,
 * il ne suit aucun sérialiseur.
 */
export type AuthUser = {
  id: string;
  pseudo: string | null;
  email: string;
  email_verified: boolean;
};

/**
 * Réponse de `POST /api/auth/login/`.
 *
 * Source : accounts/views.py, LoginView.post.
 */
export type LoginResponse = {
  access: string;
  refresh: string;
  user: AuthUser;
};

/**
 * Utilisateur tel que renvoyé par `GET /api/auth/me/` — D1.
 *
 * FORME DIFFÉRENTE d'`AuthUser` : `LoginView` construit son dictionnaire à la main
 * alors que `/me/` passe par `PrivateUserSerializer`. Les deux ne se recouvrent pas.
 *
 * Source : accounts/serializers.py, PrivateUserSerializer.
 */
export type UserProfile = {
  id: string;
  email: string;
  /**
   * Identifiant public, l'équivalent du `@`. Unique et insensible à la casse — la
   * vérification est faite par `validate_pseudo` côté serveur, `unique=True` seul
   * laisserait cohabiter « MaxLift » et « maxlift ».
   *
   * `null` est une valeur légale : la colonne accepte NULL, et `createsuperuser` ne
   * demande pas de pseudo. C'est A3 qui l'exige à l'inscription, côté formulaire.
   */
  pseudo: string | null;
  /**
   * Date du dernier changement de pseudo, en lecture seule.
   *
   * `null` signifie « jamais changé depuis l'inscription » — dans ce cas le prochain
   * changement est offert. Sinon le suivant n'est possible que 30 jours après cette
   * date : fenêtre glissante, décision du 02/08/2026.
   */
  pseudo_updated_at: string | null;
  first_name: string;
  last_name: string;
  email_verified: boolean;
  profile_visibility: string;
  created_at: string;
};

/**
 * Réponse de `POST /api/auth/register/`.
 *
 * ATTENTION — forme DIFFÉRENTE de celle du login : `RegisterView.create` greffe les
 * jetons sous une clé `tokens`, alors que `LoginView` les place à la racine.
 * Source : accounts/views.py, RegisterView.create.
 *
 * Le service d'authentification normalise les deux ; aucun écran ne doit connaître
 * cette différence.
 */
export type RegisterResponse = {
  email: string;
  pseudo: string | null;
  tokens: { access: string; refresh: string };
};

/** Groupe musculaire — `MuscleGroup`, sérialisé en chaîne par `StringRelatedField`. */
export type MuscleGroupName = string;

/**
 * Exercice.
 *
 * Source : liftapp/serializers.py, ExerciseSerializer.fields.
 * Tous les champs y sont en lecture seule sauf `exercise_type`.
 */
export type Exercise = {
  id: string;
  name: string;
  description: string;
  muscle_group: string;
  equipment_needed: string;
  is_compound: boolean;
  image_url: string | null;
  video_url: string | null;
  secondary_muscle_groups: MuscleGroupName[];
  exercise_type: string;
  created_at: string;
  updated_at: string;
  synced_at: string | null;
};

/** Exercice d'un template, avec ses cibles. Source : ExerciseTemplateSerializer. */
export type TemplateExercise = {
  id: string;
  exercise: Exercise;
  order: number;
  target_sets: number;
  target_reps_min: number | null;
  target_reps_max: number | null;
  rest_seconds: number;
  notes: string;
  synced_at: string | null;
};

/** Template de séance. Source : WorkoutTemplateSerializer. */
export type WorkoutTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  estimated_duration: number;
  exercises: TemplateExercise[];
  created_at: string;
  updated_at: string;
  synced_at: string | null;
};

/**
 * Série.
 *
 * `exercise` est un UUID brut : le sérialiseur ne l'imbrique pas encore. C'est une
 * correction backend identifiée par la spec (Phase 5, « SetSerializer.exercise : nester
 * name/muscle_group »). Tant qu'elle n'est pas faite, afficher le nom d'un exercice
 * dans une série exige une requête séparée.
 */
export type WorkoutSet = {
  id: string;
  workout_session: string;
  exercise: string;
  set_number: number;
  weight_kg: string;
  reps: number;
  rpe: number | null;
  duration_seconds: number | null;
  rest_seconds: number | null;
  notes: string;
  is_warmup: boolean;
  is_failure: boolean;
  created_at: string;
  updated_at: string;
  synced_at: string | null;
};

/**
 * Séance.
 *
 * `weight_kg` des séries arrive en CHAÎNE : DRF sérialise `DecimalField` ainsi pour ne
 * pas perdre de précision en JSON. Toute arithmétique dessus doit convertir d'abord.
 * Source : liftapp/serializers.py, WorkoutSessionSerializer.
 */
export type WorkoutSession = {
  id: string;
  user: string;
  template: string | null;
  title: string;
  date: string;
  /**
   * Instants de début et de fin, en ISO 8601 COMPLET — `2026-08-03T14:32:05Z`.
   *
   * Ce sont des `DateTimeField` côté Django malgré leur nom : ils portent la date et le
   * fuseau, pas seulement l'heure. Envoyer `14:32:05` produit un 400.
   */
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  notes: string;
  sets: WorkoutSet[];
  created_at: string;
  updated_at: string;
  synced_at: string | null;
};
