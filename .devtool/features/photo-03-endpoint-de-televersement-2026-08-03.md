---
id: "photo-03-endpoint-de-televersement-2026-08-03"
status: "todo"
priority: "low"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "photo"]
order: "f52"
---

# POST d'une photo sur une seance

**Ce que ca prend** : un fichier image en `multipart/form-data`, et l'id d'une seance.
**Ce que ca retourne** : un 201 avec l'URL de la photo.

**Objectif** : exposer le modele.

## Etapes

1. Cree `SessionPhotoSerializer` et un `ModelViewSet`.
2. **La permission compte autant qu'ailleurs.** Applique la meme lecon que
   `SetSerializer.validate_workout_session` : verifie que la seance visee appartient a
   l'utilisateur. Sans ca, tu recrees le trou qu'on vient de fermer, en pire — cette fois
   avec des fichiers.
3. Il faut declarer les parseurs qui acceptent un fichier. Par defaut DRF ne lit que du
   JSON. Cherche `MultiPartParser`.
4. Limite la taille acceptee. Une photo de 12 Mo depuis un iPhone remplit un disque tres
   vite. Valide dans le serialiseur, avec un message clair.
5. Valide aussi le type reel du fichier, pas seulement son extension. Un `.jpg` renomme
   peut etre n'importe quoi. `Pillow` sait ouvrir et verifier.
6. Tests : televersement valide, fichier trop gros, seance d'autrui, fichier qui n'est pas
   une image.

**Ressources** :
- Doc DRF, parseurs : https://www.django-rest-framework.org/api-guide/parsers/#multipartparser
- Recherche : `drf file upload multipartparser validate image size type`
