---
id: "tape-8-tests-api-sessions-et-sets-2026-07-28"
status: "done today"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-07-28T09:07:11.834Z"
modified: "2026-07-28T13:27:53.505Z"
completedAt: null
labels: []
order: "a0"
---
# Étape 8 — Tests API sessions et sets

Objectif : Vérifier le CRUD sur les objets qui appartiennent à un user.

Todo : Dans liftapp/[tests.py](http://tests.py) :

POST /api/lift/workout_session/ avec {"title": "Test", "date": "2026-07-26"} → status 201, assert [response.data](http://response.data)\["user"\] == str([user.id](http://user.id))\
Créer un Exercise en BDD, puis POST /api/lift/set/ avec tous les champs requis → status 201