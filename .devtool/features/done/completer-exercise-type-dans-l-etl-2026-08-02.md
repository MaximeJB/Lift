---
id: "completer-exercise-type-dans-l-etl-2026-08-02"
status: "done"
priority: "low"
assignee: null
epic: null
dueDate: null
created: "2026-08-02T00:00:00.000Z"
modified: "2026-08-04T07:20:03.956Z"
completedAt: "2026-08-04T07:20:03.956Z"
labels: ["apres-mvp", "backend", "etl"]
order: "aB"
---
# Compléter `exercise_type` dans le pipeline ETL

> **03/08/2026 — première moitié faite.** `reparer_types_exercices` a purgé les données
> issues d'appariements approximatifs et n'a gardé que les 86 démontrables. La base ne
> contient plus aucun type, aucune vidéo ni aucun muscle secondaire faux. Reste à
> renseigner les **787 exercices sans type**, ce qui ne peut plus venir de Hevy : son
> catalogue ne compte que 435 entrées, et 349 n'ont aucun équivalent nommé dans la base.

**Objectif** : que le formulaire de saisie de C5 corresponde vraiment à l'exercice. C5 §9
BR-1 exige un formulaire strictement dérivé de `exercise_type`, et §16 en fait un
anti-pattern explicite d'afficher poids+reps sur un exercice en durée. Aujourd'hui c'est
impossible à tenir pour trois exercices sur quatre.

## Mesures du 02/08/2026

| `exercise_type` | exercices |
|---|---|
| **vide** | **653** |
| `WEIGHT_REPS` | 141 |
| `REPS_ONLY` | 58 |
| `DURATION` | 8 |
| `DISTANCE_DURATION` | 6 |
| `BODYWEIGHT_WEIGHTED` | 3 |
| `BODYWEIGHT_ASSISTED` | 0 |

Et quatre lignes portent des valeurs **absentes de `TRAINING_FORMAT_CHOICES`** :
`SHORT_DISTANCE_WEIGHT` (2), `STEPS_DURATION` (1), `FLOORS_DURATION` (1). Django ne
vérifie pas `choices` au niveau base — l'ETL a écrit ce qu'il voulait.

## Ce que le frontend fait en attendant

`champsPour()` dans `SetInputForm.tsx` replie tout type inconnu ou vide sur
**poids + répétitions**, ce qui couvre le cas majoritaire. Ce repli est marqué dans le
code et doit disparaître quand le champ sera renseigné.

## Pistes

1. **Déduire depuis les données existantes** — `equipment_needed` vaut `body only` sur une
   partie du catalogue, ce qui oriente vers `REPS_ONLY` ou `BODYWEIGHT_WEIGHTED`. À
   croiser avec `muscle_group` et le nom.
2. **Reprendre la source de l'ETL** — vérifier dans `data/` si le champ existe côté
   fournisseur et n'a simplement pas été mappé.
3. **Aligner les 4 valeurs hors choix** sur les 6 de `TRAINING_FORMAT_CHOICES`, ou étendre
   les choix si ces formats sont légitimes.

## Vérification

```powershell
python -c "import sqlite3; c=sqlite3.connect('db.sqlite3'); print(list(c.execute('select exercise_type, count(*) from liftapp_exercise group by exercise_type order by 2 desc')))"
```

Cible : zéro ligne à `exercise_type` vide, et aucune valeur hors des six choix.
---

## Archivage errone, constate le 04/08/2026

Cette carte etait dans `done/` alors que le code ne la porte pas. 86 exercices sur 873 portent un `exercise_type`. Le travail est repris par la carte 42.

Elle reste ici comme trace de l'intention initiale.