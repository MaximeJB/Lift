---
id: "tester-pseudo-inscription-et-profil-2026-08-02"
status: "todo"
priority: "high"
assignee: null
epic: null
dueDate: "2026-08-03"
created: "2026-08-02T00:00:00.000Z"
modified: "2026-08-02T00:00:00.000Z"
completedAt: null
labels: ["demain", "test", "a3", "d1"]
order: "c1"
---
# À TESTER — Le pseudo, à l'inscription et au profil

**Objectif** : vérifier la règle du pseudo de bout en bout. Elle a trois morceaux écrits
séparément — le format, l'unicité insensible à la casse, et la fenêtre de 30 jours
glissants.

## À l'inscription (A3)

1. Pseudo `ab` → refusé, message sous le champ pseudo, pas en bannière.
2. Pseudo `a b c` (espaces) → refusé de la même façon.
3. Pseudo valide → compte créé, connexion directe.
4. Créer un second compte avec le **même pseudo en casse différente** (`MaxLift` puis
   `maxlift`) → refusé. C'est l'unicité insensible à la casse ajoutée le 02/08.

## Au profil (D1)

5. Le champ Pseudo est **éditable** si tu n'as jamais changé le tien depuis l'inscription.
6. Le modifier → « Enregistrer » s'active, puis s'éteint une fois le serveur ayant répondu.
   L'extinction du bouton EST la confirmation, il n'y a pas de bandeau de succès.
7. Recharger l'onglet → le champ est **verrouillé**, et son libellé affiche
   `PSEUDO — MODIFIABLE LE JJ/MM/AAAA`.
8. Le titre de l'en-tête doit porter le nouveau pseudo immédiatement, sans reconnexion.
9. **Fermer et rouvrir l'app** → le nouveau pseudo est toujours là. C'est ce que vérifie la
   mise à jour de l'utilisateur mémorisé dans SecureStore.

Pour rouvrir la fenêtre sans attendre 30 jours :

```powershell
python manage.py shell
```
```python
from django.utils import timezone
from datetime import timedelta
from accounts.models import CustomUser
CustomUser.objects.filter(email='ton@email.com').update(pseudo_updated_at=timezone.now() - timedelta(days=31))
```

10. Modifier **seulement le prénom** → doit passer, et **ne pas** consommer le quota de
    changement de pseudo.
