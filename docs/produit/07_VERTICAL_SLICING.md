# 07_VERTICAL_SLICING.md — Vertical Slicing

**Date** : 08/06/2026  
**Sources** : `METHODES.md:2`, `ROADMAP.md`, code réel des 4 apps Django

---

## État Actuel : Découpage Horizontal (Layer-First)

Le projet a suivi une approche horizontale : construire chaque couche complète d'une app avant de passer à la suivante. Résultat constaté dans le code :

- **4 apps backend créées** (accounts, liftapp, bjjapp, nutrition) avec models, serializers, views, URLs
- **0 app frontend** : aucun fichier React Native / Expo dans le dépôt
- **873 exercices importés** mais aucun utilisateur ne peut y accéder via une interface
- **1 bug bloquant** (`liftapp/models.py:38`) laissé en suspens depuis 4 mois parce qu'une nouvelle tâche (scraping Selenium) a été commencée avant la fin de la précédente

**Conséquence pratique** : le parcours utilisateur "ouvrir l'app → se connecter → voir un exercice" n'est réalisable par personne aujourd'hui. Zéro tranche verticale n'est traversée de bout en bout.

Source : inspection complète de l'arborescence — aucun `package.json`, aucun dossier `app/`, `mobile/` ou `frontend/` n'existe dans `c:/Users/maxym/Desktop/Projets/Lift`.

---

## Proposition de Tranches Verticales

### Tranche V0 — Walking Skeleton (Milestone 0 + 3 partiel)

**User Story** : US-001 (corriger le modèle) + US-020 (voir les exercices)  
**Valeur** : "Je lance l'app Expo sur mon téléphone et je vois la liste des exercices."  
**Demo moment** : App sur téléphone, liste de 873 exercices qui scrolle.

| Couche | Ce qui existe | Ce qui reste à faire |
|--------|--------------|---------------------|
| Model `Exercise` | [CASSÉ] `liftapp/models.py:6-38` | Corriger `exercise_type =` + `video_url` + `external_id` + `secondary_muscle_groups` |
| Migration | [ABSENT] | `makemigrations liftapp` puis `migrate` |
| Serializer `ExerciseSerializer` | [CASSÉ] `liftapp/serializers.py:5-12` (champs manquants) | Ajouter `video_url`, `exercise_type`, `secondary_muscle_groups` |
| View `ExerciseViewset` | [CASSÉ] `liftapp/views.py:17-25` (SyntaxError) | Fix après correction du modèle |
| URL `GET /api/lift/exercise/` | [CASSÉ] `liftapp/urls.py:5` | Fonctionnel après fix |
| Écran React Native liste exercices | [ABSENT] | Créer projet Expo + écran FlatList |
| Appel API depuis l'écran | [ABSENT] | `fetch()` ou Axios vers `/api/lift/exercise/` |

**DoD applicable** : DoD Globale + DoD Backend + DoD Frontend  
**Durée estimée** : 3-4 jours (1j fix backend + 2-3j walking skeleton Expo)

---

### Tranche V1 — S'inscrire et Se Connecter (Milestone 3)

**User Story** : US-010 (inscription) + US-011 (connexion)  
**Valeur** : "Je crée un compte, je me connecte, je suis redirigé vers l'écran principal avec mes exercices."  
**Demo moment** : Flux inscription → connexion → liste exercices sur vrai téléphone.

| Couche | Ce qui existe | Ce qui reste à faire |
|--------|--------------|---------------------|
| Model `CustomUser` | [EXISTE] `accounts/models.py:6` | Rien |
| View `RegisterView` | [EXISTE] `accounts/views.py:9` | Rien |
| View `LoginView` | [EXISTE] `accounts/views.py:35` | Rien |
| Serializers auth | [EXISTE] `accounts/serializers.py` | Rien |
| URLs auth | [EXISTE] `accounts/urls.py` | Rien |
| Écran Inscription (RN) | [ABSENT] | Créer l'écran avec champs email/password/pseudo |
| Écran Connexion (RN) | [ABSENT] | Créer l'écran avec champs email/password |
| Stockage JWT (SecureStore) | [ABSENT] | Intégrer expo-secure-store |
| Navigation post-login | [ABSENT] | Expo Router : redirect vers tab principal |
| Intercepteur JWT sur les requêtes | [ABSENT] | Ajouter header `Authorization: Bearer` automatiquement |

**DoD applicable** : DoD Backend + DoD Frontend + DoD Sécurité  
**Durée estimée** : 1 semaine

---

### Tranche V2 — ETL Enrichissement Exercices (Milestone 1)

**User Story** : US-023 (enrichir exercices Hevy)  
**Valeur** : "Les exercices ont des vidéos et des muscles secondaires. L'API les retourne."  
**Demo moment** : `GET /api/lift/exercise/` retourne un exercice avec `video_url` et `secondary_muscle_groups`.

| Couche | Ce qui existe | Ce qui reste à faire |
|--------|--------------|---------------------|
| Model `Exercise` champs enrichis | [CASSÉ] → corrigé en V0 | — |
| `hevy.json` (435 exos) | [EXISTE] à la racine | — |
| `data_vids.json` (406 URLs) | [EXISTE] à la racine | — |
| Management command `import_hevy.py` | [ABSENT] | Créer : EXTRACT + fuzzy match + LOAD via `update_or_create` |
| `ExerciseSerializer` avec nouveaux champs | [CASSÉ] `liftapp/serializers.py:8` | Ajouter `video_url`, `exercise_type`, `secondary_muscle_groups` |

**DoD applicable** : DoD ETL + DoD Backend  
**Durée estimée** : 2 jours

---

### Tranche V3 — Enregistrer une Séance Complète (Milestone 4)

**User Story** : US-030 + US-031 + US-033 (choisir template → saisir séries → sauvegarder)  
**Valeur** : "Je fais ma vraie séance de muscu avec l'app. Les données sont en BDD."  
**Demo moment** : Séance réelle faite avec l'app, vérification dans l'admin Django.

| Couche | Ce qui existe | Ce qui reste à faire |
|--------|--------------|---------------------|
| Model `WorkoutTemplate` | [CASSÉ] → corrigé en V0 | Seeder 10 templates prédéfinis |
| Model `TemplateExercise` | [CASSÉ] → corrigé en V0 | — |
| Model `WorkoutSession` | [CASSÉ] → corrigé en V0 | — |
| Model `Set` | [CASSÉ] → corrigé en V0 | — |
| View `WorkoutTemplateViewset` | [CASSÉ] `liftapp/views.py:27` | Fonctionnel après fix + seeder |
| View `WorkoutSessionViewSet` | [CASSÉ] `liftapp/views.py:48` | Fonctionnel après fix |
| View `SetViewSet` | [CASSÉ] `liftapp/views.py:60` | Fonctionnel après fix |
| Écran "Choisir un template" (RN) | [ABSENT] | FlatList des templates |
| Écran "Séance en cours" (RN) | [ABSENT] | Liste exercices + saisie séries par exercice |
| Timer de repos (RN) | [ABSENT] | Countdown configurable en secondes |
| Sauvegarde séance (RN) | [ABSENT] | POST WorkoutSession + POST Set × N |
| Écran résumé fin de séance (RN) | [ABSENT] | Volume total, durée, bouton "Terminer" |

**DoD applicable** : DoD Globale + DoD Backend + DoD Frontend  
**Durée estimée** : 2 semaines

---

### Tranche V4 — Voir sa Progression (Milestone 5)

**User Story** : US-040 + US-041 + US-042 (historique + PRs + volume semaine)  
**Valeur** : "Après 5 séances, je vois mes stats et mon PR au bench press."  
**Demo moment** : Écran stats avec graphique de volume, écran historique cliquable.

| Couche | Ce qui existe | Ce qui reste à faire |
|--------|--------------|---------------------|
| Endpoint `GET /api/lift/workout_session/` | [CASSÉ] → corrigé en V3 | — |
| Endpoint stats `GET /api/lift/stats/weekly/` | [ABSENT] | Créer la vue d'agrégation |
| Endpoint stats `GET /api/lift/stats/prs/` | [ABSENT] | Créer la vue PRs par exercice |
| Écran historique (RN) | [ABSENT] | FlatList des sessions + détail |
| Écran stats (RN) | [ABSENT] | Volume semaine, PRs, graphique |

**DoD applicable** : DoD Backend + DoD Frontend  
**Durée estimée** : 2 semaines

---

### Tranche V5 — Tests et Couverture (Milestone 2)

**User Story** : US-070 + US-071 (tests auth + tests permissions)  
**Valeur** : "Je peux refactorer sans peur. CI/CD tourne sur chaque push."  
**Demo moment** : `pytest --cov` affiche ≥ 60%.

| Couche | Ce qui existe | Ce qui reste à faire |
|--------|--------------|---------------------|
| `accounts/tests.py` | [ABSENT] (fichier vide) | Tests register, login, profil, refresh |
| `liftapp/tests.py` | [ABSENT] (fichier vide) | Tests CRUD sessions, sets, permissions |
| `bjjapp/tests.py` | [ABSENT] | Tests CRUD promotions |
| `nutrition/tests.py` | [ABSENT] | Tests CRUD WeightLog |
| GitHub Actions | [ABSENT] | Workflow CI/CD |

**DoD applicable** : DoD Globale  
**Durée estimée** : 3 jours

---

## Walking Skeleton Détaillé — La Tranche la Plus Fine Possible

La tranche la plus fine end-to-end qui prouve que l'architecture fonctionne :

```
WALKING SKELETON : "Voir la liste des exercices depuis l'app Expo"

1. CORRIGER (backend — V0 partiel)
   liftapp/models.py:38  : exercise_type = CharField(choices=EXERCISE_TYPE_CHOICES, max_length=20, blank=True)
   → python manage.py makemigrations liftapp
   → python manage.py migrate

2. VÉRIFIER (backend)
   → python manage.py runserver
   → curl http://localhost:8000/api/lift/exercise/ → 200 OK avec liste

3. INITIALISER (frontend)
   → npx create-expo-app LiftMobile --template blank
   → cd LiftMobile && npx expo start

4. CRÉER (frontend — 1 seul écran)
   screens/ExerciseList.js :
     - useEffect : fetch('http://localhost:8000/api/lift/exercise/')
     - FlatList avec nom + muscle_group
     - ActivityIndicator pendant le chargement
     - Message d'erreur si fetch échoue

5. TESTER (device)
   → Scanner le QR code Expo Go sur son téléphone
   → Voir la liste des 873 exercices s'afficher

RÉSULTAT : Architecture React Native ↔ Django ↔ SQLite validée.
Durée totale : 3-4h (après avoir corrigé le bug models.py)
Aucune feature utilisateur. Juste la preuve que les couches communiquent.
```

Ce walking skeleton est le point d'entrée de toutes les tranches suivantes. Il ne peut pas être sauté.
