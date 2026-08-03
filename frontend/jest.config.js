/**
 * Tests unitaires du frontend.
 *
 * `jest-expo` fournit la transformation TypeScript et les mocks des modules natifs
 * d'Expo. Sans lui, le moindre import de `expo-secure-store` ferait échouer un test qui
 * n'y touche pourtant pas.
 *
 * `testMatch` ne couvre que `src/`, et ce n'est pas un oubli : expo-router transforme
 * TOUT fichier de `app/` en route. Un `login.test.tsx` posé à côté de `login.tsx`
 * deviendrait une page de l'application.
 *
 * Les tests d'écran vivent donc dans `src/ecrans/` et importent depuis `app/`. La
 * couverture, elle, mesure bien les deux dossiers.
 */
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'app/**/*.tsx',
    '!src/**/*.stories.tsx',
    '!src/shared/theme/**',
  ],

  /**
   * SEUILS EN CLIQUET. Les valeurs globales sont celles atteintes le 03/08/2026, arrondies
   * au point inférieur : elles ne servent pas à viser un objectif, mais à empêcher de
   * redescendre. On les REMONTE quand la couverture monte, jamais l'inverse.
   *
   * Les deux seuils par fichier valent plus que le global. `stats.ts` porte les formules
   * que B1, C6 et C8 affichent — le tableau de traçabilité de la Phase 5 exige qu'elles
   * soient identiques partout, et ces tests sont ce qui l'empêche de dériver. Les
   * primitives, elles, sont la base de treize écrans.
   *
   * Attention au calcul : Jest RETIRE du groupe `global` tout fichier couvert par un seuil
   * nommé. Les valeurs ci-dessous sont donc celles du reste du code (83,58%), pas les
   * 84,42% du rapport complet. Ajouter un seuil par fichier fait mécaniquement bouger le
   * global — c'est attendu, pas une régression.
   */
  coverageThreshold: {
    global: {
      statements: 83,
      branches: 76,
      functions: 76,
      lines: 85,
    },
    './src/workout/stats.ts': {
      statements: 95,
      branches: 95,
      functions: 94,
      lines: 98,
    },
    './src/shared/components/primitives/': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
};
