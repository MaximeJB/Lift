import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import DetailExercice from '../../app/(tabs)/lift/[id]';
import Finaliser from '../../app/(tabs)/lift/finaliser';
import DetailSeancePassee from '../../app/(tabs)/lift/historique/[id]';
import { NetworkError, type Exercise, type WorkoutSession, type WorkoutSet } from '../shared/api';
import { getExercise } from '../workout/services/exercises.service';
import {
  deleteSession,
  deleteSet,
  getSession,
  listSessions,
  updateSession,
} from '../workout/services/sessions.service';

/**
 * Les trois écrans de consultation et de clôture — C6, C8 et C2.
 *
 * Ils partagent une même exigence : les formules de `stats.ts` doivent y dire la MÊME
 * chose qu'en B1. Le tableau de traçabilité de la Phase 5 l'impose.
 */
// Prefixe `mock` : jest n autorise que ces variables dans une fabrique de mock.
let mockParametres: Record<string, string> = {};

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), dismissAll: jest.fn() },
  useLocalSearchParams: () => mockParametres,
  useFocusEffect: jest.fn(),
}));

jest.mock('expo-video', () => ({
  useVideoPlayer: jest.fn(() => ({ play: jest.fn(), pause: jest.fn(), loop: false, muted: false })),
  VideoView: 'VideoView',
}));

jest.mock('../workout/services/sessions.service', () => ({
  getSession: jest.fn(),
  listSessions: jest.fn(),
  updateSession: jest.fn(),
  deleteSession: jest.fn(),
  deleteSet: jest.fn(),
}));

jest.mock('../workout/services/exercises.service', () => ({ getExercise: jest.fn() }));

const lireSeance = getSession as jest.MockedFunction<typeof getSession>;
const listerSeances = listSessions as jest.MockedFunction<typeof listSessions>;
const majSeance = updateSession as jest.MockedFunction<typeof updateSession>;
const supprimerSeance = deleteSession as jest.MockedFunction<typeof deleteSession>;
const supprimerSerie = deleteSet as jest.MockedFunction<typeof deleteSet>;
const lireExercice = getExercise as jest.MockedFunction<typeof getExercise>;
const navigation = router as jest.Mocked<typeof router>;

function serie(partiel: Partial<WorkoutSet> = {}): WorkoutSet {
  return {
    id: Math.random().toString(36).slice(2),
    workout_session: 's1',
    exercise: 'bench',
    set_number: 1,
    weight_kg: '80',
    reps: 8,
    rpe: null,
    duration_seconds: null,
    rest_seconds: null,
    notes: '',
    is_warmup: false,
    is_failure: false,
    created_at: '',
    updated_at: '',
    synced_at: null,
    ...partiel,
  };
}

function seance(sets: WorkoutSet[], partiel: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id: 's1',
    user: 'u1',
    template: null,
    title: 'Séance libre — 2026-08-03',
    date: '2026-08-03',
    start_time: '2026-08-03T14:00:00.000Z',
    end_time: null,
    duration_minutes: null,
    notes: '',
    sets,
    created_at: '',
    updated_at: '',
    synced_at: null,
    ...partiel,
  };
}

const page = (seances: WorkoutSession[]) => ({
  count: seances.length,
  next: null,
  previous: null,
  results: seances,
});

async function presser(element: unknown) {
  await act(async () => {
    fireEvent.press(element as never);
  });
}

async function saisir(element: unknown, texte: string) {
  await act(async () => {
    fireEvent.changeText(element as never, texte);
  });
}

async function quitterLeChamp(element: unknown) {
  await act(async () => {
    fireEvent(element as never, 'blur');
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockParametres = { seance: 's1', id: 's1' };
  lireSeance.mockResolvedValue(seance([serie()]));
  listerSeances.mockResolvedValue(page([]));
  majSeance.mockImplementation(async (_id, changements) => seance([], changements as never));
  supprimerSeance.mockResolvedValue(undefined);
  supprimerSerie.mockResolvedValue(undefined);
  lireExercice.mockResolvedValue({ id: 'bench', name: 'Bench Press' } as never);
});

describe('C6 — la finalisation', () => {
  async function monter() {
    await render(<Finaliser />);
    await waitFor(() => expect(screen.getByLabelText('Titre de la séance')).toBeTruthy());
  }

  it('pré-remplit le titre généré à la création', async () => {
    await monter();
    expect(screen.getByLabelText('Titre de la séance').props.value).toBe(
      'Séance libre — 2026-08-03',
    );
  });

  /** C6 §9 BR-5 : un titre vidé revient SILENCIEUSEMENT au titre auto-généré. */
  it('un titre vidé revient au précédent, sans bloquer', async () => {
    await monter();

    await saisir(screen.getByLabelText('Titre de la séance'), '   ');
    await presser(screen.getByText('Enregistrer la séance'));

    expect(majSeance).toHaveBeenCalledWith(
      's1',
      expect.objectContaining({ title: 'Séance libre — 2026-08-03' }),
    );
  });

  /** C6 §9 BR-1 : les quatre champs partent ensemble. */
  it('envoie titre, notes, heure de fin et durée', async () => {
    await monter();

    await saisir(screen.getByLabelText('Note libre'), 'Bonne séance');
    await presser(screen.getByText('Enregistrer la séance'));

    const [, changements] = majSeance.mock.calls[0];
    expect(changements.notes).toBe('Bonne séance');
    expect(changements.end_time).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(changements.duration_minutes).toEqual(expect.any(Number));
  });

  /**
   * Sans `dismissAll`, la pile du tab Lift garde C5 et C6 : revenir sur l'onglet rouvrait
   * la finalisation d'une séance déjà enregistrée. Constaté le 03/08/2026.
   */
  it('vide la pile du tab avant de rejoindre l’accueil', async () => {
    await monter();

    await presser(screen.getByText('Enregistrer la séance'));

    expect(navigation.dismissAll).toHaveBeenCalledTimes(1);
    expect(navigation.replace).toHaveBeenCalledWith('/');
  });

  it('somme le volume hors échauffement', async () => {
    lireSeance.mockResolvedValue(
      seance([
        serie({ weight_kg: '80', reps: 8 }),
        serie({ weight_kg: '40', reps: 12, is_warmup: true }),
      ]),
    );

    await monter();

    expect(screen.getByText('640 kg')).toBeTruthy();
  });

  /** L'historique EXCLUT la séance en cours, sinon elle se compare à elle-même. */
  it('signale un record contre l’historique, pas contre elle-même', async () => {
    lireSeance.mockResolvedValue(seance([serie({ weight_kg: '100', reps: 5 })]));
    listerSeances.mockResolvedValue(
      page([seance([serie({ weight_kg: '80', reps: 5 })], { id: 'ancienne' })]),
    );

    await monter();

    await waitFor(() => expect(screen.getByText('Records battus')).toBeTruthy());
    expect(screen.getByText('Bench Press')).toBeTruthy();
  });

  it('n’affiche aucun encart quand rien n’est battu', async () => {
    lireSeance.mockResolvedValue(seance([serie({ weight_kg: '60', reps: 5 })]));
    listerSeances.mockResolvedValue(
      page([seance([serie({ weight_kg: '100', reps: 5 })], { id: 'ancienne' })]),
    );

    await monter();

    expect(screen.queryByText('Records battus')).toBeNull();
  });

  /** C6 §9 BR-4 : DELETE après confirmation explicite, avec cascade sur les séries. */
  it('la suppression passe par un dialogue qui chiffre ce qui disparaît', async () => {
    await monter();

    await presser(screen.getByText('Annuler la séance'));

    expect(supprimerSeance).not.toHaveBeenCalled();
    expect(screen.getByText('suppression / séance')).toBeTruthy();
    // « séries » apparait deux fois : dans le releve et dans le dialogue.
    expect(screen.getAllByText('séries').length).toBeGreaterThan(1);

    await presser(screen.getByText('Supprimer la séance'));

    expect(supprimerSeance).toHaveBeenCalledWith('s1');
    expect(navigation.dismissAll).toHaveBeenCalled();
  });

  it('affiche une bannière quand la séance ne charge pas', async () => {
    lireSeance.mockRejectedValue(new NetworkError('Serveur injoignable.'));

    await render(<Finaliser />);

    await waitFor(() => expect(screen.getByText('Serveur injoignable.')).toBeTruthy());
  });
});

describe('C8 — le détail d’une séance passée', () => {
  async function monter() {
    await render(<DetailSeancePassee />);
    await waitFor(() => expect(screen.getByLabelText('Titre de la séance')).toBeTruthy());
  }

  /**
   * C8 §9 BR-1 : toute édition est persistée IMMÉDIATEMENT, sans bouton global. C'est la
   * différence de fond avec C6, où la sauvegarde est le geste qui clôt un parcours.
   */
  it('enregistre le titre au moment où l’on quitte le champ', async () => {
    await monter();

    await saisir(screen.getByLabelText('Titre de la séance'), 'Push lourd');
    expect(majSeance).not.toHaveBeenCalled();

    await quitterLeChamp(screen.getByLabelText('Titre de la séance'));

    expect(majSeance).toHaveBeenCalledWith('s1', { title: 'Push lourd' });
  });

  it('un titre vidé revient au précédent', async () => {
    await monter();

    await saisir(screen.getByLabelText('Titre de la séance'), '');
    await quitterLeChamp(screen.getByLabelText('Titre de la séance'));

    expect(majSeance).toHaveBeenCalledWith('s1', { title: 'Séance libre — 2026-08-03' });
  });

  it('enregistre les notes au blur, elles aussi', async () => {
    await monter();

    await saisir(screen.getByLabelText('Note libre'), 'Dos fatigué');
    await quitterLeChamp(screen.getByLabelText('Note libre'));

    expect(majSeance).toHaveBeenCalledWith('s1', { notes: 'Dos fatigué' });
  });

  it('groupe les séries sous le nom de leur exercice', async () => {
    lireSeance.mockResolvedValue(
      seance([serie({ set_number: 1 }), serie({ set_number: 2, weight_kg: '85' })]),
    );

    await monter();

    // Le nom apparait en en-tete de section ET dans l'encart des records.
    await waitFor(() => expect(screen.getAllByText('Bench Press').length).toBeGreaterThan(0));
    expect(screen.getByText('80 kg × 8')).toBeTruthy();
    expect(screen.getByText('85 kg × 8')).toBeTruthy();
  });

  /** C8 §9 BR-3 : les stats se recalculent après toute modification de série. */
  it('supprimer une série recalcule le volume', async () => {
    lireSeance.mockResolvedValue(
      seance([
        serie({ id: 'set-1', weight_kg: '80', reps: 8 }),
        serie({ id: 'set-2', weight_kg: '60', reps: 10 }),
      ]),
    );

    await monter();
    await waitFor(() => expect(screen.getByText('1 240 kg')).toBeTruthy());

    await presser(screen.getAllByText('Supprimer')[0]);
    await presser(screen.getByText('Supprimer la série'));

    expect(supprimerSerie).toHaveBeenCalledWith('set-1');
    await waitFor(() => expect(screen.getByText('600 kg')).toBeTruthy());
  });

  it('le dialogue rappelle QUELLE série sera supprimée', async () => {
    await monter();

    await presser(screen.getByText('Supprimer'));

    expect(screen.getByText(/Série 1 — 80 kg × 8/)).toBeTruthy();
  });

  /** C8 §9 BR-2 : même mécanisme qu'en C6. */
  it('supprimer la séance renvoie à l’historique', async () => {
    await monter();

    await presser(screen.getByText('Supprimer la séance'));
    await presser(screen.getAllByText('Supprimer la séance')[1]);

    expect(supprimerSeance).toHaveBeenCalledWith('s1');
    expect(navigation.back).toHaveBeenCalled();
  });
});

describe('C2 — le détail d’un exercice', () => {
  const EXERCICE: Exercise = {
    id: 'bench',
    name: 'Bench Press',
    description: 'Allonge-toi sur le banc.',
    muscle_group: 'CHEST',
    equipment_needed: 'barbell',
    is_compound: true,
    image_url: null,
    video_url: null,
    secondary_muscle_groups: ['TRICEPS', 'SHOULDERS'],
    exercise_type: 'WEIGHT_REPS',
    created_at: '',
    updated_at: '',
    synced_at: null,
  };

  beforeEach(() => {
    mockParametres = { id: 'bench', nom: 'Bench Press' };
    lireExercice.mockResolvedValue(EXERCICE);
  });

  /** C2 §8 : « nom déjà disponible sans attendre le réseau ». */
  it('affiche le nom venu des paramètres avant la réponse du serveur', async () => {
    lireExercice.mockReturnValue(new Promise(() => {}) as never);

    await render(<DetailExercice />);

    expect(screen.getByText('Bench Press')).toBeTruthy();
  });

  it('affiche le groupe musculaire et le format en registre codé', async () => {
    await render(<DetailExercice />);

    await waitFor(() => expect(screen.getByText('CHEST')).toBeTruthy());
    expect(screen.getByText('WEIGHT REPS')).toBeTruthy();
  });

  it('affiche les badges « composé » et matériel', async () => {
    await render(<DetailExercice />);

    await waitFor(() => expect(screen.getByText('composé')).toBeTruthy());
    expect(screen.getByText('barbell')).toBeTruthy();
  });

  /** Le nom des muscles vient de `MuscleGroup.__str__`, ajouté côté Django le 03/08. */
  it('nomme les muscles secondaires', async () => {
    await render(<DetailExercice />);

    await waitFor(() => expect(screen.getByText('muscles secondaires')).toBeTruthy());
    expect(screen.getByText('TRICEPS')).toBeTruthy();
    expect(screen.getByText('SHOULDERS')).toBeTruthy();
  });

  /** C2 §10 : aucune section vide affichée. */
  it('masque la section quand il n’y a pas de muscle secondaire', async () => {
    lireExercice.mockResolvedValue({ ...EXERCICE, secondary_muscle_groups: [] });

    await render(<DetailExercice />);

    await waitFor(() => expect(screen.getByText('description')).toBeTruthy());
    expect(screen.queryByText('muscles secondaires')).toBeNull();
  });

  it('masque la description quand elle est vide', async () => {
    lireExercice.mockResolvedValue({ ...EXERCICE, description: '' });

    await render(<DetailExercice />);

    await waitFor(() => expect(screen.getByText('composé')).toBeTruthy());
    expect(screen.queryByText('description')).toBeNull();
  });

  it('affiche une bannière avec recours quand la fiche ne charge pas', async () => {
    lireExercice.mockRejectedValue(new NetworkError('Serveur injoignable.'));

    await render(<DetailExercice />);

    await waitFor(() => expect(screen.getByText('Serveur injoignable.')).toBeTruthy());
    expect(screen.getByText('Réessayer')).toBeTruthy();
  });
});
