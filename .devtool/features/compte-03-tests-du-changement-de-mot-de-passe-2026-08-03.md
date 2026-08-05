---
id: "compte-03-tests-du-changement-de-mot-de-passe-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "tests", "compte"]
order: "a2"
---
# 03 — Couvrir le changement de mot de passe par des tests

**Ce que ca prend** : la route de `compte-02`.
**Ce que ca retourne** : environ huit tests dans `accounts/tests.py`.

**Objectif** : verrouiller un endpoint qui touche a l'authentification. C'est le genre de
code ou une regression ne se voit pas — tout continue de repondre 200, sauf que la regle
n'est plus appliquee.

## Les cas a couvrir, un test chacun

1. Le cas nominal : ancien correct, nouveau valide → 200, et le nouveau mot de passe
   permet reellement de se reconnecter via `/api/auth/login/`. **Verifie la reconnexion**,
   pas juste le code 200 : c'est la seule preuve que `set_password` a bien hache.
2. Ancien mot de passe faux → 400.
3. Nouveau et confirmation differents → 400.
4. Nouveau trop court → 400.
5. Nouveau identique a l'ancien → 400.
6. Sans authentification → 401.
7. L'ancien mot de passe ne fonctionne plus apres le changement.
8. Le changement n'affecte que soi : cree un `autre_user`, change ton mot de passe, verifie
   que le sien marche toujours.

## Comment t'y prendre

Reutilise les fixtures `auth_client`, `user` et `autre_user` de `conftest.py`. Regarde
comment `test_impossible_decrire_une_serie_dans_la_seance_dun_autre` s'en sert, le motif
est identique.

Nomme les tests en francais, en phrase, comme le reste du fichier.

**Ressources** :
- Doc pytest-django, `django_db` : https://pytest-django.readthedocs.io/en/latest/helpers.html
- Recherche : `pytest django test password change reauthenticate`