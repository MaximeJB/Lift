---
id: "qual-02-integration-continue-github-actions-2026-08-03"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["outillage"]
order: "aS"
---
# 29 — Faire tourner les tests automatiquement a chaque push

**Ce que ca prend** : un fichier dans `.github/workflows/`.
**Ce que ca retourne** : une coche verte ou rouge sur chaque commit.

**Objectif** : les garde-fous ne servent que si on les lance. Un jour ou tu es presse, tu
pousseras sans avoir lance les tests. La CI, elle, n'est jamais pressee.

## Etapes

1. Cree `.github/workflows/tests.yml`.
2. **Deux jobs separes**, pas un seul : le backend en Python, le frontend en Node. S'ils
   sont dans le meme job, un echec Python empeche de savoir si le front va bien.
3. Job backend : installer Python 3.12, les dependances, lancer pytest. Il faut un service
   PostgreSQL — GitHub Actions sait en demarrer un via `services:`. C'est la partie qui
   demande le plus de recherche, prends le temps.
4. Job frontend : installer Node, `npm ci` (pas `npm install` — `ci` respecte le
   `package-lock.json` a la lettre), puis lint, `tsc --noEmit`, `check:classes` et
   `test:coverage`.
5. Mets en cache les dependances. Sans cache, chaque execution reinstalle tout et prend
   quatre minutes de plus.
6. Les secrets de test vont dans les secrets GitHub, pas dans le fichier. Une `SECRET_KEY`
   de test peut etre bidon, mais elle doit exister sinon Django refuse de demarrer.
7. Fais echouer volontairement un test et pousse, pour verifier que la CI passe au rouge.
   Une CI qu'on n'a jamais vue echouer n'est pas une CI verifiee.

**Ressources** :
- Doc GitHub Actions, services : https://docs.github.com/en/actions/using-containerized-services/about-service-containers
- Recherche : `github actions django postgres service pytest matrix cache`