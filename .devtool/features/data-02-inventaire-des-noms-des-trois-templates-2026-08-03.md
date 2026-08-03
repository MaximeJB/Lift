---
id: "data-02-inventaire-des-noms-des-trois-templates-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["data"]
order: "f21"
---

# Etablir la liste des exercices des trois programmes, et la confronter a la base

**Ce que ca prend** : les noms d'exercices deja recherches, notes dans le ticket
`seeding-templates-ppl-split-fullbody`.
**Ce que ca retourne** : un tableau a trois colonnes — nom voulu, exercice trouve en base,
ou rien.

**Objectif** : savoir ce qui manque **avant** d'ecrire la moindre ligne de seeding. C'est
la contrainte que tu as posee : aucune correspondance approximative. Un template qui pointe
vers le mauvais exercice est pire qu'un template absent.

## Etapes

1. Ecris un script jetable — dans un shell `python manage.py shell`, pas un fichier
   versionne.
2. Pour chaque nom voulu, cherche en base avec la fonction de `data-01` : normalise le nom
   voulu, normalise les 873 noms de la base, compare a l'identique.
3. Affiche trois listes : trouves sans ambiguite, trouves plusieurs fois, introuvables.
4. **Les trouves plusieurs fois sont le vrai probleme.** « Bench Press » peut exister en
   barre, halteres, machine. Il faut trancher a la main lequel le template designe.
5. Ecris le resultat dans le ticket `seeding-templates-ppl-split-fullbody`, sous forme de
   tableau. C'est ce tableau qui servira de source au ticket suivant.
6. Pour les introuvables, deux options : renoncer a l'exercice, ou le creer en base. Note
   ton choix pour chacun.

**Ressources** :
- Doc Django, shell : https://docs.djangoproject.com/en/5.2/ref/django-admin/#shell
- Recherche : `django queryset annotate lower name comparison`
