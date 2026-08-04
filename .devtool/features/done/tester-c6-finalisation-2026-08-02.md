---
id: "tester-c6-finalisation-2026-08-02"
status: "done"
priority: "high"
assignee: null
epic: null
dueDate: "2026-08-03"
created: "2026-08-02T00:00:00.000Z"
modified: "2026-08-04T12:31:21.162Z"
completedAt: "2026-08-04T12:31:21.162Z"
labels: ["demain", "test", "c6"]
order: "a000V"
---
# À TESTER — La finalisation d'une séance (C6)

**Objectif** : c'est l'écran qui ferme la boucle. Sans lui, `end_time` et
`duration_minutes` restent vides et une séance n'est jamais vraiment terminée.

Logguer quelques séries en C5, puis taper **« Terminer »**.

1. Le titre est **pré-rempli** avec celui généré à la création, et modifiable.
2. **Le vider entièrement**, puis enregistrer → le titre auto-généré revient
   silencieusement. Aucun blocage, aucun message d'erreur.
3. Le relevé affiche **volume, durée, séries, exercices**. Vérifier le volume à la main :
   c'est la somme de `poids × reps` sur les séries **hors échauffement**. Une série
   d'échauffement ne doit pas y entrer.
4. Le nombre de séries affiché exclut lui aussi les échauffements.
5. **Records battus** : logguer un poids nettement supérieur à tout ce qui existe sur un
   exercice → l'encart apparaît avec le 1RM estimé et l'écart avec le précédent. Sur un
   exercice jamais chargé, la mention est `premier`.
6. Vérifier qu'un record **ne se déclenche pas** sur une série d'échauffement lourde.
7. Écrire une note, enregistrer → retour à l'accueil. Vérifier en base que `end_time`,
   `duration_minutes`, `title` et `notes` sont bien renseignés :

```powershell
python -c "import sqlite3; c=sqlite3.connect('db.sqlite3'); print(list(c.execute('select title, date, start_time, end_time, duration_minutes, notes from liftapp_workoutsession')))"
```

8. **Retour vers C5 depuis C6** → la séance est reprise sans perte, on peut logguer encore.
9. « Annuler la séance » → le dialogue annonce ce qui disparaît, **chiffré** : séries,
   exercices, volume. Confirmer → la séance et toutes ses séries sont supprimées.
10. Vérifier que le bouton destructif n'est pas collé au bouton primaire.

## Connu, pas un bug

- **Pas de section photo** : trois briques d'infrastructure manquent, voir le ticket
  `photo-de-seance-infrastructure-2026-08-02`.
- Les records ne remontent qu'**une page de 25 séances** d'historique. Au-delà, un vieux
  record sortirait de la fenêtre. La correction est côté serveur.