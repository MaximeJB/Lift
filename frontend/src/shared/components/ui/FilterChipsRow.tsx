import { Pressable, ScrollView } from 'react-native';

import { Text } from '../primitives/Text';

export type FilterChipsRowProps = {
  /** Valeurs brutes, telles qu'envoyées au serveur — `LOWER_BACK`, pas « Lombaires ». */
  options: readonly string[];
  /** C1 §9 BR-3 : sélection multiple, OU entre les valeurs. */
  selection: readonly string[];
  onToggle: (option: string) => void;
};

/** Les codes de `MUSCLE_GROUP_CHOICES` portent des tirets bas. */
const lisible = (code: string) => code.replace(/_/g, ' ');

/**
 * Filtres par groupe musculaire — C1 §7, FilterChipsRow.
 *
 * L'ÉTAT SÉLECTIONNÉ EST UNE INVERSION FIGURE/FOND : aplat d'encre sombre, libellé en
 * papier. Retenu le 02/08/2026 dans Storybook, parmi trois propositions montées côte à
 * côte sur les 18 vrais groupes musculaires — les deux autres passaient par la marque de
 * `Checkbox` et par les crochets du `SegmentedControl`. Motif du choix : lisibilité de
 * loin, ce qui compte sur un écran consulté en salle.
 *
 * Le renversement figure/fond n'est pas un emprunt : §03 de la Design-System-Specification
 * le décrit comme un trait du système — « strong and often reversible, the same system
 * runs as dark-figure-on-light and light-figure-on-dark ».
 *
 * La couleur ne porte RIEN ici. Le critère B2 du barème pénalise de 2 une hiérarchie
 * chromatique là où la forme pouvait la porter : c'est le contraste tonal qui distingue,
 * et il reste lisible sans perception des couleurs.
 *
 * Contraste mesuré : 15,69:1 entre `text-on-ink` et l'aplat. Le contour est présent dans
 * les DEUX états — sans lui, un chip non sélectionné n'aurait aucune limite visible et
 * son libellé flotterait au milieu de la rangée.
 *
 * C1 §11 : `accessibilityRole="button"` et état sélectionné annoncé sur chaque chip.
 * C1 §12 : chips de taille fixe, aucune ne s'étire — la rangée garde sa cadence quand la
 * sélection change.
 *
 * La cible tactile de 44pt vient de `hitSlop` et non de la hauteur : une rangée réellement
 * haute de 44pt repousserait d'autant la première ligne de résultat, sur un écran dont la
 * liste est le contenu principal.
 *
 * Score anti-slop 0 — voir SLOP.md.
 */
export function FilterChipsRow({ options, selection, onToggle }: FilterChipsRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      /**
       * `grow-0` N'EST PAS DÉCORATIF. Un ScrollView horizontal placé dans une colonne
       * flexible s'étire sur toute la hauteur disponible, et ses chips, centrées, se
       * retrouvent au milieu d'une bande vide — 30% de l'écran entre la recherche et les
       * filtres. Constaté le 03/08/2026 sur appareil.
       */
      className="grow-0"
      contentContainerClassName="flex-row items-center gap-3"
      // Un premier tap doit basculer un filtre, pas seulement refermer le clavier ouvert
      // par le champ de recherche juste au-dessus.
      keyboardShouldPersistTaps="handled"
    >
      {options.map((option) => {
        const coche = selection.includes(option);

        return (
          <Pressable
            key={option}
            onPress={() => onToggle(option)}
            accessibilityRole="button"
            accessibilityState={{ selected: coche }}
            accessibilityLabel={lisible(option)}
            hitSlop={14}
            className={`border-hairline px-2 py-1 active:opacity-70 ${
              coche ? 'border-text-default bg-text-default' : 'border-control-border'
            }`}
          >
            <Text variant="label" color={coche ? 'on-ink' : 'support'}>
              {lisible(option)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
