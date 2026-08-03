---
id: "tests-e2e-16-cas-limites-reseau-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["tests", "e2e"]
order: "e16"
---
# E2E 16 — cas limites reseau et session

**Objectif** : ce que les tests unitaires ne peuvent pas prouver — le comportement reel
quand la connexion lache au mauvais moment.

- couper le reseau pendant la validation d'une serie : `NON SYNC`, rien de perdu, renvoi au
  retour du reseau
- couper pendant le scroll du catalogue : liste conservee, bouton Reessayer
- jeton expire pendant une seance : rafraichissement transparent, aucune serie perdue
- refresh token invalide cote serveur : retour au Login sans perte locale
- quitter une seance avec des series non synchronisees : l'avertissement le dit
