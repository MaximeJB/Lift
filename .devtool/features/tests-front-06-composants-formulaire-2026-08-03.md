---
id: "tests-front-06-composants-formulaire-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["tests", "frontend"]
order: "e06"
---
# Tests 06 — Input, PasswordInput, SearchInput, Checkbox

**Objectif** : ces composants portent des regles d'accessibilite non negociables et deux
pieges deja rencontres.

## Cas limites a couvrir

- `Input` : un `onBlur` passe par l'appelant **ne remplace pas** celui qui remet le filet
  en etat Default. Bug du 02/08, il ne doit pas revenir.
- `Input` : les trois etats de filet — Default, Focus, Error.
- `PasswordInput` : libelle de bascule DYNAMIQUE.
- `SearchInput` : le debounce n'emet qu'un appel pour cinq frappes rapprochees.
- `Checkbox` : jamais pre-cochee, cible de 44pt par `hitSlop`.
