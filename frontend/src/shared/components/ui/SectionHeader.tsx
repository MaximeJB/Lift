import { View } from 'react-native';

import { Hairline } from '../primitives/Hairline';
import { Text } from '../primitives/Text';

export type SectionHeaderProps = {
  children: string;
};

/**
 * En-tete de groupe — nom d'exercice C5 et C8, en-tetes de section D1,
 * MonthSectionHeader C7.
 *
 * VOIX GROTESQUE, PAS MONOSPACE — change le 02/08/2026. Le composant utilisait
 * `mono-accent`, soit Cutive Mono 13px : une frappe usee, illisible pour un titre qu'on
 * lit pendant l'effort. Le §06 de la Design-System-Specification assigne le sans aux
 * titres de structure et reserve le mono aux metadonnees et aux tableaux — l'emploi
 * precedent allait contre sa propre doctrine.
 *
 * Ni capitales ni tracking : « Alternate Incline Dumbbell Curl » se lit plus vite en
 * casse normale qu'en capitales espacees.
 *
 * C7 §11 : accessibilityRole="header" pour que la navigation par en-tetes fonctionne.
 */
export function SectionHeader({ children }: SectionHeaderProps) {
  return (
    <View className="gap-1 bg-surface-page pb-1 pt-3">
      <Text variant="section" accessibilityRole="header">
        {children}
      </Text>
      <Hairline />
    </View>
  );
}
