import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import Profil from '../../app/(tabs)/profile';
import { getMe, updateMe } from '../auth/services/auth.service';
import { NetworkError, ValidationError, type UserProfile } from '../shared/api';
import { useAuth } from '../shared/context/AuthContext';

/**
 * D1 — Profil. Trois comportements y sont subtils : le verrou de trente jours sur le
 * pseudo, le bouton d'enregistrement qui SERT de confirmation, et la déconnexion qui ne
 * navigue pas.
 */
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), dismissAll: jest.fn() },
}));

jest.mock('../auth/services/auth.service', () => ({
  getMe: jest.fn(),
  updateMe: jest.fn(),
}));

jest.mock('../shared/context/AuthContext', () => ({ useAuth: jest.fn() }));

const lireProfil = getMe as jest.MockedFunction<typeof getMe>;
const majProfil = updateMe as jest.MockedFunction<typeof updateMe>;
const session = useAuth as jest.MockedFunction<typeof useAuth>;

const deconnexion = jest.fn();
const majUtilisateur = jest.fn();

function profil(partiel: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 'u1',
    email: 'max@lift.com',
    pseudo: 'MaxLift',
    pseudo_updated_at: null,
    first_name: '',
    last_name: '',
    email_verified: false,
    profile_visibility: 'PUBLIC',
    created_at: '2026-07-01T10:00:00Z',
    ...partiel,
  };
}

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

async function monter() {
  await render(<Profil />);
  await waitFor(() => expect(screen.getByLabelText('Prénom')).toBeTruthy());
}

beforeEach(() => {
  jest.clearAllMocks();
  deconnexion.mockResolvedValue(undefined);
  majUtilisateur.mockResolvedValue(undefined);
  lireProfil.mockResolvedValue(profil());
  majProfil.mockImplementation(async (changements) => profil(changements as never));

  session.mockReturnValue({
    session: {
      status: 'authenticated',
      user: { id: 'u1', pseudo: 'MaxLift', email: 'max@lift.com', email_verified: false },
    },
    login: jest.fn(),
    register: jest.fn(),
    majUtilisateur,
    logout: deconnexion,
  });
});

describe('D1 — identité', () => {
  it('affiche le pseudo en titre et l’email dessous', async () => {
    await monter();

    expect(screen.getByText('MaxLift')).toBeTruthy();
    expect(screen.getByText('max@lift.com')).toBeTruthy();
  });

  it('affiche la date d’inscription en registre codé', async () => {
    await monter();
    expect(screen.getByText('01/07/2026')).toBeTruthy();
  });

  it('retombe sur l’email quand aucun pseudo n’est posé', async () => {
    lireProfil.mockResolvedValue(profil({ pseudo: null }));
    session.mockReturnValue({
      session: {
        status: 'authenticated',
        user: { id: 'u1', pseudo: null, email: 'max@lift.com', email_verified: false },
      },
      login: jest.fn(),
      register: jest.fn(),
      majUtilisateur,
      logout: deconnexion,
    });

    await monter();

    expect(screen.getAllByText('max@lift.com').length).toBeGreaterThan(0);
  });
});

describe('D1 — le verrou du pseudo', () => {
  /** Jamais changé depuis l'inscription : le premier changement est offert. */
  it('ouvert quand le pseudo n’a jamais été changé', async () => {
    await monter();

    const champ = screen.getByLabelText('Pseudo');
    expect(champ.props.editable).toBe(true);
  });

  /**
   * LE LIBELLÉ PORTE LE VERROU. Le système n'a aucun jeton d'état désactivé — décision Q8
   * de MAPPING.md — donc un champ non modifiable ne se distingue par aucune couleur.
   */
  it('verrouillé et daté quand la fenêtre de 30 jours n’est pas ouverte', async () => {
    const hier = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    lireProfil.mockResolvedValue(profil({ pseudo_updated_at: hier }));

    await monter();

    const attendue = new Date(Date.now() + 29 * 24 * 3600 * 1000);
    const jour = String(attendue.getDate()).padStart(2, '0');
    const mois = String(attendue.getMonth() + 1).padStart(2, '0');

    const champ = screen.getByLabelText(
      `Pseudo — modifiable le ${jour}/${mois}/${attendue.getFullYear()}`,
    );
    expect(champ.props.editable).toBe(false);
  });

  it('rouvert une fois les trente jours passés', async () => {
    const ancien = new Date(Date.now() - 31 * 24 * 3600 * 1000).toISOString();
    lireProfil.mockResolvedValue(profil({ pseudo_updated_at: ancien }));

    await monter();

    expect(screen.getByLabelText('Pseudo').props.editable).toBe(true);
  });
});

describe('D1 — l’enregistrement', () => {
  /**
   * Le bouton EST la confirmation : il s'allume quand une valeur change, s'éteint quand
   * le serveur a répondu. Pas de bandeau de succès qui s'ajouterait à l'écran.
   */
  it('reste éteint tant que rien n’a bougé', async () => {
    await monter();

    await presser(screen.getByText('Enregistrer'));

    expect(majProfil).not.toHaveBeenCalled();
  });

  it('s’allume dès qu’une valeur change', async () => {
    await monter();

    await saisir(screen.getByLabelText('Prénom'), 'Maxime');
    await presser(screen.getByText('Enregistrer'));

    expect(majProfil).toHaveBeenCalledWith({ first_name: 'Maxime' });
  });

  /** D1 §9 BR-1 : PATCH, donc on n'envoie QUE ce qui a bougé. */
  it('n’envoie pas les champs inchangés', async () => {
    await monter();

    await saisir(screen.getByLabelText('Nom'), 'Chastel');
    await presser(screen.getByText('Enregistrer'));

    expect(majProfil).toHaveBeenCalledWith({ last_name: 'Chastel' });
  });

  it('envoie le pseudo nettoyé de ses espaces', async () => {
    await monter();

    await saisir(screen.getByLabelText('Pseudo'), '  NouveauNom  ');
    await presser(screen.getByText('Enregistrer'));

    expect(majProfil).toHaveBeenCalledWith({ pseudo: 'NouveauNom' });
  });

  /**
   * Sans cette écriture, l'utilisateur mémorisé garderait l'ancien pseudo, et l'accès
   * hors ligne d'A1 §9 BR-5 afficherait un nom périmé au démarrage suivant.
   */
  it('met à jour l’utilisateur mémorisé après un changement de pseudo', async () => {
    await monter();

    await saisir(screen.getByLabelText('Pseudo'), 'NouveauNom');
    await presser(screen.getByText('Enregistrer'));

    expect(majUtilisateur).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'u1', pseudo: 'NouveauNom' }),
    );
  });

  /** Le serveur renvoie « déjà pris » et le refus des 30 jours sous la même clé. */
  it('affiche le refus du serveur sous le champ, jamais en bannière', async () => {
    majProfil.mockRejectedValue(new ValidationError({ pseudo: ['Ce pseudo est déjà pris.'] }));
    await monter();

    await saisir(screen.getByLabelText('Pseudo'), 'DejaPris');
    await presser(screen.getByText('Enregistrer'));

    expect(screen.getByText('Ce pseudo est déjà pris.')).toBeTruthy();
    expect(screen.queryByText('Réessayer')).toBeNull();
  });

  it('une coupure réseau part en bannière, avec « Réessayer »', async () => {
    majProfil.mockRejectedValue(new NetworkError('Serveur injoignable.'));
    await monter();

    await saisir(screen.getByLabelText('Prénom'), 'Maxime');
    await presser(screen.getByText('Enregistrer'));

    expect(screen.getByText('Serveur injoignable.')).toBeTruthy();
    expect(screen.getByText('Réessayer')).toBeTruthy();
  });
});

describe('D1 — la déconnexion', () => {
  it('demande confirmation avant de purger', async () => {
    await monter();

    await presser(screen.getByText('Se déconnecter'));

    expect(deconnexion).not.toHaveBeenCalled();
    expect(screen.getByText('déconnexion')).toBeTruthy();
  });

  /**
   * D1 §9 BR-4 : purge locale. AUCUNE navigation manuelle — `Stack.Protected` retire le
   * groupe des onglets et expo-router retombe sur le Login tout seul.
   */
  it('purge sans naviguer une fois confirmée', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { router } = require('expo-router') as { router: { replace: jest.Mock } };

    await monter();
    await presser(screen.getByText('Se déconnecter'));
    await presser(screen.getAllByText('Se déconnecter')[1]);

    expect(deconnexion).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('annuler referme le dialogue sans rien faire', async () => {
    await monter();

    await presser(screen.getByText('Se déconnecter'));
    await presser(screen.getByText('Annuler'));

    expect(deconnexion).not.toHaveBeenCalled();
  });
});

describe('D1 — le chargement', () => {
  it('affiche une bannière et propose de recharger quand /me/ échoue', async () => {
    lireProfil.mockRejectedValue(new NetworkError('Serveur injoignable.'));

    await render(<Profil />);

    await waitFor(() => expect(screen.getByText('Serveur injoignable.')).toBeTruthy());
    expect(screen.getByText('Réessayer')).toBeTruthy();
  });
});
