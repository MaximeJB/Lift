# METHODES.md - COMMENT SAVOIR QUOI CODER ENSUITE

**Date** : 07/06/2026
**Objectif** : Comprendre les methodes qui permettent a un developpeur de decomposer un projet, prioriser, et decider de la prochaine etape — sans IA, sans tuteur.

---

## 1. La methode de ton tuteur : Build Horizontal par Couches (Layer-First)

### Vrai nom
**Horizontal Slicing** ou **Layer-First Development** (developpement par couches).

### Principe
Tu construis le projet couche par couche, en completant une couche entiere avant de passer a la suivante :
1. D'abord toute l'authentification (models, views, serializers, urls, tests)
2. Puis toute la couche BJJ
3. Puis toute la couche Nutrition
4. Puis toute la couche Lift

C'est ce que ton `TODOLIST.md` decrit : Phase 1 Auth -> Phase 2 BJJ -> Phase 3 Nutrition -> Phase 4 Lift.

### Forces
- **Structure claire** : tu sais exactement ou tu en es (Phase 2/8)
- **Fondations solides** : chaque couche est complete avant d'avancer
- **Logique pedagogique** : tu maitrises un domaine avant de passer au suivant
- **Moins de context-switching** : tu restes dans le meme domaine

### Limites
- **Feedback tardif** : tu ne peux pas tester le flow complet "un utilisateur fait une seance" avant d'avoir termine TOUTES les couches
- **Risque d'over-engineering** : tu construis des features (BJJ, Nutrition) avant de savoir si le coeur (Lift) fonctionne
- **Pas de produit livrable tot** : apres 2 mois tu as 4 couches backend mais 0 fonctionnalite utilisable end-to-end
- **Decouplage du besoin reel** : tu construis le "systeme" au lieu du "produit"

---

## 2. Vertical Slicing — Tranches Verticales

### Principe
Au lieu de construire par couche, tu construis par **fonctionnalite complete** traversant toutes les couches. Une "tranche verticale" va du model a l'API a l'ecran mobile.

```
HORIZONTAL (ton tuteur)          VERTICAL (tranches)
========================         ========================
| Auth  | BJJ | Nutri | Lift |   | S'inscrire | Logger | Voir stats |
|-------|-----|-------|------|   |   et se    |  une   |    de      |
| Model | Mod | Model | Mod  |   |  connecter | seance | progression|
| View  | View| View  | View |   |            |        |            |
| Serial| Ser | Ser   | Ser  |   |  Backend   | Backend|  Backend   |
| URL   | URL | URL   | URL  |   |  +         | +      |  +         |
| Test  | Test| Test  | Test |   |  Frontend  | Front  |  Frontend  |
========================         ========================
```

### Quand l'utiliser
- Quand tu veux un **produit utilisable le plus tot possible**
- Quand tu travailles avec des utilisateurs/testeurs qui veulent du feedback
- Methode standard en Agile/Scrum

### Limites
- Plus de context-switching (tu touches au backend ET frontend dans la meme tranche)
- Peut creer du code temporaire qui sera refactorise
- Necessite de savoir decouper finement

### Exemple Lift
**Tranche 1** : "En tant qu'utilisateur, je peux m'inscrire et me connecter"
- Backend : CustomUser + JWT + register/login endpoints
- Frontend : ecran inscription + ecran login + stockage token

**Tranche 2** : "En tant qu'utilisateur, je peux logger une seance"
- Backend : Exercise + WorkoutSession + Set + endpoints
- Frontend : ecran seance + formulaire saisie series

**Tranche 3** : "En tant qu'utilisateur, je peux voir mon historique"
- Backend : endpoint liste sessions + filtrage par date
- Frontend : ecran historique + liste scrollable

---

## 3. Walking Skeleton / Tracer Bullet

### Principe
Construire le **chemin le plus fin possible** a travers toutes les couches du systeme, du frontend a la base de donnees. Pas de fonctionnalite, juste la preuve que les couches communiquent.

Le terme vient du livre *Pragmatic Programmer* (tracer bullet) et de Alistair Cockburn (walking skeleton).

**Walking Skeleton** = le squelette marche mais n'a pas de muscles.
**Tracer Bullet** = un tir lumineux qui montre la trajectoire avant de tirer pour de vrai.

### Quand l'utiliser
- Au tout debut d'un projet pour valider l'architecture
- Quand tu hesites sur la stack technique
- Quand tu veux deployer en prod des le jour 1

### Limites
- Ne produit rien d'utile pour l'utilisateur
- Peut donner un faux sentiment d'avancement

### Exemple Lift
Un walking skeleton de Lift serait :
1. App Expo avec un ecran qui affiche "Hello Lift"
2. Qui appelle `GET /api/lift/exercise/` sur ton backend Django
3. Qui affiche la liste des exercices
4. Deploye sur un vrai telephone

0 feature. Mais la preuve que React Native <-> Django <-> SQLite fonctionne.

---

## 4. MVP (Minimum Viable Product) / MMP (Minimum Marketable Product)

### Principe
**MVP** : Le plus petit produit qui permet de **tester une hypothese** aupres de vrais utilisateurs. Ce n'est PAS "le minimum pour que ca marche" — c'est "le minimum pour apprendre quelque chose".

**MMP** : Le plus petit produit que tu peux **publier sur l'App Store** sans avoir honte. Plus complet qu'un MVP.

### Quand l'utiliser
- MVP : pour valider que ton idee interesse quelqu'un (avant de tout construire)
- MMP : pour definir la barre de qualite minimale pour un lancement

### Limites
- Le mot "MVP" est souvent detourne pour dire "version incomplete" — ce n'est pas ca
- Risque de livrer un produit trop brut (MVP) ou de repousser indefiniment (MMP trop ambitieux)

### Exemple Lift
**MVP** : une app qui fait UNE chose bien — logger une seance de muscu avec poids/reps et la revoir apres. Pas de BJJ, pas de nutrition, pas de stats avancees. Juste le logging.

**MMP** : le logging + les stats de base (volume, PRs) + l'auth + le mode offline. Ce que tu pourrais publier sur l'App Store.

Ton Spec.md definit un "MVP" qui est en realite un MMP (auth + muscu + BJJ + offline + dark mode). C'est ambitieux pour un premier lancement.

---

## 5. User Stories + Criteres d'Acceptation

### Principe
Une **user story** decrit une fonctionnalite du point de vue de l'utilisateur :

```
En tant que [role],
je veux [action],
afin de [benefice].
```

Les **criteres d'acceptation** definissent quand la story est "terminee" — ce sont les conditions de succes mesurables.

### Format INVEST
Une bonne user story est :
- **I**ndependante (realisable seule)
- **N**egociable (pas un contrat, une conversation)
- **V**aluable (apporte de la valeur a l'utilisateur)
- **E**stimable (on peut estimer l'effort)
- **S**mall (assez petite pour etre faite en 1-3 jours)
- **T**estable (on peut verifier qu'elle marche)

### Format Gherkin (Given/When/Then)
Pour les criteres d'acceptation, le format BDD :

```
Given un utilisateur connecte avec une seance en cours
When il saisit 100kg x 8 reps sur "Bench Press"
Then la serie apparait dans la seance avec le bon poids et les bonnes reps
And le volume total de la seance est mis a jour
```

### Quand l'utiliser
- Pour decomposer une fonctionnalite en taches testables
- Pour communiquer avec un non-technique (un product owner, un designer)
- Pour ecrire des tests (le Gherkin se transforme naturellement en test)

### Limites
- Ecrire de bonnes user stories demande de la pratique
- Risque de sur-decomposer (50 micro-stories au lieu de 5 bonnes stories)

### Exemple Lift

```
STORY : Enregistrer une serie

En tant que pratiquant de musculation,
je veux enregistrer le poids et les repetitions d'une serie,
afin de suivre ma progression sur chaque exercice.

CRITERES D'ACCEPTATION :

Given je suis connecte et j'ai une seance en cours
When je selectionne "Bench Press" et je saisis 100kg, 8 reps
Then la serie est enregistree avec weight_kg=100, reps=8

Given je saisis une serie avec RPE
When je renseigne RPE = 8
Then la serie est enregistree avec rpe=8

Given je suis hors ligne
When je saisis une serie
Then la serie est stockee localement et synchronisee au retour du reseau
```

---

## 6. Epics / Themes / Backlog Produit

### Principe
Organisation hierarchique du travail :

```
THEME (domaine strategique)
  |-- EPIC (grande fonctionnalite, plusieurs semaines)
       |-- USER STORY (petite fonctionnalite, 1-3 jours)
            |-- TACHE (action technique, quelques heures)
```

Le **backlog produit** est la liste ordonnee de toutes les stories a faire.

### Quand l'utiliser
- Quand le projet est assez gros pour avoir besoin de structure
- Pour garder la vue d'ensemble quand tu es plonge dans le code

### Limites
- Peut devenir une usine a gaz si tu passes plus de temps a organiser qu'a coder
- En solo, un fichier TODO simple peut suffire

### Exemple Lift

```
THEME : Musculation
  |-- EPIC : Enregistrement de seance
  |     |-- STORY : Creer une seance depuis un template
  |     |-- STORY : Enregistrer une serie (poids/reps)
  |     |-- STORY : Modifier/supprimer une serie
  |     |-- STORY : Terminer et sauvegarder la seance
  |
  |-- EPIC : Historique et progression
        |-- STORY : Voir la liste de mes seances passees
        |-- STORY : Voir le detail d'une seance
        |-- STORY : Voir mon PR sur un exercice

THEME : Authentification
  |-- EPIC : Systeme de compte
        |-- STORY : S'inscrire par email
        |-- STORY : Se connecter
        |-- STORY : Modifier mon profil
```

---

## 7. Story Mapping (Jeff Patton)

### Principe
Un tableau 2D qui organise les stories :
- **Axe horizontal** = le parcours utilisateur (de gauche a droite, dans l'ordre chronologique)
- **Axe vertical** = la priorite (en haut = essentiel, en bas = bonus)

```
PARCOURS : Ouvrir l'app -> Se connecter -> Choisir template -> Logger seance -> Voir stats
               |              |                |                    |              |
Essentiel :  Splash screen   Login email     Liste templates     Saisie series   Volume total
               |              |                |                    |              |
Nice-to-have: Animation      OAuth Google    Creer template      Timer repos     Graphiques
               |              |                |                    |              |
Bonus :       Onboarding     Apple Sign-In   Partager template   Superset mode   Export PDF
```

On trace une **ligne horizontale** = tout ce qui est au-dessus = MVP.

### Quand l'utiliser
- Pour definir le MVP visuellement
- Pour s'assurer que chaque etape du parcours utilisateur est couverte

### Limites
- Difficile a maintenir dans un fichier texte (fonctionne mieux sur un mur avec des post-its ou un outil comme Miro)

### Exemple Lift
Le story map de Lift montrerait que tu as construit toute la colonne "backend" (en profondeur) mais aucune colonne "frontend" (en largeur). Le parcours utilisateur est incomplet — impossible de faire le flow "ouvrir l'app -> logger une seance".

---

## 8. Methodes de Priorisation

### 8.1 MoSCoW

| Categorie | Signification | Exemple Lift |
|-----------|---------------|--------------|
| **Must** | Indispensable, le produit ne marche pas sans | Auth, logging seances, exercices |
| **Should** | Important mais contournable | Stats de base, templates |
| **Could** | Sympa a avoir | BJJ tracking, dark mode |
| **Won't** | Pas dans cette version | Social features, export PDF |

### 8.2 RICE (Reach, Impact, Confidence, Effort)

Chaque feature recoit un score :

```
RICE = (Reach x Impact x Confidence) / Effort
```

| Feature | Reach | Impact | Confidence | Effort | Score |
|---------|-------|--------|------------|--------|-------|
| Logger une seance | 100% users | 3/3 | 100% | 3 sem | 100 |
| Stats progression | 80% users | 2/3 | 80% | 2 sem | 53 |
| BJJ tracking | 20% users | 2/3 | 60% | 3 sem | 8 |
| Social features | 30% users | 1/3 | 40% | 5 sem | 2.4 |

Le score RICE montre clairement : le logging de seance est 40x plus prioritaire que les features sociales.

### 8.3 Matrice Valeur / Effort

```
         Haute valeur
              |
    Quick Wins | Gros projets
    (FAIRE)    | (PLANIFIER)
   ------------|------------
    Fill-ins   | Puits sans fond
    (SI TEMPS) | (EVITER)
              |
         Basse valeur

         Peu d'effort <----> Beaucoup d'effort
```

### Quand l'utiliser
- MoSCoW : pour un premier tri rapide (5 min)
- RICE : quand tu hesites entre plusieurs features (plus objectif)
- Valeur/Effort : pour decider quoi faire cette semaine

---

## 9. Definition of Ready (DoR) / Definition of Done (DoD)

### Principe
**DoR** = checklist pour savoir si une story est **prete a etre codee** :
- [ ] La story est ecrite au format user story
- [ ] Les criteres d'acceptation sont definis
- [ ] Les dependances sont identifiees (ex: "necessite que l'auth soit faite")
- [ ] L'estimation d'effort est faite

**DoD** = checklist pour savoir si une story est **terminee** :
- [ ] Le code fonctionne et est teste
- [ ] Les tests passent
- [ ] Le code est commite
- [ ] L'endpoint est testable via Postman/curl
- [ ] Pas de regression sur les features existantes

### Quand l'utiliser
- Systematiquement. C'est ce qui empeche de laisser des choses "a moitie faites"

### Limites
- En solo, on a tendance a skipper les DoD ("ca marche, je passe a la suite")

### Exemple Lift
Ton projet montre exactement ce risque : le modele Exercise est "a moitie fait" (4 champs ajoutes, syntaxe cassee, pas de migration). Une DoD aurait empeche ca : "le modele compile, la migration est creee et appliquee, le serveur demarre".

---

## 10. TDD comme moteur du "prochain pas"

### Principe
**Test-Driven Development** : ecrire le test AVANT le code.

Cycle **Red-Green-Refactor** :
1. **Red** : ecrire un test qui echoue (il teste ce que tu VEUX que le code fasse)
2. **Green** : ecrire le minimum de code pour que le test passe
3. **Refactor** : ameliorer le code sans casser le test

Le TDD repond naturellement a "quoi coder ensuite" : le prochain test qui echoue.

### Outside-In vs Inside-Out

**Outside-In** (London school) :
- Tu commences par le test de l'endpoint API
- Il echoue -> tu crees la view
- La view echoue -> tu crees le serializer
- Le serializer echoue -> tu crees le model

**Inside-Out** (Chicago school) :
- Tu commences par le test du model
- Puis le serializer
- Puis la view
- Puis l'endpoint

### Quand l'utiliser
- Quand tu ne sais pas par ou commencer (le test force a definir le "quoi" avant le "comment")
- Pour du code critique (auth, paiement, calculs)

### Limites
- Courbe d'apprentissage
- Peut ralentir au debut (mais accelere a long terme)
- Difficile pour le frontend/UI

### Exemple Lift

```python
# RED : ce test echoue car l'endpoint n'existe pas encore
def test_create_workout_session(self):
    self.client.force_authenticate(user=self.user)
    response = self.client.post('/api/lift/workout_session/', {
        'title': 'Push Day',
        'date': '2026-06-07',
    })
    self.assertEqual(response.status_code, 201)
    self.assertEqual(response.data['title'], 'Push Day')

# GREEN : tu ecris le minimum pour que ca passe
# REFACTOR : tu ameliores (validation, permissions, etc.)
```

---

## 11. Use Cases / Cas d'Utilisation

### Principe
Description detaillee d'une interaction utilisateur-systeme, avec le scenario nominal et les scenarios alternatifs/d'erreur.

### Quand l'utiliser
- Pour les flows complexes (inscription, sync offline, paiement)
- Quand un flow a plusieurs branches (succes, erreur, cas limites)

### Limites
- Plus lourd que les user stories
- Peut devenir trop detaille pour des features simples

### Exemple Lift

```
USE CASE : Enregistrer une seance de musculation

ACTEUR : Utilisateur connecte
PRECONDITION : L'utilisateur a un compte et est authentifie

SCENARIO NOMINAL :
1. L'utilisateur selectionne un template de seance
2. Le systeme charge la liste des exercices du template
3. Pour chaque exercice, l'utilisateur saisit poids + reps
4. L'utilisateur termine la seance
5. Le systeme enregistre la seance avec toutes les series

SCENARIO ALTERNATIF A : Seance sans template
  2a. L'utilisateur ajoute des exercices manuellement
  → Reprend au pas 3

SCENARIO ALTERNATIF B : Hors ligne
  5b. Le systeme stocke localement
  5c. A la reconnexion, synchronise avec le serveur

SCENARIO D'ERREUR : Exercice introuvable
  3a. L'exercice n'existe pas dans la base
  3b. Le systeme propose de creer un exercice custom (post-MVP)
```

---

## 12. Domain-Driven Design (DDD) Leger

### Principe
Modeliser le code autour du **domaine metier** (le sport, la musculation) plutot qu'autour de la technique (les frameworks, la BDD).

Concepts cles :
- **Langage ubiquitaire** : tout le monde (code, docs, conversations) utilise les memes mots. "Seance", "Serie", "Exercice", "PR" — pas "WorkoutInstance", "RepetitionRecord".
- **Bounded Contexts** : chaque domaine (muscu, BJJ, nutrition) est un contexte separe avec ses propres regles.
- **Entites vs Value Objects** : une Seance a une identite (c'est CETTE seance-la). Un poids (100kg) est un value object (interchangeable).

### Quand l'utiliser
- Quand le domaine metier est complexe
- Pour nommer correctement les choses (le naming est la chose la plus difficile en dev)

### Limites
- Le DDD complet (aggregates, repositories, domain events) est overkill pour la plupart des projets
- En version legere ("bien nommer les choses, bien separer les domaines") c'est toujours pertinent

### Exemple Lift
Tu fais deja du DDD leger :
- **Bounded Contexts** = tes apps Django : `accounts/`, `liftapp/`, `bjjapp/`, `nutrition/`
- **Langage ubiquitaire** = tes models s'appellent `Exercise`, `Set`, `WorkoutSession` (termes du domaine muscu)

Mais il y a des incoherences : `TemplateExercise` n'est pas un terme que dirait un sportif. "ExerciceDansTemplate" ou "ExerciseSlot" serait plus parlant.

---

## 13. YAGNI / KISS / DRY

### YAGNI — You Ain't Gonna Need It
**Ne construis pas ce dont tu n'as pas besoin maintenant.**

Exemples dans ton projet ou YAGNI s'applique :
- Le module `nutrition/` est construit mais le MVP n'en a pas besoin
- Le `synced_at` est sur tous les models mais aucun mecanisme de sync n'existe
- Les OAuth providers (Google, Apple) sont configures mais le flow n'est pas teste

### KISS — Keep It Simple, Stupid
**La solution la plus simple qui fonctionne est la meilleure.**

Exemples :
- `bulk_create` avec `ignore_conflicts=True` dans `import_exercices.py` = KISS
- Creer un pipeline ETL elabore pour 400 exercices quand un script de 50 lignes suffit = pas KISS

### DRY — Don't Repeat Yourself
**Chaque connaissance doit avoir une representation unique.**

Exemples :
- Les `MUSCLE_GROUP_CHOICES` sont definies une seule fois dans Exercise = DRY
- Le pattern `synced_at + created_at + updated_at + UUIDField` est repete dans chaque model = opportunite d'un model abstrait de base (mais attention a ne pas abstraire trop tot — YAGNI)

---

## 14. Spikes (Recherche Timebox)

### Principe
Un **spike** est une periode de recherche avec une duree fixe pour repondre a une question technique. Le resultat est de la **connaissance**, pas du code de production.

### Quand l'utiliser
- Quand tu ne sais pas si une approche est faisable
- Quand tu hesites entre deux technologies
- Quand tu bloques sur un probleme inconnu

### Limites
- Le timeboxing est essentiel — sans limite, un spike devient de la procrastination
- Le code d'un spike est jetable (ne pas le merger en prod)

### Exemple Lift
Tu as fait un spike sans le savoir : l'exploration de l'API Hevy, le test de undetected-chromedriver vs SeleniumBase, l'analyse de l'architecture Hevy dans `scraping_infos.md`. C'etait de la recherche timebox qui a produit de la connaissance (quelle lib utiliser, quel endpoint appeler).

Prochain spike utile : "2h pour tester si thefuzz match correctement les noms d'exercices entre Hevy et free-exercise-db". Resultat = un seuil de similarite (ex: 85%) et une liste d'exercices non-matches.

---

## 15. Kanban Personnel

### Principe
Un tableau en 3-4 colonnes pour visualiser le travail en cours :

```
| A FAIRE      | EN COURS (max 2)    | EN REVIEW     | FAIT           |
|--------------|---------------------|---------------|----------------|
| Import Hevy  | Corriger models.py  |               | Scraping videos|
| Serializer   | Migration           |               | Auth JWT       |
| Tests auth   |                     |               | Import 873 exo |
| Frontend RN  |                     |               | ViewSets       |
```

**Regle cle** : la colonne "EN COURS" a une **limite** (WIP limit). Maximum 1-2 taches en parallele. Finir avant de commencer.

### Quand l'utiliser
- Toujours. Meme en solo. C'est le minimum de gestion de projet.

### Limites
- Necessite de la discipline pour mettre a jour le tableau
- Ne remplace pas la priorisation (il faut quand meme savoir QUOI mettre dans "A FAIRE")

### Exemple Lift
Ton modele Exercise est l'exemple parfait de pourquoi le WIP limit est important : tu as commence a modifier le modele (EN COURS), puis tu as switche sur le scraping (nouvelle tache EN COURS), puis sur SeleniumBase (encore une autre). Resultat : le modele est rest casse pendant 4 mois.

Avec un WIP limit de 1 : tu aurais fini le modele avant de commencer le scraping.

---

## 16. Methodes Complementaires

### 16.1 Timeboxing
Allouer un **temps fixe** a une tache, pas un scope fixe. "Je travaille 2h sur les tests auth" au lieu de "je fais tous les tests auth". A la fin du temps, tu t'arretes et evalues.

### 16.2 Pomodoro Technique
Sessions de 25 min de travail concentre + 5 min de pause. Apres 4 pomodoros, pause longue de 15-30 min. Particulierement efficace pour le code ou la concentration profonde est essentielle.

### 16.3 Daily Standup Solo
Chaque jour avant de coder, tu reponds a 3 questions (par ecrit, 2 min) :
1. Qu'est-ce que j'ai fait hier ?
2. Qu'est-ce que je fais aujourd'hui ?
3. Qu'est-ce qui me bloque ?

### 16.4 Retrospective Solo
Toutes les 1-2 semaines :
- Ce qui a bien marche
- Ce qui n'a pas marche
- Ce que je change pour la prochaine iteration

### 16.5 Rubber Duck Debugging
Expliquer ton probleme a voix haute (a un canard en caoutchouc, a un mur, a un ami). Le fait de formuler le probleme clairement declenche souvent la solution.

---

## 17. Quelle methode pour Lift ?

### Recommandation : Vertical Slicing + Kanban + DoD

Pour un projet solo d'apprentissage visant le niveau senior :

1. **Vertical Slicing** pour decomposer le travail en tranches livrables
2. **Kanban** avec WIP limit de 1 pour finir avant de commencer
3. **DoD** systematique pour ne plus laisser de code casse
4. **User Stories** pour definir clairement ce que tu construis
5. **MoSCoW** pour prioriser rapidement
6. **Spikes timebox** quand tu bloques sur un inconnu technique
7. **TDD** (progressivement) pour les parties critiques (auth, calculs)

Ce que tu peux abandonner :
- Les epics/themes formels (trop lourd en solo)
- Le story mapping (plus utile en equipe)
- Le RICE scoring (MoSCoW suffit en solo)

---

## 18. Ce a quoi je n'ai pas pense

### Pieges methodologiques
- **Paralysie de l'analyse** : passer plus de temps a planifier qu'a coder. La meilleure methode est celle qui te fait coder.
- **Methode =/= productivite** : adopter Scrum/Kanban/TDD ne rend pas automatiquement productif. C'est la discipline qui compte.
- **Perfectionnisme du "niveau senior"** : vouloir que chaque ligne soit parfaite bloque l'avancement. Le code senior est du code qui MARCHE, qui est TESTE, et qui est SIMPLE — pas du code qui utilise tous les design patterns.
- **Pas de tracking du temps** : tu ne sais pas combien de temps tu passes par feature. Sans mesure, impossible de s'ameliorer.

### Pieges specifiques a ton projet
- **4 apps Django des le depart** : c'est du build horizontal. En vertical slicing, tu aurais commence avec `accounts/` + `liftapp/` uniquement. `bjjapp/` et `nutrition/` auraient ete ajoutees quand le coeur (muscu) fonctionne.
- **873 exercices importes mais 0 seance testee** : beaucoup de donnees, zero flow utilisateur. Le vertical slicing aurait priorise "logger 1 seance avec 1 exercice" avant "importer 873 exercices".
- **Scraping avant d'avoir un produit** : le scraping de videos est un spike qui a derive en feature. Les videos sont utiles mais pas critiques pour le MVP (un nom d'exercice suffit).
