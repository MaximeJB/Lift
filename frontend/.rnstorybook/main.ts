import type { StorybookConfig } from '@storybook/react-native';

/**
 * Config Storybook — rendu NATIF (téléphone).
 *
 * Le glob de stories est identique à celui de .storybook/main.ts (rendu web) :
 * une story écrite une fois s'affiche des deux côtés. Ne jamais les désynchroniser.
 */
const main: StorybookConfig = {
  stories: ['../src/**/*.stories.?(ts|tsx|js|jsx)'],
};

export default main;
