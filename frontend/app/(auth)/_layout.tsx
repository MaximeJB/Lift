import { Stack } from 'expo-router';

/**
 * Domaine A — authentification. A1 à A5.
 *
 * Pile séparée du groupe (tabs) : ces écrans n'ont ni barre d'onglets ni session.
 * A2 §4 : « pas de bouton retour natif pertinent » sur le Login lui-même — les écrans
 * empilés au-dessus (A3, A4) le retrouvent naturellement.
 *
 * `headerShown: false` : chaque écran pose son propre en-tête avec la typographie du
 * système. L'en-tête natif ne saurait pas le faire.
 */
/**
 * Sans cette déclaration, expo-router choisirait la première route par ordre
 * ALPHABÉTIQUE — soit `forgot-password`. L'app s'ouvrirait sur l'écran de
 * réinitialisation au lieu du Login.
 */
export const unstable_settings = { initialRouteName: 'login' };

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
