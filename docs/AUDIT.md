# AUDIT.md - ETAT DES LIEUX EXHAUSTIF

**Date** : 07/06/2026
**Derniere activite repo** : 30/01/2026 (4 mois d'arret)
**Auteur de l'audit** : Claude (assistant IA)

---

## 1. Stack Reelle et Versions

| Couche | Technologie | Version | Source |
|--------|-------------|---------|--------|
| **Langage** | Python | 3.12 | venv |
| **Framework backend** | Django | 5.1.7 | `.venv/Lib/site-packages/Django-5.1.7.dist-info` |
| **API REST** | Django REST Framework | installe | `settings.py:46` |
| **Auth JWT** | djangorestframework-simplejwt | installe | `settings.py:48` |
| **OAuth** | django-allauth | installe | `settings.py:51-54` (Google + Apple) |
| **Filtrage** | django-filters | installe | `settings.py:57` |
| **CORS** | django-cors-headers | installe | `settings.py:47` |
| **Variables env** | python-dotenv | installe | `settings.py:15` |
| **BDD** | SQLite3 | par defaut | `settings.py:123-127` |
| **Frontend mobile** | React Native (Expo) | **NON DEMARRE** | Spec.md uniquement |
| **Scraping** | SeleniumBase + Selenium | installe | `dl_exo.py` |

### Dependances non listees dans un requirements.txt ou pyproject.toml
**ALERTE** : Aucun fichier `requirements.txt`, `Pipfile`, ou `pyproject.toml` n'existe. Les dependances ne sont trackees nulle part. Reconstruction du venv impossible sans inspection manuelle.

---

## 2. Structure du Projet

```
Lift/                          # Racine du projet
|-- Lift/                      # Configuration Django (settings, urls, wsgi)
|   |-- settings.py
|   |-- urls.py
|   |-- wsgi.py
|   |-- asgi.py
|
|-- accounts/                  # App auth/utilisateurs
|   |-- models.py              # CustomUser (AbstractUser)
|   |-- views.py               # RegisterView, LoginView, UserProfileView
|   |-- serializers.py         # Public/Private/Registration/Login serializers
|   |-- permissions.py         # IsOwner, IsOwnerOrReadOnly
|   |-- urls.py                # /api/auth/ routes
|   |-- admin.py               # CustomUser enregistre
|   |-- tests.py               # VIDE
|
|-- liftapp/                   # App principale musculation
|   |-- models.py              # Exercise, WorkoutTemplate, TemplateExercise, WorkoutSession, Set
|   |-- views.py               # 5 ViewSets (Exercise, Template, TemplateExercise, Session, Set)
|   |-- serializers.py         # 5 serializers avec nested relations
|   |-- urls.py                # DRF router (5 endpoints)
|   |-- admin.py               # VIDE (aucun model enregistre)
|   |-- tests.py               # VIDE
|   |-- management/commands/
|       |-- import_exercices.py # Import 873 exercices depuis free-exercise-db
|       |-- dl_exo.py           # Scraper SeleniumBase pour videos Hevy
|
|-- bjjapp/                    # App BJJ/grappling
|   |-- models.py              # BeltPromotion
|   |-- views.py               # BeltPromotionViewset
|   |-- serializers.py         # PublicBeltPromotionSerializer
|   |-- urls.py                # /api/bjj/promotions/
|   |-- tests.py               # VIDE
|
|-- nutrition/                 # App suivi poids
|   |-- models.py              # WeightLog
|   |-- views.py               # WeightLogViewset
|   |-- serializers.py         # WeightSerializer
|   |-- urls.py                # /api/nutrition/weights/
|   |-- tests.py               # VIDE
|
|-- Fichiers de donnees (racine)
|   |-- exercises.json         # 873 exercices free-exercise-db
|   |-- hevy.json              # 435 exercices API Hevy
|   |-- hevy_page_3.json       # Page 3 brute de l'API Hevy (residuel)
|   |-- data_vids.json         # 406 URLs video CDN (scraping termine)
|
|-- Documentation
|   |-- Spec.md                # PRD + specs techniques (680 lignes)
|   |-- TODOLIST.md            # Backlog 76 taches (gitignore)
|   |-- todo0212.md            # Copie texte de TODOLIST (gitignore)
|   |-- scraping_infos.md      # Rapport analyse Hevy
|   |-- CLAUDE.md              # Instructions assistant IA
|   |-- last-commit-message.md # Historique messages commit
|
|-- .env                       # Variables environnement (SECRET_KEY, DEBUG)
|-- .gitignore                 # Fichiers exclus du repo
|-- db.sqlite3                 # BDD (gitignore)
|-- manage.py                  # Django CLI
```

---

## 3. Modele de Donnees Actuel

### 3.1 Entites et Relations

```
CustomUser (accounts)
    |-- 1:N --> BeltPromotion (bjjapp)
    |-- 1:N --> WeightLog (nutrition)
    |-- 1:N --> WorkoutSession (liftapp)
    |-- 1:N --> WorkoutTemplate (liftapp, nullable)

Exercise (liftapp) [873 en BDD]
    |-- 1:N --> TemplateExercise
    |-- 1:N --> Set

WorkoutTemplate (liftapp)
    |-- 1:N --> TemplateExercise --> Exercise

WorkoutSession (liftapp)
    |-- N:1 --> WorkoutTemplate (nullable)
    |-- 1:N --> Set --> Exercise
```

### 3.2 Detail des Modeles

#### CustomUser (`accounts/models.py`)
| Champ | Type | Contraintes |
|-------|------|-------------|
| id | UUIDField | PK |
| pseudo | CharField(100) | unique, nullable |
| email | EmailField | unique, required |
| email_verified | BooleanField | default=False |
| profile_visibility | CharField(10) | choices: PUBLIC/PRIVATE |
| created_at / updated_at / synced_at | DateTimeField | auto |

**Probleme** : `USERNAME_FIELD = 'email'` mais `REQUIRED_FIELDS = []` — AbstractUser exige `username` par defaut, et le champ `username` existe toujours (herite d'AbstractUser). Redondance avec `pseudo`.

#### Exercise (`liftapp/models.py:6-38`)
| Champ | Type | Contraintes |
|-------|------|-------------|
| id | UUIDField | PK |
| name | CharField(200) | unique |
| description | TextField | blank |
| muscle_group | CharField(20) | 16 choices |
| equipment_needed | CharField(100) | blank |
| is_compound | BooleanField | default=False |
| image_url | URLField | nullable |
| video_url | URLField | **EN COURS - pas de blank/null** |
| external_id | CharField | **EN COURS - pas de max_length** |
| secondary_muscle_groups | CharField(20) | **EN COURS - devrait etre JSONField** |
| exercise_type | **INCOMPLET** | **syntaxe cassee (= sans valeur)** |
| created_at / updated_at / synced_at | DateTimeField | auto |

#### WorkoutTemplate (`liftapp/models.py:40-62`)
| Champ | Type | Contraintes |
|-------|------|-------------|
| id | UUIDField | PK |
| user | FK(CustomUser) | nullable (templates publics) |
| name | CharField(200) | unique |
| description | TextField | blank |
| category | CharField(20) | 8 choices (STRENGTH, HYPERTROPHY, etc.) |
| estimated_duration | IntegerField | default=60 |

#### TemplateExercise (`liftapp/models.py:64-78`)
Table pivot Template <-> Exercise avec ordre, sets cibles, reps min/max, repos, notes.
`unique_together = [('template', 'order')]`

#### WorkoutSession (`liftapp/models.py:80-95`)
Session d'entrainement : user, template (nullable), date, start/end time, duration, notes.
`ordering = ['-date', '-start_time']`

#### Set (`liftapp/models.py:97-116`)
Serie individuelle : weight_kg, reps, rpe, duration_seconds, rest_seconds, is_warmup, is_failure.
`on_delete=PROTECT` sur Exercise (empeche suppression d'exercice utilise).

#### BeltPromotion (`bjjapp/models.py`)
| Champ | Type | Notes |
|-------|------|-------|
| actual_belt | CharField(10) | 7 choices (WHITE->Black) |
| promotion_date | DateField | default='2025-01-01' |
| academy | CharField(300) | nullable |
| notes | CharField(600) | nullable |

**Bug** : `belt_choices` a "Black" au lieu de "BLACK" (inconsistance casse). "WHITE" est labele "Public" au lieu de "White".

#### WeightLog (`nutrition/models.py`)
Suivi poids corporel avec validators min=0, max=200.

### 3.3 Ce qui manque dans le modele

| Manquant | Prevu dans Spec.md | Impact |
|----------|-------------------|--------|
| BJJSession | Oui (model #9) | Pas de tracking seances BJJ |
| Submission | Oui (model #10) | Pas de tracking soumissions |
| PersonalRecord | Discussion ouverte | Pas de PRs |
| SocialAccount | Oui (model #2) | allauth gere, mais pas documente |
| Exercices custom user | Post-MVP | - |
| current_weight / height sur CustomUser | Oui | Absent du model |

---

## 4. Inventaire Fonctionnel Fichier par Fichier

### 4.1 Authentification (accounts/)

| Fichier | Etat | Details |
|---------|------|---------|
| `models.py` | FONCTIONNEL | CustomUser avec email login |
| `views.py` | FONCTIONNEL | Register (+ JWT auto), Login (JWT), Profile (GET/PATCH) |
| `serializers.py` | FONCTIONNEL | 4 serializers (Public, Private, Registration, Login) |
| `permissions.py` | FONCTIONNEL | IsOwner, IsOwnerOrReadOnly |
| `urls.py` | FONCTIONNEL | 4 routes (/login, /register, /me, /token/refresh) |
| `admin.py` | FONCTIONNEL | CustomUser enregistre |
| `tests.py` | VIDE | 0 tests |

**Ce qui marche** : inscription, login, JWT, refresh token, profil utilisateur.
**Ce qui manque** : tests, logout/blacklist, email verification (configure mais pas de backend email), OAuth flow complet non teste.

### 4.2 Musculation (liftapp/)

| Fichier | Etat | Details |
|---------|------|---------|
| `models.py` | CASSE | 5 models definis mais `exercise_type =` sans valeur = SyntaxError |
| `views.py` | FONCTIONNEL | 5 ViewSets avec permissions et filtrage |
| `serializers.py` | FONCTIONNEL | 5 serializers avec nested relations |
| `urls.py` | FONCTIONNEL | DRF router, 5 endpoints |
| `import_exercices.py` | FONCTIONNEL | 873 exercices importes depuis free-exercise-db |
| `dl_exo.py` | FONCTIONNEL | Scraper SeleniumBase, 406 videos recuperees |
| `admin.py` | VIDE | Aucun model dans l'admin |
| `tests.py` | VIDE | 0 tests |

**CRITIQUE** : `liftapp/models.py:38` contient `exercise_type =` (syntaxe invalide). Le serveur Django ne peut pas demarrer tant que cette ligne n'est pas corrigee. Le modele est **casse**.

### 4.3 BJJ (bjjapp/)

| Fichier | Etat | Details |
|---------|------|---------|
| `models.py` | FONCTIONNEL (bugs mineurs) | BeltPromotion uniquement |
| `views.py` | FONCTIONNEL | ModelViewSet + IsOwnerOrReadOnly |
| `serializers.py` | FONCTIONNEL | PublicBeltPromotionSerializer |
| `urls.py` | FONCTIONNEL | /api/bjj/promotions/ |
| `tests.py` | VIDE | 0 tests |

**Scope tres reduit** : seulement BeltPromotion. Pas de BJJSession ni Submission (prevus dans Spec.md).

### 4.4 Nutrition (nutrition/)

| Fichier | Etat | Details |
|---------|------|---------|
| `models.py` | FONCTIONNEL | WeightLog avec validators |
| `views.py` | FONCTIONNEL | ModelViewSet + IsOwner |
| `serializers.py` | FONCTIONNEL | WeightSerializer |
| `urls.py` | FONCTIONNEL | /api/nutrition/weights/ |
| `tests.py` | VIDE | 0 tests |

**Scope minimal** : uniquement suivi poids. Pas de module calories/macros (post-MVP).

---

## 5. Etat des Endpoints API

| Endpoint | Methodes | Auth | Permissions | Etat |
|----------|----------|------|-------------|------|
| `POST /api/auth/register/` | POST | Non | AllowAny | OK |
| `POST /api/auth/login/` | POST | Non | AllowAny | OK |
| `GET/PATCH /api/auth/me/` | GET, PATCH | JWT | IsAuthenticated | OK |
| `POST /api/auth/token/refresh/` | POST | Non | AllowAny | OK |
| `GET /api/lift/exercise/` | GET, LIST | Non | IsAuthenticatedOrReadOnly | OK |
| `GET/POST /api/lift/workout_template/` | CRUD | JWT | IsAuthenticatedOrReadOnly | OK |
| `GET/POST /api/lift/template_exercise/` | CRUD | JWT | IsAuthenticatedOrReadOnly | OK |
| `GET/POST /api/lift/workout_session/` | CRUD | JWT | IsOwner | OK |
| `GET/POST /api/lift/set/` | CRUD | JWT | IsOwner | OK |
| `GET/POST /api/bjj/promotions/` | CRUD | JWT | IsOwnerOrReadOnly | OK |
| `GET/POST /api/nutrition/weights/` | CRUD | JWT | IsOwner | OK |

**Remarque importante** : `settings.py:173` a `DEFAULT_PERMISSION_CLASSES = AllowAny`. Cela signifie que tout endpoint sans `permission_classes` explicite est ouvert au public. Risque de securite.

**Pas de versioning** : les URLs sont `/api/lift/` et non `/api/v1/lift/`. Changement cassant si tu ajoutes un versioning plus tard.

---

## 6. Etat du Frontend React Native

**Non demarre.** Zero fichier frontend. Pas de dossier `mobile/`, `app/`, ou `frontend/`. Le Spec.md prevoit React Native + Expo mais rien n'a ete initie.

---

## 7. Persistance et BDD

- **BDD** : SQLite3 (developpement uniquement). Spec.md prevoit PostgreSQL pour la production.
- **Migrations** :
  - `accounts/` : 3 migrations appliquees (0001-0003)
  - `liftapp/` : 3 migrations appliquees (0001-0003)
  - `bjjapp/` : 3 migrations appliquees (0001-0003)
  - `nutrition/` : 2 migrations appliquees (0001-0002)
- **Donnees en BDD** : 873 exercices (free-exercise-db). Aucun template, session, set, user de test confirme.
- **Pas de fixtures Django** : les exercices sont importes via management command, pas via `loaddata`.

---

## 8. Tests et Couverture

**Couverture : 0%.** Les 4 fichiers `tests.py` sont tous vides (boilerplate Django `# Create your tests here.`).

Aucun framework de test configure (pas de pytest, factory_boy, ou coverage dans les dependances).

---

## 9. Dette Technique et Code Smells

### 9.1 CRITIQUE (empeche le fonctionnement)

| # | Fichier | Ligne | Probleme |
|---|---------|-------|----------|
| 1 | `liftapp/models.py` | 38 | `exercise_type =` sans valeur = **SyntaxError**. Le serveur ne demarre pas. |
| 2 | `liftapp/models.py` | 37 | `secondary_muscle_groups = CharField(choices, max_length=20)` — ne peut pas stocker une liste. Devrait etre JSONField. |
| 3 | `liftapp/models.py` | 35 | `video_url = URLField()` sans `blank=True, null=True`. Les 873 exercices existants n'ont pas de video, la migration va echouer. |
| 4 | `liftapp/models.py` | 36 | `external_id = CharField(null=True, unique=True)` sans `max_length`. Django exige un `max_length` pour CharField. |

### 9.2 BUGS (fonctionnel mais incorrect)

| # | Fichier | Ligne | Probleme |
|---|---------|-------|----------|
| 5 | `bjjapp/models.py` | 9 | `("WHITE", "Public")` — le label devrait etre "White", pas "Public". |
| 6 | `bjjapp/models.py` | 15 | `("Black", "Black")` — la valeur devrait etre "BLACK" (majuscules comme les autres). |
| 7 | `accounts/models.py` | 20 | `REQUIRED_FIELDS = []` — devrait au minimum contenir `'username'` ou supprimer le champ `username`. |
| 8 | `liftapp/views.py` | 21 | `filterset_fields` est defini mais le backend utilise `SearchFilter`, pas `DjangoFilterBackend`. Les deux sont mixtes. |
| 9 | `settings.py` | 31 | `DEBUG = os.environ["DEBUG"]` retourne la string `"True"`, pas un bool. En Python, `"False"` est truthy. DEBUG est toujours actif. |

### 9.3 QUALITE / SMELLS

| # | Fichier | Probleme |
|---|---------|----------|
| 10 | Racine projet | Pas de `requirements.txt` / `pyproject.toml` |
| 11 | `.gitignore` | `claude.md` en minuscule mais le fichier est `CLAUDE.md` — pas ignore |
| 12 | `.gitignore` | `.__pycache__/` au lieu de `__pycache__/` (regex incorrecte, certains caches pas ignores) |
| 13 | `.env` | Contient `SECRET_KEY=django-insecure-...` — cle par defaut Django, pas securisee |
| 14 | `.env` | `.env` est dans `.gitignore` mais existait dans des commits precedents |
| 15 | Racine | Fichiers residuels : `hevy_page_3.json`, `last-commit-message.md`, `wiggly-coalescing-badger.md` |
| 16 | `liftapp/admin.py` | Vide — aucun model liftapp visible dans l'admin Django |
| 17 | `settings.py:188` | `ACCESS_TOKEN_LIFETIME = 180 min` (3h) — tres long pour un access token. Standard = 5-15 min. |
| 18 | `liftapp/serializers.py` | `WorkoutTemplateSerializer` n'inclut pas `exercises` dans `fields` (il manque dans la liste) |
| 19 | `nutrition/views.py` | `WeightLogViewset` ordonne par `updated_at` au lieu de `logged_at` |
| 20 | Toutes les apps | 0 `__str__()` sur les models liftapp (debug penible dans l'admin/shell) |

---

## 10. Analyse Git — Sur quoi tu t'etais arrete

### Historique chronologique

| Date | Commit | Contenu |
|------|--------|---------|
| 2025-03-13 | `31572ec` | Premier commit |
| 2025-11-28 | `69d1842` | Hello world, settings, CORS |
| 2025-11-28 | `ce743b9` | CustomUser model |
| 2025-11-29 | `66036de` | Auth django-allauth + OAuth |
| 2025-12-16 | `8513170` | Auth JWT complete |
| 2026-01-01 | `8af54c2` | Fix bugs critiques, endpoints Phase 1-2 |
| 2026-01-04 | `ee84d73` | Models liftapp (3/5) |
| 2026-01-05 | `f3c246e` | Models liftapp (5/5) + serializers |
| 2026-01-07 | `a50b5af` | WorkoutTemplate.user + ViewSets WIP |
| 2026-01-07 | `9b46857` | ViewSets complets + DRF router |
| 2026-01-25 | `f8a895b` | Import 873 exercices (management command) |
| 2026-01-26 | `3c5019f` | Filtrage + recherche Exercise API |
| 2026-01-30 | `beffafd` | Scraper Selenium videos (dernier commit) |

### Interpretation

Le projet a ete actif du 28/11/2025 au 30/01/2026 (~2 mois). Puis **arret complet pendant 4 mois** (fev-juin 2026).

**Tu t'etais arrete au milieu de l'enrichissement des exercices** :
- Le scraping des 406 videos Hevy etait termine
- Tu avais commence a modifier le modele Exercise (ajout video_url, external_id, etc.)
- Le modele est **casse** (syntaxe incomplete a la ligne 38)
- La migration correspondante n'a pas ete creee

### Modifications non commitees (actuellement)

- `liftapp/models.py` : 4 nouveaux champs en cours (3 incomplets, 1 syntaxe cassee)
- `liftapp/management/commands/dl_exo.py` : passage a SeleniumBase
- `last-commit-message.md` : modifie
- Fichiers non trackes : `data_vids.json`, `downloaded_files/`

---

## 11. Resume : Tu es ICI

**Backend Django a ~60% du MVP backend.** L'auth fonctionne (JWT + register/login/profile). Les 4 apps sont creees avec models, serializers, views, et routes. 873 exercices importes + 406 videos scrapees. Mais : le modele Exercise est casse (syntaxe invalide), 0 tests, 0 frontend, pas de requirements.txt, et les 4 nouveaux champs du modele ne sont pas termines. Prochaine etape immediate : corriger le modele Exercise, creer la migration, puis lancer le pipeline ETL d'import Hevy.

---

## 12. Ce a quoi je n'ai pas pense

### Pieges produit
- **Unites kg/lbs** : `Set.weight_kg` est en kg uniquement. Aucune gestion de conversion ou preference utilisateur.
- **Calcul 1RM** : Non implemente, pas de model `PersonalRecord`. Formule non choisie (Epley vs Brzycki).
- **Courbes de progression** : Aucun endpoint d'agregation statistique (volume par semaine, progression par exercice).
- **Historique complet** : Pas de vue "historique d'un exercice" (toutes les performances passees).
- **Offline mobile** : Architecture UUID + synced_at prevue, mais aucun mecanisme de sync cote serveur (pas de bulk sync endpoint, pas de delta sync, pas de conflict resolution).
- **Timer/chronometre** : Prevu dans Spec.md mais sera 100% frontend, rien cote backend.
- **Notifications push** : Prevues mais zero infrastructure (pas d'Expo push token stocke).

### Pieges ingenierie
- **Secrets** : `SECRET_KEY` est la cle `django-insecure-*` par defaut. Non securisee.
- **DEBUG = string** : `os.environ["DEBUG"]` retourne `"True"` (string truthy). Meme `DEBUG=False` dans `.env` sera `True` en Python.
- **Pas de requirements.txt** : Impossible de reproduire l'environnement.
- **Pas de CI/CD** : Aucun GitHub Actions, aucun linting automatique.
- **Pas de versioning API** : `/api/lift/` au lieu de `/api/v1/lift/`. Changement cassant futur.
- **Migrations non creees** : Le modele Exercise est modifie sans migration. La BDD et le code sont desyncs.
- **SQLite en dev** : Suffisant pour le dev mais certaines features Django (JSONField, ArrayField) se comportent differemment en SQLite vs PostgreSQL.
- **allauth configure mais pas teste** : Google OAuth est dans settings mais le flow complet (redirect, callback, token exchange) n'a probablement jamais ete teste end-to-end.
- **Pas d'admin pour liftapp** : Debug et verification des donnees en BDD difficile sans enregistrer les models dans l'admin.
- **CORS trop restrictif** : Seulement `localhost:8080` et `127.0.0.1:9000`. Le port Expo par defaut (8081, 19006) n'est pas inclus.
- **Token JWT 3h** : Access token de 180 minutes est un risque securite. Standard = 5-15 min avec refresh frequent.
