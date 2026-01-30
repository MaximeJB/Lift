from django.core.management.base import BaseCommand
import json
import time
from django.conf import settings
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

# webdriver                → permet de lancer et contrôler un navigateur
# By                        → définit la méthode pour localiser un élément HTML
# WebDriverWait             → permet d’attendre qu’un élément apparaisse
# expected_conditions (EC)  → conditions prêtes à l’emploi pour l’attente
# TimeoutException          → erreur si l’élément attendu n’apparaît pas à temps

class Command(BaseCommand):
    def handle(self, *args, **options):
        BASE_URL = "https://hevy.com"
        JSON_FILENAME = 'hevy.json'
        CHECKPOINT_INTERVAL = 50
        video_dict = {}

        # BASE_URL → URL de base du site utilisée pour construire /exercise/{id}
    
        file_path = settings.BASE_DIR / JSON_FILENAME
        video_urls = []

        # Charger le JSON avant de lancer le navigateur
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except (json.JSONDecodeError, FileNotFoundError) as e:
            self.stdout.write(self.style.ERROR(f"Erreur fichier JSON : {e}"))
            return

        total = len(data['exercise_templates'])

        driver = webdriver.Chrome()
        wait = WebDriverWait(driver, 10)

        try:
            for index, item in enumerate(data['exercise_templates']):
                exercise_id = item['id']
                page_url = f"{BASE_URL}/exercise/{exercise_id}"

                driver.get(page_url)
                print(f'{index + 1} / {total}')

                try:
                    video = wait.until(EC.presence_of_element_located((By.TAG_NAME, "video")))
                    src = video.get_attribute("src")

                    if not src:
                        source = video.find_element(By.TAG_NAME, "source")
                        src = source.get_attribute("src")

                    video_urls.append(src)
                    video_dict[item['id']] = src
                    self.stdout.write(self.style.SUCCESS(f"✓ Vidéo ajouté dans le dict !"))
                    time.sleep(1)

                    if index % CHECKPOINT_INTERVAL == 0 and index > 0:
                        with open('data_vids.json', 'w') as f:
                            json.dump(video_dict, f)

                except TimeoutException:
                    print(f"Aucune vidéo pour exercise {exercise_id}")

        finally:
            driver.quit()
            print(f"Terminé. {len(video_dict)} vidéos récupérées.")
            with open('data_vids.json', 'w') as f:
                json.dump(video_dict, f)
