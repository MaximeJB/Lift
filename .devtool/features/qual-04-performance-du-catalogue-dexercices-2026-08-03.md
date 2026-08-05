---
id: "qual-04-performance-du-catalogue-dexercices-2026-08-03"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "performance"]
order: "aU"
---
# 31 — Verifier que le catalogue ne fait pas 800 requetes SQL

**Ce que ca prend** : l'endpoint qui liste les exercices.
**Ce que ca retourne** : un nombre de requetes constant, quelle que soit la taille de la
page.

**Objectif** : `ExerciseSerializer` inclut `secondary_muscle_groups`, une relation
plusieurs-a-plusieurs. Sans precaution, DRF fait **une requete par exercice** pour aller la
chercher. Sur une page de 50, ca fait 51 requetes au lieu de 2. En local avec SQLite ca ne
se voit pas ; avec une base distante, chaque requete coute un aller-retour reseau.

## Etapes

1. Mesure avant de corriger. `django.db.connection.queries` apres un appel te donne la
   liste. Ou installe `django-debug-toolbar`, qui l'affiche directement.
2. Ecris un test qui **compte** les requetes. `django_assert_num_queries` est fourni par
   pytest-django. C'est le seul moyen d'empecher la regression : une optimisation sans test
   se perd au premier refactoring.
3. Ajoute `prefetch_related` sur la relation dans `get_queryset`.
4. Verifie que le compte ne bouge plus quand tu changes la taille de la page : c'est la
   definition d'un N+1 resolu.
5. Regarde aussi les annotations de tri ajoutees pour la recherche (`connu`, `longueur`,
   `pertinence`). Elles s'executent en base, donc elles ne creent pas de N+1 — mais verifie
   qu'un index existe sur `name`, sinon chaque recherche fait un parcours complet des 873
   lignes.

**Ressources** :
- Doc Django, `prefetch_related` : https://docs.djangoproject.com/en/5.2/ref/models/querysets/#prefetch-related
- Doc pytest-django, `django_assert_num_queries` : https://pytest-django.readthedocs.io/en/latest/helpers.html#django-assert-num-queries
- Recherche : `drf serializer many to many N+1 prefetch_related`