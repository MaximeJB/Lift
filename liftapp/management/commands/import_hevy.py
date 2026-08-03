"""
Importe depuis Hevy les types d'exercice, les vidéos et les muscles secondaires.

N'ÉCRIT QUE CE QUI EST DÉMONTRABLE, et purge le reste.

La version précédente appariait chaque modèle Hevy au nom le plus proche de la base avec
`difflib.get_close_matches(cutoff=0.6, n=1)`. Mesuré le 03/08/2026 sur les 435 modèles :

    313 appariés, dont 183 sous un ratio de 0.75 — la zone douteuse
    60 exercices réclamés par PLUSIEURS modèles, 93 modèles écrasés en silence

Conséquence : 'Dip Machine' avait été apparié à 'Bicep Curl (Machine)', 'Hip Thrust
(Machine)' et 'Shrug (Machine)'. Le dernier écrit gagnait. Ces exercices portaient donc un
`exercise_type` faux, une `video_url` fausse et des muscles secondaires faux — un
utilisateur pouvait regarder la démonstration d'un autre mouvement que celui consulté.

DEUX RÈGLES D'APPARIEMENT, toutes deux vérifiables, jamais approximatives :

    1. le nom normalisé est identique  (casse, ponctuation et espaces retirés)
    2. le nom contient exactement les mêmes mots, dans un autre ordre
       'Arnold Press (Dumbbell)'  ==  'Arnold Dumbbell Press'

Tout exercice réclamé par deux modèles est rejeté des deux côtés : dans le doute, on
n'écrit rien. 86 appariements sur 435 modèles, zéro collision.

Le reste est PURGÉ. Un exercice hors de cet ensemble voit son `exercise_type`, sa
`video_url`, son `external_id` et ses muscles secondaires remis à zéro — relancer un
import ne corrige pas ce qui a déjà été écrit de travers, il ne touche que ce qu'il
apparie. La commande est donc idempotente : la relancer deux fois donne le même état.

Les 787 exercices restants n'ont aucun équivalent nommé chez Hevy, dont le catalogue
s'arrête à 435 entrées. Leur type viendra d'ailleurs — voir le ticket
`completer-exercise-type-dans-l-etl-2026-08-02`.

Usage :
    python manage.py import_hevy --dry-run   # rapport seul, aucune écriture
    python manage.py import_hevy
"""


import collections
import json
import re

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from liftapp.models import Exercise, MuscleGroup

HEVY_FILENAME = 'data/hevy.json'
DATAVID_FILENAME = 'data/data_vids.json'

# Reprise à l'identique de import_hevy.py : les deux commandes doivent produire les mêmes
# groupes musculaires, sinon la base dépendrait de celle qu'on a lancée en dernier.
MUSCLE_MAPPING = {
    'abdominals': 'CORE',
    'adductors': 'ADDUCTORS',
    'quadriceps': 'QUADS',
    'biceps': 'BICEPS',
    'shoulders': 'SHOULDERS',
    'chest': 'CHEST',
    'hamstrings': 'ISCHIOS',
    'lats': 'LATS',
    'calves': 'CALVES',
    'glutes': 'GLUTES',
    'triceps': 'TRICEPS',
    'forearms': 'FOREARMS',
    'traps': 'UPPER_BACK',
    'lower_back': 'LOWER_BACK',
    'upper_back': 'UPPER_BACK',
    'full_body': 'FULL_BODY',
    'abductors': 'ABDUCTORS',
}

# Les six formats déclarés par TRAINING_FORMAT_CHOICES. Hevy en utilise trois de plus
# (SHORT_DISTANCE_WEIGHT, STEPS_DURATION, FLOORS_DURATION) : Django ne vérifie pas
# `choices` au niveau base, un import naïf les y écrit sans erreur. On les refuse ici.
FORMATS_CONNUS = {
    'WEIGHT_REPS',
    'REPS_ONLY',
    'DURATION',
    'DISTANCE_DURATION',
    'BODYWEIGHT_WEIGHTED',
    'BODYWEIGHT_ASSISTED',
}


def normaliser(nom):
    """Minuscules, ponctuation retirée, espaces resserrés. 'Close-Grip' → 'close grip'."""
    return ' '.join(re.sub(r'[^a-z0-9 ]', ' ', nom.lower()).split())


def mots(nom):
    """Ensemble des mots du nom. Deux noms de mêmes mots désignent le même exercice."""
    return frozenset(normaliser(nom).split())


class Command(BaseCommand):
    help = "Importe types, vidéos et muscles secondaires depuis Hevy — appariements démontrables uniquement."

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help="Affiche le rapport sans rien écrire en base.",
        )

    def handle(self, *args, **options):
        simulation = options['dry_run']

        chemin_hevy = settings.BASE_DIR / HEVY_FILENAME
        chemin_vids = settings.BASE_DIR / DATAVID_FILENAME

        for chemin in (chemin_hevy, chemin_vids):
            if not chemin.exists():
                self.stdout.write(self.style.ERROR(f'Fichier introuvable : {chemin}'))
                return

        with open(chemin_hevy, encoding='utf-8') as f:
            modeles = json.load(f)['exercise_templates']
        with open(chemin_vids, encoding='utf-8') as f:
            videos = json.load(f)

        exercices = {e.name: e for e in Exercise.objects.all()}

        # Deux index de la base. Une même clé peut viser plusieurs exercices — ce cas est
        # traité comme une collision, donc rejeté.
        par_nom = collections.defaultdict(list)
        par_mots = collections.defaultdict(list)
        for nom in exercices:
            par_nom[normaliser(nom)].append(nom)
            par_mots[mots(nom)].append(nom)

        # Appariements candidats, avec la règle qui les a produits.
        candidats = []
        for modele in modeles:
            titre = modele['title']

            vises = par_nom.get(normaliser(titre)) or par_mots.get(mots(titre))
            if not vises or len(vises) > 1:
                continue

            candidats.append((modele, vises[0]))

        # Un exercice réclamé par deux modèles est écarté : c'est exactement le défaut
        # qu'on répare, et le résoudre par un « meilleur score » ferait rentrer de
        # l'approximation par la fenêtre.
        reclamations = collections.Counter(nom for _, nom in candidats)
        retenus = [(m, nom) for m, nom in candidats if reclamations[nom] == 1]
        ecartes_collision = len(candidats) - len(retenus)

        hors_format = [m for m, _ in retenus if m['type'].upper() not in FORMATS_CONNUS]
        surs = [(m, nom) for m, nom in retenus if m['type'].upper() in FORMATS_CONNUS]

        noms_surs = {nom for _, nom in surs}
        a_purger = [e for nom, e in exercices.items() if nom not in noms_surs]

        # Ce que la purge va réellement effacer — un exercice déjà vide n'est pas un dégât.
        purge_reelle = [
            e
            for e in a_purger
            if e.exercise_type or e.video_url or e.external_id or e.secondary_muscle_groups.exists()
        ]

        self.stdout.write(self.style.HTTP_INFO('=' * 60))
        self.stdout.write(f'  modèles Hevy                     {len(modeles)}')
        self.stdout.write(f'  exercices en base                {len(exercices)}')
        self.stdout.write(self.style.HTTP_INFO('-' * 60))
        self.stdout.write(f'  appariements démontrables        {len(candidats)}')
        self.stdout.write(f'  écartés pour collision           {ecartes_collision}')
        self.stdout.write(f'  écartés, format hors des choix   {len(hors_format)}')
        self.stdout.write(self.style.SUCCESS(f'  RETENUS, écrits                  {len(surs)}'))
        self.stdout.write(self.style.WARNING(f'  purgés de données douteuses      {len(purge_reelle)}'))
        self.stdout.write(self.style.HTTP_INFO('=' * 60))

        if hors_format:
            self.stdout.write('')
            self.stdout.write('Formats Hevy absents de TRAINING_FORMAT_CHOICES, non écrits :')
            for modele in hors_format:
                self.stdout.write(f"    {modele['type']:24} {modele['title']}")

        if simulation:
            self.stdout.write('')
            self.stdout.write(self.style.WARNING('--dry-run : aucune écriture.'))
            return

        with transaction.atomic():
            for exercice in purge_reelle:
                Exercise.objects.filter(pk=exercice.pk).update(
                    exercise_type='',
                    video_url=None,
                    external_id=None,
                )
                exercice.secondary_muscle_groups.clear()

            for modele, nom in surs:
                exercice = exercices[nom]

                Exercise.objects.filter(pk=exercice.pk).update(
                    exercise_type=modele['type'].upper(),
                    video_url=videos.get(modele['id']),
                    external_id=modele['id'],
                )

                cles = [
                    MUSCLE_MAPPING[m]
                    for m in modele['secondary_muscle_groups']
                    if m in MUSCLE_MAPPING
                ]
                groupes = [MuscleGroup.objects.get_or_create(name=c)[0] for c in cles]
                exercice.secondary_muscle_groups.set(groupes)

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('Base à jour. Seuls des appariements démontrables y figurent.'))
