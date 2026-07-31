/**
 * LIFT — compilation des design tokens vers un preset Tailwind.
 *
 *   tokens/primitives.json  ─┐
 *                            ├─→  src/shared/theme/tailwind-tokens.js  →  tailwind.config.js
 *   tokens/semantic.json    ─┘
 *
 * Regle : les composants consomment des ROLES (color.action), jamais des valeurs
 * (rust.base). Seule exception, l'echelle `space` qui n'a pas de couche semantique
 * — aucun ecran de la spec ne prescrit de mesure d'espacement (voir MAPPING.md §5).
 *
 * Lancer : npm run tokens:build
 */

/** Les cles de premier niveau attendues. Si l'une disparait de la source, le build
 *  echoue au lieu d'emettre silencieusement un preset ampute. */
const REQUIRED = ['color', 'type', 'space', 'radius', 'size', 'font', 'line-height'];

const px = (v) => (typeof v === 'number' ? `${v}px` : String(v));

/**
 * React Native ne combine PAS fontFamily + fontWeight sur des fichiers de police
 * statiques : chaque graisse est une famille distincte. On derive donc le nom de
 * famille reellement charge par expo-font a partir de la graisse du composite.
 * Convention de nommage @expo-google-fonts : `Inter_600SemiBold`.
 *
 * Cette table ne contient QUE les graisses reellement presentes dans tokens/.
 * Elle n'est volontairement pas exhaustive : une graisse absente doit faire echouer
 * le build, pas passer en silence. Sans ca, ajouter un token en 500 compilerait
 * proprement, la police ne serait pas chargee, et le texte retomberait sur la police
 * systeme sans le moindre avertissement.
 */
const WEIGHT_SUFFIX = {
  400: 'Regular',
  600: 'SemiBold',
  700: 'Bold',
};

export default {
  usesDtcg: true,
  source: ['tokens/**/*.json'],

  hooks: {
    formats: {
      'lift/tailwind-preset': ({ dictionary }) => {
        // Regroupe les tokens par leur premier segment de chemin.
        const byRoot = new Map();
        for (const t of dictionary.allTokens) {
          const root = t.path[0];
          if (!byRoot.has(root)) byRoot.set(root, []);
          byRoot.get(root).push(t);
        }

        const missing = REQUIRED.filter((k) => !byRoot.has(k));
        if (missing.length) {
          throw new Error(
            `[lift/tailwind-preset] Groupes de tokens absents : ${missing.join(', ')}.\n` +
              `Le preset serait incomplet. Verifie tokens/primitives.json et tokens/semantic.json.`
          );
        }

        /** Cle Tailwind = chemin sans son premier segment. color.feedback-error → feedback-error */
        const leaf = (t) => t.path.slice(1).join('-');
        const val = (t) => t.$value ?? t.value;

        const pick = (root, fn) =>
          Object.fromEntries((byRoot.get(root) ?? []).map((t) => [leaf(t), fn(t)]));

        // ── Couleurs : uniquement les roles semantiques ──────────────────────
        const colors = {
          ...pick('color', (t) => val(t)),
          // Mot-cle CSS, pas un design token. Indispensable : le theme etant ferme
          // (theme.colors et non theme.extend.colors), son absence rendrait
          // `bg-transparent` inexistant.
          transparent: 'transparent',
        };

        // ── Typographie : les 6 composites, decomposes pour Tailwind ─────────
        const typeTokens = byRoot.get('type') ?? [];
        const fontSize = {};
        const fontFamily = {};
        const letterSpacing = {};
        const typography = {};

        for (const t of typeTokens) {
          const key = leaf(t);
          const v = val(t);
          if (typeof v !== 'object' || v === null) continue;

          const suffix = WEIGHT_SUFFIX[Number(v.fontWeight)];
          if (!suffix) {
            throw new Error(
              `[lift/tailwind-preset] type.${key} declare la graisse ${v.fontWeight}, ` +
                `absente du systeme.\n` +
                `  Graisses declarees : ${Object.keys(WEIGHT_SUFFIX).join(', ')}.\n` +
                `  Ajouter une graisse est une decision, pas un effet de bord. Pour le faire :\n` +
                `    1. etendre WEIGHT_SUFFIX dans style-dictionary.config.mjs\n` +
                `       (nom @expo-google-fonts : 500 = Medium, 300 = Light, 800 = ExtraBold...)\n` +
                `    2. charger la police correspondante dans app/_layout.tsx (objet FONTS)\n` +
                `  Sans l'etape 2, le texte retombe silencieusement sur la police systeme.`
            );
          }
          // ex. Inter + 600 → "Inter_600SemiBold" : le nom sous lequel expo-font
          // enregistre la police. Doit correspondre EXACTEMENT a la cle passee a
          // useFonts() dans app/_layout.tsx, sinon repli silencieux sur la police
          // systeme, sans le moindre avertissement.
          const family = `${v.fontFamily}_${v.fontWeight}${suffix}`;

          fontSize[key] = px(v.fontSize);
          fontFamily[key] = [family];
          letterSpacing[key] = px(v.letterSpacing);

          // Composite complet pour le composant Text de l'etape 06. `textCase` est
          // une extension hors DTCG (decision Q5) que Text traduit en textTransform.
          typography[key] = {
            fontFamily: family,
            fontSize: px(v.fontSize),
            fontWeight: String(v.fontWeight),
            letterSpacing: px(v.letterSpacing),
            lineHeight: String(v.lineHeight),
            ...(v.textCase ? { textCase: v.textCase } : {}),
          };
        }

        // Liste dedupliquee des familles a charger par expo-font.
        const fontsToLoad = [...new Set(Object.values(typography).map((t) => t.fontFamily))].sort();

        // ── Mesures ponctuelles : un role Tailwind chacune ───────────────────
        const sizeByLeaf = Object.fromEntries(
          (byRoot.get('size') ?? []).map((t) => [leaf(t), val(t)])
        );
        const need = (k) => {
          if (!(k in sizeByLeaf)) throw new Error(`[lift/tailwind-preset] size.${k} absent`);
          return sizeByLeaf[k];
        };

        const preset = {
          colors,
          spacing: pick('space', (t) => val(t)),
          borderRadius: pick('radius', (t) => val(t)),
          borderWidth: { hairline: need('border') },
          // Une famille par role, pas par graisse : cf. WEIGHT_SUFFIX ci-dessus.
          // `fontWeight` n'est volontairement PAS expose en theme Tailwind — il serait
          // inoperant en React Native, et `font-*` sert deja a fontFamily.
          fontFamily,
          fontsToLoad,
          fontSize,
          letterSpacing,
          lineHeight: pick('line-height', (t) => String(val(t))),
          minHeight: { touch: need('touch-target') },
          maxWidth: { form: need('form-max-width') },
          typography,
        };

        const header = [
          '// Genere par Style Dictionary. NE PAS EDITER A LA MAIN.',
          '// Source : tokens/primitives.json + tokens/semantic.json',
          '// Regenerer : npm run tokens:build',
          '',
        ].join('\n');

        return `${header}module.exports = ${JSON.stringify(preset, null, 2)};\n`;
      },
    },
  },

  platforms: {
    tailwind: {
      // name/kebab garantit des noms de sortie uniques (sinon paper.base, rust.base
      // et oxide.base collisionnent tous sur "base"). Le format lit token.path,
      // pas token.name, mais ce transform supprime le warning de collision.
      transforms: ['name/kebab'],
      buildPath: 'src/shared/theme/',
      files: [
        {
          destination: 'tailwind-tokens.js',
          format: 'lift/tailwind-preset',
        },
      ],
    },
  },
};
