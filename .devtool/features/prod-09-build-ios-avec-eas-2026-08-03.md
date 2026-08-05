---
id: "prod-09-build-ios-avec-eas-2026-08-03"
status: "todo"
priority: "low"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["frontend", "production"]
order: "aQ"
---
# 27 — Produire un build installable sur iPhone

**Ce que ca prend** : le projet Expo et un compte Apple Developer.
**Ce que ca retourne** : un build distribuable en TestFlight.

**Objectif** : sortir d'Expo Go. Le projet a `newArchEnabled: true` et des modules natifs ;
Expo Go ne represente pas fidelement ce que verra un vrai utilisateur — le probleme
d'`InputAccessoryView` en est une preuve directe.

## Etapes

1. Installe `eas-cli`, connecte-toi, lance `eas build:configure`.
2. Lis le `eas.json` genere. Comprends la difference entre les profils `development`,
   `preview` et `production` — ce n'est pas cosmetique : le premier inclut le client de
   developpement, le dernier non.
3. Le compte Apple Developer coute 99 $ par an. C'est obligatoire pour installer sur un
   appareil physique autrement que par Expo Go. Note-le comme une depense a prevoir.
4. Commence par un build `preview`. Il s'installe directement, sans passer par l'App Store.
5. **Teste en priorite ce qui differe d'Expo Go** : le clavier, les permissions, la camera
   si la serie `photo-*` est faite, et le comportement hors ligne.
6. TestFlight ensuite, si tu veux faire tester par quelqu'un d'autre.

**Ressources** :
- Doc EAS Build : https://docs.expo.dev/build/setup/
- Recherche : `eas build profiles development preview production difference`
- Recherche : `expo go vs development build native modules differences`