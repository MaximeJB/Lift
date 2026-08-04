---
id: "tests-front-01-services-api-2026-08-03"
status: "done"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: "2026-08-03T00:00:00.000Z"
labels: ["tests", "frontend"]
order: "e01"
---
# Tests 01 — les quatre services API

**Objectif** : verrouiller la couche qui parle a Django. Ces fonctions traduisent des
formes de donnees ; une erreur y reste invisible jusqu'a l'ecran.

`auth.service.ts`, `exercises.service.ts`, `sessions.service.ts`, `templates.service.ts`.

## Cas limites a couvrir

- `register` : la reponse d'inscription n'a PAS la meme forme que celle du login (jetons
  sous `tokens`, ni `id` ni `email_verified`). Verifier l'appel de rattrapage a `/me/` et
  l'ordre des ecritures — les jetons AVANT `/me/`, sinon 401.
- `login` : jetons et utilisateur persistes avant le retour de la promesse.
- `listExercises` : une valeur vide est OMISE, jamais envoyee vide.
- `listExercises` : `muscleGroups` produit un parametre repete, jamais `muscle_group[]`.
- `updateMe` : les champs en lecture seule ne partent pas.
- `logout` : purge locale, aucun appel reseau.

---

## Clos le 03/08/2026

Fait le 03/08/2026. Voir `tests-front-11`, qui porte le bilan : 421 tests, 84,42% des instructions, seuils poses en cliquet.
