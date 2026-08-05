---
id: "compte-05-tests-de-la-suppression-de-compte-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "tests", "compte"]
order: "a4"
---
# 05 — Prouver que la suppression de compte efface bien tout

**Ce que ca prend** : la route de `compte-04`.
**Ce que ca retourne** : cinq tests.

**Objectif** : une suppression incomplete est pire qu'une absence de suppression, parce
qu'on croit la conformite acquise.

## Les cas

1. DELETE authentifie → 204, et `CustomUser.objects.filter(pk=...).exists()` est faux.
2. Les seances de l'utilisateur ont disparu. Compte-les avant et apres.
3. Les series des seances ont disparu aussi — c'est une cascade a deux niveaux, elle merite
   son propre test.
4. Les seances de `autre_user` sont **intactes**. Le test le plus important des cinq.
5. DELETE sans authentification → 401.

## Une question a te poser en ecrivant le test 3

La cascade Django vers les series passe-t-elle par l'utilisateur, ou par la seance ? Si
`Set` n'a pas de lien direct vers l'utilisateur, la suppression fonctionne uniquement parce
que la seance tombe d'abord. Ce genre de dependance implicite est exactement ce qu'un test
doit figer.

**Ressources** :
- Recherche : `django test cascade delete assert queryset empty`