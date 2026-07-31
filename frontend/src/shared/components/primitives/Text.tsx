import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

export type TextVariant = 'wordmark' | 'input' | 'button' | 'label' | 'link' | 'body';

/**
 * Table variante → classes. Les chaînes sont écrites EN TOUTES LETTRES, jamais
 * construites dynamiquement : le scanner de Tailwind lit le source, un
 * `text-${variant}` ne serait jamais généré et le texte sortirait sans style.
 *
 * Chaque variante porte sa typographie ET sa couleur par défaut, telle qu'elle est
 * décrite dans LIFT_Specification_Interface_V1.md. La couleur se surcharge via
 * `className` dans les cas minoritaires (texte sur l'accent, erreur inline).
 */
const VARIANT_CLASSES: Record<TextVariant, string> = {
  // SplashLogo A1, header logo A2 et A3
  wordmark: 'text-wordmark font-wordmark tracking-wordmark leading-tight text-text-default',
  // Tous les TextInput — 16px impose par l'anti-zoom iOS
  input: 'text-input font-input tracking-input leading-relaxed text-text-default',
  // Libelles de bouton — voix machine, uppercase vient du token textCase
  button: 'text-button font-button tracking-button leading-tight uppercase text-text-default',
  // Labels de champ A2/A3/D1, label StatCard B1 — voix machine
  label: 'text-label font-label tracking-label leading-tight uppercase text-text-support',
  // TextLink A2/A3, QuickLink B1 — voix lecture, casse normale
  link: 'text-link font-link tracking-link leading-tight text-text-default',
  // DescriptionText C2, description template C4, noms de liste, annexe CGU
  body: 'text-body font-body tracking-body leading-relaxed text-text-default',
};

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  className?: string;
};

/**
 * Le seul point d'entrée du texte dans l'application.
 *
 * Aucun `<Text>` de React Native ne doit apparaître ailleurs : c'est ce qui rend Inter
 * et l'échelle typographique pilotables depuis tokens/, et c'est la règle que le lint
 * de l'étape 12 (`react-native/no-raw-text`) fera respecter mécaniquement.
 */
export function Text({ variant = 'body', className = '', ...rest }: TextProps) {
  return <RNText className={`${VARIANT_CLASSES[variant]} ${className}`} {...rest} />;
}
