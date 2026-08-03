import { useEffect, useState } from 'react';
import { Keyboard, Pressable, View } from 'react-native';

import { Button } from '../../shared/components/primitives/Button';
import { Text } from '../../shared/components/primitives/Text';
import { Checkbox } from '../../shared/components/ui/Checkbox';
import { Input } from '../../shared/components/ui/Input';
import { TextLink } from '../../shared/components/ui/TextLink';

/**
 * Vrai tant que le clavier est à l'écran.
 *
 * POURQUOI PAS `InputAccessoryView`. C'est le composant prévu pour ça sur iOS, et il a été
 * essayé deux fois le 03/08/2026 sans jamais rien afficher. Ce projet tourne sur la
 * nouvelle architecture de React Native (`newArchEnabled: true` dans app.json), où ce
 * composant natif ne rend rien — silencieusement, sans erreur ni avertissement.
 *
 * Deux écouteurs et un lien font le même travail, en JavaScript pur, sur les deux
 * plateformes et les deux architectures.
 *
 * LE PROBLÈME QU'ILS RÈGLENT : un clavier numérique n'a pas de touche Retour sur iPhone.
 * Une fois le poids saisi, plus rien ne le referme, et il mange 30% de l'écran.
 */
function useClavierOuvert() {
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    const montre = Keyboard.addListener('keyboardDidShow', () => setOuvert(true));
    const cache = Keyboard.addListener('keyboardDidHide', () => setOuvert(false));

    return () => {
      montre.remove();
      cache.remove();
    };
  }, []);

  return ouvert;
}

/**
 * Champs à afficher pour un type d'exercice — C5 §7.
 *
 * LE `default` N'EST PAS UN OUBLI. Mesuré le 02/08/2026 : 653 exercices sur 873 ont un
 * `exercise_type` VIDE, et quatre portent des valeurs absentes de `TRAINING_FORMAT_CHOICES`
 * (`SHORT_DISTANCE_WEIGHT`, `STEPS_DURATION`, `FLOORS_DURATION`). C5 §9 BR-1 exige un
 * formulaire strictement dérivé du type et n'envisage pas ce cas.
 *
 * Le repli sur poids + répétitions couvre trois exercices sur quatre. Il disparaîtra quand
 * le pipeline ETL renseignera le champ — ticket `completer-exercise-type-etl-2026-08-02`.
 */
export type SpecChamps = {
  /** Libellé du champ de charge, ou `null` s'il n'y en a pas. */
  poidsLabel: string | null;
  reps: boolean;
  duree: boolean;
  /** C5 §7 : pour DISTANCE_DURATION, les notes portent la distance. Repli assumé. */
  notesLabel: string | null;
  /** C5 §7 : RPE indisponible sur les formats en durée. */
  rpe: boolean;
};

export function champsPour(exerciseType: string): SpecChamps {
  switch (exerciseType) {
    case 'BODYWEIGHT_WEIGHTED':
      return { poidsLabel: 'Charge additionnelle', reps: true, duree: false, notesLabel: null, rpe: true };
    case 'BODYWEIGHT_ASSISTED':
      return { poidsLabel: 'Assistance', reps: true, duree: false, notesLabel: null, rpe: true };
    case 'REPS_ONLY':
      return { poidsLabel: null, reps: true, duree: false, notesLabel: null, rpe: true };
    case 'DURATION':
      return { poidsLabel: null, reps: false, duree: true, notesLabel: null, rpe: false };
    case 'DISTANCE_DURATION':
      return { poidsLabel: null, reps: false, duree: true, notesLabel: 'Distance', rpe: false };
    case 'WEIGHT_REPS':
    default:
      return { poidsLabel: 'Poids', reps: true, duree: false, notesLabel: null, rpe: true };
  }
}

/** Ce qu'une validation produit. L'écran décide ensuite quoi en faire. */
export type SaisieSerie = {
  poidsKg: string | null;
  reps: number | null;
  dureeSecondes: number | null;
  rpe: number | null;
  notes: string;
  is_warmup: boolean;
  is_failure: boolean;
};

export type SetInputFormProps = {
  exerciseType: string;
  /** Résout quand la série est partie. Une erreur laisse les valeurs en place. */
  onValider: (saisie: SaisieSerie) => Promise<void>;
};

/**
 * `mm:ss` ou un nombre de secondes. Renvoie `null` si la saisie n'est pas lisible.
 *
 * Les deux formes sont acceptées parce que les deux se tapent : `45` pour trois quarts de
 * minute de gainage, `1:30` pour une minute et demie de vélo.
 */
function enSecondes(saisie: string): number | null {
  const texte = saisie.trim();
  if (!texte) return null;

  if (texte.includes(':')) {
    const [m, s] = texte.split(':');
    const minutes = Number(m);
    const secondes = Number(s);
    if (!Number.isFinite(minutes) || !Number.isFinite(secondes)) return null;
    return minutes * 60 + secondes;
  }

  const n = Number(texte);
  return Number.isFinite(n) ? n : null;
}

/**
 * Sélecteur de RPE — 1 à 10, sélection unique, re-tap pour effacer.
 *
 * Reprend l'inversion figure/fond retenue le 02/08 pour `FilterChipsRow` : dans tout le
 * produit, une valeur choisie s'affiche en aplat d'encre. Un second signe pour dire la
 * même chose diviserait le vocabulaire.
 */
function SelecteurRpe({
  valeur,
  onChange,
}: {
  valeur: number | null;
  onChange: (n: number | null) => void;
}) {
  return (
    <View className="flex-row flex-wrap items-center gap-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
        const choisi = valeur === n;
        return (
          <Pressable
            key={n}
            onPress={() => onChange(choisi ? null : n)}
            accessibilityRole="button"
            accessibilityState={{ selected: choisi }}
            accessibilityLabel={`RPE ${n}`}
            hitSlop={10}
            className={`min-w-4 items-center border-hairline px-1 py-1 active:opacity-70 ${
              choisi ? 'border-text-default bg-text-default' : 'border-control-border'
            }`}
          >
            <Text variant="mono-dense" color={choisi ? 'on-ink' : 'support'}>
              {n}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Formulaire d'ajout d'une série — SetInputForm C5.
 *
 * Retenu le 02/08/2026 parmi trois propositions : chaque champ porte son libellé au-dessus,
 * le RPE est un sélecteur, la validation un bouton pleine largeur. Les deux écartées
 * glissaient les champs dans les colonnes du tableau des séries, et sur une seule ligne où
 * l'unité tenait lieu de libellé.
 *
 * Le motif du choix est la lisibilité, et il a une conséquence : ce parti pris est le plus
 * coûteux en hauteur des trois. Sur C5 il cohabitera avec le bandeau de repos — C5 §13 :
 * « RestTimerWidget sticky ne masque jamais le formulaire actif ».
 *
 * C5 §9 BR-2 : poids > 0 et reps ≥ 1 sont validés côté client, avant tout appel réseau. Le
 * modèle Django n'a aucun validateur sur ces champs.
 * C5 §16 : jamais de formulaire poids+reps sur un exercice en durée. C'est `champsPour` qui
 * le garantit, pas cette mise en page.
 *
 * Score anti-slop 1 — critère A2, les champs côte à côte sont parfaitement symétriques.
 * Voir SLOP.md.
 */
export function SetInputForm({ exerciseType, onValider }: SetInputFormProps) {
  const champs = champsPour(exerciseType);

  const clavierOuvert = useClavierOuvert();
  /** Le lien n'apparaît que sous le formulaire réellement en cours de saisie. */
  const [saisieEnCours, setSaisieEnCours] = useState(false);

  const [poids, setPoids] = useState('');
  const [reps, setReps] = useState('');
  const [dureeSaisie, setDureeSaisie] = useState('');
  const [notes, setNotes] = useState('');
  const [rpe, setRpe] = useState<number | null>(null);
  const [echauffement, setEchauffement] = useState(false);
  const [enCours, setEnCours] = useState(false);

  const secondes = enSecondes(dureeSaisie);

  const valide =
    (!champs.poidsLabel || Number(poids) > 0) &&
    (!champs.reps || Number(reps) >= 1) &&
    (!champs.duree || (secondes !== null && secondes > 0));

  /**
   * `echec` vient de l'appui long — C5 §7 : « toggle secondaire discret, accessible via
   * une option secondaire (appui long) ».
   *
   * LES VALEURS RESTENT APRÈS UNE VALIDATION RÉUSSIE. Une série suit presque toujours la
   * précédente au même poids : les remettre à zéro obligerait à retaper 80 et 8 quinze
   * fois par séance. Seuls le RPE et l'échauffement repartent — ils changent d'une série
   * à l'autre, et laisser « échauffement » coché ferait basculer les séries de travail.
   */
  const valider = async (echec: boolean) => {
    if (enCours || !valide) return;

    setEnCours(true);
    try {
      await onValider({
        poidsKg: champs.poidsLabel ? poids.trim() : null,
        reps: champs.reps ? Number(reps) : null,
        dureeSecondes: champs.duree ? secondes : null,
        rpe: champs.rpe ? rpe : null,
        notes: notes.trim(),
        is_warmup: echauffement,
        is_failure: echec,
      });

      setRpe(null);
      setEchauffement(false);
      setNotes('');
    } finally {
      setEnCours(false);
    }
  };

  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        {champs.duree ? (
          <View className="flex-1">
            <Input
              label="Durée"
              value={dureeSaisie}
              onChangeText={setDureeSaisie}
              placeholder="mm:ss"
              onFocus={() => setSaisieEnCours(true)}
              onBlur={() => setSaisieEnCours(false)}
            />
          </View>
        ) : null}

        {champs.poidsLabel ? (
          <View className="flex-1">
            <Input
              label={champs.poidsLabel}
              value={poids}
              onChangeText={setPoids}
              keyboardType="decimal-pad"
              placeholder="kg"
              onFocus={() => setSaisieEnCours(true)}
              onBlur={() => setSaisieEnCours(false)}
            />
          </View>
        ) : null}

        {champs.reps ? (
          <View className="flex-1">
            <Input
              label="Répétitions"
              value={reps}
              onChangeText={setReps}
              keyboardType="number-pad"
              onFocus={() => setSaisieEnCours(true)}
              onBlur={() => setSaisieEnCours(false)}
            />
          </View>
        ) : null}
      </View>

      {champs.notesLabel ? (
        <Input label={champs.notesLabel} value={notes} onChangeText={setNotes} />
      ) : null}

      {champs.rpe ? (
        <View className="gap-1">
          <Text variant="label">RPE</Text>
          <SelecteurRpe valeur={rpe} onChange={setRpe} />
        </View>
      ) : null}

      <Checkbox checked={echauffement} onToggle={setEchauffement}>
        <Text variant="body">Série d&apos;échauffement</Text>
      </Checkbox>

      {clavierOuvert && saisieEnCours ? (
        <View className="items-end">
          <TextLink onPress={() => Keyboard.dismiss()}>Fermer le clavier</TextLink>
        </View>
      ) : null}

      <Button
        onPress={() => void valider(false)}
        // C5 §7 : l'échec musculaire est une option SECONDAIRE, atteinte par appui long.
        // L'intention est de ne pas encombrer un écran utilisé en pleine série.
        // Contrepartie : un geste caché n'est pas découvrable — d'où l'indice, qui est
        // aussi ce qu'annonce le lecteur d'écran.
        onLongPress={() => void valider(true)}
        accessibilityHint="Appui long pour enregistrer la série comme menée à l'échec"
        loading={enCours}
        disabled={!valide}
      >
        + Ajouter une série
      </Button>
    </View>
  );
}
