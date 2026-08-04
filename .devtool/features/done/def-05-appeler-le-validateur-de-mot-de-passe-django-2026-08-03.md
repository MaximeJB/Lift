---
id: "def-05-appeler-le-validateur-de-mot-de-passe-django-2026-08-03"
status: "done"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: "2026-08-03T00:00:00.000Z"
labels: ["backend", "securite"]
order: "f06"
---

# Faire tourner les regles de mot de passe de Django a l'inscription

**Ce que ca prend** : le champ `password` de `UserRegistrationSerializer`.
**Ce que ca retourne** : un 400 detaille quand le mot de passe est trop court, trop commun,
ou entierement numerique.

**Objectif** : un mot de passe de quatre caracteres passe actuellement. La regle des 8
caracteres d'A3 §9 BR-3 n'existe que dans l'ecran React Native. Django embarque quatre
validateurs deja configures dans `AUTH_PASSWORD_VALIDATORS` — ils ne servent a rien tant
qu'on ne les appelle pas explicitement depuis le serialiseur.

Le test existe : `test_un_mot_de_passe_trop_faible_est_refuse`, en `xfail`.

## Etapes

1. Ouvre `Lift/settings.py` et regarde `AUTH_PASSWORD_VALIDATORS`. Note lesquels sont
   actifs — c'est exactement ce que ta correction va declencher.
2. Dans `accounts/serializers.py`, importe `validate_password` depuis
   `django.contrib.auth.password_validation`.
3. Ajoute une methode `validate_password` au serialiseur qui l'appelle sur la valeur recue.
4. **Le piege** : le `validate_password` de Django leve une
   `django.core.exceptions.ValidationError`, qui n'est PAS celle de DRF. Si tu ne la
   convertis pas, tu obtiens un 500 au lieu d'un 400. Rattrape-la et releve la bonne.
   Cherche les deux classes pour bien voir qu'elles portent le meme nom sans etre la meme.
5. Il existe une alternative : passer `validators=[validate_password]` directement dans la
   declaration du champ — DRF gere alors la conversion tout seul. Compare les deux
   approches, choisis, et note en commentaire pourquoi.
6. Retire le xfail, relance.

**Ressources** :
- Doc Django, validation de mot de passe : https://docs.djangoproject.com/en/5.2/topics/auth/passwords/#password-validation
- Recherche : `drf serializer validate_password django ValidationError conversion`

---

## Fait le 03/08/2026

`validate_password` ajoute a `UserRegistrationSerializer`. Les quatre validateurs de `AUTH_PASSWORD_VALIDATORS` etaient configures depuis le debut mais n'etaient jamais declenches par DRF.

Le piege annonce s'est confirme : `validate_password` leve la `ValidationError` de `django.core.exceptions`, pas celle de DRF. Elle est importee sous l'alias `DjangoValidationError` et convertie, sinon elle remontait en 500.
