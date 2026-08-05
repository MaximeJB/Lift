---
id: "c4-04-repos-par-defaut-venant-du-programme-2026-08-03"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["frontend"]
order: "aF"
---
# 16 — Utiliser le repos defini par le programme dans le minuteur de C5

**Ce que ca prend** : le champ `rest_seconds` de chaque `TemplateExercise`.
**Ce que ca retourne** : un minuteur qui demarre a la bonne duree selon l'exercice.

**Objectif** : C5 utilise aujourd'hui 90 secondes pour tout — c'est la valeur de la seance
libre, prevue par la spec (§9 BR-4). Un programme qui prescrit 180 secondes sur du squat
lourd et 60 sur des elevations laterales perd tout son interet si on ignore ces valeurs.

## Etapes

1. Retrouve dans `seance.tsx` la constante qui vaut 90.
2. Remplace-la par une valeur **par exercice**, pas par seance. Deux exercices du meme
   programme peuvent avoir des repos differents.
3. Garde 90 comme repli quand aucun template n'est actif ou quand `rest_seconds` est nul.
   Ne mets pas 0 : un minuteur a zero seconde est un minuteur casse.
4. Ajoute un test qui verifie que le bandeau affiche `3:00` quand le template dit 180.
   Regarde le test existant « le bandeau de repos demarre a la validation » et copie sa
   structure.

**Ressources** :
- Section C5 §9 BR-4 de `LIFT_Specification_Interface_V1.md`