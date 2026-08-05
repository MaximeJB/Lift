---
id: "data-06-exercise-type-dans-letl-2026-08-03"
status: "todo"
priority: "low"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "data"]
order: "af"
---
# 42 — Completer `exercise_type` sur les exercices du catalogue

**Ce que ca prend** : les 873 exercices en base, dont beaucoup ont un `exercise_type` vide
ou par defaut.
**Ce que ca retourne** : un type juste sur chacun — ou un type absent, assume.

**Objectif** : le type determine **quels champs C5 affiche**. Un exercice de gainage
demande une duree, pas des repetitions. Aujourd'hui l'ecran affiche poids et repetitions
pour tout le monde, ce qui n'a pas de sens sur une planche.

Ce ticket est marque post-MVP : l'app fonctionne sans, elle est juste moins fine.

## Etapes

1. Compte d'abord l'ampleur : combien d'exercices ont un type, combien n'en ont pas ?
   `Exercise.objects.values('exercise_type').annotate(n=Count('id'))` te donne la
   repartition en une ligne. **Fais ca avant de decider quoi que ce soit** — si 95% sont
   deja bons, le ticket se reduit a corriger 40 lignes a la main.
2. Regarde ce que la source Hevy fournit dans `data/`. Si le champ y est, la correspondance
   stricte de `import_hevy` peut le porter.
3. **La regle absolue reste la meme** : aucune donnee approximative. Si le type ne se deduit
   pas de facon certaine, on laisse vide. Un exercice sans type s'affichera avec les champs
   par defaut, ce qui est le comportement actuel — donc aucune regression.
4. Pour ceux qui restent, une heuristique par mot-clef est acceptable **a condition d'etre
   verifiee a la main** : « plank », « hold », « carry » suggerent une duree. Genere la
   liste, relis-la, applique.
5. Cote front, verifie ensuite que C5 reagit bien au type. Si ce n'est pas cable, ouvre un
   ticket separe — ne melange pas les deux.

**Ressources** :
- Doc Django, `annotate` et `Count` : https://docs.djangoproject.com/en/5.2/topics/db/aggregation/
- Recherche : `django group by count distinct field values queryset`