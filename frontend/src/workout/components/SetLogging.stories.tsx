import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { Hairline } from '../../shared/components/primitives/Hairline';
import { Text } from '../../shared/components/primitives/Text';
import { SectionHeader } from '../../shared/components/ui/SectionHeader';

import { SetInputForm } from './SetInputForm';
import { SetRow, type LoggedSet } from './SetRow';

const meta = {
  title: 'Workout/SetLogging',
  component: SetRow,
  args: { set: { numero: 1 } },
} satisfies Meta<typeof SetRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Une vraie séance : deux séries d'échauffement, trois de travail, la dernière à l'échec.
 * Aucune valeur n'est inventée — le barème pénalise les données factices (critère A8).
 */
const SERIES: LoggedSet[] = [
  { numero: 1, poidsKg: '40', reps: 12, is_warmup: true },
  { numero: 2, poidsKg: '60', reps: 8, is_warmup: true },
  { numero: 3, poidsKg: '80', reps: 8, rpe: 7 },
  { numero: 4, poidsKg: '80', reps: 7, rpe: 8 },
  { numero: 5, poidsKg: '80', reps: 5, rpe: 10, is_failure: true },
];

const SERIES_DUREE: LoggedSet[] = [
  { numero: 1, dureeSecondes: 45 },
  { numero: 2, dureeSecondes: 60 },
];

function Section({
  nom,
  groupe,
  type,
  series,
}: {
  nom: string;
  groupe: string;
  type: string;
  series: LoggedSet[];
}) {
  return (
    <View className="gap-2 pb-6">
      <SectionHeader>{nom}</SectionHeader>
      <Text variant="mono-meta" color="support">
        {groupe}
      </Text>

      <Hairline />
      {series.map((serie) => (
        <View key={serie.numero}>
          <SetRow set={serie} />
          <Hairline />
        </View>
      ))}

      <View className="pt-2">
        {/* Le catalogue ne parle à aucun serveur : la validation ne fait rien ici. */}
        <SetInputForm exerciseType={type} onValider={async () => {}} />
      </View>
    </View>
  );
}

/**
 * La proposition retenue le 02/08/2026, sur un exercice réel de la base.
 *
 * Le nom de l'exercice est en `type.section` depuis le même jour : Cutive Mono 13px était
 * illisible pour un titre qu'on lit pendant l'effort.
 */
export const SerieEtSaisie: Story = {
  render: () => (
    <Section nom="Ab Crunch Machine" groupe="CORE" type="WEIGHT_REPS" series={SERIES} />
  ),
};

/**
 * C5 §16 : « ne jamais afficher un formulaire poids+reps pour un exercice DURATION ».
 * `Air Bike` est un exercice réel de la base, de type `DURATION` : ni poids, ni
 * répétitions, ni RPE.
 */
export const FormatDuree: Story = {
  render: () => (
    <Section nom="Air Bike" groupe="CORE" type="DURATION" series={SERIES_DUREE} />
  ),
};

/**
 * Les trois libellés que la spec impose pour la MÊME paire de champs — C5 §7. Poids,
 * charge additionnelle, assistance : trois gestes différents, trois mots différents.
 */
export const LibellesParType: Story = {
  render: () => (
    <View className="gap-5">
      {[
        ['WEIGHT_REPS', 'Développé couché — Poids'],
        ['BODYWEIGHT_WEIGHTED', 'Traction lestée — Charge additionnelle'],
        ['BODYWEIGHT_ASSISTED', 'Traction assistée — Assistance'],
        ['REPS_ONLY', 'Pompes — Répétitions seules'],
      ].map(([type, titre]) => (
        <View key={type} className="gap-2">
          <Text variant="mono-meta" color="support">
            {titre}
          </Text>
          <SetInputForm exerciseType={type} onValider={async () => {}} />
        </View>
      ))}
    </View>
  ),
};
