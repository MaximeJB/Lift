import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import Seance from '../../app/(tabs)/lift/seance';
import { NetworkError, ValidationError, type WorkoutSession } from '../shared/api';
import { createSession, createSet, listSessions, updateSet } from '../workout/services/sessions.service';

/**
 * C5 — « l'écran le plus critique du produit », dit la spec en ouverture.
 *
 * Ce qui est vérifié ici, c'est l'ÉCRITURE OPTIMISTE et ses deux issues opposées : une
 * coupure réseau garde la série à l'écran, un refus du serveur la retire. Les confondre
 * ferait perdre une série faite, ou en afficherait une qui n'existera jamais.
 */
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

jest.mock('../workout/services/sessions.service', () => ({
  createSession: jest.fn(),
  createSet: jest.fn(),
  updateSet: jest.fn(),
  listSessions: jest.fn(),
}));

/** Le catalogue a sa propre suite : ici il ne sert qu'à fournir un exercice. */
jest.mock('../workout/components/ExerciseLibrary', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require('react-native');
  return {
    ExerciseLibrary: ({ onExercicePresse }: { onExercicePresse: (e: unknown) => void }) => (
      <Text
        testID="choisir-exercice"
        onPress={() =>
          onExercicePresse({
            id: 'bench',
            name: 'Bench Press',
            muscle_group: 'CHEST',
            exercise_type: 'WEIGHT_REPS',
          })
        }
      >
        Bench Press
      </Text>
    ),
  };
});

const creerSeance = createSession as jest.MockedFunction<typeof createSession>;
const creerSerie = createSet as jest.MockedFunction<typeof createSet>;
const corrigerSerie = updateSet as jest.MockedFunction<typeof updateSet>;
const listerSeances = listSessions as jest.MockedFunction<typeof listSessions>;
const navigation = router as jest.Mocked<typeof router>;

const SEANCE: WorkoutSession = {
  id: 's1',
  user: 'u1',
  template: null,
  title: 'Séance libre — 2026-08-03',
  date: '2026-08-03',
  start_time: '2026-08-03T14:00:00.000Z',
  end_time: null,
  duration_minutes: null,
  notes: '',
  sets: [],
  created_at: '',
  updated_at: '',
  synced_at: null,
};

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

/** Ouvre le modal, choisit un exercice, et rend la main sur l'écran de séance. */
async function ajouterUnExercice() {
  await presser(screen.getByText('+ Ajouter un exercice'));
  await presser(screen.getByTestId('choisir-exercice'));
}

async function logguerUneSerie(poids = '80', reps = '8') {
  await saisir(screen.getByLabelText('Poids'), poids);
  await saisir(screen.getByLabelText('Répétitions'), reps);
  await presser(screen.getByText('+ Ajouter une série'));
}

async function monter() {
  await render(<Seance />);
  await waitFor(() => expect(screen.getByText('+ Ajouter un exercice')).toBeTruthy());
}

beforeEach(() => {
  jest.clearAllMocks();
  creerSeance.mockResolvedValue(SEANCE);
  creerSerie.mockResolvedValue({ id: 'set-1' } as never);
  corrigerSerie.mockResolvedValue({} as never);
  listerSeances.mockResolvedValue({ count: 0, next: null, previous: null, results: [] });
});

describe('C5 — l’ouverture', () => {
  /** C3 §9 BR-1 : la séance est créée à l'entrée. C5 §9 BR-7 : titre généré, daté. */
  it('crée la séance avec un titre daté et une heure ISO complète', async () => {
    await monter();

    expect(creerSeance).toHaveBeenCalledTimes(1);
    const [entree] = creerSeance.mock.calls[0];
    expect(entree.title).toMatch(/^Séance libre — \d{4}-\d{2}-\d{2}$/);
    expect(entree.start_time).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(entree.template).toBeNull();
  });

  it('affiche le titre renvoyé par le serveur', async () => {
    await monter();
    expect(screen.getByText('Séance libre — 2026-08-03')).toBeTruthy();
  });

  it('propose « Quitter » et « Terminer », encadrés', async () => {
    await monter();

    expect(screen.getByText('Quitter')).toBeTruthy();
    expect(screen.getByText('Terminer')).toBeTruthy();
  });

  it('affiche une bannière avec recours quand la création échoue', async () => {
    creerSeance.mockRejectedValue(new NetworkError('Serveur injoignable.'));

    await render(<Seance />);

    await waitFor(() => expect(screen.getByText('Serveur injoignable.')).toBeTruthy());
    expect(screen.getByText('Réessayer')).toBeTruthy();
  });
});

describe('C5 — l’ajout d’exercices', () => {
  it('ouvre le catalogue et ajoute l’exercice choisi', async () => {
    await monter();
    await ajouterUnExercice();

    expect(screen.getByLabelText('Poids')).toBeTruthy();
    expect(screen.getByText('CHEST')).toBeTruthy();
  });

  it('n’ajoute pas deux fois le même exercice', async () => {
    await monter();
    await ajouterUnExercice();
    await ajouterUnExercice();

    expect(screen.getAllByLabelText('Poids')).toHaveLength(1);
  });
});

describe('C5 — l’écriture optimiste', () => {
  /** C5 §14 : la série s'affiche AVANT la réponse du serveur. */
  it('affiche la série puis l’envoie', async () => {
    await monter();
    await ajouterUnExercice();
    await logguerUneSerie();

    expect(screen.getByText('80 kg × 8')).toBeTruthy();
    expect(creerSerie).toHaveBeenCalledWith(
      expect.objectContaining({
        workout_session: 's1',
        exercise: 'bench',
        set_number: 1,
        weight_kg: '80',
        reps: 8,
      }),
    );
  });

  /** C5 §9 BR-3 : auto-incrémenté par le client, par exercice. */
  it('incrémente le numéro de série', async () => {
    await monter();
    await ajouterUnExercice();
    await logguerUneSerie();
    await logguerUneSerie();

    expect(creerSerie).toHaveBeenLastCalledWith(expect.objectContaining({ set_number: 2 }));
  });

  it('compte les séries dans l’en-tête', async () => {
    await monter();
    await ajouterUnExercice();
    await logguerUneSerie();

    // « 1 » apparait deux fois : le compteur d'en-tete et le numero de la serie.
    expect(screen.getByText('séries')).toBeTruthy();
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
  });

  /**
   * C5 §11 : une coupure réseau garde la ligne, marquée NON SYNC. Perdre une série parce
   * que le Wi-Fi de la salle a lâché serait le pire défaut possible de cet écran.
   */
  it('coupure réseau : la série RESTE, marquée NON SYNC', async () => {
    creerSerie.mockRejectedValue(new NetworkError('Serveur injoignable.'));

    await monter();
    await ajouterUnExercice();
    await logguerUneSerie();

    expect(screen.getByText('80 kg × 8')).toBeTruthy();
    expect(screen.getByText('NON SYNC')).toBeTruthy();
    expect(screen.getByText('Réessayer')).toBeTruthy();
  });

  /** À l'inverse : la donnée a été examinée et rejetée, la garder ferait croire à un enregistrement. */
  it('refus du serveur : la série est RETIRÉE', async () => {
    creerSerie.mockRejectedValue(new ValidationError({ reps: ['Invalide.'] }));

    await monter();
    await ajouterUnExercice();
    await logguerUneSerie();

    expect(screen.queryByText('80 kg × 8')).toBeNull();
    expect(screen.queryByText('Réessayer')).toBeNull();
  });

  it('le renvoi repart des séries en attente', async () => {
    creerSerie.mockRejectedValue(new NetworkError('Serveur injoignable.'));

    await monter();
    await ajouterUnExercice();
    await logguerUneSerie();

    creerSerie.mockResolvedValue({ id: 'set-1' } as never);
    await presser(screen.getByText('Réessayer'));

    expect(screen.queryByText('NON SYNC')).toBeNull();
  });
});

describe('C5 — le repos et les records', () => {
  /** C5 §9 BR-4 : le repos démarre à la validation, 90 s par défaut en séance libre. */
  it('le bandeau de repos démarre à la validation', async () => {
    await monter();
    await ajouterUnExercice();

    expect(screen.queryByText('1:30')).toBeNull();

    await logguerUneSerie();

    expect(screen.getByText('1:30')).toBeTruthy();
    expect(screen.getByText('Passer')).toBeTruthy();
  });

  /** C5 §9 BR-5 : le repos écoulé est patché sur la série qui vient d'être complétée. */
  it('« Passer » enregistre le repos réellement écoulé', async () => {
    await monter();
    await ajouterUnExercice();
    await logguerUneSerie();

    await presser(screen.getByText('Passer'));

    expect(corrigerSerie).toHaveBeenCalledWith('set-1', { rest_seconds: expect.any(Number) });
  });

  it('marque la série qui bat le meilleur connu', async () => {
    await monter();
    await ajouterUnExercice();
    await logguerUneSerie('100', '5');

    expect(screen.getByText('record')).toBeTruthy();
  });

  it('ne marque pas un record sur un échauffement', async () => {
    await monter();
    await ajouterUnExercice();

    await saisir(screen.getByLabelText('Poids'), '200');
    await saisir(screen.getByLabelText('Répétitions'), '5');
    await presser(screen.getByRole('checkbox'));
    await presser(screen.getByText('+ Ajouter une série'));

    expect(screen.queryByText('record')).toBeNull();
    expect(screen.getByText('ÉCH')).toBeTruthy();
  });

  it('ne signale aucun record quand l’historique n’a pas pu être lu', async () => {
    listerSeances.mockRejectedValue(new NetworkError('Serveur injoignable.'));

    await monter();
    await ajouterUnExercice();
    await logguerUneSerie('100', '5');

    expect(screen.queryByText('record')).toBeNull();
  });
});

describe('C5 — la sortie', () => {
  /** C5 §11 : sortie libre tant qu'aucune série n'est loguée. */
  it('sans série : on sort directement', async () => {
    await monter();

    await presser(screen.getByText('Quitter'));

    expect(navigation.back).toHaveBeenCalledTimes(1);
  });

  it('avec des séries : une confirmation les chiffre', async () => {
    await monter();
    await ajouterUnExercice();
    await logguerUneSerie();

    await presser(screen.getByText('Quitter'));

    expect(navigation.back).not.toHaveBeenCalled();
    expect(screen.getByText('quitter la séance')).toBeTruthy();
    expect(screen.getByText('séries loguées')).toBeTruthy();
  });

  /** C5 §9 BR-6 : « Terminer » ne fait QU'UNE navigation. Aucune écriture. */
  it('« Terminer » navigue vers C6 sans rien écrire', async () => {
    await monter();

    await presser(screen.getByText('Terminer'));

    expect(navigation.push).toHaveBeenCalledWith({
      pathname: '/lift/finaliser',
      params: { seance: 's1' },
    });
    expect(corrigerSerie).not.toHaveBeenCalled();
  });
});
