---
id: "qual-03-journalisation-et-remontee-derreurs-2026-08-03"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "production"]
order: "f72"
---

# Savoir ce qui casse en production

**Ce que ca prend** : la configuration `LOGGING` de Django.
**Ce que ca retourne** : des logs exploitables, et une alerte quand une erreur survient.

**Objectif** : une fois deploye, tu n'as plus la console. Un 500 chez un utilisateur
n'existe pour toi que si quelque chose te le dit.

## Etapes

1. Configure `LOGGING` dans les reglages de production. Le format compte : horodatage,
   niveau, module, message. Un log sans horodatage est inutilisable.
2. **Ne journalise jamais** un mot de passe, un jeton, ou le corps complet d'une requete
   d'authentification. C'est l'erreur la plus courante et la plus grave : les logs sont
   souvent moins bien proteges que la base.
3. Ajoute un identifiant de correlation par requete, pour relier les lignes d'une meme
   requete. Cherche `django-request-id` ou ecris un middleware — c'est un bon exercice, une
   trentaine de lignes.
4. Pour la remontee d'erreurs, regarde Sentry. Le niveau gratuit suffit largement pour une
   app personnelle, et l'integration Django est une dizaine de lignes.
5. **Verifie le filtrage des donnees sensibles de Sentry** avant de l'activer. Par defaut il
   capture les variables locales de la trace, ce qui peut inclure un mot de passe en clair.
   L'option existe, il faut la mettre.
6. Provoque une erreur volontaire en production et verifie qu'elle arrive bien.

**Ressources** :
- Doc Django, journalisation : https://docs.djangoproject.com/en/5.2/topics/logging/
- Doc Sentry pour Django : https://docs.sentry.io/platforms/python/integrations/django/
- Recherche : `sentry django send_default_pii scrub sensitive data`
