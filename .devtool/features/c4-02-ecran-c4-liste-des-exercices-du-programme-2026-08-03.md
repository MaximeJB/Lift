---
id: "c4-02-ecran-c4-liste-des-exercices-du-programme-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["frontend", "ecran"]
order: "f31"
---

# Remplir l'ecran C4 — le detail d'un programme

**Ce que ca prend** : l'identifiant du template, recu en parametre de route.
**Ce que ca retourne** : un ecran qui liste les exercices du programme, dans l'ordre.

**Objectif** : `app/(tabs)/lift/template/[id].tsx` existe mais ne rend rien. C'est le seul
ecran de la spec encore vide.

## Etapes

1. Relis la section C4 de `LIFT_Specification_Interface_V1.md`. Toute la structure y est —
   etats, cas limites, criteres d'acceptation. **N'invente rien qui n'y figure pas.**
2. Reprends les motifs deja etablis : `useLocalSearchParams` pour l'id, chargement dans un
   `useEffect`, banniere d'erreur avec « Reessayer ». Regarde `lift/[id].tsx` (C2), qui
   fait exactement ca.
3. Pour chaque exercice, affiche le nom, le nombre de series visees, et la fourchette de
   repetitions. Le format de la fourchette : `3 × 8-12`. Une seule valeur si min et max
   sont egaux — sinon tu affiches `3 × 10-10`, ce qui est ridicule.
4. Le bouton principal est « Demarrer ce programme ». Il ne fait rien pour l'instant, le
   ticket suivant le branche.
5. **Ne cree aucun composant nouveau sans demander.** Si un bloc te semble reutilisable,
   signale-le, ne le fabrique pas.
6. Passe la proposition visuelle au bareme de `SLOP.md`, montre-la sur telephone via
   `npm run storybook:native`.

**Ressources** :
- Doc expo-router, routes dynamiques : https://docs.expo.dev/versions/v54.0.0/sdk/router/
