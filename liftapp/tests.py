import pytest
from django.contrib.auth import get_user_model
from liftapp.models import Exercise, WorkoutSession, Set, WorkoutTemplate

User = get_user_model()


# ─── Model: Exercise ──────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_creating_exercise():
    Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    assert Exercise.objects.count() == 1

@pytest.mark.django_db
def test_exercise_name_is_unique():
    Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    with pytest.raises(Exception):
        Exercise.objects.create(name='Bench Press', muscle_group='CHEST')

@pytest.mark.django_db
def test_exercise_is_compound_defaults_to_false():
    ex = Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    assert ex.is_compound is False


# ─── Model: WorkoutSession ────────────────────────────────────────────────────

@pytest.mark.django_db
def test_creating_workout_session(user):
    WorkoutSession.objects.create(user=user, title='WorkoutTest', date='2026-06-11')
    assert WorkoutSession.objects.count() == 1

@pytest.mark.django_db
def test_workout_session_belongs_to_user(user):
    workout = WorkoutSession.objects.create(user=user, title='Test', date='2026-07-01')
    assert workout.user == user

@pytest.mark.django_db
def test_workout_session_date_defaults_to_today(user):
    from datetime import date
    workout = WorkoutSession.objects.create(user=user, title='Test')
    assert workout.date == date.today()


# ─── Model: Set ───────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_creating_set(user):
    workout = WorkoutSession.objects.create(user=user, title='WorkoutTest', date='2026-06-11')
    exercise = Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    Set.objects.create(workout_session=workout, exercise=exercise, set_number=1, weight_kg=80, reps=10)
    assert Set.objects.count() == 1

@pytest.mark.django_db
def test_set_defaults(user):
    workout = WorkoutSession.objects.create(user=user, title='Test', date='2026-07-01')
    exercise = Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    s = Set.objects.create(workout_session=workout, exercise=exercise, set_number=1, weight_kg=80, reps=10)
    assert s.is_warmup is False
    assert s.is_failure is False

@pytest.mark.django_db
def test_set_cascade_delete_with_session(user):
    workout = WorkoutSession.objects.create(user=user, title='Test', date='2026-07-01')
    exercise = Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    Set.objects.create(workout_session=workout, exercise=exercise, set_number=1, weight_kg=80, reps=10)
    workout.delete()
    assert Set.objects.count() == 0


# ─── API: Exercise ────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_exercise_list_authenticated(auth_client):
    Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    response = auth_client.get('/api/lift/exercise/')
    assert response.status_code == 200

@pytest.mark.django_db
def test_exercise_list_unauthenticated(api_client):
    response = api_client.get('/api/lift/exercise/')
    assert response.status_code == 200

@pytest.mark.django_db
def test_exercise_post_not_allowed(auth_client):
    response = auth_client.post('/api/lift/exercise/', {'name': 'Test', 'muscle_group': 'CHEST'})
    assert response.status_code == 405

@pytest.mark.django_db
def test_exercise_search_filters_by_name(auth_client):
    Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    Exercise.objects.create(name='Squat', muscle_group='QUADS')
    response = auth_client.get('/api/lift/exercise/?search=Bench')
    assert response.status_code == 200
    assert response.data['count'] == 1

@pytest.mark.django_db
def test_exercise_contains_expected_fields(auth_client):
    Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    response = auth_client.get('/api/lift/exercise/')
    first = response.data['results'][0]
    for field in ['id', 'name', 'muscle_group', 'video_url', 'secondary_muscle_groups', 'exercise_type']:
        assert field in first

@pytest.mark.django_db
def test_exercise_detail(auth_client):
    ex = Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    response = auth_client.get(f'/api/lift/exercise/{ex.id}/')
    assert response.status_code == 200
    assert response.data['name'] == 'Bench Press'


# ─── API: WorkoutTemplate ─────────────────────────────────────────────────────

@pytest.mark.django_db
def test_public_template_visible_unauthenticated(api_client):
    WorkoutTemplate.objects.create(name='Public Template', category='STRENGTH', user=None)
    response = api_client.get('/api/lift/workout_template/')
    assert response.status_code == 200
    assert response.data['count'] >= 1

@pytest.mark.django_db
def test_public_template_visible_to_all(auth_client):
    WorkoutTemplate.objects.create(name='Public Template', category='STRENGTH', user=None)
    response = auth_client.get('/api/lift/workout_template/')
    assert response.status_code == 200
    assert response.data['count'] >= 1

@pytest.mark.django_db
def test_private_template_not_visible_to_other_user(user, auth_client):
    other = User.objects.create_user(email='other@lift.com', password='pass123')
    WorkoutTemplate.objects.create(name='Private Template', category='STRENGTH', user=other)
    response = auth_client.get('/api/lift/workout_template/')
    names = [t['name'] for t in response.data['results']]
    assert 'Private Template' not in names

@pytest.mark.django_db
def test_own_template_is_visible(user, auth_client):
    WorkoutTemplate.objects.create(name='My Template', category='STRENGTH', user=user)
    response = auth_client.get('/api/lift/workout_template/')
    names = [t['name'] for t in response.data['results']]
    assert 'My Template' in names

@pytest.mark.django_db
def test_template_contains_exercises_field(user, auth_client):
    WorkoutTemplate.objects.create(name='My Template', category='STRENGTH', user=user)
    response = auth_client.get('/api/lift/workout_template/')
    assert 'exercises' in response.data['results'][0]


# ─── API: WorkoutSession ──────────────────────────────────────────────────────

@pytest.mark.django_db
def test_workout_session_create(user, auth_client):
    response = auth_client.post('/api/lift/workout_session/', {
        'title': 'Test Session',
        'date': '2026-07-26',
    })
    assert response.status_code == 201
    assert str(response.data['user']) == str(user.id)

@pytest.mark.django_db
def test_workout_session_list_only_own(user, auth_client):
    other = User.objects.create_user(email='other@lift.com', password='pass123')
    WorkoutSession.objects.create(user=user, title='Mine', date='2026-07-01')
    WorkoutSession.objects.create(user=other, title='Not Mine', date='2026-07-01')
    response = auth_client.get('/api/lift/workout_session/')
    titles = [s['title'] for s in response.data['results']]
    assert 'Mine' in titles
    assert 'Not Mine' not in titles

@pytest.mark.django_db
def test_workout_session_other_user_returns_404(user, auth_client):
    other = User.objects.create_user(email='other@lift.com', password='pass123')
    other_workout = WorkoutSession.objects.create(user=other, title='Other', date='2026-07-01')
    response = auth_client.get(f'/api/lift/workout_session/{other_workout.id}/')
    assert response.status_code == 404

@pytest.mark.django_db
def test_workout_session_unauthenticated_returns_401(api_client):
    response = api_client.get('/api/lift/workout_session/')
    assert response.status_code == 401

@pytest.mark.django_db
def test_workout_session_delete(user, auth_client):
    workout = WorkoutSession.objects.create(user=user, title='To Delete', date='2026-07-01')
    response = auth_client.delete(f'/api/lift/workout_session/{workout.id}/')
    assert response.status_code == 204
    assert WorkoutSession.objects.count() == 0

@pytest.mark.django_db
def test_workout_session_update(user, auth_client):
    workout = WorkoutSession.objects.create(user=user, title='Old Title', date='2026-07-01')
    response = auth_client.patch(f'/api/lift/workout_session/{workout.id}/', {'title': 'New Title'})
    assert response.status_code == 200
    assert response.data['title'] == 'New Title'


# ─── API: Set ─────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_post_set(auth_client, user):
    exercise = Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    workout = WorkoutSession.objects.create(user=user, title='WorkoutTest', date='2026-07-26')
    response = auth_client.post('/api/lift/set/', {
        'workout_session': str(workout.id),
        'exercise': str(exercise.id),
        'set_number': 1,
        'weight_kg': 80,
        'reps': 10,
        'rpe': 8,
    })
    assert response.status_code == 201

@pytest.mark.django_db
def test_set_list_only_own(user, auth_client):
    other = User.objects.create_user(email='other@lift.com', password='pass123')
    exercise = Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    own_workout = WorkoutSession.objects.create(user=user, title='Mine', date='2026-07-01')
    other_workout = WorkoutSession.objects.create(user=other, title='Other', date='2026-07-01')
    Set.objects.create(workout_session=own_workout, exercise=exercise, set_number=1, weight_kg=80, reps=10)
    Set.objects.create(workout_session=other_workout, exercise=exercise, set_number=1, weight_kg=80, reps=10)
    response = auth_client.get('/api/lift/set/')
    assert response.data['count'] == 1

@pytest.mark.django_db
def test_set_unauthenticated_returns_401(api_client):
    response = api_client.get('/api/lift/set/')
    assert response.status_code == 401

@pytest.mark.django_db
def test_set_delete(user, auth_client):
    exercise = Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    workout = WorkoutSession.objects.create(user=user, title='Test', date='2026-07-01')
    s = Set.objects.create(workout_session=workout, exercise=exercise, set_number=1, weight_kg=80, reps=10)
    response = auth_client.delete(f'/api/lift/set/{s.id}/')
    assert response.status_code == 204


# ─── API: hello_world ────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_hello_world(api_client):
    response = api_client.get('/api/lift/hello/')
    assert response.status_code == 200
    assert response.data['message'] == 'Hello, world!'


# ─── API: TemplateExercise ────────────────────────────────────────────────────

@pytest.mark.django_db
def test_template_exercise_list_own(user, auth_client):
    from liftapp.models import TemplateExercise
    template = WorkoutTemplate.objects.create(name='My Template', category='STRENGTH', user=user)
    exercise = Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    TemplateExercise.objects.create(template=template, exercise=exercise, order=1)
    response = auth_client.get('/api/lift/template_exercise/')
    assert response.status_code == 200
    assert response.data['count'] == 1

@pytest.mark.django_db
def test_template_exercise_public_visible(api_client):
    from liftapp.models import TemplateExercise
    template = WorkoutTemplate.objects.create(name='Public', category='STRENGTH', user=None)
    exercise = Exercise.objects.create(name='Squat', muscle_group='QUADS')
    TemplateExercise.objects.create(template=template, exercise=exercise, order=1)
    response = api_client.get('/api/lift/template_exercise/')
    assert response.status_code == 200
    assert response.data['count'] == 1

@pytest.mark.django_db
def test_template_exercise_private_hidden_from_other(auth_client):
    from liftapp.models import TemplateExercise
    other = User.objects.create_user(email='other@lift.com', password='pass123')
    template = WorkoutTemplate.objects.create(name='Other Template', category='STRENGTH', user=other)
    exercise = Exercise.objects.create(name='Deadlift', muscle_group='BACK')
    TemplateExercise.objects.create(template=template, exercise=exercise, order=1)
    response = auth_client.get('/api/lift/template_exercise/')
    assert response.data['count'] == 0


# ─── Isolation / Ownership ────────────────────────────────────────────────────

@pytest.mark.django_db
def test_ownership_other_user_cannot_access_session(api_client):
    user_a = User.objects.create_user(email='a@lift.com', password='testpass123')
    user_b = User.objects.create_user(email='b@lift.com', password='testpass123')
    workout = WorkoutSession.objects.create(user=user_a, title='Session A', date='2026-07-01')
    api_client.force_authenticate(user=user_b)
    response = api_client.get(f'/api/lift/workout_session/{workout.id}/')
    assert response.status_code in [403, 404]
