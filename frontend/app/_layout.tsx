import '../global.css';

// Import par sous-chemin, jamais depuis la racine du package : `@expo-google-fonts/inter`
// fait un require() sur ses 18 graisses au niveau module, ce qui embarquerait ~6 Mo de
// polices inutilisees dans le bundle. Ici on ne paie que les 3 graisses du systeme.
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

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

export default function RootLayout() {
  // Les hooks restent inconditionnels : Storybook a besoin des memes polices que l'app.
  const [loaded, error] = useFonts(FONTS);

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  // Rien n'est rendu tant que les polices ne sont pas prêtes : évite le flash de
  // police système au démarrage.
  if (!loaded && !error) return null;

  if (STORYBOOK_ENABLED) {
    // require paresseux : quand le drapeau est faux, Metro a deja retire ces modules
    // du bundle, un import statique casserait la build de production.
    const StorybookUI = require('../.rnstorybook').default;
    return <StorybookUI />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
