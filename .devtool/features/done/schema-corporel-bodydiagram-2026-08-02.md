---
id: "schema-corporel-bodydiagram-2026-08-02"
status: "done"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-02T00:00:00.000Z"
modified: "2026-08-04T07:20:06.336Z"
completedAt: "2026-08-04T07:20:06.336Z"
labels: ["avant-mvp", "bloquant-mvp", "design"]
order: "a01"
---
# À REVOIR AVANT LE MVP — Le schéma corporel (BodyDiagram)

**Objectif** : montrer quels muscles un exercice sollicite, sur une silhouette avant et
arrière, muscle principal et secondaires distingués. C'est la section « Muscles
sollicités » de C2 §6.

## État au 02/08/2026

**Rien n'existe.** Ni les tracés des silhouettes, ni `react-native-svg` dans les
dépendances. C2 affiche les mêmes données en texte — groupe principal en registre codé,
secondaires en étiquettes — ce qui couvre l'exigence C2 §11 d'alternative textuelle,
mais pas le schéma lui-même.

## Ce que la spec demande

- C2 §9 BR-2 : une seule vue si tous les groupes sont sur la même face, les deux vues
  côte à côte sinon.
- C2 §9 BR-3 : `FULL_BODY` surligne l'intégralité des deux silhouettes, uniformément.
- C2 §12 : sur petit écran, bascule avant/arrière au lieu du côte à côte.
- C2 §13 : assets vectoriels (SVG) recommandés.

## Ce qui est déjà décidé

Les deux couleurs existent et sont réservées depuis le 31/07/2026, voir
`tokens/MAPPING.md §1` :

| Rôle | Token | Valeur |
|---|---|---|
| muscle principal | `color.diagram-muscle-primary` | `#E15F35` |
| muscles secondaires | `color.diagram-muscle-secondary` | `#57503F` |

C'est le seul endroit du système où deux teintes co-existent dans une même vue — écart
assumé à la contrainte §12, tranché à l'atelier visuel.

## Ce qu'il reste à faire

1. Décider de la source des silhouettes : dessin propre, ou jeu SVG sous licence.
2. Installer `react-native-svg`.
3. Cartographier les 18 valeurs de `MUSCLE_GROUP_CHOICES` vers les zones du tracé, et
   décider de la face (avant / arrière / les deux) de chacune.
4. Seulement 124 exercices sur 873 ont des muscles secondaires renseignés — vérifier
   que le schéma reste lisible quand il n'y a qu'un muscle principal.