import { Pressable, View } from 'react-native';

import { Text } from '../primitives/Text';

export type StatTileProps = {
  /** Intitule court — « Volume cette semaine », « Séances ». */
  label: string;
  /** Valeur deja formatee par l'appelant, unite comprise. */
  value: string;
  /** Variation vs periode precedente. B1 §9 BR-3 : ABSENTE si la semaine precedente vaut 0. */
  delta?: string;
  /** PRCard B1 est tappable (-> C2), StatCard ne l'est pas. */
  onPress?: () => void;
};

/**
 * Tuile statistique — StatCard et PRCard B1, blocs de StatSummaryBlock C6.
 *
 * La valeur est en `mono-display` (Martian Mono) : c'est le seul endroit ou sa largeur
 * est un atout plutot qu'une gene.
 *
 * B1 §11 : la valeur doit etre annoncee AVEC son unite. L'appelant formate donc
 * « 12 450 kg » et non « 12450 » — ce composant n'invente aucune unite, il ne saurait
 * pas laquelle.
 */
export function StatTile({ label, value, delta, onPress }: StatTileProps) {
  const content = (
    <View className="gap-1 py-2">
      <Text variant="label">{label}</Text>
      <Text variant="mono-display">{value}</Text>
      {delta ? (
        <Text variant="mono-meta" color="support">
          {delta}
        </Text>
      ) : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={delta ? `${label}, ${value}, ${delta}` : `${label}, ${value}`}
      className="active:opacity-70"
    >
      {content}
    </Pressable>
  );
}
