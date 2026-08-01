import { View } from 'react-native';

import { Button } from '../src/shared/components/primitives/Button';
import { Hairline } from '../src/shared/components/primitives/Hairline';
import { Text } from '../src/shared/components/primitives/Text';
import { ListItem } from '../src/shared/components/ui/ListItem';

/**
 * Écran de contrôle du système — temporaire, remplacé à l'étape 14 par A1/A2.
 *
 * Il ne compose que des composants du catalogue : aucun `<Text>` de React Native,
 * aucune classe hors thème, aucun `style`. C'est aussi ce que vérifient
 * `npm run lint` et `npm run check:classes`.
 */
export default function Index() {
  return (
    <View className="flex-1 justify-center bg-surface-page p-4">
      <Text variant="wordmark">LIFT</Text>

      <View className="py-3">
        <Hairline />
      </View>

      <Text variant="mono-meta" color="support">
        VOL / S30 / KG
      </Text>
      <Text variant="mono-display">12 450</Text>

      <View className="py-3">
        <Hairline />
      </View>

      <ListItem
        title="Push Day"
        banner="record"
        subtitle="2026-07-28 · 01:12"
        onPress={() => {}}
      />

      <View className="pt-4">
        <Button onPress={() => {}}>Démarrer une séance</Button>
      </View>
    </View>
  );
}
