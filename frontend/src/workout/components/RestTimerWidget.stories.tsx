import type { Meta, StoryObj } from '@storybook/react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Hairline } from '../../shared/components/primitives/Hairline';
import { SectionHeader } from '../../shared/components/ui/SectionHeader';

import { RestTimerWidget, SECONDES_PAR_CELLULE } from './RestTimerWidget';
import { SetRow } from './SetRow';

const meta = {
  title: 'Workout/RestTimerWidget',
  component: RestTimerWidget,
  args: { restant: 90, total: 90, onAjuster: () => {}, onPasser: () => {} },
} satisfies Meta<typeof RestTimerWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

/** C5 §9 BR-4 : 90 secondes par défaut en séance libre. */
const REPOS_PAR_DEFAUT = 90;

/**
 * Le décompte tourne pour de vrai — un timer figé ne dit rien de ce qu'on veut juger : si
 * le pas d'une seconde saute désagréablement, et si le regard trouve le chiffre.
 *
 * Les boutons ajustent la durée VISÉE : une case s'ajoute ou disparaît à chaque tap.
 */
export const EnMarche: Story = {
  render: function Render() {
    const [restant, setRestant] = useState(REPOS_PAR_DEFAUT);
    const [total, setTotal] = useState(REPOS_PAR_DEFAUT);

    useEffect(() => {
      const battement = setInterval(() => setRestant((r) => (r > 0 ? r - 1 : 0)), 1000);
      return () => clearInterval(battement);
    }, []);

    const ajuster = (secondes: number) => {
      setRestant((r) => Math.max(0, r + secondes));
      setTotal((t) => Math.max(SECONDES_PAR_CELLULE, t + secondes));
    };

    return (
      <View className="gap-2">
        {/* Dans son contexte : la série qu'on vient de faire juste au-dessus, le bandeau
            en bas, sans rien recouvrir. */}
        <SectionHeader>Ab Crunch Machine</SectionHeader>
        <Hairline />
        <SetRow set={{ numero: 3, poidsKg: '80', reps: 8, rpe: 7 }} />
        <Hairline />

        <RestTimerWidget
          restant={restant}
          total={total}
          onAjuster={ajuster}
          onPasser={() => setRestant(0)}
        />
      </View>
    );
  },
};

/** Trois moments du repos, figés, pour comparer la lisibilité des cellules. */
export const Etapes: Story = {
  render: () => (
    <View className="gap-4">
      {[90, 45, 12].map((restant) => (
        <RestTimerWidget
          key={restant}
          restant={restant}
          total={REPOS_PAR_DEFAUT}
          onAjuster={() => {}}
          onPasser={() => {}}
        />
      ))}
    </View>
  ),
};
