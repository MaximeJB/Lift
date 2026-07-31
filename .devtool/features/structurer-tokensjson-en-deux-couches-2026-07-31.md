---
id: "structurer-tokensjson-en-deux-couches-2026-07-31"
status: "done today"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-07-31T08:09:15.743Z"
modified: "2026-07-31T12:34:51.258Z"
completedAt: null
labels: []
order: "a2"
---
# Structurer tokens.json en deux couches

**Objectif** : Transformer tes 34 tokens en deux fichiers séparés — `primitives.json` (les valeurs) et `semantic.json` (les rôles) — au format DTCG.

Chaque token porte `$value` et `$type`. Les rôles sémantiques pointent vers les primitives via la syntaxe d'alias `{chemin.du.token}`. Aucun nom sémantique ne décrit une apparence.

**Ressources** :

- [Design Tokens Community Group — spec DTCG](https://design-tokens.github.io/community-group/format/)
- Recherche : `design tokens DTCG primitives semantic two layer`