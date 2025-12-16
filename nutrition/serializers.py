from rest_framework import serializers
from nutrition.models import WeightLog

class WeightSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightLog
        fields = ['actual_weight','logged_at', 'id', 'user',
                  'updated_at', 'created_at']
        read_only_fields = ['id', 'user']

