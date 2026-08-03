---
id: "c4-03-demarrer-une-seance-depuis-un-programme-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["frontend", "ecran"]
order: "f32"
---

# Brancher « Demarrer ce programme » sur C5

**Ce que ca prend** : un template affiche dans C4.
**Ce que ca retourne** : une seance creee avec `template` renseigne, et C5 pre-remplie.

**Objectif** : c'est la raison d'etre des programmes. Sans ca, C4 est une brochure.

## Etapes

1. Regarde comment C5 cree sa seance aujourd'hui : `createSession` avec `template: null`.
   Ta modification consiste a passer l'identifiant du template a la place.
2. Passe l'id par les parametres de navigation, comme C5 passe deja `seance` a C6.
3. Dans C5, si un template est fourni, **pre-charge ses exercices** dans la liste au lieu de
   partir d'un ecran vide.
4. Le titre genere doit reprendre le nom du programme, pas « Seance libre — date ».
5. **Attention a l'ordre des effets.** C5 cree la seance dans un `useEffect` au montage. Si
   le chargement du template est un second appel reseau, tu as deux effets concurrents et
   un risque de creer la seance avant de savoir quoi y mettre. Reflechis a l'enchainement
   avant de coder — un `useEffect` qui depend d'un autre se signale par sa liste de
   dependances.
6. Verifie que le cas sans template continue de marcher exactement comme avant. Les 20 tests
   de `seance.test.tsx` doivent rester verts sans modification.

**Ressources** :
- Doc React, `useEffect` et dependances : https://react.dev/reference/react/useEffect
- Recherche : `react useEffect sequential async calls avoid race`
