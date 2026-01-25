import json
from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import transaction
from liftapp.models import Exercise

# On place les constantes en haut pour une maintenance facile
JSON_FILENAME = "exercises.json"

MUSCLE_MAPPING = {
    "abdominals": "CORE",
    "adductors": "FULL_BODY",
    "quadriceps": "QUADS",
    "biceps": "BICEPS",
    "shoulders": "SHOULDERS",
    "chest": "CHEST",
    "hamstrings": "ISCHIOS",
    "middle back": "UPPER_BACK",
    "lats": "LATS",
    "lower back": "LOWER_BACK",
    "calves": "CALVES",
    "glutes": "GLUTES",
    "triceps": "TRICEPS",
    "forearms": "FOREARMS",
    "traps": "UPPER_BACK",
}

class Command(BaseCommand):
    help = "Importation optimisée des exercices"

    def handle(self, *args, **options):
        self.stdout.write(self.style.HTTP_INFO("=" * 50))
        self.stdout.write(self.style.HTTP_INFO("🏋️ IMPORTATION DES EXERCICES"))
        self.stdout.write(self.style.HTTP_INFO("=" * 50))
        
        file_path = settings.BASE_DIR / JSON_FILENAME
        self.stdout.write(f"📁 Recherche du fichier : {file_path}")
        
        if not file_path.exists():
            self.stdout.write(self.style.ERROR(f"Fichier introuvable : {file_path}"))
            return
        
        self.stdout.write(self.style.SUCCESS("✓ Fichier trouvé"))
        
        # 2. Lecture du fichier
        self.stdout.write("📖 Lecture du JSON en cours...")
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except json.JSONDecodeError:
            self.stdout.write(self.style.ERROR("Erreur : Le fichier JSON est corrompu."))
            return
        
        self.stdout.write(self.style.SUCCESS(f"✓ {len(data)} entrées trouvées dans le fichier"))

        # 3. Traitement avec Atomic Transaction pour la sécurité des données
        self.stdout.write("⚙️ Transformation des données...")
        exercises_to_create = []
        for item in data:
            # Nettoyage et transformation (Le Mapping)
            # .get() avec un fallback [] évite les erreurs si la clé manque
            primary_muscles = item.get("primaryMuscles", [])
            
            # On prend le 1er muscle s'il existe, sinon chaîne vide
            raw_muscle = primary_muscles[0] if primary_muscles else ""
            
            # On traduit pour Django. "CORE" est notre valeur par défaut si inconnu.
            muscle_group = MUSCLE_MAPPING.get(raw_muscle, "CORE")

            # Création de l'instance en mémoire
            exercises_to_create.append(
                Exercise(
                    name=item.get("name"),
                    description="\n".join(item.get("instructions", [])),
                    muscle_group=muscle_group,
                    is_compound=(item.get("mechanic") == "compound"),
                    equipment_needed=item.get("equipment") or "" # Gère le cas 'null'
                )
            )
        self.stdout.write(self.style.SUCCESS(f"✓ {len(exercises_to_create)} exercices préparés"))
        if not exercises_to_create:
            self.stdout.write(self.style.WARNING("⚠️ Aucun exercice à importer."))
            return
        self.stdout.write("💾 Insertion en base de données...")
        count_before = Exercise.objects.count()

        # 4. Insertion groupée atomique
        with transaction.atomic():
            self.stdout.write(f"Vérification : l'exercice {exercises_to_create[0].name} est prêt.")
            created_objs = Exercise.objects.bulk_create(
                exercises_to_create, 
                ignore_conflicts=True
            )
        
        count_after = Exercise.objects.count()
        created_count = count_after - count_before

        self.stdout.write(self.style.HTTP_INFO("-" * 50))
        self.stdout.write(self.style.SUCCESS(f"✅ Import terminé avec succès !"))
        self.stdout.write(f"   • Exercices créés : {created_count}")
        self.stdout.write(f"   • Doublons ignorés : {len(exercises_to_create) - created_count}")
        self.stdout.write(f"   • Total en base : {count_after}")
        self.stdout.write(self.style.HTTP_INFO("-" * 50))