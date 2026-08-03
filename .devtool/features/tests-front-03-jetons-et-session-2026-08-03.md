---
id: "tests-front-03-jetons-et-session-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["tests", "frontend"]
order: "e03"
---
# Tests 03 — jetons, decodage JWT et stockage

**Objectif** : A1 §13 impose de resoudre la session en local, sous 100 ms, sans reseau.
Tout repose sur `isTokenValid` et sur SecureStore.

## Cas limites a couvrir

- Jeton valide, expire, **illisible** (A1 §10 : traite comme absent).
- Jeton sans champ `exp`.
- Marge d'expiration : un jeton qui expire dans deux secondes est-il valide ? Verifier ce
  que fait le code, puis le figer.
- `setTokens`, `clearTokens`, `getStoredUser` avec un stockage qui leve.
