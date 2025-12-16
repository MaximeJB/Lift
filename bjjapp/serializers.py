from rest_framework import serializers
from accounts.models import CustomUser
from bjjapp.models import BeltPromotion

class PublicBeltPromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BeltPromotion
        fields = ['academy','promotion_date', 'id', 'notes', 'user', 'actual_belt'
                  'updated_at', 'created_at']
        read_only_fields = ['id', 'user']

