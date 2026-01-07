from rest_framework.decorators import api_view
from django.db.models import Q
from rest_framework.response import Response
from liftapp.models import Exercise, TemplateExercise, WorkoutSession, WorkoutTemplate, Set
from liftapp.serializers import ExerciseSerializer, ExerciseTemplateSerializer, SetSerializer, WorkoutSessionSerializer, WorkoutTemplateSerializer
from rest_framework import viewsets
from accounts.permissions import IsAuthenticatedOrReadOnly, IsOwner

@api_view()
def hello_world(request):
    return Response({"message": "Hello, world!"})


# Create your views here.
class ExerciseViewset(viewsets.ReadOnlyModelViewSet):
    serializer_class = ExerciseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        return Exercise.objects.all()
    
class WorkoutTemplateViewset(viewsets.ModelViewSet):
    serializer_class = WorkoutTemplateSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        cond_public = Q(user__isnull=True)
        cond_private = Q(user=user)
        return WorkoutTemplate.objects.filter(cond_public | cond_private)
    
class TemplateExerciseViewset(viewsets.ModelViewSet):
    serializer_class = ExerciseTemplateSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        
        cond_public = Q(template__user__isnull=True)
        cond_private = Q(template__user=user)
        return TemplateExercise.objects.filter(cond_public | cond_private)
    
class WorkoutSessionViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutSessionSerializer
    permission_classes = [IsOwner]
    
    def get_queryset(self):
        user = self.request.user
        return user.workouts.all().order_by('-date', '-start_time')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    
class SetViewSet(viewsets.ModelViewSet):
    serializer_class = SetSerializer
    permission_classes = [IsOwner]
    
    def get_queryset(self):
        user = self.request.user
        return Set.objects.filter(workout_session__user=user)