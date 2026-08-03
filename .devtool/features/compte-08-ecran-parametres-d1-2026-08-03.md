---
id: "compte-08-ecran-parametres-d1-2026-08-03"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["frontend", "compte"]
order: "f17"
---

# Ajouter l'ecran Parametres, accessible depuis D1

**Ce que ca prend** : les trois routes des tickets `compte-02`, `compte-04` et `compte-07`.
**Ce que ca retourne** : un ecran qui regroupe changement de mot de passe, export, CGU et
suppression de compte.

**Objectif** : ces trois fonctions n'ont aujourd'hui aucune porte d'entree dans l'app. Et
les CGU doivent y figurer — c'est une demande deja notee.

## Etapes

1. Cree la route dans `app/(tabs)/profile/` — attention, `profile.tsx` est actuellement un
   fichier plat. Le transformer en dossier avec un `index.tsx` change la structure de
   navigation. Verifie que le tab pointe toujours au bon endroit apres.
2. Ordonne l'ecran par gravite croissante : d'abord les actions anodines (CGU, export),
   ensuite le mot de passe, **la suppression de compte tout en bas**, visuellement separee.
   Un utilisateur ne doit jamais toucher « supprimer » en visant autre chose.
3. La suppression demande une double confirmation. Regarde comment la deconnexion de D1
   gere son dialogue et reprends le motif — mais ajoute une saisie explicite : faire taper
   son email, ou le mot « SUPPRIMER ». Un simple bouton « confirmer » ne suffit pas pour une
   action irreversible.
4. Apres suppression reussie, appelle la meme purge locale que la deconnexion. **Ne navigue
   pas a la main** : `Stack.Protected` retire le groupe et expo-router retombe sur le login
   tout seul. C'est deja teste dans `profil.test.tsx`.
5. Avant de dessiner quoi que ce soit, passe la proposition au bareme de `SLOP.md` et
   montre-la-moi sur telephone.

**Ressources** :
- Doc expo-router, groupes et routes imbriquees : https://docs.expo.dev/versions/v54.0.0/sdk/router/
- Recherche : `expo router convert file route to folder index`
