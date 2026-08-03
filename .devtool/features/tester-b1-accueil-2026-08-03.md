---
id: "tester-b1-accueil-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: "2026-08-04"
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["test", "b1"]
order: "c9"
---
# À TESTER — L'accueil (B1)

**Objectif** : c'est le premier écran vu à chaque ouverture. Ses chiffres sont calculés
côté client, à partir des mêmes formules qu'en C6 et C8 — il faut donc vérifier qu'ils
disent la même chose sur les trois écrans.

1. **Le bouton « Démarrer une séance » est visible immédiatement**, avant même que les
   statistiques aient chargé. Couper Django, ouvrir l'accueil : la bannière d'erreur
   s'affiche et **le bouton reste utilisable**. C'est le critère B1 §9 BR-6.
2. **Volume cette semaine** : le comparer à la main. C'est la somme de `poids × reps` sur
   les séries **hors échauffement** des séances de la semaine en cours, lundi à dimanche.
   Le même total doit apparaître dans le relevé de C6 pour une séance unique.
3. **La variation en %** n'apparaît QUE si la semaine précédente a du volume. Sur un
   compte neuf, elle doit être **absente**, pas à 0 %.
4. **Séances** compte les séances de la semaine, échauffements compris — c'est un nombre
   de séances, pas de séries.
5. **Records récents** : cinq au maximum, un seul par exercice, le plus récent d'abord.
   Battre deux fois un record sur le même exercice ne doit produire qu'**une** carte.
6. Taper une carte de record → la fiche de l'exercice (C2) s'ouvre.
7. Sur un compte sans record, l'état vide s'affiche à la place du carrousel.
8. **« Voir tout l'historique »** → le tab Lift s'ouvre directement sur le segment
   Historique, pas sur Séances.
9. **Tirer vers le bas** → rafraîchissement.
10. La salutation dit « Prêt pour ta première séance ? » tant qu'aucune séance n'existe,
    et « Ta semaine » ensuite.

## Connu, pas un bug

- Les deux endpoints `GET /api/lift/stats/weekly/` et `/api/lift/stats/prs/` n'existent
  pas. Tout est calculé côté client à partir d'**une page de 25 séances**. Pour la semaine
  courante c'est très large ; pour les records, un plus ancien que ces 25 séances sortirait
  de la fenêtre et serait « rebattu » à tort. Le calcul devra passer côté serveur quand
  l'historique grandira.
