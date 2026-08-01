import { api, type Exercise, type Paginated } from '../../shared/api';

/**
 * Bibliothèque d'exercices — C1 (liste et recherche), C2 (détail).
 *
 * Ressource en LECTURE SEULE : `ExerciseViewset` est un `ReadOnlyModelViewSet`. Aucune
 * création ni modification n'est exposée — les 873 exercices viennent du pipeline ETL.
 */

const BASE = '/api/lift/exercise/';

/**
 * Une page d'exercices.
 *
 * Réponse paginée (`LimitOffsetPagination`, 25 par page). `offset` sert au défilement
 * infini de C1 §5, `count` dit quand s'arrêter.
 *
 * @param offset Rang du premier élément voulu. 0 pour la première page.
 */
export function listExercises(offset = 0): Promise<Paginated<Exercise>> {
  return api.get<Paginated<Exercise>>(BASE, { offset });
}

/**
 * Recherche plein texte.
 *
 * Le backend cherche dans `name`, `description`, `muscle_group` et `equipment_needed`
 * — voir `search_fields` de `ExerciseViewset`.
 *
 * C1 §9 BR-1 : la recherche part au SERVEUR. Ne jamais filtrer côté client sur une
 * liste déjà paginée : on ne verrait que les 25 premiers résultats.
 *
 * AUCUN FILTRE PAR GROUPE MUSCULAIRE ICI, et c'est délibéré. `ExerciseViewset` déclare
 * `filter_backends = [filters.SearchFilter]`, ce qui REMPLACE le
 * `DEFAULT_FILTER_BACKENDS` de settings.py. Son `filterset_fields` est donc inerte : un
 * paramètre `muscle_group` serait ignoré sans la moindre erreur. Exposer une option qui
 * ne fait rien est pire que ne pas l'exposer.
 *
 * Pour l'activer : ajouter `DjangoFilterBackend` à `filter_backends` côté Django.
 * Correction déjà identifiée dans LIFT_Specification_Interface_V1.md, Phase 5.
 */
export function searchExercises(query: string, offset = 0): Promise<Paginated<Exercise>> {
  return api.get<Paginated<Exercise>>(BASE, { search: query, offset });
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
