import { api, type Exercise, type Paginated } from '../../shared/api';

/**
 * Bibliothèque d'exercices — C1 (liste, recherche, filtres), C2 (détail).
 *
 * Ressource en LECTURE SEULE : `ExerciseViewset` est un `ReadOnlyModelViewSet`. Aucune
 * création ni modification n'est exposée — les 873 exercices viennent du pipeline ETL.
 */

const BASE = '/api/lift/exercise/';

/**
 * Les 18 groupes musculaires, dans l'ordre de `MUSCLE_GROUP_CHOICES` (liftapp/models.py).
 *
 * Recopiés et non déduits d'un appel : aucun endpoint ne les expose, et l'ordre du modèle
 * groupe les régions du corps de façon lisible. Si la liste change côté Django, elle doit
 * changer ici — c'est le prix d'une énumération qui n'est pas servie par l'API.
 */
export const MUSCLE_GROUPS = [
  'CHEST',
  'BACK',
  'QUADS',
  'ISCHIOS',
  'GLUTES',
  'CALVES',
  'SHOULDERS',
  'BICEPS',
  'TRICEPS',
  'LOWER_BACK',
  'LATS',
  'UPPER_BACK',
  'REAR_SHOULDERS',
  'CORE',
  'FULL_BODY',
  'FOREARMS',
  'ADDUCTORS',
  'ABDUCTORS',
] as const;

export type ExerciseQuery = {
  /** Recherche plein texte, côté serveur. */
  search?: string;
  /** Codes de `MUSCLE_GROUP_CHOICES`. Plusieurs valeurs = OU entre elles. */
  muscleGroups?: readonly string[];
  /** Rang du premier élément voulu. 0 ou absent pour la première page. */
  offset?: number;
};

/**
 * Une page d'exercices, filtrée et paginée.
 *
 * Réponse paginée (`LimitOffsetPagination`, 25 par page). `offset` sert au défilement
 * infini de C1 §5, `count` dit quand s'arrêter.
 *
 * C1 §9 BR-1 : recherche ET filtres partent au SERVEUR. Ne jamais filtrer côté client
 * sur une liste déjà paginée — on ne verrait que les 25 premiers résultats.
 *
 * LA COMBINAISON EST UN ET, ENTRE DEUX OU. Le backend applique successivement
 * `SearchFilter` et `DjangoFilterBackend` : la recherche restreint, puis les groupes
 * musculaires restreignent ce résultat. Entre deux groupes en revanche, c'est un OU —
 * `ExerciseFilter.muscle_group` est un `MultipleChoiceFilter`, qui produit un `IN`.
 * C'est exactement ce que demande C1 §9 BR-3.
 *
 * Une valeur vide est OMISE plutôt qu'envoyée vide : `?search=` fait entrer DRF dans sa
 * branche de recherche pour rien, et `?muscle_group=` serait refusé comme choix invalide.
 */
export function listExercises(query: ExerciseQuery = {}): Promise<Paginated<Exercise>> {
  return api.get<Paginated<Exercise>>(BASE, {
    search: query.search?.trim() || undefined,
    muscle_group: query.muscleGroups?.length ? query.muscleGroups : undefined,
    offset: query.offset || undefined,
  });
}

/**
 * Un exercice par son identifiant — C2.
 *
 * Pas d'enveloppe de pagination sur un détail : le serveur renvoie l'objet seul.
 *
 * @throws {NotFoundError} aucun exercice ne porte cet identifiant
 */
export function getExercise(id: string): Promise<Exercise> {
  return api.get<Exercise>(`${BASE}${id}/`);
}
