import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { Text } from '../src/shared/components/primitives/Text';
import { ScreenHeader } from '../src/shared/components/ui/ScreenHeader';
import { TextLink } from '../src/shared/components/ui/TextLink';

/**
 * Conditions générales d'utilisation — annexe de la spec d'interface.
 *
 * Structure et navigation FROZEN, contenu textuel explicitement hors périmètre : c'est
 * un livrable juridique, à faire relire par une personne qualifiée.
 *
 * La route existe malgré l'absence de contenu parce qu'A3 §11 exige que les deux liens
 * soient atteignables indépendamment, au clavier comme au lecteur d'écran — ce qu'un
 * lien inerte n'est pas. L'écran dit ce qu'il ne contient pas plutôt que de simuler un
 * texte qui n'a jamais été écrit.
 *
 * PLACÉ À LA RACINE, hors de `(auth)` et de `(tabs)` : décision du 02/08/2026, les CGU
 * doivent rester consultables depuis le menu Paramètres une fois connecté. Voir la
 * déclaration hors garde dans `app/_layout.tsx`.
 */
export default function ConditionsGenerales() {
  return (
    <View className="flex-1 bg-surface-page p-4">
      <ScreenHeader
        title="Conditions générales d'utilisation"
        leading={<TextLink onPress={() => router.back()}>Retour</TextLink>}
      />

      <ScrollView contentContainerClassName="gap-3 pt-2">
        <Text variant="body" color="support">
          Contenu à rédiger. Aucune version n&apos;existe aujourd&apos;hui dans le projet.
        </Text>
        <Text variant="body" color="support">
          Cet écran est en place pour que le lien de la case de consentement soit
          réellement atteignable. Le texte définitif doit être rédigé et relu avant toute
          mise en production.
        </Text>
      </ScrollView>
    </View>
  );
}
