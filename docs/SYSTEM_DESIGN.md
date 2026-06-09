# SYSTEM_DESIGN.md - ARCHITECTURE TECHNIQUE DE LIFT

**Date** : 07/06/2026
**Objectif** : Documenter l'architecture technique reelle et cible du projet Lift, les decisions prises, et les trade-offs.

---

## 1. Vue d'Ensemble

### 1.1 Ce que Lift est

Une application mobile de suivi sportif (musculation + BJJ) avec :
- Un **backend Django/DRF** qui expose une API REST
- Un **frontend React Native (Expo)** (non demarre)
- Une architecture **offline-first** (prevue, non implementee)

### 1.2 Diagramme d'Architecture Cible

```
┌────────────────────────────────────┐
│         UTILISATEUR MOBILE         │
│      React Native (Expo)           │
│                                    │
│  ┌──────────┐    ┌──────────────┐  │
│  │ SQLite   │    │ Sync Queue   │  │
│  │ (local)  │    │ (offline)    │  │
│  └────┬─────┘    └──────┬───────┘  │
│       │                 │          │
└───────┼─────────────────┼──────────┘
        │    HTTPS/JWT    │
        ▼                 ▼
┌────────────────────────────────────┐
│         API GATEWAY / LB          │
│  (Heroku ou AWS ALB)              │
└──────────────┬─────────────────────┘
               │
┌──────────────▼─────────────────────┐
│       DJANGO REST FRAMEWORK        │
│                                    │
│  ┌──────────┐  ┌──────────────┐    │
│  │ accounts │  │   liftapp    │    │
│  │ (auth)   │  │ (muscu)      │    │
│  ├──────────┤  ├──────────────┤    │
│  │ bjjapp   │  │  nutrition   │    │
│  │ (bjj)    │  │ (poids)      │    │
│  └──────────┘  └──────────────┘    │
│                                    │
│  ┌──────────────────────────────┐  │
│  │   djangorestframework-jwt   │   │
│  │   django-allauth (OAuth)    │   │
│  │   django-filter             │   │
│  │   django-cors-headers       │   │
│  └──────────────────────────────┘  │
└──────────────┬─────────────────────┘
               │
┌──────────────▼─────────────────────┐
│         BASE DE DONNEES            │
│  Dev: SQLite3                      │
│  Prod: PostgreSQL (AWS RDS)        │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│         STOCKAGE ASSETS            │
│  AWS S3 (videos, images)           │
│  + AWS CloudFront (CDN)            │
└────────────────────────────────────┘
```

### 1.3 Etat actuel vs Cible

| Composant | Etat actuel | Etat cible MVP |
|-----------|-------------|----------------|
| Backend Django | ~60% (modele casse) | 100% |
| API REST endpoints | 11 endpoints | ~15-20 endpoints |
| Auth JWT | Fonctionnel | + refresh rotation, blacklist |
| OAuth | Configure, non teste | Google + Apple fonctionnels |
| Frontend React Native | 0% | 100% |
| BDD | SQLite3 | PostgreSQL |
| Tests | 0% | ≥80% coverage backend |
| CI/CD | 0% | GitHub Actions |
| Deploiement | Local | Heroku/AWS |
| Offline sync | Architecture UUID seulement | Queue + conflict resolution |
| CDN / Assets | Videos Hevy scrapees | S3 + CloudFront |

---

## 2. Architecture Backend

### 2.1 Separation en Apps Django

```
Lift/                    # Config Django (settings, urls, wsgi)
├── accounts/            # Authentification, profil utilisateur
├── liftapp/             # Musculation (coeur du produit)
├── bjjapp/              # BJJ / grappling
└── nutrition/           # Suivi poids corporel
```

**Principe** : chaque domaine metier = une app Django independante. C'est du **DDD leger** (Bounded Contexts).

**Trade-off** :
- (+) Separation claire des responsabilites
- (+) Chaque app peut etre testee independamment
- (+) Reutilisable dans un autre projet
- (-) Plus de fichiers a maintenir (4 x models/views/serializers/urls)
- (-) Relations cross-app (FK de liftapp vers accounts) creent un couplage

**Decision** : Garder cette architecture. C'est la bonne approche Django. Le couplage via FK est normal et gere par Django.

### 2.2 Pattern Architectural : ViewSet + Serializer + Model

```
Request HTTP
    │
    ▼
urls.py (DRF Router)
    │
    ▼
ViewSet (views.py)          ← Logique d'acces, permissions, filtrage
    │
    ▼
Serializer (serializers.py) ← Validation input, transformation output
    │
    ▼
Model (models.py)           ← Logique metier, contraintes BDD
    │
    ▼
Base de Donnees
```

C'est le pattern standard DRF. Chaque couche a une responsabilite unique :
- **ViewSet** : qui peut acceder, quel queryset servir
- **Serializer** : valider les donnees entrantes, formater les donnees sortantes
- **Model** : definir la structure, les contraintes, la logique metier

### 2.3 Choix de Design par Model

#### Exercise
| Decision | Choix | Pourquoi |
|----------|-------|----------|
| PK | UUIDField | Offline-first : pas de conflit d'ID |
| name | unique=True | Empeche les doublons a l'import |
| muscle_group | CharField + choices | Simple, performant, suffisant pour 16 groupes |
| secondary_muscle_groups | JSONField (a faire) | Peut contenir 0 a N groupes musculaires |
| video_url | URLField (a corriger) | Pointe vers le CDN Hevy ou S3 |
| external_id | CharField (a corriger) | Identifiant Hevy pour le mapping |
| exercise_type | CharField + choices (a creer) | weight_reps, reps_only, duration, etc. |
| on_delete vers Set | PROTECT | Empeche la suppression d'un exercice utilise dans une serie |

#### WorkoutSession + Set
| Decision | Choix | Pourquoi |
|----------|-------|----------|
| Session.template | FK nullable | Une seance peut etre libre (sans template) |
| Set.workout_session | FK CASCADE | Supprimer une seance supprime ses series |
| Set.exercise | FK PROTECT | Ne pas perdre la ref exercice d'une serie existante |
| weight_kg | DecimalField(6,2) | Precision au 0.01 kg, max 9999.99 kg |
| rpe | IntegerField nullable | Pas tous les sets ont un RPE |

#### WorkoutTemplate
| Decision | Choix | Pourquoi |
|----------|-------|----------|
| user | FK nullable | null = template public (seeded data), non-null = template utilisateur |
| name | unique=True | Problematique si deux users veulent le meme nom — a revoir post-MVP |

---

## 3. Architecture API

### 3.1 Convention d'URLs

```
/api/auth/register/          POST
/api/auth/login/             POST
/api/auth/me/                GET, PATCH
/api/auth/token/refresh/     POST

/api/lift/exercise/          GET, LIST (+ search, filter)
/api/lift/workout_template/  CRUD
/api/lift/template_exercise/ CRUD
/api/lift/workout_session/   CRUD
/api/lift/set/               CRUD

/api/bjj/promotions/         CRUD
/api/nutrition/weights/       CRUD
```

### 3.2 Decision : Flat vs Nested Endpoints

**Choix actuel** : endpoints flat (chaque resource a sa propre URL racine).

**Alternative** : endpoints nested (`/api/lift/workout_session/{id}/sets/`).

| Critere | Flat | Nested |
|---------|------|--------|
| Simplicite du router | Plus simple (DefaultRouter) | Plus complexe (drf-nested-routers) |
| Clarte de l'URL | Moins claire (quel session pour ce set?) | Plus claire (/session/123/sets/) |
| Filtrage | Via query params (?workout_session=uuid) | Implicite dans l'URL |
| Frontend | Doit connaitre l'ID de la session | URL plus naturelle |

**Recommandation** : Garder flat pour le MVP. Le frontend passera `workout_session` en query param ou dans le body. Si ca devient penible, migrer vers nested en v2.

### 3.3 Pagination

**Choix actuel** : aucune pagination configuree.

**Recommandation MVP** :
```python
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}
```

**Trade-off offset vs cursor** :
- **Offset** (PageNumberPagination) : simple, supporte "aller a la page 5", mais lent sur grosses tables
- **Cursor** (CursorPagination) : performant, pas de page skip, ideal pour feed infini

MVP = offset. Si les performances deviennent un probleme avec des milliers de seances, passer en cursor.

### 3.4 Filtrage et Recherche

**Etat actuel** (ExerciseViewSet) :
```python
filter_backends = [SearchFilter]      # Recherche texte libre
filterset_fields = ['muscle_group']   # Filtrage exact — MAIS DjangoFilterBackend n'est pas dans filter_backends
```

**Correction necessaire** :
```python
filter_backends = [DjangoFilterBackend, SearchFilter]
filterset_fields = ['muscle_group', 'equipment_needed', 'is_compound']
search_fields = ['name']
```

### 3.5 Format de Reponse Standard

Pas de format impose (pas de JSON:API, pas de HAL). Les reponses suivent le format DRF par defaut :

```json
// Liste paginee
{
    "count": 873,
    "next": "http://api/lift/exercise/?page=2",
    "previous": null,
    "results": [
        {"id": "uuid", "name": "Bench Press", ...}
    ]
}

// Detail
{
    "id": "uuid",
    "name": "Bench Press",
    "muscle_group": "CHEST",
    ...
}

// Erreur
{
    "detail": "Authentication credentials were not provided."
}
```

---

## 4. Architecture Authentification

### 4.1 Flow JWT Actuel

```
1. POST /api/auth/register/ {email, password, pseudo}
   → 201 {user, access_token, refresh_token}

2. POST /api/auth/login/ {email, password}
   → 200 {access_token, refresh_token}

3. GET /api/auth/me/ [Header: Authorization: Bearer <access_token>]
   → 200 {user profile}

4. POST /api/auth/token/refresh/ {refresh: <refresh_token>}
   → 200 {access: <new_access_token>}
```

### 4.2 Configuration JWT Actuelle

```
ACCESS_TOKEN_LIFETIME  = 180 minutes (3h)  ← TROP LONG (standard = 5-15 min)
REFRESH_TOKEN_LIFETIME = 7 jours           ← OK
ROTATE_REFRESH_TOKENS  = True              ← Bon (nouveau refresh a chaque refresh)
BLACKLIST_AFTER_ROTATION = True            ← Bon (ancien refresh invalide)
```

### 4.3 Probleme de Securite : DEBUG = string

```python
# settings.py actuel
DEBUG = os.environ["DEBUG"]  # Retourne "True" ou "False" (STRING)
# "False" est truthy en Python → DEBUG est TOUJOURS actif

# Correction necessaire
DEBUG = os.environ.get("DEBUG", "False").lower() == "true"
```

### 4.4 OAuth (Google + Apple)

Configure dans settings.py via django-allauth. Providers declares : Google, Apple.
**Non teste end-to-end.** Le flow OAuth necessite :
1. Un redirect URI configure chez Google/Apple
2. Un endpoint callback dans l'app
3. Un echange de token
4. Un merge avec compte existant si meme email

**Decision** : Reporter OAuth au post-MVP. Email/password + JWT suffit pour le lancement.

---

## 5. Architecture Offline-First

### 5.1 Strategie Prevue

Le Spec.md decrit une architecture offline-first :
- **UUIDs** comme PK (pas d'auto-increment) → creation offline sans conflit d'ID
- **synced_at** sur chaque model → savoir si un record a ete synchronise
- **Last-write-wins** → resolution de conflit simple

### 5.2 Ce qui est implemente

| Element | Etat |
|---------|------|
| UUID primary keys | Fait (tous les models) |
| synced_at field | Fait (tous les models) |
| created_at / updated_at | Fait (tous les models) |
| Bulk sync endpoint | Non fait |
| Conflict resolution logic | Non fait |
| Delta sync (only changed records) | Non fait |
| Frontend SQLite cache | Non fait (pas de frontend) |
| Sync queue (offline actions) | Non fait |

### 5.3 Design du Sync Endpoint (a implementer)

```
POST /api/sync/
{
    "last_sync": "2026-06-07T10:00:00Z",
    "changes": {
        "workout_sessions": [
            {"id": "uuid", "title": "Push Day", "updated_at": "...", ...}
        ],
        "sets": [
            {"id": "uuid", "weight_kg": 100, "reps": 8, ...}
        ]
    }
}

Response:
{
    "server_changes": {
        "workout_sessions": [...records updated since last_sync...],
        "sets": [...]
    },
    "conflicts": [
        {"id": "uuid", "client_updated_at": "...", "server_updated_at": "...", "resolution": "server_wins"}
    ]
}
```

### 5.4 Trade-offs Conflict Resolution

| Strategie | Complexite | Fiabilite | Choix Lift |
|-----------|------------|-----------|------------|
| **Last-write-wins** | Simple | Perte possible du plus ancien | MVP |
| **Client-wins** | Simple | Risque de perte serveur | Non |
| **Server-wins** | Simple | Risque de perte client | Non |
| **Merge field-level** | Complexe | Meilleure preservation | Post-MVP |
| **CRDT** | Tres complexe | Ideal | Overkill |

---

## 6. Architecture Donnees Exercices

### 6.1 Pipeline de Donnees

```
SOURCE 1: free-exercise-db (GitHub)     SOURCE 2: API Hevy        SOURCE 3: Scraping Hevy
  873 exercices                           435 exercices               406 video URLs
  exercises.json                          hevy.json                   data_vids.json
        │                                      │                          │
        ▼                                      ▼                          ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                     ETL PIPELINE (import_hevy.py)                         │
│                                                                           │
│  1. EXTRACT : Charger les 3 fichiers JSON                                │
│  2. TRANSFORM :                                                           │
│     - Mapping muscle_group Hevy → choices Django                          │
│     - Fuzzy match noms exercices (free-exercise-db ↔ Hevy)               │
│     - Merge secondary_muscle_groups depuis Hevy                           │
│     - Association video_url via hevy_id                                   │
│  3. LOAD :                                                                │
│     - update_or_create() pour idempotence                                 │
│     - Logging des stats (matches, misses, conflicts)                      │
└────────────────────────────────────┬──────────────────────────────────────┘
                                     │
                                     ▼
                          Exercise (BDD Django)
                          873+ exercices enrichis
```

### 6.2 Decisions sur le Stockage Video

| Option | Avantage | Inconvenient | Choix |
|--------|----------|--------------|-------|
| **Lien CDN Hevy** | Zero stockage, zero cout | Depend de Hevy, peut disparaitre | Temporaire |
| **Self-hosted S3** | Controle total, perenne | Cout stockage + bande passante | Cible |
| **Pas de video** | Simple | UX degradee | Non |

**Decision** : utiliser les URLs Hevy pour le MVP, migrer vers S3 en production. Telecharger les 406 videos (probable ~5-10 Go) et les servir via CloudFront.

---

## 7. Architecture Frontend (prevue)

### 7.1 Stack

| Technologie | Role |
|-------------|------|
| React Native | Framework mobile cross-platform |
| Expo | Tooling, build, deploy (EAS) |
| Expo Router | Navigation (file-based routing) |
| AsyncStorage / expo-sqlite | Cache local offline |
| Axios ou fetch | Appels API |
| Zustand ou Redux Toolkit | State management |
| React Query (TanStack) | Cache API, refetch, sync |

### 7.2 Structure de Navigation Prevue

```
Tab Navigator
├── Accueil (Home)
│   ├── Bulles activite 7 jours
│   ├── Carrousel stats
│   └── Widgets rapides
│
├── Lift (Musculation)
│   ├── Liste templates
│   ├── Ecran seance active
│   │   ├── Liste exercices
│   │   ├── Saisie series
│   │   └── Timer repos
│   └── Historique seances
│
├── Luta Livre (BJJ)
│   ├── Theme du jour
│   ├── Journal combats
│   └── Ceinture actuelle
│
└── Profil
    ├── Infos utilisateur
    ├── Statistiques globales
    └── Parametres
```

### 7.3 Pattern de Communication Frontend ↔ Backend

```
ONLINE :
  React Query cache → API Django → BDD PostgreSQL

OFFLINE :
  Action utilisateur
    → Ecriture SQLite local (optimistic update)
    → Ajout dans Sync Queue
    → Quand reseau revient :
       → POST /api/sync/ avec toutes les actions en attente
       → Mise a jour SQLite local avec reponse serveur
       → Purge de la Sync Queue
```

---

## 8. Architecture Infrastructure

### 8.1 Environnements

| Env | Backend | BDD | Assets | Frontend |
|-----|---------|-----|--------|----------|
| **Dev** (actuel) | `manage.py runserver` | SQLite3 | Fichiers locaux | Expo Go |
| **Staging** | Heroku Dyno | Heroku Postgres | S3 bucket staging | Expo Preview |
| **Prod** | Heroku Dyno (ou AWS EC2) | AWS RDS PostgreSQL | S3 + CloudFront | App Store / Play Store |

### 8.2 Schema d'Infrastructure Production

```
┌──────────────┐         ┌──────────────┐
│  App Store   │         │  Play Store  │
│  (iOS)       │         │  (Android)   │
└──────┬───────┘         └──────┬───────┘
       │                        │
       ▼                        ▼
┌────────────────────────────────────┐
│        Expo Application            │
│    React Native (bundle JS)        │
└──────────────┬─────────────────────┘
               │ HTTPS
               ▼
┌────────────────────────────────────┐
│      Heroku / AWS ALB              │
│      (Load Balancer + SSL)         │
└──────────────┬─────────────────────┘
               │
┌──────────────▼─────────────────────┐
│      Django App (Gunicorn)         │
│      + WhiteNoise (static files)   │
└──────┬──────────────┬──────────────┘
       │              │
       ▼              ▼
┌──────────┐   ┌──────────────┐
│PostgreSQL│   │    AWS S3     │
│(RDS)     │   │  (videos,    │
│          │   │   images)     │
└──────────┘   └──────┬───────┘
                      │
               ┌──────▼───────┐
               │  CloudFront  │
               │  (CDN)       │
               └──────────────┘
```

### 8.3 Estimation Couts Production

| Service | Tier | Cout mensuel estime |
|---------|------|---------------------|
| Heroku (backend) | Eco Dyno | ~5$/mois |
| Heroku Postgres | Mini | ~5$/mois |
| AWS S3 | Free tier puis ~0.02$/Go | ~2-5$/mois (10Go videos) |
| CloudFront | Free tier (1To/mois) | 0$ pour le MVP |
| Sentry | Free tier | 0$ |
| Apple Developer | Annuel | 99$/an |
| Google Play | One-time | 25$ |
| **Total MVP** | | **~15-20$/mois + 125$ one-time** |

---

## 9. Securite

### 9.1 Etat Actuel

| Element | Etat | Risque |
|---------|------|--------|
| JWT auth | Fonctionnel | Access token 3h = trop long |
| SECRET_KEY | Valeur par defaut Django | CRITIQUE en prod |
| DEBUG | Toujours True (bug string) | CRITIQUE en prod |
| CORS | Localhost seulement | A configurer pour prod |
| HTTPS | Non force | A activer en prod |
| Rate limiting | Non implemente | Vulnerable au brute-force |
| Input validation | Serializers DRF | OK pour le MVP |
| SQL injection | ORM Django | Protege par defaut |
| XSS | Pas de frontend | Non applicable (API only) |
| CSRF | DRF exempte par defaut (JWT) | OK |

### 9.2 Checklist Securite Pre-Production

- [ ] Generer une vraie SECRET_KEY
- [ ] Corriger DEBUG (string → bool)
- [ ] Reduire ACCESS_TOKEN_LIFETIME a 15 min
- [ ] Configurer CORS pour le domaine de prod
- [ ] Activer SECURE_SSL_REDIRECT, SECURE_HSTS_SECONDS
- [ ] Activer CSRF_COOKIE_SECURE, SESSION_COOKIE_SECURE
- [ ] Implementer rate limiting sur /api/auth/login/
- [ ] Ne pas exposer les tracebacks Django en prod (DEBUG=False)
- [ ] Configurer ALLOWED_HOSTS avec le domaine de prod
- [ ] Auditer les permissions (retirer AllowAny par defaut)

---

## 10. Decisions Architecturales Non Prises

Ces decisions sont encore ouvertes et devront etre tranchees :

### 10.1 Calcul des Statistiques

| Approche | Avantage | Inconvenient |
|----------|----------|--------------|
| **Calcul a la volee** | Toujours a jour, simple | Lent sur grosses requetes |
| **Pre-calcul en BDD** | Rapide a lire | Complexe a maintenir, risque de desync |
| **Cache Redis** | Rapide, TTL configurable | Infra supplementaire |

**Recommandation** : calcul a la volee pour le MVP (peu d'utilisateurs, peu de donnees). Ajouter du cache si les temps de reponse depassent 500ms.

### 10.2 Gestion des Images d'Exercices

Le Spec.md mentionne des thumbnails. Les exercices free-exercise-db ont des GIFs (600+ fichiers). Decision a prendre :
- Servir les GIFs depuis S3 (lourd, ~500Mo)
- Convertir en WebP/AVIF (plus leger)
- Ne servir que les videos (les thumbnails sont un frame de la video)

### 10.3 Notifications Push

Prevu dans le Spec.md (nouveau PR, rappel d'entrainement). Necessite :
- Un champ `expo_push_token` sur CustomUser
- Un service d'envoi (Expo Push API)
- De la logique metier (quand notifier)

Non prioritaire pour le MVP.

---

## 11. Ce a quoi je n'ai pas pense

### Architecture
- **Versioning API** : Pas de `/api/v1/`. Quand le frontend sera en production et que tu changeras un serializer, tous les utilisateurs avec une vieille version de l'app casseront. Solution : ajouter `/v1/` maintenant, avant le premier utilisateur.
- **Health check endpoint** : Aucun endpoint `/health/` pour le monitoring. Heroku, AWS, et les load balancers en ont besoin pour savoir si l'app est vivante.
- **Logging structure** : Aucun logging configure. En production, tu ne verras pas les erreurs sans un systeme de logging (Sentry, CloudWatch).
- **Throttling par utilisateur** : Un utilisateur malveillant peut faire 10 000 requetes/seconde. DRF offre des throttle classes natives (`UserRateThrottle`, `AnonRateThrottle`).

### Data
- **Backup BDD** : Aucune strategie de backup. En SQLite c'est un fichier a copier. En PostgreSQL prod, il faut des backups automatiques (RDS les fait, mais il faut les configurer).
- **Soft delete** : Quand un utilisateur supprime une seance, elle est detruite (CASCADE). Pas de corbeille, pas de restauration. Un `is_deleted` + `deleted_at` permettrait un soft delete.
- **Audit trail** : Qui a modifie quoi et quand. Utile pour le debug et la conformite RGPD. Library : `django-auditlog`.

### Performance
- **N+1 queries** : Les serializers avec nested relations (WorkoutSession → Sets → Exercise) vont generer N+1 queries sans `select_related` / `prefetch_related` dans les ViewSets.
- **Database indexes** : Aucun index custom. Les FK sont indexees automatiquement par Django, mais les queries frequentes (`Exercise.name`, `WorkoutSession.date`, `Set.workout_session + set_number`) pourraient beneficier d'indexes composites.

### Mobile
- **Deep linking** : Si un utilisateur partage un lien vers une seance, l'app doit pouvoir l'ouvrir directement. Necessite une configuration Expo + backend.
- **App versioning** : Quand tu publies une v2 de l'API, les utilisateurs avec la v1 de l'app doivent etre geres. Force update ? Graceful degradation ?
