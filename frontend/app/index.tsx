import { Text, View } from 'react-native';

/**
 * Écran de vérification du thème fermé — temporaire, remplacé à l'étape 14 (A1/A2).
 *
 * Ce qui doit se voir :
 *   - fond papier chaud, jamais blanc
 *   - un bloc terre cuite de 44pt de haut, à angles vifs
 *   - le dernier bloc INVISIBLE : bg-red-500 n'existe plus dans le thème
 */
export default function Index() {
  return (
    <View className="flex-1 justify-center bg-surface-page p-4">
      <Text className="text-wordmark font-wordmark tracking-wordmark text-text-default">
        LIFT
      </Text>

      <Text className="mt-3 text-body font-body text-text-support">
        Thème fermé — vérification
      </Text>

      <View className="mt-4 min-h-touch justify-center rounded-control bg-action px-3">
        <Text className="text-button font-button uppercase tracking-button text-text-on-action">
          bg-action · min-h-touch
        </Text>
      </View>

      <View className="mt-3 border-hairline border-field-border bg-field-background p-3">
        <Text className="text-body text-text-placeholder">
          bg-field-background · border-field-border
        </Text>
      </View>

      {/* Ce bloc doit rester invisible : la palette Tailwind par défaut n'existe plus. */}
      <View className="mt-3 bg-red-500 p-3">
        <Text className="text-body text-text-default">
          bg-red-500 — aucun fond ne doit apparaître derrière ce texte
        </Text>
      </View>
    </View>
  );
}
