---
id: "prod-03-verrouiller-allowed-hosts-et-cors-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "production", "securite"]
order: "aJ"
---
# 20 — Restreindre qui peut appeler l'API

**Ce que ca prend** : `ALLOWED_HOSTS` et la configuration CORS.
**Ce que ca retourne** : une API qui refuse les hotes et les origines non declares.

**Objectif** : `ALLOWED_HOSTS` vide avec `DEBUG=False` fait refuser toutes les requetes —
donc il faut le remplir. Et une configuration CORS trop large laisse n'importe quel site
web appeler l'API depuis le navigateur d'un utilisateur connecte.

## Etapes

1. Renseigne `ALLOWED_HOSTS` en production depuis l'environnement, en liste separee par des
   virgules.
2. Regarde si `django-cors-headers` est deja installe. Si oui, verifie sa configuration
   actuelle — il y a de bonnes chances qu'elle soit en mode permissif pour le
   developpement.
3. **Comprends d'abord si tu en as besoin.** Une app React Native native n'est pas soumise
   au CORS : c'est une regle de navigateur. Mais `expo start --web` l'est, et Storybook web
   aussi. Determine ton cas avant de configurer quoi que ce soit.
4. Si tu en as besoin : liste les origines explicitement. **Jamais**
   `CORS_ALLOW_ALL_ORIGINS = True` en production.
5. Ajoute `CSRF_TRUSTED_ORIGINS` si des formulaires Django sont exposes — l'admin en est un.

**Ressources** :
- Doc `django-cors-headers` : https://github.com/adamchainz/django-cors-headers
- Recherche : `does react native need cors django api`