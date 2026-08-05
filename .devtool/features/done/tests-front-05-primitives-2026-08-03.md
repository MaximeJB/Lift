---
id: "tests-front-05-primitives-2026-08-03"
status: "done"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: "2026-08-03T00:00:00.000Z"
labels: ["tests", "frontend"]
order: "b00"
---
# Tests 05 — les trois primitives

**Objectif** : `Text`, `Button`, `Hairline`. Peu de logique, mais ce sont les briques de
tout le reste.

- `Text` : une SEULE classe de couleur emise, jamais deux en conflit.
- `Text` : chaque variante rend sa classe typographique en toutes lettres.
- `Button` : `disabled` et `loading` bloquent tous deux le `onPress`.
- `Button` : les quatre variantes, dont `accent-outline`.
- `Button` : `accessibilityState` porte `disabled` et `busy`.

---

## Clos le 03/08/2026

Fait le 03/08/2026. Voir `tests-front-11`, qui porte le bilan : 421 tests, 84,42% des instructions, seuils poses en cliquet.