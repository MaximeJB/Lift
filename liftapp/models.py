from django.db import models
import uuid
from accounts.models import CustomUser


class Exercise(models.Model):
    MUSCLE_GROUP_CHOICES = [
    ('CHEST', 'Chest'),
    ('BACK', 'Back'),
    ('QUADS', 'Quads'),
    ('ISCHIOS', 'Ischios'),
    ('GLUTES', 'Glutes'),
    ('CALVES', 'Calves'),
    ('SHOULDERS', 'Shoulders'),
    ('BICEPS', 'Biceps'),
    ('TRICEPS', 'Triceps'),
    ('LOWER_BACK', 'Lower Back'),
    ('LATS', 'Lats'),
    ('UPPER_BACK', 'Upper Back'),
    ('REAR_SHOULDERS', 'Rear Shoulders'),
    ('CORE', 'Core'),
    ('FULL_BODY', 'Full Body'),
    ('FOREARMS', 'Forearms'),]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    muscle_group = models.CharField(choices= MUSCLE_GROUP_CHOICES, max_length=20)
    equipment_needed = models.CharField(max_length=100,blank=True)
    is_compound = models.BooleanField(default=False)
    image_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    synced_at = models.DateTimeField(null=True, blank=True)
    
class WorkoutTemplate(models.Model):
    TRAINING_TYPE_CHOICES = [
    ('STRENGTH', 'Strength'),
    ('HYPERTROPHY', 'Hypertrophy'),
    ('ENDURANCE', 'Endurance'),
    ('FULL_BODY', 'Full Body'),
    ('CROSSFIT', 'Crossfit'),
    ('FITNESS', 'Fitness'),
    ('PUSH_PULL_LEGS', 'Push/Pull/Legs'),
    ('SPLIT', 'Split'),]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(choices=TRAINING_TYPE_CHOICES, max_length=20)
    #ce qui serait intéressant ici et différent d'applications sois un nombre de template elevé et la possibilité 
    #de les prendres d'un modele, exemple "Jeffnippard Template", avec le truc qui se remplit tout seul
    #bon c'est juste prendre un template deja crée mais a pousser
    estimated_duration = models.IntegerField(default=60)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    synced_at = models.DateTimeField(null=True, blank=True)
    
class TemplateExercise(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.ForeignKey(WorkoutTemplate, on_delete=models.CASCADE, related_name='exercises')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)   
    order = models.IntegerField() 
    target_sets = models.IntegerField(default=3)
    target_reps_min = models.IntegerField(null=True, blank=True)
    target_reps_max = models.IntegerField(null=True, blank=True)
    rest_seconds = models.IntegerField(default=90)
    notes = models.TextField(blank=True)
    synced_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['order']
        unique_together = [('template', 'order')]

class WorkoutSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='workouts')
    template = models.ForeignKey(WorkoutTemplate,null=True, blank=True, on_delete=models.SET_NULL)
    title = models.CharField(max_length=200)
    date = models.DateField()
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    synced_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-start_time']
    
class Set(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workout_session = models.ForeignKey(WorkoutSession, on_delete=models.CASCADE, related_name='sets')
    exercise = models.ForeignKey(Exercise, on_delete=models.PROTECT)
    set_number = models.IntegerField()
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2)
    reps = models.IntegerField()
    rpe = models.IntegerField(null=True, blank=True)
    duration_seconds = models.IntegerField(null=True, blank=True)
    rest_seconds = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    is_warmup = models.BooleanField(default=False)
    is_failure = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    synced_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['set_number']
    