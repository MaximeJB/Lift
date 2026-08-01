import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Text } from '../primitives/Text';

import { Checkbox } from './Checkbox';
import { ConfirmDialog } from './ConfirmDialog';
import { Input } from './Input';
import { SegmentedControl } from './SegmentedControl';
import { TextLink } from './TextLink';

const meta = { title: 'UI/Dialog' } satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const SEGMENTS = ['Séances', 'Historique', 'Exercices'] as const;

/** C3, C7, C1 — présentation par défaut, l'actif encadré de crochets. */
export const Segments: Story = {
  render: function Render() {
    const [value, setValue] = useState<(typeof SEGMENTS)[number]>('Séances');
    return <SegmentedControl segments={SEGMENTS} value={value} onChange={setValue} />;
  },
};

/**
 * Variante « relevé » — à utiliser quand ce menu est re-présenté à un utilisateur
 * qui vient de le voir, pour éviter l'impression qu'on lui resserre le même menu.
 */
export const SegmentsReleve: Story = {
  render: function Render() {
    const [value, setValue] = useState<(typeof SEGMENTS)[number]>('Historique');
    return (
      <SegmentedControl segments={SEGMENTS} value={value} onChange={setValue} variant="roster" />
    );
  },
};

/** Variante « bande » — retenue le 01/08/2026, conservée comme alternative. */
export const SegmentsBande: Story = {
  render: function Render() {
    const [value, setValue] = useState<(typeof SEGMENTS)[number]>('Séances');
    return <SegmentedControl segments={SEGMENTS} value={value} onChange={setValue} variant="bar" />;
  },
};

/** A3 §9 BR-4 — jamais pré-cochée, lien CGU en ligne dans le flux de texte. */
export const CaseCGU: Story = {
  render: function Render() {
    const [checked, setChecked] = useState(false);
    return (
      <Checkbox checked={checked} onToggle={setChecked}>
        <Text variant="body">
          J&apos;accepte les{' '}
          <Text variant="link" onPress={() => {}}>
            conditions d&apos;utilisation
          </Text>
        </Text>
      </Checkbox>
    );
  },
};

/** C6 §9 BR-4 — suppression de séance, cascade sur les séries. */
export const AnnulerSeance: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <View>
        <TextLink onPress={() => setOpen(true)}>Ouvrir</TextLink>
        <ConfirmDialog
          visible={open}
          title="annulation / séance"
          consequences={[
            ['séries loguées', '14'],
            ['exercices', '5'],
            ['durée écoulée', '01:12'],
          ]}
          confirmLabel="Annuler la séance"
          onConfirm={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </View>
    );
  },
};

/**
 * D1 §9 BR-3 — la suppression de compte exige la re-saisie du mot de passe.
 * L'énumération dit ce qui disparaît ; le mot de passe prouve qui le demande.
 */
export const SupprimerCompte: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <View>
        <TextLink onPress={() => setOpen(true)}>Ouvrir</TextLink>
        <ConfirmDialog
          visible={open}
          title="suppression / compte"
          consequences={[
            ['séances', '47'],
            ['séries', '892'],
            ['records', '12'],
            ['photos', '8'],
          ]}
          confirmLabel="Supprimer définitivement"
          onConfirm={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        >
          <Input label="Confirme avec ton mot de passe" secureTextEntry autoFocus />
        </ConfirmDialog>
      </View>
    );
  },
};
