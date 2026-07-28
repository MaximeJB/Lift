import uuid
import pytest
from unittest.mock import Mock
from django.contrib.auth import get_user_model
from accounts.permissions import IsOwner, IsOwnerOrReadOnly

User = get_user_model()


# ─── Model: CustomUser ────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_user_created_with_email():
    user = User.objects.create_user(email='test@lift.com', password='testpass123')
    assert user.email == 'test@lift.com'

@pytest.mark.django_db
def test_username_field_is_email():
    assert User.USERNAME_FIELD == 'email'

@pytest.mark.django_db
def test_password_is_hashed():
    user = User.objects.create_user(email='test@lift.com', password='testpass123')
    assert user.password != 'testpass123'
    assert user.check_password('testpass123')

@pytest.mark.django_db
def test_user_id_is_uuid():
    user = User.objects.create_user(email='test@lift.com', password='testpass123')
    assert isinstance(user.id, uuid.UUID)

@pytest.mark.django_db
def test_create_superuser_sets_is_admin():
    user = User.objects.create_superuser(email='admin@lift.com', password='adminpass123')
    assert user.is_admin is True

@pytest.mark.django_db
def test_user_str_contains_email_and_pseudo():
    user = User.objects.create_user(email='test@lift.com', password='testpass123', pseudo='MaxLift')
    assert 'MaxLift' in str(user)
    assert 'test@lift.com' in str(user)

@pytest.mark.django_db
def test_email_must_be_unique():
    User.objects.create_user(email='test@lift.com', password='testpass123')
    with pytest.raises(Exception):
        User.objects.create_user(email='test@lift.com', password='anotherpass')

@pytest.mark.django_db
def test_pseudo_must_be_unique():
    User.objects.create_user(email='a@lift.com', password='pass', pseudo='MaxLift')
    with pytest.raises(Exception):
        User.objects.create_user(email='b@lift.com', password='pass', pseudo='MaxLift')

@pytest.mark.django_db
def test_required_fields_is_empty():
    assert User.REQUIRED_FIELDS == []


# ─── Register endpoint ────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_registration(api_client):
    response = api_client.post('/api/auth/register/', {
        'email': 'new@test.fr',
        'password': 'testpass123',
        'password_confirm': 'testpass123',
    })
    assert response.status_code == 201

@pytest.mark.django_db
def test_register_returns_jwt_tokens(api_client):
    response = api_client.post('/api/auth/register/', {
        'email': 'new@test.fr',
        'password': 'testpass123',
        'password_confirm': 'testpass123',
    })
    assert 'access' in response.data['tokens']
    assert 'refresh' in response.data['tokens']

@pytest.mark.django_db
def test_register_creates_user_in_db(api_client):
    api_client.post('/api/auth/register/', {
        'email': 'new@test.fr',
        'password': 'testpass123',
        'password_confirm': 'testpass123',
    })
    assert User.objects.filter(email='new@test.fr').exists()

@pytest.mark.django_db
def test_register_password_mismatch_returns_400(api_client):
    response = api_client.post('/api/auth/register/', {
        'email': 'new@test.fr',
        'password': 'testpass123',
        'password_confirm': 'different',
    })
    assert response.status_code == 400

@pytest.mark.django_db
def test_register_duplicate_email_returns_400(api_client, user):
    response = api_client.post('/api/auth/register/', {
        'email': 'test@lift.com',
        'password': 'testpass123',
        'password_confirm': 'testpass123',
    })
    assert response.status_code == 400

@pytest.mark.django_db
def test_register_missing_email_returns_400(api_client):
    response = api_client.post('/api/auth/register/', {
        'password': 'testpass123',
        'password_confirm': 'testpass123',
    })
    assert response.status_code == 400

@pytest.mark.django_db
def test_register_missing_password_returns_400(api_client):
    response = api_client.post('/api/auth/register/', {'email': 'new@test.fr'})
    assert response.status_code == 400


# ─── Login endpoint ───────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_login(api_client, user):
    response = api_client.post('/api/auth/login/', {
        'email': 'test@lift.com',
        'password': 'testpass123',
    })
    assert response.status_code == 200
    assert 'access' in response.data
    assert 'refresh' in response.data

@pytest.mark.django_db
def test_login_returns_user_info(api_client, user):
    response = api_client.post('/api/auth/login/', {
        'email': 'test@lift.com',
        'password': 'testpass123',
    })
    assert response.data['user']['email'] == 'test@lift.com'

@pytest.mark.django_db
def test_login_wrong_password_returns_400(api_client, user):
    response = api_client.post('/api/auth/login/', {
        'email': 'test@lift.com',
        'password': 'wrongpassword',
    })
    assert response.status_code == 400

@pytest.mark.django_db
def test_login_nonexistent_user_returns_400(api_client):
    response = api_client.post('/api/auth/login/', {
        'email': 'ghost@lift.com',
        'password': 'testpass123',
    })
    assert response.status_code == 400

@pytest.mark.django_db
def test_login_missing_email_returns_400(api_client):
    response = api_client.post('/api/auth/login/', {'password': 'testpass123'})
    assert response.status_code == 400

@pytest.mark.django_db
def test_login_missing_password_returns_400(api_client, user):
    response = api_client.post('/api/auth/login/', {'email': 'test@lift.com'})
    assert response.status_code == 400


# ─── Me endpoint ──────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_me_returns_200(auth_client):
    response = auth_client.get('/api/auth/me/')
    assert response.status_code == 200

@pytest.mark.django_db
def test_me_returns_correct_email(auth_client):
    response = auth_client.get('/api/auth/me/')
    assert response.data['email'] == 'test@lift.com'

@pytest.mark.django_db
def test_me_unauthenticated_returns_401(api_client):
    response = api_client.get('/api/auth/me/')
    assert response.status_code == 401

@pytest.mark.django_db
def test_me_patch_updates_first_name(auth_client):
    response = auth_client.patch('/api/auth/me/', {'first_name': 'Maxime'})
    assert response.status_code == 200

@pytest.mark.django_db
def test_me_patch_profile_visibility(auth_client):
    response = auth_client.patch('/api/auth/me/', {'profile_visibility': 'PRIVATE'})
    assert response.status_code == 200


# ─── Token refresh ────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_token_refresh(api_client, user):
    login = api_client.post('/api/auth/login/', {
        'email': 'test@lift.com',
        'password': 'testpass123',
    })
    response = api_client.post('/api/auth/token/refresh/', {
        'refresh': login.data['refresh'],
    })
    assert response.status_code == 200
    assert 'access' in response.data

@pytest.mark.django_db
def test_token_refresh_invalid_returns_401(api_client):
    response = api_client.post('/api/auth/token/refresh/', {'refresh': 'notvalid'})
    assert response.status_code == 401


# ─── Permissions: IsOwner ─────────────────────────────────────────────────────

def test_is_owner_allows_owner():
    permission = IsOwner()
    request = Mock()
    obj = Mock()
    obj.user = request.user
    assert permission.has_object_permission(request, Mock(), obj) is True

def test_is_owner_denies_non_owner():
    permission = IsOwner()
    request = Mock()
    request.user = Mock()
    obj = Mock()
    obj.user = Mock()
    assert permission.has_object_permission(request, Mock(), obj) is False


# ─── Permissions: IsOwnerOrReadOnly ──────────────────────────────────────────

def test_is_owner_or_read_only_allows_get():
    permission = IsOwnerOrReadOnly()
    request = Mock()
    request.method = 'GET'
    assert permission.has_object_permission(request, Mock(), Mock()) is True

def test_is_owner_or_read_only_allows_head():
    permission = IsOwnerOrReadOnly()
    request = Mock()
    request.method = 'HEAD'
    assert permission.has_object_permission(request, Mock(), Mock()) is True

def test_is_owner_or_read_only_allows_options():
    permission = IsOwnerOrReadOnly()
    request = Mock()
    request.method = 'OPTIONS'
    assert permission.has_object_permission(request, Mock(), Mock()) is True

def test_is_owner_or_read_only_denies_put_non_owner():
    permission = IsOwnerOrReadOnly()
    request = Mock()
    request.method = 'PUT'
    request.user = Mock()
    obj = Mock()
    obj.user = Mock()
    assert permission.has_object_permission(request, Mock(), obj) is False

def test_is_owner_or_read_only_allows_put_owner():
    permission = IsOwnerOrReadOnly()
    request = Mock()
    request.method = 'PUT'
    obj = Mock()
    obj.user = request.user
    assert permission.has_object_permission(request, Mock(), obj) is True
