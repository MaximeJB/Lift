import { View } from 'react-native';

import { Hairline } from '../primitives/Hairline';
import { Text } from '../primitives/Text';

export type SectionHeaderProps = {
  children: string;
};

/**
 * En-tete de groupe — MonthSectionHeader C7, en-tetes de section.
 *
 * Seul emploi de la voix `mono-accent` (Cutive Mono) : une etiquette isolee, jamais
 * une colonne ni un paragraphe. C'est la condition posee dans MAPPING.md §7.5.
 *
 * C7 §11 : accessibilityRole="header" pour que la navigation par en-tetes fonctionne.
 */
export function SectionHeader({ children }: SectionHeaderProps) {
  return (
    <View className="gap-1 bg-surface-page pb-1 pt-3">
      <Text variant="mono-accent" accessibilityRole="header">
        {children}
      </Text>
      <Hairline />
    </View>
  );
}
