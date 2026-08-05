---
id: "photo-01-modele-django-de-la-photo-de-seance-2026-08-03"
status: "todo"
priority: "low"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "photo"]
order: "aa"
---
# 37 — Ajouter le modele qui stocke une photo de seance

**Ce que ca prend** : une seance et un fichier image.
**Ce que ca retourne** : une table `SessionPhoto` et sa migration.

**Objectif** : permettre d'attacher une photo a une seance terminee. C'est un ticket
post-MVP : rien ne casse sans lui.

## Etapes

1. Cree le modele dans `liftapp/models.py`. Champs : la seance en cle etrangere, le fichier,
   la date d'ajout, et une legende optionnelle.
2. **Une photo par seance ou plusieurs ?** Tranche maintenant, parce que ca determine si tu
   mets un `ForeignKey` ou un `OneToOneField`, et changer d'avis apres coup demande une
   migration de donnees. Mon avis : `ForeignKey`, plusieurs photos — c'est le cas d'usage
   naturel (avant/apres) et ca ne coute rien de plus.
3. `on_delete=models.CASCADE` : supprimer une seance doit emporter ses photos. Sinon tu
   accumules des fichiers orphelins que plus rien ne reference.
4. **Le piege du `FileField`** : supprimer une ligne en base **ne supprime pas le fichier
   sur le disque**. Django a arrete de le faire en 1.3, volontairement. Cherche pourquoi, et
   note dans ce ticket comment tu comptes gerer le nettoyage — un signal `post_delete`, ou
   une commande de purge periodique.
5. Genere la migration, lis-la, applique-la.

**Ressources** :
- Doc Django, `ImageField` : https://docs.djangoproject.com/en/5.2/ref/models/fields/#imagefield
- Recherche : `django filefield delete file when model deleted post_delete signal`