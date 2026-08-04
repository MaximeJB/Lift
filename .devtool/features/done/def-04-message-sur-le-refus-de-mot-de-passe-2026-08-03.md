---
id: "def-04-message-sur-le-refus-de-mot-de-passe-2026-08-03"
status: "done"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-03T00:00:00.000Z"
modified: "2026-08-03T00:00:00.000Z"
completedAt: "2026-08-03T00:00:00.000Z"
labels: ["backend", "bug"]
order: "f05"
---

# Donner un message lisible quand les deux mots de passe different

**Ce que ca prend** : la methode `validate` de `UserRegistrationSerializer`.
**Ce que ca retourne** : un 400 avec un texte exploitable, au lieu d'un 400 vide.

**Objectif** : aujourd'hui le serialiseur fait `raise serializers.ValidationError()` sans
argument. Le client recoit une erreur sans contenu et ne peut rien afficher. C'est
exactement pour ca que l'ecran A3 compare les deux mots de passe lui-meme avant d'appeler
l'API — un contournement qu'on pourra retirer une fois ce ticket fait.

Le test existe : `test_le_refus_de_mot_de_passe_porte_un_message_lisible`, en `xfail`.

## Etapes

1. Ouvre `accounts/serializers.py`, trouve le `raise` nu dans `validate`.
2. Passe-lui un dictionnaire plutot qu'une chaine. La difference compte : une chaine part
   dans `non_field_errors`, un dictionnaire part sous la cle du champ concerne — et le
   front sait deja afficher une erreur sous un champ, c'est ce que fait D1 pour le pseudo.
3. Choisis la cle : `password2` ou `password` ? Celle qui designe le champ que
   l'utilisateur doit corriger.
4. Ecris le message en francais, a la deuxieme personne, sans point d'exclamation. Relis
   `SLOP-ECRITURE.md` avant de le rediger.
5. Retire le xfail, relance.
6. **Ensuite seulement**, va voir `app/(auth)/register.tsx` : la comparaison locale peut
   rester en garde-fou immediat, mais l'erreur serveur doit maintenant s'afficher aussi.

**Ressources** :
- Doc DRF, « Raising validation errors » : https://www.django-rest-framework.org/api-guide/serializers/#validation
- Recherche : `drf serializers ValidationError dict vs string non_field_errors`

---

## Fait le 03/08/2026

`validate` leve desormais un dictionnaire sous la cle `password_confirm`, pas une chaine : une chaine serait partie dans `non_field_errors` et aurait fini en banniere, alors que l'erreur designe un champ precis.

Reste a faire cote front : `app/(auth)/register.tsx` compare encore les deux mots de passe lui-meme. Ce contournement peut rester en garde-fou immediat, mais l'erreur serveur doit maintenant s'afficher aussi.
