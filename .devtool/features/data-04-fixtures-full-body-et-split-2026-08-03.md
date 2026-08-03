---
id: "data-04-fixtures-full-body-et-split-2026-08-03"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "data"]
order: "f23"
---

# Ajouter les deux autres programmes a la commande de seeding

**Ce que ca prend** : la commande de `data-03`, et le tableau de `data-02`.
**Ce que ca retourne** : les trois programmes complets en base.

**Objectif** : finir le catalogue de programmes du MVP.

## Etapes

1. Ajoute Full Body et Split au dictionnaire de donnees. Aucune logique nouvelle ne devrait
   etre necessaire — si tu te retrouves a ecrire un `if` par programme, c'est que la
   structure de `data-03` etait mauvaise. Corrige-la plutot que d'empiler.
2. Verifie les durees estimees. Un Full Body a 45 minutes quand il contient 9 exercices,
   personne n'y croira. Compte : nombre de series x (temps de serie + repos).
3. Lance en `--dry-run`, lis la sortie en entier.
4. Lance pour de vrai, puis relance : le nombre de templates ne doit pas bouger.

**Ressources** :
- Recherche : `push pull legs vs full body vs upper lower split frequency`
