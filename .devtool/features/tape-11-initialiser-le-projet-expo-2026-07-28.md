---
id: "tape-11-initialiser-le-projet-expo-2026-07-28"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-07-28T09:13:09.135Z"
modified: "2026-07-28T14:32:13.531Z"
completedAt: null
labels: []
order: "a3"
---
# 1.Initialiser le projet Expo

Objectif : Avoir une app React Native qui démarre sur ton téléphone — début du Milestone 3.

Todo : Dans un dossier frontend/ à la racine :

npx create-expo-app frontend --template blank-typescript\
cd frontend\
npx expo start\
Scanner le QR code avec l'app Expo Go sur ton téléphone. L'app doit s'ouvrir.\
\
Dans `frontend/`, initialise avec le template blank-typescript. Une fois lancée, crée la structure `src/` avec les dossiers `auth/`, `workout/`, `shared/` — décision d'architecture qui conditionne tout le reste.\
\
**Ressources** :

- [docs.expo.dev](http://docs.expo.dev)[ — Get Started](https://docs.expo.dev/get-started/create-a-project/)
- [docs.expo.dev](http://docs.expo.dev)[ — expo-router introduction](https://docs.expo.dev/router/introduction/)
- Recherche : `expo router file based routing folder structure`