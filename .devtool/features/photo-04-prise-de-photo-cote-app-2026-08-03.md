---
id: "photo-04-prise-de-photo-cote-app-2026-08-03"
status: "todo"
priority: "low"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["frontend", "photo"]
order: "ad"
---
# 40 — Prendre ou choisir une photo depuis l'app

**Ce que ca prend** : une action de l'utilisateur sur l'ecran de finalisation.
**Ce que ca retourne** : un fichier envoye a l'API.

**Objectif** : brancher C6 sur l'endpoint de `photo-03`.

## Etapes

1. Installe `expo-image-picker` avec `npx expo install`, **pas** avec `npm install` — la
   commande d'Expo choisit la version compatible avec le SDK 54. Une version prise au
   hasard casse le build natif.
2. Demande les permissions **au moment ou l'utilisateur appuie**, jamais au montage de
   l'ecran. Une app qui reclame l'acces a la camera avant qu'on ait rien demande se fait
   refuser, et le refus est definitif.
3. Gere les trois issues : accepte, refuse, refuse definitivement. Le troisieme cas demande
   d'ouvrir les reglages du telephone — `Linking.openSettings()`.
4. Compresse avant d'envoyer. `expo-image-picker` a une option de qualite ; une photo a 0,7
   de qualite est indiscernable et pese trois fois moins.
5. L'envoi se fait en `FormData`. Le client axios du projet envoie du JSON par defaut — il
   faudra surcharger l'en-tete pour cet appel. Regarde `src/shared/api/client.ts`.
6. Reprends le motif d'ecriture optimiste de C5 : affiche la miniature tout de suite, gere
   l'echec reseau sans perdre la photo.

**Ressources** :
- Doc Expo, `expo-image-picker` : https://docs.expo.dev/versions/v54.0.0/sdk/imagepicker/
- Recherche : `expo image picker permissions denied open settings`
- Recherche : `axios formdata react native content-type multipart`