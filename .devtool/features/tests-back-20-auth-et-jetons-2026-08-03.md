---
id: "tests-back-20-auth-et-jetons-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["tests", "backend"]
order: "e20"
---
# Tests back 20 — cas limites d'authentification

**Objectif** : completer ce que les tests du pseudo ont commence.

- inscription : `validate_password()` de Django n'est **pas** appele aujourd'hui. Decider,
  puis tester.
- inscription : mots de passe differents, message NON VIDE (le defaut connu)
- login : identifiants faux, message generique, aucune fuite d'existence de compte
- refresh : rotation active, l'ancien jeton n'est plus accepte
- refresh : jeton corrompu, jeton d'un utilisateur supprime
- `/me/` sans jeton : 401
- `PATCH /me/` sur un champ en lecture seule : ignore silencieusement, le verifier
- changement de casse du pseudo par son proprietaire : autorise
