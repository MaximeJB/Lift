from accounts.models import CustomUser
from accounts.serializers import UserRegistrationSerializer
from rest_framework import generics
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView

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
    permission_classes = [AllowAny]
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
            'user': {'id': user.id, 'username': user.username, 'email': user.email, 'email_verified': user.email_verified}
        })