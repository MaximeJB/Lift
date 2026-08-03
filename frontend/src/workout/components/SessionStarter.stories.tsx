import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import type { WorkoutTemplate } from '../../shared/api';
import { Text } from '../../shared/components/primitives/Text';
import { SegmentedControl } from '../../shared/components/ui/SegmentedControl';

import { SessionStarterView, type SessionStarterPresentation } from './SessionStarter';

const meta = {
  title: 'Workout/SessionStarter',
  component: SessionStarterView,
  args: {
    templates: [],
    chargement: false,
    erreur: null,
    onRecharger: () => {},
    onSeanceLibre: () => {},
    onTemplate: () => {},
  },
} satisfies Meta<typeof SessionStarterView>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Aucun template n'existe en base au 03/08/2026 — c'est justement l'état qui a motivé cet
 * atelier. Ces trois-là servent à voir l'écran une fois le seeding fait : leurs catégories
 * sont les vraies valeurs de `TRAINING_TYPE_CHOICES`, leurs durées des valeurs plausibles.
 */
const TEMPLATES = [
  { nom: 'Full Body Débutant', categorie: 'FULL_BODY', duree: 45, exercices: 6 },
  { nom: 'Haut du corps — Force', categorie: 'STRENGTH', duree: 70, exercices: 5 },
  { nom: 'Push', categorie: 'PUSH_PULL_LEGS', duree: 60, exercices: 7 },
].map(
  (t, i) =>
    ({
      id: `t${i}`,
      name: t.nom,
      description: '',
      category: t.categorie,
      estimated_duration: t.duree,
      exercises: Array.from({ length: t.exercices }, () => ({}) as never),
      created_at: '',
      updated_at: '',
      synced_at: null,
    }) as unknown as WorkoutTemplate,
);

const SEGMENTS = ['Séances', 'Historique', 'Exercices'] as const;

/**
 * Chaque proposition est montrée DANS L'ÉCRAN, avec le SegmentedControl au-dessus : c'est
 * lui qui occupe le haut, et c'est par rapport à lui que le vide se juge.
 */
function Proposition({
  presentation,
  titre,
  templates,
}: {
  presentation: SessionStarterPresentation;
  titre: string;
  templates: readonly WorkoutTemplate[];
}) {
  const [segment, setSegment] = useState<(typeof SEGMENTS)[number]>('Séances');

  return (
    <View className="gap-2 pb-6">
      <Text variant="mono-accent" accessibilityRole="header">
        {titre}
      </Text>

      {/* PAS de hauteur fixe ici : `h-6` valait 48px et écrasait les trois propositions
          dans une fenêtre grande comme une ligne — elles paraissaient identiques. */}
      <View className="gap-4">
        <SegmentedControl segments={SEGMENTS} value={segment} onChange={setSegment} />
        <SessionStarterView
          templates={templates}
          chargement={false}
          erreur={null}
          onRecharger={() => {}}
          onSeanceLibre={() => {}}
          onTemplate={() => {}}
          presentation={presentation}
        />
      </View>
    </View>
  );
}

/**
 * LES TROIS PROPOSITIONS SUR L'ÉTAT RÉEL — zéro template.
 *
 * C'est l'état que tu as sous les yeux aujourd'hui, et celui qui a motivé l'atelier.
 */
export const TroisPropositionsSansTemplate: Story = {
  render: () => (
    <View>
      <Proposition presentation="etatVide" titre="A — l'état vide qui explique" templates={[]} />
      <Proposition presentation="centre" titre="B — le bloc centré" templates={[]} />
      <Proposition presentation="grand" titre="C — les cartes en Inter 18" templates={[]} />
    </View>
  ),
};

/**
 * LES MÊMES, une fois le seeding fait.
 *
 * À regarder de près : une proposition qui règle l'écran vide mais dégrade l'écran plein
 * règle un problème temporaire au prix d'un problème permanent.
 */
export const TroisPropositionsAvecTemplates: Story = {
  render: () => (
    <View>
      <Proposition
        presentation="etatVide"
        titre="A — l'état vide qui explique"
        templates={TEMPLATES}
      />
      <Proposition presentation="centre" titre="B — le bloc centré" templates={TEMPLATES} />
      <Proposition presentation="grand" titre="C — les cartes en Inter 18" templates={TEMPLATES} />
    </View>
  ),
};
