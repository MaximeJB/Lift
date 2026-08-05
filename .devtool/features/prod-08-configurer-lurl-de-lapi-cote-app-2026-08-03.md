---
id: "prod-08-configurer-lurl-de-lapi-cote-app-2026-08-03"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["frontend", "production"]
order: "aP"
---
# 26 — Faire pointer l'app sur le bon serveur selon l'environnement

**Ce que ca prend** : l'URL de base actuellement dans `src/shared/api/client.ts`.
**Ce que ca retourne** : une URL qui vient de la configuration, pas du code.

**Objectif** : l'app pointe aujourd'hui sur une adresse locale. Un build de production avec
cette adresse ne fonctionne sur aucun telephone.

## Etapes

1. Regarde comment Expo gere ca : `app.config.js` avec le champ `extra`, lu ensuite par
   `expo-constants`. C'est le mecanisme prevu, pas un contournement.
2. Convertis `app.json` en `app.config.js` si necessaire — la version JavaScript peut lire
   `process.env`, pas la version JSON.
3. Definis deux valeurs : locale pour le developpement, publique pour la production.
4. **Le piege du developpement sur telephone physique** : `localhost` designe le telephone
   lui-meme, pas ta machine. Il faut l'adresse IP locale de ton PC sur le reseau Wi-Fi. Si
   tu as deja rencontre ce probleme, note la solution ici une bonne fois.
5. Verifie que les tests continuent de passer — ils mockent le service, donc ils ne
   devraient pas voir la difference. Si l'un casse, c'est qu'il dependait de l'URL en dur,
   et c'est une information utile.

**Ressources** :
- Doc Expo, configuration : https://docs.expo.dev/versions/v54.0.0/config/app/
- Recherche : `expo constants expoConfig extra environment variables api url`