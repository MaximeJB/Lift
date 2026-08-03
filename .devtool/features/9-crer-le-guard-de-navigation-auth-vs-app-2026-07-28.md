---
id: "9-crer-le-guard-de-navigation-auth-vs-app-2026-07-28"
status: "in-progress"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-07-28T13:44:07.667Z"
modified: "2026-08-03T08:46:29.286Z"
completedAt: null
labels: []
order: "a0"
---
# 9. Créer le guard de navigation (Auth vs App)

**Objectif** : Rediriger automatiquement vers l'écran de login si l'user n'est pas connecté, et vers l'app s'il l'est. C'est ce qui "boucle" le système d'auth.

Dans ton Stack Navigator racine, vérifie l'état de l'`AuthContext` pour afficher soit le stack `Auth` (Login/Register), soit le stack `App`.

**Ressources** :

- [reactnavigation.org](http://reactnavigation.org)[ — Auth flow](https://reactnavigation.org/docs/auth-flow)
- Recherche : `react navigation conditional stack auth flow typescript`