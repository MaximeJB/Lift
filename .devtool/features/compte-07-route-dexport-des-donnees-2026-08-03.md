---
id: "compte-07-route-dexport-des-donnees-2026-08-03"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "compte", "rgpd"]
order: "a6"
---
# 07 — GET /api/auth/me/export/ — livrer l'export

**Ce que ca prend** : le serialiseur de `compte-06`.
**Ce que ca retourne** : un JSON, et une decision sur la facon de le livrer.

**Objectif** : rendre l'export recuperable depuis l'app.

## Deux facons de livrer, a choisir

**En reponse JSON classique.** Simple, testable, le client affiche ou partage. Convient
tant que le volume reste petit — quelques centaines de seances, c'est quelques centaines de
kilo-octets.

**En fichier telecharge**, avec un en-tete `Content-Disposition: attachment`. Plus proche
de ce qu'attend un utilisateur qui clique « exporter mes donnees ». Un peu plus de code, et
il faut gerer le nom du fichier.

Mon avis : JSON classique pour le MVP. Le telechargement se rajoute en une heure quand le
besoin sera reel, et tu ne sais pas encore comment l'ecran D1 voudra le presenter.

## Etapes

1. Cree `UserExportView`, une `APIView` en lecture seule, `IsAuthenticated`.
2. Serialise `request.user`. **Jamais** un utilisateur passe en parametre d'URL : ca
   transformerait l'export en fuite de donnees des qu'on oublie un controle.
3. Route dans `accounts/urls.py`.
4. Trois tests : le contenu contient bien les seances, il ne contient pas le mot de passe,
   et il ne contient rien d'`autre_user`.
5. **Un point de performance a regarder** : si tu charges 200 seances avec leurs series,
   combien de requetes SQL partent ? Installe `django-debug-toolbar` ou utilise
   `django.db.connection.queries` pour compter. Si le nombre grimpe avec le nombre de
   seances, cherche `prefetch_related` — c'est le probleme N+1, et l'export est l'endroit
   ou il fait le plus mal.

**Ressources** :
- Doc Django, `prefetch_related` : https://docs.djangoproject.com/en/5.2/ref/models/querysets/#prefetch-related
- Recherche : `django N+1 query problem prefetch_related nested serializer`
- Recherche : `drf Content-Disposition attachment json download`