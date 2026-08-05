---
id: "def-06-decision-liste-noire-des-refresh-2026-08-03"
status: "done"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: "2026-08-03T00:00:00.000Z"
labels: ["backend", "securite", "decision"]
order: "aL"
---
# Decider si un ancien refresh token doit mourir apres rotation

**Ce que ca prend** : une decision de ta part, puis eventuellement une app et une migration.
**Ce que ca retourne** : soit une configuration changee, soit une ligne dans `SLOP.md` qui
acte le choix inverse.

**Objectif** : `ROTATE_REFRESH_TOKENS` est a `True`, donc chaque rafraichissement emet un
nouveau jeton. Mais `BLACKLIST_AFTER_ROTATION` est a `False`, donc **l'ancien reste valable
jusqu'a son expiration**, un jour plus tard. Un jeton vole avant une deconnexion reste
utilisable 24h.

Le test `test_lancien_refresh_reste_valable_apres_rotation` **passe** aujourd'hui : il fige
l'etat actuel plutot que de reclamer un changement. Si tu actives la liste noire, ce test
doit etre reecrit dans l'autre sens.

## Ce qu'il faut peser

**Activer la liste noire** : plus sur, mais chaque rafraichissement ecrit une ligne en base.
Avec un token d'acces court, ca fait beaucoup d'ecritures. Il faut aussi purger la table
periodiquement, sinon elle grossit sans fin.

**Laisser tel quel** : rien a faire, mais la fenetre de 24h reste ouverte. Acceptable pour
une app de suivi de musculation ou aucune donnee sensible ne transite ? A toi de trancher.

## Etapes si tu actives

1. Ajoute `rest_framework_simplejwt.token_blacklist` aux `INSTALLED_APPS`.
2. `python manage.py migrate` — l'app apporte ses propres tables.
3. Passe `BLACKLIST_AFTER_ROTATION` a `True`.
4. Reecris le test pour verifier qu'un ancien refresh renvoie desormais 401.
5. Note dans ce ticket comment tu comptes purger la table : la commande
   `flushexpiredtokens` existe, il faut decider qui la declenche et a quelle frequence.

## Etapes si tu laisses tel quel

1. Ajoute une ligne dans `SLOP.md`, section des decisions closes, avec la date et la
   raison. Une decision non ecrite se rediscute tous les trois mois.

**Ressources** :
- Doc SimpleJWT, « Blacklist app » : https://django-rest-framework-simplejwt.readthedocs.io/en/latest/blacklist_app.html
- Recherche : `simplejwt BLACKLIST_AFTER_ROTATION performance tradeoff`
- Recherche : `simplejwt flushexpiredtokens management command`

---

## Fait le 03/08/2026

**Decision : liste noire activee.**

L'unique argument contre etait le cout en ecritures. Avec un `ACCESS_TOKEN_LIFETIME` de 180 minutes, un utilisateur actif rafraichit toutes les trois heures — l'argument ne tient pas a ce rythme.

`rest_framework_simplejwt.token_blacklist` ajoute aux `INSTALLED_APPS`, `BLACKLIST_AFTER_ROTATION` a `True`, 13 migrations appliquees.

Le test `test_lancien_refresh_reste_valable_apres_rotation` figeait le risque assume. Il est reecrit en `test_un_refresh_deja_consomme_est_refuse` et attend un 401.

**Reste a faire avant la mise en ligne** : planifier `python manage.py flushexpiredtokens`, sinon la table grossit sans fin. A rattacher au ticket `f66`.