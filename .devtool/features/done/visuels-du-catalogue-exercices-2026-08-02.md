---
id: "visuels-du-catalogue-exercices-2026-08-02"
status: "done"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-02T00:00:00.000Z"
modified: "2026-08-04T07:20:04.594Z"
completedAt: "2026-08-04T07:20:04.594Z"
labels: ["avant-mvp", "bloquant-mvp", "design"]
order: "b08"
---
# À REVOIR AVANT LE MVP — Les visuels du catalogue d'exercices

**Objectif** : qu'une fiche d'exercice montre quelque chose. Aujourd'hui 664 fiches sur
873 n'ont aucun visuel, ni en liste (C1) ni en détail (C2).

## Mesures du 02/08/2026, sur la base réelle

| | |
|---|---|
| exercices | 873 |
| avec `video_url` | 209 — soit 24% |
| avec `image_url` | **0** |
| avec description | 868 |

## Ce qui manque

**La cascade de C2 §9 BR-1** est « vidéo → image → icône générique, jamais d'espace
vide ». Elle n'a plus qu'un maillon sur trois : la vidéo est lue depuis le 02/08/2026
via `expo-video`, `image_url` est vide sur toute la base, et l'icône générique n'existe
pas.

**Les 18 icônes de groupe musculaire** (C1 §7, C2 §7) n'ont jamais été produites. Elles
servent de repli en liste ET en détail. Le système n'a par ailleurs AUCUNE famille
d'icônes : en choisir une engage la contrainte §12 de la Design-System-Specification,
« one icon family per composition ». C'est une décision de design, pas une tâche de code.

## Trois pistes, à trancher

1. **Produire les 18 icônes** — travail de design, débloque C1 et C2 d'un coup.
2. **Remplir `image_url`** depuis la source du pipeline ETL, si les images existent
   côté fournisseur. À vérifier dans `data/`.
3. **Assumer l'absence de visuel** et pousser la typographie à la place. Cohérent avec
   la DNA « instrument », mais laisse une fiche pauvre pour 76% du catalogue.

## Pourquoi c'est bloquant pour le MVP

Une application d'entraînement dont trois fiches sur quatre ne montrent pas le mouvement
ne remplit pas son objectif : C2 §1 dit « donner tout ce qu'il faut pour exécuter
correctement un mouvement ».