# Barème anti-slop — Lift

> Grille d'évaluation opposable à **toute** proposition visuelle, y compris celles de
> Claude. Un composant se score AVANT d'être proposé. Le score et son détail
> accompagnent la proposition.
>
> Appliqué de façon orthodoxe : un critère violé est violé, même si « ça se défend ».

---

## Comment scorer

On additionne les pénalités. **Plus le score est haut, plus c'est du slop.**

| Score     | Verdict                           |
| --------- | --------------------------------- |
| **0 – 2** | Conforme. Proposable.             |
| **3 – 5** | À retravailler avant de proposer. |
| **6 +**   | Slop. Rejeté, non proposable.     |

---

## Bloc A — marqueurs génériques

_Ce qui trahit un design produit par défaut, quel que soit le projet._

| #      | Critère                                                                                                                                                                               | Pénalité |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **A1** | **Centrage par réflexe.** Contenu centré sans raison fonctionnelle. Le centrage se justifie pour un état plein cadre qui interrompt le parcours ; pas pour du contenu qu'on parcourt. | +2       |
| **A2** | **Symétrie et espacement uniformes.** Le même écart partout, aucune hiérarchie spatiale. La proximité doit grouper.                                                                   | +1       |
| **A3** | **Élément décoratif sans information.** Toute forme, couleur ou trait qui n'encode rien.                                                                                              | +2       |
| **A4** | **Réflexe de la boîte.** Encadrer par défaut, alors que l'espace ou un filet suffisait.                                                                                               | +2       |
| **A5** | **Redondance de signal.** La même information portée trois fois — icône + libellé + couleur. Deux suffisent, dont un non chromatique.                                                 | +1       |
| **A6** | **Pattern importé sans justification.** « Tout le monde fait comme ça » n'est pas une raison. Le pattern doit être appelé par la spec d'interface.                                    | +2       |
| **A7** | **Couleur décorative.** Une couleur qui ne signale rien de précis.                                                                                                                    | +2       |
| **A8** | **Données factices.** Lorem, « Titre », « Description ». Une maquette se juge sur de vraies données du produit.                                                                       | +1       |
| **A9** | **Absence d'engagement.** Choix médian qui ne heurte rien et ne dit rien. Un système a des partis pris.                                                                               | +2       |

## Bloc B — contraintes propres à Lift

_Tirées de `Design-System-Specification.md`. Un manquement ici est plus grave._

| #       | Critère                                                                                         | Source     | Pénalité |
| ------- | ----------------------------------------------------------------------------------------------- | ---------- | -------- |
| **B1**  | **Ombre, dégradé ou coin arrondi.**                                                             | §08, §09   | +3       |
| **B2**  | **Hiérarchie portée par la couleur** là où l'échelle typographique pouvait la porter.           | §04        | +2       |
| **B3**  | **Filet là où l'espace suffisait.** _« Separate content with space and alignment first »_       | §04        | +1       |
| **B4**  | **Le composant décore au lieu de documenter.** L'interface est un instrument, pas une brochure. | §04        | +2       |
| **B5**  | **Densité non résolue sur une grille.** Données denses flottant librement.                      | §02        | +2       |
| **B6**  | **Registre codé absent** là où il est appelé — IDs, coordonnées, versions, mesures.             | §01        | +1       |
| **B7**  | **Plus d'une famille d'icônes, ou mélange d'épaisseurs de trait.**                              | §12        | +2       |
| **B8**  | **Blanc pur, ou fond non chauffé.**                                                             | §12        | +3       |
| **B9**  | **Marges périphériques vides** là où le registre appelle de la métadonnée.                      | §03        | +1       |
| **B10** | **Contraste hors seuil** — 4,5:1 texte, 3:1 contour de composant.                               | §11 / WCAG | +3       |

## Bloc C — bonus

_Se soustraient du total. Plancher à 0._

| #      | Critère                                                                              | Bonus |
| ------ | ------------------------------------------------------------------------------------ | ----- |
| **C1** | Le composant affiche une **donnée réelle** là où un autre aurait mis une décoration. | −1    |
| **C2** | Une contrainte du système est utilisée comme **ressort expressif** plutôt que subie. | −1    |
| **C3** | La forme encode une **distinction sémantique** sans recourir à la couleur.           | −1    |

---

## Exemples scorés

### Le dialogue de confirmation générique — **score 9, rejeté**

Panneau centré, titre, message, deux boutons côte à côte.

`A1` centrage par réflexe +2 · `A4` boîte par réflexe +2 · `A6` pattern importé, la spec
ne demande pas une carte flottante +2 · `A9` aucun engagement +2 · `B4` décore au lieu de
documenter — il dit « c'est irréversible » sans dire _ce qui_ sera détruit +2.
Aucun bonus. **9.**

### La bande de record en liste — **score 1, conforme**

Bande pleine largeur en accent, encre sombre, contour, portant le mot « record » et la date.

`A7` non : la couleur signale un fait précis · `B10` non : 4,74:1 et contour à 4,74:1 ·
`A3` non : la bande encode une information.
Reste `B3` : elle ajoute un aplat là où le texte aurait pu suffire, +1.
Bonus `C1` −1 (affiche la date réelle), `C3` −1 (la forme distingue l'accent-record de
l'alerte-erreur sans changer de teinte). Plancher à 0 → **1** après plancher sur la
pénalité seule. **Conforme.**

---

## Règle d'usage

Toute proposition visuelle est accompagnée de son score détaillé, critère par critère.
Une proposition à 3 ou plus n'est pas soumise : elle est retravaillée d'abord.

Le barème s'applique aussi aux composants déjà livrés. S'ils dépassent 2, ils sont
**signalés** — pas remplacés.

---

## Ce que le barème n'est PAS

**Il ne prime jamais sur une décision prise.** Un choix validé par le propriétaire du
produit est final, quel que soit son score. Le score est une information qu'on lui
donne, pas un verdict qu'on lui oppose.

Concrètement :

- Une solution retenue n'est **jamais supprimée** parce qu'elle score mal. Elle est
  conservée, son score documenté à côté.
- Si un score élevé est découvert **après** validation, on le signale et on demande :
  garder, ou voir des alternatives ? On ne tranche pas à sa place.
- Le barème sert à **générer de meilleures propositions**, pas à disqualifier celles
  qui ont déjà été choisies.

_Règle posée le 01/08/2026, après que `SegmentedControl` variante `bar` — retenue puis
scorée 5 — a été supprimée au lieu d'être conservée. Elle est aujourd'hui disponible
en `variant="bar"`._

---

## Décisions closes — ne pas rouvrir

Ces composants ont été scorés, des alternatives ont été proposées, et le propriétaire
du produit a choisi de **garder l'existant**. Leur score est une information historique,
pas une dette.

| Composant  | Score | Décision                                                         |
| ---------- | ----- | ---------------------------------------------------------------- |
| `StatTile` | 5     | **Conservé** — 01/08/2026, après comparaison avec 3 alternatives |
| `Badge`    | 4     | **Conservé** — 01/08/2026, après comparaison avec 3 alternatives |

Ne pas les reproposer à la révision. Ne pas invoquer leur score pour les modifier.
