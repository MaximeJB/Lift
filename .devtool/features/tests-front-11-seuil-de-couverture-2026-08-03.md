---
id: "tests-front-11-seuil-de-couverture-2026-08-03"
status: "done"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: "2026-08-03T00:00:00.000Z"
labels: ["tests", "frontend"]
order: "e11"
---
# Tests 11 — imposer le seuil de couverture

**Objectif** : qu'une regression de couverture fasse echouer la commande, au lieu d'etre
constatee trois semaines plus tard.

Ajouter `coverageThreshold` dans `jest.config.js`, monte par paliers au fil des tickets 01
a 10 — poser 100% d'emblee bloquerait immediatement.

Point de depart mesure le 03/08/2026 : **10,92% des instructions, 8,61% des fonctions**.

Ajouter la couverture a la checklist de `frontend/CLAUDE.md`.

---

## Fait le 03/08/2026

`coverageThreshold` pose dans `jest.config.js`, en cliquet : global a 83/76/76/85,
`src/workout/stats.ts` a 95/95/94/98, `src/shared/components/primitives/` a 100 partout.
Verifie : un seuil place un point trop haut fait bien echouer la commande.

Depart 10,92% -> **84,42% des instructions, 86,27% des lignes**, sur 421 tests.

Script `npm run test:coverage` ajoute, et branche sur la checklist de `frontend/CLAUDE.md`.

Piege note dans le fichier et dans CLAUDE.md : Jest **retire du groupe `global`** tout
fichier couvert par un seuil nomme. Les 83% globaux mesurent donc le reste du code, pas le
rapport complet a 84,42%.
