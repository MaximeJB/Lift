import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';

import tokens from '../../theme/tailwind-tokens';

import { Text, type TextColor } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive';

/**
 * Table variante → classes, écrites en toutes lettres (cf. Text.tsx).
 *
 * `spinner` n'est pas une classe mais une valeur : ActivityIndicator prend une couleur
 * en prop, pas en style. Elle vient donc du preset, jamais d'un littéral.
 */
const VARIANT = {
  // PrimaryButton A2/A3/A4/A5/C6, PrimaryCTAButton B1, StickyCTAButton C4.
  // Le contour n'est pas decoratif : l'aplat accent ne tient que 2.84:1 contre la page,
  // c'est donc le filet qui rend le bouton identifiable (WCAG 1.4.11). Le retirer casse
  // la conformite sans rien changer d'autre a l'ecran.
  primary: {
    container: 'bg-action border-hairline border-action-border',
    label: 'on-action' as const,
    spinner: tokens.colors['text-on-action'],
  },
  // LogoutButton D1, actions de second rang.
  // `control-border` et non `divider` : ce filet est la SEULE limite visible du bouton,
  // il identifie donc le composant et doit tenir 3:1 (WCAG 1.4.11). `divider` est le
  // filet decoratif des listes, volontairement laisse a 1.49:1.
  secondary: {
    container: 'border-hairline border-control-border',
    label: 'default' as const,
    spinner: tokens.colors['text-default'],
  },
  // DestructiveTextButton C6/C8/D1 — texte seul, aucun fond
  destructive: {
    container: '',
    label: 'error' as const,
    spinner: tokens.colors['feedback-error'],
  },
} satisfies Record<ButtonVariant, { container: string; label: TextColor; spinner: string }>;

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  children: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
};

/**
 * Bouton — pleine largeur, angles vifs, hauteur minimale 44pt (WCAG 2.2 / iOS HIG).
 *
 * États pressed et disabled exprimés en opacité : le système n'a volontairement aucun
 * token de couleur d'état (décision Q8, reportée à l'atelier visuel de l'étape 10).
 * `opacity-70` et `opacity-40` sont donc les deux seules valeurs non gouvernées par
 * tokens/ de ce composant — à remplacer si l'atelier décide de vraies couleurs d'état.
 */
export function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  ...rest
}: ButtonProps) {
  const styles = VARIANT[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      {...rest}
      // NativeWind mappe le variant `active:` sur l'état pressed de Pressable.
      // Contrairement à `style`, `className` n'accepte pas de fonction.
      className={[
        'w-full min-h-touch items-center justify-center rounded-control px-3',
        styles.container,
        disabled ? 'opacity-40' : 'active:opacity-70',
      ].join(' ')}
    >
      {loading ? (
        <ActivityIndicator color={styles.spinner} />
      ) : (
        <Text variant="button" color={styles.label}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}
