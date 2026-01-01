from django.urls import path
from bjjapp.views import BeltPromotionViewset
from rest_framework import routers

router = routers.SimpleRouter()
router.register('promotions', BeltPromotionViewset, basename='belt_promotion')

urlpatterns = router.urls