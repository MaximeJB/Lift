---
id: "prod-05-checklist-de-securite-django-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "production", "securite"]
order: "aM"
---
# 23 — Faire passer `manage.py check --deploy` sans avertissement

**Ce que ca prend** : les reglages de production.
**Ce que ca retourne** : une commande qui ne signale plus rien, et une decision ecrite pour
chaque point qu'on choisit d'ignorer.

**Objectif** : Django embarque une liste de verifications de securite. Elle couvre des
choses qu'on oublie tous — HSTS, cookies securises, protection du type de contenu. La
lancer prend dix secondes ; corriger apres une fuite prend des semaines.

## Etapes

1. `python manage.py check --deploy --settings=Lift.settings.prod`
2. Lis chaque avertissement **et cherche ce qu'il signifie** avant de copier le reglage.
   Certains, comme `SECURE_SSL_REDIRECT`, dependent de la facon dont l'hebergeur termine le
   TLS — les activer a l'aveugle peut creer une boucle de redirection infinie.
3. Les points a traiter, dans l'ordre d'importance : `DEBUG`, `SECRET_KEY`,
   `ALLOWED_HOSTS`, `SECURE_HSTS_SECONDS`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`,
   `SECURE_CONTENT_TYPE_NOSNIFF`.
4. **Attention a HSTS** : une fois envoye, le navigateur refuse le HTTP pour ce domaine
   pendant la duree indiquee, et on ne peut pas revenir en arriere. Commence par une valeur
   courte, quelques minutes, et monte quand tu es sur.
5. Pour chaque avertissement que tu decides de ne pas traiter, ecris pourquoi dans ce
   ticket. Un avertissement ignore sans raison ecrite sera ignore pour toujours.

**Ressources** :
- Doc Django, checklist de deploiement : https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/
- Recherche : `django SECURE_HSTS_SECONDS irreversible preload risk`