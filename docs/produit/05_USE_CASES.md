# 05_USE_CASES.md — Use Cases (flux complexes uniquement)

**Date** : 08/06/2026  
**Périmètre** : Uniquement les flux à branches multiples ou à logique non triviale.  
Les CRUD simples (voir la liste, supprimer un enregistrement) ne sont pas documentés ici.

---

## UC-001 — Inscription et Première Connexion (JWT)

**Acteur principal** : Utilisateur non inscrit  
**Apps concernées** : `accounts/`  
**Endpoints** : `POST /api/auth/register/`, `POST /api/auth/login/`, `POST /api/auth/token/refresh/`  
**Code réel** : `accounts/views.py:9-61`, `accounts/serializers.py:22-72`

### Préconditions
- L'utilisateur n'a pas de compte existant
- L'application est joignable (réseau disponible)

### Scénario Nominal — Inscription

1. L'utilisateur ouvre l'écran d'inscription
2. L'utilisateur saisit : email, password, password_confirm, pseudo
3. L'application envoie `POST /api/auth/register/` avec les données
4. Le backend valide : email unique, passwords identiques (`accounts/serializers.py:35-39`)
5. Le backend crée l'utilisateur avec le mot de passe haché (`accounts/serializers.py:40-47`)
6. Le backend génère un couple access_token + refresh_token et les retourne dans la réponse (`accounts/views.py:20-24`)
7. L'application stocke les tokens dans SecureStore
8. L'application redirige vers l'écran principal

### Scénario Nominal — Connexion

1. L'utilisateur ouvre l'écran de connexion
2. L'utilisateur saisit email + password
3. L'application envoie `POST /api/auth/login/`
4. Le backend retrouve l'utilisateur par email, vérifie le mot de passe via `authenticate()` (`accounts/serializers.py:58-68`)
5. Le backend retourne access_token + refresh_token + infos utilisateur basiques
6. L'application stocke les tokens, redirige vers l'écran principal

### Scénario Nominal — Rafraîchissement automatique

1. L'application détecte que l'access_token est expiré (erreur 401)
2. L'application envoie `POST /api/auth/token/refresh/` avec le refresh_token
3. Si le refresh_token est valide : nouveau access_token retourné (`ROTATE_REFRESH_TOKENS=True` dans `settings.py:188`)
4. L'application relance la requête originale avec le nouveau token

### Scénarios Alternatifs

**A1 — Email déjà existant (inscription)**
- Étape 4 → Le serializer retourne `ValidationError` (champ email unique dans `accounts/models.py:13`)
- L'application affiche : "Cet email est déjà utilisé"
- L'utilisateur est invité à se connecter ou à réinitialiser son mot de passe

**A2 — Passwords non identiques (inscription)**
- Étape 4 → `accounts/serializers.py:36-39` lève `ValidationError`
- L'application affiche : "Les mots de passe ne correspondent pas"

**A3 — OAuth Google (non encore implémenté)**
- [PRÉVU, ABSENT] — allauth configuré dans `settings.py:81-92` mais non testé
- Décision : reporter au post-MVP

### Scénarios d'Erreur

**E1 — Identifiants incorrects (connexion)**
- Le backend retourne 400 avec "Invalid credentials"
- [HYPOTHÈSE] : Le message ne précise pas si c'est l'email ou le password qui est faux (sécurité)

**E2 — Refresh token expiré**
- `POST /api/auth/token/refresh/` retourne 401
- L'application déconnecte l'utilisateur et le redirige vers l'écran de connexion
- `REFRESH_TOKEN_LIFETIME = 1 day` (`settings.py:189`) — durée courte, risque de déconnexions fréquentes

**E3 — Réseau indisponible**
- L'application affiche un message d'erreur (pas d'écran blanc)
- [ABSENT] : non implémenté côté frontend

### Postconditions
- L'utilisateur a un UUID unique en BDD (`accounts/models.py:11`)
- Les tokens JWT sont stockés localement
- `email_verified = False` par défaut (`accounts/models.py:14`) — la vérification par email n'est pas implémentée (pas de backend email configuré)

---

## UC-002 — ETL Import Hevy (enrichissement des exercices)

**Acteur principal** : Développeur (management command)  
**Apps concernées** : `liftapp/`  
**Commandes** : `python manage.py import_hevy` (à créer), `python manage.py import_exercices` (existant)  
**Fichiers sources** : `exercises.json` (873 exos), `hevy.json` (435 exos), `data_vids.json` (406 URLs vidéo)  
**Code réel** : `liftapp/management/commands/import_exercices.py`, `data_vids.json` disponible

### Préconditions
- 873 exercices déjà importés depuis free-exercise-db (via `import_exercices.py`)
- `hevy.json` et `data_vids.json` présents à la racine du projet
- Le modèle `Exercise` est corrigé (US-001 réalisée) avec `video_url`, `secondary_muscle_groups`, `external_id`, `exercise_type`

### Scénario Nominal

1. Le développeur lance `python manage.py import_hevy`
2. La commande charge `hevy.json` (liste de 435 `exercise_templates`)
3. La commande charge `data_vids.json` (dictionnaire `{hevy_id: video_url}`, 406 entrées)
4. Pour chaque exercice Hevy :
   a. Récupérer le nom de l'exercice Hevy
   b. Chercher un exercice correspondant dans les 873 en BDD (fuzzy match sur le nom)
   c. Si match trouvé (similarité ≥ seuil) :
      - Mettre à jour `external_id` avec l'ID Hevy
      - Mettre à jour `secondary_muscle_groups` (JSONField)
      - Mettre à jour `exercise_type` (categories Hevy : `weight_reps`, `reps_only`, `duration`, etc.)
      - Si l'ID Hevy est dans `data_vids.json` : mettre à jour `video_url`
5. Afficher un rapport : matches, misses, erreurs, exercices enrichis
6. Sauvegarder via `update_or_create` (idempotence)

### Scénarios Alternatifs

**A1 — Aucun match pour un exercice Hevy**
- La commande loggue l'exercice non matché dans un fichier ou stdout
- Poursuite du traitement sur l'exercice suivant

**A2 — Plusieurs exercices en BDD correspondent au nom Hevy (ambiguïté)**
- La commande sélectionne le match de plus haute similarité
- Les ambiguïtés sont loggées pour review manuelle

**A3 — URL vidéo déjà présente pour cet exercice**
- `update_or_create` : la nouvelle valeur écrase l'ancienne (last-write-wins)

### Scénarios d'Erreur

**E1 — Fichier `hevy.json` absent ou corrompu**
- La commande affiche une erreur claire et s'arrête (pattern déjà dans `import_exercices.py:39-44`)

**E2 — Modèle Exercise non corrigé (SyntaxError)**
- La commande échoue à l'import avec `ImportError` ou `SyntaxError`
- Prérequis : US-001 doit être réalisée avant d'exécuter ce use case

### Postconditions
- Les exercices Hevy matchés ont leur `external_id`, `secondary_muscle_groups`, `exercise_type` mis à jour
- Les exercices avec vidéo ont leur `video_url` renseignée
- Les exercices non matchés restent inchangés
- Le rapport affiche le taux de couverture (ex : "340/873 exercices enrichis — 39%")

---

## UC-003 — Enregistrer une Séance de Musculation

**Acteur principal** : Pratiquant connecté  
**Apps concernées** : `liftapp/`  
**Endpoints** : `GET /api/lift/workout_template/`, `POST /api/lift/workout_session/`, `POST /api/lift/set/`  
**Code réel** : `liftapp/views.py:27-65`, `liftapp/models.py:40-116`

### Préconditions
- L'utilisateur est authentifié (token JWT valide)
- Des exercices existent en base (873 en BDD)
- Au moins un template existe en base (à seeder — [ABSENT])

### Scénario Nominal — Séance depuis un template

1. L'utilisateur ouvre l'écran "Lift"
2. L'application charge `GET /api/lift/workout_template/` (templates publics + templates de l'utilisateur)
3. L'utilisateur sélectionne un template (ex: "Push Day")
4. L'application charge le détail du template avec ses exercices (`TemplateExercise` avec `target_sets`, `target_reps_min`, `target_reps_max`)
5. L'utilisateur commence la séance : l'application crée une `WorkoutSession` via `POST /api/lift/workout_session/`
   - Le backend injecte `user=request.user` (`liftapp/views.py:56-57`)
6. Pour chaque exercice du template, l'utilisateur saisit ses séries :
   a. L'utilisateur saisit poids + reps (+ RPE optionnel)
   b. L'application envoie `POST /api/lift/set/` avec `workout_session`, `exercise`, `set_number`, `weight_kg`, `reps`
   c. Le timer de repos démarre automatiquement (frontend uniquement)
7. L'utilisateur termine la séance et confirme
8. L'application met à jour la `WorkoutSession` avec `end_time` et `duration_minutes`
9. L'écran de résumé affiche : volume total, durée, nombre de séries

### Scénario Alternatif A1 — Séance libre (sans template)

- Étape 2-4 : l'utilisateur choisit "Nouvelle séance libre"
- Étape 5 : `WorkoutSession` créée avec `template=null` (champ nullable — `liftapp/models.py:83`)
- Étape 6 : l'utilisateur ajoute des exercices manuellement (recherche dans la bibliothèque)
- Reprise au scénario nominal étape 6

### Scénario Alternatif A2 — Modifier une série après saisie

- L'utilisateur swipe une série ou tape dessus pour la modifier
- L'application envoie `PATCH /api/lift/set/{id}/` avec les nouvelles valeurs
- [Note] : `SetViewSet` est un `ModelViewSet` donc `PATCH` est supporté

### Scénario Alternatif A3 — Séance interrompue (offline)

- [PRÉVU, ABSENT] : La séance n'est pas sauvegardée si la connexion est perdue
- Architecture prévue : `synced_at` sur `WorkoutSession` et `Set` (`liftapp/models.py:91, 111`)
- Implémentation complète reportée à Milestone 7

### Scénarios d'Erreur

**E1 — Token JWT expiré pendant la séance**
- L'application tente un refresh automatique (UC-001 scénario A3)
- Si le refresh échoue : les données saisies sont perdues (pas de cache local)
- [Risque] : `ACCESS_TOKEN_LIFETIME = 180 min` (`settings.py:187`) — atténue ce risque pour les séances courtes

**E2 — Poids ou reps invalides**
- Le serializer DRF valide les données (`weight_kg = DecimalField(6,2)`, `reps = IntegerField`)
- Retourne 400 avec le détail du champ invalide
- L'application affiche le message d'erreur

**E3 — Exercice avec `on_delete=PROTECT`**
- Si un exercice utilisé dans une série est supprimé : `IntegrityError` (protection Django — `liftapp/models.py:100`)
- En pratique : les exercices sont en lecture seule (`ExerciseViewset = ReadOnlyModelViewSet` — `liftapp/views.py:17`)

### Postconditions
- Une `WorkoutSession` avec `user`, `date`, `title` est créée en BDD
- N instances de `Set` sont créées avec leurs `weight_kg`, `reps`, `exercise`
- Les données sont disponibles via `GET /api/lift/workout_session/` filtré par user

---

## UC-004 — Synchronisation Offline (architecture prévue)

**Acteur principal** : Pratiquant avec connexion intermittente  
**Apps concernées** : `liftapp/`, frontend  
**Endpoint prévu** : `POST /api/sync/` (non créé)  
**Code réel pertinent** : champs `synced_at` sur tous les modèles, `id = UUIDField` sur tous les modèles

**Note** : Ce use case est [PRÉVU, ABSENT]. Il est documenté pour clarifier l'architecture attendue décrite dans `SYSTEM_DESIGN.md:5.3`.

### Préconditions
- L'utilisateur a une version de l'application avec cache local (expo-sqlite)
- Des données ont été créées hors ligne (séances, séries)
- La connexion réseau vient d'être rétablie

### Scénario Nominal

1. L'application détecte le retour du réseau
2. L'application collecte tous les objets locaux avec `synced_at = null` (non synchronisés)
3. L'application envoie `POST /api/sync/` avec les changements locaux groupés
4. Le backend traite chaque changement :
   a. Si l'objet n'existe pas en BDD : création avec l'UUID client
   b. Si l'objet existe et `client.updated_at > server.updated_at` : mise à jour (last-write-wins)
   c. Si l'objet existe et `server.updated_at > client.updated_at` : conflit signalé
5. Le backend retourne les changements serveur depuis la dernière sync + liste des conflits résolus
6. L'application met à jour sa base locale et marque les objets synchonisés (`synced_at = now()`)

### Postconditions
- Toutes les séances créées offline sont en BDD serveur
- Les UUIDs clients sont préservés (pas de re-génération)

---

## UC-005 — Flux de Permission IsOwner

**Acteur principal** : Pratiquant authentifié tentant d'accéder aux données d'un autre utilisateur  
**Code réel** : `accounts/permissions.py:4-6`, `liftapp/views.py:48-65`

### Préconditions
- Deux utilisateurs A et B existent en BDD
- L'utilisateur A est authentifié avec un token JWT valide
- L'utilisateur B a des séances enregistrées

### Scénario Nominal (accès légitime)

1. L'utilisateur A envoie `GET /api/lift/workout_session/`
2. `WorkoutSessionViewSet.get_queryset()` filtre : `user.workouts.all()` (`liftapp/views.py:53-54`)
3. Seules les séances de l'utilisateur A sont retournées

### Scénario d'Erreur (tentative d'accès croisé)

1. L'utilisateur A tente d'accéder à `GET /api/lift/workout_session/{uuid_session_de_B}/`
2. `get_queryset()` filtre déjà par `user` : la session de B n'est pas dans le queryset
3. Django retourne 404 (l'objet n'existe pas dans le queryset de A)
4. `has_object_permission()` dans `IsOwner` (`accounts/permissions.py:5-6`) retourne `False` si jamais l'objet est atteint

**Note** : L'isolation se fait au niveau du `get_queryset()` (filtre query) et non uniquement au niveau de la permission objet. C'est plus sécurisé car `has_object_permission()` n'est appelé que sur les vues detail (retrieve, update, delete), pas sur les vues list.
