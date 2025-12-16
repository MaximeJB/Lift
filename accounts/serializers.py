from rest_framework import serializers
from django.contrib.auth import authenticate
from accounts.models import CustomUser

class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'pseudo','created_at', 'username']
        read_only_fields = ['id', 'username', 'created_at']

class PrivateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email', 
                  'first_name', 
                  'last_name', 
                  'email_verified', 
                  'profile_visibility',
                  'created_at',
                  'id',]
    
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = [
            "email",
            "password",
            'password_confirm',
            "pseudo",
        ]
    
    def validate(self, attrs):
        if attrs['password'] == attrs['password_confirm']:
            return attrs
        else:
            raise serializers.ValidationError()
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        password_confirm = validated_data.pop('password_confirm')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user
    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    # The validate method is where we check email and password.
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        # Try to find the user by email first
        try:
            user = CustomUser.objects.get(email=email)
            username = user.username # authenticate needs username, but we login with email
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError('Invalid credentials')

        # Use Django's authenticate function to check password
        user = authenticate(username=username, password=password) 

        if not user:
            raise serializers.ValidationError('Invalid credentials')

        # If successful, add the user object to the validated data
        attrs['user'] = user 
        return attrs