---
id: "tester-c1-filtres-groupe-musculaire-2026-08-02"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: "2026-08-03"
created: "2026-08-02T00:00:00.000Z"
modified: "2026-08-02T00:00:00.000Z"
completedAt: null
labels: ["demain", "test", "c1"]
order: "c2"
---
# À TESTER — Les filtres par groupe musculaire (C1)

**Objectif** : le filtre a été inerte pendant tout le développement de C1 — `filter_backends`
ne contenait pas `DjangoFilterBackend`, un `?muscle_group=CHEST` était ignoré sans erreur.
Trois corrections se sont empilées pour le faire marcher, il faut voir le résultat.

Tab Lift → **Exercices**.

1. Taper la chip `CHEST` → la liste se restreint. Les chips sélectionnées s'affichent en
   **aplat d'encre sombre**, libellé clair.
2. Ajouter `BACK` → **plus** de résultats qu'avec `CHEST` seul. C'est un OU, pas un ET.
   Si le nombre diminue, la sérialisation des paramètres est repartie de travers.
3. Écrire `bench` dans la recherche avec les deux chips actives → l'intersection des deux.
4. Sélectionner un groupe rare seul (`ABDUCTORS`) → probablement l'état vide, avec un
   message qui cite tes filtres.
5. Tout désélectionner → retour à la liste complète.
6. **Scroller avec un filtre actif** → la pagination doit suivre le filtre, pas repartir de
   la liste entière.
7. Vérifier que la liste est bien **triée par ordre alphabétique** et qu'aucun exercice
   n'apparaît deux fois au scroll — c'est le `order_by('name')` ajouté côté queryset.
