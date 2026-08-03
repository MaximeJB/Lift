import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import Accueil from '../../app/(tabs)/index';
import { NetworkError, type WorkoutSession, type WorkoutSet } from '../shared/api';
import { useAuth } from '../shared/context/AuthContext';
import { getExercise } from '../workout/services/exercises.service';
import { listSessions } from '../workout/services/sessions.service';

/**
 * B1 — l'accueil. Ses deux endpoints de statistiques n'existent pas : tout est calculé
 * côté client, avec les formules de `stats.ts`. Ces tests vérifient que les chiffres
 * affichés sont bien ceux que la spec décrit, pas seulement que l'écran se rend.
 */
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

jest.mock('../workout/services/sessions.service', () => ({ listSessions: jest.fn() }));
jest.mock('../workout/services/exercises.service', () => ({ getExercise: jest.fn() }));
jest.mock('../shared/context/AuthContext', () => ({ useAuth: jest.fn() }));

const listerSeances = listSessions as jest.MockedFunction<typeof listSessions>;
const lireExercice = getExercise as jest.MockedFunction<typeof getExercise>;
const session = useAuth as jest.MockedFunction<typeof useAuth>;
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

function seance(date: string, sets: WorkoutSet[]): WorkoutSession {
  return {
    id: date,
    user: 'u1',
    template: null,
    title: `Séance ${date}`,
    date,
    start_time: null,
    end_time: null,
    duration_minutes: 60,
    notes: '',
    sets,
    created_at: '',
    updated_at: '',
    synced_at: null,
  };
}

/** `AAAA-MM-JJ` d'un jour de la semaine en cours, pour que le calcul hebdomadaire morde. */
function jourDeCetteSemaine(decalage = 0): string {
  const d = new Date();
  const recul = d.getDay() === 0 ? 6 : d.getDay() - 1;
  d.setDate(d.getDate() - recul + decalage);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function jourSemainePrecedente(): string {
  const d = new Date();
  const recul = d.getDay() === 0 ? 6 : d.getDay() - 1;
  d.setDate(d.getDate() - recul - 3);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const page = (seances: WorkoutSession[]) => ({
  count: seances.length,
  next: null,
  previous: null,
  results: seances,
});

beforeEach(() => {
  jest.clearAllMocks();
  listerSeances.mockResolvedValue(page([]));
  lireExercice.mockResolvedValue({ id: 'bench', name: 'Bench Press' } as never);

  session.mockReturnValue({
    session: {
      status: 'authenticated',
      user: { id: 'u1', pseudo: 'MaxLift', email: 'max@lift.com', email_verified: false },
    },
    login: jest.fn(),
    register: jest.fn(),
    majUtilisateur: jest.fn(),
    logout: jest.fn(),
  });
});

describe('B1 — l’action principale', () => {
  /**
   * B1 §9 BR-6 et §8 : le bouton est rendu AVANT tout état de chargement, et reste
   * utilisable quoi qu'il arrive aux statistiques. Si tout le reste échoue, on peut
   * toujours s'entraîner.
   */
  it('« Démarrer une séance » est là avant même le chargement', async () => {
    listerSeances.mockReturnValue(new Promise(() => {}) as never);

    await render(<Accueil />);

    expect(screen.getByText('Démarrer une séance')).toBeTruthy();
  });

  it('reste utilisable quand les statistiques échouent', async () => {
    listerSeances.mockRejectedValue(new NetworkError('Serveur injoignable.'));

    await render(<Accueil />);
    await waitFor(() => expect(screen.getByText('Serveur injoignable.')).toBeTruthy());

    expect(screen.getByText('Démarrer une séance')).toBeTruthy();
  });
});

describe('B1 — la salutation adaptative', () => {
  it('interpelle celui qui n’a jamais rien enregistré', async () => {
    await render(<Accueil />);
    await waitFor(() => expect(screen.getByText('Prêt pour ta première séance ?')).toBeTruthy());
  });

  it('devient neutre dès la première séance', async () => {
    listerSeances.mockResolvedValue(page([seance(jourDeCetteSemaine(), [serie()])]));

    await render(<Accueil />);
    await waitFor(() => expect(screen.getByText('Ta semaine')).toBeTruthy());
  });

  it('affiche le pseudo sous la salutation', async () => {
    await render(<Accueil />);
    await waitFor(() => expect(screen.getByText('MaxLift')).toBeTruthy());
  });
});

describe('B1 — le volume de la semaine', () => {
  /** B1 §9 BR-1 : Σ(poids × reps) sur la semaine calendaire courante. */
  it('somme les séries de la semaine en cours', async () => {
    listerSeances.mockResolvedValue(
      page([
        seance(jourDeCetteSemaine(), [
          serie({ weight_kg: '80', reps: 8 }),
          serie({ weight_kg: '60', reps: 10 }),
        ]),
      ]),
    );

    await render(<Accueil />);

    await waitFor(() => expect(screen.getByText('1 240 kg')).toBeTruthy());
  });

  /** B1 §9 BR-2 : les échauffements sont EXCLUS. */
  it('exclut les séries d’échauffement', async () => {
    listerSeances.mockResolvedValue(
      page([
        seance(jourDeCetteSemaine(), [
          serie({ weight_kg: '80', reps: 8 }),
          serie({ weight_kg: '40', reps: 12, is_warmup: true }),
        ]),
      ]),
    );

    await render(<Accueil />);

    await waitFor(() => expect(screen.getByText('640 kg')).toBeTruthy());
  });

  it('compte les séances de la semaine, pas les séries', async () => {
    listerSeances.mockResolvedValue(
      page([
        seance(jourDeCetteSemaine(), [serie(), serie(), serie()]),
        seance(jourDeCetteSemaine(1), [serie()]),
      ]),
    );

    await render(<Accueil />);

    await waitFor(() => expect(screen.getByText('Séances')).toBeTruthy());
    expect(screen.getByText('2')).toBeTruthy();
  });

  /**
   * B1 §9 BR-3 : la variation est ABSENTE quand la semaine précédente vaut 0 — pas à
   * zéro. On ne progresse pas depuis rien.
   */
  it('n’affiche aucune variation sans semaine précédente', async () => {
    listerSeances.mockResolvedValue(page([seance(jourDeCetteSemaine(), [serie()])]));

    await render(<Accueil />);
    await waitFor(() => expect(screen.getByText('Volume cette semaine')).toBeTruthy());

    expect(screen.queryByText(/vs semaine passée/)).toBeNull();
  });

  it('affiche la variation quand il y a de quoi comparer', async () => {
    listerSeances.mockResolvedValue(
      page([
        seance(jourDeCetteSemaine(), [serie({ weight_kg: '120', reps: 10 })]),
        seance(jourSemainePrecedente(), [serie({ weight_kg: '100', reps: 10 })]),
      ]),
    );

    await render(<Accueil />);

    await waitFor(() => expect(screen.getByText('+20 % vs semaine passée')).toBeTruthy());
  });
});

describe('B1 — les records récents', () => {
  it('affiche un état vide tant qu’aucun record n’est tombé', async () => {
    await render(<Accueil />);
    await waitFor(() => expect(screen.getByText(/Aucun record pour l.instant/)).toBeTruthy());
  });

  it('nomme l’exercice et son 1RM estimé', async () => {
    listerSeances.mockResolvedValue(
      page([seance(jourDeCetteSemaine(), [serie({ weight_kg: '100', reps: 5 })])]),
    );

    await render(<Accueil />);

    await waitFor(() => expect(screen.getByText('Bench Press')).toBeTruthy());
    expect(screen.getByText('117 kg')).toBeTruthy();
  });

  /** Un seul record par exercice : trois séries croissantes ne font pas trois cartes. */
  it('ne garde qu’une carte par exercice', async () => {
    listerSeances.mockResolvedValue(
      page([
        seance(jourDeCetteSemaine(), [
          serie({ weight_kg: '80', reps: 5 }),
          serie({ weight_kg: '90', reps: 5 }),
          serie({ weight_kg: '100', reps: 5 }),
        ]),
      ]),
    );

    await render(<Accueil />);

    await waitFor(() => expect(screen.getByText('Bench Press')).toBeTruthy());
    expect(screen.getAllByText('Bench Press')).toHaveLength(1);
  });

  it('se passe du nom quand l’exercice est introuvable', async () => {
    lireExercice.mockRejectedValue(new Error('404'));
    listerSeances.mockResolvedValue(
      page([seance(jourDeCetteSemaine(), [serie({ weight_kg: '100', reps: 5 })])]),
    );

    await render(<Accueil />);

    await waitFor(() => expect(screen.getByText('Exercice')).toBeTruthy());
  });
});

describe('B1 — les sorties', () => {
  it('le CTA mène au tab Lift', async () => {
    await render(<Accueil />);
    await waitFor(() => expect(screen.getByText('Démarrer une séance')).toBeTruthy());

    await act(async () => {
      fireEvent.press(screen.getByText('Démarrer une séance'));
    });

    expect(navigation.push).toHaveBeenCalledWith('/lift');
  });

  /** B1 §3 : le lien ouvre le tab Lift directement sur le bon segment. */
  it('le lien d’historique ouvre le segment Historique', async () => {
    await render(<Accueil />);
    await waitFor(() => expect(screen.getByText(/Voir tout l.historique/)).toBeTruthy());

    await act(async () => {
      fireEvent.press(screen.getByText(/Voir tout l.historique/));
    });

    expect(navigation.push).toHaveBeenCalledWith({
      pathname: '/lift',
      params: { segment: 'Historique' },
    });
  });
});
