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


# ─── API Exercise : filtres, classement, pagination (ticket 18) ────────────────
#
# Le classement a ete reecrit le 03/08/2026 : exercices connus d'abord, puis qualite de
# correspondance, puis nom le plus court. Rien ne le protegeait.

@pytest.fixture
def catalogue(db):
    """Petit catalogue aux proprietes controlees, pour juger l'ordre et les filtres."""
    return {
        'connu': Exercise.objects.create(
            name='Bench Press', muscle_group='CHEST', external_id='hevy-1'
        ),
        'long': Exercise.objects.create(
            name='Decline Barbell Bench Press', muscle_group='CHEST'
        ),
        'row_court': Exercise.objects.create(name='Row', muscle_group='BACK'),
        'row_long': Exercise.objects.create(name='Barbell Bent Over Row', muscle_group='BACK'),
        'squat': Exercise.objects.create(name='Squat', muscle_group='QUADS'),
    }


@pytest.mark.django_db
def test_filtre_groupe_musculaire_unique(auth_client, catalogue):
    reponse = auth_client.get('/api/lift/exercise/?muscle_group=CHEST')
    assert reponse.status_code == 200
    assert reponse.data['count'] == 2


@pytest.mark.django_db
def test_filtre_groupes_musculaires_donne_une_union(auth_client, catalogue):
    """C1 §9 BR-3 : OU entre les chips. Deux groupes doivent donner PLUS de resultats."""
    reponse = auth_client.get('/api/lift/exercise/?muscle_group=CHEST&muscle_group=BACK')
    assert reponse.status_code == 200
    assert reponse.data['count'] == 4


@pytest.mark.django_db
def test_filtre_groupe_musculaire_inconnu_est_refuse(auth_client, catalogue):
    """Un choix hors des 18 doit lever, pas etre ignore en silence."""
    reponse = auth_client.get('/api/lift/exercise/?muscle_group=PECTORAUX')
    assert reponse.status_code == 400


@pytest.mark.django_db
def test_recherche_et_filtre_se_croisent(auth_client, catalogue):
    """Entre la recherche et les groupes c'est un ET, entre deux groupes un OU."""
    reponse = auth_client.get('/api/lift/exercise/?search=Bench&muscle_group=BACK')
    assert reponse.data['count'] == 0

    reponse = auth_client.get('/api/lift/exercise/?search=Bench&muscle_group=CHEST')
    assert reponse.data['count'] == 2


@pytest.mark.django_db
def test_classement_les_exercices_connus_dabord(auth_client, catalogue):
    """`external_id` non nul = apparie au catalogue Hevy, donc remonte en tete."""
    reponse = auth_client.get('/api/lift/exercise/?muscle_group=CHEST')
    assert reponse.data['results'][0]['name'] == 'Bench Press'


@pytest.mark.django_db
def test_classement_le_nom_le_plus_court_a_egalite(auth_client, catalogue):
    """Aucun des deux n'est connu : c'est la longueur qui departage, donc le plus generique."""
    reponse = auth_client.get('/api/lift/exercise/?muscle_group=BACK')
    noms = [e['name'] for e in reponse.data['results']]
    assert noms == ['Row', 'Barbell Bent Over Row']


@pytest.mark.django_db
def test_recherche_classe_exact_puis_commence_par_puis_contient(auth_client, db):
    Exercise.objects.create(name='Preacher Curl', muscle_group='BICEPS')
    Exercise.objects.create(name='Curl Machine', muscle_group='BICEPS')
    Exercise.objects.create(name='Curl', muscle_group='BICEPS')

    reponse = auth_client.get('/api/lift/exercise/?search=Curl')
    noms = [e['name'] for e in reponse.data['results']]
    assert noms == ['Curl', 'Curl Machine', 'Preacher Curl']


@pytest.mark.django_db
def test_la_recherche_decoupe_les_mots_et_les_exige_tous(auth_client, catalogue):
    """SearchFilter separe la requete sur les espaces : ET entre les mots, OU entre les champs.

    « bench press » remonte donc AUSSI « Decline Barbell Bench Press », qui contient les
    deux mots sans les avoir cote a cote. Le comportement est celui de DRF, pas le notre ;
    ce test le fige pour qu'un changement de version se voie.
    """
    reponse = auth_client.get('/api/lift/exercise/?search=bench press')
    noms = [e['name'] for e in reponse.data['results']]
    assert noms == ['Bench Press', 'Decline Barbell Bench Press']


@pytest.mark.django_db
def test_recherche_porte_aussi_sur_le_materiel(auth_client, db):
    """`search_fields` couvre nom, description, groupe et materiel."""
    Exercise.objects.create(name='Something', muscle_group='CHEST', equipment_needed='kettlebell')
    reponse = auth_client.get('/api/lift/exercise/?search=kettlebell')
    assert reponse.data['count'] == 1


@pytest.mark.django_db
def test_pagination_deux_pages_ne_se_recouvrent_pas(auth_client, db):
    """Sans ordre stable, deux pages consecutives peuvent renvoyer le meme exercice."""
    for i in range(30):
        Exercise.objects.create(name=f'Exercice {i:02d}', muscle_group='CHEST')

    page1 = auth_client.get('/api/lift/exercise/?limit=25&offset=0')
    page2 = auth_client.get('/api/lift/exercise/?limit=25&offset=25')

    ids1 = {e['id'] for e in page1.data['results']}
    ids2 = {e['id'] for e in page2.data['results']}

    assert len(ids1) == 25
    assert len(ids2) == 5
    assert ids1.isdisjoint(ids2)


@pytest.mark.django_db
def test_pagination_offset_au_dela_du_total_renvoie_une_liste_vide(auth_client, catalogue):
    reponse = auth_client.get('/api/lift/exercise/?limit=25&offset=500')
    assert reponse.status_code == 200
    assert reponse.data['results'] == []


@pytest.mark.django_db
def test_exercice_inexistant_renvoie_404(auth_client, db):
    reponse = auth_client.get('/api/lift/exercise/00000000-0000-0000-0000-000000000000/')
    assert reponse.status_code == 404


@pytest.mark.django_db
def test_liste_vide_ne_leve_pas(auth_client, db):
    reponse = auth_client.get('/api/lift/exercise/')
    assert reponse.status_code == 200
    assert reponse.data['count'] == 0


# ─── Permissions, cascades et validations (ticket 19) ─────────────────────────

@pytest.mark.django_db
def test_seance_dun_autre_utilisateur_renvoie_404(auth_client, autre_user):
    """404 et non 403 : le filtrage de queryset la fait disparaitre, elle n'existe pas."""
    seance = WorkoutSession.objects.create(user=autre_user, title='Privee', date='2026-08-03')
    reponse = auth_client.get(f'/api/lift/workout_session/{seance.id}/')
    assert reponse.status_code == 404


@pytest.mark.django_db
def test_seance_dun_autre_utilisateur_absente_de_la_liste(auth_client, user, autre_user):
    WorkoutSession.objects.create(user=autre_user, title='Privee', date='2026-08-03')
    WorkoutSession.objects.create(user=user, title='Mienne', date='2026-08-03')

    reponse = auth_client.get('/api/lift/workout_session/')
    titres = [s['title'] for s in reponse.data['results']]
    assert titres == ['Mienne']


@pytest.mark.django_db
def test_seance_dun_autre_utilisateur_non_supprimable(auth_client, autre_user):
    seance = WorkoutSession.objects.create(user=autre_user, title='Privee', date='2026-08-03')
    reponse = auth_client.delete(f'/api/lift/workout_session/{seance.id}/')
    assert reponse.status_code == 404
    assert WorkoutSession.objects.filter(pk=seance.pk).exists()


@pytest.mark.django_db
def test_serie_dun_autre_utilisateur_renvoie_404(auth_client, autre_user):
    exercice = Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    seance = WorkoutSession.objects.create(user=autre_user, title='Privee', date='2026-08-03')
    serie = Set.objects.create(
        workout_session=seance, exercise=exercice, set_number=1, weight_kg=80, reps=8
    )

    reponse = auth_client.get(f'/api/lift/set/{serie.id}/')
    assert reponse.status_code == 404


@pytest.mark.django_db
def test_lutilisateur_est_pose_par_le_serveur_pas_par_le_corps(auth_client, user, autre_user):
    """`perform_create` ecrase ce que le client pretend : `user` est en lecture seule."""
    reponse = auth_client.post('/api/lift/workout_session/', {
        'title': 'Tentative',
        'date': '2026-08-03',
        'user': str(autre_user.id),
    })

    assert reponse.status_code == 201
    assert WorkoutSession.objects.get(pk=reponse.data['id']).user == user


@pytest.mark.django_db
def test_impossible_decrire_une_serie_dans_la_seance_dun_autre(auth_client, autre_user):
    """Ferme le 03/08/2026 par SetSerializer.validate_workout_session."""
    exercice = Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    seance = WorkoutSession.objects.create(user=autre_user, title='Privee', date='2026-08-03')

    reponse = auth_client.post('/api/lift/set/', {
        'workout_session': str(seance.id),
        'exercise': str(exercice.id),
        'set_number': 1,
        'weight_kg': 80,
        'reps': 8,
    })

    assert reponse.status_code in (400, 403, 404)


@pytest.mark.django_db
def test_impossible_de_deplacer_une_serie_vers_la_seance_dun_autre(auth_client, user, autre_user):
    """Le meme validateur tourne au PATCH : une serie a soi ne peut pas migrer chez autrui."""
    exercice = Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    mienne = WorkoutSession.objects.create(user=user, title='Mienne', date='2026-08-03')
    sienne = WorkoutSession.objects.create(user=autre_user, title='Sienne', date='2026-08-03')
    serie = Set.objects.create(
        workout_session=mienne, exercise=exercice, set_number=1, weight_kg=80, reps=8
    )

    reponse = auth_client.patch(
        f'/api/lift/set/{serie.id}/', {'workout_session': str(sienne.id)}
    )

    assert reponse.status_code == 400
    serie.refresh_from_db()
    assert serie.workout_session == mienne


@pytest.mark.django_db
def test_ecrire_une_serie_dans_sa_propre_seance_reste_possible(auth_client, user):
    """Le garde-fou ne doit pas fermer le cas normal — c'est tout l'ecran C5."""
    exercice = Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    seance = WorkoutSession.objects.create(user=user, title='Mienne', date='2026-08-03')

    reponse = auth_client.post('/api/lift/set/', {
        'workout_session': str(seance.id),
        'exercise': str(exercice.id),
        'set_number': 1,
        'weight_kg': 80,
        'reps': 8,
    })

    assert reponse.status_code == 201


@pytest.mark.django_db
def test_supprimer_une_seance_supprime_ses_series(auth_client, user):
    exercice = Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    seance = WorkoutSession.objects.create(user=user, title='Mienne', date='2026-08-03')
    Set.objects.create(
        workout_session=seance, exercise=exercice, set_number=1, weight_kg=80, reps=8
    )

    auth_client.delete(f'/api/lift/workout_session/{seance.id}/')
    assert Set.objects.count() == 0


@pytest.mark.django_db
def test_un_exercice_utilise_ne_peut_pas_etre_supprime(user):
    """`Set.exercise` declare on_delete=PROTECT : l'historique ne doit pas se trouer."""
    from django.db.models import ProtectedError

    exercice = Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    seance = WorkoutSession.objects.create(user=user, title='Mienne', date='2026-08-03')
    Set.objects.create(
        workout_session=seance, exercise=exercice, set_number=1, weight_kg=80, reps=8
    )

    with pytest.raises(ProtectedError):
        exercice.delete()


@pytest.mark.django_db
def test_supprimer_un_template_laisse_la_seance_vivante(user):
    """`WorkoutSession.template` declare on_delete=SET_NULL : la seance survit au programme."""
    template = WorkoutTemplate.objects.create(name='Push', category='STRENGTH')
    seance = WorkoutSession.objects.create(
        user=user, title='Mienne', date='2026-08-03', template=template
    )

    template.delete()
    seance.refresh_from_db()

    assert seance.template is None


@pytest.mark.django_db
def test_deux_series_peuvent_porter_le_meme_numero(auth_client, user):
    """Etat des lieux : aucune contrainte d'unicite sur (seance, exercice, set_number).

    Le numero est pose par le client (C5 §9 BR-3). Ce test fige le comportement actuel :
    s'il se met a echouer, c'est qu'une contrainte a ete ajoutee, et le client devra la
    respecter.
    """
    exercice = Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    seance = WorkoutSession.objects.create(user=user, title='Mienne', date='2026-08-03')

    for _ in range(2):
        reponse = auth_client.post('/api/lift/set/', {
            'workout_session': str(seance.id),
            'exercise': str(exercice.id),
            'set_number': 1,
            'weight_kg': 80,
            'reps': 8,
        })
        assert reponse.status_code == 201


@pytest.mark.xfail(
    strict=True,
    reason=(
        "Le modele Set n'a AUCUN validateur : un poids negatif est accepte. C5 §9 BR-2 fait "
        "porter la verification au client, ce qui ne protege pas l'API."
    ),
)
@pytest.mark.django_db
def test_un_poids_negatif_est_refuse(auth_client, user):
    exercice = Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    seance = WorkoutSession.objects.create(user=user, title='Mienne', date='2026-08-03')

    reponse = auth_client.post('/api/lift/set/', {
        'workout_session': str(seance.id),
        'exercise': str(exercice.id),
        'set_number': 1,
        'weight_kg': -80,
        'reps': 8,
    })

    assert reponse.status_code == 400


@pytest.mark.xfail(
    strict=True,
    reason="Meme trou : zero repetition est accepte par l'API.",
)
@pytest.mark.django_db
def test_zero_repetition_est_refuse(auth_client, user):
    exercice = Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    seance = WorkoutSession.objects.create(user=user, title='Mienne', date='2026-08-03')

    reponse = auth_client.post('/api/lift/set/', {
        'workout_session': str(seance.id),
        'exercise': str(exercice.id),
        'set_number': 1,
        'weight_kg': 80,
        'reps': 0,
    })

    assert reponse.status_code == 400


@pytest.mark.django_db
def test_serie_sans_seance_est_refusee(auth_client, db):
    exercice = Exercise.objects.create(name='Bench Press', muscle_group='CHEST')
    reponse = auth_client.post('/api/lift/set/', {
        'exercise': str(exercice.id),
        'set_number': 1,
        'weight_kg': 80,
        'reps': 8,
    })
    assert reponse.status_code == 400


@pytest.mark.django_db
def test_seance_non_authentifiee_renvoie_401(api_client, db):
    reponse = api_client.get('/api/lift/workout_session/')
    assert reponse.status_code == 401
