import '../global.css';

// Import par sous-chemin, jamais depuis la racine du package : `@expo-google-fonts/inter`
// fait un require() sur ses 18 graisses au niveau module, ce qui embarquerait ~6 Mo de
// polices inutilisees dans le bundle. Ici on ne paie que les 3 graisses du systeme.
import { CutiveMono_400Regular } from '@expo-google-fonts/cutive-mono/400Regular';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { MartianMono_600SemiBold } from '@expo-google-fonts/martian-mono/600SemiBold';
import { SometypeMono_400Regular } from '@expo-google-fonts/sometype-mono/400Regular';
import { SplineSansMono_400Regular } from '@expo-google-fonts/spline-sans-mono/400Regular';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '../src/shared/context/AuthContext';
import tokens from '../src/shared/theme/tailwind-tokens';

/**
 * Les clés de cet objet sont les noms sous lesquels expo-font enregistre les polices.
 * Elles doivent correspondre EXACTEMENT aux familles du preset Tailwind — un nom mal
 * orthographié ne lève aucune erreur : le texte retombe silencieusement sur la police
 * système. D'où l'assertion ci-dessous, dérivée des tokens.
 */
const FONTS = {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  MartianMono_600SemiBold,
  SplineSansMono_400Regular,
  SometypeMono_400Regular,
  CutiveMono_400Regular,
};

if (__DEV__) {
  const declared = new Set<string>(tokens.fontsToLoad);
  const loaded = new Set(Object.keys(FONTS));
  const missing = [...declared].filter((f) => !loaded.has(f));
  const extra = [...loaded].filter((f) => !declared.has(f));
  if (missing.length || extra.length) {
    console.error(
      '[lift] Désaccord polices ↔ tokens.\n' +
        (missing.length ? `  Déclarées dans les tokens mais non chargées : ${missing.join(', ')}\n` : '') +
        (extra.length ? `  Chargées mais absentes des tokens : ${extra.join(', ')}\n` : '') +
        '  Corrige app/_layout.tsx, ou relance `npm run tokens:build`.'
    );
  }
}

/**
 * Bascule app ↔ Storybook. Le meme drapeau pilote metro.config.js, ou `enabled: false`
 * retire Storybook du bundle — l'app de production ne l'embarque donc jamais.
 * Lancer Storybook : npm run storybook
 */
const STORYBOOK_ENABLED = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true';

SplashScreen.preventAutoHideAsync();

/**
 * A1 — Auth Gate.
 *
 * Cet écran n'en est pas un : c'est l'absence d'écran pendant que la session se résout.
 * A1 §16 : « ne s'affiche jamais plus de quelques secondes, ne contient jamais d'action
 * utilisateur, est toujours suivi d'une redirection ».
 *
 * `Stack.Protected` RETIRE les routes du navigateur au lieu de rediriger vers elles.
 * Conséquence directe : aucun clignotement, et surtout aucune fenêtre pendant laquelle
 * un utilisateur déconnecté verrait les onglets avant d'être renvoyé au Login.
 *
 * L'écran de démarrage natif reste affiché tant que les polices ET la session ne sont
 * pas résolues — sans quoi on verrait un fond nu, puis les polices, puis la redirection.
 */
function RootNavigator({ fontsReady }: { fontsReady: boolean }) {
  const { session } = useAuth();

  const pret = fontsReady && session.status !== 'loading';

  useEffect(() => {
    if (pret) SplashScreen.hideAsync();
  }, [pret]);

  if (!pret) return null;

  const connecte = session.status === 'authenticated';

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={connecte}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      <Stack.Protected guard={!connecte}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      {/*
        HORS DES DEUX GARDES, à dessein. Ces deux écrans sont atteignables dans les deux
        états de session : depuis la case de consentement d'A3 avant l'inscription, et
        depuis le menu Paramètres une fois connecté — décision du 02/08/2026. Les placer
        dans `(auth)` les aurait rendus introuvables au premier utilisateur inscrit,
        puisque `Stack.Protected` RETIRE les routes du navigateur au lieu de les masquer.
      */}
      <Stack.Screen name="cgu" />
      <Stack.Screen name="confidentialite" />
    </Stack>
  );
}

export default function RootLayout() {
  // Les hooks restent inconditionnels : Storybook a besoin des memes polices que l'app.
  const [loaded, error] = useFonts(FONTS);
  const fontsReady = loaded || Boolean(error);

  // Storybook n'a pas de session à attendre : l'écran de démarrage se retire dès que
  // les polices sont prêtes. Sans ça, le catalogue resterait masqué indéfiniment —
  // `preventAutoHideAsync` est appelé au niveau module, et seul RootNavigator le lève.
  useEffect(() => {
    if (STORYBOOK_ENABLED && fontsReady) SplashScreen.hideAsync();
  }, [fontsReady]);

  if (STORYBOOK_ENABLED) {
    // require paresseux : quand le drapeau est faux, Metro a deja retire ces modules
    // du bundle, un import statique casserait la build de production.
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- import statique impossible ici
    const StorybookUI = require('../.rnstorybook').default;
    return (
      <SafeAreaProvider>
        <SafeAreaView edges={['top']} className="flex-1 bg-surface-page">
          <StatusBar style="dark" />
          <StorybookUI />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  /**
   * L'ENCOCHE EST TRAITÉE ICI, UNE FOIS, POUR TOUS LES ÉCRANS.
   *
   * `headerShown: false` est posé sur toutes les piles — chaque écran dessine son propre
   * en-tête. Conséquence mécanique : plus rien n'écarte le contenu de la barre d'état, et
   * il démarre à y=0, sous l'encoche. Sur un iPhone 12 mini, ce sont 50pt de contenu
   * masqués, et surtout intappables : la barre d'état capte les touchers.
   *
   * Un `SafeAreaView` par écran serait la même chose écrite treize fois, avec l'oubli
   * garanti au quatorzième. `useSafeAreaInsets` + padding manuel imposerait en plus une
   * valeur de marge à chaque écran, ce que le thème fermé rend justement impossible.
   *
   * `edges={['top']}` seulement : le bas appartient à `TabBar`, qui pose son propre
   * `SafeAreaView edges={['bottom']}` pour que sa matière coure jusqu'au bord. Deux
   * `SafeAreaView` imbriqués ADDITIONNENT leurs marges — mettre `bottom` ici doublerait
   * l'écart sous la barre d'onglets.
   *
   * `SafeAreaProvider` est explicite plutôt que légué par React Navigation : Storybook,
   * lui, n'a aucun navigateur au-dessus.
   *
   * AuthProvider enveloppe la navigation, PAS Storybook : le catalogue de composants n'a
   * aucune session et ne doit pas déclencher d'appel réseau au montage.
   */
  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['top']} className="flex-1 bg-surface-page">
        {/* Encre sombre sur papier chaud : `auto` retomberait sur le thème du système,
            qui n'a aucun rapport avec le fond de l'app. */}
        <StatusBar style="dark" />
        <AuthProvider>
          <RootNavigator fontsReady={fontsReady} />
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
