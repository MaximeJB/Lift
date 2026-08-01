import { useState } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';

import tokens from '../../theme/tailwind-tokens';
import { Text } from '../primitives/Text';

export type InputProps = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  /** Label explicite au-dessus du champ. A2 §11 l'exige : jamais un placeholder seul. */
  label: string;
  /** Message d'erreur inline. Sa presence bascule le filet en etat Error. */
  error?: string;
  /** Element affiche a droite sur la ligne — bascule oeil, bouton effacer. */
  trailing?: React.ReactNode;
};

/**
 * Champ de saisie — base de tous les autres.
 *
 * Disposition « filet seul » : pas de cadre, pas de fond. La ligne de saisie repose
 * sur un unique filet, registre du formulaire imprime. C'est le SEUL endroit du projet
 * ou la limite d'un champ est dessinee.
 *
 * POURQUOI PAS <Hairline /> ICI : Hairline trace un filet de `StyleSheet.hairlineWidth`,
 * soit 0,5px sur un ecran 2x — juste pour un separateur decoratif. Ce filet-ci est la
 * limite du composant, il doit tenir 3:1 (WCAG 1.4.11) et donc faire un vrai pixel.
 * D'ou `border-b-hairline`, comme le contour du Button secondary.
 *
 * Trois etats, trois tokens :
 *   Default  control-border         3.31:1 contre la page
 *   Focus    control-border-focus   3.31:1 — le champ actif est le point accentue
 *   Error    field-border-error
 */
export function Input({ label, error, trailing, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderClass = error
    ? 'border-field-border-error'
    : focused
      ? 'border-control-border-focus'
      : 'border-control-border';

  return (
    <View className="gap-1">
      <Text variant="label">{label}</Text>

      {/* flex-row : `flex-1` sur le TextInput doit s'appliquer horizontalement.
          En colonne il s'etirerait verticalement et le texte remonterait en haut. */}
      <View className={`min-h-touch flex-row items-center border-b-hairline ${borderClass}`}>
        <TextInput
          className="flex-1 text-input font-input tracking-input leading-relaxed text-text-default"
          placeholderTextColor={tokens.colors['text-placeholder']}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label}
          {...rest}
        />
        {trailing}
      </View>

      {/* A2 §11 : l'erreur est annoncee des qu'elle apparait, sans voler le focus. */}
      {error ? (
        <Text variant="body" color="error" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
