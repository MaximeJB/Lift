import { Pressable, type PressableProps } from 'react-native';

import { Text, type TextColor } from '../primitives/Text';

export type TextLinkProps = Omit<PressableProps, 'children' | 'style'> & {
  children: string;
  /** `error` pour les actions destructives textuelles — DeleteAccountAction D1. */
  color?: Extract<TextColor, 'default' | 'support' | 'error'>;
};

/**
 * Lien textuel — TextLink A2/A3, QuickLink B1, ChangePasswordAction et
 * ExportDataAction D1.
 *
 * Pas de couleur d'accent : `rust` en texte sur le fond de page plafonne a 3.87:1,
 * sous le seuil AA de 4.5:1 (voir MAPPING.md §7.7). Le lien se distingue par sa
 * position et sa taille, pas par sa teinte.
 *
 * Cible tactile 44pt malgre un libelle court — A2 §11.
 */
export function TextLink({ children, color = 'default', ...rest }: TextLinkProps) {
  return (
    <Pressable
      accessibilityRole="link"
      {...rest}
      className="min-h-touch justify-center active:opacity-70"
    >
      <Text variant="link" color={color}>
        {children}
      </Text>
    </Pressable>
  );
}
