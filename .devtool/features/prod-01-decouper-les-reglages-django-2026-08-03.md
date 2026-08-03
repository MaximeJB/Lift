---
id: "prod-01-decouper-les-reglages-django-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "production"]
order: "f60"
---

# Separer les reglages de developpement et de production

**Ce que ca prend** : le fichier `Lift/settings.py` actuel, unique.
**Ce que ca retourne** : trois fichiers — `base.py`, `dev.py`, `prod.py` — et un projet qui
demarre exactement comme avant.

**Objectif** : aujourd'hui `DEBUG = True` est ecrit en dur. Deployer ce fichier tel quel
exposerait la trace complete de chaque erreur, avec les valeurs des variables, a n'importe
quel visiteur. C'est le prealable de tout le reste de cette serie.

## Etapes

1. Cree `Lift/settings/` en tant que **package** : un dossier avec `__init__.py`.
2. Deplace le contenu actuel dans `base.py`. Ne change rien encore.
3. Cree `dev.py` qui fait `from .base import *` puis force `DEBUG = True`.
4. Cree `prod.py` qui fait pareil avec `DEBUG = False`.
5. **Le piege du chemin** : `BASE_DIR` est probablement calcule avec des `.parent`. En
   descendant d'un niveau dans l'arborescence, il faut un `.parent` de plus. Si tu l'oublies,
   Django cherchera la base de donnees et les templates au mauvais endroit — et l'erreur
   sera obscure.
6. Mets a jour `DJANGO_SETTINGS_MODULE` dans `manage.py`, `wsgi.py`, `asgi.py` et
   `pytest.ini`. Il y en a quatre. En oublier un se voit tout de suite ; en oublier un dans
   `pytest.ini` fait tourner les tests avec la mauvaise configuration sans rien dire.
7. Verifie : `python manage.py check`, puis `python -m pytest -q`. Les 124 tests doivent
   passer sans modification.

**Ressources** :
- Doc Django, deploiement : https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/
- Recherche : `django split settings base dev prod package BASE_DIR parent`
