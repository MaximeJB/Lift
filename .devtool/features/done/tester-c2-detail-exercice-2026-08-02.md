---
id: "tester-c2-detail-exercice-2026-08-02"
status: "done"
priority: "high"
assignee: null
epic: null
dueDate: "2026-08-03"
created: "2026-08-02T00:00:00.000Z"
modified: "2026-08-04T12:31:20.586Z"
completedAt: "2026-08-04T12:31:20.586Z"
labels: ["demain", "test", "c2"]
order: "al"
---
# À TESTER — Le détail d'un exercice (C2)

**Objectif** : écran neuf, plus une dépendance neuve (`expo-video`) et une correction de
modèle Django qui ne se voit que là.

Tab Lift → Exercices → taper une ligne.

1. Le **nom s'affiche immédiatement**, avant la réponse du serveur : il voyage en paramètre
   depuis la liste.
2. Groupe musculaire et format en registre codé sous le titre, badges « composé » et
   matériel s'ils s'appliquent.
3. **Les muscles secondaires doivent afficher des noms** (`TRICEPS`, `LATS`), pas
   `MuscleGroup object (3)`. C'est la méthode `__str__` ajoutée le 02/08 sur le modèle.
   Prendre un exercice qui en a — 124 exercices sur 873 seulement.
4. **La vidéo** : **83 exercices sur 873** en ont une depuis la réparation du 03/08 — et
   elles sont désormais toutes vérifiées. Avant, 209 exercices en portaient une, dont une
   large part montrait un autre mouvement. Elle doit démarrer seule, en boucle, **sans
   aucun son**.
   Exemples qui en ont une : `Arnold Dumbbell Press`, `Dumbbell Bench Press`,
   `Machine Bicep Curl`.
5. Quitter l'écran pendant qu'elle joue, puis revenir → elle ne doit pas continuer en
   arrière-plan.
6. Activer « Réduire les animations » dans les réglages d'accessibilité de l'iPhone, puis
   rouvrir une fiche avec vidéo → **pas de démarrage automatique**, et les commandes
   natives apparaissent pour la lancer à la main.
7. Un exercice **sans** vidéo n'affiche aucune zone vide à la place.

> `expo-video` est un module natif. S'il ne s'affiche pas du tout dans Expo Go, c'est
> peut-être qu'une build de développement est nécessaire — le signaler plutôt que de
> chercher ailleurs.