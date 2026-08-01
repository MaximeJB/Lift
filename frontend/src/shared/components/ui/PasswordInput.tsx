import { useState } from 'react';
import { Pressable } from 'react-native';

import { Text } from '../primitives/Text';

import { Input, type InputProps } from './Input';

export type PasswordInputProps = Omit<InputProps, 'secureTextEntry' | 'trailing'>;

/**
 * Champ mot de passe — A2, A3, A5, D1.
 *
 * Enveloppe Input : il n'a ni contour ni etat focus propres, il ajoute seulement le
 * masquage et la bascule oeil. A2 §11 exige un accessibilityLabel DYNAMIQUE sur la
 * bascule : « Afficher » quand le texte est masque, « Masquer » quand il est visible.
 */
export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      trailing={
        <Pressable
          onPress={() => setVisible((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          className="min-h-touch justify-center pl-3 active:opacity-70"
        >
          <Text variant="link" color="support">
            {visible ? 'Masquer' : 'Afficher'}
          </Text>
        </Pressable>
      }
    />
  );
}
