import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { Text } from '../src/shared/components/primitives/Text';
import { ScreenHeader } from '../src/shared/components/ui/ScreenHeader';
import { TextLink } from '../src/shared/components/ui/TextLink';

/**
 * Politique de confidentialité — annexe de la spec d'interface.
 *
 * Même statut que les CGU : structure FROZEN, contenu hors périmètre. L'annexe donne la
 * trame à couvrir — identité du responsable de traitement, données collectées,
 * finalités, durée de conservation, droits RGPD renvoyant vers D1. Elle est reproduite
 * ici pour que la rédaction n'ait pas à rouvrir la spec.
 *
 * PLACÉE À LA RACINE pour la même raison que les CGU — décision du 02/08/2026. Le lien
 * RGPD de D1 pointera sur cette route, pas sur une copie.
 */
export default function Confidentialite() {
  return (
    <View className="flex-1 bg-surface-page p-4">
      <ScreenHeader
        title="Politique de confidentialité"
        leading={<TextLink onPress={() => router.back()}>Retour</TextLink>}
      />

      <ScrollView contentContainerClassName="gap-3 pt-2">
        <Text variant="body" color="support">
          Contenu à rédiger. Aucune version n&apos;existe aujourd&apos;hui dans le projet.
        </Text>
        <Text variant="body" color="support">
          Sections à couvrir : responsable du traitement, données collectées, finalités,
          durée de conservation, droits RGPD et leur exercice depuis l&apos;écran Profil.
        </Text>
      </ScrollView>
    </View>
  );
}
