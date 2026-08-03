import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { NetworkError, type Exercise, type WorkoutSession, type WorkoutTemplate } from '../../shared/api';
import { listExercises } from '../services/exercises.service';
import { listSessions } from '../services/sessions.service';
import { listTemplates } from '../services/templates.service';

import { ExerciseLibrary } from './ExerciseLibrary';
import { SessionHistory } from './SessionHistory';
import { SessionStarter } from './SessionStarter';

/**
 * Les trois composants qui parlent au réseau. Ce qu'ils portent de plus délicat n'est pas
 * l'affichage mais la CONCURRENCE : une réponse lente qui écrase une réponse récente, deux
 * pages qui se recouvrent, une erreur qui efface ce qu'on avait sous les yeux.
 */
jest.mock('../services/exercises.service', () => ({
  listExercises: jest.fn(),
  MUSCLE_GROUPS: ['CHEST', 'BACK', 'QUADS'],
}));

jest.mock('../services/templates.service', () => ({ listTemplates: jest.fn() }));
jest.mock('../services/sessions.service', () => ({ listSessions: jest.fn() }));

const listerExercices = listExercises as jest.MockedFunction<typeof listExercises>;
const listerTemplates = listTemplates as jest.MockedFunction<typeof listTemplates>;
const listerSeances = listSessions as jest.MockedFunction<typeof listSessions>;

function exercice(nom: string, id = nom): Exercise {
  return {
    id,
    name: nom,
    description: '',
    muscle_group: 'CHEST',
    equipment_needed: '',
    is_compound: false,
    image_url: null,
    video_url: null,
    secondary_muscle_groups: [],
    exercise_type: 'WEIGHT_REPS',
    created_at: '',
    updated_at: '',
    synced_at: null,
  };
}

function page<T>(resultats: T[], total = resultats.length) {
  return { count: total, next: null, previous: null, results: resultats };
}

async function presser(element: unknown) {
  await act(async () => {
    fireEvent.press(element as never);
  });
}

/** Le debounce de `SearchInput` part au montage : 350 ms avant le premier chargement. */
async function laisserPasserLeDebounce() {
  await act(async () => {
    jest.advanceTimersByTime(400);
  });
}

describe('ExerciseLibrary', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    listerExercices.mockResolvedValue(page([exercice('Bench Press')]));
  });

  afterEach(() => jest.useRealTimers());

  it('charge la première page au montage', async () => {
    await render(<ExerciseLibrary onExercicePresse={() => {}} />);
    await laisserPasserLeDebounce();

    expect(listerExercices).toHaveBeenCalledWith({ search: '', muscleGroups: [], offset: 0 });
    expect(screen.getByText('Bench Press')).toBeTruthy();
  });

  it('remonte l’exercice tapé, sans naviguer lui-même', async () => {
    const choisir = jest.fn();
    await render(<ExerciseLibrary onExercicePresse={choisir} />);
    await laisserPasserLeDebounce();

    await presser(screen.getByText('Bench Press'));

    expect(choisir).toHaveBeenCalledWith(expect.objectContaining({ name: 'Bench Press' }));
  });

  /** C1 §9 BR-3 : sélection multiple, OU entre les chips. */
  it('un filtre relance le chargement à l’offset 0', async () => {
    await render(<ExerciseLibrary onExercicePresse={() => {}} />);
    await laisserPasserLeDebounce();
    listerExercices.mockClear();

    await presser(screen.getByLabelText('CHEST'));

    expect(listerExercices).toHaveBeenCalledWith({
      search: '',
      muscleGroups: ['CHEST'],
      offset: 0,
    });
  });

  it('cumule les filtres, et les retire un par un', async () => {
    await render(<ExerciseLibrary onExercicePresse={() => {}} />);
    await laisserPasserLeDebounce();

    await presser(screen.getByLabelText('CHEST'));
    await presser(screen.getByLabelText('BACK'));

    expect(listerExercices).toHaveBeenLastCalledWith(
      expect.objectContaining({ muscleGroups: ['CHEST', 'BACK'] }),
    );

    await presser(screen.getByLabelText('CHEST'));

    expect(listerExercices).toHaveBeenLastCalledWith(
      expect.objectContaining({ muscleGroups: ['BACK'] }),
    );
  });

  /**
   * LE GARDE DE CONCURRENCE. Sans le compteur de demande, une recherche lente partie en
   * premier écraserait le résultat d'une recherche plus récente déjà revenue —
   * l'utilisateur verrait les résultats d'un mot qu'il a fini d'effacer.
   */
  it('jette une réponse lente arrivée après une plus récente', async () => {
    let resoudreLaLente: (v: unknown) => void = () => {};
    listerExercices.mockReturnValueOnce(
      new Promise((r) => {
        resoudreLaLente = r;
      }) as never,
    );

    await render(<ExerciseLibrary onExercicePresse={() => {}} />);
    await laisserPasserLeDebounce();

    // Une seconde demande part et revient tout de suite.
    listerExercices.mockResolvedValue(page([exercice('Squat')]));
    await presser(screen.getByLabelText('CHEST'));

    // La première arrive enfin, avec un contenu périmé.
    await act(async () => {
      resoudreLaLente(page([exercice('Périmé')]));
    });

    expect(screen.getByText('Squat')).toBeTruthy();
    expect(screen.queryByText('Périmé')).toBeNull();
  });

  /** C1 §8 : « Error (liste précédente conservée) ». */
  it('conserve la liste précédente quand le chargement échoue', async () => {
    await render(<ExerciseLibrary onExercicePresse={() => {}} />);
    await laisserPasserLeDebounce();

    listerExercices.mockRejectedValue(new NetworkError('Serveur injoignable.'));
    await presser(screen.getByLabelText('CHEST'));

    expect(screen.getByText('Bench Press')).toBeTruthy();
    expect(screen.getByText('Serveur injoignable.')).toBeTruthy();
  });

  it('propose de réessayer après une erreur', async () => {
    listerExercices.mockRejectedValue(new NetworkError('Serveur injoignable.'));
    await render(<ExerciseLibrary onExercicePresse={() => {}} />);
    await laisserPasserLeDebounce();

    expect(screen.getByText('Réessayer')).toBeTruthy();
  });

  it('affiche un état vide qui cite la recherche', async () => {
    listerExercices.mockResolvedValue(page([]));
    await render(<ExerciseLibrary onExercicePresse={() => {}} />);
    await laisserPasserLeDebounce();

    expect(screen.getByText('Aucun exercice ne correspond')).toBeTruthy();
  });
});

describe('SessionStarter', () => {
  const template = (nom: string, categorie: string): WorkoutTemplate =>
    ({
      id: nom,
      name: nom,
      description: '',
      category: categorie,
      estimated_duration: 60,
      exercises: [],
      created_at: '',
      updated_at: '',
      synced_at: null,
    }) as WorkoutTemplate;

  beforeEach(() => {
    jest.clearAllMocks();
    listerTemplates.mockResolvedValue(page([]));
  });

  /**
   * C3 §15 en fait un anti-pattern explicite et §16 un critère d'acceptation : « ne pas
   * bloquer l'accès à Séance libre si le chargement des templates échoue ».
   */
  it('la séance libre reste utilisable quand les templates échouent', async () => {
    listerTemplates.mockRejectedValue(new NetworkError('Serveur injoignable.'));
    const demarrer = jest.fn();

    await render(<SessionStarter onSeanceLibre={demarrer} onTemplate={() => {}} />);
    await waitFor(() => expect(screen.getByText('Serveur injoignable.')).toBeTruthy());

    await presser(screen.getByText('Séance libre'));

    expect(demarrer).toHaveBeenCalledTimes(1);
  });

  it('la séance libre est rendue avant même le chargement', async () => {
    listerTemplates.mockReturnValue(new Promise(() => {}) as never);

    await render(<SessionStarter onSeanceLibre={() => {}} onTemplate={() => {}} />);

    expect(screen.getByText('Séance libre')).toBeTruthy();
  });

  /** C3 §6 : tri par catégorie, puis alphabétique à l'intérieur. */
  it('trie par catégorie puis par nom', async () => {
    listerTemplates.mockResolvedValue(
      page([
        template('Zebre', 'STRENGTH'),
        template('Avant', 'STRENGTH'),
        template('Milieu', 'HYPERTROPHY'),
      ]),
    );

    const rendu = await render(<SessionStarter onSeanceLibre={() => {}} onTemplate={() => {}} />);
    await waitFor(() => expect(screen.getByText('Milieu')).toBeTruthy());

    const texte = JSON.stringify(rendu.toJSON());
    expect(texte.indexOf('Milieu')).toBeLessThan(texte.indexOf('Avant'));
    expect(texte.indexOf('Avant')).toBeLessThan(texte.indexOf('Zebre'));
  });

  it('remonte le template tapé', async () => {
    listerTemplates.mockResolvedValue(page([template('Push', 'STRENGTH')]));
    const ouvrir = jest.fn();

    await render(<SessionStarter onSeanceLibre={() => {}} onTemplate={ouvrir} />);
    await waitFor(() => expect(screen.getByText('Push')).toBeTruthy());

    await presser(screen.getByText('Push'));

    expect(ouvrir).toHaveBeenCalledWith(expect.objectContaining({ name: 'Push' }));
  });

  /** C3 §8 : état vide défensif, la séance libre restant au-dessus. */
  it('explique l’absence de programmes sans masquer la séance libre', async () => {
    await render(<SessionStarter onSeanceLibre={() => {}} onTemplate={() => {}} />);
    await waitFor(() => expect(screen.getByText('Aucun programme enregistré')).toBeTruthy());

    expect(screen.getByText('Séance libre')).toBeTruthy();
  });
});

describe('SessionHistory', () => {
  const seance = (date: string, titre: string, duree: number | null = 60): WorkoutSession =>
    ({
      id: `${date}-${titre}`,
      user: 'u1',
      template: null,
      title: titre,
      date,
      start_time: null,
      end_time: null,
      duration_minutes: duree,
      notes: '',
      sets: [],
      created_at: '',
      updated_at: '',
      synced_at: null,
    }) as WorkoutSession;

  beforeEach(() => {
    jest.clearAllMocks();
    listerSeances.mockResolvedValue(page([]));
  });

  it('groupe les séances par mois, en clair', async () => {
    listerSeances.mockResolvedValue(
      page([seance('2026-08-03', 'Août A'), seance('2026-07-28', 'Juillet A')]),
    );

    await render(<SessionHistory onSeancePressee={() => {}} onDemarrer={() => {}} />);
    await waitFor(() => expect(screen.getByText('août 2026')).toBeTruthy());

    expect(screen.getByText('juillet 2026')).toBeTruthy();
  });

  /**
   * C7 §15 : « ne pas dupliquer les en-têtes de mois à cheval sur une pagination ». Le
   * regroupement est refait sur la liste ENTIÈRE à chaque page reçue, jamais par morceaux.
   */
  it('ne duplique pas un en-tête quand un mois est coupé entre deux pages', async () => {
    listerSeances.mockResolvedValue(
      page([seance('2026-08-03', 'A'), seance('2026-08-02', 'B'), seance('2026-08-01', 'C')]),
    );

    await render(<SessionHistory onSeancePressee={() => {}} onDemarrer={() => {}} />);
    await waitFor(() => expect(screen.getByText('A')).toBeTruthy());

    expect(screen.getAllByText('août 2026')).toHaveLength(1);
  });

  /** C7 §9 BR-3 : la durée est celle figée à la finalisation, jamais recalculée. */
  it('dit « non finalisée » quand la séance n’a pas de durée', async () => {
    listerSeances.mockResolvedValue(page([seance('2026-08-03', 'Interrompue', null)]));

    await render(<SessionHistory onSeancePressee={() => {}} onDemarrer={() => {}} />);
    await waitFor(() => expect(screen.getByText('Interrompue')).toBeTruthy());

    expect(screen.getByText(/non finalisée/)).toBeTruthy();
  });

  it('affiche la durée quand elle existe', async () => {
    listerSeances.mockResolvedValue(page([seance('2026-08-03', 'Terminée', 72)]));

    await render(<SessionHistory onSeancePressee={() => {}} onDemarrer={() => {}} />);
    await waitFor(() => expect(screen.getByText('Terminée')).toBeTruthy());

    expect(screen.getByText(/72 min/)).toBeTruthy();
  });

  it('remonte la séance tapée', async () => {
    listerSeances.mockResolvedValue(page([seance('2026-08-03', 'Mienne')]));
    const ouvrir = jest.fn();

    await render(<SessionHistory onSeancePressee={ouvrir} onDemarrer={() => {}} />);
    await waitFor(() => expect(screen.getByText('Mienne')).toBeTruthy());

    await presser(screen.getByText('Mienne'));

    expect(ouvrir).toHaveBeenCalledWith(expect.objectContaining({ title: 'Mienne' }));
  });

  /** C7 §8 : le CTA de l'état vide change de SEGMENT, il ne navigue pas. */
  it('l’état vide propose de démarrer une séance', async () => {
    const demarrer = jest.fn();

    await render(<SessionHistory onSeancePressee={() => {}} onDemarrer={demarrer} />);
    await waitFor(() => expect(screen.getByText('Aucune séance enregistrée')).toBeTruthy());

    await presser(screen.getByText('Démarrer une séance'));

    expect(demarrer).toHaveBeenCalledTimes(1);
  });

  it('affiche une bannière quand le chargement échoue', async () => {
    listerSeances.mockRejectedValue(new NetworkError('Serveur injoignable.'));

    await render(<SessionHistory onSeancePressee={() => {}} onDemarrer={() => {}} />);

    await waitFor(() => expect(screen.getByText('Serveur injoignable.')).toBeTruthy());
  });
});
