import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { Text, type TextVariant } from './Text';

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

/**
 * Bloc de données de séance, rendu avec un jeu de variantes donné.
 * Les trois propositions ci-dessous affichent EXACTEMENT le même contenu — seule
 * l'attribution des familles change, pour qu'on compare l'attribution et non le texte.
 */
function BlocSeance({
  entete,
  chiffre,
  series,
  meta,
}: {
  entete: TextVariant;
  chiffre: TextVariant;
  series: TextVariant;
  meta: TextVariant;
}) {
  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text variant="label">Volume cette semaine</Text>
        <Text variant={chiffre}>12 450 kg</Text>
      </View>

      <Text variant={entete}>Juillet 2026</Text>

      <View className="gap-1">
        <Text variant={series}>80,0 kg × 10 · RPE 8</Text>
        <Text variant={series}>120,5 kg × 8 · RPE 9</Text>
        <Text variant={series}>8,0 kg × 12 · RPE 7</Text>
      </View>

      <Text variant={meta}>2026-07-28 · 01:12:34</Text>
    </View>
  );
}

/**
 * PROPOSITION A — quatre timbres, attribués par corps de texte.
 * C'est ce que tu as décidé à l'atelier : Martian sur le chiffre, Spline sur les
 * colonnes, Sometype sur les métadonnées, Cutive sur l'en-tête.
 */
export const MonoA_QuatreTimbres: Story = {
  render: () => (
    <BlocSeance
      entete="mono-accent"
      chiffre="mono-display"
      series="mono-dense"
      meta="mono-meta"
    />
  ),
};

/**
 * PROPOSITION B — deux timbres seulement.
 * Martian pour le chiffre mis en avant, Spline pour tout le reste.
 * À comparer : est-ce que perdre Cutive et Sometype appauvrit vraiment ?
 */
export const MonoB_DeuxTimbres: Story = {
  render: () => (
    <BlocSeance entete="mono-dense" chiffre="mono-display" series="mono-dense" meta="mono-dense" />
  ),
};

/**
 * PROPOSITION C — Martian Mono partout.
 * Le cas où « principal » se prend au pied de la lettre.
 * À comparer : est-ce que sa largeur tient sur les colonnes de séries ?
 */
export const MonoC_MartianPartout: Story = {
  render: () => (
    <BlocSeance
      entete="mono-display"
      chiffre="mono-display"
      series="mono-display"
      meta="mono-display"
    />
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
