from rest_framework import viewsets
from accounts.permissions import IsOwner
from nutrition.serializers import WeightSerializer

# Create your views here.
class WeightLogViewset(viewsets.ModelViewSet):
    serializer_class = WeightSerializer
    permission_classes = [IsOwner]
    
    def get_queryset(self):
        return self.request.user.weight_logs.all().order_by('-updated_at')
    
