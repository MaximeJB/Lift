---
id: "tape-g-le-profil-2026-08-01"
status: "done"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-01T16:15:25.845Z"
modified: "2026-08-01T16:54:06.546Z"
completedAt: "2026-08-01T16:54:06.546Z"
labels: []
order: "aL"
---
# Étape G — Le profil

### 

**Objectif** : Lire et modifier l'utilisateur connecté. Tu y rencontreras un type utilitaire très courant en TypeScript.

Ajoute `getMe` qui appelle `GET /api/auth/me/`, puis `updateMe` qui envoie un `PATCH` sur le même chemin.

**Gros indices** :

- Pour `updateMe`, on n'envoie que les champs modifiés, jamais l'objet entier
- TypeScript a un type pour « toutes les propriétés de X, mais toutes optionnelles ». Il s'écrit en un mot suivi de chevrons
- Le mot commence par un P

**Ressources** :

- Recherche : `typescript Partial utility type`