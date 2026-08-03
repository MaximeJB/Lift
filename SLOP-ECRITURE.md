# Barème anti-slop — écriture

> Grille opposable à tout texte public du projet : tweets, messages de commit, README,
> documentation. Y compris ceux écrits par Claude.
>
> Pendant que `frontend/src/shared/components/SLOP.md` juge le visuel, celui-ci juge la
> prose. Même logique : on score AVANT de publier, et le score accompagne le texte.

---

## Comment scorer

On additionne les pénalités. **Plus le score est haut, plus ça sent la machine.**

| Score     | Verdict                        |
| --------- | ------------------------------ |
| **0 – 2** | Publiable.                     |
| **3 – 5** | À réécrire avant de proposer.  |
| **6 +**   | Slop. Rejeté.                  |

---

## Bloc A — tics de rythme

_Ce qui trahit une phrase générée avant même qu'on lise le fond._

| #      | Critère                                                                                                                                          | Pénalité |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| **A1** | **Phrase-pivot fabriquée.** « Le plus surprenant », « Voici ce qui a changé », « Et là, coup de théâtre ». Du suspense inventé pour relancer.    | +2       |
| **A2** | **Triade.** Trois éléments là où deux suffisaient, uniquement pour la cadence. « Plus lisible, plus cohérent, plus solide. »                     | +2       |
| **A3** | **Chiasme final.** « Ça cesse d'être X pour devenir Y. » La clôture symétrique, systématiquement.                                               | +2       |
| **A4** | **Transition vide.** Un titre déguisé en phrase : « Puis, le catalogue. » Annonce la structure au lieu de porter du contenu.                     | +1       |
| **A5** | **Fragment emphatique.** Une phrase sans verbe pour appuyer. Comme celle-ci. Utilisée plus d'une fois par texte.                                 | +1       |
| **A6** | **Tiret cadratin en rythme.** L'incise à répétition, deux fois ou plus dans un paragraphe court.                                                 | +1       |
| **A7** | **« Non pas X, mais Y ».** Construction en balancier, deux fois ou plus.                                                                          | +1       |

## Bloc B — vide de contenu

_Ce qui rend le texte lisible par tous et utile à personne._

| #      | Critère                                                                                                                              | Pénalité |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **B1** | **Zéro chiffre.** Un journal technique sans une mesure, une version, une durée, un ratio.                                            | +3       |
| **B2** | **Aucun nom propre.** Ni outil, ni norme, ni fichier, ni valeur. Le texte pourrait décrire n'importe quel projet.                    | +2       |
| **B3** | **Montée en généralité.** Le concret sert de tremplin vers une maxime : « le moment où l'on cesse de coder pour décider. »           | +2       |
| **B4** | **Intensifieur sans mesure.** « Beaucoup mieux », « nettement », « bien plus solide » sans chiffre en face.                          | +2       |
| **B5** | **Méta-narration du processus.** Se raconter en train de travailler, d'apprendre, ou d'être humble.                                  | +1       |
| **B6** | **Arc narratif plaqué.** Problème → tension → résolution, alors que la journée n'a pas eu cette forme.                               | +2       |

## Bloc C — bonus

_Se soustraient du total. Plancher à 0._

| #      | Critère                                                                                             | Bonus |
| ------ | ----------------------------------------------------------------------------------------------------- | ----- |
| **C1** | Une valeur **exacte** qu'on ne pourrait pas inventer : hex, ratio, version, durée mesurée.          | −1    |
| **C2** | Un résultat qui **contredit** l'intuition annoncée, chiffres à l'appui.                             | −1    |
| **C3** | Une contrainte technique **nommée** — norme, comportement d'outil, limite d'une bibliothèque.        | −1    |
| **C4** | Le texte reste utile **à son auteur dans six mois**. C'est une note, pas une vitrine.                | −1    |

---

## Exemple scoré — mes tweets du 01/08/2026, **score 11, rejetés**

> « The fix was counterintuitive. » → `A1` +2
> « Then the component catalogue. » → `A4` +1
> « Tomorrow it stops being infrastructure and starts being an app. » → `A3` +2
> « the part where you stop shipping and start deciding what the thing actually looks
> like » → `B3` +2
> Aucun hex, aucun ratio, aucune version sur quatre tweets → `B1` +3
> « I'd never measured them », « Ran it on my own » → `B5` +1

Un seul bonus : `C4`. **11 − 1 = 10.** Rejeté.

Le défaut central : quatre tweets sur une journée de mesures, sans une seule mesure.

---

## Règle d'usage

Tout texte public arrive avec son score. Au-dessus de 2, il est réécrit avant d'être
proposé.

**Ce barème ne prime jamais sur une décision du propriétaire du projet** — même règle
que pour `SLOP.md`. Un texte validé est final, quel que soit son score.

---

# Modèle validé — le journal de bord

_Style retenu le 01/08/2026 après quatre réécritures. C'est la référence : tout fil
futur s'y aligne._

## Les dix traits qui le définissent

**1. Chaque unité ouvre sur une capacité livrée**, énoncée à plat.
« Component catalogue is done. » · « Centralised API layer landed. » · « And a session
that holds. » Pas de mise en scène, pas de question rhétorique.

**2. Le chiffre arrive en preuve, pas en sujet.**
« 16 UI components covering the 64 names » — l'affirmation précède, le nombre la
soutient. Jamais l'inverse.

**3. L'énumération se suffit.**
« Text, Button, Hairline, Input, ListItem, StatTile, ConfirmDialog, SegmentedControl. »
Aucun « et bien d'autres », aucun « pour n'en citer que quelques-uns ».

**4. Le détail technique justifie une décision, il ne raconte pas une lutte.**
« errors classed by cause rather than status code, **so** a network drop and an expired
session take different paths. » La subordonnée dit pourquoi ça compte.

**5. La négation sert de spécification.**
« bg-red-500 doesn't exist. » Ce n'est pas une plainte, c'est une description de ce que
le système garantit.

**6. La dernière ligne est observable.**
« the app opens offline with the right name on screen. » Un comportement qu'on pourrait
constater, pas une formule de clôture.

**7. Aucune transition entre paragraphes.**
Ligne vide, fait suivant. Ni « puis », ni « ensuite », ni « par ailleurs ».

**8. Présent pour l'état, passé pour l'événement.**
« sits on », « clears », « doesn't exist » — ce qui est.
« landed », « is done » — ce qui s'est produit.

**9. Tout comparatif se rattache à une référence nommée.**
Jamais « mieux ». Toujours « 4.74:1 » ou « rather than status code ».

**10. Deux à trois paragraphes courts.**
Le premier énonce. Le second étaye. Le troisième, s'il existe, donne la conséquence
observable.

## Le ton

Plat et déclaratif. Aucune auto-dépréciation, aucun marqueur d'enthousiasme, aucune
confidence sur le processus. Le texte suppose un lecteur qui sait lire un ratio.

## Le piège récurrent — journal de bugs déguisé en journal de bord

Constaté **deux jours de suite**, donc c'est un tic et non un accident : raconter ce qui
clochait au lieu de ce qui existe désormais.

| Journal de bugs                              | Journal de bord                          |
| -------------------------------------------- | ---------------------------------------- |
| « 4 paires échouaient WCAG »                 | « Palette clears WCAG AA throughout »   |
| « mes surcharges étaient aléatoires »        | « Text carries a typed color prop »      |
| « neuf refresh mouraient »                   | « 10 concurrent calls, 1 refresh »       |

Test à appliquer avant publication : **chaque phrase décrit-elle quelque chose qui
existe ce soir et n'existait pas hier ?** Sinon, c'est un rapport d'incident.

## Référence — fil du 01/08/2026, score 0

> Design system, day 2. Component catalogue is done: 16 UI components covering the 64
> names my spec listed across 13 screens.
>
> Text, Button, Hairline, Input, ListItem, StatTile, ConfirmDialog, SegmentedControl.
> All browsable in Storybook, native and web off one story file.

> All of it sits on a closed Tailwind theme — 33 primitives, 31 semantic roles, every
> role traced to a screen. bg-red-500 doesn't exist.
>
> Palette clears WCAG AA throughout: 4.74:1 on labels, 3.31:1 on outlines. Four
> monospace families, one per text size.

> Centralised API layer landed. Typed axios client, errors classed by cause rather than
> status code, so a network drop and an expired session take different paths.
>
> Service functions for auth, exercises, templates and sessions — every type read from
> the Django serialisers.

> And a session that holds. JWT checked locally at boot, zero network call. Refresh
> behind a shared-promise mutex: 10 concurrent calls, 1 refresh.
>
> User cached in SecureStore, so the app opens offline with the right name on screen.

## Une règle absolue

**Ne jamais annoncer un travail non fait.** Le 01/08/2026, une demande portait sur la
navigation par tabs et l'écran Login : ni l'un ni l'autre n'existait. Vérifier l'état du
dépôt avant d'écrire, et le dire quand l'écart apparaît.
