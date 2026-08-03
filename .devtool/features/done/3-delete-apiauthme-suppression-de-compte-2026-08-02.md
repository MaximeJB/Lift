---
id: "3-delete-apiauthme-suppression-de-compte-2026-08-02"
status: "done"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-02T10:02:00.495Z"
modified: "2026-08-03T08:46:51.963Z"
completedAt: "2026-08-03T08:46:51.963Z"
labels: []
order: "aT"
---
# 3. DELETE /api/auth/me/ — suppression de compte

**Objectif** : droit à l'effacement RGPD. D1 §9 BR-3 : la re-saisie du mot de passe est obligatoire, un OK/Annuler ne prouve que l'intention, pas l'identité.

La vraie question n'est pas la vue, c'est le `on_delete` des relations : regarde ce qui arrive aux `WorkoutSession` et aux `Set` de l'utilisateur, et si c'est ce que tu veux.

**Ressources** : [docs.djangoproject.com](http://docs.djangoproject.com)[ — on_delete](https://docs.djangoproject.com/en/5.1/ref/models/fields/#django.db.models.ForeignKey.on_delete) · recherche `django delete user account cascade rgpd`