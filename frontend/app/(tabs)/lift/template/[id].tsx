import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Text } from '../../../../src/shared/components/primitives/Text';
import { ScreenHeader } from '../../../../src/shared/components/ui/ScreenHeader';
import { TextLink } from '../../../../src/shared/components/ui/TextLink';

/**
 * C4 — Détail d'un template. SQUELETTE.
 *
 * La route existe pour que le tap de C3 ne mène pas dans le vide. `getTemplate(id)` est
 * prêt côté service, et les exercices arrivent déjà imbriqués dans la réponse — aucune
 * requête supplémentaire ne sera nécessaire pour construire cet écran.
 *
 * À noter avant de le construire : la base ne contient AUCUN template au 02/08/2026. Le
 * seeding des ~10 templates prédéfinis est posé par C3 §14 comme condition de livraison.
 */
export default function DetailTemplate() {
  const { id, nom } = useLocalSearchParams<{ id: string; nom?: string }>();

  return (
    <View className="flex-1 bg-surface-page p-4">
      <ScreenHeader
        title={nom ?? 'Template'}
        leading={<TextLink onPress={() => router.back()}>Retour</TextLink>}
        attributes={[['id', id]]}
      />

      <Text variant="body" color="support">
        Écran C4 — détail du template à construire.
      </Text>
    </View>
  );
}
