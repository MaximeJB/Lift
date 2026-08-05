---
id: "c4-01-service-api-des-templates-2026-08-03"
status: "done"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: "2026-08-04T00:00:00.000Z"
labels: ["frontend", "api"]
order: "a9"
---
# Ecrire le service qui lit les templates

**Ce que ca prend** : rien, ou un identifiant de template.
**Ce que ca retourne** : deux fonctions typees — `listTemplates()` et `getTemplate(id)`.

**Objectif** : l'ecran C4 est un squelette a 0% de couverture parce qu'il n'a aucune donnee
a afficher. Il faut d'abord la couche qui va la chercher.

## Etapes

1. Regarde `src/workout/services/exercises.service.ts` : c'est le modele exact a suivre.
   Meme structure, memes conventions de nommage, meme gestion d'erreur.
2. Cree `src/workout/services/templates.service.ts`.
3. Les types vont dans `src/shared/api/` avec les autres. Un template contient une liste
   d'exercices imbriques — regarde `WorkoutTemplateSerializer` cote Django pour avoir la
   forme exacte, ne devine pas.
4. **Verifie la route reelle** avec curl ou le navigateur avant d'ecrire l'URL. Les
   endpoints de `liftapp` ne suivent pas tous le meme prefixe.
5. Ecris les tests dans le meme fichier de test que les autres services. Trois cas : la
   liste, le detail, et une erreur reseau qui remonte bien en `NetworkError`.

**Ressources** :
- Recherche : `typescript nested type from drf nested serializer`

---

## Deja fait, constate le 04/08/2026

`frontend/src/workout/services/templates.service.ts` expose `listTemplates()` et `getTemplate(id)`. Le service a ete ecrit en meme temps que les trois autres, dans la carte « les quatre services API ». Cette carte faisait doublon sans qu'on le voie.