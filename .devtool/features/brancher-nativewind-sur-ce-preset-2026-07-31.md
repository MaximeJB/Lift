---
id: "brancher-nativewind-sur-ce-preset-2026-07-31"
status: "done today"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-07-31T08:10:19.392Z"
modified: "2026-07-31T12:34:57.731Z"
completedAt: null
labels: []
order: "a4"
---
# Brancher NativeWind sur ce preset

**Objectif** : Installer NativeWind, lui donner ton preset comme seul vocabulaire, charger les polices Inter — et fermer le thème pour rendre toute valeur hors-tokens impossible à écrire.

Installe NativeWind + Tailwind (vérifie l'appariement de versions sur la doc officielle avant), configure Babel, Metro, `global.css`, et `nativewind-env.d.ts`. Dans `tailwind.config.js`, utilise `theme` (pas `theme.extend`) pour les couleurs et l'espacement.

**Ressources** :

- [nativewind.dev](http://nativewind.dev)[ — documentation officielle](https://www.nativewind.dev/getting-started/expo-router)
- Recherche : `nativewind tailwind closed theme no extend`