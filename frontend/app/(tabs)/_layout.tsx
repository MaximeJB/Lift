import { Tabs } from 'expo-router';

import { TabBar } from '../../src/shared/components/ui/TabBar';

/**
 * Navigation principale — Accueil, Lift, Profil.
 *
 * Trois onglets, décision de cadrage validée dans LIFT_Specification_Interface_V1.md
 * (contradiction n°2 des Phase 0 : Spec.md en annonçait quatre, la V1 en retient trois).
 *
 * `headerShown: false` partout : chaque écran pose son propre `ScreenHeader`, qui porte
 * le registre typographique du système. L'en-tête natif ne saurait pas le faire.
 *
 * La barre par défaut est remplacée — voir TabBar.tsx, le système n'a pas d'icônes.
 */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="lift" options={{ title: 'Lift' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
