import { Pressable, View } from 'react-native';

export type CheckboxProps = {
  checked: boolean;
  onToggle: (next: boolean) => void;
  /**
   * UN SEUL flux de texte, pas une rangee de blocs.
   *
   * A3 §11 exige que les liens CGU restent atteignables independamment de la case.
   * Les mettre en `<Text variant="link" onPress={...}>` IMBRIQUE dans le texte les
   * garde en ligne : ils suivent la ligne de base au lieu de creer un bloc de 44pt qui
   * desaxerait la case. WCAG 2.5.8 exempte explicitement les liens en ligne de la
   * cible de 44pt.
   */
  children: React.ReactNode;
};

/**
 * Case a cocher — ConsentCheckbox A3.
 *
 * A3 §9 BR-4 : jamais pre-cochee. C'est l'appelant qui garantit l'etat initial.
 *
 * La zone tappable est limitee au carre, pas a toute la ligne : sinon taper un lien
 * CGU cocherait la case au passage.
 *
 * La marque est une pastille d'accent, pas un caractere ni une icone : aucune famille
 * d'icones n'existe dans le systeme, et en introduire une ici serait un choix hors sujet.
 */
export function Checkbox({ checked, onToggle, children }: CheckboxProps) {
  return (
    <View className="flex-row items-center gap-2">
      <Pressable
        onPress={() => onToggle(!checked)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        // Le carre fait 16pt ; hitSlop porte la cible reelle a 16+2x14 = 44pt (A2 §11).
        hitSlop={14}
        className="h-3 w-3 items-center justify-center border-hairline border-control-border active:opacity-70"
      >
        {checked ? <View className="h-1 w-1 bg-action" /> : null}
      </Pressable>

      <View className="flex-1">{children}</View>
    </View>
  );
}
