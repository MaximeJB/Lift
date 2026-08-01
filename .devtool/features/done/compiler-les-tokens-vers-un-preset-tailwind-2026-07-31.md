---
id: "compiler-les-tokens-vers-un-preset-tailwind-2026-07-31"
status: "done"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-07-31T08:09:42.672Z"
modified: "2026-08-01T09:42:53.708Z"
completedAt: "2026-08-01T09:42:53.708Z"
labels: []
order: "aA"
---
# Compiler les tokens vers un preset Tailwind

**Objectif** : Transformer automatiquement tes fichiers DTCG en un module JS consommable par Tailwind — un changement dans `tokens/` se propage à tous les écrans par une seule commande.

Installe `style-dictionary`, écris un format custom `lift/tailwind-preset` qui produit des chaînes en `px`, inclut `transparent`, et ajoute un en-tête d'avertissement. Ajoute `"tokens:build"` dans `package.json`.

**Ressources** :

- [styledictionary.com](http://styledictionary.com)[ — documentation officielle](https://styledictionary.com/)
- Recherche : `style-dictionary custom format tailwind preset`