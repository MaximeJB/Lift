---
id: "tests-front-09-ecrans-auth-et-profil-2026-08-03"
status: "done"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: "2026-08-03T00:00:00.000Z"
labels: ["tests", "frontend"]
order: "b04"
---
# Tests 09 — ecrans A2, A3 et D1

**Objectif** : les criteres d'acceptation de la spec, un test chacun.

## A2 — Login
- message generique, jamais quel champ est faux (anti-enumeration)
- « Reessayer » present SEULEMENT sur erreur reseau
- double-tap bloque pendant le chargement
- les valeurs saisies restent apres un echec

## A3 — Inscription
Les huit criteres de A3 §17, dont : mots de passe differents bloques **avant** tout appel
reseau, CGU non cochee et bouton inerte, erreurs email ET pseudo affichees ensemble.

## D1 — Profil
- pseudo verrouille hors fenetre, avec la date au libelle
- le bouton Enregistrer s'eteint quand rien n'a change
- deconnexion : purge, aucune navigation manuelle

---

## Clos le 03/08/2026

Fait le 03/08/2026. Voir `tests-front-11`, qui porte le bilan : 421 tests, 84,42% des instructions, seuils poses en cliquet.