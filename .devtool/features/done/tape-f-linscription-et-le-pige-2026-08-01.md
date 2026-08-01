---
id: "tape-f-linscription-et-le-pige-2026-08-01"
status: "done"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-01T16:15:13.122Z"
modified: "2026-08-01T16:54:06.523Z"
completedAt: "2026-08-01T16:54:06.523Z"
labels: []
order: "aK"
---
# Étape F — L'inscription, et le piège

### 

**Objectif** : Écrire `register`, et découvrir que ton API n'est pas cohérente avec elle-même.

`POST /api/auth/register/` attend `email`, `password`, `password_confirm` et `pseudo`. Mais sa réponse n'a **pas la même forme** que celle du login : les jetons y sont imbriqués sous une clé, au lieu d'être à la racine.

Écris `register`, puis fais-lui retourner la **même forme** que `login` — pour qu'un écran n'ait jamais à connaître cette différence.

**Gros indices** :

- Les deux types sont déjà déclarés dans `types.ts`, compare-les
- Tu recevras un `RegisterResponse` mais tu veux retourner un `LoginResponse` : il faut construire un nouvel objet à partir du premier
- Un détail va te bloquer : `RegisterResponse` ne contient pas tout ce que `LoginResponse` promet. Regarde bien, et dis-moi ce que tu trouves — c'est un vrai problème d'API, pas une erreur de ta part