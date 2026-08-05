---
id: "tests-back-19-permissions-et-cascades-2026-08-03"
status: "done"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: "2026-08-03T00:00:00.000Z"
labels: ["tests", "backend"]
order: "au"
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

---

## Clos le 03/08/2026

Fait le 03/08/2026. +42 tests backend. Six defauts reveles au passage, chacun marque `xfail(strict=True)` et redecoupe en tickets `f01` a `f07`.