---
id: "2-post-apiauthchange-password-2026-08-02"
status: "done"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-02T10:01:43.863Z"
modified: "2026-08-03T08:46:51.986Z"
completedAt: "2026-08-03T08:46:51.986Z"
labels: []
order: "aU"
---
# 2. POST /api/auth/change-password/

**Objectif** : permettre le changement de mot de passe depuis l'app. D1 §9 BR-2 : **l'ancien mot de passe est exigé** avant d'accepter le nouveau — sans ça, un téléphone déverrouillé une minute suffit à voler un compte.

Trois champs en entrée, une vérification de l'ancien, et l'appel à `validate_password()` de Django sur le nouveau. À noter : `UserRegistrationSerializer` ne l'appelle pas non plus aujourd'hui, c'est le même trou.

**Ressources** : [docs.djangoproject.com](http://docs.djangoproject.com)[ — Password validation](https://docs.djangoproject.com/en/5.1/topics/auth/passwords/#password-validation) · [check_password()](https://docs.djangoproject.com/en/5.1/ref/contrib/auth/#django.contrib.auth.models.User.check_password) · recherche `drf change password endpoint apiview`