import { View } from 'react-native';

import { Text } from '../primitives/Text';

import { TextLink } from './TextLink';

export type SuccessStateProps = {
  title: string;
  description?: string;
  /** A4 §6 : « lien retour connexion » — un lien, pas un bouton : l'action est finie. */
  linkLabel?: string;
  onLink?: () => void;
};

/**
 * Confirmation d'une action reussie — SuccessState A4.
 *
 * Barre de repere en ACCENT. Le systeme n'a volontairement aucune couleur de succes —
 * la Design-System-Specification §05 dit qu'aucun spectre success/warning/info n'est
 * observable et ne doit pas etre presume. L'accent est donc emprunte : acceptable car
 * une action primaire et une confirmation ne coexistent jamais sur un meme ecran.
 *
 * La couleur ne porte pas le sens seule — le titre le dit deja. Cette barre est donc
 * decorative au sens WCAG, ce qui la dispense du seuil de 3:1 que `action` ne tient
 * pas contre le fond de page (2.84:1).
 *
 * Le retour est un LIEN et non un bouton : l'action principale de l'ecran vient
 * d'aboutir, il n'y a plus d'action primaire a proposer.
 *
 * A4 §9 BR-1 : le message doit etre strictement identique que l'email existe ou non
 * (anti enumeration). C'est l'appelant qui le garantit — ce composant n'a aucun moyen
 * de le verifier.
 */
export function SuccessState({ title, description, linkLabel, onLink }: SuccessStateProps) {
  return (
    <View className="items-center gap-2 p-4" accessibilityLiveRegion="assertive">
      <View className="h-1 w-5 bg-action" />

      <Text variant="body" accessibilityRole="header" className="text-center">
        {title}
      </Text>

      {description ? (
        <Text variant="body" color="support" className="text-center">
          {description}
        </Text>
      ) : null}

      {linkLabel && onLink ? <TextLink onPress={onLink}>{linkLabel}</TextLink> : null}
    </View>
  );
}
