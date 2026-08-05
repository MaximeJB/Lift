---
id: "tape-d-ajouter-la-recherche-2026-08-01"
status: "done"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-01T16:14:47.614Z"
modified: "2026-08-01T16:54:06.482Z"
completedAt: "2026-08-01T16:54:06.482Z"
labels: []
order: "af"
---
# Étape D — Ajouter la recherche

**Objectif** : Passer des paramètres de requête, ceux qui apparaissent après le `?` dans l'URL.

Ajoute `searchExercises` qui prend un terme de recherche et retourne les exercices correspondants. Le backend attend un paramètre nommé `search`.

**Gros indices** :

- `api.get` accepte un **deuxième argument** : un objet de paramètres. Regarde sa signature dans `index.ts`
- Le type de retour est le même qu'à l'étape B
- Si tu te demandes pourquoi `search` et pas autre chose : regarde `search_fields` dans `liftapp/views.py`

**Ressources** :

- Recherche : `django rest framework SearchFilter search query param`