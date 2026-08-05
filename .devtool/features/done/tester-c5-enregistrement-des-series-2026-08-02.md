---
id: "tester-c5-enregistrement-des-series-2026-08-02"
status: "done"
priority: "high"
assignee: null
epic: null
dueDate: "2026-08-03"
created: "2026-08-02T00:00:00.000Z"
modified: "2026-08-04T07:20:02.480Z"
completedAt: "2026-08-04T07:20:02.481Z"
labels: ["demain", "test", "c5"]
order: "ao"
---
# DEMAIN — Tester C5 : enregistrement des séries et bandeau de repos

**Objectif** : vérifier sur l'appareil ce qui n'a été vérifié que par les contrôles
statiques. Le code compile, passe le lint et n'utilise aucune classe hors thème — rien de
tout cela ne prouve que l'écriture optimiste se comporte correctement.

```powershell
cd c:\Users\maxym\Desktop\Projets\Lift\frontend
npx expo start -c
```

Tab Lift → Séances → Séance libre → Ajouter un exercice.

## Les six vérifications

1. **`Ab Crunch Machine`** (`WEIGHT_REPS`) → le formulaire montre poids et répétitions.
   Valider → la ligne apparaît immédiatement, `NON SYNC` disparaît dès la réponse.
2. **Trois séries d'affilée** → les numéros s'incrémentent, le poids et les répétitions
   restent en place, le RPE et l'échauffement se vident.
3. **Appui long sur « Valider la série »** → la ligne porte `ÉCHEC`.
4. **`Air Bike`** (`DURATION`) → ni poids, ni répétitions, ni RPE. Saisir `45`, puis
   `1:30` sur la série suivante : les deux formes doivent être acceptées.
5. **Couper Django**, puis valider une série → elle reste à l'écran, marquée `NON SYNC`,
   et l'en-tête les compte. Relancer Django, taper « Réessayer » → tout part, le compteur
   revient à zéro.
6. **Quitter avec des séries en attente** → le dialogue annonce qu'elles seront perdues.

## Le bandeau de repos (lot 3)

7. Valider une série → le bandeau apparaît en bas, **90 secondes**, six cellules pleines.
   Une cellule s'éteint toutes les 15 secondes.
8. Taper `+15 s` → une cellule s'ajoute. `−15 s` → elle disparaît. Le plancher est de
   15 secondes, on ne peut pas descendre en dessous.
9. **Ouvrir le clavier** en tapant dans un champ → le bandeau doit remonter avec lui, et
   ne jamais recouvrir le formulaire.
10. Valider une nouvelle série pendant que le repos tourne → il ne bloque rien, se clôt, et
    un nouveau repos démarre.
11. Laisser le décompte atteindre zéro → le bandeau disparaît de lui-même.
12. Vérifier en base que `rest_seconds` est bien renseigné sur les séries concernées :

```powershell
python -c "import sqlite3; c=sqlite3.connect('db.sqlite3'); print(list(c.execute('select set_number, weight_kg, reps, rest_seconds, is_warmup, is_failure from liftapp_set order by created_at')))"
```

La durée enregistrée est le temps **d'horloge**, pas la durée visée : taper `+15 s` sans
attendre ne la change pas.

## Ce qui est déjà connu et n'est pas un bug

- Un exercice en durée envoie `weight_kg = 0` et `reps = 0` : les deux champs ne sont pas
  nullables sur le modèle `Set`. Correction backend à décider — `null=True, blank=True`
  plus une migration.
- Le temps de repos n'est pas enregistré si la série est encore `NON SYNC` au moment où
  le repos se termine : sans identifiant serveur, il n'y a rien à patcher. La série, elle,
  n'est pas perdue.
- La durée de repos vaut toujours 90 secondes : elle viendra de
  `TemplateExercise.rest_seconds` quand C4 existera, et aucun template n'est en base.