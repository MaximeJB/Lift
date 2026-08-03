import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { Input } from './Input';
import { PasswordInput } from './PasswordInput';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { SearchInput } from './SearchInput';

const meta = {
  title: 'UI/Input',
  component: Input,
  args: { label: 'Adresse email' },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Les états d'A2 §8 : Default, Filled, Error — plus les deux spécialisés. */
export const Tous: Story = {
  render: (args) => (
    <View className="gap-3">
      <Input {...args} placeholder="maxime@lift.com" />
      <Input {...args} value="maxime@lift.com" />
      <Input {...args} value="maxime@" error="Format d'adresse invalide" />
      <PasswordInput label="Mot de passe" value="motdepasse" />
      <SearchInput label="Rechercher un exercice" placeholder="Développé couché" onSearch={() => {}} />
    </View>
  ),
};

export const Default: Story = { args: { placeholder: 'maxime@lift.com' } };
export const Rempli: Story = { args: { value: 'maxime@lift.com' } };

/** A2 §8 — l'erreur est inline sous le champ, jamais en bannière. */
export const Erreur: Story = { args: { value: 'maxime@', error: "Format d'adresse invalide" } };

/** A2/A3/A5/D1 — bascule œil avec accessibilityLabel dynamique. */
export const MotDePasse: Story = {
  render: () => <PasswordInput label="Mot de passe" value="motdepasse" />,
};

/** C1 — debounce 350ms, bouton effacer conditionnel. */
export const Recherche: Story = {
  render: () => <SearchInput label="Rechercher" onSearch={() => {}} />,
};

/**
 * A3 §7 — le barème sur trois mots de passe réels, du refusé au conforme.
 *
 * `lift` tient 2 critères (minuscule, sans triplé) et reste sous le plancher de 8
 * caractères d'A3 §9 BR-3. `Bench-Press-2026` les tient tous les huit.
 */
export const ForceMotDePasse: Story = {
  render: () => (
    <View className="gap-3">
      {['lift', 'benchpress', 'Bench-Press-2026'].map((mdp) => (
        <View key={mdp} className="gap-1">
          <PasswordInput label="Mot de passe" value={mdp} />
          <PasswordStrengthMeter password={mdp} />
        </View>
      ))}
    </View>
  ),
};
