---
id: "tape-13-connecter-le-login-au-backend-2026-07-28"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-07-28T09:13:43.324Z"
modified: "2026-07-28T14:32:35.322Z"
completedAt: null
labels: []
order: "a5"
---
# 6.Connecter le login au backend

Objectif : Le bouton appelle POST /api/auth/login/ et stocke le JWT.

Todo : Au press du bouton, faire un fetch vers http://&lt;ton-ip-locale&gt;:8000/api/auth/login/. \
\
Stocker le token retourné avec expo-secure-store. Rediriger vers l'écran suivant si status 200.\
\
**Ressources** :

- [docs.expo.dev](http://docs.expo.dev)[ — expo-router navigation](https://docs.expo.dev/router/navigating-pages/)
- Recherche : `expo router redirect after login fetch typescript`