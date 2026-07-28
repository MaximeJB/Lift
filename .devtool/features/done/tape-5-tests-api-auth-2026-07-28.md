---
id: "tape-5-tests-api-auth-2026-07-28"
status: "done"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-07-28T09:11:52.190Z"
modified: "2026-07-28T09:11:52.190Z"
completedAt: "2026-07-28T09:11:52.190Z"
labels: []
order: "a1"
---
# Étape 5 — Tests API auth

Étape 5 — Tests API auth\
Objectif : Vérifier les 3 endpoints auth de bout en bout.

Todo : Dans accounts/[tests.py](http://tests.py), ajouter 3 tests utilisant la fixture api_client du [conftest.py](http://conftest.py) :

POST /api/auth/register/ avec {"email": "[new@test.com](mailto:new@test.com)", "password1": "testpass123", "password2": "testpass123"} → assert response.status_code == 201\
POST /api/auth/login/ avec {"email": "...", "password": "..."} → status 200, assert "access" in [response.data](http://response.data)\
GET /api/auth/me/ avec api_client.credentials(HTTP_AUTHORIZATION='Bearer &lt;token&gt;') → status 200, assert [response.data](http://response.data)\["email"\] == "..."