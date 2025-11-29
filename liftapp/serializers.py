from rest_framework import serializers

from liftapp.models import CustomUser


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 
                  'pseudo', 
                  'email', 
                  ]
        