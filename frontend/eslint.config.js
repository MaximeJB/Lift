const expo = require('eslint-config-expo/flat');
const reactNative = require('eslint-plugin-react-native');

/**
 * LIFT — verrouillage anti-slop.
 *
 * Ces règles ne sont pas du confort : elles rendent mécaniquement impossible ce que le
 * design system interdit par convention. Une convention se contourne, une erreur de
 * build non.
 *
 * Elles complètent deux autres garde-fous :
 *   - le thème Tailwind FERMÉ (tailwind.config.js) — aucune valeur hors tokens
 *   - `npm run check:classes` — aucune classe inexistante
 *
 * Et un garde-fou humain : SLOP.md, le barème appliqué à toute proposition visuelle.
 */
module.exports = [
  ...expo,

  { ignores: ['src/shared/theme/**', '.rnstorybook/storybook.requires.ts', '.sb-check/**'] },

  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-native': reactNative },
    rules: {
      /**
       * Ferme la dernière porte de sortie du thème fermé.
       *
       * Tailwind empêche d'écrire une valeur hors tokens en CLASSE ; `style` permettait
       * encore de l'écrire à la main.
       *
       * PORTEE REELLE, mesuree le 01/08/2026 : la regle ne flagge que les valeurs
       * LITTERALES. Elle attrape `style={{ padding: 13 }}` mais laisse passer
       * `const s = { padding: 13 }; style={s}` et `style={{ height: N }}`.
       * C'est donc un garde-fou contre les nombres magiques ecrits a la volee, pas un
       * scellement hermetique. Le vrai verrou reste le theme ferme.
       *
       * DÉROGATION UNIQUE : Hairline.tsx. `StyleSheet.hairlineWidth` vaut 0,5 ou 0,33
       * selon la densité de l'écran — inexprimable en classe. Elle n'a PAS besoin d'un
       * eslint-disable, justement parce que la valeur n'est pas littérale ; le fichier
       * porte l'explication en commentaire, ce qui reste la vraie documentation.
       */
      'react-native/no-inline-styles': 'error',

      /**
       * Tout texte passe par le composant Text de src/shared/components/primitives.
       *
       * C'est ce qui rend les polices et l'échelle typographique pilotables depuis
       * tokens/. Un `<Text>` de React Native utilisé directement échapperait au système.
       */
      'react-native/no-raw-text': [
        'error',
        // Ces composants prennent une chaine en `children` et la rendent EUX-MEMES
        // via <Text>. Les omettre ferait echouer chaque <Button>Envoyer</Button>.
        { skip: ['Text', 'Button', 'TextLink', 'Badge', 'SectionHeader'] },
      ],

      /**
       * Redondant avec le thème fermé, gardé en ceinture et bretelles : une couleur
       * littérale dans un StyleSheet ne passerait pas non plus.
       */
      'react-native/no-color-literals': 'error',

      /**
       * Ferme la fuite de `no-raw-text`.
       *
       * Cette règle-là ne distingue pas notre `Text` de celui de React Native : les
       * deux portent le même nom, et mettre « Text » dans `skip` les autorise tous
       * les deux. Vérifié : `import { Text } from 'react-native'` passait sans erreur.
       *
       * Interdire l'import à la source est le seul moyen de rendre la règle
       * « tout texte passe par notre Text » réellement mécanique.
       */
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: ['Text'],
              message:
                "Utilise le Text de src/shared/components/primitives : il porte l'échelle typographique et les polices du système.",
            },
          ],
        },
      ],
    },
  },

  {
    // Le seul fichier autorisé à envelopper le Text de React Native.
    files: ['src/shared/components/primitives/Text.tsx'],
    rules: { 'no-restricted-imports': 'off' },
  },

  {
    // Les stories composent des maquettes : elles ont besoin de View et de Text de RN
    // pour montrer ce qu'un composant produit, sans passer par le composant lui-même.
    files: ['**/*.stories.tsx'],
    rules: { 'react-native/no-raw-text': 'off' },
  },
];
