---
id: "vis-03-bodydiagram-geometrie-2026-08-03"
status: "todo"
priority: "low"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["frontend", "design"]
order: "f42"
---

# Dessiner le schema corporel, sans encore le brancher

**Ce que ca prend** : rien, sinon une silhouette.
**Ce que ca retourne** : un composant `BodyDiagram` qui affiche un corps de face et de dos,
avec des zones identifiables.

**Objectif** : montrer d'un coup d'oeil quels muscles un exercice travaille. C'est
l'element visuel le plus ambitieux du MVP — et le plus facile a rater.

**Fais ce ticket en dernier parmi les visuels.** Il est long, et l'app est complete sans.

## Etapes

1. Trouve une silhouette SVG **libre de droits**, de face et de dos, avec les groupes
   musculaires en chemins separes. Verifie la licence et note-la dans ce ticket. Une
   illustration mal licenciee dans une app publiee, c'est un probleme juridique reel.
2. Chaque zone doit porter un identifiant qui correspond a une valeur de `muscle_group`.
   Si le SVG trouve ne les nomme pas ainsi, renomme-les a la main dans le fichier.
3. Le composant prend une liste de groupes a mettre en evidence, et une distinction entre
   primaire et secondaire — C2 affiche les deux differemment.
4. **N'utilise pas la couleur seule** pour distinguer primaire et secondaire. Un
   utilisateur daltonien ne verrait rien. Ajoute une difference de remplissage ou de
   contour. C'est une exigence d'accessibilite, pas une preference.
5. Story Storybook avec plusieurs combinaisons, dont : aucun groupe, un seul, tous.

**Ressources** :
- Recherche : `free svg human muscle anatomy diagram separate paths license`
- WCAG 1.4.1, « Use of Color » : https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
