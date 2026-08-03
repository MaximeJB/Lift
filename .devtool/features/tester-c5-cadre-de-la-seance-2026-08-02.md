---
id: "tester-c5-cadre-de-la-seance-2026-08-02"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: "2026-08-03"
created: "2026-08-02T00:00:00.000Z"
modified: "2026-08-02T00:00:00.000Z"
completedAt: null
labels: ["demain", "test", "c5"]
order: "c5"
---
# À TESTER — Le cadre de la séance (C5, lot 1)

**Objectif** : tout ce qui entoure l'enregistrement des séries. L'enregistrement lui-même et
le bandeau de repos sont couverts par le ticket
`tester-c5-enregistrement-des-series-2026-08-02` — celui-ci ne les répète pas.

Tab Lift → Séances → **Séance libre**.

1. Le titre généré porte la date : `Séance libre — 2026-08-03`. Sans elle, l'historique
   afficherait des lignes indiscernables.
2. Le **chrono part de 0:00** et avance d'une seconde.
3. **Mettre l'app en arrière-plan une minute**, puis revenir → le chrono doit avoir avancé
   d'une minute. Il se déduit de l'horloge, il ne se décrémente pas.
4. « Ajouter un exercice » ouvre le catalogue **plein écran**. La recherche et les filtres
   par groupe musculaire y fonctionnent comme dans l'onglet Exercices — c'est le même
   composant, pas une copie.
5. Taper un exercice → il est ajouté et le modal se ferme **sans étape de confirmation**.
6. Ajouter **deux fois le même exercice** → une seule section, pas deux.
7. « Fermer » dans le modal → retour à la séance sans rien ajouter.
8. **Quitter sans aucune série loguée** → sortie directe, sans confirmation.
9. Le libellé du bouton de gauche est « Quitter », pas « Retour » : pendant une séance
   active, il n'y a pas de retour classique.
10. Les titres de section (noms d'exercices) sont désormais en **Inter 18** et non plus en
    Cutive Mono 13 — vérifier que c'est lisible d'un coup d'œil.

## Question ouverte à trancher en testant

Entrer dans C5 crée une séance en base. En ressortir sans rien logguer laisse donc une
séance vide. Regarder combien s'en accumulent après quelques essais, et décider : les
supprimer à la sortie, les filtrer en C7, ou ne rien faire.
