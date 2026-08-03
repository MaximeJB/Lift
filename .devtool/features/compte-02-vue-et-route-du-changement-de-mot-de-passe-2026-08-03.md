---
id: "compte-02-vue-et-route-du-changement-de-mot-de-passe-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "compte"]
order: "f11"
---

# Brancher POST /api/auth/change-password/

**Ce que ca prend** : le serialiseur du ticket `compte-01`.
**Ce que ca retourne** : un 200 vide quand le changement passe, un 400 detaille sinon.

**Objectif** : exposer la validation deja ecrite derriere une vraie route.

## Etapes

1. Cree `PasswordChangeView` dans `accounts/views.py`. Herite d'`APIView` — c'est le choix
   de `LoginView` juste au-dessus, et pour la meme raison : aucun objet n'est cree ni
   recupere, donc les vues generiques n'apportent rien.
2. Mets `permission_classes = [IsAuthenticated]`. **Ne l'oublie pas** : sans ca, n'importe
   qui pourrait poster sur cette route, et `self.context['request'].user` serait
   `AnonymousUser`, ce qui ferait planter `check_password`.
3. Dans `post`, instancie le serialiseur avec `data=request.data` **et**
   `context={'request': request}`. Le contexte n'est pas automatique quand on instancie a
   la main dans une `APIView` — c'est l'erreur classique, et elle donne un `KeyError` peu
   parlant.
4. Appelle `is_valid(raise_exception=True)`, puis `set_password` sur l'utilisateur et
   `save()`.
5. **Question a trancher avant de finir** : apres un changement de mot de passe, faut-il
   invalider les jetons existants ? Un mot de passe change parce qu'on le croit compromis
   ne sert a rien si la session volee reste ouverte. Regarde ce que tu as decide dans
   `def-06` — les deux tickets parlent de la meme chose.
6. Ajoute la route dans `accounts/urls.py`, a cote de `me/`.

**Ressources** :
- Doc DRF, `APIView` : https://www.django-rest-framework.org/api-guide/views/
- Recherche : `drf apiview serializer context request manually`
- Recherche : `django set_password invalidate sessions`
