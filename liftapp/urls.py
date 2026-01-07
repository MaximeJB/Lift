from liftapp import views
from rest_framework import routers

router = routers.SimpleRouter()
router.register('exercise', views.ExerciseViewset, basename='exercise')
router.register('workout_template', views.WorkoutTemplateViewset, basename='workout_template')
router.register('template_exercise', views.TemplateExerciseViewset, basename='template_exercise')
router.register('workout_session', views.WorkoutSessionViewSet, basename='workout_session')
router.register('set', views.SetViewSet, basename='set')

urlpatterns = router.urls