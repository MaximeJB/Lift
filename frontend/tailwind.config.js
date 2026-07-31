const tokens = require('./src/shared/theme/tailwind-tokens');

/**
 * LIFT — thème FERMÉ.
 *
 * Les clés ci-dessous sont sous `theme`, pas sous `theme.extend`. La différence est
 * le levier anti-slop de tout le projet :
 *
 *   theme.extend.colors  →  bg-action fonctionne ET bg-red-500 aussi
 *   theme.colors         →  bg-action fonctionne, bg-red-500 n'existe pas
 *
 * Le design system n'est donc pas une convention qu'on peut contourner, c'est le seul
 * vocabulaire exprimable. Si une classe semble manquer, c'est un token manquant :
 * on l'ajoute dans tokens/, on relance `npm run tokens:build`. Jamais de valeur en dur.
 *
 * Ne jamais rouvrir une de ces clés en `extend` par facilité.
 */
module.exports = {
  // Les configs Storybook contiennent du JSX avec des className (les décorateurs).
  // Sans elles dans ce glob, Tailwind ne génère pas ces classes et Storybook s'affiche
  // sans style — sans le moindre message d'erreur.
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './.storybook/**/*.{ts,tsx}',
    './.rnstorybook/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],

  theme: {
    // ── Remplacements : la valeur par défaut de Tailwind disparaît ──────────
    colors: tokens.colors,
    spacing: tokens.spacing,
    borderRadius: tokens.borderRadius,
    borderWidth: tokens.borderWidth,
    // Une famille par rôle typographique (font-body, font-button…), chacune pointant
    // vers la police réellement chargée par expo-font. `fontWeight` n'est pas exposé :
    // React Native ne l'honore pas sur des fichiers de police statiques, et `font-*`
    // est déjà pris par fontFamily.
    fontFamily: tokens.fontFamily,
    fontSize: tokens.fontSize,
    letterSpacing: tokens.letterSpacing,
    lineHeight: tokens.lineHeight,

    // ── Ajouts : on conserve les utilitaires structurels de Tailwind ────────
    // min-h-0 / min-h-full et max-w-full restent utiles et ne portent aucune
    // décision de design.
    extend: {
      minHeight: tokens.minHeight,
      maxWidth: tokens.maxWidth,
    },
  },
};
