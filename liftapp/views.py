from rest_framework.decorators import api_view
from django.db.models import Q
from rest_framework.response import Response
from liftapp.models import Exercise, TemplateExercise
from liftapp.serializers import ExerciseSerializer, ExerciseTemplateSerializer, WorkoutTemplateSerializer
from rest_framework import viewsets
from accounts.permissions import IsAuthenticatedOrReadOnly
from nutrition.serializers import WeightSerializer

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
        return Exercise.objects.all()
    
class TemplateExerciseViewset(viewsets.ModelViewSet):
    serializer_class = ExerciseTemplateSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        
        cond_public = Q(template__user__isnull=True)
        cond_private = Q(template__user=user)
        return TemplateExercise.objects.filter(cond_public | cond_private)
    