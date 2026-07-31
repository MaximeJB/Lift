import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { Hairline } from './Hairline';
import { Text } from './Text';

const meta = {
  title: 'Primitives/Hairline',
  component: Hairline,
} satisfies Meta<typeof Hairline>;

export default meta;
type Story = StoryObj<typeof meta>;

/** ListDivider C1 et C7 — le filet entre deux lignes de liste. */
export const Horizontal: Story = {
  render: () => (
    <View>
      <Text variant="body">Développé couché</Text>
      <View className="py-2">
        <Hairline />
      </View>
      <Text variant="body">Squat</Text>
      <View className="py-2">
        <Hairline />
      </View>
      <Text variant="body">Soulevé de terre</Text>
    </View>
  ),
};

/** Séparateurs du SegmentedControl C3/C7/C1. */
export const Vertical: Story = {
  render: () => (
    <View className="h-6 flex-row items-center">
      <Text variant="label">Séances</Text>
      <View className="px-3">
        <Hairline orientation="vertical" />
      </View>
      <Text variant="label">Historique</Text>
      <View className="px-3">
        <Hairline orientation="vertical" />
      </View>
      <Text variant="label">Exercices</Text>
    </View>
  ),
};
