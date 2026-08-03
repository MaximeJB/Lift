import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Hairline } from '../primitives/Hairline';

import { FilterChipsRow } from './FilterChipsRow';
import { ListItem } from './ListItem';
import { SearchInput } from './SearchInput';

const meta = {
  title: 'UI/FilterChipsRow',
  component: FilterChipsRow,
  args: { options: [], selection: [], onToggle: () => {} },
} satisfies Meta<typeof FilterChipsRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Les 18 valeurs de `MUSCLE_GROUP_CHOICES`, dans l'ordre du modèle Django. */
const GROUPES = [
  'CHEST',
  'BACK',
  'QUADS',
  'ISCHIOS',
  'GLUTES',
  'CALVES',
  'SHOULDERS',
  'BICEPS',
  'TRICEPS',
  'LOWER_BACK',
  'LATS',
  'UPPER_BACK',
  'REAR_SHOULDERS',
  'CORE',
  'FULL_BODY',
  'FOREARMS',
  'ADDUCTORS',
  'ABDUCTORS',
] as const;

/** Vrais exercices de la base, avec leur vrai groupe musculaire. */
const EXERCICES = [
  ['Ab Crunch Machine', 'CORE'],
  ['Arnold Dumbbell Press', 'SHOULDERS'],
  ['Alternate Incline Dumbbell Curl', 'BICEPS'],
] as const;

/**
 * DANS SON CONTEXTE, jamais isolée : le champ de recherche au-dessus, les résultats en
 * dessous. Une rangée de chips seule ne dit rien de ce qu'elle coûte en hauteur avant la
 * première ligne de liste.
 *
 * `CHEST` et `CORE` sont pré-sélectionnés pour que l'état actif soit visible d'emblée.
 */
export const EnSituation: Story = {
  render: function Render() {
    const [selection, setSelection] = useState<string[]>(['CHEST', 'CORE']);

    const basculer = (option: string) =>
      setSelection((s) => (s.includes(option) ? s.filter((o) => o !== option) : [...s, option]));

    return (
      <View className="gap-2">
        <SearchInput
          label="Rechercher un exercice"
          placeholder="Développé couché"
          onSearch={() => {}}
        />

        <FilterChipsRow options={GROUPES} selection={selection} onToggle={basculer} />

        <Hairline />
        {EXERCICES.map(([nom, groupe]) => (
          <View key={nom}>
            <ListItem title={nom} subtitle={groupe} onPress={() => {}} />
            <Hairline />
          </View>
        ))}
      </View>
    );
  },
};

/** Aucun filtre actif — l'état d'ouverture de l'écran. */
export const AucuneSelection: Story = {
  render: function Render() {
    const [selection, setSelection] = useState<string[]>([]);

    return (
      <FilterChipsRow
        options={GROUPES}
        selection={selection}
        onToggle={(option) =>
          setSelection((s) => (s.includes(option) ? s.filter((o) => o !== option) : [...s, option]))
        }
      />
    );
  },
};
