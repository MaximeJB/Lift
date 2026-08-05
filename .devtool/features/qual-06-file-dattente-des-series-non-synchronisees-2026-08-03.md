---
id: "qual-06-file-dattente-des-series-non-synchronisees-2026-08-03"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["frontend", "offline"]
order: "aV"
---
# 32 — Ne pas perdre les series quand l'app se ferme hors ligne

**Ce que ca prend** : les series marquees `NON SYNC` dans l'ecran C5.
**Ce que ca retourne** : ces memes series, toujours la apres un redemarrage de l'app.

**Objectif** : C5 garde aujourd'hui les series non envoyees **en memoire**. Elles survivent
a une coupure reseau — c'est deja teste. Elles ne survivent pas a une fermeture de l'app.
Or un telephone en salle de sport, c'est exactement ou l'app se fait tuer par iOS quand on
passe sur autre chose.

C'est le dernier trou du modele hors-ligne.

## Etapes

1. Regarde ou C5 stocke `SerieLocale` avec son `payload`. Cette structure existe deja pour
   permettre le renvoi — elle contient tout ce qu'il faut persister.
2. Choisis le stockage. `AsyncStorage` suffit : ce sont quelques kilo-octets de JSON, pas
   des donnees sensibles. `expo-secure-store` serait surdimensionne et limite en taille.
3. Ecris a chaque ajout de serie, pas periodiquement. Un timer n'aura pas le temps de se
   declencher si l'app est tuee.
4. Au montage de C5, relis la file et **retente l'envoi**.
5. **Le piege des doublons** : une serie peut avoir ete recue par le serveur alors que la
   reponse s'est perdue. La rejouer creerait un doublon. Cherche comment on resout ca — le
   terme est « idempotency key ». C'est le vrai sujet de ce ticket, et il merite d'etre
   compris avant d'ecrire une ligne.
6. Vide la file une fois l'envoi confirme. Une file qui ne se vide jamais finit par renvoyer
   la seance du mois dernier.
7. Tests : la file survit a un demontage/remontage, elle se vide apres succes, et un
   deuxieme envoi ne cree pas de doublon.

**Ressources** :
- Doc Expo, `AsyncStorage` : https://docs.expo.dev/versions/v54.0.0/sdk/async-storage/
- Recherche : `idempotency key api retry duplicate prevention`
- Recherche : `react native offline queue retry mutation pattern`