import uuid
from datetime import timedelta

import pytest
from unittest.mock import Mock
from django.contrib.auth import get_user_model
from django.utils import timezone
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


# ─── Pseudo : format, unicite, fenetre de 30 jours ────────────────────────────

@pytest.mark.django_db
def test_pseudo_change_sets_timestamp(auth_client, user):
    """Un premier changement est accepte et demarre le compteur."""
    response = auth_client.patch('/api/auth/me/', {'pseudo': 'MaxLift'})
    user.refresh_from_db()
    assert response.status_code == 200
    assert user.pseudo == 'MaxLift'
    assert user.pseudo_updated_at is not None


@pytest.mark.django_db
def test_pseudo_unchanged_does_not_reset_timer(auth_client, user):
    """Renvoyer le meme pseudo ne doit ni echouer ni repousser l'echeance."""
    auth_client.patch('/api/auth/me/', {'pseudo': 'MaxLift'})
    user.refresh_from_db()
    premiere_date = user.pseudo_updated_at

    response = auth_client.patch('/api/auth/me/', {'pseudo': 'MaxLift'})
    user.refresh_from_db()
    assert response.status_code == 200
    assert user.pseudo_updated_at == premiere_date


@pytest.mark.django_db
def test_pseudo_second_change_within_30_days_rejected(auth_client, user):
    """Le refus arrive sous la cle 'pseudo' : c'est ce qui permet l'erreur inline."""
    auth_client.patch('/api/auth/me/', {'pseudo': 'MaxLift'})
    response = auth_client.patch('/api/auth/me/', {'pseudo': 'AutreNom'})

    assert response.status_code == 400
    assert 'pseudo' in response.data

    user.refresh_from_db()
    assert user.pseudo == 'MaxLift'


@pytest.mark.django_db
def test_pseudo_change_allowed_after_30_days(auth_client, user):
    auth_client.patch('/api/auth/me/', {'pseudo': 'MaxLift'})

    # .update() ecrit directement en base, sans passer par save() ni par le serialiseur.
    User.objects.filter(pk=user.pk).update(
        pseudo_updated_at=timezone.now() - timedelta(days=31)
    )

    response = auth_client.patch('/api/auth/me/', {'pseudo': 'AutreNom'})
    user.refresh_from_db()
    assert response.status_code == 200
    assert user.pseudo == 'AutreNom'


@pytest.mark.django_db
def test_pseudo_updated_at_is_read_only(auth_client, user):
    """Modifiable, ce champ permettrait de contourner la fenetre de 30 jours."""
    auth_client.patch('/api/auth/me/', {'pseudo': 'MaxLift'})
    user.refresh_from_db()
    date_reelle = user.pseudo_updated_at

    auth_client.patch('/api/auth/me/', {
        'pseudo_updated_at': (timezone.now() - timedelta(days=90)).isoformat()
    })
    user.refresh_from_db()
    assert user.pseudo_updated_at == date_reelle


@pytest.mark.django_db
def test_pseudo_other_field_patch_does_not_touch_pseudo(auth_client, user):
    """Un PATCH partiel ne doit pas consommer le quota de changement."""
    response = auth_client.patch('/api/auth/me/', {'first_name': 'Maxime'})
    user.refresh_from_db()
    assert response.status_code == 200
    assert user.first_name == 'Maxime'
    assert user.pseudo_updated_at is None


@pytest.mark.django_db
def test_pseudo_invalid_format_rejected(auth_client):
    """Moins de 3 caracteres : refuse par PSEUDO_PATTERN."""
    response = auth_client.patch('/api/auth/me/', {'pseudo': 'ab'})
    assert response.status_code == 400
    assert 'pseudo' in response.data


@pytest.mark.django_db
def test_register_rejects_invalid_pseudo_format(api_client):
    response = api_client.post('/api/auth/register/', {
        'email': 'new@test.fr',
        'password': 'testpass123',
        'password_confirm': 'testpass123',
        'pseudo': 'a b c',
    })
    assert response.status_code == 400
    assert 'pseudo' in response.data


@pytest.mark.django_db
def test_register_rejects_pseudo_differing_only_by_case(api_client):
    """Le pseudo est l'identifiant public : MaxLift et maxlift sont le meme."""
    User.objects.create_user(email='a@lift.com', password='pass1234', pseudo='MaxLift')

    response = api_client.post('/api/auth/register/', {
        'email': 'new@test.fr',
        'password': 'testpass123',
        'password_confirm': 'testpass123',
        'pseudo': 'maxlift',
    })
    assert response.status_code == 400
    assert 'pseudo' in response.data


# ─── Authentification : jetons et cas limites (ticket 20) ─────────────────────

@pytest.mark.django_db
def test_login_ne_revele_pas_lexistence_dun_compte(api_client, user):
    """A2 §9 BR-2 : le refus doit etre identique, email inconnu ou mot de passe faux.

    Deux reponses differentes permettraient d'enumerer les comptes existants.
    """
    inconnu = api_client.post('/api/auth/login/', {
        'email': 'personne@lift.com',
        'password': 'peu importe',
    })
    mauvais = api_client.post('/api/auth/login/', {
        'email': 'test@lift.com',
        'password': 'mauvais mot de passe',
    })

    assert inconnu.status_code == mauvais.status_code == 400
    assert str(inconnu.data) == str(mauvais.data)


@pytest.mark.django_db
def test_register_refuse_deux_mots_de_passe_differents(api_client):
    reponse = api_client.post('/api/auth/register/', {
        'email': 'new@test.fr',
        'password': 'testpass123',
        'password_confirm': 'autre',
    })
    assert reponse.status_code == 400


@pytest.mark.django_db
def test_le_refus_de_mot_de_passe_porte_un_message_lisible(api_client):
    """Ferme le 03/08/2026 : le raise nu porte desormais un dict avec un message."""
    reponse = api_client.post('/api/auth/register/', {
        'email': 'new@test.fr',
        'password': 'testpass123',
        'password_confirm': 'autre',
    })

    messages = str(reponse.data).lower()
    assert 'mot de passe' in messages or 'password' in messages


@pytest.mark.django_db
def test_un_mot_de_passe_trop_faible_est_refuse(api_client):
    """Ferme le 03/08/2026 par UserRegistrationSerializer.validate_password."""
    reponse = api_client.post('/api/auth/register/', {
        'email': 'new@test.fr',
        'password': '1234',
        'password_confirm': '1234',
    })
    assert reponse.status_code == 400


@pytest.mark.django_db
def test_le_rafraichissement_renvoie_un_nouveau_jeton(api_client, user):
    login = api_client.post('/api/auth/login/', {
        'email': 'test@lift.com',
        'password': 'testpass123',
    })
    refresh = login.data['refresh']

    reponse = api_client.post('/api/auth/token/refresh/', {'refresh': refresh})

    assert reponse.status_code == 200
    assert 'access' in reponse.data
    # ROTATE_REFRESH_TOKENS est actif : un nouveau refresh accompagne la reponse.
    assert reponse.data.get('refresh') not in (None, refresh)


@pytest.mark.django_db
def test_un_refresh_deja_consomme_est_refuse(api_client, user):
    """Reecrit le 03/08/2026, dans l'autre sens.

    Ce test s'appelait `test_lancien_refresh_reste_valable_apres_rotation` et figeait un
    risque assume : la rotation emettait un nouveau jeton, mais l'ancien restait accepte
    jusqu'a son expiration, un jour plus tard.

    `BLACKLIST_AFTER_ROTATION` est desormais actif. Un jeton consomme est revoque
    immediatement, donc la fenetre de 24h sur un jeton vole est fermee.

    Un rejeu qui repasse a 200 signalerait que le reglage ou l'app `token_blacklist` a
    saute — SimpleJWT ne se plaint pas dans ce cas, il rattrape l'AttributeError en
    silence, et seul ce test le verrait.
    """
    login = api_client.post('/api/auth/login/', {
        'email': 'test@lift.com',
        'password': 'testpass123',
    })
    ancien = login.data['refresh']

    api_client.post('/api/auth/token/refresh/', {'refresh': ancien})
    rejoue = api_client.post('/api/auth/token/refresh/', {'refresh': ancien})

    assert rejoue.status_code == 401


@pytest.mark.django_db
def test_un_refresh_corrompu_est_refuse(api_client, db):
    reponse = api_client.post('/api/auth/token/refresh/', {'refresh': 'pas-un-jeton'})
    assert reponse.status_code == 401


@pytest.mark.django_db
def test_un_refresh_sans_corps_est_refuse(api_client, db):
    reponse = api_client.post('/api/auth/token/refresh/', {})
    assert reponse.status_code == 400


@pytest.mark.django_db
def test_le_refresh_dun_utilisateur_supprime_est_refuse(api_client, user):
    """Ferme le 03/08/2026 par TokenRefreshRobusteSerializer."""
    login = api_client.post('/api/auth/login/', {
        'email': 'test@lift.com',
        'password': 'testpass123',
    })
    refresh = login.data['refresh']
    user.delete()

    reponse = api_client.post('/api/auth/token/refresh/', {'refresh': refresh})
    assert reponse.status_code == 401


@pytest.mark.django_db
def test_me_sans_jeton_renvoie_401(api_client, db):
    reponse = api_client.get('/api/auth/me/')
    assert reponse.status_code == 401


@pytest.mark.django_db
def test_me_avec_un_jeton_invalide_renvoie_401(api_client, db):
    api_client.credentials(HTTP_AUTHORIZATION='Bearer pas-un-jeton')
    reponse = api_client.get('/api/auth/me/')
    assert reponse.status_code == 401


@pytest.mark.django_db
def test_patch_me_ignore_les_champs_en_lecture_seule(auth_client, user):
    """`email`, `email_verified`, `created_at` et `pseudo_updated_at` ne sont pas ecrivables."""
    reponse = auth_client.patch('/api/auth/me/', {
        'email': 'usurpe@lift.com',
        'email_verified': True,
        'first_name': 'Maxime',
    })

    user.refresh_from_db()
    assert reponse.status_code == 200
    assert user.email == 'test@lift.com'
    assert user.email_verified is False
    assert user.first_name == 'Maxime'


@pytest.mark.django_db
def test_le_proprietaire_peut_changer_la_casse_de_son_pseudo(auth_client, user):
    """L'unicite insensible a la casse exclut l'utilisateur courant du filtre."""
    auth_client.patch('/api/auth/me/', {'pseudo': 'MaxLift'})

    User.objects.filter(pk=user.pk).update(
        pseudo_updated_at=timezone.now() - timedelta(days=31)
    )

    reponse = auth_client.patch('/api/auth/me/', {'pseudo': 'maxlift'})
    user.refresh_from_db()

    assert reponse.status_code == 200
    assert user.pseudo == 'maxlift'


@pytest.mark.django_db
def test_un_pseudo_deja_pris_par_un_autre_est_refuse(auth_client, autre_user):
    User.objects.filter(pk=autre_user.pk).update(pseudo='DejaPris')

    reponse = auth_client.patch('/api/auth/me/', {'pseudo': 'DejaPris'})

    assert reponse.status_code == 400
    assert 'pseudo' in reponse.data


@pytest.mark.django_db
def test_me_ne_renvoie_jamais_le_mot_de_passe(auth_client, user):
    reponse = auth_client.get('/api/auth/me/')
    assert 'password' not in reponse.data
