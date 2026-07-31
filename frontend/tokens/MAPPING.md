# MAPPING — lift-tokens.json → primitives.json + semantic.json

> Traçabilité intégrale de la scission. Chaque rôle sémantique cite l'écran ou le composant de
> `LIFT_Specification_Interface_V1.md` qui le justifie. Aucune valeur n'a été modifiée.
>
> **Source** : `lift-tokens.json` (34 tokens) · **Date** : 2026-07-31

---

## Décisions appliquées

| # | Décision | Effet |
|---|---|---|
| Q1 | `field.*` deviennent des rôles sémantiques | Primitives = valeurs littérales uniquement |
| Q2 | Nommage matière, accent et alerte séparés | Familles `paper` / `ink` / `rule` / `rust` / `oxide` |
| Q3 | `catégorie.rôle-variante`, 2 niveaux, kebab-case | Pas de rôle par composant |
| Q4 | Dimensions en chaînes `"4px"` | Valeurs sources préservées telles quelles |
| Q5 | Composites typographiques intacts, `textCase` conservé | Pas d'aplatissement |
| Q6 | `lineHeight` ajouté — 2 ratios | Seul ajout au système |
| Q7 | Lecture stricte de la règle 3 | Orphelines déclarées, jamais de rôle fabriqué |
| Q8 | États d'interaction non tokenisés | Reportés à l'étape 07 |
| Q9 | BodyDiagram : distinction tonale | `rust.base` / `ink.mid` |
| Q10 | Valeurs inchangées malgré les échecs de contraste | Reportés à l'étape 07 |

---

## 1 · Couleurs

| Token d'origine | Valeur | Primitive | Rôle(s) sémantique(s) | Justification (spec interface) |
|---|---|---|---|---|
| `color.ground` | `#ECE5D7` | `paper.base` | `color.surface-page` | Fond de page — les 13 écrans |
| `color.surface` | `#F3EDE1` | `paper.raised` | `color.field-background` | Fond de champ Default — A2/A3/A4/A5, SearchInput C1, SetInputForm C5, NotesInput C6, D1 |
| `color.ink` | `#211C16` | `ink.strong` | `color.text-default` | Texte principal — les 13 écrans |
| `color.ink-muted` | `#57503F` | `ink.mid` | `color.text-support`<br>`color.diagram-muscle-secondary` | Labels A2/A3, groupe musculaire C1, date+durée C7<br>Muscles secondaires — BodyDiagram C2 |
| `color.ink-faint` | `#8B8474` | `ink.weak` | `color.text-placeholder` | Placeholders A2/A3, métadonnées B1 (date PR) et C7 |
| `color.hairline` | `#C6BDA9` | `rule.strong` | `color.divider` | ListDivider C1 et C7, séparateurs SegmentedControl C3/C7/C1 |
| `color.hairline-soft` | `#CFC7B4` | `rule.weak` | **— orpheline** | Aucun filet décoratif localisable dans les 13 écrans |
| `color.accent` | `#D6552B` | `rust.base` | `color.action`<br>`color.diagram-muscle-primary` | PrimaryButton A2/A3/A4/A5/C6, PrimaryCTAButton B1, StickyCTAButton C4, tab actif, segment actif, PRHighlightBanner C6<br>Muscle principal — BodyDiagram C2 |
| `color.on-accent` | `#FBF6EC` | `paper.bright` | `color.text-on-action` | Libellé de bouton primaire — mêmes écrans que `color.action` |
| `color.alert` | `#9A2A20` | `oxide.base` | `color.feedback-error`<br>`color.field-border-error` | Erreur inline A2/A3/D1, DestructiveTextButton C6/C8/D1<br>Bordure de champ Error A2/A3/D1 |
| `color.alert-bg` | `#EAD7CF` | `oxide.tint` | `color.feedback-error-surface` | Fond ErrorBanner — A2/A3/A4, B1, C1, C3, C7 |
| `color.alert-border` | `#C98B7E` | `oxide.edge` | `color.feedback-error-border` | Bordure ErrorBanner — mêmes écrans |
| `field.bg` | → `{color.surface}` | *(fusionné)* | `color.field-background` | **Fusion** — voir §6 |
| `field.border` | → `{color.hairline}` | `rule.strong` | `color.field-border` | Bordure de champ Default — A2/A3/A4/A5, C1, C5, C6, D1 |
| `field.border-error` | → `{color.alert}` | `oxide.base` | `color.field-border-error` | Bordure de champ Error — A2/A3, D1 |

---

## 2 · Typographie

| Token d'origine | Primitive | Rôle sémantique | Justification |
|---|---|---|---|
| `font.family` (`Inter`) | `font.grotesque` | *(consommée par les 6 composites)* | Voix « grotesque » nommée en §06 de la Design-System-Specification |
| `type.wordmark` | — | `type.wordmark` | SplashLogo A1, header logo A2 et A3 |
| `type.input` | — | `type.input` | Tous les TextInput — A2/A3/A4/A5, SearchInput C1, SetInputForm C5, EditableTitleInput + NotesInput C6, D1 |
| `type.button` | — | `type.button` | Tous les libellés de bouton |
| `type.label` | — | `type.label` | Labels de champ A2/A3/D1, label StatCard B1 |
| `type.link` | — | `type.link` | TextLink A2 et A3, QuickLink B1 |
| `type.body` | — | `type.body` | DescriptionText C2, description template C4, noms de liste C1/C3/C7, annexe CGU |
| `type.min` (`13px`) | `measure.text-min` | **— orpheline** | Contrainte de validation, pas un rôle de composant |
| *(ajouté)* | `line-height.tight` | *(consommée par 4 composites)* | Vertical rhythm « tight and mechanical » — §06 Design-System-Specification |
| *(ajouté)* | `line-height.relaxed` | *(consommée par `type.body` et `type.input`)* | Seuls rôles multi-lignes : DescriptionText C2, description C4, NotesInput C6, annexe CGU |

---

## 3 · Espacement, forme, mesure

| Token d'origine | Primitive | Rôle sémantique | Justification |
|---|---|---|---|
| `space.1` → `space.6` | `space.1` → `space.6` | **— aucun rôle** | Échelle modulaire — voir §5 |
| `radius.field` (`4px`) | `corner.none` (**`0px`**) | `radius.control` | Champs et boutons — A2/A3/A4/A5, B1, C4, C6, D1. **Valeur changée** — voir §7.5 |
| `radius.device` (`26px`) | `corner.device` | **— orpheline** | Cadre de preview de mockup, hors des 13 écrans |
| `border.width` (`1px`) | `measure.hairline` | `size.border` | Filets et bordures de champ — tous écrans |
| `layout.form-max-width` (`420px`) | `measure.form` | `size.form-max-width` | A2 §12, A3, A4, A5 — largeur contrainte en paysage/tablette |
| `target.min` (`44px`) | `measure.touch` | `size.touch-target` | A2 §11, C4 §11, C5 §12 — cible tactile ≥44×44pt |

> **Pourquoi `corner.*` et `measure.*` plutôt que `radius.*` et `size.*` côté primitives**
> Aucun chemin de `primitives.json` ne doit recouvrir un chemin de `semantic.json`. Style Dictionary
> fusionne les deux fichiers dans un arbre unique : un `radius.control` présent des deux côtés produit
> une référence circulaire (`{radius.control}` pointant sur lui-même) et fait échouer le build.

---

## 4 · Primitives orphelines (règle 4 — signalées, non supprimées)

| Primitive | Motif |
|---|---|
| `rule.weak` | Décrite « filets décoratifs » dans la source. Aucun des 13 écrans ne montre de filet décoratif. La Design-System-Specification §04 décourage activement les filets décoratifs : « Separate content with space and alignment first; add rules or borders only when space fails ». Lui fabriquer un rôle serait inventer un usage. |
| `corner.device` | Sa propre description dit « preview seulement ». Sert à cadrer des mockups, pas à styler l'app. |
| `measure.text-min` | Plancher d'accessibilité. C'est une règle de validation appliquée aux autres tokens, pas une valeur qu'un composant consomme. |

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

## 7 · Constats — décisions non prises, remontées à l'étape 07

### 7.1 Deux échecs de contraste WCAG 2.2 AA

Calculés sur les valeurs sources, inchangées (décision Q10).

| Paire | Ratio | Verdict |
|---|---|---|
| `paper.bright` sur `rust.base` | **3.75:1** | ❌ Échoue AA (4.5:1). `type.button` est 14px/600 — pas du « large text » au sens WCAG. **Tous les libellés de bouton primaire sont concernés.** |
| `ink.weak` sur `paper.raised` | **3.19:1** | ❌ Échoue AA. **Tous les placeholders sont concernés.** |
| `ink.mid` sur `paper.base` | 6.38:1 | ✅ |
| `oxide.base` sur `oxide.tint` | 5.55:1 | ✅ |

C'est exactement le risque annoncé en §11 de la Design-System-Specification : « Tan-on-tan and
warm-grey-on-warm-grey pairings … can fall below 4.5:1. All must be contrast-checked, not assumed. »

### 7.2 `type.label` viole `measure.text-min`

`type.label` est à **11px**. `measure.text-min` est à **13px** et se décrit comme « taille fonctionnelle
plancher (accessibilité) ». Les labels de champ sont du texte fonctionnel — A2 §11 exige d'ailleurs des
« labels explicites (pas seulement placeholders) ». **Le fichier source se contredit lui-même.**

### 7.3 États d'interaction absents (décision Q8)

Aucun token ne couvre ces états, tous exigés par la spec :

| État | Composants concernés |
|---|---|
| **Pressed** | PrimaryCTAButton B1, FreeSessionCard + TemplateCard C3, ExerciseListItem C1, TemplateExerciseRow C4, SessionListItem C7 |
| **Focus** | EmailInput + PasswordInput A2, SearchInput C1, EditableTitleInput C6 |
| **Disabled** | PrimaryButton A2/A3/A4/A5/C6, inputs A2 |

### 7.4 Autres besoins de la spec sans token

| Besoin | Écran | Note |
|---|---|---|
| Fond de skeleton | B1, C1, C3, C7, D1 | `rule.weak` pourrait servir — lui donnerait un rôle |
| Variantes SetRow (Warmup / Failure) | C5 | 3 variantes visuelles, aucun token |
| État « Pending sync » | C5 | Indicateur de série non synchronisée |
| SuccessState | A4 | La Design-System-Specification §05 dit qu'aucun spectre success/warning/info n'est observable et ne doit pas être présumé — conflit à trancher |
| PasswordStrengthMeter (Faible/Moyen/Fort) | A3 | A3 §11 impose du texte, pas seulement de la couleur — peut-être aucun token nécessaire |
| CategoryBadge, 8 variantes | C3, C4 | Un seul accent saturé par vue → probablement encre + filet |
| Voix monospace | Données tabulaires C5/C7, StatCard B1 | Différée hors V1 par décision, mais §06 la désigne comme « the signature voice » |

### 7.5 Rayon des contrôles — TRANCHÉ (31/07/2026)

`lift-tokens.json` portait `radius.field = 4px`, décrit comme « coins nets » — une description qui ne
correspondait pas à sa valeur. Ton étape 02 de pipeline prescrivait de son côté `radius.none = 0`.

**Décision : angle vif, `0px`.** C'est la seule valeur cohérente avec la contrainte système §08 de la
Design-System-Specification (« Predominantly sharp. Rectangles, panels, and frames are square-cornered.
Heavy rounding is off-system ») et avec les décisions verrouillées (« plat, coins nets »).

C'est la **seule valeur du fichier source qui a changé**. Le `4px` n'a plus aucun consommateur et a
été retiré. Conséquence concrète : une fois le thème fermé à l'étape 05, `rounded-control` vaut `0px`
et aucune autre classe de rayon n'existe pour les contrôles — l'angle arrondi devient inexprimable.

---

## 8 · Vérification finale

| Contrôle | Résultat |
|---|---|
| Tout alias `{...}` résout vers une primitive existante | ✅ 31 alias, tous résolus |
| Aucun nom sémantique ne contient un mot d'apparence | ✅ 25 rôles vérifiés |
| Chaque rôle cite un écran ou un composant | ✅ 25/25 |
| Chaque `$value` a un `$type` | ✅ 52/52 |
| **Nombre de primitives = nombre de tokens d'origine** | ❌ **27 vs 34** |
| **Conformité DTCG stricte** | ❌ **deux écarts assumés** |

### Pourquoi 27 et non 34

`34 − 6 composites typographiques (partis en semantic) − 3 alias field (partis en semantic)
+ 2 lineHeight (ajoutés) = 27`

Conséquence mécanique de Q1 + Q5 + Q6 combinés. Les 34 tokens sources sont tous représentés :
25 en primitives, 9 en rôles sémantiques directs.

### Les deux écarts DTCG

| Écart | Décision | Portée |
|---|---|---|
| `dimension` en chaîne `"4px"` au lieu de `{"value": 4, "unit": "px"}` | Q4=A | 12 tokens |
| `textCase` — propriété absente du type composite `typography` de DTCG | Q5=A | `type.button`, `type.label` |

Les deux sont des choix explicites, pas des oublis. Le format custom Style Dictionary de l'étape 04
devra traduire `textCase` → `textTransform` pour React Native.
