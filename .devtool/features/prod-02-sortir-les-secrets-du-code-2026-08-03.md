---
id: "prod-02-sortir-les-secrets-du-code-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "production", "securite"]
order: "f61"
---

# Lire la cle secrete et les identifiants depuis l'environnement

**Ce que ca prend** : les valeurs actuellement ecrites en dur dans les reglages.
**Ce que ca retourne** : un fichier `.env` non versionne, et des reglages qui le lisent.

**Objectif** : `SECRET_KEY` est dans le depot. Elle signe les jetons de session et les
jetons JWT. Quiconque la connait peut forger un jeton pour n'importe quel compte.

**Elle est deja dans l'historique git.** La sortir du fichier ne suffit pas : il faudra
aussi en generer une nouvelle, sinon l'ancienne reste lisible dans n'importe quel commit
passe.

## Etapes

1. Installe `python-decouple` ou `django-environ`. Compare-les rapidement : le premier est
   minimal, le second sait analyser une URL de base de donnees d'une seule ligne — ce qui
   servira au ticket `prod-04`.
2. Cree `.env` a la racine. **Ajoute-le au `.gitignore` avant d'y ecrire quoi que ce soit.**
   Dans cet ordre. Un secret commite une seule fois est un secret grille.
3. Cree aussi `.env.example`, versionne celui-la, avec les memes cles et des valeurs vides.
   C'est ce qui permettra a quelqu'un — ou a toi dans six mois — de savoir quoi remplir.
4. Genere une **nouvelle** `SECRET_KEY` :
   `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
5. Sors aussi : `DEBUG`, `ALLOWED_HOSTS`, et plus tard l'URL de la base.
6. **En production, l'absence d'une variable doit faire echouer le demarrage**, pas retomber
   sur une valeur par defaut. Une valeur par defaut silencieuse, c'est comme ca qu'on se
   retrouve avec `DEBUG=True` en ligne.

**Ressources** :
- Doc `django-environ` : https://django-environ.readthedocs.io/
- Recherche : `django secret key rotation consequences sessions tokens`
