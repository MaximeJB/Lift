import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import Login from '../../app/(auth)/login';
import Register from '../../app/(auth)/register';
import { NetworkError, ValidationError } from '../shared/api';
import { useAuth } from '../shared/context/AuthContext';

/**
 * A2 et A3 — les deux écrans par lesquels tout le monde entre.
 *
 * Ce qui est vérifié ici, ce sont les CRITÈRES D'ACCEPTATION de la spec, un par test :
 * le message générique qui interdit d'énumérer les comptes, le blocage avant tout appel
 * réseau, la case CGU jamais pré-cochée.
 */
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), dismissAll: jest.fn() },
}));

jest.mock('../shared/context/AuthContext', () => ({ useAuth: jest.fn() }));

const navigation = router as jest.Mocked<typeof router>;
const session = useAuth as jest.MockedFunction<typeof useAuth>;

const connexion = jest.fn();
const inscription = jest.fn();

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

beforeEach(() => {
  jest.clearAllMocks();
  connexion.mockResolvedValue(undefined);
  inscription.mockResolvedValue(undefined);

  session.mockReturnValue({
    session: { status: 'unauthenticated' },
    login: connexion,
    register: inscription,
    majUtilisateur: jest.fn(),
    logout: jest.fn(),
  });
});

describe('A2 — Login', () => {
  async function remplir(email = 'max@lift.com', motDePasse = 'motdepasse') {
    await saisir(screen.getByLabelText('Adresse email'), email);
    await saisir(screen.getByLabelText('Mot de passe'), motDePasse);
  }

  /** A2 §9 BR-1 : le bouton reste inerte tant que le format n'est pas plausible. */
  it('le bouton est inerte tant que l’email n’a pas une forme d’adresse', async () => {
    await render(<Login />);

    await saisir(screen.getByLabelText('Adresse email'), 'pas-une-adresse');
    await saisir(screen.getByLabelText('Mot de passe'), 'motdepasse');
    await presser(screen.getByText('Se connecter'));

    expect(connexion).not.toHaveBeenCalled();
  });

  it('le bouton est inerte sans mot de passe', async () => {
    await render(<Login />);

    await saisir(screen.getByLabelText('Adresse email'), 'max@lift.com');
    await presser(screen.getByText('Se connecter'));

    expect(connexion).not.toHaveBeenCalled();
  });

  it('une saisie valide déclenche la connexion', async () => {
    await render(<Login />);
    await remplir();

    await presser(screen.getByText('Se connecter'));

    expect(connexion).toHaveBeenCalledWith('max@lift.com', 'motdepasse');
  });

  /** A2 §9 BR-3 : `replace`, jamais `push` — on ne revient pas sur un écran de connexion. */
  it('remplace l’écran au lieu de l’empiler après succès', async () => {
    await render(<Login />);
    await remplir();

    await presser(screen.getByText('Se connecter'));

    expect(navigation.replace).toHaveBeenCalledWith('/');
    expect(navigation.push).not.toHaveBeenCalled();
  });

  /**
   * A2 §9 BR-2 — LE CRITÈRE LE PLUS IMPORTANT DE CET ÉCRAN. Le message ne dit jamais
   * lequel des deux champs est faux : le dire permettrait d'énumérer les comptes
   * existants.
   */
  it('refus d’identifiants : message générique, sans « Réessayer »', async () => {
    connexion.mockRejectedValue(new ValidationError({}));
    await render(<Login />);
    await remplir();

    await presser(screen.getByText('Se connecter'));

    expect(screen.getByText('Identifiants invalides.')).toBeTruthy();
    expect(screen.queryByText('Réessayer')).toBeNull();
  });

  /** A2 §8 : « Réessayer » n'a de sens que sur une coupure. */
  it('coupure réseau : message distinct ET « Réessayer »', async () => {
    connexion.mockRejectedValue(new NetworkError('Serveur injoignable. Vérifie ta connexion.'));
    await render(<Login />);
    await remplir();

    await presser(screen.getByText('Se connecter'));

    expect(screen.getByText('Serveur injoignable. Vérifie ta connexion.')).toBeTruthy();
    expect(screen.getByText('Réessayer')).toBeTruthy();
  });

  /** A2 §9 BR-5 : les valeurs saisies RESTENT. On ne remet rien à zéro. */
  it('conserve la saisie après un échec', async () => {
    connexion.mockRejectedValue(new ValidationError({}));
    await render(<Login />);
    await remplir();

    await presser(screen.getByText('Se connecter'));

    expect(screen.getByLabelText('Adresse email').props.value).toBe('max@lift.com');
    expect(screen.getByLabelText('Mot de passe').props.value).toBe('motdepasse');
  });

  it('les deux liens mènent vers l’inscription et l’oubli de mot de passe', async () => {
    await render(<Login />);

    await presser(screen.getByText('Créer un compte'));
    expect(navigation.push).toHaveBeenCalledWith('/register');

    await presser(screen.getByText('Mot de passe oublié ?'));
    expect(navigation.push).toHaveBeenCalledWith('/forgot-password');
  });
});

describe('A3 — Inscription', () => {
  async function remplir({
    email = 'max@lift.com',
    pseudo = 'MaxLift',
    motDePasse = 'motdepasse',
    confirmation = 'motdepasse',
  } = {}) {
    await saisir(screen.getByLabelText('Adresse email'), email);
    await saisir(screen.getByLabelText('Pseudo'), pseudo);
    await saisir(screen.getByLabelText('Mot de passe'), motDePasse);
    await saisir(screen.getByLabelText('Confirmation du mot de passe'), confirmation);
  }

  const cocherCgu = () => presser(screen.getAllByRole('checkbox')[0]);

  /** A3 §9 BR-4 : jamais pré-cochée, et le bouton reste inerte tant qu'elle ne l'est pas. */
  it('CGU non cochée : la soumission est impossible', async () => {
    await render(<Register />);
    await remplir();

    await presser(screen.getByText('Créer un compte'));

    expect(inscription).not.toHaveBeenCalled();
  });

  it('CGU cochée : la soumission passe', async () => {
    await render(<Register />);
    await remplir();
    await cocherCgu();

    await presser(screen.getByText('Créer un compte'));

    expect(inscription).toHaveBeenCalledWith({
      email: 'max@lift.com',
      password: 'motdepasse',
      passwordConfirm: 'motdepasse',
      pseudo: 'MaxLift',
    });
  });

  /**
   * A3 §9 BR-1 : la comparaison se fait AVANT tout appel. Le backend lève une erreur au
   * message VIDE sur ce cas — laisser partir la requête afficherait un champ blanc.
   */
  it('mots de passe différents : bloqué avant tout appel réseau', async () => {
    await render(<Register />);
    await remplir({ confirmation: 'autre chose' });
    await cocherCgu();

    await presser(screen.getByText('Créer un compte'));

    expect(inscription).not.toHaveBeenCalled();
  });

  it('affiche l’écart entre les deux mots de passe une fois le champ quitté', async () => {
    await render(<Register />);
    await remplir({ confirmation: 'autre chose' });

    await act(async () => {
      fireEvent(screen.getByLabelText('Confirmation du mot de passe'), 'blur');
    });

    expect(screen.getByText('Les deux mots de passe diffèrent.')).toBeTruthy();
  });

  /** A3 §9 BR-3 : huit caractères, la seule règle de complexité du produit. */
  it('mot de passe trop court : bloqué', async () => {
    await render(<Register />);
    await remplir({ motDePasse: '1234', confirmation: '1234' });
    await cocherCgu();

    await presser(screen.getByText('Créer un compte'));

    expect(inscription).not.toHaveBeenCalled();
  });

  /** A3 §9 BR-2 : le pattern du sérialiseur, repris à l'identique côté client. */
  it('pseudo hors du motif : bloqué', async () => {
    await render(<Register />);
    await remplir({ pseudo: 'ab' });
    await cocherCgu();

    await presser(screen.getByText('Créer un compte'));

    expect(inscription).not.toHaveBeenCalled();
  });

  it('n’affiche l’erreur d’un champ qu’une fois celui-ci quitté', async () => {
    await render(<Register />);

    await saisir(screen.getByLabelText('Pseudo'), 'ab');
    expect(screen.queryByText(/3 à 20 caractères/)).toBeNull();

    await act(async () => {
      fireEvent(screen.getByLabelText('Pseudo'), 'blur');
    });
    expect(screen.getByText(/3 à 20 caractères/)).toBeTruthy();
  });

  /** A3 §10 : email ET pseudo déjà pris s'affichent EN MÊME TEMPS. */
  it('affiche simultanément les deux refus du serveur, sous leurs champs', async () => {
    inscription.mockRejectedValue(
      new ValidationError({
        email: ['Cette adresse est déjà utilisée.'],
        pseudo: ['Ce pseudo est déjà pris.'],
      }),
    );

    await render(<Register />);
    await remplir();
    await cocherCgu();
    await presser(screen.getByText('Créer un compte'));

    expect(screen.getByText('Cette adresse est déjà utilisée.')).toBeTruthy();
    expect(screen.getByText('Ce pseudo est déjà pris.')).toBeTruthy();
  });

  /** A3 §8 : la bannière est RÉSERVÉE au réseau. */
  it('une erreur de champ ne part jamais en bannière', async () => {
    inscription.mockRejectedValue(new ValidationError({ email: ['Déjà utilisée.'] }));

    await render(<Register />);
    await remplir();
    await cocherCgu();
    await presser(screen.getByText('Créer un compte'));

    expect(screen.queryByText('Réessayer')).toBeNull();
  });

  it('une coupure réseau part en bannière, avec « Réessayer »', async () => {
    inscription.mockRejectedValue(new NetworkError('Serveur injoignable.'));

    await render(<Register />);
    await remplir();
    await cocherCgu();
    await presser(screen.getByText('Créer un compte'));

    expect(screen.getByText('Serveur injoignable.')).toBeTruthy();
    expect(screen.getByText('Réessayer')).toBeTruthy();
  });

  it('succès : on remplace l’écran, on ne l’empile pas', async () => {
    await render(<Register />);
    await remplir();
    await cocherCgu();

    await presser(screen.getByText('Créer un compte'));

    expect(navigation.replace).toHaveBeenCalledWith('/');
  });

  /** A3 §11 : les deux liens légaux sont atteignables indépendamment de la case. */
  it('les liens légaux mènent aux deux écrans, sans cocher la case', async () => {
    await render(<Register />);

    await presser(screen.getByText('conditions générales'));
    expect(navigation.push).toHaveBeenCalledWith('/cgu');

    await presser(screen.getByText('politique de confidentialité'));
    expect(navigation.push).toHaveBeenCalledWith('/confidentialite');
  });

  it('décocher la case redésactive la soumission dans l’instant', async () => {
    await render(<Register />);
    await remplir();

    await cocherCgu();
    await cocherCgu();
    await presser(screen.getByText('Créer un compte'));

    expect(inscription).not.toHaveBeenCalled();
  });
});
