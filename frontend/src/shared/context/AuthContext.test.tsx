/**
 * Le `Text` de React Native est interdit ailleurs dans le projet — il court-circuiterait
 * l'echelle typographique. Ici il ne sert qu'a poser une sonde observable : ce fichier ne
 * dessine aucune interface, il lit un etat.
 */
/* eslint-disable no-restricted-imports */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Text, View } from 'react-native';

import {
  AuthError,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  isTokenValid,
  NetworkError,
  refreshSession,
  setSessionExpiredHandler,
  setStoredUser,
} from '../api';

import { AuthProvider, useAuth } from './AuthContext';

/**
 * Le démarrage de l'application applique les six règles métier de A1 §9, dans un ordre
 * précis. Chacune a son test.
 *
 * Les deux issues qui comptent sont opposées : un refus d'AUTHENTIFICATION déconnecte
 * (BR-4), un échec RÉSEAU surtout pas (BR-5). Les confondre déconnecterait un utilisateur
 * dont le métro a coupé la connexion.
 */
jest.mock('../api', () => ({
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  getStoredUser: jest.fn(),
  setStoredUser: jest.fn(),
  isTokenValid: jest.fn(),
  refreshSession: jest.fn(),
  setSessionExpiredHandler: jest.fn(),
  AuthError: class AuthError extends Error {},
  NetworkError: class NetworkError extends Error {},
}));

jest.mock('../../auth/services/auth.service', () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  getMe: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const service = require('../../auth/services/auth.service') as jest.Mocked<
  typeof import('../../auth/services/auth.service')
>;

const lireJeton = getAccessToken as jest.MockedFunction<typeof getAccessToken>;
const lireRefresh = getRefreshToken as jest.MockedFunction<typeof getRefreshToken>;
const lireUtilisateur = getStoredUser as jest.MockedFunction<typeof getStoredUser>;
const ecrireUtilisateur = setStoredUser as jest.MockedFunction<typeof setStoredUser>;
const jetonValide = isTokenValid as jest.MockedFunction<typeof isTokenValid>;
const rafraichir = refreshSession as jest.MockedFunction<typeof refreshSession>;
const brancherExpiration = setSessionExpiredHandler as jest.MockedFunction<
  typeof setSessionExpiredHandler
>;

const UTILISATEUR = {
  id: 'u1',
  pseudo: 'MaxLift',
  email: 'max@lift.com',
  email_verified: false,
};

/** Affiche l'état de session, seule chose que les tests ont besoin d'observer. */
function Sonde() {
  const { session } = useAuth();

  return (
    <Text testID="etat">
      {session.status === 'authenticated' ? `authenticated:${session.user.email}` : session.status}
    </Text>
  );
}

/**
 * `render` de RNTL 14 est ASYNCHRONE : il renvoie une promesse. Ne pas l'attendre laisse
 * `screen` vide et rend un objet sans aucune cle — sans lever la moindre erreur. C'est ce
 * qui a fait perdre une heure le 03/08/2026.
 */
async function monter() {
  return render(
    <AuthProvider>
      <Sonde />
    </AuthProvider>,
  );
}

async function etatStabilise() {
  await waitFor(() => expect(screen.getByTestId('etat').props.children).not.toBe('loading'));
  return screen.getByTestId('etat').props.children as string;
}

beforeEach(() => {
  jest.clearAllMocks();
  lireJeton.mockResolvedValue(null);
  lireRefresh.mockResolvedValue(null);
  lireUtilisateur.mockResolvedValue(null);
  ecrireUtilisateur.mockResolvedValue(undefined);
  jetonValide.mockReturnValue(false);
  rafraichir.mockResolvedValue('nouveau-jeton');
});

describe('démarrage — A1 §9', () => {
  /** BR-1 : le cas nominal, résolu en local, sans toucher au réseau. */
  it('BR-1 : jeton local valide → connecté, sans aucun appel réseau', async () => {
    lireJeton.mockResolvedValue('jeton');
    lireUtilisateur.mockResolvedValue(UTILISATEUR);
    jetonValide.mockReturnValue(true);

    await monter();

    expect(await etatStabilise()).toBe('authenticated:max@lift.com');
    expect(rafraichir).not.toHaveBeenCalled();
  });

  it('BR-1 : un jeton valide sans utilisateur mémorisé ne suffit pas', async () => {
    lireJeton.mockResolvedValue('jeton');
    lireUtilisateur.mockResolvedValue(null);
    jetonValide.mockReturnValue(true);
    service.getMe.mockRejectedValue(new Error('hors ligne'));

    await monter();

    expect(await etatStabilise()).toBe('unauthenticated');
  });

  /** A1 §10 : sans le moindre jeton, on part au Login sans tenter quoi que ce soit. */
  it('§10 : aucun jeton → Login direct, sans appel réseau', async () => {
    await monter();

    expect(await etatStabilise()).toBe('unauthenticated');
    expect(rafraichir).not.toHaveBeenCalled();
  });

  /** BR-2 et BR-3 : jeton mort mais refresh présent, la session se relève. */
  it('BR-2 : jeton expiré et refresh présent → rafraîchissement puis session', async () => {
    lireJeton.mockResolvedValue('jeton-mort');
    lireRefresh.mockResolvedValue('refresh');
    lireUtilisateur.mockResolvedValue(UTILISATEUR);

    await monter();

    expect(await etatStabilise()).toBe('authenticated:max@lift.com');
    expect(rafraichir).toHaveBeenCalledTimes(1);
  });

  /**
   * Le rafraîchissement ne renvoie que des jetons : SimpleJWT ne fournit pas
   * l'utilisateur. S'il manque en local, on interroge le serveur — l'exception, pas le
   * lancement ordinaire (A1 §15).
   */
  it('BR-3 : sans utilisateur mémorisé, il est reconstruit depuis le serveur', async () => {
    lireJeton.mockResolvedValue('jeton-mort');
    lireRefresh.mockResolvedValue('refresh');
    service.getMe.mockResolvedValue({
      id: 'u1',
      email: 'max@lift.com',
      email_verified: true,
    } as never);

    await monter();

    expect(await etatStabilise()).toBe('authenticated:max@lift.com');
    expect(service.getMe).toHaveBeenCalledTimes(1);
  });

  it('BR-3 : un échec de reconstruction laisse déconnecté, sans planter', async () => {
    lireJeton.mockResolvedValue('jeton-mort');
    lireRefresh.mockResolvedValue('refresh');
    service.getMe.mockRejectedValue(new Error('serveur muet'));

    await monter();

    expect(await etatStabilise()).toBe('unauthenticated');
  });

  /** BR-4 : la session est refusée. Les jetons ont déjà été purgés par le client. */
  it('BR-4 : échec d’AUTHENTIFICATION → déconnecté', async () => {
    lireJeton.mockResolvedValue('jeton-mort');
    lireRefresh.mockResolvedValue('refresh');
    lireUtilisateur.mockResolvedValue(UTILISATEUR);
    rafraichir.mockRejectedValue(new AuthError('refusé'));

    await monter();

    expect(await etatStabilise()).toBe('unauthenticated');
  });

  /**
   * BR-5 : le serveur est injoignable, pas la session invalide. On entre avec le dernier
   * utilisateur connu — c'est ce qui rend l'accès optimiste réellement utilisable.
   */
  it('BR-5 : échec RÉSEAU → connecté quand même, avec l’utilisateur mémorisé', async () => {
    lireJeton.mockResolvedValue('jeton-mort');
    lireRefresh.mockResolvedValue('refresh');
    lireUtilisateur.mockResolvedValue(UTILISATEUR);
    rafraichir.mockRejectedValue(new NetworkError('injoignable'));

    await monter();

    expect(await etatStabilise()).toBe('authenticated:max@lift.com');
  });

  it('BR-5 : sans utilisateur mémorisé, l’accès optimiste n’est pas possible', async () => {
    lireJeton.mockResolvedValue('jeton-mort');
    lireRefresh.mockResolvedValue('refresh');
    rafraichir.mockRejectedValue(new NetworkError('injoignable'));

    await monter();

    expect(await etatStabilise()).toBe('unauthenticated');
  });
});

/**
 * EN ATTENTE — trois comportements que ce harnais ne sait pas encore observer.
 *
 * Les six regles de A1 §9 sont couvertes juste au-dessus et passent. Ce qui suit bute sur
 * le rendu asynchrone de RNTL 14 : `cleanup()` ne demonte pas de facon synchrone, `act()`
 * ne vide pas la file, et un composant autre que la sonde du premier bloc n'est pas
 * retrouve par `screen`. Le code reste ici, il decrit exactement ce qu'il faut verifier.
 */
describe('déconnexion forcée depuis le client HTTP', () => {
  it('branche un gestionnaire au montage et le retire au démontage', async () => {
    const rendu = await monter();
    await etatStabilise();

    expect(brancherExpiration).toHaveBeenCalledWith(expect.any(Function));

    // `unmount` n'existe sur le resultat qu'une fois la promesse de `render` resolue.
    // Ne PAS passer par `cleanup()` : il vide l'etat interne de RNTL et tous les rendus
    // suivants du fichier deviennent introuvables.
    // Le demontage est enveloppe dans `act` : la fonction de nettoyage de l'effet part
    // dans la file de React, elle n'a pas encore tourne au retour de `unmount()`.
    await act(async () => {
      rendu.unmount();
    });

    expect(brancherExpiration).toHaveBeenLastCalledWith(null);
  });

  /**
   * Sans ce branchement, l'état React resterait « connecté » alors que la session est
   * morte, et chaque écran afficherait des erreurs sans qu'on sache pourquoi.
   */
  it('bascule la session en déconnecté quand le client le signale', async () => {
    lireJeton.mockResolvedValue('jeton');
    lireUtilisateur.mockResolvedValue(UTILISATEUR);
    jetonValide.mockReturnValue(true);

    await monter();
    expect(await etatStabilise()).toBe('authenticated:max@lift.com');

    const signaler = brancherExpiration.mock.calls[0][0] as () => void;
    await act(async () => signaler());

    expect(screen.getByTestId('etat').props.children).toBe('unauthenticated');
  });
});

/**
 * EN ATTENTE — trois comportements que ce harnais ne sait pas encore observer.
 *
 * Les six regles de A1 §9 sont couvertes juste au-dessus et passent. Ce qui suit bute sur
 * le rendu asynchrone de RNTL 14 : `cleanup()` ne demonte pas de facon synchrone, `act()`
 * ne vide pas la file, et un composant autre que la sonde du premier bloc n'est pas
 * retrouve par `screen`. Le code reste ici, il decrit exactement ce qu'il faut verifier.
 */
describe('actions de session', () => {
  function SondeAvecActions() {
    const { session, login, logout, majUtilisateur } = useAuth();

    return (
      <View>
        <Text testID="etat">{session.status}</Text>
        <Text
          testID="connexion"
          onPress={() => {
            void login('max@lift.com', 'motdepasse');
          }}
        >
          connexion
        </Text>
        <Text
          testID="deconnexion"
          onPress={() => {
            void logout();
          }}
        >
          deconnexion
        </Text>
        <Text
          testID="maj"
          onPress={() => {
            void majUtilisateur({ ...UTILISATEUR, pseudo: 'NouveauNom' });
          }}
        >
          maj
        </Text>
      </View>
    );
  }

  async function monterAvecActions() {
    return render(
      <AuthProvider>
        <SondeAvecActions />
      </AuthProvider>,
    );
  }

  it('login place la session en connecté', async () => {
    service.login.mockResolvedValue({ access: 'a', refresh: 'r', user: UTILISATEUR });
    await monterAvecActions();
    await waitFor(() => expect(screen.getByTestId('etat').props.children).toBe('unauthenticated'));

    await act(async () => {
      fireEvent.press(screen.getByTestId('connexion'));
    });

    expect(screen.getByTestId('etat').props.children).toBe('authenticated');
  });

  it('logout purge et repasse en déconnecté', async () => {
    service.login.mockResolvedValue({ access: 'a', refresh: 'r', user: UTILISATEUR });
    service.logout.mockResolvedValue(undefined);
    await monterAvecActions();
    await waitFor(() => expect(screen.getByTestId('etat').props.children).toBe('unauthenticated'));

    await act(async () => {
      fireEvent.press(screen.getByTestId('connexion'));
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('deconnexion'));
    });

    expect(service.logout).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('etat').props.children).toBe('unauthenticated');
  });

  /**
   * Sans cette écriture, changer son pseudo dans D1 ne mettrait à jour que la réponse de
   * `/me/` : l'utilisateur mémorisé garderait l'ancien, et l'accès hors ligne afficherait
   * un nom périmé au démarrage suivant.
   */
  it('majUtilisateur écrit SecureStore ET l’état', async () => {
    service.login.mockResolvedValue({ access: 'a', refresh: 'r', user: UTILISATEUR });
    await monterAvecActions();
    await waitFor(() => expect(screen.getByTestId('etat').props.children).toBe('unauthenticated'));

    await act(async () => {
      fireEvent.press(screen.getByTestId('connexion'));
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('maj'));
    });

    expect(ecrireUtilisateur).toHaveBeenCalledWith(
      expect.objectContaining({ pseudo: 'NouveauNom' }),
    );
  });
});

/**
 * EN ATTENTE — trois comportements que ce harnais ne sait pas encore observer.
 *
 * Les six regles de A1 §9 sont couvertes juste au-dessus et passent. Ce qui suit bute sur
 * le rendu asynchrone de RNTL 14 : `cleanup()` ne demonte pas de facon synchrone, `act()`
 * ne vide pas la file, et un composant autre que la sonde du premier bloc n'est pas
 * retrouve par `screen`. Le code reste ici, il decrit exactement ce qu'il faut verifier.
 */
describe('useAuth hors provider', () => {
  /**
   * Une erreur explicite au montage vaut mieux qu'un `undefined` qui casse trois ecrans
   * plus loin. Le hook leve pendant le rendu : on l'attrape sur place plutot que de
   * compter sur la propagation, que React 19 ne garantit pas de facon synchrone.
   */
  function Piege() {
    try {
      useAuth();
      return <Text testID="resultat">aucune erreur</Text>;
    } catch (e) {
      return <Text testID="resultat">{(e as Error).message}</Text>;
    }
  }

  it('leve une erreur qui nomme le provider manquant', async () => {
    await render(<Piege />);
    expect(screen.getByTestId('resultat').props.children).toMatch(/AuthProvider/);
  });
});
