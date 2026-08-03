---
id: "data-01-fonction-de-normalisation-des-noms-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "data"]
order: "f20"
---

# Extraire la normalisation des noms d'exercices dans une fonction testee

**Ce que ca prend** : une chaine, par exemple `"Bench Press (Barbell)"`.
**Ce que ca retourne** : sa forme normalisee, par exemple `"bench press barbell"`.

**Objectif** : la commande `import_hevy` contient deja cette logique, mais enfouie dans le
corps de la commande. Le seeding des templates va en avoir besoin. La dupliquer, c'est
garantir que les deux versions divergeront.

**C'est le prealable de tout le seeding.** Ne saute pas cette etape.

## Etapes

1. Ouvre `liftapp/management/commands/import_hevy.py` et retrouve le code qui normalise.
2. Cree `liftapp/matching.py` et deplaces-y la fonction. Un module a plat, pas un package.
3. Fais importer `import_hevy` depuis ce nouveau module, et relance l'import en `--dry-run`
   pour verifier que le resultat est **exactement** le meme qu'avant. Le nombre attendu est
   86 correspondances. S'il bouge, tu as change le comportement sans le vouloir.
4. Ecris les tests dans `liftapp/tests.py`. Les cas qui comptent : la casse, les accents,
   les parentheses, les tirets, les espaces multiples, la chaine vide.
5. Ajoute aussi la fonction de comparaison par ensemble de mots, si elle existe dans la
   commande — le seeding en aura besoin.

**Ressources** :
- Doc Python, `unicodedata.normalize` : https://docs.python.org/3/library/unicodedata.html
- Recherche : `python remove accents unicodedata NFKD normalize`
