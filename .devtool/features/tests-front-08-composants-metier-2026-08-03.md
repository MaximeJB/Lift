---
id: "tests-front-08-composants-metier-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["tests", "frontend"]
order: "e08"
---
# Tests 08 — ExerciseLibrary, SessionStarter, SessionHistory

**Objectif** : trois composants qui parlent au reseau et portent des regles de la spec.

- `ExerciseLibrary` : une reponse lente arrivee APRES une plus recente est jetee.
- `ExerciseLibrary` : changement de filtre, rechargement a l'offset 0.
- `ExerciseLibrary` : pas de doublon quand deux pages se recouvrent.
- `ExerciseLibrary` : erreur, la liste precedente est CONSERVEE (C1 §8).
- `SessionStarter` : la seance libre reste rendue quand les templates echouent (C3 §16).
- `SessionStarter` : tri par categorie puis par nom, avec `localeCompare`.
- `SessionHistory` : aucun doublon d'en-tete quand un mois est coupe entre deux pages.
- `SessionHistory` : une seance sans `duration_minutes` affiche « non finalisee ».
