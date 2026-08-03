---
id: "photo-de-seance-infrastructure-2026-08-02"
status: "in-progress"
priority: "medium"
assignee: null
epic: null
dueDate: null
created: "2026-08-02T00:00:00.000Z"
modified: "2026-08-03T08:46:58.222Z"
completedAt: null
labels: ["backend", "infrastructure", "c6"]
order: "a5"
---
# La photo de séance — trois briques manquantes

**Objectif** : permettre d'attacher une photo à une séance terminée. C6 §6 le prévoit
(« zone tap Ajouter une photo, aperçu, upload en arrière-plan dès la sélection »), et C6
§15 le qualifie lui-même de « nouvelle dépendance backend **bloquante** ».

## Ce qui manque, au 02/08/2026

1. **Un champ sur `WorkoutSession`** — ni `photo` ni `photo_url` n'existent
   (`liftapp/models.py`). Migration à faire.
2. **Un endpoint d'upload** — aucun. `PATCH /api/lift/workout_session/{id}/` ne prend que
   du JSON.
3. **Un stockage de fichiers** — rien de configuré. S3 ou équivalent, plus les réglages
   `MEDIA_ROOT` / `MEDIA_URL` en développement.

Côté frontend, `expo-image-picker` n'est pas installé non plus.

## Règles à respecter le jour où ce sera branché

- C6 §9 BR-3 : l'upload est **indépendant** du PATCH de finalisation. Un échec de photo ne
  doit jamais empêcher d'enregistrer la séance.
- C6 §16 : ne pas bloquer « Enregistrer » en attendant la fin de l'upload.
- C6 §13 : photo compressée côté client avant envoi.
- C6 §14 : upload strictement lié à l'utilisateur propriétaire.

## En attendant

L'écran C6 est complet sans elle — titre, relevé, records, notes, enregistrement et
suppression fonctionnent. La section photo est simplement absente, aucun bouton inerte
n'est affiché.