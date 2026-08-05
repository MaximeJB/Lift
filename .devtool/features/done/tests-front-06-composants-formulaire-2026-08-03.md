---
id: "tests-front-06-composants-formulaire-2026-08-03"
status: "done"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: "2026-08-03T00:00:00.000Z"
labels: ["tests", "frontend"]
order: "b01"
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

---

## Clos le 03/08/2026

Fait le 03/08/2026. Voir `tests-front-11`, qui porte le bilan : 421 tests, 84,42% des instructions, seuils poses en cliquet.