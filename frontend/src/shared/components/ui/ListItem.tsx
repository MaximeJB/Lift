import { Pressable, View } from 'react-native';

import { Text } from '../primitives/Text';

export type ListItemProps = {
  title: string;
  /** Groupe musculaire C1, date et duree C7, cibles de series C4. */
  subtitle?: string;
  /**
   * Fait notable — un record battu, par exemple. Sa presence transforme la ligne de
   * sous-titre en BANDE PLEINE LARGEUR accentuee.
   *
   * Ecart assume a la contrainte §12 (« never more than one saturated accent colour in
   * a single view »), decide le 01/08/2026 : le systeme privilegie le blocage de
   * couleur facon ACG. §09 sanctionne deja les « full-bleed tint panels ».
   *
   * Le cas de plusieurs bandes dans une meme vue a ete regarde et valide — voir la
   * story « HistoriqueTropDeBandes ». Aucune regle de parcimonie n'est imposee.
   */
  banner?: string;
  /** Miniature ou icone. C7 §9 BR-2 : rien ne doit occuper d'espace si absent. */
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
};

/**
 * Ligne de liste — ExerciseListItem C1, SessionListItem C7, TemplateExerciseRow C4,
 * FreeSessionCard et TemplateCard C3.
 *
 * Pas de conteneur « Card » : ces elements se ressemblent par le COMPORTEMENT (une
 * ligne qu'on tape pour naviguer), pas par une bordure. Le filet entre lignes est rendu
 * par le parent via Hairline, pas par chaque ligne.
 *
 * LA BANDE : `bg-action` ne tient que 2.84:1 contre la page, donc le contour
 * `action-border` la rend identifiable — meme mecanique que le bouton primaire. Le
 * texte est en encre sombre (4.74:1) ; `rust.deep` a ete ecarte car il ne porte
 * AUCUN texte au seuil (4.08:1 avec l'encre, 3.85:1 avec le papier).
 *
 * C1 §11 et C7 §11 : un seul label accessible combine, pour que le lecteur d'ecran
 * annonce la ligne d'un bloc au lieu de trois elements separes.
 */
export function ListItem({
  title,
  subtitle,
  banner,
  leading,
  trailing,
  onPress,
}: ListItemProps) {
  const content = (
    <View className="min-h-touch justify-center gap-1 py-2">
      <View className="flex-row items-center gap-3">
        {leading}
        <Text variant="body" className="flex-1">
          {title}
        </Text>
        {trailing}
      </View>

      {banner ? (
        <View className="flex-row items-center gap-2 border-hairline border-action-border bg-action px-2 py-1">
          <Text variant="mono-accent" color="on-action">
            {banner}
          </Text>
          {subtitle ? (
            <Text variant="mono-meta" color="on-action">
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : subtitle ? (
        <Text variant="mono-meta" color="support">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );

  if (!onPress) return content;

  const label = [title, banner, subtitle].filter(Boolean).join(', ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="active:opacity-70"
    >
      {content}
    </Pressable>
  );
}
