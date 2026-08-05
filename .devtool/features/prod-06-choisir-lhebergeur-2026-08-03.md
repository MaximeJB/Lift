---
id: "prod-06-choisir-lhebergeur-2026-08-03"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["production", "decision"]
order: "aN"
---
# 24 — Decider ou tourne le backend

**Ce que ca prend** : une comparaison.
**Ce que ca retourne** : un choix ecrit, avec son cout mensuel et ses limites.

**Objectif** : le choix determine tout le reste — comment on deploie, ou vont les photos,
comment on lit les logs. Le faire tard oblige a refaire.

## Ce qu'il faut comparer

Pour chaque candidat, reponds a ces six questions. C'est le tableau qui decide, pas la
reputation.

1. Combien ca coute par mois, base PostgreSQL comprise ?
2. Le disque est-il **persistant** ? Si non, les photos de la serie `photo-*` disparaissent
   a chaque redemarrage, et il faut un stockage objet en plus.
3. L'instance s'endort-elle apres inactivite ? Un demarrage a froid de 30 secondes sur le
   premier ecran de l'app, c'est inacceptable.
4. Comment on lit les logs et pendant combien de temps sont-ils gardes ?
5. Les migrations tournent-elles automatiquement au deploiement, ou faut-il une commande ?
6. Comment on revient en arriere quand un deploiement casse tout ?

## Candidats a regarder

Railway, Render, Fly.io, Scaleway, un VPS nu. Les quatre premiers gerent la base pour toi ;
le VPS coute moins cher et demande beaucoup plus de travail.

**Mon avis** : un service gere pour un premier deploiement. Le VPS t'apprendra plus, mais
il t'apprendra l'administration systeme, pas le developpement — et ce n'est pas ce que tu
cherches en ce moment.

Ecris le tableau dans ce ticket. Il servira de reference quand tu voudras changer.

**Ressources** :
- Recherche : `railway vs render vs fly.io django postgres pricing 2026`
- Recherche : `render free tier cold start spin down`