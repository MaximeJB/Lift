---
id: "data-05-tests-du-seeding-des-templates-2026-08-03"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "tests", "data"]
order: "aC"
---
# 13 — Verrouiller la commande de seeding par des tests

**Ce que ca prend** : la commande `seed_templates` des tickets `data-03` et `data-04`.
**Ce que ca retourne** : six tests dans `liftapp/tests.py`.

**Objectif** : cette commande touche a des donnees de reference. Une regression y est
invisible jusqu'au jour ou un utilisateur ouvre un programme et trouve un exercice absurde.
C'est exactement ce qui s'est passe avec `import_hevy`.

## Les cas

1. Apres execution, les trois templates existent, avec le bon nombre d'exercices chacun.
2. Les exercices sont ordonnes : `order` va de 1 a N sans trou ni doublon.
3. Chaque `TemplateExercise` pointe vers un `Exercise` **qui existe**. Verifie l'objet lie,
   pas juste l'absence d'erreur.
4. Idempotence : deux executions, meme nombre de lignes.
5. Un nom d'exercice introuvable fait **echouer** la commande. Utilise `pytest.raises` avec
   `CommandError`. Ce test est le plus important : c'est lui qui garantit qu'on ne creera
   jamais de template partiel.
6. `--dry-run` n'ecrit rien : compte les lignes avant et apres.

## Comment tester une commande de management

`django.core.management.call_command('seed_templates')` l'appelle directement, sans passer
par le shell. Pour capturer la sortie, passe un `io.StringIO` en `stdout`.

**Ressources** :
- Doc Django, tester les commandes : https://docs.djangoproject.com/en/5.2/topics/testing/tools/#topics-testing-management-commands
- Recherche : `django call_command test stdout StringIO pytest raises CommandError`