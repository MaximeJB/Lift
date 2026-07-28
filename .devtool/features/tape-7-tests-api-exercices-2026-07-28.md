---
id: "tape-7-tests-api-exercices-2026-07-28"
status: "done today"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-07-28T09:04:53.963Z"
modified: "2026-07-28T13:28:47.703Z"
completedAt: null
labels: []
order: "a3"
---
# Étape 7 — Tests API exercices

Objectif : Vérifier que l'endpoint exercices répond et retourne les nouveaux champs.

Todo : Dans liftapp/[tests.py](http://tests.py), avec auth_client :

GET /api/lift/exercise/ → status 200\
assert "video_url" in [response.data](http://response.data)\["results"\]\[0\]\
assert "secondary_muscle_groups" in [response.data](http://response.data)\["results"\]\[0\]\
assert "exercise_type" in [response.data](http://response.data)\["results"\]\[0\]