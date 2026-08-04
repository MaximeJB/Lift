---
id: "def-02-refresh-dun-compte-supprime-2026-08-03"
status: "done"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: "2026-08-03T00:00:00.000Z"
labels: ["backend", "securite", "bug"]
order: "f01"
---

# Un jeton de rafraichissement dont le compte a ete supprime doit renvoyer 401, pas 500

**Ce que ca prend** : un POST sur `/api/auth/token/refresh/` avec un refresh valide dont
l'utilisateur n'existe plus en base.
**Ce que ca retourne** : un 401 avec un message, au lieu d'une erreur serveur.

**Objectif** : arreter de planter. Aujourd'hui SimpleJWT va chercher l'utilisateur en base,
ne le trouve pas, leve `CustomUser.DoesNotExist`, et personne ne rattrape. Django transforme
ca en 500. Un 500 dans les logs de production, c'est une alerte a 3h du matin pour un cas
parfaitement normal.

Le test existe deja : `test_le_refresh_dun_utilisateur_supprime_est_refuse` dans
`accounts/tests.py`, marque `xfail(strict=True)`.

## Etapes

1. Lance `python -m pytest accounts/tests.py -q -rx` et lis la raison du xfail.
2. Retrouve OU l'exception est levee. Elle vient de la classe d'authentification de
   SimpleJWT, dans `get_user()`. Mets un point d'arret ou un `print` pour confirmer avant
   de coder quoi que ce soit — deviner l'endroit fait perdre plus de temps que le verifier.
3. Deux endroits possibles pour corriger, choisis :
   - **Un gestionnaire d'exception DRF personnalise** (`EXCEPTION_HANDLER` dans
     `REST_FRAMEWORK`) qui convertit `DoesNotExist` en 401. Portee large, attention aux
     effets de bord : ca s'appliquerait a TOUTES les vues du projet.
   - **Une sous-classe de `TokenRefreshSerializer`** qui rattrape et releve `InvalidToken`.
     Portee etroite, c'est le bon choix ici.
4. Ecris la correction, branche-la via `SIMPLE_JWT['TOKEN_REFRESH_SERIALIZER']` ou en
   remplacant la vue dans `urls.py`.
5. Retire le marqueur `xfail` et relance.

**Ressources** :
- Doc SimpleJWT, « Customizing token classes » : https://django-rest-framework-simplejwt.readthedocs.io/en/latest/customizing_token_claims.html
- Recherche : `simplejwt refresh token deleted user DoesNotExist 500`
- Recherche : `drf custom exception handler` (pour comprendre l'option large)

---

## Fait le 03/08/2026

`TokenRefreshRobusteSerializer` dans `accounts/serializers.py`, branche par `SIMPLE_JWT['TOKEN_REFRESH_SERIALIZER']` — la vue de SimpleJWT lit cette cle, donc `accounts/urls.py` n'a pas bouge.

L'exception venait de `rest_framework_simplejwt/serializers.py:116`, verifie par la trace et non devine. On rattrape `ObjectDoesNotExist`, la classe parente, plutot que `CustomUser.DoesNotExist` : si `AUTH_USER_MODEL` change un jour, ce code ne bouge pas.
