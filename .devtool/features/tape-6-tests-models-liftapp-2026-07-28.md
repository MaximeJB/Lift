---
id: "tape-6-tests-models-liftapp-2026-07-28"
status: "done today"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-07-28T09:11:32.891Z"
modified: "2026-07-28T13:28:44.331Z"
completedAt: null
labels: []
order: "a2"
---
# Étape 6 — Tests models liftapp

Objectif : Vérifier que les modèles se créent et que les relations fonctionnent.

Todo : Dans liftapp/[tests.py](http://tests.py), 3 tests @pytest.mark.django_db :

Créer un Exercise(name="Bench Press", muscle_group="CHEST") → vérifier qu'il est en BDD avec Exercise.objects.filter(name="Bench Press").exists()\
Créer une WorkoutSession liée à user → vérifier session.user == user\
Créer un Set lié à la session, puis Exercise.objects.filter(...).delete() → vérifier que ça lève ProtectedError