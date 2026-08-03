---
id: "qual-01-seuil-de-couverture-backend-2026-08-03"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "tests"]
order: "f70"
---

# Poser un cliquet de couverture sur le backend aussi

**Ce que ca prend** : `pytest-cov`, deja installe.
**Ce que ca retourne** : une commande qui echoue si la couverture backend redescend.

**Objectif** : le frontend a son seuil depuis le ticket `tests-front-11`. Le backend, non —
alors qu'il porte l'authentification et les permissions, c'est-a-dire le code ou une
regression fait le plus de degats.

## Etapes

1. Mesure d'abord : `python -m pytest --cov=accounts --cov=liftapp --cov-report=term-missing`
2. **Lis la colonne « Missing »** avant de poser le seuil. Elle liste les lignes jamais
   executees. Certaines sont sans interet (des `__str__`), d'autres revelent un chemin de
   code que personne n'a jamais teste — et c'est cette liste qui vaut le detour, pas le
   pourcentage.
3. Ajoute `--cov-fail-under=N` dans `pytest.ini`, avec N un point en dessous du mesure.
4. Exclus ce qui n'a pas de sens a couvrir : les migrations, `manage.py`, `wsgi.py`. Ca se
   fait dans un `.coveragerc` ou dans `pytest.ini`.
5. **N'exclus pas les commandes de management** au pretexte qu'elles ne sont pas testees.
   Elles ecrivent en base, c'est exactement le genre de code qui merite des tests — c'est
   d'ailleurs un ticket en attente (`tests-back-17`).
6. Remonte le seuil a chaque ticket de test suivant.

**Ressources** :
- Doc pytest-cov : https://pytest-cov.readthedocs.io/
- Recherche : `pytest cov fail-under coveragerc omit migrations`
