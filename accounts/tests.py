import pytest
from django.contrib.auth import get_user_model



User = get_user_model()



@pytest.mark.django_db
def test_user_created_with_email():
    user = User.objects.create_user(email='test@lift.com', password='testpass123')
    assert user.email == 'test@lift.com'


@pytest.mark.django_db
def test_username_not_required():
    assert User.USERNAME_FIELD == 'email'


@pytest.mark.django_db
def test_password_is_hashed():
    user = User.objects.create_user(email='test@lift.com', password='testpass123')
    assert user.password != 'testpass123'
    assert user.check_password('testpass123')
    
@pytest.mark.django_db
def test_registration(api_client):
    request = api_client.post('/api/auth/register/', {'email': "new@test.fr", 'password':'testpass123', 'password_confirm':'testpass123'})
    assert request.status_code == 201