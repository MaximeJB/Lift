
1. Ajouter les champs au modèle Exercise
Objectif : Préparer le modèle à recevoir les données Hevy (video, source externe, muscles secondaires, type d'exercice).

4 champs à ajouter : video_url (URLField), external_id (CharField unique nullable), secondary_muscle_groups (JSONField), exercise_type (CharField avec choices).

Ressources :

Doc Django : docs.djangoproject.com/en/5.0/ref/models/fields/
Regarde comment muscle_group est déjà implémenté pour le pattern choices


2. Créer et appliquer la migration
Objectif : Appliquer les nouveaux champs en base de données.

makemigrations + migrate. Vérifier que la migration est propre et que les champs existants ne sont pas impactés.

Ressources :

Doc Django : docs.djangoproject.com/en/5.0/topics/migrations/


3. Installer thefuzz
Objectif : Avoir une librairie de fuzzy matching pour comparer les titres Hevy aux titres en BDD.

Un seul pip install. Teste-la rapidement dans le shell Python avec deux titres pour voir le score.

Ressources :

PyPI : pypi.org/project/thefuzz
Recherche : "thefuzz python ratio example"


4. Créer import_hevy.py — Phase EXTRACT
Objectif : Charger hevy.json et data_vids.json en mémoire dans le management command.

Créer le fichier import_hevy.py dans management/commands/. Charger les deux JSON. Filtrer les exercices Hevy qui ont une vidéo dans data_vids (406 sur 435). Afficher un résumé de ce qui a été chargé.

Ressources :

Pattern existant : regarde import_exercices.py pour la structure du management command
Python : json.load()


5. Phase TRANSFORM — Lookup vidéo + normalisation
Objectif : Pour chaque exercice Hevy, récupérer sa video_url via le dict data_vids, et normaliser le titre pour préparer le matching.

Itérer sur les exercices Hevy filtrés. Pour chaque : lookup la vidéo par ID dans data_vids, normaliser le titre (minuscule, retirer parenthèses). Stocker le résultat en mémoire (liste de dicts).

Ressources :

Python : str.lower(), str.replace()
Recherche : "python normalize string for comparison"


6. Phase LOAD — Fuzzy match BDD + update
Objectif : Pour chaque exercice transformé, chercher un match fuzzy en BDD et mettre à jour les champs manquants (video_url, external_id, secondary_muscles, exercise_type).

Récupérer tous les exercices Django en mémoire. Pour chaque exercice Hevy normalisé, fuzzy match contre les noms en BDD. Si score > seuil → update. Sinon → ne pas créer (on garde nos 873).

Ressources :

Django ORM : Exercise.objects.all(), .save()
thefuzz : fuzz.ratio(), process.extractOne()
Recherche : "thefuzz extractOne best match python"


7. Ajouter le check d'idempotence
Objectif : Si le script est relancé, détecter que le travail est déjà fait et annuler.

Au début du command, vérifier si des exercices ont déjà un external_id rempli. Si oui → afficher un message et return.

Ressources :

Django ORM : Exercise.objects.filter(external_id__isnull=False).exists()


8. Ajouter le REPORT
Objectif : Afficher un résumé clair à la fin de l'import (combien matchés, combien sans match, combien sans vidéo).

4 compteurs initialisés à 0, incrémentés pendant la boucle LOAD, affichés à la fin avec self.stdout.write().

Ressources :

Pattern existant : regarde la fin de dl_exo.py — même principe que len(video_dict)


9. Logger les non-trouvés dans un JSON
Objectif : Sauvegarder les exercices Hevy sans match dans un fichier JSON pour analyse manuelle.

Chaque exercice dont le fuzzy score est sous le seuil → ajouter dans une liste avec titre + meilleur match + score. Écrire dans unmatched_exercises.json à la fin.

Ressources :

Python : json.dump()


10. Tester sur un sous-ensemble
Objectif : Vérifier que le pipeline ETL fonctionne sur 5-10 exercices avant de lancer sur les 406.

Limiter temporairement la boucle (slice la liste) et vérifier en shell Django que les données sont bien en BDD.

Ressources :

Python : slicing list[:10]
Django shell : python manage.py shell → Exercise.objects.filter(video_url__isnull=False)


11. Exécuter l'import complet
Objectif : Lancer le pipeline sur les 406 exercices avec vidéos.

python manage.py import_hevy. Vérifier le REPORT. Analyser unmatched_exercises.json.

Ressources :

Terminal : python manage.py import_hevy


12. Mettre à jour ExerciseSerializer
Objectif : Exposer les nouveaux champs (video_url, external_id, secondary_muscle_groups, exercise_type) dans l'API REST.

Ajouter les champs dans le serializer existant.

Ressources :

Doc DRF : django-rest-framework.org/api-guide/serializers/
Fichier existant : liftapp/serializers.py


13. Tester l'API
Objectif : Vérifier que GET /api/lift/exercise/ retourne les vidéos et nouveaux champs correctement.

Lancer le serveur, naviguer sur l'API browsable, vérifier un exercice avec vidéo et un sans.

Ressources :

DRF browsable API : http://localhost:8000/api/lift/exercise/


14. Télécharger les 406 vidéos en local
Objectif : Self-host les vidéos au lieu de dépendre du CDN Hevy. Télécharger tous les .mp4.

Écrire un script/command qui itère data_vids.json et télécharge chaque URL. Organiser dans un dossier media/exercises/.

Ressources :

Python : module requests ou urllib
Recherche : "python download file from url requests"


15. Commit propre
Objectif : Versionner tout le travail (modèle, migration, import command, serializer).

Un commit cohérent : feat: ETL pipeline to import Hevy exercises with video URLs

Commence par la tâche 1 — modifier le modèle Exercise.