import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  AuthError,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  isTokenValid,
  refreshSession,
  setSessionExpiredHandler,
  type AuthUser,
} from '../api';
import * as authService from '../../auth/services/auth.service';
import type { RegisterInput } from '../../auth/services/auth.service';

/**
 * État de session, en union discriminée.
 *
 * Cette forme rend les états incohérents INEXPRIMABLES : « connecté sans utilisateur »
 * ou « en cours de vérification ET connecté » ne compilent pas. Un écran qui teste
 * `status === 'authenticated'` obtient un `user` garanti non nul, sans vérification
 * supplémentaire.
 */
export type Session =
  | { status: 'loading' }
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'unauthenticated' };

type AuthContextValue = {
  session: Session;
  /** @throws {ValidationError} identifiants refusés · {NetworkError} serveur injoignable */
  login: (email: string, password: string) => Promise<void>;
  /** @throws {ValidationError} email ou pseudo pris · {NetworkError} serveur injoignable */
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};

/**
 * `null` sert de sentinelle « hors du provider » — voir `useAuth`.
 *
 * Le jeton d'accès n'est VOLONTAIREMENT pas exposé : le client HTTP le lit lui-même
 * depuis SecureStore et l'injecte. Un écran qui pourrait le lire finirait par écrire son
 * propre appel réseau, sans rafraîchissement, sans timeout et sans traduction d'erreur.
 */
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>({ status: 'loading' });

  /**
   * Démarrage — A1, l'écran Auth Gate.
   *
   * Applique les six règles métier de A1 §9, dans cet ordre :
   *
   *   BR-1  jeton local encore valide → connecté, AUCUN appel réseau
   *   BR-2  jeton expiré mais refresh présent → tentative de rafraîchissement
   *   BR-3  rafraîchissement réussi → les deux jetons sont remplacés (fait par le client)
   *   BR-4  échec d'AUTHENTIFICATION → purge et retour au Login
   *   BR-5  échec RÉSEAU → surtout pas de déconnexion, accès optimiste
   *   BR-6  timeout de 5 s (porté par `refreshClient` dans client.ts)
   *
   * A1 §10 : sans aucun jeton, on part directement vers Login sans toucher au réseau.
   */
  const bootstrap = useCallback(async () => {
    const [access, storedUser] = await Promise.all([
      getAccessToken(),
      getStoredUser<AuthUser>(),
    ]);

    // BR-1 — le cas nominal, résolu en local sous 100 ms (A1 §13).
    if (isTokenValid(access) && storedUser) {
      setSession({ status: 'authenticated', user: storedUser });
      return;
    }

    // A1 §10 — aucun jeton en stockage : Login direct, pas de tentative réseau.
    const refresh = await getRefreshToken();
    if (!refresh) {
      setSession({ status: 'unauthenticated' });
      return;
    }

    // BR-2 — le jeton d'accès est mort mais la session peut être relevée.
    try {
      await refreshSession();

      // Le rafraîchissement ne renvoie pas l'utilisateur : SimpleJWT ne fournit que des
      // jetons. On reprend donc celui du stockage. S'il manque — cas rare d'une
      // installation dont seuls les jetons ont survécu — on interroge le serveur, ce
      // qui reste conforme à A1 §15 : c'est l'exception, pas le lancement ordinaire.
      const user = storedUser ?? (await hydrateUserFromServer());
      setSession(
        user ? { status: 'authenticated', user } : { status: 'unauthenticated' },
      );
    } catch (error) {
      // BR-4 — la session est refusée. Les jetons ont déjà été purgés par le client.
      if (error instanceof AuthError) {
        setSession({ status: 'unauthenticated' });
        return;
      }

      // BR-5 — le serveur est injoignable. NE PAS déconnecter : le refresh token est
      // peut-être encore bon, seul le réseau manque. On entre avec le dernier
      // utilisateur connu, ce qui rend l'accès optimiste réellement utilisable.
      setSession(
        storedUser
          ? { status: 'authenticated', user: storedUser }
          : { status: 'unauthenticated' },
      );
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  /**
   * Branche la déconnexion forcée déclenchée depuis le client HTTP.
   *
   * Quand un rafraîchissement échoue en pleine navigation, le client purge les jetons et
   * appelle ce gestionnaire. Sans lui, l'état React resterait « connecté » alors que la
   * session est morte, et chaque écran afficherait des erreurs sans qu'on sache pourquoi.
   *
   * Le nettoyage au démontage évite de garder une référence vers un composant disparu.
   */
  useEffect(() => {
    setSessionExpiredHandler(() => setSession({ status: 'unauthenticated' }));
    return () => setSessionExpiredHandler(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await authService.login(email, password);
    setSession({ status: 'authenticated', user });
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const { user } = await authService.register(input);
    setSession({ status: 'authenticated', user });
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setSession({ status: 'unauthenticated' });
  }, []);

  /**
   * `useMemo` évite de reconstruire l'objet à chaque rendu.
   *
   * Sans lui, tout composant abonné au contexte se rerendrait à chaque rendu du
   * provider, même si la session n'a pas bougé.
   */
  const value = useMemo(
    () => ({ session, login, register, logout }),
    [session, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Reconstruit l'utilisateur depuis le serveur.
 *
 * Cas de repli uniquement : les jetons existent mais l'utilisateur stocké a disparu.
 * Renvoie `null` plutôt que de propager — à ce stade du démarrage, une erreur ferait
 * planter l'app avant tout affichage.
 */
async function hydrateUserFromServer(): Promise<AuthUser | null> {
  try {
    const profile = await authService.getMe();
    return {
      id: profile.id,
      email: profile.email,
      email_verified: profile.email_verified,
      // `PrivateUserSerializer` n'expose pas `pseudo` — correction backend en attente,
      // voir la note sur `UserProfile` dans types.ts.
      pseudo: null,
    };
  } catch {
    return null;
  }
}

/**
 * Accès à la session depuis n'importe quel composant.
 *
 * @throws si appelé hors d'un `AuthProvider` — une erreur explicite au montage vaut
 *   mieux qu'un `undefined` qui se propage et casse trois écrans plus loin.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être appelé à l’intérieur d’un <AuthProvider>.');
  }
  return context;
}
