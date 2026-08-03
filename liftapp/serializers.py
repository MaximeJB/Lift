from rest_framework import serializers

from liftapp.models import Exercise, Set, TemplateExercise, WorkoutSession, WorkoutTemplate

class ExerciseSerializer(serializers.ModelSerializer):
    secondary_muscle_groups = serializers.StringRelatedField(many=True, read_only=True)
    class Meta:
        model = Exercise
        fields = ['id', 'name','description', 'muscle_group', 'equipment_needed', 'is_compound', 'image_url',
                  'created_at', 'updated_at','synced_at','exercise_type', 'video_url', 'secondary_muscle_groups',]
        read_only_fields = ['id', 'name','description', 'muscle_group', 'equipment_needed',
                            'is_compound', 'image_url',
                            'updated_at', 'created_at', 'synced_at', 'video_url', 'secondary_muscle_groups']
      

class ExerciseTemplateSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)
    
    class Meta:
        model = TemplateExercise
        fields = ['id', 'exercise', 'order', 'target_sets', 'target_reps_min', 
                  'target_reps_max', 'rest_seconds', 'notes','synced_at',]
        
class WorkoutTemplateSerializer(serializers.ModelSerializer):
    exercises = ExerciseTemplateSerializer(many=True, read_only=True)
    class Meta:
        model = WorkoutTemplate
        fields = ['id', 'name', 'description', 'category', 'estimated_duration',
                  'created_at', 'updated_at', 'synced_at', 'exercises']
        
class SetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Set
        fields = ['id', 'workout_session', 'exercise', 'set_number','weight_kg',
                  'reps', 'rpe', 'duration_seconds', 'rest_seconds', 'notes',
                  'is_warmup', 'is_failure', 'created_at', 'updated_at'
                  ,'synced_at',]

    def validate_workout_session(self, value):
        """Interdit d'ecrire une serie dans la seance de quelqu'un d'autre.

        IsOwner ne couvre pas la creation : au moment ou la permission d'objet
        s'evalue, la serie n'existe pas encore, donc il n'y a aucun proprietaire a
        comparer. Sans ce controle, connaitre l'UUID d'une seance suffit pour y
        injecter des series.

        Vaut aussi pour le PATCH, ce qui ferme le deplacement d'une serie existante
        vers la seance d'autrui.
        """
        requete = self.context.get('request')
        # Pas de requete : appel depuis un script ou un test unitaire, rien a comparer.
        if requete is not None and value.user != requete.user:
            raise serializers.ValidationError("Cette seance ne vous appartient pas.")
        return value
    
class WorkoutSessionSerializer(serializers.ModelSerializer):
    sets = SetSerializer(many=True, read_only=True)
    class Meta:
        model = WorkoutSession
        fields = ['id', 'template', 'title', 'date', 'start_time', 'end_time',
                  'duration_minutes', 'notes', 'user', 'created_at', 'updated_at'
                  , 'synced_at','sets']
        read_only_fields = ['user']
        
