# 06_ACCEPTATION_NFR.md — Critères d'Acceptation et Exigences Non-Fonctionnelles

**Date** : 08/06/2026  
**Format** : Gherkin (Étant donné / Quand / Alors / Et)

---

## PARTIE 1 — CRITÈRES D'ACCEPTATION PAR STORY

---

### US-001 — Corriger le modèle Exercise

**Cas nominal**
```gherkin
Étant donné que liftapp/models.py contient exercise_type = (SyntaxError)
Quand je corrige exercise_type en CharField(choices=[...], max_length=20)
   Et j'ajoute blank=True, null=True sur video_url
   Et j'ajoute max_length=50 sur external_id
   Et je change secondary_muscle_groups en JSONField
   Et je lance python manage.py makemigrations && python manage.py migrate
Alors python manage.py check retourne 0 erreur
   Et python manage.py runserver démarre sans exception
   Et GET /api/lift/exercise/ retourne 200
```

**Cas limite — exercices existants sans video_url**
```gherkin
Étant donné que 873 exercices existent en BDD avec video_url vide
Quand la migration est appliquée avec video_url = URLField(blank=True, null=True)
Alors les 873 exercices ont video_url = null sans erreur de migration
   Et GET /api/lift/exercise/ retourne toujours 873 résultats
```

**Cas d'erreur — oubli de max_length sur CharField**
```gherkin
Étant donné que exercise_type = CharField() sans max_length
Quand je lance python manage.py check
Alors Django retourne : "CharField must define a 'max_length' attribute."
   Et la migration ne peut pas être créée
```

---

### US-010 — Inscription par email

**Cas nominal**
```gherkin
Étant donné qu'un utilisateur non inscrit ouvre l'écran d'inscription
Quand il saisit email="test@example.com", password="Password123!", pseudo="athlete42"
   Et il soumet le formulaire
Alors POST /api/auth/register/ retourne HTTP 201
   Et la réponse contient access_token et refresh_token
   Et l'utilisateur est redirigé vers l'écran principal
   Et les tokens sont stockés dans SecureStore
```

**Cas limite — pseudo contenant des caractères spéciaux**
```gherkin
Étant donné un formulaire d'inscription
Quand l'utilisateur saisit pseudo="user@2026!"
Alors l'application accepte ou refuse selon les règles de validation définies
   Et un message d'erreur clair s'affiche si le pseudo est refusé
```

**Cas d'erreur — email déjà utilisé**
```gherkin
Étant donné qu'un compte existe avec email="existant@example.com"
Quand un nouvel utilisateur tente de s'inscrire avec le même email
Alors POST /api/auth/register/ retourne HTTP 400
   Et le message contient "cet email est déjà utilisé" (ou équivalent)
   Et aucun doublon n'est créé en BDD
```

**Cas d'erreur — passwords non identiques**
```gherkin
Étant donné le formulaire d'inscription rempli
Quand password="Password123!" et password_confirm="Password456!"
Alors POST /api/auth/register/ retourne HTTP 400
   Et le message indique que les passwords ne correspondent pas
```

---

### US-011 — Connexion par email

**Cas nominal**
```gherkin
Étant donné un utilisateur inscrit avec email="test@example.com"
Quand il saisit ses identifiants corrects sur l'écran de connexion
   Et il soumet le formulaire
Alors POST /api/auth/login/ retourne HTTP 200
   Et la réponse contient access_token, refresh_token et les infos de l'utilisateur
   Et l'utilisateur est redirigé vers l'écran principal
```

**Cas d'erreur — mot de passe incorrect**
```gherkin
Étant donné un utilisateur inscrit
Quand il saisit un mot de passe incorrect
Alors POST /api/auth/login/ retourne HTTP 400
   Et le message dit "Invalid credentials" (sans préciser lequel des deux champs est faux)
```

**Cas d'erreur — token expiré pendant l'utilisation**
```gherkin
Étant donné un utilisateur connecté dont l'access_token a expiré
Quand il effectue une requête authentifiée
Alors l'application envoie automatiquement POST /api/auth/token/refresh/
   Et si le refresh réussit, la requête originale est relancée transparentement
   Et si le refresh échoue (refresh expiré), l'utilisateur est redirigé vers l'écran de connexion
```

---

### US-031 — Enregistrer une série

**Cas nominal**
```gherkin
Étant donné un pratiquant connecté avec une WorkoutSession en cours
Quand il saisit 100.0 kg et 8 reps sur l'exercice "Bench Press"
   Et il appuie sur "Ajouter la série"
Alors POST /api/lift/set/ retourne HTTP 201
   Et la série est créée avec weight_kg=100.00, reps=8
   Et la série apparaît dans la liste des séries de la session en cours
```

**Cas limite — poids avec décimale (ex: 67.5 kg)**
```gherkin
Étant donné un pratiquant saisissant une série
Quand il entre weight_kg=67.5
Alors le serveur accepte la valeur (DecimalField(max_digits=6, decimal_places=2))
   Et la série est enregistrée avec weight_kg=67.50
```

**Cas d'erreur — poids négatif**
```gherkin
Étant donné un formulaire de saisie de série
Quand le pratiquant entre weight_kg=-5
Alors l'application affiche "Le poids doit être positif" sans envoyer la requête
```

**Cas d'erreur — reps = 0**
```gherkin
Étant donné un formulaire de saisie de série
Quand le pratiquant entre reps=0
Alors l'application affiche "Le nombre de répétitions doit être ≥ 1" sans envoyer la requête
```

---

### US-040 — Voir l'historique des séances

**Cas nominal**
```gherkin
Étant donné un pratiquant connecté ayant fait 5 séances
Quand il ouvre l'écran "Historique"
Alors GET /api/lift/workout_session/ retourne HTTP 200
   Et les séances sont triées par date décroissante (ordering = ['-date', '-start_time'])
   Et chaque séance affiche titre, date et nombre de séries
```

**Cas limite — utilisateur sans séance**
```gherkin
Étant donné un nouveau pratiquant sans aucune séance
Quand il ouvre l'écran "Historique"
Alors GET /api/lift/workout_session/ retourne HTTP 200 avec une liste vide
   Et l'écran affiche un message d'encouragement "Lancez votre première séance !"
```

**Cas d'erreur — accès aux séances d'un autre utilisateur**
```gherkin
Étant donné l'utilisateur A et l'utilisateur B
Quand l'utilisateur A tente GET /api/lift/workout_session/{uuid_session_de_B}/
Alors le serveur retourne HTTP 404 (l'objet n'est pas dans le queryset de A)
   Et aucune donnée de B n'est exposée
```

---

## PARTIE 2 — CATALOGUE D'EXIGENCES NON-FONCTIONNELLES (NFR)

---

### NFR-001 — Performance

| ID | Exigence | Valeur cible | Stories concernées | Source |
|----|----------|-------------|-------------------|--------|
| NFR-001.1 | Temps de réponse `GET /api/lift/exercise/` (873 exos paginés) | ≤ 500 ms | US-020, US-021 | `Spec.md:2` |
| NFR-001.2 | Temps de réponse `POST /api/lift/set/` (création série) | ≤ 200 ms | US-031 | — |
| NFR-001.3 | Chargement de l'écran Accueil | ≤ 1 s | Toutes | `Spec.md:2` |
| NFR-001.4 | Requêtes N+1 : serializers nested doivent utiliser `select_related` / `prefetch_related` | 0 requête N+1 sur les vues list | US-020, US-040 | `SYSTEM_DESIGN.md:11` |

**Note actuelle** : Aucun `select_related` ou `prefetch_related` n'est présent dans les ViewSets (`liftapp/views.py`). `WorkoutSessionSerializer` inclut des `Set` nested, ce qui génère des requêtes N+1.

---

### NFR-002 — Sécurité

| ID | Exigence | Valeur cible | Stories concernées | Source |
|----|----------|-------------|-------------------|--------|
| NFR-002.1 | Durée access token | ≤ 15 min en production | US-011, US-012 | `SYSTEM_DESIGN.md:4.2`, actuellement 180 min (`settings.py:187`) |
| NFR-002.2 | SECRET_KEY non par défaut | Clé aléatoire ≥ 50 caractères | Toutes | `AUDIT.md:13` |
| NFR-002.3 | DEBUG = False en staging/prod | `os.environ["DEBUG"] = "false"` → `False` | Toutes | `Lift/settings.py:31` cassé |
| NFR-002.4 | Isolation des données utilisateur | Un user ne peut JAMAIS voir les données d'un autre | US-031, US-033, US-040 | `accounts/permissions.py`, `liftapp/views.py` |
| NFR-002.5 | Rate limiting sur /api/auth/login/ | ≤ 10 tentatives / minute / IP | US-011 | `SYSTEM_DESIGN.md:9.2` |
| NFR-002.6 | HTTPS uniquement en production | Redirection HTTP → HTTPS activée | Toutes | `SYSTEM_DESIGN.md:9.2` |
| NFR-002.7 | Mot de passe haché | bcrypt via Django `set_password()` | US-010 | `accounts/serializers.py:44-46` (déjà fait) |
| NFR-002.8 | Headers sécurité | HSTS, X-Frame-Options, CSP en production | Toutes | `SYSTEM_DESIGN.md:9.2` |

---

### NFR-003 — Offline et Synchronisation

| ID | Exigence | Valeur cible | Stories concernées | Source |
|----|----------|-------------|-------------------|--------|
| NFR-003.1 | Taux de sync réussie | ≥ 95 % | US-033 (offline) | `Spec.md:2` |
| NFR-003.2 | Identification sans conflit | UUID v4 comme PK sur tous les modèles | US-031, US-033 | `SYSTEM_DESIGN.md:5.1`, déjà implémenté |
| NFR-003.3 | Stratégie de conflit | Last-write-wins (comparer `updated_at`) | UC-004 | `SYSTEM_DESIGN.md:5.4` |
| NFR-003.4 | Cache local exercices | Exercices disponibles sans réseau | US-020 | `ROADMAP.md:7.2` |

---

### NFR-004 — RGPD et Données Personnelles

| ID | Exigence | Stories concernées | Source |
|----|----------|-------------------|--------|
| NFR-004.1 | Droit à l'oubli : endpoint `DELETE /api/users/me/delete/` | US-013 | `TODOLIST.md:65` |
| NFR-004.2 | Export des données : endpoint `GET /api/users/me/export/` | US-013 | `TODOLIST.md:64` |
| NFR-004.3 | Consentement explicite à la première ouverture | US-010 | `Spec.md:5.5` |
| NFR-004.4 | Chiffrement au repos (production) | Toutes | `Spec.md:5.5` |
| NFR-004.5 | `email_verified` avant l'accès complet | US-010, US-011 | `accounts/models.py:14` — configuré mais non actif |

---

### NFR-005 — Validation des Données

| ID | Exigence | Stories concernées | Source |
|----|----------|-------------------|--------|
| NFR-005.1 | `weight_kg` : décimal positif, max 999.99 kg | US-031 | `liftapp/models.py:102` — pas de validator minimum actuellement |
| NFR-005.2 | `reps` : entier ≥ 1 et ≤ 999 | US-031 | `liftapp/models.py:103` — pas de validator actuellement |
| NFR-005.3 | `rpe` : entier entre 1 et 10 si renseigné | US-031 | `liftapp/models.py:103` — pas de validator actuellement |
| NFR-005.4 | `actual_weight` (WeightLog) : entre 0 et 200 kg | US-060 | `nutrition/models.py:15-17` — **déjà implémenté** |
| NFR-005.5 | Email : format valide et unicité | US-010 | `accounts/models.py:13` — **déjà implémenté** |

---

### NFR-006 — Unités de Mesure

| ID | Exigence | Stories concernées | Source |
|----|----------|-------------------|--------|
| NFR-006.1 | Le stockage est en kg (colonne `weight_kg`) | US-031 | `liftapp/models.py:102` |
| NFR-006.2 | L'affichage peut être en kg ou lbs (préférence utilisateur) | US-031 | `AUDIT.md:391` — [HYPOTHÈSE] non implémenté, aucun champ préférence unité sur `CustomUser` |
| NFR-006.3 | La conversion kg→lbs se fait côté frontend (×2.20462) | US-031 | — |

---

### NFR-007 — Accessibilité

| ID | Exigence | Stories concernées | Source |
|----|----------|-------------------|--------|
| NFR-007.1 | Les labels des champs sont lisibles par les lecteurs d'écran | Toutes | — |
| NFR-007.2 | Contraste des couleurs ≥ WCAG AA (4.5:1) | Toutes | — |
| NFR-007.3 | Les actions principales sont atteignables en one-hand (pouce) | US-031, US-033 | `Spec.md:3` (usage mobile court & fréquent) |

---

### NFR-008 — Versioning et Compatibilité

| ID | Exigence | Stories concernées | Source |
|----|----------|-------------------|--------|
| NFR-008.1 | L'API devrait être versionnée `/api/v1/` avant le premier utilisateur public | Toutes | `SYSTEM_DESIGN.md:11`, actuellement `/api/lift/` sans version |
| NFR-008.2 | Un endpoint `/health/` doit retourner HTTP 200 pour le load balancer | — | `SYSTEM_DESIGN.md:11` |
| NFR-008.3 | Logging structuré en production (pas de print()) | Toutes | `SYSTEM_DESIGN.md:11` |
