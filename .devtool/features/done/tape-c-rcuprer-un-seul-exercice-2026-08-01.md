---
id: "tape-c-rcuprer-un-seul-exercice-2026-08-01"
status: "done"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-01T16:14:34.945Z"
modified: "2026-08-01T16:54:06.460Z"
completedAt: "2026-08-01T16:54:06.460Z"
labels: []
order: "aH"
---
# Étape C — Récupérer un seul exercice

**Objectif** : Écrire ta première fonction avec un paramètre typé, et construire un chemin dynamique.

Ajoute `getExercise` qui prend un identifiant et retourne un seul exercice. Le chemin est `/api/lift/exercise/{id}/` — attention au slash final, Django redirige sans lui.

**Gros indices** :

- Un paramètre s'annote comme en Python : `(id: string)`
- Les identifiants sont des UUID côté Django, donc des chaînes
- Pour insérer une variable dans une chaîne, JavaScript utilise les accents graves : `.../${id}/`
- Ici pas d'enveloppe de pagination — le serveur renvoie l'objet seul