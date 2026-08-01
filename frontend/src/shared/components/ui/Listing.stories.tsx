import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { Hairline } from '../primitives/Hairline';

import { Badge } from './Badge';
import { ListItem } from './ListItem';
import { ScreenHeader } from './ScreenHeader';
import { SectionHeader } from './SectionHeader';
import { StatTile } from './StatTile';
import { TextLink } from './TextLink';

const meta = { title: 'UI/Listing' } satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** C1 — bibliothèque d'exercices. Le filet vient du parent, pas de la ligne. */
export const ListeExercices: Story = {
  render: () => (
    <View>
      <ListItem title="Développé couché" subtitle="Pectoraux" onPress={() => {}} />
      <Hairline />
      <ListItem title="Squat" subtitle="Quadriceps" onPress={() => {}} />
      <Hairline />
      <ListItem title="Soulevé de terre" subtitle="Dos" onPress={() => {}} />
    </View>
  ),
};

/**
 * C7 — historique groupé par mois.
 *
 * La première séance porte une BANDE PLEINE LARGEUR : écart assumé à la contrainte
 * « un seul accent saturé par vue », décidé le 01/08/2026 au profit du blocage de
 * couleur façon ACG.
 */
export const HistoriqueParMois: Story = {
  render: () => (
    <View>
      <SectionHeader>Juillet 2026</SectionHeader>
      <ListItem
        title="Push Day"
        banner="record"
        subtitle="2026-07-28 · 01:12"
        onPress={() => {}}
      />
      <Hairline />
      <ListItem title="Pull Day" subtitle="2026-07-26 · 00:58" onPress={() => {}} />
      <Hairline />
      <ListItem title="Leg Day" subtitle="2026-07-24 · 01:05" onPress={() => {}} />
    </View>
  ),
};

/** Le cas à surveiller : trois bandes dans le même mois annulent l'effet. */
export const HistoriqueTropDeBandes: Story = {
  render: () => (
    <View>
      <SectionHeader>Juillet 2026</SectionHeader>
      <ListItem title="Push Day" banner="record" subtitle="2026-07-28 · 01:12" onPress={() => {}} />
      <Hairline />
      <ListItem title="Pull Day" banner="record" subtitle="2026-07-26 · 00:58" onPress={() => {}} />
      <Hairline />
      <ListItem title="Leg Day" banner="record" subtitle="2026-07-24 · 01:05" onPress={() => {}} />
    </View>
  ),
};

/** B1 — StatCard n'est pas tappable, PRCard l'est (vers C2). */
export const Statistiques: Story = {
  render: () => (
    <View className="gap-3">
      <StatTile label="Volume cette semaine" value="12 450 kg" delta="+8 % vs semaine dernière" />
      <StatTile label="Séances cette semaine" value="4" />
      <StatTile label="Développé couché" value="142 kg" delta="1RM estimé" onPress={() => {}} />
    </View>
  ),
};

/** C4 — en-tête de template avec catégorie et durée. */
export const EnTeteEcran: Story = {
  render: () => (
    <ScreenHeader
      title="Push Day Strength"
      attributes={[
        ['catégorie', 'STRENGTH'],
        ['durée', '60 min'],
        ['exercices', '6'],
      ]}
      leading={<TextLink onPress={() => {}}>Retour</TextLink>}
    />
  ),
};

/** C2, C3, C4 — encre et filet, jamais de pastille colorée. */
export const Etiquettes: Story = {
  render: () => (
    <View className="flex-row gap-2">
      <Badge>Strength</Badge>
      <Badge>Composé</Badge>
      <Badge>Barre</Badge>
    </View>
  ),
};
