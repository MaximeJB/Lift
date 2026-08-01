import { View } from 'react-native';

import { Text } from '../primitives/Text';

export type BadgeProps = {
  children: string;
};

/**
 * Etiquette — CategoryBadge C3/C4, CompoundBadge C2, EquipmentTag C2.
 *
 * Aucune variante de couleur, y compris pour les 8 categories de CategoryBadge :
 * la contrainte systeme §12 interdit plus d'une couleur saturee par vue, et l'accent
 * est deja pris par l'action principale de chaque ecran. La categorie se lit dans le
 * texte, pas dans une pastille coloree.
 *
 * Filet et encre seulement — coherent avec la DNA « instrument », ou une etiquette
 * est une inscription, pas une gommette.
 */
export function Badge({ children }: BadgeProps) {
  return (
    <View className="self-start rounded-control border-hairline border-control-border px-2 py-1">
      <Text variant="label" color="support">
        {children}
      </Text>
    </View>
  );
}
