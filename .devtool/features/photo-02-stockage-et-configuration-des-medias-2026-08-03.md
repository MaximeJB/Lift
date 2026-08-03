---
id: "photo-02-stockage-et-configuration-des-medias-2026-08-03"
status: "todo"
priority: "low"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "photo"]
order: "f51"
---

# Configurer ou vont les fichiers televerses

**Ce que ca prend** : `MEDIA_ROOT` et `MEDIA_URL` dans les reglages.
**Ce que ca retourne** : des fichiers servis correctement en developpement.

**Objectif** : sans cette configuration, un `ImageField` accepte le fichier et le perd.

## Etapes

1. Ajoute `MEDIA_ROOT` et `MEDIA_URL` dans `Lift/settings.py`.
2. En developpement uniquement, ajoute la route qui sert les medias dans `urls.py`. Django
   fournit un helper pour ca — cherche `static()` dans `django.conf.urls.static`.
3. **Comprends pourquoi c'est « en developpement uniquement »** avant de le copier. Django
   sert les fichiers de facon volontairement inefficace, et le fait explicitement savoir
   dans sa doc. En production, c'est le serveur web ou un stockage objet qui s'en charge.
4. Ajoute le dossier des medias au `.gitignore`. Des photos versionnees dans git, c'est un
   depot qui grossit sans fin et qu'on ne peut plus alleger.
5. `Pillow` est necessaire pour un `ImageField`. Installe-le et ajoute-le a
   `requirements.txt`.
6. Note dans ce ticket qu'un stockage local ne survivra pas au deploiement — beaucoup
   d'hebergeurs ont un disque ephemere. Le ticket `prod-06` traite ce probleme.

**Ressources** :
- Doc Django, fichiers televerses : https://docs.djangoproject.com/en/5.2/topics/files/
- Recherche : `django MEDIA_ROOT MEDIA_URL development static serve`
