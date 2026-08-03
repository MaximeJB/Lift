import { api } from '../../shared/api';

import { getExercise, listExercises, MUSCLE_GROUPS } from './exercises.service';
import {
  createSession,
  createSet,
  deleteSession,
  deleteSet,
  getSession,
  listSessions,
  updateSession,
  updateSet,
} from './sessions.service';
import { getTemplate, listTemplates } from './templates.service';

/**
 * Les trois services du domaine entraînement. Ce qui est vérifié ici, c'est ce qui PART
 * sur le réseau — chemins, paramètres, valeurs omises. Une erreur à ce niveau reste
 * invisible jusqu'à l'écran, et se lit alors comme un bug d'affichage.
 */
jest.mock('../../shared/api', () => ({
  api: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

const requete = api as jest.Mocked<typeof api>;

beforeEach(() => {
  jest.clearAllMocks();
  requete.get.mockResolvedValue({ count: 0, next: null, previous: null, results: [] });
  requete.post.mockResolvedValue({});
  requete.patch.mockResolvedValue({});
  requete.delete.mockResolvedValue(undefined);
});

describe('listExercises', () => {
  const parametres = () => requete.get.mock.calls[0][1] as Record<string, unknown>;

  it('n’envoie aucun paramètre quand rien n’est demandé', async () => {
    await listExercises();

    expect(requete.get).toHaveBeenCalledWith('/api/lift/exercise/', {
      search: undefined,
      muscle_group: undefined,
      offset: undefined,
    });
  });

  /**
   * `?search=` ferait entrer DRF dans sa branche de recherche pour rien, et
   * `?muscle_group=` serait refusé comme choix invalide. Une valeur vide est donc OMISE,
   * jamais envoyée vide.
   */
  it('omet une recherche vide ou faite d’espaces', async () => {
    await listExercises({ search: '   ' });
    expect(parametres().search).toBeUndefined();
  });

  it('omet une liste de groupes vide', async () => {
    await listExercises({ muscleGroups: [] });
    expect(parametres().muscle_group).toBeUndefined();
  });

  it('omet un offset à zéro', async () => {
    await listExercises({ offset: 0 });
    expect(parametres().offset).toBeUndefined();
  });

  it('nettoie les espaces autour de la recherche', async () => {
    await listExercises({ search: '  bench  ' });
    expect(parametres().search).toBe('bench');
  });

  /**
   * Le tableau est passé TEL QUEL : c'est le `paramsSerializer` du client qui le répète
   * sans crochets. L'aplatir ici en chaîne casserait le OU côté Django.
   */
  it('transmet les groupes musculaires sous forme de tableau', async () => {
    await listExercises({ muscleGroups: ['CHEST', 'BACK'] });
    expect(parametres().muscle_group).toEqual(['CHEST', 'BACK']);
  });

  it('transmet un offset non nul', async () => {
    await listExercises({ offset: 25 });
    expect(parametres().offset).toBe(25);
  });

  it('combine recherche, groupes et offset', async () => {
    await listExercises({ search: 'bench', muscleGroups: ['CHEST'], offset: 50 });

    expect(parametres()).toEqual({
      search: 'bench',
      muscle_group: ['CHEST'],
      offset: 50,
    });
  });
});

describe('MUSCLE_GROUPS', () => {
  it('compte les 18 groupes du modèle Django', () => {
    expect(MUSCLE_GROUPS).toHaveLength(18);
  });

  it('ne contient aucun doublon', () => {
    expect(new Set(MUSCLE_GROUPS).size).toBe(MUSCLE_GROUPS.length);
  });

  it('n’utilise que des codes en majuscules, comme en base', () => {
    for (const groupe of MUSCLE_GROUPS) {
      expect(groupe).toBe(groupe.toUpperCase());
    }
  });
});

describe('getExercise', () => {
  it('vise le détail, pas la liste', async () => {
    requete.get.mockResolvedValue({ id: 'e1' });
    await getExercise('e1');
    expect(requete.get).toHaveBeenCalledWith('/api/lift/exercise/e1/');
  });
});

describe('sessions', () => {
  it('liste avec un offset', async () => {
    await listSessions(25);
    expect(requete.get).toHaveBeenCalledWith('/api/lift/workout_session/', { offset: 25 });
  });

  it('liste depuis le début par défaut', async () => {
    await listSessions();
    expect(requete.get).toHaveBeenCalledWith('/api/lift/workout_session/', { offset: 0 });
  });

  it('lit une séance par son identifiant', async () => {
    requete.get.mockResolvedValue({ id: 's1' });
    await getSession('s1');
    expect(requete.get).toHaveBeenCalledWith('/api/lift/workout_session/s1/');
  });

  /** C3 §9 BR-1 : une séance libre se crée avec `template: null`. */
  it('crée une séance libre avec un template nul', async () => {
    await createSession({ title: 'Séance libre', template: null, date: '2026-08-03' });

    expect(requete.post).toHaveBeenCalledWith('/api/lift/workout_session/', {
      title: 'Séance libre',
      template: null,
      date: '2026-08-03',
    });
  });

  it('n’envoie jamais l’utilisateur — le serveur le pose', async () => {
    await createSession({ title: 'Séance', template: null });

    const [, corps] = requete.post.mock.calls[0];
    expect(corps).not.toHaveProperty('user');
  });

  it('met à jour une séance avec les seuls champs fournis', async () => {
    await updateSession('s1', { end_time: '2026-08-03T15:00:00Z', duration_minutes: 72 });

    expect(requete.patch).toHaveBeenCalledWith('/api/lift/workout_session/s1/', {
      end_time: '2026-08-03T15:00:00Z',
      duration_minutes: 72,
    });
  });

  it('supprime une séance', async () => {
    await deleteSession('s1');
    expect(requete.delete).toHaveBeenCalledWith('/api/lift/workout_session/s1/');
  });
});

describe('séries', () => {
  const SERIE = {
    workout_session: 's1',
    exercise: 'e1',
    set_number: 1,
    weight_kg: '80',
    reps: 8,
  };

  it('crée une série sur le bon chemin', async () => {
    await createSet(SERIE);
    expect(requete.post).toHaveBeenCalledWith('/api/lift/set/', SERIE);
  });

  /** `weight_kg` est une CHAÎNE côté DRF : le service ne convertit rien. */
  it('transmet le poids sans le convertir', async () => {
    await createSet({ ...SERIE, weight_kg: '82.5' });

    const [, corps] = requete.post.mock.calls[0];
    expect((corps as { weight_kg: unknown }).weight_kg).toBe('82.5');
  });

  it('accepte aussi un poids numérique', async () => {
    await createSet({ ...SERIE, weight_kg: 80 });

    const [, corps] = requete.post.mock.calls[0];
    expect((corps as { weight_kg: unknown }).weight_kg).toBe(80);
  });

  /** C5 §9 BR-5 : le repos écoulé est patché sur la série déjà enregistrée. */
  it('corrige une série avec un seul champ', async () => {
    await updateSet('set-1', { rest_seconds: 92 });
    expect(requete.patch).toHaveBeenCalledWith('/api/lift/set/set-1/', { rest_seconds: 92 });
  });

  it('supprime une série', async () => {
    await deleteSet('set-1');
    expect(requete.delete).toHaveBeenCalledWith('/api/lift/set/set-1/');
  });
});

describe('templates', () => {
  it('liste sans pagination — C3 §13, une dizaine d’éléments', async () => {
    await listTemplates();
    expect(requete.get).toHaveBeenCalledWith('/api/lift/workout_template/');
  });

  it('lit un template par son identifiant', async () => {
    requete.get.mockResolvedValue({ id: 't1' });
    await getTemplate('t1');
    expect(requete.get).toHaveBeenCalledWith('/api/lift/workout_template/t1/');
  });
});
