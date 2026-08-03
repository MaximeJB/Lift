---
id: "photo-05-affichage-des-photos-dans-c8-2026-08-03"
status: "todo"
priority: "low"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["frontend", "photo"]
order: "f54"
---

# Montrer les photos dans le detail d'une seance passee

**Ce que ca prend** : les photos renvoyees avec la seance.
**Ce que ca retourne** : C8 avec ses images.

**Objectif** : une photo qu'on ne peut pas revoir ne sert a rien.

## Etapes

1. Utilise `expo-image`, pas le `Image` de React Native. Il gere le cache disque et le
   fondu au chargement — sur une liste de seances, la difference est visible.
2. Prevois les trois etats : chargement, chargee, echec. Une image cassee doit montrer
   quelque chose, pas un trou.
3. Ajoute un `accessibilityLabel`. Si une legende existe, c'est elle ; sinon, quelque chose
   de generique mais informatif.
4. Permets la suppression, avec confirmation. Une photo est plus personnelle qu'une serie.
5. Mets a jour les tests de C8 : les photos apparaissent, l'absence de photo n'affiche pas
   de bloc vide.

**Ressources** :
- Doc Expo, `expo-image` : https://docs.expo.dev/versions/v54.0.0/sdk/image/
