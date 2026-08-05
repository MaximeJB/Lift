---
id: "def-03c-migration-des-validateurs-2026-08-03"
status: "done"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: "2026-08-03T00:00:00.000Z"
labels: ["backend"]
order: "aI"
---
# Generer et appliquer la migration des deux validateurs

**Ce que ca prend** : les modifications de `def-03a` et `def-03b`.
**Ce que ca retourne** : un fichier dans `liftapp/migrations/` et une base a jour.

**Objectif** : rendre les validateurs effectifs. Tant que la migration n'est pas passee,
l'etat du code et l'etat de la base divergent, et Django refusera de demarrer proprement.

## Etapes

1. `python manage.py makemigrations liftapp`
2. **Ouvre le fichier genere et lis-le** avant de l'appliquer. Une migration qu'on
   n'inspecte pas est une migration qui surprendra en production. Tu dois y voir deux
   `AlterField`, rien d'autre. Si tu vois un `AddField` ou un `RemoveField`, quelque chose
   a derape et il faut comprendre quoi avant de continuer.
3. `python manage.py migrate`
4. `python -m pytest liftapp/tests.py -q` — les deux tests xfail doivent basculer en
   `XPASS(strict)`, donc en echec rouge. C'est le signal attendu, pas un probleme.
5. Retire les deux marqueurs `xfail` et relance : tout doit etre vert.

**Un point a comprendre au passage** : un `MinValueValidator` ne cree **aucune contrainte
SQL**. Il est verifie par Python, au moment de la validation. Un
`Set.objects.create(weight_kg=-50)` en direct passerait quand meme. Cherche
`CheckConstraint` si tu veux savoir comment on verrouille vraiment au niveau de la base —
c'est une piste pour plus tard, pas pour ce ticket.

**Ressources** :
- Doc Django, migrations : https://docs.djangoproject.com/en/5.2/topics/migrations/
- Recherche : `django CheckConstraint vs validators difference`

---

## Fait le 03/08/2026

Migration `0006_alter_set_reps_alter_set_weight_kg`. Deux `AlterField`, relus avant application.

Rappel note dans le ticket : un `MinValueValidator` ne cree aucune contrainte SQL. `Set.objects.create(weight_kg=-50)` en direct passe toujours. Verrouiller la base demanderait un `CheckConstraint` — piste pour plus tard.