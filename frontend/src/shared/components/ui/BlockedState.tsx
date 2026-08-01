import { View } from 'react-native';

import { Button } from '../primitives/Button';
import { Text } from '../primitives/Text';

export type BlockedStateProps = {
  title: string;
  description?: string;
  /** A5 §6 : « Redemander un lien » → A4. Une SORTIE, pas une suggestion. */
  actionLabel: string;
  onAction: () => void;
};

/**
 * Blocage qui remplace l'ecran — InvalidTokenState A5.
 *
 * Barre de repere en ALERTE. Troisieme registre, distinct des deux autres :
 *   EmptyState    barre neutre  — « il n'y a rien ici »
 *   SuccessState  barre accent  — « c'est fait »
 *   BlockedState  barre alerte  — « tu ne peux pas continuer, voici la sortie »
 *
 * L'action est OBLIGATOIRE ici, contrairement aux deux autres : A5 §7 precise que cet
 * etat remplace tout l'ecran, et qu'aucun bouton retour classique n'existe. Sans
 * sortie explicite, l'utilisateur arrive depuis son email et se retrouve piege.
 *
 * A5 §9 BR-1 : le token est verifie DES L'ARRIVEE, pas a la soumission — cet etat
 * s'affiche donc avant tout formulaire, jamais apres.
 */
export function BlockedState({ title, description, actionLabel, onAction }: BlockedStateProps) {
  return (
    <View className="items-center gap-2 p-4" accessibilityLiveRegion="assertive">
      <View className="h-1 w-5 bg-feedback-error" />

      <Text variant="body" accessibilityRole="header" className="text-center">
        {title}
      </Text>

      {description ? (
        <Text variant="body" color="support" className="text-center">
          {description}
        </Text>
      ) : null}

      <View className="w-full pt-3">
        <Button onPress={onAction}>{actionLabel}</Button>
      </View>
    </View>
  );
}
