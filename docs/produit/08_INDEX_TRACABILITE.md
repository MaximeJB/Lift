# 08_INDEX_TRACABILITE.md — Index et Matrice de Traçabilité

**Date** : 08/06/2026  
**Objectif** : Relier chaque Epic → Story → Use Case → NFR → Tranche Verticale → DoD

---

## Index des Stories (référence rapide)

| ID Story | Titre court | Epic | MoSCoW | Tranche | DoD | Statut |
|----------|-------------|------|--------|---------|-----|--------|
| US-001 | Corriger modèle Exercise | EPIC 0 | Must | V0 | Globale + Backend | [CASSÉ] |
| US-002 | Corriger bug DEBUG | EPIC 0 | Must | V0 | Sécurité | [CASSÉ] |
| US-010 | Inscription par email | EPIC 1 | Must | V1 | Backend + Frontend + Sécurité | Backend [EXISTE] / Frontend [ABSENT] |
| US-011 | Connexion par email | EPIC 1 | Must | V1 | Backend + Frontend + Sécurité | Backend [EXISTE] / Frontend [ABSENT] |
| US-012 | Refresh JWT | EPIC 1 | Must | V1 | Backend + Sécurité | Backend [EXISTE] / Frontend [ABSENT] |
| US-013 | Voir / modifier profil | EPIC 1 | Should | V1 | Backend + Frontend | Backend [EXISTE] / Frontend [ABSENT] |
| US-020 | Parcourir exercices | EPIC 2 | Must | V0 | Backend + Frontend | Backend [CASSÉ] / Frontend [ABSENT] |
| US-021 | Rechercher exercice | EPIC 2 | Must | V0 | Backend + Frontend | Backend partiel [CASSÉ] / Frontend [ABSENT] |
| US-022 | Fiche exercice (vidéo) | EPIC 2 | Should | V2 | Backend + Frontend + ETL | [CASSÉ/ABSENT] |
| US-023 | ETL enrichissement Hevy | EPIC 2 | Must | V2 | ETL | [ABSENT] |
| US-030 | Choisir template | EPIC 3 | Must | V3 | Backend + Frontend | Backend [CASSÉ] / Frontend [ABSENT] |
| US-031 | Enregistrer une série | EPIC 3 | Must | V3 | Backend + Frontend | Backend [CASSÉ] / Frontend [ABSENT] |
| US-032 | Timer de repos | EPIC 3 | Should | V3 | Frontend | [ABSENT] |
| US-033 | Sauvegarder séance | EPIC 3 | Must | V3 | Backend + Frontend | Backend [CASSÉ] / Frontend [ABSENT] |
| US-034 | Séance libre | EPIC 3 | Should | V3 | Backend + Frontend | Backend [CASSÉ] / Frontend [ABSENT] |
| US-040 | Historique séances | EPIC 4 | Must | V4 | Backend + Frontend | Backend [CASSÉ] / Frontend [ABSENT] |
| US-041 | PR sur un exercice | EPIC 4 | Should | V4 | Backend + Frontend | [ABSENT] |
| US-042 | Volume total semaine | EPIC 4 | Should | V4 | Backend + Frontend | [ABSENT] |
| US-050 | Voir ceinture BJJ | EPIC 5 | Could | Post-MVP | Frontend | Backend [EXISTE] / Frontend [ABSENT] |
| US-051 | Promotion ceinture | EPIC 5 | Could | Post-MVP | Backend + Frontend | Backend [EXISTE] / Frontend [ABSENT] |
| US-060 | Enregistrer poids | EPIC 6 | Could | Post-MVP | Frontend | Backend [EXISTE] / Frontend [ABSENT] |
| US-070 | Tests API auth | EPIC 7 | Must | V5 | Globale | [ABSENT] |
| US-071 | Tests permissions liftapp | EPIC 7 | Must | V5 | Sécurité | [ABSENT] |

---

## Matrice de Traçabilité

### Epic 0 — Débloquer le projet

| Story | Use Case | NFR | Tranche | DoD |
|-------|----------|-----|---------|-----|
| US-001 | — | NFR-001.4 (N+1), NFR-005.1-5.3 | V0 | Globale + Backend |
| US-002 | — | NFR-002.2, NFR-002.3 | V0 | Sécurité |

---

### Epic 1 — Authentification

| Story | Use Case | NFR | Tranche | DoD |
|-------|----------|-----|---------|-----|
| US-010 | UC-001 (Scénario nominal inscription) | NFR-002.5, NFR-002.7, NFR-004.3, NFR-006 | V1 | Backend + Frontend + Sécurité |
| US-011 | UC-001 (Scénario nominal connexion) | NFR-002.1, NFR-002.5 | V1 | Backend + Frontend + Sécurité |
| US-012 | UC-001 (Scénario A3 — refresh) | NFR-002.1 | V1 | Backend + Sécurité |
| US-013 | — | NFR-004.1, NFR-004.2, NFR-004.5 | V1 | Backend + Frontend |

---

### Epic 2 — Bibliothèque d'exercices

| Story | Use Case | NFR | Tranche | DoD |
|-------|----------|-----|---------|-----|
| US-020 | — | NFR-001.1, NFR-001.4 | V0 | Backend + Frontend |
| US-021 | — | NFR-001.1 | V0 | Backend + Frontend |
| US-022 | UC-002 (postconditions) | NFR-001.3 | V2 | Backend + Frontend + ETL |
| US-023 | UC-002 (complet) | — | V2 | ETL |

---

### Epic 3 — Enregistrement de séance

| Story | Use Case | NFR | Tranche | DoD |
|-------|----------|-----|---------|-----|
| US-030 | UC-003 (étapes 1-4) | NFR-001.3 | V3 | Backend + Frontend |
| US-031 | UC-003 (étape 6) | NFR-001.2, NFR-005.1, NFR-005.2, NFR-005.3, NFR-006.1 | V3 | Backend + Frontend |
| US-032 | UC-003 (étape 6c) | NFR-003.4 | V3 | Frontend |
| US-033 | UC-003 (étape 7-9) | NFR-003.1, NFR-003.2 | V3 | Backend + Frontend |
| US-034 | UC-003 (Scénario A1) | — | V3 | Backend + Frontend |

---

### Epic 4 — Historique et Progression

| Story | Use Case | NFR | Tranche | DoD |
|-------|----------|-----|---------|-----|
| US-040 | UC-005 (isolation données) | NFR-002.4 | V4 | Backend + Frontend |
| US-041 | — | NFR-001.2 | V4 | Backend + Frontend |
| US-042 | — | NFR-001.1 | V4 | Backend + Frontend |

---

### Epic 5 — BJJ (post-MVP)

| Story | Use Case | NFR | Tranche | DoD |
|-------|----------|-----|---------|-----|
| US-050 | — | — | Post-MVP | Frontend |
| US-051 | — | — | Post-MVP | Backend + Frontend |

---

### Epic 6 — Suivi poids (post-MVP)

| Story | Use Case | NFR | Tranche | DoD |
|-------|----------|-----|---------|-----|
| US-060 | — | NFR-005.4 | Post-MVP | Frontend |

---

### Epic 7 — Qualité et Tests

| Story | Use Case | NFR | Tranche | DoD |
|-------|----------|-----|---------|-----|
| US-070 | UC-001 | — | V5 | Globale |
| US-071 | UC-005 | NFR-002.4 | V5 | Sécurité |

---

## Index des Use Cases

| ID | Titre | Stories couvertes | Tranche |
|----|-------|------------------|---------|
| UC-001 | Inscription et Première Connexion | US-010, US-011, US-012, US-070 | V1 |
| UC-002 | ETL Import Hevy | US-022, US-023 | V2 |
| UC-003 | Enregistrer une Séance | US-030, US-031, US-032, US-033, US-034 | V3 |
| UC-004 | Synchronisation Offline (prévu) | US-033 (future) | Post-MVP |
| UC-005 | Flux de Permission IsOwner | US-040, US-071 | V4, V5 |

---

## Index des NFR par Story Concernée

| NFR | Titre | Stories |
|-----|-------|---------|
| NFR-001.1 | Temps réponse exercices ≤ 500ms | US-020, US-021, US-042 |
| NFR-001.2 | Temps réponse POST set ≤ 200ms | US-031, US-041 |
| NFR-001.3 | Chargement accueil ≤ 1s | US-010, US-030 |
| NFR-001.4 | Zéro requête N+1 | US-020, US-040 |
| NFR-002.1 | Access token ≤ 15 min | US-011, US-012 |
| NFR-002.2 | SECRET_KEY non défaut | Toutes |
| NFR-002.3 | DEBUG = False prod | Toutes |
| NFR-002.4 | Isolation données utilisateur | US-040, US-071 |
| NFR-002.5 | Rate limiting login | US-011 |
| NFR-002.6 | HTTPS prod | Toutes |
| NFR-002.7 | Mot de passe haché | US-010 |
| NFR-003.1 | Taux sync ≥ 95% | US-033 |
| NFR-003.2 | UUID sans conflit offline | US-031, US-033 |
| NFR-003.3 | Last-write-wins | UC-004 |
| NFR-003.4 | Cache local exercices | US-020 |
| NFR-004.1 | Droit à l'oubli | US-013 |
| NFR-004.2 | Export données | US-013 |
| NFR-004.3 | Consentement RGPD | US-010 |
| NFR-005.1 | weight_kg positif | US-031 |
| NFR-005.2 | reps ≥ 1 | US-031 |
| NFR-005.3 | rpe 1-10 | US-031 |
| NFR-005.4 | WeightLog 0-200 kg | US-060 |
| NFR-006.1 | Stockage en kg | US-031 |
| NFR-006.2 | Affichage kg/lbs | US-031 |
| NFR-007.x | Accessibilité | Toutes |
| NFR-008.1 | API versionnée /v1/ | Toutes |
| NFR-008.2 | Endpoint /health/ | — |

---

## Tableau de Couverture Tranche → Stories

| Tranche | Stories couvertes | Valeur livrée |
|---------|-----------------|---------------|
| **V0 — Walking Skeleton** | US-001, US-002, US-020, US-021 | "Je vois les exercices sur mon téléphone" |
| **V1 — Auth** | US-010, US-011, US-012, US-013 | "Je crée un compte et je me connecte" |
| **V2 — ETL** | US-022, US-023 | "Les exercices ont des vidéos" |
| **V3 — Séance** | US-030, US-031, US-032, US-033, US-034 | "Je fais une vraie séance avec l'app" |
| **V4 — Progression** | US-040, US-041, US-042 | "Je vois mon historique et mes PRs" |
| **V5 — Tests** | US-070, US-071 | "Les tests tournent en CI/CD" |
| **Post-MVP** | US-050, US-051, US-060 | BJJ + poids corporel |

---

## Vérification INVEST de Toutes les Stories

| ID | I | N | V | E | S | T | Commentaire |
|----|---|---|---|---|---|---|-------------|
| US-001 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Correction technique pure |
| US-010 | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | Small : backend existe, frontend M |
| US-011 | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | idem |
| US-020 | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | Dépend de US-001 (V0 d'abord) |
| US-023 | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | M estimé, logique fuzzy à valider |
| US-031 | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | Dépend de US-001 + US-033 |
| US-033 | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | Dépend de US-030 + US-031 |
| US-041 | ✓ | ✓ | ✓ | ~ | M | ✓ | Estimable une fois l'endpoint défini |
| US-070 | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | L en réalité si 0 tests existants |

Légende : ✓ = respecté, ~ = partiellement, note = problème identifié
