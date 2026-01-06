# Last Commit Message Tracker

**Last commit:** f3c246e

**Commit message:**
```
feat: complete liftapp models (5/5) and implement DRF serializers

Models:
- Add WorkoutSession model with user tracking and template support
- Add Set model with comprehensive workout metrics (reps, weight, RPE, etc.)
- Fix TemplateExercise.related_name from 'exercices' to 'exercises'
- All 5 models now complete: Exercise, WorkoutTemplate, TemplateExercise, WorkoutSession, Set
- Apply migration 0002_workoutsession_set

Serializers:
- Create ExerciseSerializer (read-only for imported exercise data)
- Create ExerciseTemplateSerializer with nested Exercise details
- Create WorkoutTemplateSerializer with nested ExerciseTemplate list
- Create SetSerializer for workout set tracking
- Create WorkoutSessionSerializer with nested Sets
- Implement nested relationships for comprehensive API responses
- Add read_only_fields for auto-managed fields (id, timestamps)
- TODO: Add read_only_fields to SetSerializer, WorkoutSessionSerializer, and ExerciseTemplateSerializer for production-level code quality

Architecture ready for ViewSet implementation and API endpoint configuration.
```

**Date:** 2026-01-07

---

## Next Commit (draft)

**Commit message:**
```
feat: add user field to WorkoutTemplate and implement liftapp ViewSets (WIP)

Models:
- Add user FK to WorkoutTemplate (nullable for public templates)
- Migration 0003: workouttemplate_user and alter templateexercise_template

ViewSets:
- Create ExerciseViewset (ReadOnlyModelViewSet with IsAuthenticatedOrReadOnly)
- Create TemplateExerciseViewset with Q objects for public/private template filtering
- Create WorkoutTemplateViewset (⚠️ TODO: fix get_queryset - currently returns Exercise instead of WorkoutTemplate)

Architecture:
- Implement hybrid template system: public templates (user=None) + user-specific templates (user=FK)
- Use Django Q objects for OR queries (template__user__isnull=True | template__user=request.user)
- Enable template cloning workflow for future implementation

TODO:
- Fix WorkoutTemplateViewset.get_queryset() to use WorkoutTemplate with Q objects
- Add WorkoutSessionViewset and SetViewset
- Configure router in liftapp/urls.py
```
