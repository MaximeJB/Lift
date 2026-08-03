---
id: "tests-front-04-authcontext-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["tests", "frontend"]
order: "e04"
---
# Tests 04 — AuthContext, les six regles de A1

**Objectif** : le demarrage applique six regles metier numerotees. Chacune merite son test.

- BR-1 jeton local valide : connecte, **aucun appel reseau**
- BR-2 jeton expire et refresh present : tentative
- BR-3 rafraichissement reussi : les deux jetons remplaces
- BR-4 echec d'AUTHENTIFICATION : purge et retour au Login
- BR-5 echec RESEAU : surtout pas de deconnexion, acces optimiste
- BR-6 timeout de 5 s
- A1 §10 : aucun jeton, Login direct sans toucher au reseau
- `majUtilisateur` ecrit SecureStore puis l'etat
