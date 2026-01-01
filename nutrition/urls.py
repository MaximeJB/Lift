from django.urls import path
from nutrition.views import WeightLogViewset
from rest_framework import routers

router = routers.SimpleRouter()
router.register('weights', WeightLogViewset, basename='weight_log')

urlpatterns = router.urls