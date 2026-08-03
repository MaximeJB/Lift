import django_filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework.decorators import api_view
from django.db.models import Case, IntegerField, Q, Value, When
from django.db.models.functions import Length
from rest_framework.response import Response
from liftapp.models import MUSCLE_GROUP_CHOICES, Exercise, TemplateExercise, WorkoutSession, WorkoutTemplate, Set
from liftapp.serializers import ExerciseSerializer, ExerciseTemplateSerializer, SetSerializer, WorkoutSessionSerializer, WorkoutTemplateSerializer
from rest_framework import viewsets
from accounts.permissions import IsOwner
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated

@api_view()
def hello_world(request):
    return Response({"message": "Hello, world!"})


class ExerciseFilter(django_filters.FilterSet):
    # C1 §9 BR-3 : les chips de groupe musculaire se cumulent en OU.
    # MultipleChoiceFilter accepte le meme parametre repete
    # (?muscle_group=CHEST&muscle_group=BACK) et produit un IN en SQL.
    # Un filterset_fields ordinaire ne garderait que la derniere valeur.
    muscle_group = django_filters.MultipleChoiceFilter(choices=MUSCLE_GROUP_CHOICES)

    class Meta:
        model = Exercise
        # name et description sont sortis du lot : un filtre exact sur un texte libre
        # ne sert a rien, c'est SearchFilter qui couvre ce besoin.
        fields = ['muscle_group', 'equipment_needed', 'is_compound']


# Create your views here.
class ExerciseViewset(viewsets.ReadOnlyModelViewSet):
    serializer_class = ExerciseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    # DjangoFilterBackend etait absent : declarer filter_backends REMPLACE le
    # DEFAULT_FILTER_BACKENDS de settings.py au lieu de s'y ajouter. Le filterset etait
    # donc inerte, un ?muscle_group=CHEST etait ignore sans la moindre erreur.
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    filterset_class = ExerciseFilter
    search_fields = ['name', 'description', 'muscle_group', 'equipment_needed',]

    def get_queryset(self):
        """
        Classement par UTILITE, pas par alphabet.

        Le tri alphabetique est un tri de catalogue : personne ne cherche 'Ab Crunch
        Machine' avant 'Bench Press'. Deux criteres se cumulent, dans cet ordre.

        1. LES EXERCICES CONNUS D'ABORD. Les 86 exercices portant un `external_id` sont
           ceux qu'un appariement strict a relies au catalogue Hevy, lui-meme edite. Ce
           n'est pas une mesure de notoriete, c'est le seul signal editorial disponible
           sans inventer de donnee.

        2. LA QUALITE DE CORRESPONDANCE, quand une recherche est en cours. Nom exact,
           puis commence par, puis contient. C'est demontrable et n'affirme rien sur le
           monde, seulement sur la requete.

        3. LE NOM LE PLUS COURT. Le catalogue source qualifie tout : il n'existe aucun
           'Bench Press' nu, seulement 'Dumbbell Bench Press', 'Decline Barbell Bench
           Press', 'Bench Press - Powerlifting'. A egalite, le nom le plus court est
           celui qui porte le moins de qualificatifs, donc la forme la plus generique du
           mouvement. C'est le meilleur substitut disponible a une notoriete qu'aucune
           donnee ne mesure.

        `order_by` reste par ailleurs obligatoire des qu'il y a pagination : sur un
        queryset non ordonne, deux pages consecutives peuvent se recouvrir.
        """
        queryset = Exercise.objects.annotate(
            connu=Case(
                When(external_id__isnull=False, then=Value(0)),
                default=Value(1),
                output_field=IntegerField(),
            )
        )

        queryset = queryset.annotate(longueur=Length('name'))

        recherche = self.request.query_params.get('search', '').strip()
        if not recherche:
            return queryset.order_by('connu', 'longueur', 'name')

        return queryset.annotate(
            pertinence=Case(
                When(name__iexact=recherche, then=Value(0)),
                When(name__istartswith=recherche, then=Value(1)),
                When(name__icontains=recherche, then=Value(2)),
                # Atteint quand la correspondance vient de la description, du groupe
                # musculaire ou du materiel — SearchFilter cherche dans les quatre.
                default=Value(3),
                output_field=IntegerField(),
            )
        ).order_by('pertinence', 'connu', 'longueur', 'name')
    
class WorkoutTemplateViewset(viewsets.ModelViewSet):
    serializer_class = WorkoutTemplateSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        cond_public = Q(user__isnull=True)
        if user.is_authenticated:
            return WorkoutTemplate.objects.filter(cond_public | Q(user=user))
        return WorkoutTemplate.objects.filter(cond_public)

class TemplateExerciseViewset(viewsets.ModelViewSet):
    serializer_class = ExerciseTemplateSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        cond_public = Q(template__user__isnull=True)
        if user.is_authenticated:
            return TemplateExercise.objects.filter(cond_public | Q(template__user=user))
        return TemplateExercise.objects.filter(cond_public)
    
class WorkoutSessionViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutSessionSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    
    def get_queryset(self):
        user = self.request.user
        return user.workouts.all().order_by('-date', '-start_time')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    
class SetViewSet(viewsets.ModelViewSet):
    serializer_class = SetSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    
    def get_queryset(self):
        user = self.request.user
        return Set.objects.filter(workout_session__user=user)