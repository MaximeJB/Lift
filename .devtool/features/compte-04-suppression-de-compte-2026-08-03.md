---
id: "compte-04-suppression-de-compte-2026-08-03"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: null
labels: ["backend", "compte", "rgpd"]
order: "f13"
---

# DELETE /api/auth/me/ — permettre a quelqu'un de supprimer son compte

**Ce que ca prend** : une requete DELETE authentifiee sur `/api/auth/me/`.
**Ce que ca retourne** : un 204, et plus aucune trace de l'utilisateur ni de ses seances.

**Objectif** : c'est une **obligation legale** (RGPD, droit a l'effacement), pas un confort.
C'est aussi une exigence de l'App Store depuis 2022 : toute app qui permet de creer un
compte doit permettre de le supprimer depuis l'app. Sans ca, la soumission est rejetee.

## Etapes

1. `UserProfileView` herite de `RetrieveUpdateAPIView`. Regarde la liste des vues
   generiques de DRF et trouve celle qui ajoute la suppression — le nom est explicite.
2. Change la classe de base. C'est une ligne.
3. Verifie ce qui se passe pour les donnees liees. Ouvre `liftapp/models.py` et regarde le
   `on_delete` de la relation entre `WorkoutSession` et l'utilisateur. Si c'est `CASCADE`,
   les seances partent avec — c'est ce qu'on veut. Si c'est autre chose, la suppression
   echouera ou laissera des orphelins.
4. **Teste-le en vrai** avant de dire que c'est fait : cree un utilisateur, une seance,
   deux series, supprime le compte, et compte les lignes restantes.
5. Pense au jeton : apres suppression, le refresh de cet utilisateur pointe dans le vide.
   C'est exactement le scenario du ticket `def-02`. Si tu ne l'as pas fait, supprimer un
   compte declenchera un 500 a la prochaine requete du client.

**Ressources** :
- Doc DRF, vues generiques : https://www.django-rest-framework.org/api-guide/generic-views/#concrete-view-classes
- Doc Django, `on_delete` : https://docs.djangoproject.com/en/5.2/ref/models/fields/#django.db.models.ForeignKey.on_delete
- Recherche : `apple app store account deletion requirement guideline 5.1.1`
