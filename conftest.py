import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user(db):
    return User.objects.create_user(email='test@lift.com', password='testpass123')

@pytest.fixture
def auth_client(api_client, user):
    register = api_client.post('/api/auth/login/', {"email": "test@lift.com", "password": 
        "testpass123",})
                    
    tokens = register.data
    print(register.data)
    api_client.credentials(HTTP_AUTHORIZATION='Bearer ' + tokens['access'])
    assert register.status_code == 200
    return api_client