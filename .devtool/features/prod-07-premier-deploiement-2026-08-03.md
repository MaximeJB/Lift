---
id: "prod-07-premier-deploiement-2026-08-03"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["production"]
order: "aO"
---
# 25 — Mettre le backend en ligne

**Ce que ca prend** : les tickets `prod-01` a `prod-06`.
**Ce que ca retourne** : une URL publique qui repond, et une procedure ecrite.

**Objectif** : passer de « ca marche chez moi » a « ca marche ».

## Etapes

1. Cree le service et la base chez l'hebergeur choisi.
2. Renseigne les variables d'environnement. Reprends `.env.example` cle par cle — c'est
   pour ca qu'on l'a fait.
3. Installe `gunicorn` et ajoute-le a `requirements.txt`. Le serveur de developpement de
   Django ne doit **jamais** servir en production ; il est mono-thread et ne gere ni les
   erreurs ni les timeouts correctement.
4. Configure les fichiers statiques. L'admin Django ne s'affichera pas sans ca —
   `whitenoise` est le moyen le plus simple, il sert les statiques depuis Python sans
   serveur web separe.
5. Fais tourner `migrate` sur la base de production.
6. Cree un superutilisateur, verifie l'admin.
7. Charge le catalogue d'exercices.
8. **Teste depuis le telephone**, pas depuis le navigateur. Change l'URL de base dans le
   front et fais un parcours complet : inscription, seance, finalisation, historique.
9. Ecris la procedure de deploiement dans un `DEPLOIEMENT.md`, etape par etape. Tu la
   reliras dans trois mois et tu n'en auras aucun souvenir.

**Ressources** :
- Doc Django, gunicorn : https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/gunicorn/
- Doc whitenoise : https://whitenoise.readthedocs.io/
- Recherche : `django whitenoise collectstatic production setup`