---
id: "def-03a-validateur-sur-le-poids-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "bug"]
order: "f02"
---

# Refuser un poids negatif au niveau du modele

**Ce que ca prend** : le champ `Set.weight_kg` dans `liftapp/models.py`.
**Ce que ca retourne** : un 400 quand l'API recoit un poids negatif, au lieu de l'ecrire.

**Objectif** : la verification existe cote client (C5 §9 BR-2), ce qui ne protege rien.
N'importe qui peut appeler l'API directement avec curl. Une donnee negative en base
fausserait tous les calculs de volume de l'accueil, sans qu'on comprenne pourquoi.

Le test existe : `test_un_poids_negatif_est_refuse`, marque `xfail(strict=True)`.

## Etapes

1. Ouvre `liftapp/models.py`, trouve `weight_kg`.
2. Ajoute un `MinValueValidator` dans la liste `validators` du champ. La valeur minimale
   est **0**, pas 1 : un exercice au poids du corps se logue legitimement a 0 kg — c'est
   une decision deja prise (« si on a des 0kg et 0reps c'est pas grave »).
3. **Ne genere pas encore la migration**, la tache `def-03c` s'en charge apres le champ
   suivant. Deux migrations pour deux lignes, c'est du bruit dans l'historique.
4. Verifie ta comprehension d'un point avant de passer a la suite : est-ce qu'un validateur
   pose sur un champ de modele est applique automatiquement par un `ModelSerializer` de
   DRF ? Cherche la reponse plutot que de supposer que oui.

**Ressources** :
- Doc Django, validateurs : https://docs.djangoproject.com/en/5.2/ref/validators/
- Recherche : `django MinValueValidator DecimalField`
- Recherche : `drf modelserializer does it use model validators`
