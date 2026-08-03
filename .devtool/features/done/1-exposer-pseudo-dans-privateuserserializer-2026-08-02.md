---
id: "1-exposer-pseudo-dans-privateuserserializer-2026-08-02"
status: "done"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-02T10:01:27.655Z"
modified: "2026-08-03T08:46:52.008Z"
completedAt: "2026-08-03T08:46:52.008Z"
labels: []
order: "aV"
---
# 1. Exposer pseudo dans PrivateUserSerializer

**Objectif** : rendre le pseudo modifiable depuis D1. Aujourd'hui `GET /api/auth/me/` ne le renvoie pas et un `PATCH` qui le porterait serait **ignoré sans erreur** — l'utilisateur verrait sa modification acceptée puis disparaître au rechargement. C'est le pire des trois cas d'échec.

Le champ existe sur `CustomUser` ([accounts/models.py:27](vscode-webview://0rk8oamj43299ol7n2jgmajsu6c4m5nrkehoutb4dvl01kifb5de/accounts/models.py#L27), `unique=True`). Il manque au sérialiseur, et il faudra décider s'il est éditable ou en lecture seule — la spec D1 §6 le veut éditable avec la même validation qu'à l'inscription.

**Ressources** : [django-rest-framework.org](http://django-rest-framework.org)[ — Serializer fields](https://www.django-rest-framework.org/api-guide/fields/) · recherche `drf serializer unique field validation update`