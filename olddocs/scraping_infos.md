 RAPPORT D'ANALYSE ARCHITECTURALE - HEVY.COM
Executive Summary
J'ai effectué une analyse pédagogique complète de l'architecture et des patterns d'API de Hevy en utilisant DevTools et l'inspection du DOM. Voici les findings détaillés.

🏗️ Phase 1: Architecture Générale
Stack Technologique Identifié
ComposantDétailFramework FrontendNext.js (React framework)Build IDgfN3hZLokLE79nse2SJ1YVersion0.1.0RenduServer-Side Generation (SSG) + Static Site GenerationArchitectureHybrid (Next.js pages avec __NEXT_DATA__)
Infrastructure Détectée

Frontend CDN: Hevy.com (Next.js hosting - probablement Vercel)
Image CDN: d2l9nsnmtah87f.cloudfront.net (CloudFront AWS)
Exercise Media: pump-app.s3.eu-west-2.amazonaws.com (S3 AWS)
Error Tracking: Sentry.io (intégration monitoring)
Analytics: Vercel Web Vitals


🔍 Phase 2: Patterns d'URLs et Endpoints
Structure des Routes Frontend
/ (Home/Feed)
├── /routines (Liste des routines utilisateur)
├── /exercise (Bibliothèque d'exercices)
├── /profile (Profil utilisateur connecté)
├── /settings (Paramètres)
├── /user/[username] (Profil public utilisateur)
├── /workout/[workoutId] (Détails d'un entraînement)
└── /routine/[routineId] (Détails d'une routine)
Patterns de Paramètres d'URL

User Profile: /user/{username} (ex: /user/nasraelos)
Workout Details: /workout/{workoutId} (ex: /workout/YBg4AmgsypL)
Routine Details: /routine/{routineId} (ex: /routine/LLKxwQK2Rjl)


📡 Phase 3: Analyse des Requêtes Réseau
Requêtes Capturées
1. Chargement des Assets Next.js:
GET https://hevy.com/_next/static/chunks/pages/user/[username]-3d57d1664796961b.js
GET https://hevy.com/_next/static/chunks/pages/workout/[workoutId]-600bbf89d6af9171.js
GET https://hevy.com/_next/static/chunks/9686-3f923210a7d5fdf2.js
2. Ressources Statiques (Images):
GET https://d2l9nsnmtah87f.cloudfront.net/profile-images/[username]-[uuid].jpg
GET https://pump-app.s3.eu-west-2.amazonaws.com/exercise-thumbnails/[exerciseId]-[name]_[category]_thumbnail@3x.jpg
3. Monitoring (Sentry):
POST https://o276807.ingest.sentry.io/api/4504763926642688/envelope/
Observations Clés

Pas d'API XHR/Fetch directes détectées dans les requêtes de navigation standard
Les données semblent server-side rendered (SSR) dans __NEXT_DATA__
CDN optimisé avec CloudFront pour les images de profil
S3 pour les assets (exercices, thumbnails)


📦 Phase 4: Structure des Données JSON
Données de Workout
json{
  "workout": {
    "id": "YBg4AmgsypL",
    "title": "Solid Snake",
    "username": "nasraelos",
    "date": "8 Dec 2025, 11:26",
    "duration": {
      "value": 85,
      "unit": "minutes"
    },
    "volume": {
      "value": 3620,
      "unit": "kg"
    },
    "exercises": [
      {
        "name": "Butterfly (Pec Deck)",
        "category": "Chest",
        "sets": [
          { "weight": 35, "reps": 10, "unit": "kg" },
          { "weight": 35, "reps": 10, "unit": "kg" }
        ]
      },
      {
        "name": "Bench Press (Barbell)",
        "category": "Chest",
        "sets": [
          { "weight": 40, "reps": 10, "unit": "kg" },
          { "weight": 60, "reps": 3, "unit": "kg" },
          { "weight": 70, "reps": 3, "unit": "kg" }
        ]
      }
    ]
  }
}
Données de Profil Utilisateur
json{
  "user": {
    "username": "nasraelos",
    "displayName": "Nas",
    "stats": {
      "workouts": 74,
      "followers": 0,
      "following": 0
    },
    "profile_image": "https://d2l9nsnmtah87f.cloudfront.net/profile-images/nasraelos-[uuid].jpg",
    "routines": [
      { "id": "LLKxwQK2Rjl", "name": "Solid Snake" },
      { "id": "aBqXsYmZcSE", "name": "Liquid Snake" }
    ],
    "recent_workouts": [
      {
        "id": "YBg4AmgsypL",
        "title": "Solid Snake",
        "date": "8 Dec 2025, 11:26"
      }
    ]
  }
}
```

---

## 🔐 Phase 5: Analyse d'Authentification

### Mécanismes Détectés

- **Cookies de Session**: Present (bloqué pour inspection directe)
- **Next.js Data Hydration**: Utilise `__NEXT_DATA__` (window object)
- **Authentication State**: `isAuthenticated: true` (présent dans `pageProps`)
- **No API Token détecté** dans les headers publics

### Headers Probables (patterns typiques Next.js)
```
Authorization: [Bearer token | Session Cookie]
Content-Type: application/json
User-Agent: [Browser user agent]
Accept: application/json

🎯 Phase 6: Comparaison - API vs HTML Parsing
Approche 1: API (Non trouvée mais probable)
Avantages:

✅ Structure JSON propre et maintenable
✅ Efficacité (moins de données transmises)
✅ Requêtes intelligentes (pagination, filtrage)
✅ Gestion d'erreurs standardisée

Inconvénients:

❌ Peut être protégée (rate limiting, authentification)
❌ Peut changer sans préavis
❌ Nécessite reverse-engineering des endpoints

Approche 2: HTML Parsing (Actuellement utilisée)
Avantages:

✅ Données déjà dans __NEXT_DATA__ au chargement
✅ Server-side rendering = données complètes en HTML
✅ Accès facile via JavaScript

Inconvénients:

❌ Plus de données à parser
❌ Structure peut changer si le design change
❌ Complexité d'extraction accrue


📊 Phase 7: Preuves Pédagogiques Collectées
1. Next.js Data Object
javascriptwindow.__NEXT_DATA__ = {
  props: {
    pageProps: {
      isAuthenticated: true
    }
  },
  page: "/",
  query: {},
  buildId: "gfN3hZLokLE79nse2SJ1Y",
  runtimeConfig: { version: "0.1.0" }
}
```

### 2. Types de Requêtes Réseau

| Type | Exemple | Purpose |
|------|---------|---------|
| **JavaScript Chunks** | `_next/static/chunks/pages/...` | Code splitting Next.js |
| **Images CDN** | `d2l9nsnmtah87f.cloudfront.net` | Profile images (optimized) |
| **S3 Assets** | `pump-app.s3.eu-west-2.amazonaws.com` | Exercise thumbnails |
| **Monitoring** | `sentry.io` | Error tracking |

### 3. Routes Analysées

- ✅ `/` (Home Feed)
- ✅ `/routines` (Routines list)
- ✅ `/exercise` (Exercise library)
- ✅ `/profile` (User's profile)
- ✅ `/user/[username]` (Public profile)
- ✅ `/workout/[workoutId]` (Workout details)

---

## 💡 Insights Architecturaux

### 1. **Rendering Strategy**
Hevy utilise **Static Site Generation (SSG)** avec **Server-Side Rendering (SSR)** pour:
- Pages publiques (routines, exercices) → SSG
- Données utilisateur → SSR avec authentication check

### 2. **Data Flow**
```
User Browser
    ↓
Next.js Page (SSR/SSG)
    ↓
__NEXT_DATA__ (JSON embedded)
    ↓
React Hydration
    ↓
Client-side Interaction
3. CDN Strategy

CloudFront pour images (rapide, distribué globalement)
S3 pour assets statiques (économique)
Vercel pour le code Next.js (co-localisé)

4. Performance

Code splitting par page (chunks/pages/...)
Image optimization (CloudFront, retina @3x)
Caching HTTP standard


⚠️ Observations Importantes

Pas d'API GraphQL détectée - Probablement pas de endpoint GraphQL public
Pas de requêtes XHR/Fetch visibles - Les données sont server-rendered
Sentry errors masqués (503) - Indicatif que l'app suit les bonnes pratiques
Build versioning - Next.js build IDs changent à chaque déploiement


📝 Recommandations pour Extraction de Données
Scénario Académique: DOM Parsing
javascript// Extraire les données depuis __NEXT_DATA__
const workoutData = window.__NEXT_DATA__.props.pageProps;

// Parser le contenu rendu du DOM
const exerciseElements = document.querySelectorAll('[data-exercise]');
const setData = Array.from(exerciseElements).map(el => ({
  name: el.querySelector('.exercise-name').textContent,
  sets: el.querySelectorAll('[data-set]').length
}));
Scénario Production: API Officielle

Contacter Hevy pour une API official
Vérifier s'il existe une API privée documentée
Explorer https://hevy.com/api/* endpoints


📚 Ressources Utilisées

Chrome DevTools → Network Tab
JavaScript Object Inspection (window.__NEXT_DATA__)
DOM Content Analysis
URL Pattern Recognition
CloudFront & S3 Infrastructure Analysis


✅ Conclusions
Hevy.com Architecture Summary:

Framework: Next.js (React)
Rendering: SSG + SSR hybrid
Data Delivery: Embedded JSON (__NEXT_DATA__)
CDN: AWS CloudFront + S3
Auth: Likely JWT or Session Cookies
API: Probablement privée/non détectée dans les requêtes XHR

Cette architecture est optimisée pour performance et SEO tout en protégeant les données utilisateur via server-side rendering.

---

## 🎯 MISE À JOUR - API OFFICIELLE HEVY DÉCOUVERTE (28/01/2026)

### API Publique Hevy

| Élément | Détail |
|---------|--------|
| **Base URL** | `https://api.hevyapp.com/v1/` |
| **Auth** | Header `api-key: {uuid}` |
| **Accès** | Hevy Pro uniquement |
| **Documentation** | https://api.hevyapp.com/docs |
| **Clé API** | Disponible sur `hevy.com/settings?developer` |

### Endpoints Utilisés

| Endpoint | Description | pageSize max |
|----------|-------------|--------------|
| `GET /v1/exercise_templates` | Liste tous les exercices | 100 |
| `GET /v1/workouts` | Workouts utilisateur | 10 |
| `GET /v1/routines` | Routines utilisateur | 10 |

### Structure ExerciseTemplate (API)

```json
{
  "id": "79D0BB3A",
  "title": "Bench Press (Barbell)",
  "type": "weight_reps",
  "primary_muscle_group": "chest",
  "secondary_muscle_groups": ["triceps", "shoulders"],
  "equipment": "barbell",
  "is_custom": false
}
```

### CDN Assets - Pattern URL

| Type | Pattern | Exemple |
|------|---------|---------|
| **Thumbnail** | `/exercise-thumbnails/{numericId}-{Name}_{Muscle}_thumbnail_@3x.jpg` | `04031201-Dumbbell-Curl_Biceps_thumbnail_@3x.jpg` |
| **Video MP4** | `/exercise-assets/{numericId}-{Name}_{Muscle}.mp4` | `08571201-Wheel-Rollout_Waist.mp4` |

**⚠️ PROBLÈME IDENTIFIÉ:**
- L'API retourne des IDs hexadécimaux (`79D0BB3A`)
- Le CDN utilise des IDs numériques (`08571201`)
- **Pas de mapping direct** entre les deux systèmes

### Décision Prise: OPTION D - Fusion Intelligente

**Stratégie choisie pour uniformiser les données exercices:**

| Source | Exercices | secondary_muscle_groups | Action |
|--------|-----------|-------------------------|--------|
| **Hevy API** | ~400-500 | ✅ Complet | Utiliser comme source principale |
| **free-exercise-db** | 873 | ❌ Manquant | Garder si non présent dans Hevy |

**Règles de fusion:**
1. Pour chaque exercice: si existe dans Hevy → utiliser données Hevy (plus complètes)
2. Si exercice uniquement dans free-exercise-db → garder avec `secondary_muscle_groups=[]`
3. Matching par nom (fuzzy matching si nécessaire)

**Modifications modèle Exercise requises:**
- Ajouter `secondary_muscle_groups` (ArrayField ou ManyToMany)
- Ajouter `exercise_type` (weight_reps, reps_only, duration, etc.)
- Ajouter `hevy_id` (optionnel, pour référence future)

---

## 📋 Prochaines Étapes

1. [ ] Récupérer toutes les pages API (1-5) → ~400-500 exercices
2. [ ] Investiguer le mapping ID API ↔ ID CDN pour les vidéos
3. [ ] Modifier modèle Exercise Django
4. [ ] Créer management command `import_hevy.py`
5. [ ] Exécuter fusion avec free-exercise-db existant
