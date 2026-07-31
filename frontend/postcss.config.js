/**
 * Chaine PostCSS pour le rendu WEB de Storybook uniquement.
 *
 * Le rendu natif n'en a pas besoin : NativeWind compile Tailwind via son transformer
 * Metro. Vite, lui, ne sait pas traiter `@tailwind` tout seul — sans ce fichier,
 * global.css sort tel quel et Storybook web affiche les composants SANS AUCUN STYLE,
 * silencieusement.
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
