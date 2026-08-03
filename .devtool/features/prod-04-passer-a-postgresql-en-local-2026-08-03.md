---
id: "prod-04-passer-a-postgresql-en-local-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "production"]
order: "f63"
---

# Remplacer SQLite par PostgreSQL sur ta machine

**Ce que ca prend** : la configuration `DATABASES`.
**Ce que ca retourne** : un environnement local identique a la production.

**Objectif** : SQLite et PostgreSQL ne se comportent pas pareil. SQLite ignore la longueur
des `CharField`, gere les types de facon laxiste, et n'a pas les memes contraintes de
concurrence. Un projet developpe sur SQLite et deploye sur Postgres casse **au deploiement**,
c'est-a-dire au pire moment.

**Fais-le avant de deployer, pas apres.**

## Etapes

1. Installe PostgreSQL localement. Sur Windows, l'installeur officiel ou Docker Desktop —
   Docker est plus propre parce que la base reste isolee et se detruit d'une commande.
2. Installe `psycopg[binary]`. Attention a la version : `psycopg2` et `psycopg` (v3) sont
   deux paquets differents. Django 5.2 supporte les deux, prends la v3.
3. Configure `DATABASES` depuis l'environnement.
4. `python manage.py migrate` sur la base vide.
5. **Relance toute la suite de tests.** C'est le moment de verite : si une migration ou un
   test passe sur SQLite et pas sur Postgres, tu viens de trouver un bug qui t'attendait en
   production.
6. Recharge le catalogue d'exercices — la nouvelle base est vide. Les commandes d'import
   existent deja.
7. Ajoute la commande Docker exacte dans ce ticket, pour ne pas la rechercher a chaque fois.

**Ressources** :
- Doc Django, bases de donnees : https://docs.djangoproject.com/en/5.2/ref/databases/#postgresql-notes
- Recherche : `sqlite vs postgres django differences that break in production`
- Recherche : `docker run postgres 16 local development port volume`
