---
id: "tape-9-tests-permissions-isowner-2026-07-28"
status: "done today"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-07-28T09:12:34.195Z"
modified: "2026-07-28T13:27:54.294Z"
completedAt: null
labels: []
order: "a1"
---
# Étape 9 — Tests permissions IsOwner

Objectif : Vérifier qu'un user ne peut pas accéder aux données d'un autre.

Todo : Dans liftapp/[tests.py](http://tests.py) :

Créer user_a et user_b avec User.objects.create_user(...)\
user_a crée une WorkoutSession\
api_client.force_authenticate(user=user_b)\
GET /api/lift/workout_session/&lt;id_session_user_a&gt;/ → assert response.status_code in \[403, 404\]