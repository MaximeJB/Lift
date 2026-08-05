---
id: "qual-05-limiter-les-tentatives-de-connexion-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "securite"]
order: "aK"
---
# 21 — Empecher qu'on essaie mille mots de passe a la minute

**Ce que ca prend** : les routes `/api/auth/login/` et `/api/auth/register/`.
**Ce que ca retourne** : un 429 au-dela d'un certain nombre de tentatives.

**Objectif** : rien ne limite aujourd'hui le nombre d'essais de connexion. Un script peut
tester une liste de mots de passe courants sur une adresse email connue, aussi vite que le
serveur repond. C'est l'attaque la plus banale qui existe.

## Etapes

1. DRF fournit la limitation en standard : `throttle_classes` et `DEFAULT_THROTTLE_RATES`.
   Lis la doc avant de chercher une bibliotheque tierce, tu n'en as probablement pas besoin.
2. Applique une limite **anonyme** sur la connexion et l'inscription. Une limite par
   utilisateur ne sert a rien ici : l'attaquant n'est pas authentifie, c'est tout le
   probleme.
3. Choisis le seuil. Trop bas, tu bloques quelqu'un qui se trompe trois fois de suite —
   ce qui arrive tout le temps. Trop haut, ca ne protege rien. Cherche ce qui se pratique.
4. **Comprends la limite du mecanisme** : DRF compte par adresse IP. Un attaquant qui change
   d'IP passe au travers, et plusieurs utilisateurs derriere le meme reseau partagent le
   compteur. C'est une gene, pas un mur. Note-le, ne fais pas semblant que le probleme est
   clos.
5. Le stockage du compteur utilise le cache Django. Verifie qu'un cache est configure — le
   defaut est en memoire locale, ce qui ne marche plus des qu'il y a deux processus
   gunicorn.
6. Un test : depasser la limite renvoie 429.

**Ressources** :
- Doc DRF, limitation : https://www.django-rest-framework.org/api-guide/throttling/
- Recherche : `drf throttle anon rate login brute force ip limitations`
- Recherche : `django cache backend locmem multiple workers problem`