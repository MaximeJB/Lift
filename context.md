# Contexte du projet Lift

> **But de ce fichier** : éviter de redécouvrir la structure du projet à chaque session.
> Chaque ligne ici remplace une exploration — un `grep`, une lecture de fichier, un
> `ls`. Si une information ne fait pas gagner au moins un appel d'outil, elle n'a rien à
> faire ici : elle coûte des tokens à chaque requête sans jamais en économiser.
>
> **Ce fichier doit rester stable.** Il est lu au début de chaque session, donc il fait
> partie du préfixe mis en cache. Toute modification invalide ce cache. N'y mets donc
> jamais un nombre de tests, un pourcentage de couverture ou une liste de tâches — ça
> change tous les jours, et l'état courant vit déjà dans `.devtool/features/`.

---

## Ce qu'est Lift

Application de suivi de musculation. React Native (Expo) côté client, Django REST
Framework côté serveur. Projet d'apprentissage visant un niveau senior, destiné à être
publié sur l'App Store.

Deux domaines existent en base mais **sont hors périmètre V1** : `bjjapp` et `nutrition`.
Ne pas y toucher.

## Stack

| | |
|---|---|
| Backend | Django 5.2 · DRF · SimpleJWT · django-filter · SQLite en dev |
| Frontend | Expo SDK 54 · React Native 0.81 · React 19.1 · expo-router · NativeWind v4 |
| Tests | pytest + pytest-django · jest-expo + @testing-library/react-native v14 |
| Environnement | Windows · PowerShell · venv dans `venv/` (pas `.venv/`) |

## Carte du dépôt

```
Lift/                    réglages Django — settings.py, urls.py
accounts/                utilisateur, authentification, JWT
liftapp/                 exercices, séances, séries, programmes
  management/commands/   import_exercices, import_hevy, dl_exo
data/                    fichiers sources de l'import
frontend/
  app/                   routes expo-router — UN FICHIER = UNE ROUTE
  src/shared/            client HTTP, contextes, composants, tokens
  src/workout/           services et composants métier
  src/ecrans/            tests des écrans (voir le piège plus bas)
  tokens/                primitives.json + semantic.json + MAPPING.md
.devtool/features/       kanban — cartes à faire, numérotées 01 à N
.devtool/features/done/  cartes terminées
```

## API

Toutes les routes sont préfixées dans `Lift/urls.py`.

**`/api/auth/`** — quatre routes seulement, dans `accounts/urls.py` :
`login/` · `token/refresh/` · `register/` · `me/`

Il n'existe **ni changement de mot de passe, ni suppression de compte, ni export, ni
réinitialisation**. Ces quatre manques sont des cartes du kanban, pas des oublis à
combler d'autorité.

**`/api/lift/`** — cinq ViewSets enregistrés sur un `SimpleRouter` :
`exercise` · `workout_template` · `template_exercise` · `workout_session` · `set`

## Modèles

`accounts` : `CustomUser` (email comme identifiant, `pseudo` unique et public,
`pseudo_updated_at` pour la fenêtre glissante de 30 jours).

`liftapp` : `MuscleGroup` · `Exercise` · `WorkoutTemplate` · `TemplateExercise` ·
`WorkoutSession` · `Set` · `ProgramType`.

Deux pièges déjà payés :
- **`WorkoutSession.start_time` est un `DateTimeField`**, pas un `TimeField`. Il attend
  un instant ISO complet. Envoyer `14:32:05` donne un 400.
- **`Set.weight_kg` et `Set.reps` sont bornés à 0**, pas à 1. Le poids du corps se logue
  à 0 kg, et une série à 0 répétition est acceptée — c'est une décision produit.

## Les treize écrans

La spec figée est `LIFT_Specification_Interface_V1.md`. Elle fait autorité sur les états
et les cas limites : vérifier contre ses critères d'acceptation, pas contre son goût.

| Spec | Fichier |
|---|---|
| A2 connexion | `app/(auth)/login.tsx` |
| A3 inscription | `app/(auth)/register.tsx` |
| A4 mot de passe oublié | `app/(auth)/forgot-password.tsx` — **squelette** |
| B1 accueil | `app/(tabs)/index.tsx` |
| C1 catalogue · C3 séances | `app/(tabs)/lift/index.tsx` — deux segments |
| C2 détail exercice | `app/(tabs)/lift/[id].tsx` |
| C4 détail programme | `app/(tabs)/lift/template/[id].tsx` — **squelette** |
| C5 séance active | `app/(tabs)/lift/seance.tsx` |
| C6 finalisation | `app/(tabs)/lift/finaliser.tsx` |
| C8 séance passée | `app/(tabs)/lift/historique/[id].tsx` |
| D1 profil | `app/(tabs)/profile.tsx` |

`app/cgu.tsx` et `app/confidentialite.tsx` existent mais affichent « contenu à rédiger ».

## Commandes

```powershell
# lancer — deux terminaux
python manage.py runserver 0.0.0.0:8000   # le 0.0.0.0 est obligatoire pour le téléphone
cd frontend ; npm start                    # scanner le QR avec l'appareil photo

# vérifier — avant de considérer une tâche terminée
python -m pytest -q
cd frontend ; npm run lint ; npm run check:classes ; npx tsc --noEmit ; npm run test:coverage
```

L'IP de la machine est dans `ALLOWED_HOSTS` (`.env` racine) **et** dans
`EXPO_PUBLIC_API_URL` (`frontend/.env`). Changer de réseau impose de corriger les deux,
puis de relancer avec `npm start -- -c` pour vider le cache Metro.

## Pièges vérifiés

Chacun a coûté du temps une fois. Aucun n'est deviné.

**Le thème Tailwind est fermé** (`theme`, pas `theme.extend`). Une classe hors tokens ne
lève aucune erreur — elle est silencieusement ignorée. Une classe qui semble manquer est
un token manquant : le signaler, jamais contourner. Les classes doivent apparaître en
toutes lettres dans le source, le scanner lit le texte.

**Les tests d'écran vivent dans `src/ecrans/`, pas à côté des écrans.** expo-router
transforme tout fichier de `app/` en route : un `login.test.tsx` posé là deviendrait une
page de l'application. `testMatch` ne couvre donc que `src/`.

**RNTL v14 : `render()` renvoie une promesse.** Il faut l'attendre. Ne jamais appeler
`cleanup()` à la main — ça casse tous les rendus suivants du fichier. Envelopper
`unmount()` et `fireEvent` dans `act`.

**Jest retire du groupe `global` tout fichier couvert par un seuil nommé.** Le chiffre du
seuil global et celui du rapport ne coïncident donc jamais, et ce n'est pas un bug.

**`jest.mock` n'autorise dans sa fabrique que les variables préfixées `mock`.** Sinon :
`ReferenceError: Invalid variable access`.

**Les écrans écrivent `&apos;`**, une apostrophe droite. Un matcher de test avec une
apostrophe typographique ne trouvera rien.

**PowerShell 5.1 n'a pas `&&`.** Utiliser `;` ou `if ($?) { }`.

**`InputAccessoryView` ne rend rien** sur la nouvelle architecture React Native, qui est
active. La fermeture du clavier passe par des écouteurs `Keyboard` et
`keyboardDismissMode="on-drag"`.

## Où trouver le reste

| | |
|---|---|
| Règles de travail, protocole d'aide | `CLAUDE.md` (racine) et `frontend/CLAUDE.md` |
| Barème anti-slop visuel | `SLOP.md` |
| Grille d'écriture des textes publics | `SLOP-ECRITURE.md` |
| Décisions closes, à ne pas rouvrir | `SLOP.md`, section décisions |
| Traçabilité des tokens vers les écrans | `frontend/tokens/MAPPING.md` |
| État courant, tâches restantes | `.devtool/features/`, cartes numérotées |
