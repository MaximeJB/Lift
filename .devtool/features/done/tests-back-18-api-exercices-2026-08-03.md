---
id: "tests-back-18-api-exercices-2026-08-03"
status: "done"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: "2026-08-03T00:00:00.000Z"
labels: ["tests", "backend"]
order: "e18"
---
# Tests back 18 — cas limites de l'API exercices

**Objectif** : le classement et les filtres viennent d'etre reecrits, rien ne les protege.

- `?muscle_group=CHEST&muscle_group=BACK` donne l'**union**, pas l'intersection
- un groupe hors des 18 choix : 400, pas un silence
- recherche plus filtre : intersection
- classement : les exercices a `external_id` d'abord
- classement : a egalite, le nom le plus court d'abord
- recherche : nom exact, puis commence par, puis contient
- pagination : deux pages consecutives ne se recouvrent jamais
- `limit` et `offset` hors bornes
- exercice inexistant : 404

---

## Clos le 03/08/2026

Fait le 03/08/2026. +42 tests backend. Six defauts reveles au passage, chacun marque `xfail(strict=True)` et redecoupe en tickets `f01` a `f07`.
