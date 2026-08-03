import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Hairline } from '../primitives/Hairline';
import { Text } from '../primitives/Text';

export type TabBarItem = {
  key: string;
  label: string;
  active: boolean;
  onPress: () => void;
};

/**
 * Rendu de la barre d'onglets, sans aucune dépendance à la navigation.
 *
 * SÉPARÉ DE `TabBar` À DESSEIN : la version connectée reçoit ses props de React
 * Navigation et ne peut pas être montée hors d'un navigateur — donc pas dans Storybook.
 * Extraire la partie visuelle permet de l'inspecter au catalogue SANS recopier son
 * rendu dans une story, duplication qui aurait divergé au premier changement.
 *
 * L'encoche du bas passe par `SafeAreaView edges={['bottom']}` et non par un `style` :
 * `Hairline.tsx` reste la seule dérogation du projet.
 */
export function TabBarView({ items }: { items: readonly TabBarItem[] }) {
  return (
    <SafeAreaView edges={['bottom']} className="bg-surface-page">
      <Hairline />

      <View className="flex-row">
        {items.map((item) => (
          <Pressable
            key={item.key}
            onPress={item.onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: item.active }}
            accessibilityLabel={item.label}
            className="min-h-touch flex-1 active:opacity-70"
          >
            {/* Le filet occupe sa place même inactif : sinon les libellés remonteraient
                de 4pt à chaque changement d'onglet. */}
            <View className={`h-1 w-full ${item.active ? 'bg-action' : 'bg-transparent'}`} />

            <View className="flex-1 items-center justify-center">
              <Text variant="label" color={item.active ? 'default' : 'support'}>
                {item.label}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

/**
 * Barre d'onglets connectée — navigation entre domaines (Accueil, Lift, Profil).
 *
 * REMPLACE ENTIÈREMENT la barre par défaut de React Navigation, qui suppose une icône
 * par onglet. Le système n'a AUCUNE famille d'icônes : la contrainte §12 en interdit le
 * mélange et aucune n'a été choisie. La barre repose donc sur le texte seul.
 *
 * L'onglet actif est marqué par un filet de 4pt sur le bord HAUT de la barre — côté
 * contenu, comme une réglette désigne une graduation. Il ne ressemble volontairement pas
 * au SegmentedControl à crochets du tab Lift : ce sont deux niveaux de navigation
 * distincts, les confondre ferait perdre un repère d'orientation.
 *
 * Score anti-slop 1 — voir SLOP.md. Retenu le 02/08/2026 parmi trois propositions.
 */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const items: TabBarItem[] = state.routes.map((route, index) => {
    const { options } = descriptors[route.key];
    const active = state.index === index;

    return {
      key: route.key,
      label: options.title ?? route.name,
      active,
      /**
       * Passe par le gestionnaire de React Navigation, pas par un `navigate` direct.
       *
       * `emit` laisse les écrans annuler la navigation — C5 §11 prévoit une confirmation
       * avant de quitter une séance dont des séries sont déjà loguées. Un `navigate`
       * inconditionnel court-circuiterait ce garde-fou.
       */
      onPress: () => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });

        if (!active && !event.defaultPrevented) {
          navigation.navigate(route.name, route.params);
        }
      },
    };
  });

  return <TabBarView items={items} />;
}
