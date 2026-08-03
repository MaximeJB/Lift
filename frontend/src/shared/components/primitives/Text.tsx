import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

export type TextVariant =
  | 'wordmark'
  | 'section'
  | 'input'
  | 'button'
  | 'label'
  | 'link'
  | 'body'
  // Voix monospace — quatre timbres, un par corps de texte. Voir MAPPING.md §7.5.
  | 'mono-display'
  | 'mono-dense'
  | 'mono-meta'
  | 'mono-accent';

export type TextColor =
  | 'default'
  | 'support'
  | 'placeholder'
  | 'on-action'
  // Libelle sur aplat d'encre sombre — chip selectionne de FilterChipsRow C1.
  | 'on-ink'
  | 'error';

/**
 * Classes TYPOGRAPHIQUES seulement — aucune couleur ici.
 *
 * Les chaines sont ecrites en toutes lettres, jamais construites dynamiquement : le
 * scanner de Tailwind lit le source, un `text-${variant}` ne serait jamais genere.
 */
const VARIANT_CLASSES: Record<TextVariant, string> = {
  // SplashLogo A1, header logo A2 et A3
  wordmark: 'text-wordmark font-wordmark tracking-wordmark leading-tight',
  // Titre de section — nom d'exercice C5/C8, en-tetes D1. Voix grotesque : le §06 de la
  // Design-System-Specification reserve le mono aux metadonnees et aux tableaux.
  section: 'text-section font-section tracking-section leading-tight',
  // Tous les TextInput — 16px impose par l'anti-zoom iOS
  input: 'text-input font-input tracking-input leading-relaxed',
  // Libelles de bouton — voix machine
  button: 'text-button font-button tracking-button leading-tight uppercase',
  // Labels de champ A2/A3/D1, label StatCard B1 — voix machine
  label: 'text-label font-label tracking-label leading-tight uppercase',
  // TextLink A2/A3, QuickLink B1 — voix lecture, casse normale
  link: 'text-link font-link tracking-link leading-tight',
  // DescriptionText C2, description template C4, noms de liste, annexe CGU
  body: 'text-body font-body tracking-body leading-relaxed',

  // Martian Mono — chiffre mis en avant. StatCard B1, 1RM, chrono C5, stats C6.
  'mono-display': 'text-mono-display font-mono-display tracking-mono-display leading-tight',
  // Spline Sans Mono — colonnes serrees. SetRow C5 et C8.
  'mono-dense': 'text-mono-dense font-mono-dense tracking-mono-dense leading-tight',
  // Sometype Mono — metadonnees. Dates et durees C7, date des PR B1.
  'mono-meta': 'text-mono-meta font-mono-meta tracking-mono-meta leading-tight',
  // Cutive Mono — etiquette ponctuelle. MonthSectionHeader C7, en-tetes de section.
  // JAMAIS en colonne ni en paragraphe : frappe usee, illisible en serie.
  'mono-accent': 'text-mono-accent font-mono-accent tracking-mono-accent leading-tight uppercase',
};

const COLOR_CLASSES: Record<TextColor, string> = {
  default: 'text-text-default',
  support: 'text-text-support',
  placeholder: 'text-text-placeholder',
  'on-action': 'text-text-on-action',
  'on-ink': 'text-text-on-ink',
  error: 'text-feedback-error',
};

/** Couleur par defaut de chaque variante, telle que decrite dans la spec d'interface. */
const VARIANT_COLOR: Record<TextVariant, TextColor> = {
  wordmark: 'default',
  section: 'default',
  input: 'default',
  button: 'default',
  label: 'support',
  link: 'default',
  body: 'default',
  'mono-display': 'default',
  'mono-dense': 'default',
  'mono-meta': 'support',
  'mono-accent': 'support',
};

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  /** Surcharge la couleur par defaut de la variante. */
  color?: TextColor;
  /**
   * Marges et layout UNIQUEMENT.
   *
   * Ne jamais y passer de classe `text-*` de couleur : NativeWind applique la
   * specificite CSS, et a specificite egale c'est l'ORDRE DANS LA FEUILLE DE STYLE
   * qui tranche — pas l'ordre dans la chaine. Une couleur passee ici gagnerait ou
   * perdrait selon l'ordre alphabetique des deux noms, sans le moindre avertissement.
   * C'est exactement pour ca que la prop `color` existe.
   */
  className?: string;
};

/**
 * Le seul point d'entree du texte dans l'application.
 *
 * Aucun `<Text>` de React Native ne doit apparaitre ailleurs : c'est ce qui rend les
 * polices et l'echelle typographique pilotables depuis tokens/, et c'est la regle que
 * le lint de l'etape 12 (`react-native/no-raw-text`) fera respecter mecaniquement.
 *
 * UNE SEULE classe de couleur est emise, jamais deux en conflit.
 */
export function Text({ variant = 'body', color, className = '', ...rest }: TextProps) {
  const colorClass = COLOR_CLASSES[color ?? VARIANT_COLOR[variant]];
  return <RNText className={`${VARIANT_CLASSES[variant]} ${colorClass} ${className}`} {...rest} />;
}
