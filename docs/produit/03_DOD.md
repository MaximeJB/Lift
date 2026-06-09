# 03_DOD.md — Définitions of Done (DoD)

**Date** : 08/06/2026  
**Sources** : `WORKFLOW_SOLO.md:5.1`, `ROADMAP.md` (DoD par tâche), `METHODES.md:9`

---

## Pourquoi une DoD ?

Le projet illustre exactement le problème qu'une DoD prévient : `liftapp/models.py:38` contient `exercise_type =` (SyntaxError). Les 4 champs ont été commencés mais aucun n'a été terminé selon une DoD claire. Le résultat : le serveur ne démarre pas depuis le 30/01/2026 (4 mois).

**Règle** : une story n'est "terminée" que quand elle passe TOUTES les cases de la DoD applicable. Pas de half-done.

---

## DoD GLOBALE (applicable à toute story)

Ces critères s'appliquent à chaque item du backlog sans exception.

- [ ] Le code Python compile sans erreur (`python manage.py check` passe)
- [ ] Les tests unitaires passent (`python manage.py test` ou `pytest` — 0 erreur)
- [ ] Si le modèle a changé : migration créée (`makemigrations`) ET appliquée (`migrate`) sans erreur
- [ ] L'endpoint ou la fonctionnalité est testable manuellement (Postman / expo-go)
- [ ] Pas de régression sur les fonctionnalités existantes (les tests qui passaient avant passent encore)
- [ ] Le code est commité avec un message au format `type: description courte` (source : `WORKFLOW_SOLO.md:8.2`)
- [ ] Aucun `print()` ou `breakpoint()` de debug oublié dans le code
- [ ] Aucun secret en dur (clé API, mot de passe) dans le commit
- [ ] Aucune variable ou import inutilisé

---

## DoD SPÉCIALISÉE — Backend / API

Applicable à toute story touchant models, serializers, views ou URLs Django.

- [ ] Le modèle respecte les conventions : `id = UUIDField`, `created_at`, `updated_at`, `synced_at` pour les entités qui participent à l'offline-first (source : `SYSTEM_DESIGN.md:5.2`)
- [ ] Les champs nullables ont explicitement `blank=True, null=True`
- [ ] Chaque `ForeignKey` a un `on_delete` explicite et documenté si non-trivial
- [ ] Le serializer expose uniquement les champs nécessaires (pas de fuite de données privées)
- [ ] Les champs en lecture seule (`id`, `user`, timestamps) sont dans `read_only_fields`
- [ ] Le ViewSet a des `permission_classes` explicites (pas de dépendance au défaut AllowAny de `settings.py:173`)
- [ ] Le `get_queryset()` filtre les données au périmètre de l'utilisateur connecté (IsOwner)
- [ ] `perform_create()` injecte `user=self.request.user` si le modèle a un champ `user`
- [ ] L'endpoint répond aux codes HTTP corrects : 200/201/204 pour les succès, 400/401/403/404 pour les erreurs
- [ ] Les `__str__()` sont définis sur tous les modèles (lisibilité dans l'admin Django)
- [ ] Le modèle est enregistré dans `admin.py` (débogage facilité)

---

## DoD SPÉCIALISÉE — Données / ETL

Applicable aux management commands d'import et aux scripts de données.

- [ ] La commande est idempotente : la relancer deux fois produit le même résultat (pas de doublons, `update_or_create` ou `ignore_conflicts=True`)
- [ ] La commande affiche un rapport de fin : nombre d'éléments traités, créés, mis à jour, ignorés, en erreur
- [ ] Les données non mappables sont loggées (pas silencieusement ignorées)
- [ ] Un test manuel vérifie que `python manage.py <commande>` s'exécute sans erreur
- [ ] Les fichiers source (JSON) sont clairement documentés (origine, date de capture, format)
- [ ] La commande peut être annulée (transaction atomique si nécessaire)

---

## DoD SPÉCIALISÉE — Frontend React Native

Applicable à toute story touchant un écran, un composant ou la navigation Expo.

- [ ] L'écran s'affiche sans erreur sur simulateur iOS ET Android (ou Expo Go)
- [ ] Les appels API passent par un service centralisé (pas de `fetch()` inline dans les composants)
- [ ] Le token JWT est inclus dans le header `Authorization: Bearer <token>` pour les requêtes authentifiées
- [ ] Un état de chargement (spinner / skeleton) est affiché pendant les appels API
- [ ] Un message d'erreur lisible s'affiche si l'API échoue (pas d'écran blanc)
- [ ] Les inputs utilisateur sont validés côté client avant l'envoi (poids > 0, reps > 0)
- [ ] La navigation fonctionne dans les deux sens (aller ET revenir)
- [ ] L'écran est utilisable avec un clavier ouvert (scroll, `KeyboardAvoidingView`)
- [ ] Le code est dans le bon répertoire selon la structure Expo Router

---

## DoD SPÉCIALISÉE — Sécurité

Applicable à toute story touchant l'authentification, les permissions ou les données utilisateur.

- [ ] L'endpoint ne répond qu'aux utilisateurs authentifiés si les données sont privées
- [ ] Un utilisateur A ne peut pas lire ni modifier les données d'un utilisateur B (test explicite)
- [ ] Aucun token, clé secrète ou credential n'est loggé (ni dans le code, ni dans les logs)
- [ ] Les erreurs d'authentification retournent 401 (pas d'information sur l'existence du compte)
- [ ] Les erreurs de permission retournent 403 (pas de fuite de données sur l'objet refusé)
- [ ] Le champ `password` est en `write_only=True` dans le serializer et n'est jamais retourné
- [ ] `DEBUG = False` dans l'environnement de staging/production (pas de traceback exposé)
- [ ] `SECRET_KEY` chargée depuis variable d'environnement (jamais codée en dur)

---

## Rappel des bugs actuels qui bloqueraient la DoD Globale

| Bug | Fichier | Ligne | DoD violée |
|-----|---------|-------|-----------|
| `exercise_type =` SyntaxError | `liftapp/models.py` | 38 | "Le code compile sans erreur" |
| `DEBUG` est toujours True | `Lift/settings.py` | 31 | "Pas de regression" (sécurité) |
| `video_url` sans blank/null | `liftapp/models.py` | 35 | "Migration appliquée sans erreur" |
| `external_id` sans max_length | `liftapp/models.py` | 36 | "Le code compile sans erreur" |
| `DEFAULT_PERMISSION_CLASSES = AllowAny` | `Lift/settings.py` | 173 | "Permission filtre les données" |
