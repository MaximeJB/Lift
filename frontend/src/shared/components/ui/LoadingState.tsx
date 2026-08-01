import { View } from 'react-native';

import { Hairline } from '../primitives/Hairline';

export type LoadingStateProps = {
  /** Nombre de lignes fantomes. Caler sur ce que l'ecran affichera vraiment. */
  rows?: number;
};

/**
 * Squelette de chargement — B1, C1, C3, C7, D1.
 *
 * Montre la FORME du contenu a venir plutot qu'un signal abstrait : l'utilisateur sait
 * ce qui arrive avant que ca arrive, et la page ne saute pas quand les donnees se
 * substituent aux blocs.
 *
 * Les blocs reprennent la geometrie de ListItem — un pave de titre, un pave de
 * sous-titre, separes par un filet. Caler `rows` sur le nombre d'elements attendus.
 *
 * Annonce comme un seul element au lecteur d'ecran : trois lignes fantomes n'ont pas a
 * etre parcourues une par une.
 *
 * Score anti-slop 0 — voir SLOP.md. Retenu le 01/08/2026 en remplacement d'un spinner
 * natif centre.
 */
export function LoadingState({ rows = 3 }: LoadingStateProps) {
  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Chargement">
      {Array.from({ length: rows }, (_, i) => (
        <View key={i}>
          {i > 0 ? <Hairline /> : null}
          <View className="min-h-touch justify-center gap-2 py-2">
            <View className="h-2 w-6 bg-divider" />
            <View className="h-1 w-5 bg-divider" />
          </View>
        </View>
      ))}
    </View>
  );
}
