

from django.core.management.base import BaseCommand
from django.conf import settings
from liftapp.models import Exercise, MuscleGroup
import json
import difflib

HEVY_FILENAME = 'hevy.json'
DATAVID_FILENAME= 'data_vids.json'

MUSCLE_MAPPING = {
    "abdominals": "CORE",
    "adductors": "ADDUCTORS",
    "quadriceps": "QUADS",
    "biceps": "BICEPS",
    "shoulders": "SHOULDERS",
    "chest": "CHEST",
    "hamstrings": "ISCHIOS",
    "lats": "LATS",
    "calves": "CALVES",
    "glutes": "GLUTES",
    "triceps": "TRICEPS",
    "forearms": "FOREARMS",
    "traps": "UPPER_BACK",
    "lower_back": "LOWER_BACK",
    "upper_back": "UPPER_BACK",
    "full_body": "FULL_BODY",
    "abductors":"ABDUCTORS"
}


class Command(BaseCommand):
    help = "rajoute les secondary muscles sur notre base de données, sources hevy"
    
    #etape1 :   charger hevy.json et data_vids.json
    #etape2 :   lire les deux, les charger dans une variable
    #etape3 :   avoir une confirmation de ce qui a été lu, si y'a eu une erreur
    #etape4 :   convertir les données vers mes clef, comme sursur import exercices
    #           avoir un dictionnaire en haut du fichier
    #etape5 :   charger tous les exercices existant de la BDD
    #etape6 :   utiliser difflib pour matcher de manière fuzzy
    #etape7 :   stocker les non match dans une liste séparé
    #etape8 :   pour chaque match, récuperer l'objet
    #etape9 :   appeler secondary_muscle pour l'ajouter
    #etape10:   rapport en fin de programme
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.HTTP_INFO("=" * 50))
        self.stdout.write(self.style.HTTP_INFO("🏋️ DEBUT DU PROCESSUS"))
        self.stdout.write(self.style.HTTP_INFO("=" * 50))
        
        file_path_hevy = settings.BASE_DIR / HEVY_FILENAME
        file_path_datavid = settings.BASE_DIR / DATAVID_FILENAME
        self.stdout.write(f"📁 Recherche du fichier : {file_path_hevy}")
        self.stdout.write(f"📁 Recherche du fichier : {file_path_datavid}")
        
        if not file_path_hevy.exists() or not file_path_datavid.exists():
            self.stdout.write(self.style.ERROR(f"Fichier introuvable : "))
            return
        
        self.stdout.write(self.style.SUCCESS("✓ Fichier trouvé"))
        
        self.stdout.write("📖 Lecture du JSON en cours...")
        try:
            with open(file_path_hevy, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except json.JSONDecodeError:
            self.stdout.write(self.style.ERROR("Erreur : Le fichier JSON est corrompu."))
            return
        
        self.stdout.write(self.style.SUCCESS(f"✓ {len(data['exercise_templates'])} entrées trouvées dans le fichier"))
        
        self.stdout.write("📖 Lecture du deuxieme JSON en cours...")
        try:
            with open(file_path_datavid, 'r', encoding='utf-8') as f:
                data_datavid = json.load(f)
        except json.JSONDecodeError:
            self.stdout.write(self.style.ERROR("Erreur : Le fichier JSON est corrompu."))
            return
        
        self.stdout.write(self.style.SUCCESS(f"✓ {len(data_datavid)} entrées trouvées dans le fichier"))
        
        queryset = Exercise.objects.all()
        db_exercises = {exercise.name : exercise for exercise in queryset}
        
        db_name = list(db_exercises.keys())
        matches = []
        misses = []
        
        for hevy_ex in data['exercise_templates']:
            hevy_title = hevy_ex['title']
            result = difflib.get_close_matches(hevy_title, db_name, n=1, cutoff=0.6)
            if result:
                matched_name = result[0]
                matches.append((hevy_ex,db_exercises[matched_name]))
            else:
                misses.append(hevy_title)
                
        for hevy_ex, exercise_obj in matches:
            video_url = data_datavid.get(hevy_ex['id'])
            exercise_type = hevy_ex['type'].upper()
            
            Exercise.objects.filter(pk=exercise_obj.pk).update(
                video_url=video_url,
                exercise_type=exercise_type,
                external_id=hevy_ex['id']
            )
            
            secondary_keys = [MUSCLE_MAPPING.get(m) for m in hevy_ex['secondary_muscle_groups'] if MUSCLE_MAPPING.get(m)]
            muscle_objs = [MuscleGroup.objects.get_or_create(name=k)[0] for k in secondary_keys]
            
            exercise_obj.secondary_muscle_groups.set(muscle_objs)
            
        self.stdout.write(self.style.HTTP_INFO("-" * 50))
        self.stdout.write(self.style.SUCCESS(f"✅ Import terminé avec succès !"))
        self.stdout.write(f"   Nb total d'exo traités : {len(data['exercise_templates'])}")
        self.stdout.write(f"   Nb de matches : {len(matches)}")
        self.stdout.write(f"   Nb de misses : {len(misses)}")
        self.stdout.write(self.style.HTTP_INFO("-" * 50))