---
id: "tape-14-cran-liste-des-exercices-2026-07-28"
status: "done"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-07-28T09:14:08.897Z"
modified: "2026-08-03T08:46:52.078Z"
completedAt: "2026-08-03T08:46:52.078Z"
labels: []
order: "aY"
---
# 8.Écran liste des exercices

Objectif : Afficher les exercices depuis l'API dans une liste scrollable.

Todo : Créer frontend/app/exercises.tsx. Au useEffect, appeler GET /api/lift/exercise/ avec le token en header. Afficher les résultats dans une FlatList avec name et muscle_group par item.