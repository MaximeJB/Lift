---
id: "defauts-backend-reveles-par-les-tests-2026-08-03"
status: "done"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: "2026-08-03T00:00:00.000Z"
labels: ["backend", "securite", "bug"]
order: "aM"
---
# Six défauts backend, révélés par les tests des tickets 18 à 20

Chacun a **son test, déjà écrit**, marqué `xfail(strict=True)`. Corriger le défaut fait
passer le test, et le marqueur devient une erreur — c'est le signal qu'il faut le retirer.

```powershell
python -m pytest -q -rx     # liste les xfail et leur raison
```

## 1. On peut écrire une série dans la séance de quelqu'un d'autre — SÉCURITÉ

`test_impossible_decrire_une_serie_dans_la_seance_dun_autre`

`SetSerializer` ne vérifie pas que `workout_session` appartient à l'utilisateur
authentifié. `IsOwner` protège la lecture et la modification d'une série existante, pas sa
**création**. N'importe quel compte connaissant l'UUID d'une séance peut donc y injecter
des séries.

Correction : un `validate_workout_session` dans `SetSerializer`, qui compare la séance
visée à `self.context['request'].user`.

**FERME le 03/08/2026** par `SetSerializer.validate_workout_session`. Deux tests ajoutes
au passage : le PATCH qui deplacerait une serie chez autrui (400), et le cas normal qui
doit continuer de marcher (201).

Les cinq autres defauts ont desormais chacun leur propre ticket, prefixe `def-0*`.

## 2. Rafraîchir avec le jeton d'un compte supprimé renvoie 500

`test_le_refresh_dun_utilisateur_supprime_est_refuse`

SimpleJWT lève `CustomUser.DoesNotExist`, qui n'est rattrapée nulle part et remonte en
erreur serveur. Un compte supprimé dont un jeton traîne fait planter la requête au lieu
d'être éconduit par un 401.

## 3. Aucun validateur sur les séries

`test_un_poids_negatif_est_refuse` · `test_zero_repetition_est_refuse`

`Set.weight_kg` et `Set.reps` n'ont aucun `MinValueValidator`. C5 §9 BR-2 fait porter la
vérification au client — ce qui ne protège pas l'API.

## 4. Le refus de mot de passe n'a pas de message

`test_le_refus_de_mot_de_passe_porte_un_message_lisible`

`UserRegistrationSerializer.validate` lève `serializers.ValidationError()` **sans
argument**. C'est le défaut déjà contourné côté A3, qui compare les deux mots de passe
avant d'appeler l'API.

## 5. `validate_password()` de Django n'est jamais appelé

`test_un_mot_de_passe_trop_faible_est_refuse`

Un mot de passe de quatre caractères est accepté à l'inscription. La règle des 8
caractères d'A3 §9 BR-3 n'existe que côté client.

## 6. La rotation des refresh tokens n'invalide pas l'ancien

`test_lancien_refresh_reste_valable_apres_rotation` — **ce test passe**, il fige l'état
actuel plutôt que de réclamer un changement.

`ROTATE_REFRESH_TOKENS` est à `True` mais `BLACKLIST_AFTER_ROTATION` à `False` : l'ancien
jeton reste accepté jusqu'à son expiration, un jour plus tard. Un jeton volé avant une
déconnexion reste donc utilisable.

Activer la liste noire suppose d'ajouter `rest_framework_simplejwt.token_blacklist` aux
`INSTALLED_APPS` et de migrer. Décision à prendre, pas un oubli.

---

## Clos le 03/08/2026

Le defaut n°1 — ecriture dans la seance d'autrui — est corrige : `SetSerializer.validate_workout_session`, plus deux tests (POST et PATCH) et un test du cas nominal.

Les cinq restants sont redecoupes en tickets autonomes `f01` a `f07`, un par defaut, avec les etapes detaillees. Cette carte n'a plus d'objet.