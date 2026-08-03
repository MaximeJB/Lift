import { Stack } from 'expo-router';

/**
 * Pile interne au tab Lift.
 *
 * Le SegmentedControl (C3 / C7 / C1) reste le header PERSISTANT de `index`, conformément
 * à la Phase 1 de la spec : les trois segments ne sont pas des routes, ils ne changent
 * pas l'URL et ne s'empilent pas.
 *
 * Ce qui s'empile, en revanche, ce sont les DÉTAILS ouverts depuis un segment — C2 pour
 * un exercice, C4 pour un template. Une pile ici, et non un `push` au niveau des tabs,
 * pour que la barre d'onglets reste visible et que le retour ramène au bon segment.
 */
export default function LiftLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
