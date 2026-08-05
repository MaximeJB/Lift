---
id: "tape-12-crer-lcran-login-2026-07-28"
status: "done"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-07-28T09:13:26.546Z"
modified: "2026-08-01T16:54:06.401Z"
completedAt: "2026-08-01T16:54:06.401Z"
labels: []
order: "aV"
---
# 5.Créer l'écran Login

Objectif : Afficher un formulaire email + password + bouton sur l'app.

Todo : Dans frontend/app/index.tsx, créer un écran avec deux TextInput (email, password) et un TouchableOpacity "Se connecter". Pas encore connecté au backend — juste l'UI.\
\
------------------------------------------------------------------------------\
**Objectif** : Premier écran fonctionnel — formulaire email/password qui appelle `POST /api/auth/login/` et stocke les tokens.

Crée un composant avec deux `TextInput` et un `Button`. On ne fait pas encore de validation avancée : juste appeler l'API et gérer le succès / l'erreur.

**Ressources** :

- [reactnative.dev](http://reactnative.dev)[ — TextInput](https://reactnative.dev/docs/textinput)
- Recherche : `react native login form api call fetch async`