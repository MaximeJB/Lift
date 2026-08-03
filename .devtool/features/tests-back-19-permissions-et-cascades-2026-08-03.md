---
id: "tests-back-19-permissions-et-cascades-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["tests", "backend"]
order: "e19"
---
# Tests back 19 — permissions, cascades et validations

**Objectif** : la securite des donnees privees, et ce qui se casse en cascade.

## Permissions

- la seance d'un autre utilisateur renvoie **404**, pas 403 (filtrage de queryset)
- de meme pour ses series
- creer une serie sur la seance d'un autre : refuse
- `perform_create` pose l'utilisateur ; l'envoyer dans le corps est ignore

## Cascades

- supprimer une seance supprime ses series
- supprimer un exercice utilise par une serie est REFUSE (`on_delete=PROTECT`)
- supprimer un template met `session.template` a `NULL` sans perdre la seance

## Validations

- `set_number` en double sur un meme exercice
- `weight_kg` negatif, `reps` a zero : le modele n'a AUCUN validateur aujourd'hui, decider
  s'il en faut
