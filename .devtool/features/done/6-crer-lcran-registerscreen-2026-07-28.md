---
id: "6-crer-lcran-registerscreen-2026-07-28"
status: "done"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-07-28T13:42:57.203Z"
modified: "2026-08-03T08:46:52.056Z"
completedAt: "2026-08-03T08:46:52.056Z"
labels: []
order: "aX"
---
# 7. Créer l'écran RegisterScreen

**Objectif** : Permettre la création de compte depuis l'app, en appelant `POST /api/auth/register/`.

Reprend la structure du LoginScreen et ajoute le champ `password_confirm`. Après inscription réussie, redirige directement vers l'app (les tokens sont déjà retournés par l'API).

**Ressources** :

- Recherche : `react native form validation password confirm`