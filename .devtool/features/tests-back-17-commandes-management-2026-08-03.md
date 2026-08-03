---
id: "tests-back-17-commandes-management-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["tests", "backend"]
order: "e17"
---
# Tests back 17 — les trois commandes de management

**Objectif** : elles sont a **0% de couverture** et l'une d'elles ecrit dans toute la base.

## `import_hevy`, la plus critique

- deux regles d'appariement : nom normalise identique, memes mots dans un autre ordre
- un exercice reclame par deux modeles est rejete des DEUX cotes
- un format hors de `TRAINING_FORMAT_CHOICES` n'est jamais ecrit
- **idempotence** : deux executions successives laissent le meme etat
- la purge efface type, video, `external_id` et muscles secondaires des non-apparies
- `--dry-run` n'ecrit rien

## `import_exercices` et `dl_exo`

Au minimum : fichier absent, JSON corrompu, execution deux fois de suite.
