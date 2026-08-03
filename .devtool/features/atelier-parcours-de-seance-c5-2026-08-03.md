---
id: "atelier-parcours-de-seance-c5-2026-08-03"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["design", "atelier", "c5"]
order: "d1"
---
# Atelier — la clarté du parcours en séance (C5)

**Objectif** : qu'un utilisateur qui ouvre C5 comprenne du premier coup d'œil qu'il est
sur le récapitulatif de sa séance, et non sur un écran de sélection d'exercice.

## Ce qui l'a motivé

Essai sur appareil du 03/08/2026. L'écran a été pris pour une page de choix d'exercice,
et le récapitulatif n'a été trouvé qu'après coup — sur un écran vide, « + Ajouter un
exercice » est le seul élément visible, donc il devient le sujet de la page.

## Ce qui a été corrigé depuis, et qui a peut-être suffi

- confirmation « nouvelle séance » avant d'ouvrir C5 — la séance n'est plus créée par
  surprise
- le bouton d'ajout porte un contour accent et un `+`
- le bouton de validation devient `+ Ajouter une série`, pour inciter à en enchaîner
- l'en-tête du modal de choix n'est plus collé sous l'encoche

**Le problème n'était plus visible après ces correctifs.** L'atelier reste ouvert au cas
où il réapparaît sur une vraie séance, avec plusieurs exercices et le bandeau de repos
actif.

## Trois pistes, si on y revient

1. **Un état vide qui nomme l'écran.** Quand aucun exercice n'est ajouté, une ligne dit
   ce qu'est cette page et ce qu'on y fait ensuite — même logique que l'état vide retenu
   pour C3.
2. **Un compteur en en-tête.** `0 exercice · 0 série` dès l'ouverture : un relevé vide
   reste un relevé, et il se remplit sous les yeux.
3. **Le modèle Hevy.** Le récapitulatif est la page, l'ajout d'exercice une action en pied
   de liste, et chaque exercice ouvre son propre bloc de saisie replié.

À monter dans Storybook et à regarder **sur le téléphone**, comme toute proposition
visuelle du projet.
