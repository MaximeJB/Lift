from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,)

from accounts.views import LoginView, RegisterView, UserProfileView

urlpatterns = [
    path('login/', LoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', UserProfileView.as_view(), name='user-profile')
]