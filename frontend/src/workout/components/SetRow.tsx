import { View } from 'react-native';

import { Text } from '../../shared/components/primitives/Text';

export type LoggedSet = {
  /** C5 §9 BR-3 : auto-incrémenté par le client, par exercice. Jamais saisi. */
  numero: number;
  /** Chaîne : DRF sérialise les DecimalField ainsi. `null` si l'exercice n'en porte pas. */
  poidsKg?: string | null;
  reps?: number | null;
  dureeSecondes?: number | null;
  rpe?: number | null;
  is_warmup?: boolean;
  is_failure?: boolean;
  /**
   * C5 §9 : état « Pending sync ». La série est à l'écran mais le serveur ne l'a pas
   * encore acceptée — écriture optimiste de §14.
   */
  enAttente?: boolean;
  /**
   * Cette série bat le meilleur 1RM estimé connu sur cet exercice.
   *
   * Signalé PENDANT la séance et non seulement en C6 — demandé le 03/08/2026 : apprendre
   * qu'on a battu un record une fois rentré chez soi n'a pas le même effet qu'à la
   * seconde où la barre est reposée.
   */
  record?: boolean;
};

/** `45` → `0:45`, `90` → `1:30`. */
export function duree(secondes: number): string {
  const m = Math.floor(secondes / 60);
  return `${m}:${String(secondes % 60).padStart(2, '0')}`;
}

/**
 * LES DEUX ÉTATS NE SONT PORTÉS PAR AUCUNE COULEUR.
 *
 * L'accent est déjà pris sur C5 par le bouton de validation, et la contrainte §12 interdit
 * une seconde teinte saturée dans la même vue. Le critère B2 du barème pénalise par
 * ailleurs de 2 une hiérarchie chromatique là où autre chose pouvait la porter : ici,
 * c'est un code en voix machine, dans le registre « IDs, coordinates, versions » du §01.
 */
function marque(set: LoggedSet): string | null {
  if (set.is_failure) return 'ÉCHEC';
  if (set.is_warmup) return 'ÉCH';
  return null;
}

/** Poids et répétitions, ou durée. Jamais les deux : le type d'exercice tranche. */
function valeurs(set: LoggedSet): string {
  if (set.dureeSecondes != null) return duree(set.dureeSecondes);
  if (set.poidsKg != null && set.reps != null) return `${set.poidsKg} kg × ${set.reps}`;
  if (set.reps != null) return `${set.reps} reps`;
  return '—';
}

/**
 * Série déjà enregistrée — SetRow C5 et C8.
 *
 * Retenu le 02/08/2026 parmi trois propositions montées côte à côte dans Storybook sur une
 * vraie séance de développé couché. Les deux écartées mettaient les séries en colonnes de
 * tableau, et en relevé de terminal préfixé.
 *
 * La voix est imposée : `type.mono-dense` (Spline Sans Mono) est attribuée à ce composant
 * dans MAPPING.md §7.5, « resserrée, encaisse les colonnes serrées où Martian déborderait ».
 *
 * Le numéro et les codes d'état sont en `mono-meta`, plus discrets : ce sont des
 * métadonnées de la série, pas la série elle-même.
 *
 * Score anti-slop 0 — voir SLOP.md.
 */
export function SetRow({ set }: { set: LoggedSet }) {
  const code = marque(set);

  return (
    <View className="min-h-touch flex-row items-center gap-3">
      <Text variant="mono-meta" color="support">
        {set.numero}
      </Text>

      <Text variant="mono-dense" className="flex-1">
        {valeurs(set)}
      </Text>

      {set.rpe != null ? (
        <Text variant="mono-dense" color="support">
          {`RPE ${set.rpe}`}
        </Text>
      ) : null}

      {/* Voix `mono-accent` — la seule frappe distincte du système, réservée aux
          étiquettes ponctuelles (MAPPING §7.5). Un record est exactement ça : rare, et il
          doit sauter aux yeux sans qu'aucune couleur ne s'en mêle. */}
      {set.record ? <Text variant="mono-accent">record</Text> : null}

      {code ? (
        <Text variant="mono-meta" color="support">
          {code}
        </Text>
      ) : null}

      {/* Même mécanique que ÉCH et ÉCHEC : un code en voix machine, aucune couleur. En
          `placeholder` plutôt qu'en `support` — c'est un état technique passager, pas une
          caractéristique de la série. */}
      {set.enAttente ? (
        <Text variant="mono-meta" color="placeholder">
          NON SYNC
        </Text>
      ) : null}
    </View>
  );
}
