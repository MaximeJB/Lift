---
id: "vis-02-composant-muscleicon-2026-08-03"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["frontend", "design"]
order: "aX"
---
# 34 — Creer le composant qui affiche l'icone d'un groupe musculaire

**Ce que ca prend** : une valeur de `muscle_group`, par exemple `"CHEST"`.
**Ce que ca retourne** : le composant graphique correspondant, a la taille demandee.

**Objectif** : avoir un seul endroit qui sait faire la correspondance entre une valeur de
base et un dessin. Sans ca, chaque ecran refera son `switch`.

## Etapes

1. Cree `src/shared/components/ui/MuscleIcon.tsx`.
2. L'interface : une prop `groupe` obligatoire, une prop `taille` avec une valeur par
   defaut.
3. **Le point important** : que se passe-t-il si la valeur recue n'est dans aucune des 18 ?
   Ca arrivera — un exercice importe avec un groupe inattendu. Le composant doit rendre une
   icone de repli, jamais planter et jamais rien rendre. Un ecran qui perd une icone en
   silence est plus difficile a diagnostiquer qu'un point d'interrogation visible.
4. La couleur vient des **tokens semantiques**, jamais d'une couleur en dur ni d'une classe
   Tailwind sur le SVG. Regarde `tokens/MAPPING.md` pour trouver le role adapte — et s'il
   n'existe pas, **signale-le**, ne prends pas une primitive au hasard.
5. Ecris une story Storybook qui montre les 18 d'un coup, plus le cas de repli. C'est le
   seul moyen de reperer une icone laide au milieu des autres.
6. Tests : le rendu de chaque groupe, le repli, et le respect de la prop `taille`.

**Ressources** :
- `tokens/MAPPING.md`, section des roles de couleur
- Recherche : `react component icon map fallback typescript record`