# WORKFLOW_SOLO.md - TRAVAILLER SEUL SANS IA

**Date** : 07/06/2026
**Objectif** : Un guide complet pour developper Lift en autonomie. Comment prendre des decisions, debloquer un probleme, organiser son temps, et progresser — sans demander a une IA.

---

## 1. Pourquoi ce document existe

Tu apprends a coder pour devenir autonome, pas pour devenir bon a poser des questions a une IA. Ce document est une **boite a outils** pour les moments ou tu es seul face au code.

---

## 2. La Routine Quotidienne

### 2.1 Avant de coder (5 min)

Ouvre un fichier `JOURNAL.md` (ou un carnet physique) et reponds a 3 questions :

```
## 2026-06-07

**Hier** : Corrige le modele Exercise. Migration creee et appliquee.
**Aujourd'hui** : Commencer import_hevy.py — phase EXTRACT.
**Blocage** : Aucun pour l'instant.
```

Ca parait idiot. C'est le truc le plus utile que tu puisses faire. Ca force ton cerveau a se connecter au contexte avant de toucher au code. Ca remplace le standup meeting que tu n'as pas.

### 2.2 Pendant le code

**Regle du Pomodoro modifie** :
- 45 min de code concentre (pas 25 — le code a besoin de plus de montee en charge)
- 10 min de pause (vraie pause : pas Twitter, pas Discord, pas YouTube)
- Apres 3 sessions : pause longue 20 min

**Regle du WIP=1** :
- Tu travailles sur UNE tache. Pas deux. Pas "je commence ca en attendant que ca compile".
- Si tu es tente de faire autre chose, note-le dans `IDEAS.md` et reviens a ta tache.

### 2.3 Apres le code (5 min)

Mets a jour ton journal :

```
**Fait** : import_hevy.py phase EXTRACT terminee. Les 2 JSON chargent correctement.
**Blocage rencontre** : json.load() plantait sur un caractere unicode. Resolu en ajoutant encoding='utf-8'.
**Demain** : Phase TRANSFORM — mapping des muscle groups.
**Temps passe** : 2h
```

Le "temps passe" est crucial. Sans ca, tu n'as aucune idee de ta vitesse reelle. Apres 1 mois, tu sauras estimer combien de temps prend une tache.

---

## 3. Comment Debloquer un Probleme

### 3.1 L'Echelle de Deblocage (dans cet ordre)

```
NIVEAU 1 : Lire l'erreur (30 sec)
    → 80% des bugs sont dans le message d'erreur. Lis TOUT le traceback, pas juste la derniere ligne.

NIVEAU 2 : print() debug (2 min)
    → Ajoute des print() avant et apres la ligne qui plante. Regarde les valeurs.
    → Django : self.stdout.write() dans les management commands.
    → DRF : print(serializer.errors) quand un serializer refuse les donnees.

NIVEAU 3 : Documentation officielle (5-15 min)
    → Django : docs.djangoproject.com (cherche le nom exact de la classe/methode)
    → DRF : django-rest-framework.org
    → React Native : reactnative.dev
    → Expo : docs.expo.dev
    → Python : docs.python.org

NIVEAU 4 : Reproduire le probleme minimal (15-30 min)
    → Ouvre un shell Django : python manage.py shell
    → Reproduis le bug avec le minimum de code possible.
    → Si tu peux le reproduire en 3 lignes, tu es a 90% de la solution.

NIVEAU 5 : Recherche web ciblee (15-30 min)
    → Copie le message d'erreur EXACT dans Google/DuckDuckGo.
    → Ajoute le nom du framework : "django CharField max_length required"
    → Stack Overflow : lis les REPONSES ACCEPTEES et les COMMENTAIRES (souvent plus utiles).
    → GitHub Issues : cherche dans le repo du framework.

NIVEAU 6 : Rubber Duck Debugging (10 min)
    → Explique le probleme A VOIX HAUTE. A un objet. A un mur. A ton chat.
    → "J'essaie de faire X. Je m'attends a Y. Mais j'obtiens Z. J'ai verifie A, B, C."
    → Le fait de formuler le probleme clairement declenche souvent la solution.

NIVEAU 7 : Prendre du recul (1h-1 jour)
    → Arrete de coder. Va marcher. Dors dessus.
    → Ton cerveau continue de travailler en arriere-plan (c'est scientifiquement prouve : "incubation effect").
    → 90% des bugs "impossibles" se resolvent le lendemain matin sous la douche.

NIVEAU 8 : Demander de l'aide (humain)
    → Stack Overflow : poste une question (avec code minimal, erreur exacte, ce que tu as deja essaye).
    → Discord/Reddit : r/django, r/reactnative, r/learnprogramming
    → Formule ta question avec le format "XY Problem" :
      "Je veux faire X. J'ai essaye Y. Voici l'erreur Z. Voici mon code."
```

### 3.2 Les Erreurs les Plus Frequentes (Django/DRF)

| Erreur | Cause probable | Ou chercher |
|--------|---------------|-------------|
| `ImportError: No module named X` | Module pas installe ou mauvais venv | `pip install X`, verifier que le venv est active |
| `FieldError: Unknown field(s)` | Champ dans le serializer qui n'existe pas dans le model | Comparer serializer fields avec model fields |
| `IntegrityError: UNIQUE constraint` | Doublon en BDD | Verifier les champs `unique=True` |
| `TypeError: X is not JSON serializable` | UUID, datetime, ou Decimal dans la reponse | Ajouter un serializer ou utiliser `str()` |
| `OperationalError: no such table` | Migration pas appliquee | `python manage.py migrate` |
| `RelatedObjectDoesNotExist` | FK pointe vers un objet supprime | Verifier `on_delete` et les donnees en BDD |
| `ValidationError: This field is required` | Champ obligatoire manquant dans la requete | Verifier `blank=True` / `required=False` |
| `403 Forbidden` | Permission refusee | Verifier `permission_classes` du ViewSet |
| `401 Unauthorized` | Token JWT manquant ou expire | Verifier le header `Authorization: Bearer <token>` |
| `405 Method Not Allowed` | Mauvaise methode HTTP (GET au lieu de POST) | Verifier la route et le ViewSet |

### 3.3 Les Outils de Debug

| Outil | Quand l'utiliser | Comment |
|-------|------------------|---------|
| **Django Shell** | Tester des requetes, des models | `python manage.py shell` |
| **print()** | Debug rapide | `print(type(x), x)` |
| **breakpoint()** | Debug interactif | Ajouter `breakpoint()` dans le code, le terminal s'arrete la |
| **Django Debug Toolbar** | Voir les queries SQL, le temps de reponse | `pip install django-debug-toolbar` |
| **Postman / HTTPie** | Tester les endpoints API | Envoyer des requetes manuellement |
| **SQLite Browser** | Voir la BDD directement | DB Browser for SQLite (app gratuite) |
| **`manage.py check`** | Verifier la config Django | Detecte les erreurs avant de lancer le serveur |
| **`manage.py showmigrations`** | Voir l'etat des migrations | Savoir quelles migrations sont appliquees |

---

## 4. Comment Prendre une Decision Technique

### 4.1 La Methode des 3 Options

Quand tu hesites entre deux approches, force-toi a en trouver 3 :

```
DECISION : Comment stocker secondary_muscle_groups ?

OPTION A : CharField avec virgules ("triceps,shoulders")
  (+) Simple
  (-) Pas queryable, pas de validation

OPTION B : JSONField (["triceps", "shoulders"])
  (+) Structure propre, queryable en PostgreSQL
  (-) Pas de validation au niveau BDD

OPTION C : ManyToMany vers une table MuscleGroup
  (+) Normalise, queryable, relations propres
  (-) Plus complexe, plus de queries

CHOIX : Option B — bon compromis pour le MVP. Migrer vers C si besoin.
POURQUOI : JSONField est supporte par SQLite et PostgreSQL. Ca couvre le besoin
sans ajouter de complexite (une table + un through model en plus).
```

Ecris cette decision dans ton journal ou dans un fichier `DECISIONS.md`. Dans 3 mois, tu te demanderas "pourquoi j'ai choisi JSONField ?". La reponse sera la.

### 4.2 La Regle des 15 Minutes

Si tu hesites sur une decision technique depuis plus de 15 minutes, c'est que les deux options sont probablement equivalentes. Choisis la plus simple et avance. Tu pourras toujours changer plus tard.

Les seules decisions qui meritent plus de 15 minutes sont celles qui sont **couteuses a reverser** :
- Choix de BDD (SQLite → PostgreSQL = migration douloureuse)
- Choix de PK (auto-increment → UUID = migration de toutes les FK)
- Choix d'auth (session → JWT = changement de toute la logique frontend)
- Choix de framework (Django → FastAPI = rewrite total)

Pour tout le reste : decide et avance.

### 4.3 La Recherche d'Information

Quand tu cherches comment faire quelque chose :

**Niveau 1 — La doc officielle (toujours commencer ici)**
```
"django jsonfield" → docs.djangoproject.com/en/5.1/ref/models/fields/#jsonfield
"drf pagination" → django-rest-framework.org/api-guide/pagination/
"expo router tabs" → docs.expo.dev/router/advanced/tabs/
```

**Niveau 2 — La recherche ciblee**
```
Bons termes de recherche :
  "django rest framework custom permission example"
  "expo router authentication flow 2026"
  "react native flatlist pull to refresh"

Mauvais termes de recherche :
  "how to make an app" (trop vague)
  "django help" (trop vague)
  "best way to do X" (subjective, reponses obsoletes)
```

**Niveau 3 — Le code source**
Quand la doc ne suffit pas, lis le code source du framework. C'est intimidant au debut, mais c'est la source de verite ultime.
```
# Trouver ou Django definit JSONField :
pip show django  → Location: .../site-packages/django
# Puis chercher dans le code :
# django/db/models/fields/json.py
```

---

## 5. Comment Faire une Code Review de Soi-Meme

### 5.1 La Checklist de Review

Avant chaque commit, relis ton diff (`git diff --staged`) et verifie :

**Fonctionnel**
- [ ] Le code fait ce qu'il est cense faire
- [ ] Les edge cases sont geres (null, vide, negatif, trop long)
- [ ] Les erreurs sont attrapees proprement

**Securite**
- [ ] Pas de secret en dur (cle API, mot de passe)
- [ ] Les permissions sont verifiees (IsOwner, IsAuthenticated)
- [ ] Les inputs utilisateur sont valides (serializer, validators)

**Qualite**
- [ ] Les noms de variables/fonctions sont clairs
- [ ] Pas de code mort (commente, inutilise)
- [ ] Pas de print() de debug oublie
- [ ] Les imports sont propres (pas d'import inutile)

**Django specifique**
- [ ] Les migrations sont creees si le model a change
- [ ] Les champs nullable ont `blank=True, null=True`
- [ ] Les FK ont un `on_delete` explicite et reflechi
- [ ] Le serializer expose les bons champs (pas de fuite de donnees)

### 5.2 La Technique du "Diff du Lendemain"

Ne commite pas immediatement. Laisse le code reposer une nuit. Le lendemain, relis le diff avec des yeux frais. Tu verras des choses que tu n'avais pas vues la veille :
- Un nom de variable ambigu
- Un cas non gere
- Un pattern duplique
- Une simplification possible

C'est l'equivalent solo de la code review en equipe.

### 5.3 Le Test Manuel Systematique

Avant chaque commit, teste manuellement :

```
1. python manage.py check          → pas d'erreur de config
2. python manage.py migrate        → migrations a jour
3. python manage.py test           → tests passent
4. python manage.py runserver      → le serveur demarre
5. Postman : tester l'endpoint modifie → reponse correcte
```

Ca prend 2 minutes. Ca evite de commiter du code casse.

---

## 6. Comment Apprendre Efficacement

### 6.1 La Pyramide de l'Apprentissage

```
                    /\
                   /  \
                  / 5% \          Lire (docs, articles)
                 /______\
                / 10%    \        Regarder (videos, tutos)
               /__________\
              / 20%        \      Voir une demo
             /______________\
            / 50%            \    Discuter / Expliquer
           /__________________\
          / 75%                \  Pratiquer (coder soi-meme)
         /______________________\
        / 90%                    \  Enseigner / Ecrire
       /__________________________\
```

**Lire la doc** = 5% de retention. **Coder soi-meme** = 75%. **Expliquer a quelqu'un** = 90%.

C'est pour ca que le CLAUDE.md dit "tu ne codes pas a ma place". Copier-coller du code d'une IA = 5% de retention. Ecrire le code toi-meme apres avoir compris le concept = 75%.

### 6.2 La Technique Feynman

Pour vraiment comprendre un concept :

1. **Etudie-le** (docs, tutoriel)
2. **Explique-le comme a un debutant** (par ecrit, dans ton journal)
3. **Identifie les trous** (ou tu bloques dans l'explication = ce que tu ne comprends pas vraiment)
4. **Retourne aux sources** pour combler les trous
5. **Simplifie** ton explication

Exemple :
```
CONCEPT : Les permissions DRF

EXPLICATION SIMPLE :
Quand une requete arrive sur un endpoint, DRF verifie les permissions AVANT
d'executer la view. C'est une liste de classes. Chaque classe a une methode
has_permission() qui retourne True ou False. Si UNE classe retourne False,
la requete est refusee (403).

TROU IDENTIFIE :
Quelle est la difference entre has_permission() et has_object_permission() ?
→ has_permission() : verifie l'acces a la VUE (ex: "est-il connecte ?")
→ has_object_permission() : verifie l'acces a UN OBJET (ex: "est-ce SA seance ?")
→ has_object_permission() n'est appele que sur les actions de detail (retrieve, update, delete)
```

### 6.3 Les Ressources par Niveau

**Debutant Django/DRF :**
- Django Tutorial officiel (docs.djangoproject.com/en/5.1/intro/tutorial01/)
- DRF Tutorial (django-rest-framework.org/tutorial/quickstart/)
- "Django for Beginners" — William S. Vincent (livre)

**Intermediaire :**
- "Two Scoops of Django" — Feldman & Greenfeld (bonnes pratiques)
- "Django REST Framework" section de la doc officielle (chaque page, une par une)
- Classy Django REST Framework (cdrf.co) — reference visuelle de toutes les classes DRF

**Avance :**
- Code source de Django (github.com/django/django)
- Code source de DRF (github.com/encode/django-rest-framework)
- "Architecture Patterns with Python" — Harry Percival & Bob Gregory

**React Native / Expo :**
- Expo docs (docs.expo.dev) — suivre le tutorial "Get Started"
- React Native docs (reactnative.dev/docs/getting-started)
- "Fullstack React Native" — Devin Abbott

---

## 7. Gestion du Temps et de l'Energie

### 7.1 Le Planning Hebdomadaire

```
LUNDI    : Code (milestone en cours)
MARDI    : Code (suite)
MERCREDI : Code + review du code de la semaine
JEUDI    : Code (suite)
VENDREDI : Tests + documentation + retrospective
SAMEDI   : Side quest (apprendre un concept, lire un article, spike technique)
DIMANCHE : OFF (zero code)
```

Le dimanche OFF n'est pas optionnel. Le cerveau a besoin de repos pour consolider ce qu'il a appris. Coder 7/7 c'est le chemin le plus court vers le burnout et l'abandon du projet.

### 7.2 La Retrospective Hebdomadaire (15 min le vendredi)

```
## Retro semaine 23

**Ce qui a marche** :
- Le pipeline ETL est termine en 2 jours au lieu de 3.
- Les tests ont reveille un bug dans le serializer.

**Ce qui n'a pas marche** :
- J'ai passe 3h sur un bug de migration qui etait juste un cache __pycache__ perime.
- J'ai commence a modifier les permissions alors que je devais faire les tests.

**Ce que je change** :
- Supprimer __pycache__ avant de debugger les migrations.
- Respecter le WIP=1 : finir les tests AVANT de toucher aux permissions.

**Vitesse** :
- Taches prevues : 5
- Taches terminees : 3
- Ratio : 60% — je surestime ma capacite, prevoir moins la semaine prochaine.
```

### 7.3 Les Ennemis de la Productivite

| Ennemi | Symptome | Solution |
|--------|----------|----------|
| **Scope creep** | "Et si j'ajoutais aussi..." | Ecris dans IDEAS.md. Reviens a ta tache. |
| **Perfectionnisme** | Refactorer 3 fois avant de commit | Le code qui marche > le code parfait. Commit, puis ameliore. |
| **Tutorial hell** | Regarder des tutos sans coder | Ferme le tuto. Ouvre ton editeur. Code. |
| **Comparaison** | "Lui il a fait ca en 2 semaines" | Tu apprends. Il a 5 ans d'experience. Compare-toi a toi d'il y a 1 mois. |
| **Arret prolonge** | 4 mois sans coder (comme Lift) | Relis ton journal. Fais une micro-tache (5 min). L'inertie est l'ennemi. |
| **Multitasking** | 3 branches, 5 fichiers ouverts | Ferme tout. Un fichier. Une tache. |
| **Over-engineering** | Abstractions, design patterns partout | YAGNI. La solution la plus simple qui marche. |

### 7.4 Comment Reprendre Apres un Arret

C'est exactement ta situation (4 mois sans coder). Voici le protocole :

```
JOUR 1 : Relire (zero code)
  - Relis AUDIT.md, ROADMAP.md, ton journal
  - Regarde git log pour te rappeler ou tu en etais
  - Note ce qui a change dans ta vie (plus ou moins de temps dispo)

JOUR 2 : Micro-tache (30 min max)
  - Fais la tache la plus petite possible (corriger un bug d'1 ligne)
  - Le but n'est pas la productivite, c'est de RECASSER LA GLACE
  - Commit. Pousse. Tu as un point vert sur GitHub.

JOUR 3 : Session normale
  - Tu es de retour. Reprends le rythme normal.
```

L'erreur classique : vouloir "rattraper le temps perdu" en codant 10h le premier jour. Ca ne marche pas. Tu vas te decourager et arreter a nouveau.

---

## 8. Git en Solo : Les Habitudes qui Sauvent

### 8.1 Les Commandes Quotidiennes

```bash
# Avant de coder
git status                    # Ou j'en suis ?
git log --oneline -5          # Derniers commits ?

# Pendant le code
git diff                      # Qu'est-ce que j'ai change ?
git add <fichier specifique>  # Pas "git add ." (trop dangereux)
git commit -m "message clair"

# Fin de journee
git push origin main          # Sauvegarder sur GitHub
```

### 8.2 Les Messages de Commit

Format : `type: description courte`

```
feat: add video_url field to Exercise model
fix: correct DEBUG string-to-bool conversion in settings
refactor: extract muscle group mapping to constant dict
test: add auth endpoint integration tests
docs: update ROADMAP with milestone 4 details
chore: generate requirements.txt
```

Types :
- `feat` : nouvelle fonctionnalite
- `fix` : correction de bug
- `refactor` : changement de code sans changement de comportement
- `test` : ajout ou modification de tests
- `docs` : documentation
- `chore` : maintenance (dependances, config, fichiers de build)

### 8.3 Les Branches (optionnel en solo, recommande)

```
main                          # Toujours stable, toujours deployable
  |-- feat/import-hevy        # Feature en cours
  |-- fix/debug-string        # Bug fix rapide
```

Workflow :
1. `git checkout -b feat/import-hevy`
2. Code, commit, code, commit
3. `git checkout main && git merge feat/import-hevy`
4. `git branch -d feat/import-hevy`

En solo, tu peux travailler sur `main` directement si tu es discipline. Mais les branches te protegent : si tu casses tout, `main` est intact.

---

## 9. Les Signaux d'Alerte

### 9.1 Signaux que tu as un Probleme

| Signal | Ce que ca veut dire | Action |
|--------|--------------------| ------|
| Tu n'as pas commite depuis 3 jours | Ta tache est trop grosse | Decoupe en sous-taches plus petites |
| Tu as 5 fichiers modifies non commites | Tu fais plusieurs choses a la fois | Commit ce qui est fini. Stash le reste. |
| Tu lis le meme tutoriel pour la 3e fois | Tu ne comprends pas le concept | Change d'approche : essaie de coder sans comprendre a 100%, le code va clarifier |
| Tu changes d'avis sur l'architecture tous les jours | Tu n'as pas assez d'information | Fais un spike : code un prototype jetable en 2h |
| Tu ne sais plus ou tu en es | Pas de journal, pas de tracking | Ouvre JOURNAL.md. Ecris ou tu en es. Maintenant. |
| Tu trouves des excuses pour ne pas coder | Fatigue, ennui, peur de casser | Micro-tache de 5 min. Juste 5 min. |

### 9.2 Signaux que tu Progresses

| Signal | Ce que ca veut dire |
|--------|---------------------|
| Tu lis un message d'erreur et tu sais ou chercher | Tu developpes des reflexes |
| Tu ecris un test avant le code (meme parfois) | Tu penses en termes de comportement attendu |
| Tu refactores sans casser les tests | Tu as un filet de securite |
| Tu estimes une tache et tu tombes a ±30% | Tu connais ta vitesse |
| Tu lis le code source d'un framework et tu comprends | Tu depasses le niveau "utilisateur" |
| Tu expliques un concept a quelqu'un et il comprend | Tu maitrises le sujet |

---

## 10. Templates Utiles

### 10.1 Template JOURNAL.md

```markdown
# Journal de Developpement — Lift

## 2026-06-07
**Milestone** : 0 — Debloquer le projet
**Hier** : Rien (reprise apres 4 mois)
**Aujourd'hui** : Corriger models.py, creer migration, requirements.txt
**Blocage** : Aucun
**Temps** : 1.5h
**Fait** :
- [x] exercise_type = CharField avec choices
- [x] video_url blank=True null=True
- [x] external_id max_length=50
- [x] secondary_muscle_groups → JSONField
- [x] Migration creee et appliquee
- [x] requirements.txt genere
**Apprentissage** : JSONField fonctionne avec SQLite depuis Django 3.1
```

### 10.2 Template DECISIONS.md

```markdown
# Decisions Techniques — Lift

## DEC-001 : Stockage secondary_muscle_groups (2026-06-07)
**Contexte** : Un exercice peut cibler 0 a N groupes musculaires secondaires.
**Options** :
  A. CharField avec virgules → simple mais pas queryable
  B. JSONField → structure propre, queryable en PostgreSQL
  C. ManyToMany → normalise mais complexe
**Decision** : Option B (JSONField)
**Raison** : Bon compromis complexite/fonctionnalite pour le MVP.
**Consequence** : Les queries de filtrage par secondary muscle group
                  seront moins performantes qu'avec un ManyToMany.
```

### 10.3 Template IDEAS.md

```markdown
# Idees — Lift
(A trier et prioriser quand un milestone est termine)

- [ ] Superset mode : enchainer deux exercices sans pause
- [ ] Export CSV des seances
- [ ] Widget iOS pour voir le prochain entrainement
- [ ] Partager un template de seance par lien
- [ ] Mode "PR alert" avec animation quand tu bats un record
```

### 10.4 Template RETRO.md

```markdown
# Retrospectives — Lift

## Semaine 23 (02/06 - 08/06/2026)
**Milestone** : 0 → 1
**Taches prevues** : 5 | **Terminees** : 3 | **Ratio** : 60%

**Ce qui a marche** :
- ...

**Ce qui n'a pas marche** :
- ...

**Ce que je change** :
- ...
```

---

## 11. Checklist "Suis-je Pret a Travailler Sans IA ?"

Avant de fermer ce document et de coder, verifie que tu as :

- [ ] Un editeur configure (VS Code + extensions Python, Django, ESLint)
- [ ] La doc officielle Django en favori dans ton navigateur
- [ ] La doc officielle DRF en favori
- [ ] Un client API installe (Postman, Insomnia, ou HTTPie en terminal)
- [ ] Un viewer SQLite installe (DB Browser for SQLite)
- [ ] Un fichier JOURNAL.md cree (meme vide)
- [ ] Un fichier IDEAS.md cree (meme vide)
- [ ] Le reflexe de lire le message d'erreur COMPLET avant de chercher sur Google
- [ ] Le reflexe de commiter souvent (minimum 1 commit par session de code)
- [ ] Le reflexe de tester manuellement avant de commiter

Tu n'as pas besoin de tout maitriser. Tu as besoin de savoir **ou chercher** et d'avoir la **discipline** de suivre un processus. Le reste vient avec la pratique.

---

## 12. Ce a quoi je n'ai pas pense

### La solitude du dev solo
- **Syndrome de l'imposteur** : "Je suis nul, les vrais devs ne bloquent pas sur ca." Faux. Tout le monde bloque. La difference c'est la methode de deblocage, pas l'absence de blocage.
- **Absence de feedback** : En equipe, un collegue te dit "bon boulot" ou "attention, ca risque de casser X". En solo, tu n'as aucun feedback. Solution partielle : tiens un journal public (blog, Twitter/X, r/learnprogramming). Le feedback viendra des lecteurs.
- **Decisions sans validation** : En equipe, une code review attrape les erreurs. En solo, personne ne relit ton code. Les templates de review (section 5) et la technique du "diff du lendemain" compensent partiellement, mais c'est la faiblesse structurelle du dev solo.

### Le risque de l'outil unique
- Tu connais Django. Tu vas vouloir tout faire avec Django. Mais certaines choses sont mieux faites autrement (un script Python pur pour l'ETL, un notebook Jupyter pour explorer les donnees, un simple fichier JSON pour la config). Ne force pas Django dans chaque probleme.

### La vraie competence senior
- Un dev senior ne connait pas toutes les reponses. Il connait toutes les **questions a poser**. Il sait quand un probleme est simple (chercher 5 min) et quand il est complexe (passer 2h a investiguer). Cette intuition se developpe uniquement avec la pratique — pas avec les tutos, pas avec l'IA. C'est pour ca que coder toi-meme est non-negociable.
