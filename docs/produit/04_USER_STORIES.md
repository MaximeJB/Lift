# 04_USER_STORIES.md — User Stories Complètes

**Date** : 08/06/2026  
**Format** : INVEST — Independent, Negotiable, Valuable, Estimable, Small, Testable  
**Taille** : XS (< 2h), S (2h-1j), M (1-3j), L (3-5j), XL (> 5j)

---

## RÔLES UTILISATEURS

- **Pratiquant** : utilisateur qui fait de la musculation (rôle principal)
- **Grappeur** : utilisateur qui fait du BJJ / Luta Livre
- **Utilisateur** : tout utilisateur de l'application (non authentifié ou authentifié)

---

## EPIC 0 — DÉBLOQUER LE PROJET

### US-001 — Corriger le modèle Exercise

**En tant que** développeur,  
**je veux** que `liftapp/models.py` compile sans SyntaxError,  
**afin de** pouvoir démarrer le serveur Django et utiliser tous les endpoints liftapp.

| Attribut | Valeur |
|----------|--------|
| ID | US-001 |
| EPIC parent | EPIC 0 — Débloquer le projet |
| Priorité MoSCoW | Must |
| Taille | XS |
| Statut | [CASSÉ] — `liftapp/models.py:38` : `exercise_type =` sans valeur |
| Catégorie DoD | DoD Globale + DoD Backend |
| Use Cases liés | — |

**Critères d'acceptation** :
- `python manage.py check` retourne 0 erreur
- `python manage.py runserver` démarre sans erreur
- Le champ `exercise_type` a un type Django valide et des choices (ex: `CharField(choices=[...], max_length=20)`)
- `video_url` accepte `null` et `blank` (compatible avec les 873 exercices existants sans vidéo)
- `external_id` a un `max_length` valide
- `secondary_muscle_groups` est un `JSONField`
- Une migration est créée et appliquée sans erreur

---

### US-002 — Corriger le bug DEBUG

**En tant que** développeur,  
**je veux** que `DEBUG = os.environ["DEBUG"]` retourne un booléen réel,  
**afin d'** éviter que l'application soit en mode debug en production même quand `DEBUG=False` est dans le `.env`.

| Attribut | Valeur |
|----------|--------|
| ID | US-002 |
| EPIC parent | EPIC 0 — Débloquer le projet |
| Priorité MoSCoW | Must |
| Taille | XS |
| Statut | [CASSÉ] — `Lift/settings.py:31` : retourne une string truthy |
| Catégorie DoD | DoD Sécurité |
| Use Cases liés | — |

---

## EPIC 1 — AUTHENTIFICATION

### US-010 — Inscription par email

**En tant qu'** utilisateur non inscrit,  
**je veux** créer un compte avec mon email, un mot de passe et un pseudo,  
**afin d'** accéder à mes données personnelles de suivi sportif de manière sécurisée.

| Attribut | Valeur |
|----------|--------|
| ID | US-010 |
| EPIC parent | EPIC 1 — Authentification |
| Priorité MoSCoW | Must |
| Taille | M (backend existe, frontend à créer) |
| Statut | Backend [EXISTE] `accounts/views.py:9` — Frontend [ABSENT] |
| Catégorie DoD | DoD Backend + DoD Frontend + DoD Sécurité |
| Use Cases liés | UC-001 |

**Critères d'acceptation** :
- L'écran inscription affiche les champs email, password, password_confirm, pseudo
- Un `POST /api/auth/register/` avec email + password + pseudo retourne 201 + tokens JWT
- Un email déjà utilisé retourne 400 avec message d'erreur explicite
- Le mot de passe est haché (jamais retourné en clair)
- L'utilisateur est automatiquement connecté après inscription (token stocké dans SecureStore)

---

### US-011 — Connexion par email

**En tant qu'** utilisateur inscrit,  
**je veux** me connecter avec mon email et mon mot de passe,  
**afin d'** accéder à mes données personnelles.

| Attribut | Valeur |
|----------|--------|
| ID | US-011 |
| EPIC parent | EPIC 1 — Authentification |
| Priorité MoSCoW | Must |
| Taille | M (backend existe, frontend à créer) |
| Statut | Backend [EXISTE] `accounts/views.py:35` — Frontend [ABSENT] |
| Catégorie DoD | DoD Backend + DoD Frontend + DoD Sécurité |
| Use Cases liés | UC-001 |

**Critères d'acceptation** :
- Un `POST /api/auth/login/` avec email + password correct retourne 200 + access_token + refresh_token
- Des identifiants incorrects retournent 400 (sans préciser lequel est faux)
- Le token JWT est stocké dans SecureStore (pas AsyncStorage non chiffré)
- L'utilisateur est redirigé vers l'écran principal après connexion
- Un token expiré déclenche automatiquement un refresh

---

### US-012 — Rafraîchissement du token JWT

**En tant qu'** utilisateur connecté,  
**je veux** que mon token JWT soit automatiquement rafraîchi,  
**afin de** ne pas être déconnecté de manière intempestive.

| Attribut | Valeur |
|----------|--------|
| ID | US-012 |
| EPIC parent | EPIC 1 — Authentification |
| Priorité MoSCoW | Must |
| Taille | S |
| Statut | Backend [EXISTE] `accounts/urls.py:7` — Frontend [ABSENT] |
| Catégorie DoD | DoD Backend + DoD Sécurité |
| Use Cases liés | — |

---

### US-013 — Voir et modifier son profil

**En tant qu'** utilisateur connecté,  
**je veux** voir et modifier mes informations de profil (email, pseudo),  
**afin de** garder mes données à jour.

| Attribut | Valeur |
|----------|--------|
| ID | US-013 |
| EPIC parent | EPIC 1 — Authentification |
| Priorité MoSCoW | Should |
| Taille | S |
| Statut | Backend [EXISTE] `accounts/views.py:54` — Frontend [ABSENT] |
| Catégorie DoD | DoD Backend + DoD Frontend |
| Use Cases liés | — |

---

## EPIC 2 — BIBLIOTHÈQUE D'EXERCICES

### US-020 — Parcourir la liste des exercices

**En tant que** pratiquant,  
**je veux** voir la liste de tous les exercices disponibles,  
**afin de** découvrir et sélectionner des exercices pour ma séance.

| Attribut | Valeur |
|----------|--------|
| ID | US-020 |
| EPIC parent | EPIC 2 — Bibliothèque d'exercices |
| Priorité MoSCoW | Must |
| Taille | M |
| Statut | Backend [CASSÉ] `liftapp/views.py:17` (SyntaxError) — Frontend [ABSENT] |
| Catégorie DoD | DoD Backend + DoD Frontend |
| Use Cases liés | — |

**Critères d'acceptation** :
- `GET /api/lift/exercise/` retourne 200 avec la liste paginée des exercices
- La FlatList affiche nom, groupe musculaire et image miniature (si disponible)
- La pagination charge les exercices suivants au scroll (endpoint paginé, `PAGE_SIZE=25` configuré dans `settings.py:176`)
- Les exercices sont accessibles sans être connecté (`IsAuthenticatedOrReadOnly`)

---

### US-021 — Rechercher un exercice

**En tant que** pratiquant,  
**je veux** rechercher un exercice par son nom ou son groupe musculaire,  
**afin de** trouver rapidement l'exercice que je veux faire.

| Attribut | Valeur |
|----------|--------|
| ID | US-021 |
| EPIC parent | EPIC 2 — Bibliothèque d'exercices |
| Priorité MoSCoW | Must |
| Taille | S |
| Statut | Backend partiel [CASSÉ] `liftapp/views.py:20-22` — Frontend [ABSENT] |
| Catégorie DoD | DoD Backend + DoD Frontend |
| Use Cases liés | — |

---

### US-022 — Voir la fiche d'un exercice

**En tant que** pratiquant,  
**je veux** voir la description, les muscles travaillés et la vidéo d'un exercice,  
**afin de** exécuter correctement le mouvement.

| Attribut | Valeur |
|----------|--------|
| ID | US-022 |
| EPIC parent | EPIC 2 — Bibliothèque d'exercices |
| Priorité MoSCoW | Should |
| Taille | M |
| Statut | Backend [CASSÉ] — `video_url` et `secondary_muscle_groups` non encore dans le serializer. Frontend [ABSENT] |
| Catégorie DoD | DoD Backend + DoD Frontend + DoD ETL |
| Use Cases liés | — |

---

### US-023 — Enrichir les exercices avec les données Hevy

**En tant que** développeur,  
**je veux** créer un script ETL qui enrichit les 873 exercices avec les données Hevy (secondary muscles, type, video_url),  
**afin que** les utilisateurs puissent voir des vidéos de démonstration pour chaque exercice.

| Attribut | Valeur |
|----------|--------|
| ID | US-023 |
| EPIC parent | EPIC 2 — Bibliothèque d'exercices |
| Priorité MoSCoW | Must |
| Taille | M |
| Statut | [ABSENT] — `hevy.json` (435 exos) et `data_vids.json` (406 URLs) disponibles |
| Catégorie DoD | DoD ETL |
| Use Cases liés | UC-002 |

---

## EPIC 3 — ENREGISTREMENT DE SÉANCE

### US-030 — Choisir un template de séance

**En tant que** pratiquant,  
**je veux** choisir un template de séance (Push, Pull, Legs, Full-body...),  
**afin de** démarrer une séance structurée avec les exercices et séries cibles prédéfinis.

| Attribut | Valeur |
|----------|--------|
| ID | US-030 |
| EPIC parent | EPIC 3 — Enregistrement de séance |
| Priorité MoSCoW | Must |
| Taille | M |
| Statut | Backend [CASSÉ] `liftapp/views.py:27` — Frontend [ABSENT] |
| Catégorie DoD | DoD Backend + DoD Frontend |
| Use Cases liés | UC-003 |

---

### US-031 — Enregistrer une série (poids + reps)

**En tant que** pratiquant en pleine séance,  
**je veux** saisir le poids et le nombre de répétitions pour une série,  
**afin de** garder une trace précise de mes performances pour suivre ma progression.

| Attribut | Valeur |
|----------|--------|
| ID | US-031 |
| EPIC parent | EPIC 3 — Enregistrement de séance |
| Priorité MoSCoW | Must |
| Taille | M |
| Statut | Backend [CASSÉ] `liftapp/views.py:60-65` (SetViewSet) — Frontend [ABSENT] |
| Catégorie DoD | DoD Backend + DoD Frontend |
| Use Cases liés | UC-003 |

**Critères d'acceptation** :
- Le champ poids accepte des décimaux (ex: 102.5 kg) — `Set.weight_kg = DecimalField(6,2)` (`liftapp/models.py:102`)
- Le champ reps accepte des entiers positifs uniquement
- Le RPE est optionnel (champ nullable — `liftapp/models.py:103`)
- Une série de type "chauffe" peut être marquée comme telle (`is_warmup`)
- Un `POST /api/lift/set/` avec les données correctes crée la série liée à la session en cours

---

### US-032 — Timer de repos entre les séries

**En tant que** pratiquant en pleine séance,  
**je veux** voir un timer décompter le temps de repos entre mes séries,  
**afin de** respecter mon temps de repos cible et optimiser ma récupération.

| Attribut | Valeur |
|----------|--------|
| ID | US-032 |
| EPIC parent | EPIC 3 — Enregistrement de séance |
| Priorité MoSCoW | Should |
| Taille | M |
| Statut | [ABSENT] — 100% frontend, aucune logique backend nécessaire |
| Catégorie DoD | DoD Frontend |
| Use Cases liés | UC-003 |

---

### US-033 — Terminer et sauvegarder une séance

**En tant que** pratiquant,  
**je veux** terminer et sauvegarder ma séance avec toutes les séries enregistrées,  
**afin d'** avoir un historique complet de mes entraînements.

| Attribut | Valeur |
|----------|--------|
| ID | US-033 |
| EPIC parent | EPIC 3 — Enregistrement de séance |
| Priorité MoSCoW | Must |
| Taille | M |
| Statut | Backend [CASSÉ] `liftapp/views.py:48-57` — Frontend [ABSENT] |
| Catégorie DoD | DoD Backend + DoD Frontend |
| Use Cases liés | UC-003 |

---

### US-034 — Faire une séance libre (sans template)

**En tant que** pratiquant,  
**je veux** démarrer une séance sans choisir de template et y ajouter des exercices manuellement,  
**afin de** m'adapter à mes envies du jour ou à l'équipement disponible.

| Attribut | Valeur |
|----------|--------|
| ID | US-034 |
| EPIC parent | EPIC 3 — Enregistrement de séance |
| Priorité MoSCoW | Should |
| Taille | M |
| Statut | Backend [CASSÉ] — `WorkoutSession.template` est nullable (`liftapp/models.py:83`) — Frontend [ABSENT] |
| Catégorie DoD | DoD Backend + DoD Frontend |
| Use Cases liés | UC-003 |

---

## EPIC 4 — HISTORIQUE ET PROGRESSION

### US-040 — Voir l'historique de mes séances

**En tant que** pratiquant,  
**je veux** voir la liste de mes séances passées triées par date,  
**afin de** revoir ce que j'ai fait et combien de fois je me suis entraîné.

| Attribut | Valeur |
|----------|--------|
| ID | US-040 |
| EPIC parent | EPIC 4 — Historique et progression |
| Priorité MoSCoW | Must |
| Taille | M |
| Statut | Backend [CASSÉ] `liftapp/views.py:48-54` — Frontend [ABSENT] |
| Catégorie DoD | DoD Backend + DoD Frontend |
| Use Cases liés | — |

---

### US-041 — Voir mon PR sur un exercice

**En tant que** pratiquant,  
**je veux** voir mon record personnel (poids max × reps max) pour un exercice donné,  
**afin de** mesurer ma progression et me motiver à le battre.

| Attribut | Valeur |
|----------|--------|
| ID | US-041 |
| EPIC parent | EPIC 4 — Historique et progression |
| Priorité MoSCoW | Should |
| Taille | M |
| Statut | [ABSENT] — endpoint `/api/lift/stats/prs/` non créé. Pas de modèle `PersonalRecord`. |
| Catégorie DoD | DoD Backend + DoD Frontend |
| Use Cases liés | — |

---

### US-042 — Voir mon volume total par semaine

**En tant que** pratiquant,  
**je veux** voir le volume total soulevé (kg × reps) pour la semaine en cours,  
**afin de** suivre ma charge d'entraînement et éviter le surentraînement.

| Attribut | Valeur |
|----------|--------|
| ID | US-042 |
| EPIC parent | EPIC 4 — Historique et progression |
| Priorité MoSCoW | Should |
| Taille | M |
| Statut | [ABSENT] — endpoint `/api/lift/stats/weekly/` non créé |
| Catégorie DoD | DoD Backend + DoD Frontend |
| Use Cases liés | — |

---

## EPIC 5 — BJJ (post-MVP)

### US-050 — Voir ma ceinture actuelle

**En tant que** grappeur,  
**je veux** voir ma ceinture BJJ actuelle dans l'application,  
**afin de** me rappeler de mon niveau et de ma progression sur le long terme.

| Attribut | Valeur |
|----------|--------|
| ID | US-050 |
| EPIC parent | EPIC 5 — BJJ |
| Priorité MoSCoW | Could |
| Taille | S |
| Statut | Backend [EXISTE] `bjjapp/views.py` — Frontend [ABSENT] |
| Catégorie DoD | DoD Frontend |
| Use Cases liés | — |

---

### US-051 — Enregistrer une promotion de ceinture

**En tant que** grappeur,  
**je veux** enregistrer la date et l'académie de ma promotion de ceinture,  
**afin de** garder un historique de ma progression dans les arts martiaux.

| Attribut | Valeur |
|----------|--------|
| ID | US-051 |
| EPIC parent | EPIC 5 — BJJ |
| Priorité MoSCoW | Could |
| Taille | S |
| Statut | Backend [EXISTE] `bjjapp/views.py` (bug label "WHITE"→"Public") — Frontend [ABSENT] |
| Catégorie DoD | DoD Backend + DoD Frontend |
| Use Cases liés | — |

---

## EPIC 6 — SUIVI DU POIDS CORPOREL (post-MVP)

### US-060 — Enregistrer mon poids du jour

**En tant qu'** utilisateur,  
**je veux** enregistrer mon poids corporel du jour,  
**afin de** suivre mon évolution corporelle sur le long terme.

| Attribut | Valeur |
|----------|--------|
| ID | US-060 |
| EPIC parent | EPIC 6 — Suivi poids |
| Priorité MoSCoW | Could |
| Taille | S |
| Statut | Backend [EXISTE] `nutrition/views.py` — Frontend [ABSENT] |
| Catégorie DoD | DoD Frontend |
| Use Cases liés | — |

---

## EPIC 7 — QUALITÉ ET TESTS

### US-070 — Tests API authentification

**En tant que** développeur,  
**je veux** des tests automatisés sur les endpoints auth,  
**afin de** prévenir les régressions et garantir la sécurité du flux de connexion.

| Attribut | Valeur |
|----------|--------|
| ID | US-070 |
| EPIC parent | EPIC 7 — Qualité et tests |
| Priorité MoSCoW | Must |
| Taille | M |
| Statut | [ABSENT] — `accounts/tests.py` vide |
| Catégorie DoD | DoD Globale |
| Use Cases liés | UC-001 |

---

### US-071 — Tests API liftapp (permissions)

**En tant que** développeur,  
**je veux** des tests qui vérifient qu'un utilisateur A ne peut pas accéder aux données d'un utilisateur B,  
**afin de** garantir l'isolation des données personnelles.

| Attribut | Valeur |
|----------|--------|
| ID | US-071 |
| EPIC parent | EPIC 7 — Qualité et tests |
| Priorité MoSCoW | Must |
| Taille | M |
| Statut | [ABSENT] — `liftapp/tests.py` vide |
| Catégorie DoD | DoD Sécurité |
| Use Cases liés | — |
