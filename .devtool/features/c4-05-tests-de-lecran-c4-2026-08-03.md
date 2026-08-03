---
id: "c4-05-tests-de-lecran-c4-2026-08-03"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["frontend", "tests"]
order: "f34"
---

# Couvrir C4 et remonter le seuil global

**Ce que ca prend** : les tickets `c4-01` a `c4-04`.
**Ce que ca retourne** : environ douze tests dans `src/ecrans/`, et un seuil de couverture
releve dans `jest.config.js`.

**Objectif** : C4 est le dernier dossier a 0%. Le couvrir fait franchir un palier au
chiffre global.

## Les cas

1. Le nom du programme s'affiche.
2. Les exercices apparaissent dans l'ordre du champ `order`, pas dans l'ordre de la reponse.
3. La fourchette de repetitions s'affiche `3 × 8-12`, et `3 × 10` quand min egale max.
4. Un programme sans exercice affiche un etat vide, pas une liste vide muette.
5. Une erreur reseau affiche la banniere et « Reessayer ».
6. « Reessayer » relance bien l'appel.
7. « Demarrer ce programme » appelle `createSession` avec le bon `template`.
8. Le titre de la seance creee reprend le nom du programme.
9. C5 ouverte depuis un programme affiche ses exercices sans qu'on les ajoute.
10. Le minuteur prend le repos du template.
11. Sans template, le minuteur reste a 90 secondes.
12. Un template introuvable affiche un message clair, pas un ecran blanc.

## Ou ecrire les tests

Dans `src/ecrans/`, **jamais dans `app/`** : expo-router transformerait le fichier de test
en route de l'application. C'est explique en haut de `jest.config.js`.

## Ensuite

Relance `npm run test:coverage`, note le nouveau chiffre, et **remonte les seuils** de
`jest.config.js` au palier atteint. C'est le principe du cliquet : il ne sert que si on le
serre.

**Ressources** :
- `src/ecrans/lift.test.tsx`, qui couvre deja C2, C6 et C8 — meme structure
