import { View } from 'react-native';

import { Hairline } from '../primitives/Hairline';
import { Text } from '../primitives/Text';

export type ScreenHeaderProps = {
  title: string;
  /**
   * Attributs de l'ecran en lignes label/valeur.
   *
   * Remplace la phrase separee par des points (« STRENGTH · 60 min · 6 exercices »),
   * qui obligeait a lire toute la ligne pour trouver une valeur. En colonne, chaque
   * valeur se trouve d'un coup d'oeil et les unites s'alignent.
   */
  attributes?: readonly (readonly [string, string])[];
  /** Ligne unique, quand il n'y a rien a mettre en relevé — email sous le pseudo D1. */
  subtitle?: string;
  /** Retour ou fermeture — ModalHeader C1, ecrans empiles. */
  leading?: React.ReactNode;
  /** Action de droite — lien « Terminer » C5. */
  trailing?: React.ReactNode;
};

/**
 * En-tete d'ecran — ModalHeader C1, SessionHeader C5, ProfileHeader D1,
 * GreetingHeader B1, TemplateSummaryHeader C4.
 *
 * C1 §11 : en mode modal, le bouton de fermeture doit etre le PREMIER element
 * focusable. Il est donc rendu avant le titre dans l'arbre, pas seulement place a
 * gauche visuellement.
 *
 * Score anti-slop 0 — voir SLOP.md. Retenu le 01/08/2026 en remplacement d'une version
 * titre + sous-titre qui scorait 5.
 */
export function ScreenHeader({
  title,
  attributes,
  subtitle,
  leading,
  trailing,
}: ScreenHeaderProps) {
  return (
    <View className="gap-2 pb-2">
      <View className="min-h-touch flex-row items-center gap-3">
        {leading}

        <Text variant="body" accessibilityRole="header" className="flex-1">
          {title}
        </Text>

        {trailing}
      </View>

      <Hairline />

      {attributes ? (
        <View>
          {attributes.map(([cle, valeur]) => (
            <View key={cle} className="flex-row items-baseline justify-between py-1">
              <Text variant="mono-meta" color="support">
                {cle}
              </Text>
              <Text variant="mono-dense">{valeur}</Text>
            </View>
          ))}
          <Hairline />
        </View>
      ) : null}

      {subtitle ? (
        <Text variant="mono-meta" color="support">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
