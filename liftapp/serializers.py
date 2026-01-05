from rest_framework import serializers

from liftapp.models import Exercise, Set, TemplateExercise, WorkoutSession, WorkoutTemplate

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ['id', 'name','description', 'muscle_group', 'equipment_needed', 'is_compound', 'image_url',
                  'created_at', 'updated_at','synced_at',]
        read_only_fields = ['id', 'name','description', 'muscle_group', 'equipment_needed',
                            'is_compound', 'image_url',
                            'updated_at', 'created_at', 'synced_at']

class ExerciseTemplateSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)
    
    class Meta:
        model = TemplateExercise
        fields = ['id', 'exercise', 'order', 'target_sets', 'target_reps_min', 
                  'target_reps_max', 'rest_seconds', 'notes','synced_at',]
        
class WorkoutTemplateSerializer(serializers.ModelSerializer):
    exercises = ExerciseTemplateSerializer(many=True, read_only= True)
    class Meta:
        model = WorkoutTemplate
        fields = ['id', 'name', 'description', 'category', 'estimated_duration',
                  'created_at', 'updated_at','synced_at',]
        
class SetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Set
        fields = ['id', 'workout_session', 'exercise', 'set_number','weight_kg',
                  'reps', 'rpe', 'duration_seconds', 'rest_seconds', 'notes',
                  'is_warmup', 'is_failure', 'created_at', 'updated_at'
                  ,'synced_at',]
    
class WorkoutSessionSerializer(serializers.ModelSerializer):
    sets = SetSerializer(many=True, read_only=True)
    class Meta:
        model = WorkoutSession
        fields = ['id', 'template', 'title', 'date', 'start_time', 'end_time',
                  'duration_minutes', 'notes', 'user', 'created_at', 'updated_at'
                  , 'synced_at',]
        read_only_fields = ['user']
        
