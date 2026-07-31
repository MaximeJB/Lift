# LIFT — Spécification Interface V1

> Documentation exhaustive des écrans, comportements, règles métier et dépendances techniques pour l'implémentation React Native de la V1 de Lift.
> **Périmètre couvert** : Authentification, Home, Lift (musculation), Profil.
> **Exclus de la V1** (décision validée) : BJJ, Nutrition, fonctionnalités sociales.

---

## Phase 0 — Product Understanding Report

### 1. Résumé produit

Lift est une application mobile de suivi sportif orientée données ("dashboard stats-friendly"), ciblant deux disciplines : musculation/powerlifting et BJJ. Différenciateur revendiqué face à Hevy (concurrent principal) : profondeur analytique (volume load, 1RM estimé, PRs) et support natif BJJ. Vision offline-first (architecture préparée mais non implémentée). Modèle freemium prévu post-MVP. Cible technique : React Native (Expo) + Django REST Framework + JWT.

### 2. Ce que l'audit a établi

**État réel du backend (vérifié directement dans le code)** :

- `liftapp/models.py` est corrigé et enrichi — contrairement à ce que décrivent plusieurs documents d'architecture datés du 07-08/06/2026 (`SYSTEM_DESIGN.md`, `00_ANALYSE.md`, `02_BACKLOG.md`, `ROADMAP.md`), qui décrivaient un modèle cassé (SyntaxError). Le modèle `Exercise` inclut désormais un modèle `MuscleGroup` (M2M) pour `secondary_muscle_groups`, ainsi qu'un modèle `ProgramType`.

- Milestones 0 (déblocage), 1 (ETL Hevy), 2 (tests — 71 tests, 100% coverage app) sont faits, confirmés par l'historique git et `.devtool/features/done/`.

- Milestone 3 (frontend walking skeleton) est planifié en détail (11 tâches dans `.devtool/features/`) mais non démarré : aucun dossier `frontend/`, aucun `package.json` dans le dépôt au moment de l'audit.

- 0 `WorkoutTemplate`, 0 `WorkoutSession`, 0 `Set` en base au moment de l'audit — traité comme prérequis à lever avant l'implémentation de l'écran de sélection de template.

- API : endpoints flat sous `/api/auth/`, `/api/lift/`, `/api/bjj/`, `/api/nutrition/` (pas de `/api/v1/`). Pagination `LimitOffsetPagination` (25/page). Permissions `IsOwner` via filtrage `get_queryset()`.

- Auth JWT fonctionnelle (register/login/refresh/me). OAuth Google/Apple configuré mais non testé, reporté post-MVP.

- Bugs de sécurité connus non corrigés au moment de l'audit : `DEBUG = os.environ["DEBUG"]` (bug string truthy), `DEFAULT_PERMISSION_CLASSES = AllowAny` par défaut, `ACCESS_TOKEN_LIFETIME = 180 min`, `BLACKLIST_AFTER_ROTATION = False`, pas de rate limiting.

### 3. Sources utilisées

`CLAUDE.md`, `Spec.md`, `docs/SYSTEM_DESIGN.md`, `docs/ROADMAP.md`, `docs/METHODES.md`, `docs/WORKFLOW_SOLO.md`, `docs/produit/00_ANALYSE.md` à `07_VERTICAL_SLICING.md`, `TODOLIST.md`, tous les fichiers `.devtool/features/*.md`, historique git, et lecture directe du code (`accounts/`, `liftapp/`, `bjjapp/`, `nutrition/`, `Lift/settings.py`, `Lift/urls.py`).

### 4. Décisions existantes respectées

- Stack frontend : React Native + Expo Router, TypeScript.

- Auth : JWT stocké dans `expo-secure-store`.

- Architecture dossier : `src/` feature-based (`auth/`, `workout/`, `shared/`).

- Méthode de travail : Vertical Slicing + Kanban WIP=1 + Definition of Done stricte.

### 5. Contradictions identifiées entre documents

| #  | Doc A                                                 | Doc B                                                       | Nature du conflit                                            |
|-----|-------------------------------------------------------|-------------------------------------------------------------|--------------------------------------------------------------|
| 1   | Documents d'architecture datés 07-08/06               | Code réel au moment de l'audit                              | Décrivent un modèle cassé qui est en fait corrigé et enrichi |
| 2   | Spec.md (4 tabs : Accueil/Lift/Luta Livre/Ressources) | Planification Milestone 3 (3 tabs : Home/Lift/Profile)      | Navigation principale différente                             |
| 3   | Spec.md (PostgreSQL + S3/CloudFront dès le MVP)       | SYSTEM_DESIGN.md (SQLite en dev, PostgreSQL en Milestone 8) | Infra cible à court terme différente                         |
| 4   | Spec.md (compte public/privé, follow/followers)       | docs/produit Story Map (features sociales = Won't MVP)      | Périmètre social                                             |
| 5   | Backend nutrition complet et testé                    | Story Map (nutrition = Post-MVP/Could)                      | Écart effort investi vs priorité produit                     |

### 6. Décisions de cadrage validées avant le début de la conception

| Question                                             | Décision retenue                                                             |
|------------------------------------------------------|------------------------------------------------------------------------------|
| Périmètre fonctionnel de la V1                       | Auth + Lift + Profil uniquement (pas de BJJ, pas de Nutrition dans cette V1) |
| Source de vérité en cas de conflit documentaire      | `docs/produit/*` prime sur `Spec.md`                                    |
| Templates de séance (0 en base au moment de l'audit) | Traités comme prérequis à seeder — pas d'état vide à designer pour cet écran |
| Plateforme cible                                     | Cross-platform (iOS + Android) dès la V1, pas iOS-only                       |

## Phase 1 — Screen Map V1 (état final)

13 écrans figés répartis en 4 domaines. La map initiale (Phase 1) comptait 11 écrans ; deux écrans supplémentaires (A4, A5) ont été ajoutés en cours de conception suite à la décision d'inclure un flow complet de réinitialisation de mot de passe.

### Domaine A — Authentification (5 écrans)

- A1. Auth Gate (splash / vérification de session)

- A2. Login

- A3. Register

- A4. Mot de passe oublié (demande)

- A5. Nouveau mot de passe (via deep link)

- Annexe : contenu statique CGU / Politique de confidentialité

### Domaine B — Home (1 écran)

- B1. Accueil (dashboard stats)

### Domaine C — Lift, cœur du produit (8 écrans)

- C1. Bibliothèque d'exercices (mode Browse + mode Select)

- C2. Détail d'un exercice

- C3. Choisir un template (+ option séance libre)

- C4. Détail d'un template

- C5. Séance en cours

- C6. Finaliser la séance

- C7. Historique des séances

- C8. Détail d'une séance passée

### Domaine D — Profil (1 écran)

- D1. Profil

### Structure de navigation actée

Le tab Lift dispose d'un `SegmentedControl` persistant (Séances / Historique / Exercices) partagé par C3, C7 et C1 en mode Browse. Ce header est distinct du mode Select de C1, ouvert en modal indépendant depuis C5, sans `SegmentedControl` visible.

### Relations entre écrans (vue synthétique)

| Écran       | Atteint depuis                | Mène vers                             |
|-------------|-------------------------------|---------------------------------------|
| A1          | Lancement de l'app            | A2 ou B1                              |
| A2          | A1, A3, A4, D1 (déconnexion)  | B1, A3, A4                            |
| A3          | A2                            | B1, A2, CGU                           |
| A4          | A2                            | A5 (via email), A2                    |
| A5          | Deep link email uniquement    | A2                                    |
| B1          | Post-connexion, tab Home      | C3, C7                                |
| C1 (Browse) | SegmentedControl (Exercices)  | C2                                    |
| C1 (Select) | C5 (« Ajouter un exercice »)  | C5 (ferme le modal)                   |
| C2          | C1                            | C1 (retour)                           |
| C3          | SegmentedControl (Séances)    | C4, C5 (séance libre)                 |
| C4          | C3                            | C5                                    |
| C5          | C4, C3 (séance libre)         | C6, C1 (modal)                        |
| C6          | C5                            | B1                                    |
| C7          | SegmentedControl (Historique) | C8                                    |
| C8          | C7                            | C7 (retour), C1 (modal)               |
| D1          | Tab Profile                   | A2 (déconnexion / suppression compte) |

Domaine A — Authentification

## A1. Auth Gate (Splash / vérification de session)

### 1. Objectif

Déterminer au lancement de l'app ou au retour au premier plan, sans action de l'utilisateur, si une session valide existe, et router vers le stack Auth ou le stack App.

### 2. Utilisateur

Tout utilisateur, nouveau ou récurrent. Aucune action possible sur cet écran.

### 3. Entrées / Sorties

- Entrées : lancement de l'app (cold start), retour au premier plan si l'access token a expiré.

- Sorties : Login (A2) ou Home (B1). Jamais d'autre destination.

### 4. Navigation

- Aucun bouton retour (écran non atteignable manuellement).

- Pas de deep link possible vers cet écran.

### 5. Layout

- Écran plein cadre, centré : logo Lift + spinner.

- Pas de header, pas de tab bar.

- Safe area respectée.

### 6. Sections détaillées

**Loading state** : logo Lift statique + spinner animé. Texte discret "Connexion..." si le refresh réseau dépasse ~2s.

### 7. Inventaire composants

| Composant      | Rôle                           | Variantes      | États           | Interactions |
|----------------|--------------------------------|----------------|-----------------|--------------|
| SplashLogo     | Branding pendant le chargement | Aucune         | Statique        | Aucune       |
| LoadingSpinner | Indicateur d'activité          | Aucune         | En cours        | Aucune       |
| LoadingLabel   | Rassurer si refresh > 2s      | "Connexion..." | Caché / Visible | Aucune       |

### 8. États écran

- Default / Loading : seul état visible normalement.

- Erreur : pas d'écran dédié — transition silencieuse vers Home (accès optimiste) ou Login selon le cas.

### 9. Business rules

- BR-1 : décodage local du JWT (comparaison `exp`), aucun appel réseau si le token est valide.

- BR-2 : refresh automatique tenté si le token est expiré/absent mais qu'un refresh token existe.

- BR-3 : un refresh réussi remplace access ET refresh token localement.

- BR-4 : un refresh échouant avec une erreur d'authentification déclenche logout() + redirection Login avec message "Session expirée".

- BR-5 : un refresh échouant pour cause réseau ne déclenche pas de logout — accès optimiste à Home.

- BR-6 : timeout de la tentative de refresh fixé à 5s.

### 10. Cas limites

- Aucun token en storage → Login direct, pas de tentative réseau.

- Refresh token corrompu/illisible → traité comme absent.

- Deux tentatives de refresh simultanées → mutex côté AuthContext.

### 11. Accessibilité

Spinner annoncé via accessibilityLabel="Chargement" et accessibilityRole="progressbar".

### 12. Responsive React Native

Safe area native iOS/Android, logo centré taille relative, layout identique en paysage.

### 13. Performance

Décodage local + décision < 100ms dans le cas nominal. Timeout réseau dur à 5s.

### 14. Dépendances

AuthContext, expo-secure-store, POST /api/auth/token/refresh/ (existant), librairie de décodage JWT côté client à ajouter.

### 15. Anti-patterns à éviter

Ne pas appeler GET /api/auth/me/ à chaque lancement. Ne pas bloquer derrière un écran d'erreur réseau plein écran. Ne pas afficher un spinner sans timeout.

### 16. Invariants

Cet écran ne s'affiche jamais plus de quelques secondes, ne contient jamais d'action utilisateur, est toujours suivi d'une redirection.

### 17. Acceptance Criteria

- [ ] Token local valide → Home sans appel réseau.

- [ ] Token expiré + refresh valide → refresh silencieux → Home.

- [ ] Refresh token invalide/expiré → logout complet + Login avec message.

- [ ] Aucun token → Login sans appel réseau, sans message.

- [ ] Échec réseau pendant le refresh → Home après timeout 5s.

- [ ] Spinner annoncé correctement par VoiceOver/TalkBack.

### 18. Auto-review

| Critère                       | Score |
|-------------------------------|-------|
| Respect des specs             | 9/10  |
| Cohérence System Design       | 9/10  |
| Clarté objectif               | 10/10 |
| Architecture informationnelle | 9/10  |
| Exhaustivité composants       | 9/10  |
| Exhaustivité interactions     | 9/10  |
| États couverts                | 9/10  |
| Edge cases                    | 9/10  |
| Navigation                    | 9/10  |
| UX mobile                     | 9/10  |
| Accessibilité                 | 9/10  |
| Performance                   | 9/10  |
| Sécurité                      | 9/10  |
| Analytics                     | 9/10  |
| Évolutivité V2                | 9/10  |
| Critères d'acceptation        | 9/10  |

**Score global : 9.1/10 — STATUS : FROZEN**

## A2. Login

### 1. Objectif

Authentifier un utilisateur déjà inscrit via email + mot de passe.

### 2. Utilisateur

Utilisateur inscrit, tout niveau. Usage ponctuel (rare une fois connecté, grâce au rolling refresh).

### 3. Entrées / Sorties

- Entrées : depuis A1 (pas de session valide), depuis A3 (lien "déjà un compte"), depuis D1 après déconnexion.

- Sorties : succès → B1 ; lien → A3 ; lien → A4.

### 4. Navigation

Pas de bouton retour natif pertinent. Pas de deep link pour le MVP.

### 5. Layout

Header minimal (logo). Champ email, champ password (toggle œil), lien "Mot de passe oublié ?", bouton "Se connecter", lien "Créer un compte". KeyboardAvoidingView.

### 6. Sections détaillées

**Formulaire** : email (clavier email, autoCapitalize=none), password masqué avec toggle œil. Validation inline temps réel après première interaction.

**Actions** : bouton "Se connecter" désactivé tant que le format n'est pas valide ; liens secondaires.

**Feedback** : bannière d'erreur (identifiants invalides / réseau), spinner inline dans le bouton.

### 7. Inventaire composants

| Composant                    | Rôle              | Variantes             | États                           | Interactions           |
|------------------------------|-------------------|-----------------------|---------------------------------|------------------------|
| EmailInput                   | Saisie email      | —                     | Default, Focus, Error, Disabled | Saisie, blur           |
| PasswordInput                | Saisie password   | Masqué/visible        | Default, Focus, Error, Disabled | Saisie, toggle œil     |
| PrimaryButton Se connecter   | Soumission        | —                     | Disabled, Enabled, Loading      | Tap → submit           |
| ErrorBanner                  | Erreur API        | Identifiants / Réseau | Caché, Visible                  | Tap Réessayer (réseau) |
| TextLink Mot de passe oublié | Accès reset       | —                     | Default                         | Tap → A4               |
| TextLink Créer un compte     | Accès inscription | —                     | Default                         | Tap → A3               |

### 8. États écran

Default, Filled/Valid, Loading, Error identifiants invalides (bannière générique, champs conservés), Error réseau (bannière + bouton Réessayer), Error validation format (inline sous champ).

### 9. Business rules

- BR-1 : bouton désactivé tant que le formulaire n'est pas valide (validation client avant appel réseau).

- BR-2 : message d'erreur générique, ne précise jamais quel champ est faux.

- BR-3 : succès → access/refresh/user stockés (retournés directement par l'API), navigation vers B1.

- BR-4 : mot de passe jamais loggé ni affiché en clair.

- BR-5 : après erreur, les valeurs saisies restent dans les champs.

### 10. Cas limites

Email avec espaces → trim automatique. Double-tap → bloqué pendant Loading. Retour après logout → formulaire vide, pas de pré-remplissage.

### 11. Accessibilité

Labels explicites (pas seulement placeholders). Icône œil avec accessibilityLabel dynamique. Bannière en accessibilityLiveRegion="polite". Cible tactile ≥44×44pt.

### 12. Responsive React Native

KeyboardAvoidingView (padding iOS / height Android). Formulaire centré, largeur max contrainte en paysage/tablette.

### 13. Performance

Cible ≤200ms côté serveur (repris de NFR-001.2 par cohérence). Timeout client 10s.

### 14. Sécurité

Password en secureTextEntry, purgé après soumission. Pas de rate limiting backend aujourd'hui (gap connu, non compensable entièrement côté frontend).

### 15. Dépendances

POST /api/auth/login/ (fonctionnel), service API centralisé, AuthContext.login(), lien vers A3 et A4.

### 16. Anti-patterns à éviter

Ne pas dire explicitement quel champ est faux. Ne pas vider le formulaire après erreur. Ne pas laisser le bouton actif pendant le chargement.

### 17. Acceptance Criteria

- [ ] Email/password valides → 200, tokens stockés, redirection B1.

- [ ] Identifiants faux → bannière générique, formulaire non vidé.

- [ ] Serveur injoignable → bannière réseau + bouton Réessayer fonctionnel.

- [ ] Bouton désactivé tant que le formulaire n'est pas valide.

- [ ] Aucune double soumission possible pendant le Loading.

- [ ] Clavier n'empêche jamais l'accès au bouton.

### 18. Auto-review

| Critère                       | Score |
|-------------------------------|-------|
| Respect des specs             | 10/10 |
| Cohérence System Design       | 9/10  |
| Clarté objectif               | 10/10 |
| Architecture informationnelle | 9/10  |
| Exhaustivité composants       | 9/10  |
| Exhaustivité interactions     | 9/10  |
| États couverts                | 9/10  |
| Edge cases                    | 9/10  |
| Navigation                    | 9/10  |
| UX mobile                     | 9/10  |
| Accessibilité                 | 9/10  |
| Performance                   | 9/10  |
| Sécurité                      | 9/10  |
| Analytics                     | 9/10  |
| Évolutivité V2                | 9/10  |
| Critères d'acceptation        | 9/10  |

**Score global : 9.3/10 — STATUS : FROZEN**

## A3. Register

### 1. Objectif

Créer un compte (email, password, pseudo) et connecter automatiquement l'utilisateur, sans étape de re-login.

### 2. Utilisateur

Nouvel utilisateur, premier contact avec l'app.

### 3. Entrées / Sorties

- Entrées : depuis A2 (lien "Créer un compte").

- Sorties : succès → B1 directement ; lien → A2 ; lien → CGU/Confidentialité.

### 4. Navigation

Retour possible vers A2. Pas de deep link.

### 5. Layout

Header minimal. Formulaire : email, pseudo, password (+toggle), password_confirm (+toggle), case CGU, bouton "Créer un compte", lien "Déjà un compte ? Se connecter". KeyboardAvoidingView avec scroll.

### 6. Sections détaillées

**Formulaire** : validation inline temps réel par champ.

**Consentement** : checkbox + texte avec liens CGU/Confidentialité tappables séparément, jamais pré-cochée.

**Actions** : bouton désactivé tant que formulaire invalide ou CGU non cochée.

**Feedback** : erreurs inline par champ (email/pseudo déjà utilisés, password trop court, mismatch), bannière réservée aux erreurs réseau.

### 7. Inventaire composants

| Composant                     | Rôle                     | Variantes         | États                                | Interactions           |
|-------------------------------|--------------------------|-------------------|--------------------------------------|------------------------|
| EmailInput                    | Saisie email             | —                 | Default, Error (format/déjà utilisé) | Saisie, blur           |
| PseudoInput                   | Saisie pseudo            | —                 | Default, Error (format/déjà pris)    | Saisie, blur           |
| PasswordInput                 | Saisie password          | Masqué/visible    | Default, Error (trop court)          | Saisie, toggle œil     |
| PasswordStrengthMeter         | Indicateur de force      | Faible/Moyen/Fort | Caché si vide                        | Lecture seule          |
| PasswordConfirmInput          | Confirmation             | Masqué/visible    | Default, Error (mismatch)            | Saisie, toggle œil     |
| ConsentCheckbox               | Case CGU                 | —                 | Non coché, Coché                     | Tap                    |
| TextLink CGU/Confidentialité  | Accès contenu légal      | —                 | Default                              | Tap → contenu statique |
| PrimaryButton Créer un compte | Soumission               | —                 | Disabled, Enabled, Loading           | Tap → submit           |
| ErrorBanner                   | Erreur réseau uniquement | —                 | Caché, Visible                       | Tap Réessayer          |
| TextLink Se connecter         | Retour vers A2           | —                 | Default                              | Tap → A2               |

### 8. États écran

Default, Filled/Valid, Loading, Error email déjà utilisé (inline), Error pseudo déjà pris (inline), Error format pseudo invalide, Error password trop court, Error passwords ne correspondent pas (vérifié 100% côté client), Error réseau (bannière).

### 9. Business rules

- BR-1 : comparaison password/password_confirm faite avant tout appel réseau (le backend renvoie une erreur vide sur ce cas — bug identifié, contournement côté client obligatoire).

- BR-2 : pseudo validé côté client contre le pattern ^[a-zA-Z0-9_]{3,20}$.

- BR-3 : mot de passe ≥ 8 caractères côté client (le backend n'impose rien aujourd'hui).

- BR-4 : case CGU doit être cochée pour activer la soumission, jamais pré-cochée.

- BR-5 : à la réussite, tokens stockés ; un appel à GET /api/auth/me/ est acceptable en filet de sécurité si la forme de la réponse pose problème à l'implémentation.

- BR-6 : email et pseudo trim + email normalisé en minuscules avant envoi.

### 10. Cas limites

Casse différente d'un pseudo existant → normalisation en minuscules recommandée avant envoi (à confirmer côté backend). Décocher CGU juste avant de soumettre → bouton se redésactive immédiatement. Erreurs email + pseudo simultanées → les deux s'affichent en même temps.

### 11. Accessibilité

Mêmes principes qu'A2. Checkbox CGU avec accessibilityRole="checkbox", liens atteignables indépendamment. PasswordStrengthMeter avec texte, pas seulement une couleur.

### 12. Responsive React Native

Scroll activé par défaut dans le KeyboardAvoidingView (formulaire plus long qu'A2), testé sur petit écran avec clavier ouvert.

### 13. Performance

Même cible que Login (≤200ms), timeout client 10s.

### 14. Sécurité

Password jamais loggé. Deux gaps backend signalés (validate_password() non appelé, message vide sur mismatch) restent des risques indépendants de cet écran.

### 15. Dépendances

POST /api/auth/register/ (fonctionnel avec réserves). Contenu statique CGU/Confidentialité à rédiger. Correction backend recommandée : appeler validate_password(), corriger le message d'erreur vide sur mismatch.

### 16. Anti-patterns à éviter

Ne pas envoyer la requête si password ≠ password_confirm côté client. Ne pas pré-cocher CGU. Ne pas afficher "pseudo déjà pris" en bannière générique.

### 17. Acceptance Criteria

- [ ] Formulaire complet + valide + CGU cochée → 201, tokens stockés, redirection B1.

- [ ] Email déjà utilisé → erreur inline sous le champ email.

- [ ] Pseudo déjà pris → erreur inline sous le champ pseudo.

- [ ] Passwords différents → bloqué avant tout appel réseau.

- [ ] Password < 8 caractères → bloqué avant envoi.

- [ ] Pseudo hors pattern → bloqué avant envoi.

- [ ] CGU non cochée → bouton désactivé.

- [ ] Erreur réseau → bannière + Réessayer, valeurs conservées.

### 18. Auto-review

| Critère                       | Score |
|-------------------------------|-------|
| Respect des specs             | 9/10  |
| Cohérence System Design       | 9/10  |
| Clarté objectif               | 10/10 |
| Architecture informationnelle | 9/10  |
| Exhaustivité composants       | 9/10  |
| Exhaustivité interactions     | 9/10  |
| États couverts                | 9/10  |
| Edge cases                    | 9/10  |
| Navigation                    | 9/10  |
| UX mobile                     | 9/10  |
| Accessibilité                 | 9/10  |
| Performance                   | 9/10  |
| Sécurité                      | 9/10  |
| Analytics                     | 9/10  |
| Évolutivité V2                | 9/10  |
| Critères d'acceptation        | 9/10  |

**Score global : 9.2/10 — STATUS : FROZEN**

## A4. Mot de passe oublié (demande)

### 1. Objectif

Déclencher l'envoi d'un email de réinitialisation à partir de l'adresse email du compte.

### 2. Utilisateur

Utilisateur ayant oublié son mot de passe, généralement en échec de connexion juste avant.

### 3. Entrées / Sorties

- Entrées : lien "Mot de passe oublié ?" depuis A2.

- Sorties : retour A2 ; email envoyé → l'utilisateur revient via le lien reçu (→ A5).

### 4. Navigation

Écran empilé depuis A2, retour natif standard.

### 5. Layout

Header (retour + titre). Formulaire simple : email + bouton "Envoyer le lien". État de succès remplace le formulaire sur le même écran.

### 6. Sections détaillées

**Formulaire** : EmailInput réutilisé, texte explicatif court.

**Succès** : icône de confirmation + message générique + lien retour connexion. Message identique que l'email existe ou non (sécurité).

### 7. Inventaire composants

| Composant                     | Rôle                           | États                      | Interactions            |
|-------------------------------|--------------------------------|----------------------------|-------------------------|
| EmailInput                    | Saisie email (réutilisé A2/A3) | Default, Error format      | Saisie                  |
| PrimaryButton Envoyer le lien | Déclenche l'envoi              | Disabled, Enabled, Loading | Tap → submit            |
| SuccessState                  | Confirmation générique         | Visible après submit       | —                       |
| ErrorBanner                   | Erreur réseau                  | Caché/Visible              | Réutilisé du pattern A2 |

### 8. États écran

Default, Loading, Success (message générique), Error réseau (bannière + Réessayer).

### 9. Business rules

- BR-1 : message de succès strictement identique, email existant ou non (anti email enumeration).

- BR-2 : lien de réinitialisation à durée de validité limitée (valeur exacte à trancher côté backend).

- BR-3 : rate limiting recommandé côté backend, pas de limite visible côté UI en V1.

### 10. Cas limites

Email valide en format mais inexistant → même succès générique. Soumissions répétées → chaque soumission redéclenche un envoi (dépend du rate limiting backend).

### 11. Accessibilité

Identique aux patterns déjà établis.

### 12. Performance

Pas d'enjeu particulier, un seul appel réseau simple.

### 13. Dépendances

Nouveau backend : POST /api/auth/password-reset/request/. Nouvelle infra : backend d'envoi d'email (aucun configuré actuellement).

### 14. Anti-patterns à éviter

Ne jamais différencier le message selon l'existence réelle du compte.

### 15. Acceptance Criteria

- [ ] Message de succès identique quel que soit l'état réel du compte.

- [ ] Erreur réseau distincte, avec retry.

### 16. Auto-review

**Score global : 9.2/10 (tous critères ≥9) — STATUS : FROZEN**

## A5. Nouveau mot de passe

### 1. Objectif

Permettre de définir un nouveau mot de passe après avoir suivi le lien reçu par email.

### 2. Utilisateur

Utilisateur revenant dans l'app via le deep link, token de réinitialisation en main.

### 3. Entrées / Sorties

- Entrées : deep link uniquement (lift://reset-password?token=...), jamais accessible par navigation manuelle.

- Sorties : succès → A2 avec message ; token invalide/expiré → état d'erreur avec retour vers A4.

### 4. Navigation

Pas de bouton retour classique — bouton "Retour à la connexion" explicite.

### 5. Layout

Header minimal. Formulaire : nouveau mot de passe + confirmation (composants réutilisés d'A2/A3).

### 6. Sections détaillées

**Formulaire** : PasswordInput + PasswordConfirmInput, même règle de force qu'A3, vérification de correspondance 100% côté client.

**Token invalide/expiré** : message "Ce lien n'est plus valide" + bouton "Redemander un lien" → A4, vérifié dès l'arrivée sur l'écran.

### 7. Inventaire composants

| Composant                            | Rôle                  | États                      | Interactions                |
|--------------------------------------|-----------------------|----------------------------|-----------------------------|
| PasswordInput / PasswordConfirmInput | Réutilisés d'A3       | Default, Error             | Saisie, toggle œil          |
| PasswordStrengthMeter                | Réutilisé d'A3        | —                          | Lecture seule               |
| PrimaryButton Réinitialiser          | Soumission            | Disabled, Enabled, Loading | Tap → submit                |
| InvalidTokenState                    | Token invalide/expiré | Visible si détecté         | Tap Redemander un lien → A4 |

### 8. États écran

Default (token valide vérifié), Loading (vérification token), Invalid token (remplace tout l'écran), Loading (soumission), Success (redirection immédiate), Error mismatch (inline, jamais envoyé au serveur).

### 9. Business rules

- BR-1 : token vérifié dès l'arrivée sur l'écran, pas seulement à la soumission.

- BR-2 : mêmes règles de force de mot de passe que A3.

- BR-3 : token invalidé côté serveur après succès (usage unique).

- BR-4 : recommandé — invalidation des sessions actives existantes après changement réussi (dépendance backend à considérer, non garantie par la config JWT actuelle).

### 10. Cas limites

Lien tapé deux fois → deuxième tentative détecte un token déjà utilisé. App rouverte plusieurs jours après réception de l'email → token très probablement expiré.

### 11. Sécurité

BR-3 (usage unique) et BR-4 (invalidation des sessions) sont les points centraux — BR-4 recommandée sans garantie d'implémentation sans revue backend dédiée.

### 12. Dépendances

Nouveau backend : POST /api/auth/password-reset/confirm/. Configuration deep link : Universal Links (iOS) / App Links (Android) via Expo — infrastructure inexistante ailleurs dans le projet.

### 13. Anti-patterns à éviter

Ne pas afficher le formulaire avant d'avoir vérifié la validité du token. Ne pas permettre de réutiliser un token déjà consommé.

### 14. Acceptance Criteria

- [ ] Token invalide/expiré → InvalidTokenState avant même d'afficher le formulaire.

- [ ] Mots de passe non identiques → bloqué côté client.

- [ ] Succès → redirection A2 avec message clair, token consommé côté serveur.

- [ ] Réutilisation du même lien après succès → InvalidTokenState.

### 15. Auto-review

**Score global : 9.1/10 (point de vigilance : BR-4, dépendance backend non garantie) — STATUS : FROZEN**

## Annexe — Contenu statique CGU & Politique de confidentialité

Ces deux écrans sont traités en léger : contenu 100% statique, aucune logique métier, aucun état à gérer au-delà du chargement.

- Accès : depuis la case à cocher d'A3 (tap sur chaque lien individuellement).

- Layout : header avec retour + titre, texte scrollable (Markdown ou texte formaté), pas d'interaction au-delà du scroll.

- Contenu réel : à rédiger — aucune version n'existe aujourd'hui dans le projet. Livrable juridique, pas un livrable de design d'interface ; recommandation de le faire relire par une personne qualifiée. Structure suggérée : identité du responsable de traitement, données collectées, finalités, durée de conservation, droits RGPD renvoyant vers l'écran Profil.

- Dépendance : contenu texte à produire ; hébergement embarqué dans l'app (suffisant pour le MVP, pas besoin de CMS).

- Statut : FROZEN pour la structure/navigation ; contenu textuel explicitement hors périmètre de cette spec d'interface.

Domaine B — Home

## B1. Accueil (dashboard)

### 1. Objectif

Donner en un coup d'œil l'état de la progression récente (volume de la semaine, PRs) et fournir l'accès le plus rapide possible pour démarrer une séance.

### 2. Utilisateur

Pratiquant, usage quotidien/récurrent (premier écran vu à chaque ouverture après connexion).

### 3. Entrées / Sorties

- Entrées : depuis A1/A2/A3, tap sur le tab Home.

- Sorties : "Démarrer une séance" → C3 ; "Voir l'historique" → C7 ; tap sur une PR-card → C2.

### 4. Navigation

Racine du tab Home. Pull-to-refresh.

### 5. Layout

Header (salutation + pseudo). Contenu scrollable : CTA principal en haut, grille de stat-cards, section PRs récents, lien historique. Tab bar persistante en bas.

### 6. Sections détaillées

**Hero/CTA** : salutation adaptative ("Prêt pour ta première séance ?" si 0 séance, sinon variante neutre), bouton "Démarrer une séance" toujours visible, coexiste avec les stats (pas de remplacement total pour un nouvel utilisateur).

**Stats de la semaine** : "Volume cette semaine" (kg + variation % vs semaine précédente), "Séances cette semaine" (nombre). Valeurs à 0 pour un nouvel utilisateur, variation % masquée si la semaine précédente vaut 0.

**PRs récents** : liste horizontale scrollable de PR-cards (exercice, 1RM estimé, date), triée par date décroissante, limitée à 5. État vide dédié si aucune donnée.

**Accès rapide** : lien "Voir tout l'historique" → C7.

### 7. Inventaire composants

| Composant                            | Rôle                            | Variantes             | États                    | Interactions      |
|--------------------------------------|---------------------------------|-----------------------|--------------------------|-------------------|
| GreetingHeader                       | Salutation contextuelle         | Nouvel/récurrent      | Statique                 | Aucune            |
| PrimaryCTAButton Démarrer une séance | Action principale               | —                     | Default, Pressed         | Tap → C3          |
| StatCard Volume                      | Volume kg semaine + Δ%          | Avec/sans comparaison | Default, Skeleton, Error | Lecture seule     |
| StatCard Séances                     | Nombre de séances semaine       | —                     | Default, Skeleton, Error | Aucune            |
| PRCard                               | Résumé 1RM estimé par exercice  | —                     | Default                  | Tap → C2          |
| PRCarousel                           | Conteneur horizontal des PRCard | Rempli/Vide           | Default, Skeleton, Empty | Scroll horizontal |
| QuickLink Voir l'historique          | Accès C7                        | —                     | Default                  | Tap → C7          |
| PullToRefreshControl                 | Rafraîchissement manuel         | —                     | Idle, Refreshing         | Pull down         |

### 8. États écran

Default, Loading (skeleton), Empty (nouvel utilisateur : CTA + stats à zéro + carousel vide, coexistence), Partial data (un seul endpoint stats échoue, section localisée en erreur), Error (bannière discrète, CTA reste utilisable), Offline.

### 9. Business rules

- BR-1 : Volume semaine = Σ(weight_kg × reps) sur les Set non-échauffement (is_warmup=False) de la semaine calendaire courante (lundi → dimanche).

- BR-2 : les séries is_warmup=True sont exclues du calcul de volume.

- BR-3 : variation % = (volume_courant - volume_précédent) / volume_précédent × 100 ; non affichée si volume_précédent = 0.

- BR-4 : 1RM estimé par série = formule d'Epley : poids × (1 + reps/30). Le "1RM" affiché = maximum de cette estimation sur l'historique de l'exercice.

- BR-5 : PR "récent" = un 1RM estimé qui dépasse le précédent record connu, trié par date décroissante, limité à 5 entrées.

- BR-6 : le CTA "Démarrer une séance" est toujours actif, indépendamment de l'état des sections stats.

### 10. Cas limites

Séances sans série non-échauffement cette semaine → Volume = 0kg affiché normalement. Un seul set à 1 rep exactement → 1RM estimé quand même via Epley. Changement de fuseau horaire → semaine calculée sur le fuseau actuel du device.

### 11. Accessibilité

Valeurs numériques annoncées avec unité complète. Chaque PRCard atteignable individuellement au swipe. Skeletons annoncés comme "Chargement".

### 12. Responsive React Native

Stat-cards en grille 2 colonnes (1 colonne sur petit écran si besoin). PRCarousel scroll horizontal natif.

### 13. Performance

Cible ≤1s (Spec.md) — appels parallèles, pas en cascade. Skeleton immédiat. Cache local recommandé (React Query).

### 14. Sécurité

Données strictement scopées à l'utilisateur connecté (IsOwner/get_queryset()).

### 15. Dépendances

Backend à créer (bloquant) : GET /api/lift/stats/weekly/, GET /api/lift/stats/prs/. GET /api/lift/workout_session/ (déjà fonctionnel) en complément. Librairie de cache réseau recommandée.

### 16. Anti-patterns à éviter

Ne jamais bloquer le CTA principal derrière un chargement/erreur des stats. Ne pas afficher +Infinity% quand la semaine précédente est vide. Ne pas remplacer tout l'écran par un état vide générique pour un nouvel utilisateur.

### 17. Acceptance Criteria

- [ ] Nouvel utilisateur : CTA + stat-cards à zéro + carousel vide coexistent.

- [ ] Volume et % de variation corrects (échauffement inclus/exclu testé).

- [ ] 1RM estimé conforme à la formule d'Epley.

- [ ] Semaine précédente à 0 → pas de pourcentage affiché, pas de crash.

- [ ] Panne d'un seul endpoint stats → l'autre section continue de fonctionner.

- [ ] Pull-to-refresh recharge les 3 sources de données.

- [ ] Chargement perçu < 1s sur un réseau normal.

### 18. Auto-review

**Score global : 9.1/10 — STATUS : FROZEN**

Point de calcul explicitement validé (ex-Alerte Maximale #5 de TODOLIST.md, jamais tranchée avant cette V1) : le 1RM est estimé via la formule d'Epley sur chaque série, puis les 5RM/10RM sont dérivés de ce 1RM via des tables de pourcentage standard (5RM ≈ 87% du 1RM, 10RM ≈ 75% du 1RM), plutôt que de se limiter aux séries faites à exactement 1, 5 ou 10 répétitions.

## Domaine C — Lift (Musculation)

Structure interne : un `SegmentedControl` (Séances / Historique / Exercices) partagé par C3, C7 et C1 en mode Browse constitue le header persistant du tab Lift.

## C1. Bibliothèque d'exercices

### 1. Objectif

Permettre de parcourir, rechercher et filtrer les 873 exercices de la base, en deux contextes d'usage : consultation libre (segment Exercices du tab Lift) et sélection d'exercice pour l'ajouter à une séance libre en cours (depuis C5).

### 2. Utilisateur

Pratiquant en exploration libre, ou en pleine séance cherchant un exercice précis à ajouter.

### 3. Entrées / Sorties

- Entrées : SegmentedControl du tab Lift, segment Exercices (mode Browse) ; depuis C5 via "Ajouter un exercice" en séance libre (mode Select, modal plein écran par-dessus C5).

- Sorties (Browse) : tap sur un item → C2. Sorties (Select) : tap → ajoute l'exercice à la séance en cours et ferme l'écran.

### 4. Navigation

Mode Browse : segment Exercices du SegmentedControl partagé (C3/C7/C1), pas un tab autonome. Mode Select : modal indépendant avec bouton fermer explicite pour revenir à C5 sans ajout.

### 5. Layout

Barre de recherche fixe en haut. Rangée de chips horizontales scrollables (18 groupes musculaires). Liste verticale, tri alphabétique par défaut, chargement infini (pagination 25/page).

### 6. Sections détaillées

**Recherche & filtres** : SearchInput (debounce ~350ms), FilterChipsRow (sélection multiple, logique OU entre chips, ET avec la recherche texte).

**Liste** : icône groupe musculaire (fallback générique) + nom + groupe musculaire. onEndReached charge la page suivante avant que l'utilisateur atteigne réellement le bas.

### 7. Inventaire composants

| Composant                 | Rôle                      | Variantes                      | États                  | Interactions          |
|---------------------------|---------------------------|--------------------------------|------------------------|-----------------------|
| SearchInput               | Recherche texte libre     | —                              | Default, Focus, Clear  | Saisie (debounced)    |
| FilterChipsRow            | Filtres groupe musculaire | —                              | Aucune/N chips actives | Tap toggle par chip   |
| ExerciseListItem          | Ligne de la liste         | Icône générique / image réelle | Default, Pressed       | Tap → C2 ou ajout     |
| MuscleGroupIcon           | Fallback visuel           | 1 par groupe (18)              | Statique               | Aucune                |
| InfiniteScrollLoader      | Chargement page suivante  | —                              | Caché, Visible         | Aucune                |
| EmptySearchState          | Aucun résultat            | —                              | Visible si 0 résultat  | Aucune                |
| ModalHeader (mode Select) | Titre + fermeture         | —                              | Default                | Tap croix → retour C5 |

### 8. États écran

Default, Loading (page suivante), Loading (recherche/filtre changé — skeleton), Empty (recherche sans résultat), Error (liste précédente conservée), Offline (cache si disponible).

### 9. Business rules

- BR-1 : recherche et filtres combinés côté requête serveur, jamais filtrés uniquement côté client sur une sous-liste déjà paginée.

- BR-2 : en mode Select, taper sur un item ajoute immédiatement l'exercice (pas d'étape de confirmation) et ferme le modal.

- BR-3 : les chips supportent une sélection multiple (OU entre chips, ET avec la recherche).

- BR-4 : le fallback MuscleGroupIcon s'affiche dès que image_url est vide/null, vérifié avant le rendu.

### 10. Cas limites

Recherche qui retourne 0 résultat après en avoir eu → état Empty sans flash d'écran blanc. Toutes les chips désélectionnées → retour à la liste complète. Perte de réseau en plein scroll infini → bouton Réessayer, items déjà chargés conservés.

### 11. Accessibilité

Chips avec accessibilityRole="button", état sélectionné annoncé. Label combiné nom + groupe musculaire par ligne. Bouton de fermeture modal en premier élément focusable.

### 12. Responsive React Native

FlatList avec getItemLayout pour la stabilité de scroll sur 873+ items. FilterChipsRow en scroll horizontal, chips de taille fixe.

### 13. Performance

Cible ≤500ms par page (NFR-001.1). Debounce recherche 350ms.

### 14. Dépendances

Backend à corriger (bloquant pour le filtre) : ExerciseViewset.filter_backends doit inclure DjangoFilterBackend en plus de SearchFilter. Set de 18 icônes génériques par groupe musculaire à produire (asset inexistant).

### 15. Anti-patterns à éviter

Ne pas filtrer côté client sur une liste partiellement chargée. Ne pas afficher d'image cassée. En mode Select, ne pas ajouter d'étape de confirmation qui ralentirait l'ajout en séance active.

### 16. Acceptance Criteria

- [ ] Recherche texte cohérente avec name/description/muscle_group/equipment.

- [ ] Filtre par groupe musculaire fonctionne une fois la correction backend appliquée.

- [ ] Scroll infini sans doublon ni saut visuel.

- [ ] Mode Select : tap ajoute l'exercice à C5 et ferme le modal sans étape intermédiaire.

- [ ] Mode Browse : tap ouvre C2.

- [ ] Fallback icône générique pour tout exercice sans image_url.

### 17. Auto-review

**Score global : 9.1/10 — STATUS : FROZEN**

## C2. Détail d'un exercice

### 1. Objectif

Donner tout ce qu'il faut pour exécuter correctement un mouvement : démonstration visuelle, muscles réellement sollicités, équipement requis, description.

### 2. Utilisateur

Pratiquant consultant une fiche avant/pendant sa préparation, hors séance active (le mode Select de C1 ne passe jamais par C2).

### 3. Entrées / Sorties

- Entrées : depuis C1 en mode Browse uniquement.

- Sorties : retour C1.

### 4. Navigation

Écran empilé classique, retour natif standard.

### 5. Layout

Header (retour + nom). Zone hero : vidéo (autoplay muet en boucle) si disponible, sinon image statique, sinon icône générique. Badges (composé, équipement). Section schéma corporel. Section description.

### 6. Sections détaillées

**Hero média** : cascade vidéo → image → icône générique. Vidéo pausée à la sortie de l'écran, jamais de son par défaut.

**Identité** : nom, badge "Composé" si applicable, tag équipement (masqué si vide).

**Muscles sollicités** : schéma corporel (vue avant + vue arrière), muscle principal surligné dans une couleur, muscles secondaires dans une couleur distincte, sur la ou les vues pertinentes. Lecture seule en V1.

**Description** : texte libre, masquée entièrement si vide.

### 7. Inventaire composants

| Composant         | Rôle                          | Variantes              | États                              | Interactions  |
|-------------------|-------------------------------|------------------------|------------------------------------|---------------|
| VideoPlayer       | Démo vidéo                    | —                      | Autoplay/loop, Paused (hors écran) | Aucune        |
| ExerciseHeroImage | Fallback image statique       | —                      | Default                            | Aucune        |
| MuscleGroupIcon   | Fallback ultime               | 1 par groupe           | Statique                           | Aucune        |
| CompoundBadge     | Indicateur exercice composé   | —                      | Visible/Caché                      | Aucune        |
| EquipmentTag      | Équipement requis             | —                      | Visible/Caché                      | Aucune        |
| BodyDiagram       | Schéma corporel avant/arrière | Vue avant, Vue arrière | Primaire/secondaires surlignés     | Lecture seule |
| DescriptionText   | Texte libre                   | —                      | Visible/Caché                      | Aucune        |

### 8. États écran

Default, Loading (skeleton, nom déjà disponible sans attendre le réseau), Partial data (vidéo absente — cas normal, 76% des exercices), Error (bannière + retry).

### 9. Business rules

- BR-1 : cascade d'affichage du hero : video_url > image_url > MuscleGroupIcon générique, jamais d'espace vide.

- BR-2 : la vue du BodyDiagram (avant/arrière) dépend des groupes concernés — une seule vue si tous les groupes sont sur la même face, les deux vues côte à côte sinon.

- BR-3 : FULL_BODY surligne l'intégralité des deux silhouettes de façon uniforme.

- BR-4 : la vidéo ne joue jamais en arrière-plan une fois l'écran quitté.

### 10. Cas limites

secondary_muscle_groups vide → pas de section vide affichée. FULL_BODY avec secondaires renseignés quand même → BR-3 prime. Navigation rapide entrée/sortie répétée → pas de relance multiple du téléchargement vidéo.

### 11. Accessibilité

Vidéo autoplay sans son par défaut (obligatoire). Alternative textuelle obligatoire pour le BodyDiagram (label combiné muscle principal + secondaires). Respect de prefers-reduced-motion : pas d'autoplay si activé, tap-to-play à la place.

### 12. Responsive React Native

BodyDiagram avant/arrière en toggle sur petit écran plutôt que côte à côte. Vidéo à ratio fixe, pas de déformation.

### 13. Performance

Vidéo chargée en lazy (pas préchargée depuis C1). BodyDiagram en assets vectoriels (SVG) recommandés.

### 14. Dépendances

Nouvelle dépendance design/asset significative : production de deux silhouettes anatomiques (avant/arrière) avec zones mappables pour les 18 groupes musculaires, en deux couleurs — asset inexistant aujourd'hui, effort de production notable (illustration ou licence). GET /api/lift/exercise/{id}/ (déjà fonctionnel).

### 15. Anti-patterns à éviter

Ne pas laisser la vidéo jouer avec le son par défaut ou continuer hors écran. Ne pas bloquer l'affichage de la fiche en attendant que le BodyDiagram soit prêt.

### 16. Acceptance Criteria

- [ ] Vidéo présente → autoplay muet en boucle, coupée à la sortie.

- [ ] Vidéo absente → fallback image puis icône générique.

- [ ] BodyDiagram affiche correctement primaire + secondaires sur les vues pertinentes.

- [ ] FULL_BODY surligne l'intégralité des silhouettes.

- [ ] reduced-motion activé → pas d'autoplay, tap-to-play à la place.

- [ ] Description vide → section masquée entièrement.

### 17. Auto-review

**Score global : 9.1/10 (point de vigilance : dépendance asset BodyDiagram, correctement isolée) — STATUS : FROZEN**

## C3. Choisir un template

### 1. Objectif

Permettre de démarrer une séance rapidement, soit via un template structuré, soit en séance libre.

### 2. Utilisateur

Pratiquant sur le point de s'entraîner — écran d'entrée de l'action la plus fréquente du produit.

### 3. Entrées / Sorties

- Entrées : tab Lift, segment Séances (par défaut à l'ouverture du tab), retour depuis C4/C6.

- Sorties : tap sur un template → C4 ; tap "Séance libre" → C5 directement ; SegmentedControl → C7 ou C1.

### 4. Navigation

Racine du segment Séances. SegmentedControl (Séances/Historique/Exercices) persistant dans le header du tab Lift, partagé avec C7 et C1(Browse).

### 5. Layout

Header (titre "Lift" + SegmentedControl). Liste scrollable : carte "Séance libre" en tête, puis cartes templates.

### 6. Sections détaillées

**SegmentedControl** : navigation entre les 3 usages du tab Lift, transition immédiate sans rechargement réseau si déjà visité.

**Séance libre** : carte visuellement égale aux templates, icône distincte. Tap → navigation directe vers C5 avec WorkoutSession sans template (template: null).

**Liste templates** : nom, badge catégorie, durée estimée, nombre d'exercices. Tri par catégorie puis alphabétique (volume trop faible pour justifier un filtre dédié).

### 7. Inventaire composants

| Composant        | Rôle                        | Variantes                    | États                     | Interactions            |
|------------------|-----------------------------|------------------------------|---------------------------|-------------------------|
| SegmentedControl | Navigation interne tab Lift | Séances/Historique/Exercices | Actif = Séances           | Tap → change de segment |
| FreeSessionCard  | Carte Séance libre          | —                            | Default, Pressed          | Tap → C5                |
| TemplateCard     | Carte template              | —                            | Default, Pressed, Loading | Tap → C4                |
| CategoryBadge    | Étiquette catégorie         | 8 variantes                  | Statique                  | Aucune                  |

### 8. États écran

Default, Loading (skeleton sur TemplateCard, Séance libre affichée immédiatement), Empty (cas défensif minimal — Séance libre reste utilisable seule), Error (bannière + retry, Séance libre reste fonctionnelle).

### 9. Business rules

- BR-1 : "Séance libre" crée une WorkoutSession avec template=null dès l'entrée dans C5.

- BR-2 : la liste provient de GET /api/lift/workout_template/ (publics + utilisateur) ; en V1, comme la création de template custom est hors scope, la liste ne contient en pratique que les templates publics seedés.

- BR-3 : le nombre d'exercices affiché = len(template.exercises), déjà nested dans le serializer.

### 10. Cas limites

Deux templates de même catégorie et durée → tri secondaire alphabétique stable.

### 11. Accessibilité

SegmentedControl avec accessibilityRole="tablist"/"tab", état sélectionné annoncé. Label combiné par carte.

### 12. Responsive React Native

Cartes en liste simple colonne, grille 2 colonnes envisageable en paysage/tablette.

### 13. Performance

Liste courte (~10 items), pas de pagination nécessaire.

### 14. Dépendances

GET /api/lift/workout_template/ (fonctionnel). Seeding des ~10 templates prédéfinis (prérequis déjà acté comme condition de livraison de cet écran).

### 15. Anti-patterns à éviter

Ne pas traiter "Séance libre" comme une option secondaire discrète. Ne pas bloquer l'accès à "Séance libre" si le chargement des templates échoue.

### 16. Acceptance Criteria

- [ ] "Séance libre" toujours visible et fonctionnelle même si les templates échouent à charger.

- [ ] Tap sur un template → C4 avec les bonnes données.

- [ ] Tap sur "Séance libre" → C5 avec template=null.

- [ ] Changement de segment → navigation vers C7/C1 sans perdre le contexte du tab.

### 17. Auto-review

**Score global : 9.2/10 — STATUS : FROZEN**

## C4. Détail d'un template

### 1. Objectif

Donner un aperçu complet du contenu d'un template avant de s'engager, et lancer la séance.

### 2. Utilisateur

Pratiquant ayant sélectionné un template depuis C3, sur le point de démarrer.

### 3. Entrées / Sorties

- Entrées : depuis C3 uniquement.

- Sorties : "Démarrer la séance" → C5 ; retour natif → C3 ; tap sur un exercice → C2.

### 4. Navigation

Écran empilé (push depuis C3), retour natif standard.

### 5. Layout

Header (retour + nom). Bandeau résumé (catégorie, durée, nb exercices, description). Liste ordonnée des exercices. CTA "Démarrer la séance" sticky en bas.

### 6. Sections détaillées

**Résumé template** : CategoryBadge, durée estimée, "X exercices", description libre (masquée si vide).

**Liste exercices** : icône/miniature (fallback MuscleGroupIcon), nom, "3 séries × 8-12 reps", "Repos : 90s", note libre. Lecture seule, tap → C2.

**CTA** : "Démarrer la séance" sticky. Création immédiate de la WorkoutSession au tap (POST avec template=id), accès optimiste à C5 si échec réseau (cohérent avec le principe déjà établi en A1).

### 7. Inventaire composants

| Composant                          | Rôle                               | Variantes | États            | Interactions            |
|------------------------------------|------------------------------------|-----------|------------------|-------------------------|
| TemplateSummaryHeader              | Résumé catégorie/durée/description | —         | Default          | Aucune                  |
| TemplateExerciseRow                | Ligne d'exercice avec cibles       | —         | Default, Pressed | Tap → C2                |
| StickyCTAButton Démarrer la séance | Lancement                          | —         | Enabled, Loading | Tap → POST session → C5 |

### 8. États écran

Default, Loading (skeleton, rare — déjà en cache depuis C3), Loading démarrage (bouton en spinner), Error démarrage réseau (accès optimiste, pas de blocage affiché).

### 9. Business rules

- BR-1 : exercices affichés dans l'ordre exact de TemplateExercise.order.

- BR-2 : gestion des cas target_reps_min == target_reps_max (affichage simplifié) et valeurs nulles (affichage partiel plutôt qu'un texte cassé).

- BR-3 : POST /api/lift/workout_session/ déclenché uniquement au tap sur "Démarrer la séance", jamais au simple affichage.

### 10. Cas limites

Template avec un seul exercice → layout inchangé. target_reps_min et max tous deux null → affiche uniquement "3 séries". Double-tap rapide sur le CTA → bloqué par l'état Loading.

### 11. Accessibilité

Label combiné complet par ligne d'exercice. CTA sticky toujours atteignable, cible ≥44×44pt.

### 12. Responsive React Native

CTA sticky testé sur templates à beaucoup d'exercices, padding de bas de liste compensé.

### 13. Performance

Données déjà chargées via le nested serializer de C3 dans la plupart des cas.

### 14. Dépendances

GET /api/lift/workout_template/{id}/ et POST /api/lift/workout_session/ (tous deux déjà fonctionnels).

### 15. Anti-patterns à éviter

Ne pas créer la session avant le tap explicite sur le CTA. Ne pas afficher "null-null reps" ou tout artefact de donnée manquante brut.

### 16. Acceptance Criteria

- [ ] Ordre des exercices respecté.

- [ ] Reps cibles affichées correctement dans les 3 cas (min=max, un seul défini, les deux définis).

- [ ] Tap "Démarrer" crée la session puis navigue vers C5.

- [ ] Échec réseau à la création → accès optimiste à C5, pas de blocage.

- [ ] Tap sur une ligne exercice → C2.

### 17. Auto-review

**Score global : 9.2/10 — STATUS : FROZEN**

## C5. Séance en cours

L'écran le plus critique du produit — usage sous contrainte physique et temporelle en salle.

### 1. Objectif

Permettre de dérouler une séance active : logguer les séries exercice par exercice avec un formulaire adapté au type d'exercice, gérer le repos entre séries, ajouter des exercices non prévus, et transitionner vers la finalisation (C6).

### 2. Utilisateur

Pratiquant, en salle, pendant l'effort — écran le plus sollicité et le plus critique en usabilité one-hand.

### 3. Entrées / Sorties

- Entrées : depuis C4 (template) ou C3 (séance libre, template=null).

- Sorties : "Terminer la séance" → C6 ; "Ajouter un exercice" → C1 en mode Select (modal) ; tap sur une ligne existante → édition inline.

### 4. Navigation

Pas de bouton retour classique pendant une séance active — un retour accidentel ne doit pas interrompre la séance (confirmation si sortie tentée avec des séries déjà loguées).

### 5. Layout

Header : titre auto-généré, chrono écoulé, lien "Terminer". Corps scrollable : une section par exercice. Widget timer de repos : bandeau sticky en bas, non-bloquant. Bouton "Ajouter un exercice" en bas de liste.

### 6. Sections détaillées

**Header** : titre auto-généré (nom du template, ou "Séance libre" + date), chrono écoulé depuis start_time, lien "Terminer".

**Par exercice** : nom + cible du template si applicable, liste des séries déjà loguées, formulaire d'ajout adapté au type.

**Widget timer de repos** : compte à rebours, boutons +15s/-15s, bouton "Passer". Démarre automatiquement à la validation d'une série, non-bloquant.

### 7. Formulaires adaptatifs par exercise_type

| exercise_type       | Champs affichés          | Label spécifique                       |
|---------------------|--------------------------|----------------------------------------|
| WEIGHT_REPS         | Poids (kg) + Répétitions | Poids, Répétitions                     |
| BODYWEIGHT_WEIGHTED | Poids (kg) + Répétitions | Charge additionnelle, Répétitions      |
| BODYWEIGHT_ASSISTED | Poids (kg) + Répétitions | Assistance, Répétitions                |
| REPS_ONLY           | Répétitions uniquement   | Répétitions                            |
| DURATION            | Durée (mm:ss)            | Durée                                  |
| DISTANCE_DURATION   | Durée (mm:ss) + notes    | Durée, notes = Distance (repli assumé) |

Champ RPE (1-10, sélecteur compact) : optionnel, disponible sauf sur DURATION/DISTANCE_DURATION. Toggle "Échauffement" (is_warmup) visible partout. Toggle secondaire discret "Échec musculaire" (is_failure) accessible via une option secondaire (appui long).

### 8. Inventaire composants

| Composant         | Rôle                           | Variantes                | États                                 | Interactions                       |
|-------------------|--------------------------------|--------------------------|---------------------------------------|------------------------------------|
| SessionHeader     | Titre + chrono + lien Terminer | —                        | Running                               | Tap Terminer → C6                  |
| ExerciseSection   | Groupe de séries par exercice  | Avec/sans cible template | Default                               | —                                  |
| SetRow (loguée)   | Série déjà enregistrée         | Normal, Warmup, Failure  | Default, Édition inline, Pending sync | Tap → édition, Swipe → suppression |
| SetInputForm      | Formulaire d'ajout adapté      | 6 variantes              | Vide, Rempli, Erreur                  | Saisie, tap Valider                |
| RestTimerWidget   | Timer non-bloquant             | Actif, Réduit            | Countdown, Skipped                    | Tap +15s/-15s/Passer               |
| AddExerciseButton | Ajout d'exercice hors plan     | —                        | Default                               | Tap → C1 Select                    |

### 9. États écran

Default (déroulé normal), édition inline sur une série, RestTimerWidget actif/inactif, Pending sync sur une série en cas de perte réseau.

### 10. Business rules

- BR-1 : le formulaire affiché dépend strictement de exercise.exercise_type, jamais un formulaire générique unique.

- BR-2 : validation client avant POST /api/lift/set/ : poids > 0 si applicable, reps ≥ 1 si applicable (compense l'absence de validators backend).

- BR-3 : set_number auto-incrémenté côté client par exercice, jamais saisi manuellement.

- BR-4 : à la validation d'une série, le RestTimerWidget démarre avec pour durée par défaut TemplateExercise.rest_seconds si template, sinon 90s par défaut (séance libre), ajustable en direct.

- BR-5 : le temps de repos réellement écoulé est enregistré via PATCH sur la série qui vient d'être complétée.

- BR-6 : "Terminer la séance" ne fait qu'une navigation vers C6 — aucune finalisation ni confirmation à ce stade.

- BR-7 : le titre de la séance est généré automatiquement à la création, non modifiable sur cet écran (édition possible en C6).

### 11. Cas limites

Sortie tentée avec au moins 1 série loguée → confirmation légère ; sans série, sortie libre. Exercice ajouté hors template → aucune cible affichée. Édition d'une série pendant que le timer est actif → n'interrompt pas le timer. Perte réseau → écriture optimiste + retry, série visible en état Pending sync.

### 12. Accessibilité

Chaque champ correctement labellisé selon le type actif. RestTimerWidget : décompte annoncé périodiquement (30s, 10s, 0s), pas en continu. Cibles tactiles ≥44×44pt malgré la densité.

### 13. Responsive React Native

KeyboardAvoidingView critique ici vu la fréquence de saisie. RestTimerWidget sticky ne masque jamais le formulaire actif.

### 14. Performance

Cible ≤200ms pour POST /api/lift/set/ (fréquence élevée, 15-30 séries/séance). Écriture optimiste avec rollback visuel en cas d'erreur serveur.

### 15. Dépendances

POST/PATCH/DELETE /api/lift/set/ (fonctionnels). Dépendance backend notée non bloquante : absence de champ distance sur Set pour DISTANCE_DURATION. Écriture optimiste + file de retry basique à construire côté frontend.

### 16. Anti-patterns à éviter

Ne jamais afficher un formulaire poids+reps pour un exercice DURATION. Ne jamais bloquer la validation d'une nouvelle série parce que le timer précédent est encore actif. Ne pas perdre les séries loguées en cas de coupure réseau.

### 17. Acceptance Criteria

- [ ] Le formulaire affiché correspond exactement au exercise_type (6 cas testés).

- [ ] Validation client bloque poids ≤0 et reps <1 avant tout appel réseau.

- [ ] Le widget de repos démarre automatiquement, n'empêche jamais de logguer une série suivante.

- [ ] Le temps de repos réel est correctement PATCHé sur la série précédente.

- [ ] Ajout d'exercice hors template fonctionne et s'affiche sans cible.

- [ ] Sortie accidentelle avec séries loguées déclenche une confirmation.

- [ ] "Terminer" navigue vers C6 sans aucune écriture de finalisation.

### 18. Auto-review

**Score global : 9.1/10 (point délicat : DISTANCE_DURATION, repli assumé et isolé) — STATUS : FROZEN**

## C6. Finaliser la séance

Écran redéfini en cours de conception : initialement un simple résumé en lecture seule (BL-050), étendu sur demande explicite à un flow éditable (titre, photo, stats) avant sauvegarde définitive.

### 1. Objectif

Permettre de revoir, enrichir (titre, note, photo) et confirmer une séance avant sauvegarde définitive, avec un retour visuel valorisant (volume, durée, PRs battus).

### 2. Utilisateur

Pratiquant venant de terminer l'effort — moment de redescente, tolère plus de friction qu'en plein effort.

### 3. Entrées / Sorties

- Entrées : depuis C5 uniquement (tap "Terminer").

- Sorties : "Enregistrer la séance" → B1 ; "Annuler la séance" → B1 (après suppression) ; retour natif → C5.

### 4. Navigation

Retour natif possible vers C5 (la session existe déjà en base mais n'est pas finalisée). Pas de tab bar visible.

### 5. Layout

Header "Séance terminée" (flèche discrète vers C5). Champ titre éditable. Bloc stats en avant. Section photo. Champ notes. Deux CTA : "Enregistrer la séance" (primaire), "Annuler la séance" (destructif, discret).

### 6. Sections détaillées

**Titre** : TextInput pré-rempli avec le titre auto-généré, requis (revient au titre par défaut si vidé plutôt que de bloquer).

**Stats** : volume total (même formule que B1), durée (end_time - start_time, non modifiable), nombre de séries, nombre d'exercices, encart "Nouveau PR" par exercice le cas échéant (même formule Epley que B1).

**Photo** : zone tap "Ajouter une photo" (caméra ou galerie), aperçu avec suppression/remplacement, upload en arrière-plan dès la sélection, best-effort.

**Notes** : TextInput multiligne optionnel, mappé sur WorkoutSession.notes.

**Actions** : "Enregistrer la séance" (primaire), "Annuler la séance" (texte discret, rouge, avec confirmation).

### 7. Inventaire composants

| Composant                     | Rôle                        | Variantes                        | États                          | Interactions                |
|-------------------------------|-----------------------------|----------------------------------|--------------------------------|-----------------------------|
| EditableTitleInput            | Titre de la séance          | —                                | Default, Focus, Empty→fallback | Saisie                      |
| StatSummaryBlock              | Récap volume/durée/séries   | —                                | Default                        | Aucune                      |
| PRHighlightBanner             | Mise en avant des PR battus | 0, 1, N PRs                      | Caché si aucun                 | Aucune                      |
| PhotoPicker                   | Ajout/suppression photo     | Vide, Uploading, Uploaded, Error | —                              | Tap → picker natif          |
| NotesInput                    | Note libre                  | —                                | Default                        | Saisie                      |
| PrimaryButton Enregistrer     | Finalisation                | —                                | Enabled, Loading               | Tap → PATCH session         |
| DestructiveTextButton Annuler | Suppression complète        | —                                | Default                        | Tap → confirmation → DELETE |
| ConfirmDialog                 | Confirmation d'annulation   | —                                | Caché/Visible                  | Confirmer/Annuler           |

### 8. États écran

Default, Loading (calcul stats, skeleton bref), Photo Uploading (indicateur, reste du formulaire utilisable), Photo Error (n'empêche pas Enregistrer), Saving (formulaire désactivé), Confirmation annulation (dialog explicite, action irréversible).

### 9. Business rules

- BR-1 : "Enregistrer" déclenche PATCH avec title, notes, end_time, duration_minutes (calculé automatiquement, non éditable).

- BR-2 : le calcul du volume/PRs réutilise exactement les mêmes formules que B1.

- BR-3 : l'upload photo est indépendant du PATCH de finalisation, un échec ne bloque jamais l'enregistrement du reste.

- BR-4 : "Annuler la séance" déclenche DELETE (cascade sur les Set) après confirmation explicite.

- BR-5 : un titre vidé revient silencieusement au titre auto-généré plutôt que de bloquer.

### 10. Cas limites

Séance avec 0 série arrivant sur C6 → stats à zéro, "Enregistrer" reste possible, "Annuler" probablement plus pertinent. PR battu sur un exercice ajouté hors template → calcul fonctionne quand même. Retour vers C5 puis re-tap "Terminer" → recalcul à jour. Perte réseau au moment d'Enregistrer → écriture optimiste avec retry.

### 11. Accessibilité

PRHighlightBanner annoncé prioritairement (accessibilityLiveRegion="assertive"). Permissions caméra/galerie avec message clair. Bouton destructif jamais adjacent immédiat du bouton primaire.

### 12. Responsive React Native

PhotoPicker de taille raisonnable, scroll vertical si nécessaire sur petit device.

### 13. Performance

Photo compressée côté client avant upload.

### 14. Sécurité

Upload lié strictement à l'utilisateur propriétaire. Permissions device demandées explicitement.

### 15. Dépendances

Nouvelle dépendance backend bloquante (partie photo) : champ photo/photo_url à ajouter sur WorkoutSession, endpoint d'upload dédié, stockage de fichier configuré (S3 ou équivalent, inexistant aujourd'hui). PATCH/DELETE /api/lift/workout_session/{id}/ (fonctionnels hors photo). expo-image-picker (nouvelle dépendance frontend).

### 16. Anti-patterns à éviter

Ne pas bloquer "Enregistrer" en attendant la fin de l'upload photo. Ne pas permettre un titre vide en base. Ne pas placer le bouton d'annulation de façon à risquer un tap accidentel.

### 17. Acceptance Criteria

- [ ] Titre pré-rempli, éditable, ne peut jamais être vide en base.

- [ ] Stats cohérentes avec les séries réellement loguées (hors échauffement).

- [ ] PR détecté et mis en avant quand un 1RM estimé dépasse le record précédent.

- [ ] Photo ajoutée uploadée en arrière-plan, échec non bloquant.

- [ ] "Annuler la séance" supprime la session et toutes ses séries après confirmation.

- [ ] Retour vers C5 depuis C6 permet de reprendre l'édition sans perte de données.

### 18. Auto-review

**Score global : 9.0/10 (scope étendu par décision produit au-delà de BL-050, transparence documentée plutôt qu'une lacune de la spec elle-même) — STATUS : FROZEN**

## C7. Historique des séances

### 1. Objectif

Permettre de retrouver et parcourir l'ensemble des séances passées, organisées par mois.

### 2. Utilisateur

Pratiquant souhaitant consulter son passé d'entraînement — usage occasionnel, exploratoire.

### 3. Entrées / Sorties

- Entrées : SegmentedControl du tab Lift (segment Historique), lien depuis B1, lien depuis C6.

- Sorties : tap sur une séance → C8.

### 4. Navigation

Racine du segment Historique — SegmentedControl toujours visible en header.

### 5. Layout

Header (titre + SegmentedControl). Liste scrollable groupée par mois, en-têtes sticky.

### 6. Sections détaillées

**Groupes mensuels** : en-tête sticky par mois, séances triées par date décroissante à l'intérieur du groupe, mois sans séance non affichés.

**Ligne de séance** : miniature photo si présente (sinon pas d'espace réservé), titre, date, durée.

### 7. Inventaire composants

| Composant            | Rôle                       | Variantes           | États            | Interactions |
|----------------------|----------------------------|---------------------|------------------|--------------|
| MonthSectionHeader   | En-tête de groupe mensuel  | —                   | Sticky au scroll | Aucune       |
| SessionListItem      | Ligne de séance            | Avec/sans miniature | Default, Pressed | Tap → C8     |
| PullToRefreshControl | Rafraîchissement           | —                   | Idle, Refreshing | Pull down    |
| EmptyHistoryState    | Aucune séance jamais faite | —                   | Visible si vide  | CTA → C3     |

### 8. États écran

Default, Loading (skeleton générique), Empty ("Lancez votre première séance !" + CTA vers C3), Error (bannière + retry), Loading page suivante (pagination standard).

### 9. Business rules

- BR-1 : regroupement par mois côté client sur les données déjà triées par le backend.

- BR-2 : la miniature photo n'occupe de l'espace que si photo est renseigné.

- BR-3 : la durée affichée = duration_minutes, calculé et figé à la sauvegarde en C6.

### 10. Cas limites

Séance à cheval sur minuit → groupée selon le champ date (date de début). Pagination coupant un mois en deux pages → pas de doublon d'en-tête. Une seule séance jamais faite → un seul groupe mensuel.

### 11. Accessibilité

MonthSectionHeader avec accessibilityRole="header". Label combiné par SessionListItem.

### 12. Responsive React Native

SectionList (pas FlatList simple) pour le regroupement natif et le sticky header.

### 13. Performance

Miniatures en chargement lazy, résolution réduite (thumbnail).

### 14. Dépendances

GET /api/lift/workout_session/ (fonctionnel). Champ photo sur WorkoutSession (même dépendance que C6).

### 15. Anti-patterns à éviter

Ne pas réserver un espace vide pour une photo absente. Ne pas dupliquer les en-têtes de mois à cheval sur une pagination.

### 16. Acceptance Criteria

- [ ] Séances correctement groupées par mois, en-têtes sticky au scroll.

- [ ] Miniature affichée uniquement quand présente.

- [ ] État vide affiche le message d'encouragement + CTA vers C3.

- [ ] Pagination ne duplique jamais un en-tête de mois.

- [ ] Tap sur une ligne → C8 avec le bon session_id.

### 17. Auto-review

**Score global : 9.2/10 — STATUS : FROZEN**

## C8. Détail d'une séance passée

### 1. Objectif

Consulter le détail complet d'une séance passée et permettre sa correction ou sa suppression — mêmes capacités d'édition que C5/C6, sans les éléments temps réel.

### 2. Utilisateur

Pratiquant consultant son historique, éventuellement pour corriger une donnée mal saisie sur le moment.

### 3. Entrées / Sorties

- Entrées : depuis C7 uniquement.

- Sorties : retour C7 ; ajout d'exercice → C1 (Select) ; suppression → retour C7.

### 4. Navigation

Écran empilé (push depuis C7), retour natif standard.

### 5. Layout

Header (retour + titre éditable inline). Bloc stats (réutilisation C6). Section photo (réutilisation C6). Section notes (réutilisation C6). Sections par exercice avec séries éditables (réutilisation C5, sans RestTimerWidget). Bouton "Ajouter un exercice". Action "Supprimer la séance".

### 6. Sections détaillées

**Identité & stats** : titre éditable, date (non éditable), durée (non éditable), volume total, PRs signalés.

**Photo & notes** : identique à C6.

**Exercices** : identique à C5 (formulaire adaptatif par exercise_type), toute modification déclenche un appel immédiat, pas de mode brouillon.

### 7. Inventaire composants

Entièrement réutilisé de C5 et C6 : EditableTitleInput, StatSummaryBlock, PRHighlightBanner, PhotoPicker, NotesInput, ExerciseSection, SetRow, SetInputForm, AddExerciseButton, DestructiveTextButton ("Supprimer la séance"), ConfirmDialog. Aucun nouveau composant nécessaire.

### 8. États écran

Default, Loading, Saving (indicateur discret par champ, pas de blocage global), Confirmation suppression (action irréversible).

### 9. Business rules

- BR-1 : toute édition est persistée immédiatement, pas de bouton Enregistrer global (différent de C6 où la sauvegarde est un geste explicite de fin de flow).

- BR-2 : la suppression suit exactement le même mécanisme que C6 (DELETE cascade).

- BR-3 : les stats (volume, PRs) sont recalculées après toute modification de série.

### 10. Cas limites

Correction d'une série qui fait disparaître un PR précédemment affiché → recalcul immédiat, cohérent partout. Suppression du dernier exercice → la séance reste en base avec 0 exercice tant qu'elle n'est pas explicitement supprimée. Édition concurrente multi-device → hors scope MVP, last-write-wins implicite.

### 11. Accessibilité

Identique aux patterns déjà établis en C5/C6.

### 12. Responsive React Native

Identique aux patterns C5/C6.

### 13. Performance

Identique aux cibles déjà définies (≤200ms pour les écritures de séries).

### 14. Dépendances

Backend à corriger : SetSerializer.exercise doit être nested (name + muscle_group) au lieu d'un UUID brut — identifié ici, applicable aussi à l'affichage des séries en C5. Tous les autres endpoints déjà fonctionnels.

### 15. Anti-patterns à éviter

Ne pas introduire un mode brouillon avec sauvegarde différée. Ne pas laisser des stats obsolètes affichées après une correction.

### 16. Acceptance Criteria

- [ ] Nom des exercices affiché correctement dans la liste des séries (dépend de la correction backend).

- [ ] Édition titre/notes/série persistée immédiatement.

- [ ] Recalcul correct des stats/PRs après toute modification.

- [ ] Suppression de la séance fonctionne avec confirmation, retour vers C7.

- [ ] Ajout d'un exercice ou d'une série à une séance passée fonctionne comme en C5.

### 17. Auto-review

**Score global : 9.3/10 — STATUS : FROZEN**

## Domaine D — Profil

## D1. Profil

### 1. Objectif

Consulter et modifier son identité (pseudo, prénom, nom), gérer la sécurité du compte (mot de passe), exercer ses droits RGPD (export, suppression), et se déconnecter.

### 2. Utilisateur

Tout utilisateur connecté — usage occasionnel, pas récurrent comme B1/C3.

### 3. Entrées / Sorties

- Entrées : tab Profile.

- Sorties : déconnexion → A2 ; suppression de compte → A2 (compte détruit) ; changement mot de passe → reste sur D1 avec confirmation.

### 4. Navigation

Racine du tab Profile — pas de bouton retour.

### 5. Layout

Header (pseudo + email lecture seule + date d'inscription). Section Informations (pseudo, prénom, nom éditables). Section Sécurité (changer le mot de passe). Section Mes données (export, suppression). Bouton Déconnexion en bas, séparé visuellement.

### 6. Sections détaillées

**Identité** : pseudo (en tête), email (sous-texte, non éditable), "Membre depuis {date}".

**Informations éditables** : pseudo (même validation qu'à l'inscription), first_name, last_name (optionnels). Bouton "Enregistrer" unique pour cette section.

**Sécurité** : "Changer mon mot de passe" → écran/modal avec 3 champs (actuel, nouveau, confirmation), mêmes règles de force que A3.

**Mes données** : "Exporter mes données" (traitement asynchrone, livraison par email), "Supprimer mon compte" (destructif, confirmation renforcée par re-saisie du mot de passe).

**Déconnexion** : bouton séparé visuellement des actions destructives.

### 7. Inventaire composants

| Composant                  | Rôle                           | Variantes | États                           | Interactions                   |
|----------------------------|--------------------------------|-----------|---------------------------------|--------------------------------|
| ProfileHeader              | Pseudo/email/date              | —         | Default                         | Aucune                         |
| EditableProfileForm        | Pseudo/prénom/nom              | —         | Default, Editing, Saving, Error | Saisie, tap Enregistrer        |
| ChangePasswordAction       | Lien vers le sous-flow         | —         | Default                         | Tap → modal/écran dédié        |
| ChangePasswordForm         | 3 champs mdp                   | —         | Default, Error, Success         | Saisie, submit                 |
| ExportDataAction           | Déclenche l'export             | —         | Default, Requested, Error       | Tap                            |
| DeleteAccountAction        | Suppression compte             | —         | Default                         | Tap → confirmation renforcée   |
| DeleteAccountConfirmDialog | Confirmation avec mot de passe | —         | Default, Error                  | Saisie mdp, confirmer          |
| LogoutButton               | Déconnexion                    | —         | Default                         | Tap → confirmation légère → A2 |

### 8. États écran

Default, Loading (skeleton), Saving (édition profil), Error (pseudo déjà pris — inline), Error (changement mdp, ancien mdp incorrect — inline), Export en attente ("Demande envoyée, tu recevras un lien par email"), Suppression en cours (spinner bref puis redirection A2 avec confirmation).

### 9. Business rules

- BR-1 : PATCH /api/auth/me/ pour pseudo/prénom/nom — nécessite la correction backend notée (ajout de pseudo dans PrivateUserSerializer).

- BR-2 : le changement de mot de passe exige la saisie de l'ancien mot de passe avant d'accepter le nouveau.

- BR-3 : la suppression de compte exige une re-saisie du mot de passe dans DeleteAccountConfirmDialog, pas juste un OK/Annuler textuel.

- BR-4 : la déconnexion invalide les tokens localement (purge SecureStore).

- BR-5 : l'export de données est traité de façon asynchrone, livraison par email ou notification, format exact à trancher techniquement.

### 10. Cas limites

Pseudo modifié pour une valeur déjà prise → erreur inline, même traitement qu'à l'inscription. Suppression de compte demandée pendant une synchronisation offline en cours → hors scope MVP, cas rare non traité spécifiquement. Changement de mot de passe réussi avec d'autres sessions/devices connectés → dépend de la stratégie JWT globale.

### 11. Accessibilité

DeleteAccountConfirmDialog : focus initial sur le champ mot de passe, pas sur le bouton de confirmation. Erreurs de formulaire suivant le pattern déjà établi (labels explicites, live region).

### 12. Responsive React Native

Formulaires standards, KeyboardAvoidingView sur EditableProfileForm et ChangePasswordForm.

### 13. Performance

Écran peu sollicité, pas d'enjeu de performance particulier.

### 14. Sécurité

BR-2/BR-3 (vérification du mot de passe actuel) sont les garde-fous principaux — actions sensibles jamais accessibles sans re-authentification légère. Export scopé strictement à l'utilisateur demandeur.

### 15. Dépendances

Backend à corriger : ajouter pseudo à PrivateUserSerializer. Nouveaux endpoints à créer (aucun n'existe aujourd'hui) : POST /api/auth/change-password/, GET /api/auth/me/export/ (RGPD), DELETE /api/auth/me/ ou POST /api/auth/me/delete/ (RGPD). GET/PATCH /api/auth/me/ (déjà fonctionnel pour le reste).

### 16. Anti-patterns à éviter

Ne pas permettre la suppression de compte avec une simple confirmation textuelle sans re-authentification. Ne pas placer "Supprimer mon compte" visuellement proche de "Déconnexion". Ne pas bloquer l'écran entier pendant la préparation de l'export.

### 17. Acceptance Criteria

- [ ] Pseudo/prénom/nom modifiables et persistés (après correction backend du serializer).

- [ ] Pseudo dupliqué → erreur inline, pas de sauvegarde silencieuse en échec.

- [ ] Changement de mot de passe exige l'ancien mot de passe correct.

- [ ] Suppression de compte exige une re-saisie du mot de passe, action irréversible clairement présentée comme telle.

- [ ] Export de données déclenché de façon asynchrone, pas de blocage UI.

- [ ] Déconnexion purge SecureStore et redirige vers A2.

### 18. Auto-review

**Score global : 9.1/10 (RGPD + changement mdp = extensions de scope demandées en direct, hors stories existantes, correctement documentées ; sécurité 10/10 grâce à la re-authentification systématique) — STATUS : FROZEN**

## Phase 5 — Revue globale de cohérence

### 1. Screen Map finale

13 écrans figés répartis en 4 domaines — voir Phase 1 pour le détail complet. Écart de 2 écrans vs la map initiale (11 écrans), justifié par deux décisions prises en cours de conception : le flow de réinitialisation de mot de passe a nécessité deux écrans distincts (A4 + A5) suite au choix du deep link, et le scope de C6 a été étendu au-delà du BL-050 initial.

### 2. Correction de cohérence appliquée

**C1 — Navigation** (corrigée pour refléter la décision prise en C3, postérieure au gel initial de C1) : le mode Browse est accessible via le segment "Exercices" du SegmentedControl partagé (C3/C7/C1), pas un tab autonome. Le mode Select reste un modal indépendant lancé depuis C5, sans SegmentedControl visible. Le reste de la spec C1 (composants, règles métier, critères d'acceptation) reste inchangé.

### 3. Vérification de cohérence transverse

| Élément partagé                                                                                         | Écrans concernés                                    | Cohérent                                                             |
|---------------------------------------------------------------------------------------------------------|-----------------------------------------------------|----------------------------------------------------------------------|
| Formule volume (Σ poids×reps, hors is_warmup)                                                           | B1, C6, C8                                          | Oui — identique partout                                              |
| Formule 1RM estimé (Epley)                                                                              | B1, C6, C8                                          | Oui — identique partout                                              |
| Pattern erreur (bannière non liée à un champ vs inline liée à un champ)                                 | A2, A3, A4, A5, C1, D1                              | Oui — appliqué uniformément une fois établi en A2/A3                 |
| Composants réutilisés (EmailInput, PasswordInput, MuscleGroupIcon, ExerciseSection/SetRow/SetInputForm) | A2/A3/A4/A5 ; C1/C2/C4 ; C5/C8                      | Oui — pas de réinvention d'un composant équivalent sous un autre nom |
| Accès optimiste offline (ne jamais bloquer sur un échec réseau non critique)                            | A1, B1, C4, C5                                      | Oui — principe appliqué de façon cohérente                           |
| Confirmation renforcée sur action destructive                                                           | C6/C8 (suppression séance), D1 (suppression compte) | Oui — friction proportionnelle à la gravité                          |
| SegmentedControl Séances/Historique/Exercices                                                           | C3, C7, C1(Browse)                                  | Oui — corrigé au point 2                                             |

Aucune incohérence de fond détectée entre écrans — les patterns établis tôt (A2) ont été appliqués par cohérence plutôt que réinventés à chaque écran suivant.

### 4. Dépendances backend consolidées

**Corrections sur l'existant (rapides, pas de nouvelle infra)**

- ExerciseViewset.filter_backends : ajouter DjangoFilterBackend (C1 — filtre groupe musculaire cassé).

- SetSerializer.exercise : nester name/muscle_group au lieu d'un UUID brut (C8, impacte aussi C5).

- UserRegistrationSerializer.validate() : message d'erreur vide sur mismatch password (A3).

- PrivateUserSerializer : ajouter le champ pseudo (D1).

- UserRegistrationSerializer.create() : appeler validate_password() (A3).

**Nouveaux endpoints à construire**

- GET /api/lift/stats/weekly/, GET /api/lift/stats/prs/ (B1).

- POST /api/auth/password-reset/request/, POST /api/auth/password-reset/confirm/ (A4/A5).

- POST /api/auth/change-password/ (D1).

- GET /api/auth/me/export/, suppression compte (D1, RGPD).

**Nouvelle infrastructure (effort le plus significatif)**

- Stockage/upload photo (champ sur WorkoutSession + endpoint + S3 ou équivalent) — C6, impacte aussi C7/C8.

- Backend d'envoi d'email (aucun configuré actuellement) — A4.

- Deep links Universal Links (iOS) / App Links (Android) — A5.

- Assets graphiques : 18 icônes groupe musculaire (C1/C3/C4), silhouettes anatomiques avant/arrière (C2).

- Champ distance manquant sur Set pour DISTANCE_DURATION (C5) — repli assumé sur notes en attendant.

**Rappels de sécurité déjà connus, non liés à un écran précis mais affectant tout le domaine A**

DEBUG toujours vrai (bug string), DEFAULT_PERMISSION_CLASSES = AllowAny par défaut, ACCESS_TOKEN_LIFETIME trop long (180min), REFRESH_TOKEN_LIFETIME probablement trop court pour l'usage réel (1 jour), pas de rate limiting sur le login.

### 5. Score global du système

| Dimension                                                           | Évaluation                                                                                                                                   |
|---------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| Couverture fonctionnelle du périmètre validé (Auth + Lift + Profil) | Complète                                                                                                                                     |
| Cohérence inter-écrans                                              | Élevée — aucune contradiction de fond                                                                                                        |
| Traçabilité specs vers code réel                                    | Chaque écran référence ses sources et ses écarts avec le code actuel                                                                         |
| Transparence sur les extensions de scope                            | Chaque extension (photo, RGPD, changement mdp, reset password) explicitement actée comme une décision produit, pas une invention silencieuse |
| Dette technique documentée                                          | 5 corrections rapides + 4 nouveaux endpoints + 4 chantiers d'infra clairement isolés et priorisables indépendamment                          |

### 6. Prochaines étapes recommandées

Cette documentation est prête à servir de base d'implémentation React Native pour le périmètre validé (Auth + Lift + Profil). Trois chantiers restent ouverts en dehors du périmètre design pur :

1.  Rédaction du contenu CGU / Politique de confidentialité (juridique, pas design d'interface).

2.  Priorisation des 4 chantiers d'infrastructure backend (photo/upload, email, deep link, assets graphiques) — probablement à séquencer avant certains écrans plutôt qu'en parallèle.

3.  Décision sur les gaps de sécurité pré-existants du domaine A, indépendants de cette V1 mais qui la rendent vulnérable si non traités avant mise en production.
