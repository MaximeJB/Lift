---
id: "6-crer-lcran-registerscreen-2026-07-28"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-07-28T13:42:57.203Z"
modified: "2026-07-28T14:32:41.273Z"
completedAt: null
labels: []
order: "a5V"
---
# 7. Créer l'écran RegisterScreen

**Objectif** : Permettre la création de compte depuis l'app, en appelant `POST /api/auth/register/`.

Reprend la structure du LoginScreen et ajoute le champ `password_confirm`. Après inscription réussie, redirige directement vers l'app (les tokens sont déjà retournés par l'API).

**Ressources** :

- Recherche : `react native form validation password confirm`