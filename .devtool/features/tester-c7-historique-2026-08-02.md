---
id: "tester-c7-historique-2026-08-02"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: "2026-08-03"
created: "2026-08-02T00:00:00.000Z"
modified: "2026-08-02T00:00:00.000Z"
completedAt: null
labels: ["demain", "test", "c7"]
order: "c7"
---
# À TESTER — L'historique des séances (C7)

**Objectif** : le troisième segment du tab Lift. Il n'avait jamais pu être testé faute de
séances en base — maintenant que C5 et C6 fonctionnent, il y en a.

Tab Lift → **Historique**.

1. **Avant toute séance** : l'état vide s'affiche avec le bouton « Démarrer une séance ».
   Le taper doit basculer sur le segment **Séances**, pas ouvrir un nouvel écran.
2. Après quelques séances : elles sont groupées **par mois**, l'en-tête portant
   `août 2026` en clair.
3. **Faire défiler** → l'en-tête de mois reste collé en haut tant que le groupe défile.
4. Les séances sont en **date décroissante**, la plus récente en premier.
5. Chaque ligne porte le titre, la date en `JJ/MM`, la durée et le volume.
6. Une séance **non finalisée** (quittée sans passer par C6) affiche `non finalisée` à la
   place de la durée — elle n'a pas de `duration_minutes`.
7. **Tirer vers le bas** → rafraîchissement, la liste se recharge.
8. Taper une séance → C8 s'ouvre sur son détail complet. Son propre ticket le couvre :
   `tester-c8-detail-seance-passee-2026-08-03`.
9. Avec plus de 25 séances : faire défiler jusqu'en bas → la page suivante se charge, et
   **aucun en-tête de mois n'apparaît deux fois** même si un mois est coupé entre deux
   pages.

## Connu, pas un bug

- Aucune miniature photo : le champ n'existe pas sur `WorkoutSession`, et la spec interdit
  de réserver un espace vide pour une image absente.
- C8 est un squelette : il affiche le titre et l'identifiant, rien de plus.
