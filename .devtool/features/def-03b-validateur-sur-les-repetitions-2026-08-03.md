---
id: "def-03b-validateur-sur-les-repetitions-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "bug"]
order: "f03"
---

# Refuser un nombre de repetitions negatif

**Ce que ca prend** : le champ `Set.reps` dans `liftapp/models.py`.
**Ce que ca retourne** : un 400 sur une valeur negative.

**Objectif** : meme raison que la tache precedente. Une serie a -5 repetitions retirerait
du volume au total hebdomadaire de l'accueil, sans trace.

Le test existe : `test_zero_repetition_est_refuse`, marque `xfail(strict=True)`.

## Etapes

1. Regarde d'abord le type exact du champ `reps`. S'il est deja en `PositiveIntegerField`,
   un validateur serait redondant — verifie avant d'ajouter.
2. **Lis le nom du test** : il s'appelle « zero_repetition_est_refuse ». Or on a decide
   qu'un 0 n'etait pas grave. Il y a une contradiction entre ce test et cette decision.
   Tranche : soit tu autorises 0 et tu **reecris le test** pour qu'il verifie le refus du
   negatif, soit tu refuses 0. Mon avis : autoriser 0 et corriger le test, parce que la
   decision produit prime et qu'un test qui contredit une decision est un piege pour dans
   six mois.
3. Ajoute le validateur avec la borne que tu as choisie.

**Ressources** :
- Doc Django, `PositiveIntegerField` : https://docs.djangoproject.com/en/5.2/ref/models/fields/#positiveintegerfield
- Recherche : `django PositiveIntegerField vs MinValueValidator`
