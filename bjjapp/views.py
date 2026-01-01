from rest_framework import viewsets
from accounts.permissions import IsOwnerOrReadOnly
from bjjapp.serializers import PublicBeltPromotionSerializer

# Create your views here.
class BeltPromotionViewset(viewsets.ModelViewSet):
    serializer_class = PublicBeltPromotionSerializer
    permission_classes = [IsOwnerOrReadOnly]
    
    def get_queryset(self):
        return self.request.user.belt_promotions.all()