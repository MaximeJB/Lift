import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { Text } from './Text';

const meta = {
  title: 'Primitives/Text',
  component: Text,
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Les 6 variantes ensemble — c'est là qu'on juge l'échelle typographique. */
export const Echelle: Story = {
  render: () => (
    <View className="gap-3">
      <Text variant="wordmark">LIFT</Text>
      <Text variant="body">
        Développé couché avec haltères, prise neutre. Texte courant sur plusieurs lignes
        pour juger l&apos;interlignage.
      </Text>
      <Text variant="input">maxime@lift.com</Text>
      <Text variant="label">Adresse email</Text>
      <Text variant="link">Mot de passe oublié ?</Text>
      <Text variant="button">Se connecter</Text>
    </View>
  ),
};

/** SplashLogo A1, header logo A2 et A3. */
export const Wordmark: Story = { args: { variant: 'wordmark', children: 'LIFT' } };

/** DescriptionText C2, description template C4, noms de liste. */
export const Body: Story = {
  args: { variant: 'body', children: 'Développé couché avec haltères' },
};

/** Saisie A2/A3/A4/A5, SearchInput C1, SetInputForm C5. */
export const Input: Story = { args: { variant: 'input', children: 'maxime@lift.com' } };

/** Labels de champ A2/A3/D1, label StatCard B1 — voix machine. */
export const Label: Story = { args: { variant: 'label', children: 'Adresse email' } };

/** TextLink A2/A3, QuickLink B1 — voix lecture. */
export const Link: Story = { args: { variant: 'link', children: 'Mot de passe oublié ?' } };

/** Libellés de bouton — voix machine. */
export const Button: Story = { args: { variant: 'button', children: 'Se connecter' } };
