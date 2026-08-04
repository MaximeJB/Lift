---
id: "tests-front-02-client-http-2026-08-03"
status: "done"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: "2026-08-03T00:00:00.000Z"
labels: ["tests", "frontend"]
order: "e02"
---
# Tests 02 — le client HTTP et ses intercepteurs

**Objectif** : le composant le plus retors du projet. Trois responsabilites, trois
familles de bugs silencieux.

## Cas limites a couvrir

- Le jeton est injecte quand il existe, absent sinon.
- Un 401 declenche UN rafraichissement et rejoue la requete, une seule fois.
- **Dix requetes qui expirent ensemble ne declenchent qu'UN rafraichissement** — le mutex
  de A1 §10. Sans lui, `ROTATE_REFRESH_TOKENS` en fait echouer neuf sur dix.
- Le chemin de rafraichissement n'est jamais intercepte (sinon boucle infinie).
- `toApiError` : 400 vers `ValidationError`, avec les trois formes de DRF aplaties.
- Timeout vers `NetworkError` avec `timedOut`, pas `AuthError`.
- Echec RESEAU du refresh : `NetworkError` et **pas** de purge (A1 §9 BR-5).
- Echec d'AUTHENTIFICATION du refresh : purge et `onSessionExpired` appele (BR-4).

---

## Clos le 03/08/2026

Fait le 03/08/2026. Voir `tests-front-11`, qui porte le bilan : 421 tests, 84,42% des instructions, seuils poses en cliquet.
