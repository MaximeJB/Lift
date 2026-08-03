---
id: "tester-c3-segment-seances-2026-08-02"
status: "todo"
priority: "medium"
assignee: null
epic: null
dueDate: "2026-08-03"
created: "2026-08-02T00:00:00.000Z"
modified: "2026-08-02T00:00:00.000Z"
completedAt: null
labels: ["demain", "test", "c3"]
order: "c4"
---
# À TESTER — Le segment Séances (C3)

**Objectif** : vérifier surtout ce qui doit marcher QUAND LE RESTE ÉCHOUE. C3 §15 en fait
un anti-pattern explicite : « ne pas bloquer l'accès à Séance libre si le chargement des
templates échoue ».

Tab Lift → **Séances**.

1. La carte **Séance libre** est en tête, de même forme que les templates — pas une option
   secondaire discrète.
2. **Couper Django**, puis rouvrir le segment → la bannière d'erreur s'affiche, et
   « Séance libre » **reste tappable et fonctionnelle**. C'est le critère d'acceptation
   principal de cet écran.
3. Aucun template n'est en base au 02/08 : la liste ne contient donc que la séance libre.
   Ce n'est pas un bug, c'est le ticket de seeding (C3 §14).
4. Taper « Séance libre » → C5 s'ouvre et crée la séance.

> Le jour où des templates existeront : vérifier le tri, par catégorie puis par nom, et que
> chaque carte affiche durée et nombre d'exercices.
