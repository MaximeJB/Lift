---
id: "compte-01-serialiseur-du-changement-de-mot-de-passe-2026-08-03"
status: "done today"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-05T13:31:58.399Z"
completedAt: null
labels: ["backend", "compte"]
order: "a0"
---
# 01 — Ecrire le serialiseur qui valide un changement de mot de passe

**Ce que ca prend** : trois champs recus du client — `ancien_mot_de_passe`, `nouveau_mot_de_passe`, `confirmation`. **Ce que ca retourne** : rien de visible. C'est une classe de validation ; la vue viendra au ticket suivant. On la teste isolement avant de la brancher.

**Objectif** : un utilisateur doit pouvoir changer son mot de passe depuis D1. Aujourd'hui c'est impossible : il n'existe aucune route pour ca. On commence par la validation seule, parce que c'est la ou sont toutes les regles, et qu'un serialiseur se teste sans requete HTTP — donc plus vite.

## Etapes

1. Cree `PasswordChangeSerializer` dans `accounts/serializers.py`. Il herite de `serializers.Serializer`, **pas** de `ModelSerializer` : il ne represente aucun objet de la base, juste une operation.
2. Declare les trois champs. Tous en `write_only=True` — un mot de passe ne ressort jamais d'une API, meme en echo.
3. Ecris `validate_ancien_mot_de_passe` : recupere l'utilisateur via `self.context['request'].user` et appelle sa methode `check_password`. Si elle renvoie `False`, leve une `ValidationError`.
4. Ecris `validate` (sans suffixe, donc au niveau de l'objet) pour comparer le nouveau et sa confirmation. Regarde comment `UserRegistrationSerializer` fait deja — et applique le correctif du ticket `def-04` si tu l'as fait, sinon tu vas reproduire le meme bug.
5. Appelle `validate_password` de Django sur le nouveau mot de passe. Meme piege de conversion d'exception que dans `def-05`.
6. Ajoute une regle que Django ne fournit pas : refuser un nouveau mot de passe **identique a l'ancien**. Sinon le formulaire accepte un changement qui ne change rien.

**Ressources** :

- Doc DRF, `Serializer` non lie a un modele : https://www.django-rest-framework.org/api-guide/serializers/
- Doc Django, `check_password` : https://docs.djangoproject.com/en/5.2/ref/contrib/auth/#django.contrib.auth.models.User.check_password
- Recherche : `drf change password serializer write_only check_password`