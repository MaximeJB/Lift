---
id: "tests-front-07-composants-seance-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["tests", "frontend"]
order: "e07"
---
# Tests 07 — SetRow, SetInputForm, RestTimerWidget

**Objectif** : le coeur de C5. Six variantes de formulaire, quatre etats de ligne.

## Cas limites a couvrir

- `champsPour` : les **six** types, plus le repli sur type vide et sur type inconnu —
  critere d'acceptation C5 §17.
- Jamais poids+reps sur un `DURATION` (anti-pattern C5 §16).
- Validation client : poids a 0 et reps a 0 bloques AVANT tout appel.
- `enSecondes` : `45`, `1:30`, vide, illisible.
- Les valeurs restent apres validation, RPE et echauffement repartent.
- Appui long : `is_failure` a vrai.
- `SetRow` : `ECH`, `ECHEC`, `record`, `NON SYNC`, et leurs combinaisons.
- `RestTimerWidget` : cellules pour 90 s, pour 15 s, pour une duree non multiple de 15.
