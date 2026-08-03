---
id: "4-get-apiauthmeexport-export-des-donnes-2026-08-02"
status: "done"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-02T10:02:18.373Z"
modified: "2026-08-03T08:46:51.942Z"
completedAt: "2026-08-03T08:46:51.942Z"
labels: []
order: "aS"
---
# 4. GET /api/auth/me/export/ — export des données

**Objectif** : droit à la portabilité. D1 §9 BR-5 : traitement **asynchrone**, livraison par email — un export synchrone bloquerait la requête le temps de sérialiser toutes les séances.

C'est la tâche la plus lourde des quatre : elle suppose un service d'envoi d'email, qui n'existe pas encore et qui bloque aussi A4. À faire en dernier, ou à décaler après le MVP.

**Ressources** : [docs.djangoproject.com](http://docs.djangoproject.com)[ — Sending email](https://docs.djangoproject.com/en/5.1/topics/email/) · recherche `django background task email export without celery`