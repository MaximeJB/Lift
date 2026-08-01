---
id: "7-crer-un-service-api-centralis-2026-07-28"
status: "done today"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-07-28T13:43:23.882Z"
modified: "2026-08-01T16:10:04.116Z"
completedAt: null
labels: []
order: "a5"
---
# 4. Créer un service API centralisé

**Objectif** : Éviter de répéter `fetch(...)` partout — avoir un seul endroit pour gérer l'URL de base, les headers JWT, et les erreurs réseau.

Crée un fichier `src/shared/api.ts` avec une fonction wrapper autour de `fetch` ou `axios` qui injecte automatiquement le token d'accès dans les headers.

**Ressources** :

- Recherche : `axios interceptors react native jwt bearer token`
- Recherche : `fetch wrapper typescript react native`