import { router } from 'expo-router';
import { View } from 'react-native';

import { Text } from '../../src/shared/components/primitives/Text';
import { TextLink } from '../../src/shared/components/ui/TextLink';

/**
 * A4 — Mot de passe oublié. SQUELETTE.
 *
 * Bloqué côté backend, pas côté écran : POST /api/auth/password-reset/request/ n'existe
 * pas, et aucun service d'envoi d'email n'est configuré. Les deux sont listés comme
 * « nouvelle infrastructure » en Phase 5 de la spec.
 */
export default function ForgotPassword() {
  return (
    <View className="flex-1 justify-center bg-surface-page p-4">
      <Text variant="wordmark">LIFT</Text>
      <View className="pt-4">
        <Text variant="body" color="support">
          Écran A4 — en attente de l&apos;endpoint de réinitialisation et d&apos;un service
          d&apos;envoi d&apos;email.
        </Text>
      </View>
      <TextLink onPress={() => router.back()}>Retour</TextLink>
    </View>
  );
}
