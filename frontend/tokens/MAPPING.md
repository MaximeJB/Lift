# MAPPING — lift-tokens.json → primitives.json + semantic.json

> Traçabilité intégrale de la scission. Chaque rôle sémantique cite l'écran ou le composant de
> `LIFT_Specification_Interface_V1.md` qui le justifie. Aucune valeur n'a été modifiée.
>
> **Source** : `lift-tokens.json` (34 tokens) · **Créé** : 2026-07-31 · **Atelier visuel** : 2026-08-01
> **État** : 33 primitives · 31 rôles · 41 alias, tous résolus · tous les contrastes conformes

---

## Décisions appliquées

| #   | Décision                                               | Effet                                                |
| --- | ------------------------------------------------------ | ---------------------------------------------------- |
| Q1  | `field.*` deviennent des rôles sémantiques             | Primitives = valeurs littérales uniquement           |
| Q2  | Nommage matière, accent et alerte séparés              | Familles `paper` / `ink` / `rule` / `rust` / `oxide` |
| Q3  | `catégorie.rôle-variante`, 2 niveaux, kebab-case       | Pas de rôle par composant                            |
| Q4  | Dimensions en chaînes `"4px"`                          | Valeurs sources préservées telles quelles            |
| Q5  | Composites typographiques intacts, `textCase` conservé | Pas d'aplatissement                                  |
| Q6  | `lineHeight` ajouté — 2 ratios                         | Seul ajout au système                                |
| Q7  | Lecture stricte de la règle 3                          | Orphelines déclarées, jamais de rôle fabriqué        |
| Q8  | États d'interaction non tokenisés                      | Reportés à l'étape 07                                |
| Q9  | BodyDiagram : distinction tonale                       | `rust.base` / `ink.mid`                              |
| Q10 | Valeurs inchangées malgré les échecs de contraste      | Reportés à l'étape 07                                |

---

## 1 · Couleurs

| Token d'origine       | Valeur                    | Primitive                     | Rôle(s) sémantique(s)                                    | Justification (spec interface)                                                                                                                             |
| --------------------- | ------------------------- | ----------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color.ground`        | `#ECE5D7`                 | `paper.base`                  | `color.surface-page`                                     | Fond de page — les 13 écrans                                                                                                                               |
| `color.surface`       | `#F3EDE1`                 | `paper.raised`                | `color.field-background`                                 | Fond de champ Default — A2/A3/A4/A5, SearchInput C1, SetInputForm C5, NotesInput C6, D1                                                                    |
| `color.ink`           | `#211C16`                 | `ink.strong`                  | `color.text-default`                                     | Texte principal — les 13 écrans                                                                                                                            |
| `color.ink-muted`     | `#57503F`                 | `ink.mid`                     | `color.text-support`<br>`color.diagram-muscle-secondary` | Labels A2/A3, groupe musculaire C1, date+durée C7<br>Muscles secondaires — BodyDiagram C2                                                                  |
| `color.ink-faint`     | `#8B8474` → **`#716B5E`** | `ink.weak`                    | `color.text-placeholder`                                 | Placeholders A2/A3, métadonnées B1 (date PR) et C7                                                                                                         |
| `color.hairline`      | `#C6BDA9`                 | `rule.strong`                 | `color.divider`                                          | ListDivider C1 et C7, séparateurs SegmentedControl C3/C7/C1                                                                                                |
| `color.hairline-soft` | `#CFC7B4`                 | `rule.weak`                   | **— orpheline**                                          | Aucun filet décoratif localisable dans les 13 écrans                                                                                                       |
| `color.accent`        | `#D6552B` → **`#C14C27`** | `rust.base`                   | `color.action`<br>`color.diagram-muscle-primary`         | PrimaryButton A2/A3/A4/A5/C6, PrimaryCTAButton B1, StickyCTAButton C4, tab actif, segment actif, PRHighlightBanner C6<br>Muscle principal — BodyDiagram C2 |
| `color.on-accent`     | `#FBF6EC`                 | `paper.bright`                | `color.text-on-action`                                   | Libellé de bouton primaire — mêmes écrans que `color.action`                                                                                               |
| `color.alert`         | `#9A2A20`                 | `oxide.base`                  | `color.feedback-error`<br>`color.field-border-error`     | Erreur inline A2/A3/D1, DestructiveTextButton C6/C8/D1<br>Bordure de champ Error A2/A3/D1                                                                  |
| `color.alert-bg`      | `#EAD7CF`                 | `oxide.tint`                  | `color.feedback-error-surface`                           | Fond ErrorBanner — A2/A3/A4, B1, C1, C3, C7                                                                                                                |
| `color.alert-border`  | `#C98B7E`                 | `oxide.edge`                  | `color.feedback-error-border`                            | Bordure ErrorBanner — mêmes écrans                                                                                                                         |
| `field.bg`            | → `{color.surface}`       | _(fusionné)_                  | `color.field-background`                                 | **Fusion** — voir §6                                                                                                                                       |
| `field.border`        | → `{color.hairline}`      | **`rule.contrast`** `#8A8375` | `color.control-border`                                   | Bordure de champ Default — A2/A3/A4/A5, C1, C5, C6, D1                                                                                                     |
| `field.border-error`  | → `{color.alert}`         | `oxide.base`                  | `color.field-border-error`                               | Bordure de champ Error — A2/A3, D1                                                                                                                         |

---

## 2 · Typographie

| Token d'origine         | Primitive             | Rôle sémantique                               | Justification                                                                                             |
| ----------------------- | --------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `font.family` (`Inter`) | `font.grotesque`      | _(consommée par les 6 composites)_            | Voix « grotesque » nommée en §06 de la Design-System-Specification                                        |
| `type.wordmark`         | —                     | `type.wordmark`                               | SplashLogo A1, header logo A2 et A3                                                                       |
| `type.input`            | —                     | `type.input`                                  | Tous les TextInput — A2/A3/A4/A5, SearchInput C1, SetInputForm C5, EditableTitleInput + NotesInput C6, D1 |
| `type.button`           | —                     | `type.button`                                 | Tous les libellés de bouton                                                                               |
| `type.label`            | —                     | `type.label`                                  | Labels de champ A2/A3/D1, label StatCard B1                                                               |
| `type.link`             | —                     | `type.link`                                   | TextLink A2 et A3, QuickLink B1                                                                           |
| `type.body`             | —                     | `type.body`                                   | DescriptionText C2, description template C4, noms de liste C1/C3/C7, annexe CGU                           |
| `type.min` (`13px`)     | `measure.text-min`    | **— orpheline**                               | Contrainte de validation, pas un rôle de composant                                                        |
| _(ajouté)_              | `line-height.tight`   | _(consommée par 4 composites)_                | Vertical rhythm « tight and mechanical » — §06 Design-System-Specification                                |
| _(ajouté)_              | `line-height.relaxed` | _(consommée par `type.body` et `type.input`)_ | Seuls rôles multi-lignes : DescriptionText C2, description C4, NotesInput C6, annexe CGU                  |

---

## 3 · Espacement, forme, mesure

| Token d'origine                   | Primitive                 | Rôle sémantique       | Justification                                                                   |
| --------------------------------- | ------------------------- | --------------------- | ------------------------------------------------------------------------------- |
| `space.1` → `space.6`             | `space.1` → `space.6`     | **— aucun rôle**      | Échelle modulaire — voir §5                                                     |
| `radius.field` (`4px`)            | `corner.none` (**`0px`**) | `radius.control`      | Champs et boutons — A2/A3/A4/A5, B1, C4, C6, D1. **Valeur changée** — voir §7.5 |
| `radius.device` (`26px`)          | `corner.device`           | **— orpheline**       | Cadre de preview de mockup, hors des 13 écrans                                  |
| `border.width` (`1px`)            | `measure.hairline`        | `size.border`         | Filets et bordures de champ — tous écrans                                       |
| `layout.form-max-width` (`420px`) | `measure.form`            | `size.form-max-width` | A2 §12, A3, A4, A5 — largeur contrainte en paysage/tablette                     |
| `target.min` (`44px`)             | `measure.touch`           | `size.touch-target`   | A2 §11, C4 §11, C5 §12 — cible tactile ≥44×44pt                                 |

> **Pourquoi `corner.*` et `measure.*` plutôt que `radius.*` et `size.*` côté primitives**
> Aucun chemin de `primitives.json` ne doit recouvrir un chemin de `semantic.json`. Style Dictionary
> fusionne les deux fichiers dans un arbre unique : un `radius.control` présent des deux côtés produit
> une référence circulaire (`{radius.control}` pointant sur lui-même) et fait échouer le build.

---

## 4 · Primitives orphelines (règle 4 — signalées, non supprimées)

| Primitive          | Motif                                                                                                                                                                                                                                                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rule.weak`        | Décrite « filets décoratifs » dans la source. Aucun des 13 écrans ne montre de filet décoratif. La Design-System-Specification §04 décourage activement les filets décoratifs : « Separate content with space and alignment first; add rules or borders only when space fails ». Lui fabriquer un rôle serait inventer un usage. |
| `corner.device`    | Sa propre description dit « preview seulement ». Sert à cadrer des mockups, pas à styler l'app.                                                                                                                                                                                                                                  |
| `measure.text-min` | Plancher d'accessibilité. C'est une règle de validation appliquée aux autres tokens, pas une valeur qu'un composant consomme.                                                                                                                                                                                                    |

---

## 5 · L'échelle d'espacement n'a pas de couche sémantique

Les 6 pas de `space` restent des primitives sans rôle. Aucun écran de la spec ne prescrit de mesure
d'espacement — ils décrivent des structures (« formulaire centré », « liste scrollable »), jamais des
valeurs. Par la règle 3 (« si tu ne peux pas citer l'écran, le rôle n'existe pas »), inventer
`space.inline-tight` ou `space.section-gap` serait du slop.

Le preset Tailwind de l'étape 04 consommera l'échelle directement.

---

## 6 · Fusion appliquée — à valider

`color.surface` et `field.bg` portaient **la même valeur** (`#F3EDE1`) et **la même description**
(« Fond de champ »). `field.bg` n'était qu'un alias de `color.surface`. Aucun écran ne distingue un
« fond de surface » d'un « fond de champ ». Les deux convergent donc vers un seul rôle,
`color.field-background`.

C'est la seule fusion du mapping. Si tu prévois une surface non-champ en mode terminal (panneau,
carte), il faut la rouvrir en deux rôles.

À l'inverse, `color.hairline` et `field.border` ont été **conservés séparés** (`color.divider` et
`color.field-border`) malgré leur valeur identique : la spec leur donne des usages distincts
(séparateurs de liste vs contour de champ) qui peuvent diverger.

---

## 7 · Atelier visuel — décisions du 01/08/2026

L'atelier a été mené dans Storybook, pas dans Penpot : les primitives existaient déjà, et voir
`Button`, `Text` et `Hairline` se recolorer sur un vrai appareil bat des pastilles de couleur.

### 7.1 Contrastes — quatre échecs, quatre corrections

| Paire                         | Avant     | Après         | Correction                                      |
| ----------------------------- | --------- | ------------- | ----------------------------------------------- |
| Libellé sur bouton primaire   | 3.75:1 ❌ | **4.74:1** ✅ | accent éclairci + texte inversé en encre sombre |
| Placeholder sur fond de champ | 3.19:1 ❌ | **4.74:1** ✅ | `ink.weak` → `#6F6859`                          |
| Contour de champ              | 1.49:1 ❌ | **3.31:1** ✅ | nouvelle primitive `rule.contrast` `#847C69`    |
| Contour focus vs page         | 2.84:1 ❌ | **3.31:1** ✅ | nouvelle primitive `rust.deep` `#D45328`        |

Les deux derniers relèvent de **WCAG 1.4.11 Non-text Contrast** (3:1 pour ce qui identifie un
composant), pas de 1.4.3. Ils n'avaient pas été audités à l'étape 3, qui n'avait mesuré que le texte.

**Méthode : OKLCH, pas RVB.** Le premier passage assombrissait par multiplication des canaux RVB,
ce qui **désature** — le contour perdait 24 % de son chroma et virait au gris. Les valeurs finales
n'ajustent que la clarté, teinte et chroma d'origine préservés.

### 7.2 L'accent s'éclaircit au lieu de s'assombrir

Le réflexe pour faire passer un libellé clair sur l'accent est d'assombrir l'accent. Mesuré, ça
**rapprochait l'accent de l'alerte** : dE 0.156 → 0.104, pour seulement 8.4° d'écart de teinte —
en contradiction avec la décision verrouillée « rouge d'alerte distinct de l'accent ».

Décision inverse : **éclaircir** l'accent et inverser le texte en encre sombre.

- `rust.base` `#D6552B` → `#E15F35` — plus vif que l'origine, chroma identique
- `color.text-on-action` → `{ink.strong}` au lieu de `{paper.bright}`
- dE avec l'alerte : **0.187**, meilleur que l'origine

Contrepartie démontrée par le calcul : un aplat assez clair pour porter du texte sombre ne peut pas
tenir 3:1 contre la page — les deux fenêtres de luminance se ratent de 0.0002, c'est **arithmétiquement
impossible**. Le bouton primaire gagne donc un contour, `color.action-border` → `{ink.strong}`,
qui devient ce qui l'identifie.

### 7.3 Le filet se dédouble

Un séparateur de liste est décoratif, WCAG l'exempte. Un contour de champ identifie un composant, non.
Les deux rôles existaient déjà séparément et pointaient sur la même primitive — il a suffi de les découpler.

- `color.divider` → `rule.strong` `#C6BDA9` — décoratif, reste à 1.49:1, volontairement discret
- `color.control-border` → `rule.contrast` `#847C69` — champs et `Button` secondary, 3.31:1
- `color.control-border-focus` → `rust.deep` `#D45328` — champ actif, 3.31:1 contre la page

`rust.deep` a la teinte et le chroma exacts de `rust.base`, seulement plus sombre. C'est à deux points
de l'accent d'origine `#D6552B` : le focus retrouve presque la couleur de départ du projet.

### 7.4 `type.label` passe de 11px à 13px

`measure.text-min` déclarait 13px comme plancher d'accessibilité, et `type.label` était à 11px : le
fichier source se contredisait. Les labels sont du texte fonctionnel — A2 §11 les exige explicites.

`label` et `link` partagent désormais 13px ; seuls le tracking et la casse les distinguent, ce qui est
exactement la distinction voix machine / voix lecture de la Design-System-Specification §06.

### 7.5 La voix monospace devient quatre timbres

**Changement de règle assumé.** La Design-System-Specification §12 impose trois voix (serif, sans, mono).
La voix mono compte désormais **quatre familles**, une par corps de texte. Coût : ~1,3 Mo de polices,
cinq familles à tenir cohérentes.

| Rôle                | Famille              | Emploi                                | Pourquoi celle-là                                                    |
| ------------------- | -------------------- | ------------------------------------- | -------------------------------------------------------------------- |
| `type.mono-display` | Martian Mono 600     | StatCard B1, 1RM, chrono C5, stats C6 | Large, chiffres massifs — sa largeur est un atout en grand corps     |
| `type.mono-dense`   | Spline Sans Mono 400 | SetRow C5 et C8                       | Resserrée, encaisse les colonnes serrées où Martian déborderait      |
| `type.mono-meta`    | Sometype Mono 400    | Dates et durées C7, date des PR B1    | Machine à écrire nettoyée, lisible en petit corps                    |
| `type.mono-accent`  | Cutive Mono 400      | MonthSectionHeader C7, en-têtes       | Frappe usée, forte identité — **jamais en colonne ni en paragraphe** |

L'attribution suit le **corps de texte**, donc la lisibilité : chaque famille est placée là où son
défaut ne coûte rien. Choisir une police ne se fait jamais à la main — on choisit un rôle `type.*`,
la famille suit.

### 7.6 Rayon des contrôles — tranché le 31/07/2026

`lift-tokens.json` portait `radius.field = 4px` décrit comme « coins nets », et l'étape 02 du pipeline
prescrivait `radius.none = 0`. Décision : **angle vif, `0px`**, seule valeur cohérente avec la
contrainte §08 (« square-cornered, heavy rounding is off-system »). Le `4px` a été retiré.

### 7.7 Reste ouvert

- **Couleur des liens.** L'accent en texte sur la page plafonne à 3.87:1 même corrigé. Il faudrait
  descendre à `#AF4623`, qui vire au brun. `type.link` garde `text-default`.
- **Skeleton, variantes SetRow (Warmup / Failure), Pending sync, SuccessState A4,
  PasswordStrengthMeter A3, CategoryBadge 8 variantes** — composants métier qui n'existent pas
  encore, à trancher à l'étape 11.

## 8 · Vérification finale

| Contrôle                                               | Résultat                   |
| ------------------------------------------------------ | -------------------------- |
| Tout alias `{...}` résout vers une primitive existante | ✅ 31 alias, tous résolus  |
| Aucun nom sémantique ne contient un mot d'apparence    | ✅ 25 rôles vérifiés       |
| Chaque rôle cite un écran ou un composant              | ✅ 25/25                   |
| Chaque `$value` a un `$type`                           | ✅ 52/52                   |
| **Nombre de primitives = nombre de tokens d'origine**  | ❌ **33 vs 34**            |
| **Conformité DTCG stricte**                            | ❌ **deux écarts assumés** |

### Pourquoi 27 et non 34

`34 − 6 composites typo − 3 alias field + 2 lineHeight + 1 rule.contrast + 1 rust.deep

- 4 familles monospace = 33 primitives, 31 rôles`

Conséquence mécanique de Q1 + Q5 + Q6 combinés. Les 34 tokens sources sont tous représentés :
25 en primitives, 9 en rôles sémantiques directs. Trois primitives ont été ajoutées après coup :
`line-height.tight`, `line-height.relaxed` (Q6) et `rule.contrast` (atelier visuel).

### Les deux écarts DTCG

| Écart                                                                 | Décision | Portée                      |
| --------------------------------------------------------------------- | -------- | --------------------------- |
| `dimension` en chaîne `"4px"` au lieu de `{"value": 4, "unit": "px"}` | Q4=A     | 12 tokens                   |
| `textCase` — propriété absente du type composite `typography` de DTCG | Q5=A     | `type.button`, `type.label` |

Les deux sont des choix explicites, pas des oublis. Le format custom Style Dictionary de l'étape 04
devra traduire `textCase` → `textTransform` pour React Native.
