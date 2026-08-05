---
id: "tape-b-la-transformer-en-appel-rseau-2026-08-01"
status: "done"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-01T16:14:21.363Z"
modified: "2026-08-01T16:54:06.438Z"
completedAt: "2026-08-01T16:54:06.438Z"
labels: []
order: "ad"
---
# Étape B — La transformer en appel réseau

**Objectif** : Récupérer la liste des exercices depuis Django. C'est ta première fonction utile, et elle t'apprend les trois notions centrales : `async`, `await`, et les génériques.

Remplace le corps par un appel à `api.get(...)` sur le chemin `/api/lift/exercise/`. Le résultat n'est pas directement une liste : Django pagine, donc la réponse a la forme `{ count, next, previous, results }`.

**Gros indices** :

- Importe `api` depuis `../../shared/api`
- Une fonction qui attend le réseau doit être marquée `async`, et son type de retour devient `Promise<quelquechose>`
- `api.get` accepte un type entre chevrons pour dire ce que le serveur renvoie : `api.get<CeQueJeVeux>(...)`
- Deux types existent déjà dans `types.ts` et se combinent — l'un décrit l'enveloppe de pagination, l'autre un exercice. Regarde comment `Paginated` est déclaré, il attend quelque chose entre chevrons lui aussi

**Ressources** :

- Recherche : `typescript async function return type Promise`
- Recherche : `typescript generic function type parameter`