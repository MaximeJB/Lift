# 02_BACKLOG.md — Backlog Produit Priorisé

**Date** : 08/06/2026  
**Méthode** : MoSCoW + Ordre de réalisation (vertical slicing)  
**Sources** : `ROADMAP.md`, `Spec.md`, `TODOLIST.md`, code réel

---

## Légende des statuts

- [EXISTE] : code fonctionnel en production
- [CASSÉ] : code présent mais non fonctionnel (SyntaxError ou logique incorrecte)
- [ABSENT] : à créer de zéro

---

## THÈME 0 — DÉBLOQUER LE PROJET

**Objectif** : Repartir d'une base saine. Non négociable avant tout développement.  
**Correspondance ROADMAP** : Milestone 0

### EPIC 0.1 — Correction du modèle Exercise

| ID | User Story | MoSCoW | Taille | Statut | Fichier/Ligne |
|----|------------|--------|--------|--------|---------------|
| BL-001 | Corriger `exercise_type =` (SyntaxError) | Must | XS | [CASSÉ] | `liftapp/models.py:38` |
| BL-002 | Corriger `video_url` (ajouter `blank=True, null=True`) | Must | XS | [CASSÉ] | `liftapp/models.py:35` |
| BL-003 | Corriger `external_id` (ajouter `max_length=50`) | Must | XS | [CASSÉ] | `liftapp/models.py:36` |
| BL-004 | Corriger `secondary_muscle_groups` (passer en `JSONField`) | Must | XS | [CASSÉ] | `liftapp/models.py:37` |
| BL-005 | Créer et appliquer la migration correspondante | Must | XS | [ABSENT] | — |
| BL-006 | Corriger `DEBUG` (string → bool) dans `settings.py` | Must | XS | [CASSÉ] | `Lift/settings.py:31` |
| BL-007 | Créer `requirements.txt` | Must | XS | [ABSENT] | — |

---

## THÈME 1 — AUTHENTIFICATION

**Objectif** : Un utilisateur peut créer un compte et se connecter.  
**Correspondance ROADMAP** : Milestone 3 (partiellement backend déjà fait)

### EPIC 1.1 — Inscription et connexion par email

| ID | User Story | MoSCoW | Taille | Statut | Fichier/Ligne |
|----|------------|--------|--------|--------|---------------|
| BL-010 | S'inscrire avec email + password + pseudo (backend) | Must | S | [EXISTE] | `accounts/views.py:9` |
| BL-011 | Se connecter avec email + password, recevoir JWT (backend) | Must | S | [EXISTE] | `accounts/views.py:35` |
| BL-012 | Rafraîchir son access token (backend) | Must | XS | [EXISTE] | `accounts/urls.py:7` |
| BL-013 | Voir et modifier son profil (backend) | Should | S | [EXISTE] | `accounts/views.py:54` |
| BL-014 | Écran inscription (frontend React Native) | Must | M | [ABSENT] | — |
| BL-015 | Écran connexion (frontend React Native) | Must | M | [ABSENT] | — |
| BL-016 | Stocker le JWT dans SecureStore (frontend) | Must | S | [ABSENT] | — |
| BL-017 | Déconnexion (invalider token côté client) | Should | XS | [ABSENT] | — |

### EPIC 1.2 — OAuth (post-MVP)

| ID | User Story | MoSCoW | Taille | Statut | Fichier/Ligne |
|----|------------|--------|--------|--------|---------------|
| BL-020 | Se connecter avec Google OAuth | Could | L | [CASSÉ] | `Lift/settings.py:81-92` (configuré, non testé) |
| BL-021 | Se connecter avec Apple Sign-In | Could | L | [ABSENT] | — |

---

## THÈME 2 — BIBLIOTHÈQUE D'EXERCICES

**Objectif** : Un utilisateur peut consulter et rechercher des exercices.  
**Correspondance ROADMAP** : Milestone 1 (ETL) + Milestone 3 (frontend)

### EPIC 2.1 — ETL Exercices (enrichissement des données)

| ID | User Story | MoSCoW | Taille | Statut | Fichier/Ligne |
|----|------------|--------|--------|--------|---------------|
| BL-030 | Créer `import_hevy.py` pour enrichir les exercices (secondary muscles, type, video_url) | Must | M | [ABSENT] | `hevy.json`, `data_vids.json` disponibles |
| BL-031 | Mettre à jour `ExerciseSerializer` avec `video_url`, `secondary_muscle_groups`, `exercise_type` | Must | S | [CASSÉ] | `liftapp/serializers.py:5-12` (champs manquants) |

### EPIC 2.2 — Consultation des exercices (frontend)

| ID | User Story | MoSCoW | Taille | Statut | Fichier/Ligne |
|----|------------|--------|--------|--------|---------------|
| BL-032 | Voir la liste de tous les exercices (FlatList) | Must | M | [ABSENT] | — |
| BL-033 | Rechercher un exercice par nom | Must | S | [ABSENT] | — |
| BL-034 | Filtrer les exercices par groupe musculaire | Should | S | [ABSENT] | `liftapp/views.py:21-22` (backend partiel) |
| BL-035 | Voir la fiche détaillée d'un exercice (muscles, description, vidéo) | Should | M | [ABSENT] | — |

---

## THÈME 3 — ENREGISTREMENT DE SÉANCE (coeur du produit)

**Objectif** : Un utilisateur peut faire une séance complète et la sauvegarder.  
**Correspondance ROADMAP** : Milestone 4

### EPIC 3.1 — Gestion des templates (backend)

| ID | User Story | MoSCoW | Taille | Statut | Fichier/Ligne |
|----|------------|--------|--------|--------|---------------|
| BL-040 | Voir la liste des templates disponibles (publics + mes templates) | Must | S | [CASSÉ] | `liftapp/views.py:27-35` (cassé, SyntaxError) |
| BL-041 | Voir le détail d'un template avec ses exercices | Must | S | [CASSÉ] | idem |
| BL-042 | Seeder 10 templates prédéfinis en BDD | Should | M | [ABSENT] | `Spec.md:8.2` |

### EPIC 3.2 — Session de musculation (frontend + backend)

| ID | User Story | MoSCoW | Taille | Statut | Fichier/Ligne |
|----|------------|--------|--------|--------|---------------|
| BL-043 | Choisir un template pour démarrer une séance | Must | M | [ABSENT] | — |
| BL-044 | Voir la liste des exercices du template pendant la séance | Must | S | [ABSENT] | — |
| BL-045 | Saisir poids + reps pour une série | Must | M | [ABSENT] | — |
| BL-046 | Timer de repos configurable entre les séries | Should | M | [ABSENT] | — |
| BL-047 | Terminer et sauvegarder la séance (POST `/api/lift/workout_session/`) | Must | M | [CASSÉ] | `liftapp/views.py:48-57` (cassé) |
| BL-048 | Faire une séance libre (sans template) | Should | M | [ABSENT] | — |
| BL-049 | Modifier / supprimer une série en cours de séance | Should | S | [ABSENT] | — |
| BL-050 | Feedback de fin de séance (volume total, durée) | Should | S | [ABSENT] | — |

---

## THÈME 4 — HISTORIQUE ET PROGRESSION

**Objectif** : Un utilisateur peut revoir ses performances et constater sa progression.  
**Correspondance ROADMAP** : Milestone 5

### EPIC 4.1 — Historique des séances

| ID | User Story | MoSCoW | Taille | Statut | Fichier/Ligne |
|----|------------|--------|--------|--------|---------------|
| BL-060 | Voir la liste de mes séances passées | Must | M | [ABSENT] | — |
| BL-061 | Voir le détail d'une séance (exercices + séries) | Must | S | [ABSENT] | — |

### EPIC 4.2 — Statistiques et PRs

| ID | User Story | MoSCoW | Taille | Statut | Fichier/Ligne |
|----|------------|--------|--------|--------|---------------|
| BL-062 | Voir mon volume total par semaine (endpoint stats) | Should | M | [ABSENT] | `ROADMAP.md:5.1` |
| BL-063 | Voir mon PR sur un exercice | Should | M | [ABSENT] | `ROADMAP.md:5.3` |
| BL-064 | Voir le graphique de progression d'un exercice | Could | L | [ABSENT] | `ROADMAP.md:5.6` |

---

## THÈME 5 — QUALITÉ ET TESTS

**Correspondance ROADMAP** : Milestone 2

| ID | User Story | MoSCoW | Taille | Statut | Fichier/Ligne |
|----|------------|--------|--------|--------|---------------|
| BL-070 | Tests unitaires accounts (models + serializers) | Must | M | [ABSENT] | `accounts/tests.py` (vide) |
| BL-071 | Tests API auth (register, login, profil, refresh) | Must | M | [ABSENT] | — |
| BL-072 | Tests API liftapp (CRUD sessions, sets, exercices) | Must | L | [ABSENT] | `liftapp/tests.py` (vide) |
| BL-073 | Tests de permissions (IsOwner — user A ne voit pas les données de user B) | Must | S | [ABSENT] | — |
| BL-074 | Coverage ≥ 60% | Should | S | [ABSENT] | — |

---

## THÈME 6 — POLISH MVP

**Correspondance ROADMAP** : Milestone 6

| ID | User Story | MoSCoW | Taille | Statut | Fichier/Ligne |
|----|------------|--------|--------|--------|---------------|
| BL-080 | Gestion des erreurs réseau (messages clairs, retry) | Must | M | [ABSENT] | — |
| BL-081 | Loading states (skeleton screens / spinners) | Must | S | [ABSENT] | — |
| BL-082 | Pull-to-refresh sur les listes | Should | S | [ABSENT] | — |
| BL-083 | Validation des inputs (poids négatif, reps=0) | Must | S | [ABSENT] | — |
| BL-084 | Dark mode | Could | M | [ABSENT] | — |

---

## THÈME 7 — OFFLINE-FIRST

**Correspondance ROADMAP** : Milestone 7 (post-MVP initial mais architecturalement préparé)

| ID | User Story | MoSCoW | Taille | Statut | Fichier/Ligne |
|----|------------|--------|--------|--------|---------------|
| BL-090 | Cache local des exercices (expo-sqlite) | Should | L | [ABSENT] | UUID + synced_at prévus dans tous les modèles |
| BL-091 | Faire une séance sans connexion | Should | L | [ABSENT] | — |
| BL-092 | Synchronisation automatique au retour du réseau | Could | XL | [ABSENT] | `SYSTEM_DESIGN.md:5.3` |

---

## THÈME 8 — BJJ (POST-MVP)

**Correspondance ROADMAP** : Milestone 9

| ID | User Story | MoSCoW | Taille | Statut | Fichier/Ligne |
|----|------------|--------|--------|--------|---------------|
| BL-100 | Créer les modèles `BJJSession` et `Submission` | Won't (MVP) | M | [ABSENT] | `Spec.md:8.3` |
| BL-101 | Logger une séance BJJ (rolls, soumissions, techniques) | Won't (MVP) | L | [ABSENT] | — |
| BL-102 | Voir ma ceinture actuelle | Could | XS | [EXISTE] | `bjjapp/views.py` (backend OK) |
| BL-103 | Enregistrer une promotion de ceinture | Could | S | [EXISTE] | `bjjapp/views.py` (backend OK) |

---

## THÈME 9 — PRODUCTION (POST-MVP)

**Correspondance ROADMAP** : Milestone 8

| ID | User Story | MoSCoW | Taille | Statut | Fichier/Ligne |
|----|------------|--------|--------|--------|---------------|
| BL-110 | Migrer vers PostgreSQL | Must (prod) | M | [ABSENT] | `Lift/settings.py:122-127` SQLite actuellement |
| BL-111 | Déployer le backend (Heroku / Railway) | Must (prod) | L | [ABSENT] | — |
| BL-112 | GitHub Actions CI/CD | Should | M | [ABSENT] | — |
| BL-113 | Héberger les vidéos sur S3 | Should | L | [ABSENT] | `data_vids.json` (406 URLs CDN Hevy) |
| BL-114 | Configurer Sentry | Should | S | [ABSENT] | — |
| BL-115 | Endpoints RGPD (export données, suppression compte) | Must (prod) | M | [ABSENT] | `TODOLIST.md:64-65` |
| BL-116 | Build EAS + publication TestFlight | Must (prod) | L | [ABSENT] | — |

---

## Ordre de réalisation recommandé (vertical slicing)

```
Semaine 1 : Thème 0 (débloquer) + Thème 5 partiel (tests auth)
Semaine 2 : Thème 2.1 (ETL Hevy) + Thème 1.1 frontend (login/register)
Semaine 3-4 : Thème 2.2 frontend (exercices) → Walking Skeleton
Semaines 5-6 : Thème 3 (séance complète) → Première vraie valeur utilisateur
Semaines 7-8 : Thème 4 (historique + PRs) + Thème 5 complet (tests)
Semaines 9-10 : Thème 6 (polish MVP) + Thème 7 partiel (offline basique)
Semaine 11-12 : Thème 9 (production)
Post-MVP : Thèmes 7 complet + 8 (BJJ)
```
