import { api, type Paginated, type WorkoutTemplate } from '../../shared/api';

/**
 * Templates de séance — C3 (liste), C4 (détail).
 */

const BASE = '/api/lift/workout_template/';

/**
 * Templates visibles par l'utilisateur.
 *
 * C3 §9 BR-2 : le backend renvoie les templates PUBLICS (`user` nul) et ceux de
 * l'utilisateur. La création de template custom étant hors périmètre V1, la liste ne
 * contient en pratique que les templates publics seedés.
 *
 * `WorkoutTemplateViewset` sert cette liste sans authentification : un visiteur non
 * connecté voit les templates publics. Voir son `get_queryset`.
 *
 * C3 §13 : liste courte (~10 items), la pagination n'est pas un enjeu ici.
 */
export function listTemplates(): Promise<Paginated<WorkoutTemplate>> {
  return api.get<Paginated<WorkoutTemplate>>(BASE);
}

/**
 * Un template avec ses exercices — C4.
 *
 * Les exercices arrivent IMBRIQUÉS : `WorkoutTemplateSerializer` déclare
 * `exercises = ExerciseTemplateSerializer(many=True)`, et chaque entrée contient
 * l'exercice complet. Aucune requête supplémentaire n'est nécessaire pour afficher C4.
 *
 * C4 §9 BR-1 : les exercices sont déjà triés par `TemplateExercise.order` — le modèle
 * déclare `ordering = ['order']` dans son Meta. Ne pas les retrier côté client.
 *
 * @throws {NotFoundError} template inexistant, ou privé et appartenant à un autre
 */
export function getTemplate(id: string): Promise<WorkoutTemplate> {
  return api.get<WorkoutTemplate>(`${BASE}${id}/`);
}
