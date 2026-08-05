---
id: "4-crer-lauthcontext-2026-07-28"
status: "done"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-07-28T13:42:08.606Z"
modified: "2026-08-02T10:00:54.583Z"
completedAt: "2026-08-02T10:00:54.583Z"
labels: []
order: "a2"
---
# 3. Créer l'AuthContext

**Objectif** : Centraliser la gestion des tokens JWT (stockage, lecture, suppression) dans un Context React accessible partout dans l'app.

Crée un `AuthContext` avec `useReducer` ou `useState` qui expose : `user`, `accessToken`, `login()`, `logout()`. Le stockage persistant se fait via `expo-secure-store`.

**Ressources** :

- [docs.expo.dev](http://docs.expo.dev)[ — SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
- Recherche : `react native auth context jwt token secure store`