import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { Button } from './Button';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  args: { onPress: () => {}, children: 'Se connecter' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Les 3 variantes et les 2 états, ensemble — vue de contrôle. */
export const Toutes: Story = {
  render: (args) => (
    <View className="gap-3">
      <Button {...args} variant="primary">
        Se connecter
      </Button>
      <Button {...args} variant="secondary">
        Déconnexion
      </Button>
      <Button {...args} variant="destructive">
        Annuler la séance
      </Button>
      <Button {...args} variant="primary" loading>
        Se connecter
      </Button>
      <Button {...args} variant="primary" disabled>
        Se connecter
      </Button>
    </View>
  ),
};

/** PrimaryButton A2/A3/A4/A5/C6, PrimaryCTAButton B1, StickyCTAButton C4. */
export const Primary: Story = { args: { variant: 'primary', children: 'Se connecter' } };

/** LogoutButton D1 — séparé visuellement des actions destructives. */
export const Secondary: Story = { args: { variant: 'secondary', children: 'Déconnexion' } };

/** DestructiveTextButton C6/C8, DeleteAccountAction D1. */
export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Annuler la séance' },
};

/** A2 §8 — spinner inline, double soumission impossible. */
export const Loading: Story = {
  args: { variant: 'primary', children: 'Se connecter', loading: true },
};

/** A2 §9 BR-1 — désactivé tant que le formulaire n'est pas valide. */
export const Disabled: Story = {
  args: { variant: 'primary', children: 'Se connecter', disabled: true },
};
