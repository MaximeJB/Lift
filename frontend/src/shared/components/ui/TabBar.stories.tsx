import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';

import { TabBarView } from './TabBar';

/**
 * C'est le VRAI composant de rendu qui est monté ici, pas une copie : `TabBarView` est
 * extrait de `TabBar` précisément pour rester inspectable sans navigateur.
 */
const meta = {
  title: 'UI/TabBar',
  component: TabBarView,
  args: { items: [] },
} satisfies Meta<typeof TabBarView>;

export default meta;
type Story = StoryObj<typeof meta>;

const LIBELLES = ['Accueil', 'Lift', 'Profil'];

export const Barre: Story = {
  render: function Render() {
    const [actif, setActif] = useState('Accueil');
    return (
      <TabBarView
        items={LIBELLES.map((label) => ({
          key: label,
          label,
          active: label === actif,
          onPress: () => setActif(label),
        }))}
      />
    );
  },
};
