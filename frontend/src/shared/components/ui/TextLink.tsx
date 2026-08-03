import { Pressable, type PressableProps } from 'react-native';

import { Text, type TextColor } from '../primitives/Text';

export type TextLinkProps = Omit<PressableProps, 'children' | 'style'> & {
  children: string;
  /** `error` pour les actions destructives textuelles — DeleteAccountAction D1. */
  color?: Extract<TextColor, 'default' | 'support' | 'error'>;
  /**
   * Entoure le libelle d'un filet, en gardant la cible de 44pt.
   *
   * PAS UNE DECORATION. WCAG 1.4.11 demande qu'un element interactif soit identifiable a
   * 3:1 — `control-border` tient 3.31:1. Sans limite visible, un lien pose dans un
   * en-tete flotte, et l'utilisateur ne sait pas ou commence la zone tappable : signale
   * le 03/08/2026 sur « Quitter » et « Terminer » de C5, ou un tap accidentel interrompt
   * une seance.
   *
   * A reserver aux liens ISOLES d'un en-tete. Un lien en fin de phrase reste nu — le
   * texte qui l'entoure dit deja ou il est.
   */
  encadre?: boolean;
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
export function TextLink({ children, color = 'default', encadre = false, ...rest }: TextLinkProps) {
  return (
    <Pressable
      accessibilityRole="link"
      {...rest}
      className={`min-h-touch justify-center active:opacity-70 ${
        encadre ? 'self-start border-hairline border-control-border px-3' : ''
      }`}
    >
      <Text variant="link" color={color}>
        {children}
      </Text>
    </Pressable>
  );
}
