---
id: "tester-c8-detail-seance-passee-2026-08-03"
status: "done"
priority: "high"
assignee: null
epic: null
dueDate: "2026-08-04"
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-04T12:31:19.937Z"
completedAt: "2026-08-04T12:31:19.937Z"
labels: ["test", "c8"]
order: "a001"
---
# À TESTER — Le détail d'une séance passée (C8)

**Objectif** : c'est le seul écran où l'on corrige une donnée mal saisie sur le moment. Il
persiste **immédiatement**, sans bouton « Enregistrer » — c'est la différence de fond avec
C6, et c'est ce qu'il faut vérifier en premier.

Tab Lift → Historique → taper une séance.

1. Le titre et les notes sont éditables. Modifier le titre, **taper ailleurs pour sortir du
   champ** → c'est ce moment-là qui déclenche l'enregistrement, pas chaque frappe.
2. Revenir à l'historique puis rouvrir la séance → la modification est là.
3. **Vider le titre** puis sortir du champ → l'ancien titre revient, aucune chaîne vide
   n'est écrite en base.
4. Le relevé affiche volume, séries et exercices. Les séries d'échauffement ne comptent ni
   dans le volume ni dans le nombre de séries.
5. Chaque exercice a sa section, ses séries dans l'ordre, avec `ÉCH` et `ÉCHEC` là où il
   faut.
6. **Supprimer une série** → le dialogue rappelle laquelle, avec son poids et ses
   répétitions. Confirmer → elle disparaît, et le volume du relevé se recalcule aussitôt.
7. **Supprimer la séance** → le dialogue chiffre ce qui disparaît. Confirmer → retour à
   l'historique, la séance n'y est plus.
8. Vérifier que le bouton de suppression n'est pas à portée d'un tap distrait.

## Connu, pas un bug

- **Pas de section photo** : ticket `photo-de-seance-infrastructure-2026-08-02`.
- **Pas d'ajout d'exercice ni de nouvelle série depuis cet écran.** Le formulaire adaptatif
  suppose de connaître le `exercise_type` de chaque exercice, donc une requête par exercice
  avant tout affichage éditable. Les séries existantes sont consultables et supprimables ;
  en ajouter passe par une nouvelle séance.