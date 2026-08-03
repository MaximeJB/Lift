---
id: "vis-01-inventaire-des-icones-de-groupe-musculaire-2026-08-03"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["frontend", "design"]
order: "f40"
---

# Decider du format des 18 icones de groupe musculaire

**Ce que ca prend** : la liste des 18 valeurs de `muscle_group` cote Django.
**Ce que ca retourne** : une decision ecrite sur le format, et un inventaire de ce qu'il
faut produire.

**Objectif** : le catalogue affiche aujourd'hui des chaines en majuscules — `CHEST`,
`LATS`. C'est du placeholder. Avant de dessiner quoi que ce soit, il faut savoir dans quoi
on dessine.

## Etapes

1. Sors la liste exacte des 18 valeurs depuis `liftapp/models.py`. Ne travaille pas de
   memoire.
2. Ecris pour chacune son libelle francais. `LATS` devient « Dorsaux », pas « Lats ».
3. Choisis le format. Trois options :
   - **SVG via `react-native-svg`** : net a toute taille, colorable par les tokens.
     Dependance supplementaire, mais elle est deja tiree par Expo.
   - **Police d'icones** : leger, mais impossible a colorer par zone et penible a
     maintenir.
   - **PNG** : simple, mais flou en `@3x` et impossible a recolorer.
   Mon avis : SVG, parce que le thema ferme exige que la couleur vienne des tokens, et que
   seul le SVG le permet.
4. Verifie si `react-native-svg` est deja installe. Expo le fournit souvent par transitivite
   — regarde `package.json` et `node_modules` avant d'installer.
5. Note le resultat dans ce ticket. Le dessin vient au ticket suivant.

**Ressources** :
- Doc Expo, `react-native-svg` : https://docs.expo.dev/versions/v54.0.0/sdk/svg/
- Recherche : `react-native-svg vs icon font vs png tradeoffs`
