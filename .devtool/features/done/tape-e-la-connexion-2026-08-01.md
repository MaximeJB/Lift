---
id: "tape-e-la-connexion-2026-08-01"
status: "done"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-01T16:14:59.239Z"
modified: "2026-08-01T16:54:06.503Z"
completedAt: "2026-08-01T16:54:06.503Z"
labels: []
order: "aJ"
---
# Étape E — La connexion

**Objectif** : Ta première requête POST, avec un corps. C'est la fonction dont dépendra l'écran Login.

Crée `src/auth/services/auth.service.ts` et écris `login` qui prend un email et un mot de passe, appelle `POST /api/auth/login/`, et retourne la réponse.

**Gros indices** :

- `api.post` prend le chemin puis le corps de la requête
- Le corps est un objet JavaScript ; Django attend les clés `email` et `password`
- Le type de la réponse existe déjà dans `types.ts`, il s'appelle `LoginResponse`
- Ne t'occupe pas encore de stocker les jetons — juste retourner