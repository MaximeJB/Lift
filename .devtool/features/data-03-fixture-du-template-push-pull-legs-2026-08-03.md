---
id: "data-03-fixture-du-template-push-pull-legs-2026-08-03"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "data"]
order: "f22"
---

# Semer le premier template : Push / Pull / Legs

**Ce que ca prend** : le tableau valide de `data-02`.
**Ce que ca retourne** : trois `WorkoutTemplate` en base, avec leurs `TemplateExercise`
ordonnes.

**Objectif** : donner quelque chose a l'ecran C4, qui est aujourd'hui un squelette vide.
On commence par un seul programme pour valider la mecanique avant de repeter.

## Etapes

1. Choisis la forme : commande de management, ou fixture JSON chargee par `loaddata` ?
   - **Commande** : peut chercher les exercices par nom, donc reste valide si les UUID
     changent. Plus de code.
   - **Fixture JSON** : declarative, mais fige les UUID des exercices. Si tu reimportes le
     catalogue, tout casse en silence.
   Mon avis : commande, pour la meme raison qui a fait reecrire `import_hevy` en strict.
2. Cree `liftapp/management/commands/seed_templates.py`.
3. Structure les donnees en haut du fichier, en dictionnaire Python lisible : nom du
   template, categorie, duree estimee, puis la liste des exercices avec `order`,
   `target_sets`, `target_reps_min`, `target_reps_max`, `rest_seconds`.
4. **Rends la commande idempotente.** La relancer deux fois ne doit pas creer six
   templates. Cherche `get_or_create` ou `update_or_create`, et comprends la difference
   entre les deux avant de choisir.
5. Si un nom d'exercice ne se resout pas, **arrete la commande avec une erreur**. Ne cree
   surtout pas un template incomplet en silence — c'est la lecon de `import_hevy`.
6. Ajoute `--dry-run` : affiche ce qui serait cree, n'ecrit rien.

**Ressources** :
- Doc Django, commandes de management : https://docs.djangoproject.com/en/5.2/howto/custom-management-commands/
- Doc Django, `update_or_create` : https://docs.djangoproject.com/en/5.2/ref/models/querysets/#update-or-create
- Recherche : `django management command idempotent seed data`
