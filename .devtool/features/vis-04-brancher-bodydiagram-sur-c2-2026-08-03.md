---
id: "vis-04-brancher-bodydiagram-sur-c2-2026-08-03"
status: "todo"
priority: "low"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["frontend", "design"]
order: "aZ"
---
# 36 — Afficher le schema corporel dans le detail d'un exercice

**Ce que ca prend** : le composant de `vis-03`, et les groupes musculaires deja renvoyes
par l'API.
**Ce que ca retourne** : C2 avec un schema en haut, a la place ou a cote du texte actuel.

**Objectif** : C2 liste aujourd'hui les muscles en texte. Le schema dit la meme chose plus
vite.

## Etapes

1. C2 recoit deja `muscle_group` et `secondary_muscle_groups`. Verifie leur format exact —
   les secondaires sont des chaines depuis qu'on a ajoute `__str__` sur `MuscleGroup`, ce
   qui n'est pas la meme chose que des valeurs d'enumeration. **Il faudra peut-etre
   convertir**, et c'est le vrai travail de ce ticket.
2. Si la conversion s'avere ambigue, le probleme est cote API : signale-le plutot que de
   bricoler une table de correspondance dans le front.
3. Garde la liste textuelle **en plus** du schema. Un schema seul n'est pas accessible aux
   lecteurs d'ecran, et certains utilisateurs preferent lire.
4. Mets a jour les tests de C2 dans `lift.test.tsx` : le schema apparait, et les sections
   vides restent masquees.
5. Proposition visuelle au bareme de `SLOP.md`, sur telephone.

**Ressources** :
- Section C2 de `LIFT_Specification_Interface_V1.md`