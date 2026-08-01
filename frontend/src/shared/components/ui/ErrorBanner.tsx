import { View } from 'react-native';

import { Text } from '../primitives/Text';

import { TextLink } from './TextLink';

export type ErrorBannerProps = {
  message: string;
  /** Fourni uniquement pour les erreurs reseau — A2 §8. */
  onRetry?: () => void;
};

/**
 * Banniere d'erreur — A2, A3, A4, B1, C1, C3, C7.
 *
 * Barre verticale a gauche et fond teinte discret, registre instrument. Pas de cadre
 * complet : le systeme separe par l'espace et le filet avant d'encadrer.
 *
 * Regle etablie en A2 et appliquee partout ensuite : la banniere porte les erreurs NON
 * LIEES A UN CHAMP (identifiants invalides, reseau). Une erreur liee a un champ
 * s'affiche inline sous ce champ, via la prop `error` d'Input.
 *
 * Le lien « Reessayer » vit DANS le bloc : le recours appartient a l'erreur.
 *
 * Aucun `gap`, et pas de marge basse quand le lien est la : TextLink porte deja sa
 * cible tactile de 44pt (A2 §11), dont le centrage laisse ~14pt sous le libelle. Y
 * ajouter un gap et un padding produisait 30pt de vide en bas de banniere.
 *
 * A2 §9 BR-2 : le message reste generique, il ne dit jamais quel champ est faux.
 * A2 §11 : annoncee en live region polite — lue sans interrompre la saisie.
 */
export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      className={`border-l-hairline border-feedback-error bg-feedback-error-surface pl-3 pt-3 ${
        onRetry ? '' : 'pb-3'
      }`}
    >
      <Text variant="body" color="error">
        {message}
      </Text>
      {onRetry ? (
        <TextLink onPress={onRetry} color="error">
          Réessayer
        </TextLink>
      ) : null}
    </View>
  );
}
