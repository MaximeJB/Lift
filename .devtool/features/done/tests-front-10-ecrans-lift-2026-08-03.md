---
id: "tests-front-10-ecrans-lift-2026-08-03"
status: "done"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: "2026-08-03T00:00:00.000Z"
labels: ["tests", "frontend"]
order: "b05"
---
# Tests 10 — ecrans B1, C1, C2, C5, C6, C7, C8

**Objectif** : finir la couverture des ecrans, en visant les criteres d'acceptation.

- **B1** : CTA rendu avant tout etat, variation absente si semaine precedente a 0, cinq
  records au plus, un par exercice.
- **C1** : chips en OU, recherche et filtres combines, etat vide qui cite la requete.
- **C2** : cascade video, pause a la perte de focus, pas d'autoplay si animations reduites.
- **C5** : ecriture optimiste, reseau vers `NON SYNC`, refus serveur vers retrait,
  `set_number` par exercice, repos demarre a la validation.
- **C6** : titre vide vers repli silencieux, records calcules hors seance courante.
- **C7** : etat vide vers bascule de segment, pas de navigation.
- **C8** : edition persistee au blur, suppression d'une serie recalcule le volume.

---

## Clos le 03/08/2026

Fait le 03/08/2026. Voir `tests-front-11`, qui porte le bilan : 421 tests, 84,42% des instructions, seuils poses en cliquet.