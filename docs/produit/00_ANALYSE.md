# 00_ANALYSE.md — Rapport d'Analyse du Projet Lift

**Date d'analyse** : 08/06/2026  
**Périmètre** : Intégralité du dépôt `c:/Users/maxym/Desktop/Projets/Lift`  
**Méthode** : Lecture exhaustive de tous les fichiers source, docs, données et historique git.

---

## 1. Inventaire des Entités du Domaine et leurs Relations

### Entités réelles en base de données (migrations appliquées)

| Entité | App | Fichier/Ligne | État |
|--------|-----|--------------|------|
| `CustomUser` | `accounts` | `accounts/models.py:6` | [EXISTE & FONCTIONNE] |
| `BeltPromotion` | `bjjapp` | `bjjapp/models.py:7` | [EXISTE & FONCTIONNE] (bugs mineurs) |
| `WeightLog` | `nutrition` | `nutrition/models.py:9` | [EXISTE & FONCTIONNE] |
| `Exercise` | `liftapp` | `liftapp/models.py:6` | [EXISTE MAIS CASSÉ] — syntaxe invalide ligne 38 |
| `WorkoutTemplate` | `liftapp` | `liftapp/models.py:40` | [EXISTE MAIS CASSÉ] — modèle non importable |
| `TemplateExercise` | `liftapp` | `liftapp/models.py:64` | [EXISTE MAIS CASSÉ] — modèle non importable |
| `WorkoutSession` | `liftapp` | `liftapp/models.py:80` | [EXISTE MAIS CASSÉ] — modèle non importable |
| `Set` | `liftapp` | `liftapp/models.py:97` | [EXISTE MAIS CASSÉ] — modèle non importable |
| `BJJSession` | — | — | [PRÉVU, ABSENT] — décrit dans `Spec.md:9.9` |
| `Submission` | — | — | [PRÉVU, ABSENT] — décrit dans `Spec.md:9.10` |
| `PersonalRecord` | — | — | [PRÉVU, ABSENT] — mentionné dans `AUDIT.md:185` |
| `SocialAccount` | — | — | [PRÉVU, ABSENT] — `Spec.md:8.1`, allauth le gère partiellement |

### Relations entre entités (code réel)

```
CustomUser (accounts/models.py)
  ├── 1:N → BeltPromotion  [bjjapp/models.py:21, on_delete=CASCADE]
  ├── 1:N → WeightLog      [nutrition/models.py:20, on_delete=CASCADE]
  ├── 1:N → WorkoutSession [liftapp/models.py:82, on_delete=CASCADE]
  └── 1:N → WorkoutTemplate [liftapp/models.py:52, nullable, on_delete=CASCADE]

Exercise (liftapp/models.py)
  ├── 1:N → TemplateExercise [liftapp/models.py:67, on_delete=CASCADE]
  └── 1:N → Set             [liftapp/models.py:100, on_delete=PROTECT]

WorkoutTemplate (liftapp/models.py)
  └── 1:N → TemplateExercise [liftapp/models.py:66, on_delete=CASCADE, related_name='exercises']

WorkoutSession (liftapp/models.py)
  ├── N:1 → WorkoutTemplate  [nullable, on_delete=SET_NULL]
  └── 1:N → Set             [liftapp/models.py:98, on_delete=CASCADE, related_name='sets']
```

### Données en base (db.sqlite3)

- 873 exercices importés via `import_exercices.py` (`AUDIT.md:292`)
- 406 URLs vidéo scrapées dans `data_vids.json` (non encore liées aux exercices en BDD)
- 0 template, 0 session, 0 set (aucun utilisateur de test confirmé)

---

## 2. Inventaire des Endpoints Réels et leurs Permissions

### Routage (Lift/urls.py)

| Endpoint | Méthodes | Auth requise | Permission | État |
|----------|----------|-------------|------------|------|
| `POST /api/auth/register/` | POST | Non | AllowAny | [EXISTE & FONCTIONNE] |
| `POST /api/auth/login/` | POST | Non | AllowAny | [EXISTE & FONCTIONNE] |
| `GET/PATCH /api/auth/me/` | GET, PATCH | JWT | IsAuthenticated | [EXISTE & FONCTIONNE] |
| `POST /api/auth/token/refresh/` | POST | Non | AllowAny | [EXISTE & FONCTIONNE] |
| `GET /api/lift/exercise/` | GET, LIST | Non (IsAuthOrReadOnly) | IsAuthenticatedOrReadOnly | [EXISTE MAIS CASSÉ] — SyntaxError models.py |
| `CRUD /api/lift/workout_template/` | GET/POST/PATCH/DELETE | JWT | IsAuthenticatedOrReadOnly | [EXISTE MAIS CASSÉ] — même raison |
| `CRUD /api/lift/template_exercise/` | GET/POST/PATCH/DELETE | JWT | IsAuthenticatedOrReadOnly | [EXISTE MAIS CASSÉ] |
| `CRUD /api/lift/workout_session/` | GET/POST/PATCH/DELETE | JWT | IsOwner | [EXISTE MAIS CASSÉ] |
| `CRUD /api/lift/set/` | GET/POST/PATCH/DELETE | JWT | IsOwner | [EXISTE MAIS CASSÉ] |
| `CRUD /api/bjj/promotions/` | GET/POST/PATCH/DELETE | JWT | IsOwnerOrReadOnly | [EXISTE & FONCTIONNE] |
| `CRUD /api/nutrition/weights/` | GET/POST/PATCH/DELETE | JWT | IsOwner | [EXISTE & FONCTIONNE] |
| `GET /api/lift/stats/weekly/` | GET | JWT | — | [PRÉVU, ABSENT] |
| `GET /api/lift/exercise/{id}/history/` | GET | JWT | — | [PRÉVU, ABSENT] |
| `GET /api/lift/stats/prs/` | GET | JWT | — | [PRÉVU, ABSENT] |
| `POST /api/sync/` | POST | JWT | — | [PRÉVU, ABSENT] |

**Note critique** : `settings.py:173` définit `DEFAULT_PERMISSION_CLASSES = ['AllowAny']`. Tout endpoint sans `permission_classes` explicite est ouvert au public.

---

## 3. Écarts entre la Documentation et le Code

### Écarts majeurs (doc dit X, code dit Y)

| Doc | Code réel | Impact |
|-----|-----------|--------|
| `Spec.md:8.2` : "MVP inclut 50 exercices seeded" | `AUDIT.md:291` : 873 exercices importés | Mineur — plus d'exercices, c'est mieux |
| `Spec.md:5.3` : "/api/v1/..." (versioning) | `Lift/urls.py` : "/api/lift/" (pas de v1) | Futur changement cassant |
| `TODOLIST.md:7` : "IsOwner permission à terminer" | `accounts/permissions.py` : IsOwner existe et fonctionne | Tâche déjà faite |
| `TODOLIST.md:2,3,4,5,6` : "à créer" | `accounts/views.py`, `accounts/urls.py` : existent et fonctionnent | Tâches déjà faites |
| `TODOLIST.md:9-14` : "BJJ à créer" | `bjjapp/views.py`, `bjjapp/urls.py` : existent | Tâches déjà faites |
| `TODOLIST.md:15-20` : "Nutrition à créer" | `nutrition/views.py`, `nutrition/urls.py` : existent | Tâches déjà faites |
| `Spec.md:8.3` : "10 modèles MVP" | Code : 8 modèles définis (BJJSession, Submission absents) | 2 modèles BJJ manquants |
| `Spec.md:8.1` : "SocialAccount model" | Code : géré par allauth, pas de modèle custom | Probablement correct via allauth |
| `ROADMAP.md:Milestone 0` : "corriger models.py" | `liftapp/models.py:38` : toujours cassé | Milestone 0 NON COMMENCÉ |

### Bug critique non corrigé

`liftapp/models.py:38` contient `exercise_type =` (affectation sans valeur) — SyntaxError Python. Le serveur Django ne peut pas démarrer avec cette ligne. Le dernier commit (`beffafd`, 30/01/2026) a laissé ce fichier dans cet état.

---

## 4. Hypothèses (quand l'information manque)

- [HYPOTHÈSE] Les 873 exercices sont bien en BDD SQLite (le `db.sqlite3` existe et a grandi de 1,1 Mo après l'import — `git log --stat` confirme). Pas de lecture directe de la BDD effectuée.
- [HYPOTHÈSE] `allauth` gère les `SocialAccount` sans modèle custom explicite. Le flow OAuth Google/Apple n'a jamais été testé end-to-end (source : `AUDIT.md:211`).
- [HYPOTHÈSE] Les 406 entrées de `data_vids.json` sont des URLs CDN Hevy valides au moment du scraping. Leur pérennité n'est pas garantie.
- [HYPOTHÈSE] Le `venv/` contient toutes les dépendances nécessaires mais aucun `requirements.txt` n'existe. La liste des packages est inférable par inspection du `venv/Lib/site-packages/` mais n'a pas été exhaustivement inventoriée.
- [HYPOTHÈSE] Il n'existe aucun frontend React Native dans ce dépôt ni dans un dépôt séparé (aucun `package.json`, aucun dossier `app/` ou `mobile/` trouvé).
