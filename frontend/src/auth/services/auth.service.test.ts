import { api, clearTokens, setStoredUser, setTokens } from '../../shared/api';

import { getMe, login, logout, register, updateMe } from './auth.service';

/**
 * Le service d'authentification ÉCRIT la session. À son retour, l'utilisateur est
 * réellement connecté et tout appel ultérieur portera l'en-tête d'autorisation.
 *
 * Le module `shared/api` est remplacé en entier : ces tests portent sur ce que le service
 * envoie et sur l'ORDRE de ses écritures, pas sur le transport.
 */
jest.mock('../../shared/api', () => ({
  api: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
  setTokens: jest.fn(),
  setStoredUser: jest.fn(),
  clearTokens: jest.fn(),
}));

const requete = api as jest.Mocked<typeof api>;
const ecrireJetons = setTokens as jest.MockedFunction<typeof setTokens>;
const ecrireUtilisateur = setStoredUser as jest.MockedFunction<typeof setStoredUser>;
const purger = clearTokens as jest.MockedFunction<typeof clearTokens>;

const UTILISATEUR = {
  id: 'u1',
  pseudo: 'MaxLift',
  email: 'max@lift.com',
  email_verified: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  ecrireJetons.mockResolvedValue(undefined);
  ecrireUtilisateur.mockResolvedValue(undefined);
  purger.mockResolvedValue(undefined);
});

describe('login', () => {
  beforeEach(() => {
    requete.post.mockResolvedValue({ access: 'a1', refresh: 'r1', user: UTILISATEUR });
  });

  it('appelle le bon chemin', async () => {
    await login('max@lift.com', 'motdepasse');
    expect(requete.post).toHaveBeenCalledWith('/api/auth/login/', expect.anything());
  });

  /** A2 §10 : l'email est nettoyé de ses espaces avant envoi. */
  it('nettoie les espaces autour de l’email', async () => {
    await login('  max@lift.com  ', 'motdepasse');
    expect(requete.post).toHaveBeenCalledWith('/api/auth/login/', {
      email: 'max@lift.com',
      password: 'motdepasse',
    });
  });

  it('ne touche pas au mot de passe', async () => {
    await login('max@lift.com', '  espaces significatifs  ');
    const [, corps] = requete.post.mock.calls[0];
    expect((corps as { password: string }).password).toBe('  espaces significatifs  ');
  });

  /** A2 §9 BR-3 : les jetons sont écrits ICI, avant que l'appelant reprenne la main. */
  it('persiste les jetons et l’utilisateur avant de rendre la main', async () => {
    await login('max@lift.com', 'motdepasse');

    expect(ecrireJetons).toHaveBeenCalledWith({ access: 'a1', refresh: 'r1' });
    expect(ecrireUtilisateur).toHaveBeenCalledWith(UTILISATEUR);
  });

  it('propage l’erreur sans rien écrire quand le serveur refuse', async () => {
    requete.post.mockRejectedValue(new Error('refusé'));

    await expect(login('max@lift.com', 'faux')).rejects.toThrow('refusé');
    expect(ecrireJetons).not.toHaveBeenCalled();
    expect(ecrireUtilisateur).not.toHaveBeenCalled();
  });
});

describe('register', () => {
  beforeEach(() => {
    requete.post.mockResolvedValue({
      email: 'max@lift.com',
      pseudo: 'MaxLift',
      tokens: { access: 'a1', refresh: 'r1' },
    });
    requete.get.mockResolvedValue({
      id: 'u1',
      email: 'max@lift.com',
      email_verified: false,
      first_name: '',
      last_name: '',
      profile_visibility: 'PUBLIC',
      created_at: '2026-08-03',
      pseudo: 'MaxLift',
      pseudo_updated_at: null,
    });
  });

  /** A3 §9 BR-6 : email et pseudo nettoyés, email normalisé en minuscules. */
  it('normalise l’email en minuscules et nettoie le pseudo', async () => {
    await register({
      email: '  MAX@Lift.COM ',
      password: 'motdepasse',
      passwordConfirm: 'motdepasse',
      pseudo: '  MaxLift  ',
    });

    expect(requete.post).toHaveBeenCalledWith('/api/auth/register/', {
      email: 'max@lift.com',
      password: 'motdepasse',
      password_confirm: 'motdepasse',
      pseudo: 'MaxLift',
    });
  });

  /**
   * L'ORDRE COMPTE. `/me/` part avec l'en-tête d'autorisation, donc les jetons doivent
   * déjà être écrits. Inverser les deux produirait un 401 à chaque inscription.
   */
  it('écrit les jetons AVANT d’appeler /me/', async () => {
    const ordre: string[] = [];
    ecrireJetons.mockImplementation(async () => void ordre.push('jetons'));
    requete.get.mockImplementation(async () => {
      ordre.push('me');
      return {
        id: 'u1',
        email: 'max@lift.com',
        email_verified: false,
        first_name: '',
        last_name: '',
        profile_visibility: 'PUBLIC',
        created_at: '',
        pseudo: 'MaxLift',
        pseudo_updated_at: null,
      };
    });

    await register({
      email: 'max@lift.com',
      password: 'p',
      passwordConfirm: 'p',
      pseudo: 'MaxLift',
    });

    expect(ordre).toEqual(['jetons', 'me']);
  });

  /**
   * La réponse d'inscription n'a ni `id` ni `email_verified` : c'est `/me/` qui les
   * fournit. Le `pseudo`, lui, vient de l'inscription — `PrivateUserSerializer` ne
   * l'exposait pas au moment où ce contournement a été écrit.
   */
  it('recompose l’utilisateur à partir des deux réponses', async () => {
    const session = await register({
      email: 'max@lift.com',
      password: 'p',
      passwordConfirm: 'p',
      pseudo: 'MaxLift',
    });

    expect(session.user).toEqual({
      id: 'u1',
      email: 'max@lift.com',
      email_verified: false,
      pseudo: 'MaxLift',
    });
    expect(session.access).toBe('a1');
  });

  it('mémorise l’utilisateur recomposé', async () => {
    await register({
      email: 'max@lift.com',
      password: 'p',
      passwordConfirm: 'p',
      pseudo: 'MaxLift',
    });

    expect(ecrireUtilisateur).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'u1', pseudo: 'MaxLift' }),
    );
  });
});

describe('getMe et updateMe', () => {
  it('lit le profil sur le bon chemin', async () => {
    requete.get.mockResolvedValue({ id: 'u1' });
    await getMe();
    expect(requete.get).toHaveBeenCalledWith('/api/auth/me/');
  });

  /** PATCH : on n'envoie que ce qui change, c'est toute la sémantique de la méthode. */
  it('n’envoie que les champs fournis', async () => {
    requete.patch.mockResolvedValue({ id: 'u1' });

    await updateMe({ first_name: 'Maxime' });

    expect(requete.patch).toHaveBeenCalledWith('/api/auth/me/', { first_name: 'Maxime' });
  });

  it('accepte un objet vide sans rien inventer', async () => {
    requete.patch.mockResolvedValue({ id: 'u1' });

    await updateMe({});

    expect(requete.patch).toHaveBeenCalledWith('/api/auth/me/', {});
  });
});

describe('logout', () => {
  /** D1 §9 BR-4 : purge locale. Aucun endpoint de déconnexion n'existe côté Django. */
  it('purge le stockage sans appeler le réseau', async () => {
    await logout();

    expect(purger).toHaveBeenCalledTimes(1);
    expect(requete.post).not.toHaveBeenCalled();
    expect(requete.get).not.toHaveBeenCalled();
    expect(requete.delete).not.toHaveBeenCalled();
  });
});
