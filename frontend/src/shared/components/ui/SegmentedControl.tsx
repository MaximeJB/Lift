import { Pressable, View } from 'react-native';

import { Hairline } from '../primitives/Hairline';
import { Text } from '../primitives/Text';

export type SegmentedControlVariant = 'brackets' | 'roster' | 'bar';

export type SegmentedControlProps<T extends string> = {
  segments: readonly T[];
  value: T;
  onChange: (next: T) => void;
  /**
   * `brackets` (defaut) — presentation horizontale, l'actif est encadre de crochets.
   * `roster` — presentation verticale en releve, a utiliser quand ce menu est
   * re-presente a un utilisateur qui vient de le voir : la variation evite l'impression
   * qu'on lui resserre toujours le meme menu.
   * `bar` — bande accentuee de 4pt sous l'actif. Retenue le 01/08/2026, conservee
   * ensuite comme variante. Score 5 au bareme (A6 pattern Material importe, A9 choix
   * median, B6 registre code absent) — le score est indicatif, la decision appartient
   * au proprietaire du produit.
   */
  variant?: SegmentedControlVariant;
};

/**
 * Navigation interne au tab Lift — C3 (Seances), C7 (Historique), C1 (Exercices).
 *
 * Les crochets d'angle sont une forme SANCTIONNEE par la Design-System-Specification
 * §02 : « corner brackets, crosshairs, registration marks ». L'onglet actif est
 * encadre comme une mire encadre une cible — la FORME porte l'etat, pas la couleur.
 * C'est ce qui distingue ce composant d'une barre d'onglets Material, qui marquerait
 * l'actif par un simple filet colore.
 *
 * L'index code (`01`, `02`, `03`) vient du §01 : « coded — IDs, coordinates,
 * frequencies, versions ». Il est derive de la position, jamais saisi par l'appelant.
 *
 * C3 §11 : role "tablist" sur le conteneur, "tab" sur chaque segment, etat selectionne
 * annonce.
 *
 * Score anti-slop 0 — voir SLOP.md.
 */
export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  variant = 'brackets',
}: SegmentedControlProps<T>) {
  const code = (i: number) => String(i + 1).padStart(2, '0');

  if (variant === 'roster') {
    return (
      <View accessibilityRole="tablist">
        <Hairline />
        {segments.map((segment, i) => {
          const actif = segment === value;
          return (
            <Pressable
              key={segment}
              onPress={() => onChange(segment)}
              accessibilityRole="tab"
              accessibilityState={{ selected: actif }}
              className="min-h-touch flex-row items-center gap-3 active:opacity-70"
            >
              <View className={`h-full w-1 ${actif ? 'bg-action' : 'bg-transparent'}`} />
              <Text variant="mono-meta" color={actif ? 'default' : 'placeholder'}>
                {code(i)}
              </Text>
              <Text variant="label" color={actif ? 'default' : 'support'} className="flex-1">
                {segment}
              </Text>
              {actif ? <Text variant="mono-accent">actif</Text> : null}
            </Pressable>
          );
        })}
        <Hairline />
      </View>
    );
  }

  if (variant === 'bar') {
    return (
      <View accessibilityRole="tablist" className="flex-row">
        {segments.map((segment) => {
          const actif = segment === value;
          return (
            <Pressable
              key={segment}
              onPress={() => onChange(segment)}
              accessibilityRole="tab"
              accessibilityState={{ selected: actif }}
              className="min-h-touch flex-1 active:opacity-70"
            >
              <View className="flex-1 items-center justify-center">
                <Text variant="label" color={actif ? 'default' : 'support'}>
                  {segment}
                </Text>
              </View>
              <View className={`h-1 w-full ${actif ? 'bg-action' : 'bg-divider'}`} />
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View accessibilityRole="tablist" className="flex-row">
      {segments.map((segment, i) => {
        const actif = segment === value;
        return (
          <Pressable
            key={segment}
            onPress={() => onChange(segment)}
            accessibilityRole="tab"
            accessibilityState={{ selected: actif }}
            className="min-h-touch flex-1 justify-center px-2 active:opacity-70"
          >
            <View className="flex-row items-center gap-1">
              {/* Les crochets occupent leur place meme inactifs : sinon les libelles
                  se decalent horizontalement a chaque changement d'onglet. */}
              <Text variant="mono-accent" color={actif ? 'default' : 'placeholder'}>
                {actif ? '[' : ' '}
              </Text>

              <View className="flex-1 gap-1">
                <Text variant="mono-meta" color={actif ? 'default' : 'placeholder'}>
                  {code(i)}
                </Text>
                <Text variant="label" color={actif ? 'default' : 'support'}>
                  {segment}
                </Text>
              </View>

              <Text variant="mono-accent" color={actif ? 'default' : 'placeholder'}>
                {actif ? ']' : ' '}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
