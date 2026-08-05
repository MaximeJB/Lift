---
id: "compte-06-serialiseur-dexport-des-donnees-2026-08-03"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "compte", "rgpd"]
order: "a5"
---
# 06 — Assembler l'export des donnees personnelles

**Ce que ca prend** : un utilisateur.
**Ce que ca retourne** : un dictionnaire Python contenant son profil, ses seances et ses
series — pret a etre serialise en JSON.

**Objectif** : deuxieme obligation RGPD, le droit a la portabilite. L'utilisateur doit
pouvoir recuperer ses donnees dans un format lisible par une machine.

On separe l'assemblage (ce ticket) de l'exposition HTTP (le suivant), parce que
l'assemblage est la partie qui a des regles et qui merite des tests.

## Etapes

1. Cree `UserExportSerializer` dans `accounts/serializers.py`.
2. Il doit contenir : le profil complet (reutilise `PrivateUserSerializer`), et les seances
   avec leurs series imbriquees (reutilise `WorkoutSessionSerializer` de `liftapp`).
3. **Attention a l'import croise** : `accounts` qui importe `liftapp` cree une dependance
   entre les deux apps. Verifie que l'inverse n'existe pas deja, sinon tu obtiens un import
   circulaire au demarrage. Si le risque existe, fais l'import a l'interieur de la methode
   plutot qu'en haut du fichier — c'est laid mais ca marche, et c'est un motif reconnu.
4. Decide ce qui **ne doit pas** figurer : le hash du mot de passe, evidemment, mais aussi
   les identifiants internes qui n'ont aucun sens hors de la base. Note ton choix.
5. Ajoute un champ `exporte_le` avec l'horodatage de generation. Un export sans date est
   inexploitable trois mois plus tard.

**Ressources** :
- Doc DRF, serialiseurs imbriques : https://www.django-rest-framework.org/api-guide/relations/#nested-relationships
- Recherche : `django circular import between apps serializers`
- Recherche : `RGPD droit portabilite format lisible machine`