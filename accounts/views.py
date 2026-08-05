from accounts.models import CustomUser
from accounts.serializers import LoginSerializer, PrivateUserSerializer, UserRegistrationSerializer, PasswordChangeSerializer
from rest_framework import generics
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        self.user_instance = user
    
    def create(self, request, *args, **kwargs):
        #appelle la création standard (validation + save). return response object
        response = super().create(request, *args, **kwargs)
        
        tokens = get_tokens_for_user(self.user_instance)
        response.data['tokens'] = tokens
        
        return response
    
def get_tokens_for_user(user):
    #return dict
    refresh = RefreshToken.for_user(user)

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class LoginView(APIView):
    def post(self, request):
        # 1. Validate credentials using the LoginSerializer
        ser = LoginSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        # 2. Get the authenticated user object from the serializer
        user = ser.validated_data['user']

        # 3. Generate a refresh token for the user
        refresh = RefreshToken.for_user(user)

        # 4. Return both the access token and refresh token
        return Response({
            'access': str(refresh.access_token), 
            'refresh': str(refresh), 
            'user': {'id': user.id, 'pseudo': user.pseudo, 'email': user.email, 'email_verified': user.email_verified}
        })
    
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = PrivateUserSerializer
    queryset = CustomUser.objects.all()
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
    
    
class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        ser = PasswordChangeSerializer(data=request.data, context={'request':request})
        ser.is_valid(raise_exception=True)
        user = request.user
        user.set_password(ser.validated_data['new_password'])
        user.save
        return Response({"message": "Mot de passe changé"})      