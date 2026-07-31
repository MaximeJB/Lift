import type { StorybookConfig } from '@storybook/react-native-web-vite';

/**
 * Config Storybook — rendu WEB (navigateur), pour itérer vite.
 *
 * Le glob de stories est identique à celui de .rnstorybook/main.ts : une story écrite
 * une fois s'affiche des deux côtés.
 *
 * ATTENTION : react-native-web ne rend pas à l'identique du natif. `StyleSheet.hairlineWidth`
 * n'a pas d'équivalent exact, les ombres et certains cas flex divergent. Le web sert à
 * itérer ; la validation d'un composant se fait sur le téléphone (npm run storybook).
 */
const main: StorybookConfig = {
  stories: ['../src/**/*.stories.?(ts|tsx|js|jsx)'],
  framework: {
    name: '@storybook/react-native-web-vite',
    options: {},
  },
};

export default main;
