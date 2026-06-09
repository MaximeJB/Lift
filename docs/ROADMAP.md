# ROADMAP.md - PLAN DE ROUTE LIFT

**Date** : 07/06/2026
**Methode** : Vertical Slicing (tranches livrables) + Kanban (WIP=1)
**Objectif** : Aller du projet casse actuel a un MVP publiable sur l'App Store.

---

## Ou tu en es (recap AUDIT.md)

- Backend Django a ~60%, mais **modele Exercise casse** (SyntaxError ligne 38)
- Auth JWT fonctionnelle (register, login, profile, refresh)
- 873 exercices en BDD + 406 videos scrapees
- 0 tests, 0 frontend, 0 requirements.txt
- 4 mois d'arret (derniere activite : 30/01/2026)

---

## Philosophie de cette Roadmap

L'ancienne TODOLIST.md suivait une approche **horizontale** (Phase 1 Auth → Phase 2 BJJ → Phase 3 Nutrition → Phase 4 Lift). Cette roadmap suit une approche **verticale** : chaque milestone produit quelque chose de **testable end-to-end**.

**Regle** : chaque milestone se termine par un **demo moment** — tu peux montrer quelque chose a quelqu'un.

---

## MILESTONE 0 : DEBLOQUER LE PROJET
**Objectif** : Repartir d'une base saine. Le serveur demarre, le code compile, les dependances sont trackees.
**Demo moment** : `python manage.py runserver` fonctionne sans erreur.

### Taches

| # | Tache | DoD (Definition of Done) |
|---|-------|--------------------------|
| 0.1 | Corriger `liftapp/models.py` — syntaxe cassee | `exercise_type` a un type et une valeur. Le fichier importe sans erreur. |
| 0.2 | Corriger `video_url` — ajouter `blank=True, null=True` | Compatible avec les 873 exercices existants sans video. |
| 0.3 | Corriger `external_id` — ajouter `max_length=50` | CharField valide. |
| 0.4 | Corriger `secondary_muscle_groups` — passer en `JSONField` | Peut stocker une liste `["triceps", "shoulders"]`. |
| 0.5 | Creer et appliquer la migration | `makemigrations` + `migrate` sans erreur. |
| 0.6 | Corriger `DEBUG` dans settings.py (string → bool) | `DEBUG=False` dans .env donne vraiment `False`. |
| 0.7 | Creer `requirements.txt` | `pip freeze > requirements.txt`, nettoyee. |
| 0.8 | Verifier que `runserver` demarre | Page d'accueil Django visible, pas de crash. |

**Duree estimee** : 1-2 heures

---

## MILESTONE 1 : PIPELINE ETL EXERCICES
**Objectif** : Enrichir les 873 exercices avec les donnees Hevy (secondary muscles, type, video URL).
**Demo moment** : `python manage.py import_hevy` enrichit la BDD. Un `GET /api/lift/exercise/` retourne des exercices avec video_url et secondary_muscle_groups.

### Taches

| # | Tache | DoD |
|---|-------|-----|
| 1.1 | Creer `import_hevy.py` management command | Le fichier existe et est executable via `manage.py`. |
| 1.2 | EXTRACT : charger `hevy.json` + `data_vids.json` | Les deux fichiers sont lus sans erreur. |
| 1.3 | TRANSFORM : mapping muscle_group Hevy → choices Django | Dictionnaire de mapping complet. |
| 1.4 | TRANSFORM : fuzzy match noms exercices | Match exercices Hevy avec exercices en BDD. Log des non-matches. |
| 1.5 | LOAD : `update_or_create` pour chaque exercice matche | Exercices existants enrichis, pas de doublons. |
| 1.6 | Stats finales : matches, misses, enrichis | Le script affiche un rapport clair en fin d'execution. |
| 1.7 | Mettre a jour `ExerciseSerializer` avec les nouveaux champs | L'API retourne `video_url`, `secondary_muscle_groups`, `exercise_type`. |

**Duree estimee** : 1-2 jours

---

## MILESTONE 2 : TESTS BACKEND (couverture de base)
**Objectif** : Avoir des tests automatises sur les parties critiques. Pouvoir refactorer sans peur.
**Demo moment** : `python manage.py test` passe au vert. Coverage ≥ 60%.

### Taches

| # | Tache | DoD |
|---|-------|-----|
| 2.1 | Installer pytest + pytest-django + factory_boy | `pytest` fonctionne, factories creent des objets. |
| 2.2 | Tests models accounts : CustomUser creation | Un utilisateur se cree avec email login. |
| 2.3 | Tests API auth : register, login, profile | POST register → 201, POST login → 200 + JWT, GET me → 200. |
| 2.4 | Tests models liftapp : Exercise, WorkoutSession, Set | Les models se creent, les relations fonctionnent. |
| 2.5 | Tests API liftapp : CRUD exercise, session, set | Les endpoints repondent correctement. Permissions verifiees. |
| 2.6 | Tests permissions : IsOwner empeche l'acces aux donnees d'autrui | User A ne peut pas lire/modifier les seances de User B. |
| 2.7 | Configurer coverage et atteindre ≥ 60% | `pytest --cov` affiche ≥ 60%. |

**Duree estimee** : 2-3 jours

---

## MILESTONE 3 : FRONTEND — WALKING SKELETON
**Objectif** : Avoir une app Expo qui se connecte au backend et affiche des donnees reelles.
**Demo moment** : Sur ton telephone, tu ouvres l'app, tu te connectes, tu vois la liste des exercices.

### Taches

| # | Tache | DoD |
|---|-------|-----|
| 3.1 | Initialiser le projet Expo (expo-router) | `npx expo start` ouvre l'app sur le telephone. |
| 3.2 | Creer l'ecran Login | Champ email + password + bouton. |
| 3.3 | Connecter le login au backend (POST /api/auth/login/) | JWT stocke dans SecureStore. Redirect apres login. |
| 3.4 | Creer l'ecran liste exercices | Appel GET /api/lift/exercise/, affiche une FlatList. |
| 3.5 | Creer la navigation par tabs (Home, Lift, Profile) | Bottom tab navigator avec 3 onglets. |
| 3.6 | Creer l'ecran Profil | Affiche les infos de GET /api/auth/me/. |

**Duree estimee** : 1 semaine

---

## MILESTONE 4 : TRANCHE VERTICALE — LOGGER UNE SEANCE
**Objectif** : Un utilisateur peut faire une seance complete : choisir un template, saisir ses series, sauvegarder.
**Demo moment** : Tu fais ta vraie seance de muscu avec l'app. Les donnees sont en BDD.

### Taches

| # | Tache | DoD |
|---|-------|-----|
| 4.1 | Ecran "Choisir un template" | Liste des templates, selection, navigation vers ecran seance. |
| 4.2 | Ecran "Seance en cours" | Affiche les exercices du template avec les series a faire. |
| 4.3 | Saisie d'une serie | Input poids + reps. Bouton "Ajouter serie". |
| 4.4 | Timer de repos | Compte a rebours configurable entre les series. |
| 4.5 | Sauvegarder la seance | POST /api/lift/workout_session/ + POST /api/lift/set/ pour chaque serie. |
| 4.6 | Feedback "Seance enregistree" | Ecran de confirmation avec resume (volume, duree). |

**Duree estimee** : 2 semaines

---

## MILESTONE 5 : TRANCHE VERTICALE — VOIR SA PROGRESSION
**Objectif** : Apres quelques seances, l'utilisateur voit ses stats et ses PRs.
**Demo moment** : Tu vois ton volume total de la semaine, ta progression sur le bench press, et ton PR.

### Taches

| # | Tache | DoD |
|---|-------|-----|
| 5.1 | Endpoint stats : volume par semaine | GET /api/lift/stats/weekly/ retourne le volume total. |
| 5.2 | Endpoint stats : historique par exercice | GET /api/lift/exercise/{id}/history/ retourne les performances passees. |
| 5.3 | Endpoint stats : PRs | GET /api/lift/stats/prs/ retourne les records par exercice. |
| 5.4 | Ecran Accueil avec stats | Affiche le volume semaine, le nombre de seances, les PRs recents. |
| 5.5 | Ecran historique seances | Liste des seances passees, cliquable pour voir le detail. |
| 5.6 | Graphique de progression | Courbe de volume ou de charge par exercice sur les X dernieres seances. |

**Duree estimee** : 2 semaines

---

## MILESTONE 6 : POLISH MVP
**Objectif** : Rendre l'app utilisable au quotidien. UX propre, bugs corriges, edge cases geres.
**Demo moment** : Tu utilises l'app chaque jour pendant 1 semaine sans bug bloquant.

### Taches

| # | Tache | DoD |
|---|-------|-----|
| 6.1 | Ecran inscription | Register + auto-login + redirect. |
| 6.2 | Dark mode | Theme sombre applique a tous les ecrans. |
| 6.3 | Seance libre (sans template) | Ajouter des exercices manuellement pendant une seance. |
| 6.4 | Modifier/supprimer une serie en cours de seance | Swipe to delete, edit inline. |
| 6.5 | Gestion des erreurs reseau | Messages d'erreur clairs, retry automatique. |
| 6.6 | Loading states | Skeleton screens ou spinners partout ou il y a un appel API. |
| 6.7 | Pull-to-refresh | Rafraichir les listes en tirant vers le bas. |
| 6.8 | Validation des inputs | Poids negatif, reps a 0, etc. → messages d'erreur clairs. |

**Duree estimee** : 1-2 semaines

---

## MILESTONE 7 : OFFLINE-FIRST
**Objectif** : L'app fonctionne sans connexion internet (cas d'usage : salle de sport sans reseau).
**Demo moment** : Tu coupes le WiFi, tu fais une seance, tu reactives le WiFi, les donnees se synchronisent.

### Taches

| # | Tache | DoD |
|---|-------|-----|
| 7.1 | Installer expo-sqlite | BDD locale fonctionnelle sur le telephone. |
| 7.2 | Cache local des exercices | Les exercices sont stockes localement, affiches sans reseau. |
| 7.3 | Cache local des templates | Les templates fonctionnent hors ligne. |
| 7.4 | Sync queue pour les seances | Les seances creees offline sont mises en file d'attente. |
| 7.5 | Sync au retour du reseau | Detection reseau + envoi automatique des seances en attente. |
| 7.6 | Conflict resolution (last-write-wins) | Si un record existe des deux cotes, le plus recent gagne. |
| 7.7 | Indicateur de sync | L'utilisateur voit si des donnees sont en attente de sync. |

**Duree estimee** : 2-3 semaines

---

## MILESTONE 8 : PRODUCTION
**Objectif** : L'app est deployee, accessible au public, monitoree.
**Demo moment** : Un ami installe l'app depuis l'App Store et fait une seance.

### Taches

| # | Tache | DoD |
|---|-------|-----|
| 8.1 | Migrer vers PostgreSQL | BDD PostgreSQL locale ou Heroku Postgres. Tests OK. |
| 8.2 | Deployer le backend (Heroku ou Railway) | API accessible via URL publique HTTPS. |
| 8.3 | Configurer les variables d'env prod | SECRET_KEY, DEBUG=False, ALLOWED_HOSTS, CORS, DATABASE_URL. |
| 8.4 | Telecharger et heberger les videos sur S3 | Les 406 videos sont sur S3, servies via CloudFront. |
| 8.5 | Configurer Sentry | Erreurs backend et frontend captees et alertees. |
| 8.6 | Securite : rate limiting, HTTPS, headers | Checklist securite du SYSTEM_DESIGN.md completee. |
| 8.7 | Build EAS (Expo Application Services) | APK/IPA generes via EAS Build. |
| 8.8 | Publier sur TestFlight (iOS) | Beta testable par des vrais utilisateurs. |
| 8.9 | Publier sur App Store | App publique. |
| 8.10 | GitHub Actions CI/CD | Tests + lint + build automatiques a chaque push. |

**Duree estimee** : 1-2 semaines

---

## MILESTONE 9 (POST-MVP) : BJJ MODULE
**Objectif** : Ajouter le tracking BJJ une fois que le coeur muscu est solide.

### Taches
| # | Tache | DoD |
|---|-------|-----|
| 9.1 | Creer models BJJSession + Submission | Models, serializers, views, urls, tests. |
| 9.2 | Corriger BeltPromotion (bugs casse, label) | "WHITE" → "White", "Black" → "BLACK". |
| 9.3 | Ecran BJJ : logger une seance | Focus technique, nombre de rolls, soumissions. |
| 9.4 | Stats BJJ : ratio sub/taps, frequence | Ecran stats BJJ. |

---

## MILESTONE 10 (POST-MVP) : FEATURES AVANCEES
- Templates custom (creation par l'utilisateur)
- Exercices custom
- Stats avancees (1RM estime, intensite, progression par groupe musculaire)
- Export CSV/PDF
- Notifications push (rappels, nouveaux PRs)
- OAuth (Google + Apple Sign-In)
- Suivi poids corporel (courbe)
- Features sociales (profils publics, explorer)

---

## Timeline Estimee

```
Milestone 0 : Debloquer          [██] 2h
Milestone 1 : ETL Exercices      [████] 2j
Milestone 2 : Tests              [██████] 3j
                                              ← Semaine 1
Milestone 3 : Walking Skeleton   [██████████] 1 sem
                                              ← Semaine 2
Milestone 4 : Logger Seance      [████████████████] 2 sem
                                              ← Semaine 4
Milestone 5 : Progression        [████████████████] 2 sem
                                              ← Semaine 6
Milestone 6 : Polish MVP         [████████████] 1-2 sem
                                              ← Semaine 7-8
Milestone 7 : Offline-First      [██████████████████] 2-3 sem
                                              ← Semaine 10
Milestone 8 : Production         [████████████] 1-2 sem
                                              ← Semaine 11-12

TOTAL ESTIME : 10-14 semaines (2.5-3.5 mois)
pour un developpeur solo a temps partiel
```

---

## Comparaison avec l'ancienne TODOLIST.md

| Aspect | TODOLIST.md (ancien) | ROADMAP.md (nouveau) |
|--------|---------------------|---------------------|
| **Approche** | Horizontale (par couche) | Verticale (par feature) |
| **Premiere feature livrable** | Apres Phase 4 (~40 taches) | Milestone 3 (~6 taches) |
| **Frontend** | Phase 8 (apres tout le backend) | Milestone 3 (apres les tests) |
| **BJJ** | Phase 2 (avant meme Lift) | Milestone 9 (post-MVP) |
| **Nutrition** | Phase 3 (avant Lift) | Pas dans le MVP |
| **Tests** | Phase 6 (apres tout le code) | Milestone 2 (avant le frontend) |
| **Demo moment** | Aucun avant Phase 8 | A chaque milestone |
| **WIP** | 76 taches en vrac | Max 1 milestone a la fois |

**Changement cle** : l'ancienne approche construisait 4 backends complets avant de toucher au frontend. La nouvelle approche livre un flow utilisable (muscu) le plus tot possible, puis itere.

---

## Ce a quoi je n'ai pas pense

- **Fatigue de decision** : 10 milestones c'est beaucoup a visualiser. En pratique, ne regarde que le milestone en cours. Les futurs milestones vont changer quand tu auras du feedback reel.
- **Risque technique frontend** : Si tu n'as jamais fait de React Native, le Milestone 3 pourrait prendre 2-3 semaines au lieu d'une. Prevois un spike de 2h pour explorer Expo avant de commencer.
- **Scope creep** : Chaque milestone va generer des idees ("et si j'ajoutais..."). Note-les dans un fichier `IDEAS.md` mais ne les fais pas avant d'avoir termine le milestone en cours.
- **Burnout** : 3 mois en solo sur un side-project c'est long. Planifie des semaines off. Un projet abandonne ne sert personne.
- **Beta testeurs** : Le Milestone 8 dit "un ami installe l'app". Identifie 3-5 beta testeurs MAINTENANT, pas au moment de publier. Leur feedback va orienter le Milestone 6 (polish).
