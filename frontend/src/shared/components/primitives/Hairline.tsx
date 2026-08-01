import { StyleSheet, View } from 'react-native';

type HairlineProps = {
  orientation?: 'horizontal' | 'vertical';
  /** Marges uniquement. Ne jamais y passer une couleur ou une épaisseur. */
  className?: string;
};

/**
 * Le filet — signature visuelle du système.
 *
 * `border-width: 1` ne produit PAS un vrai filet : selon la densité de l'écran il
 * apparaît épais. La valeur juste est `StyleSheet.hairlineWidth`, qui vaut 0,5 ou 0,33
 * selon l'appareil — une valeur connue à l'exécution seulement, donc impossible à
 * exprimer en classe Tailwind.
 *
 * C'est LA SEULE DÉROGATION LÉGITIME à la prop `style` de tout le projet. Elle est
 * encapsulée ici et nulle part ailleurs : aucun autre composant ne doit utiliser
 * `style`, et aucune classe `border-*` ne doit servir à dessiner un filet.
 */
export function Hairline({ orientation = 'horizontal', className = '' }: HairlineProps) {
  return (
    <View
      className={
        orientation === 'horizontal'
          ? `w-full bg-divider ${className}`
          : `h-full bg-divider ${className}`
      }
      // Seul `style` du projet — cf. en-tête. `react-native/no-inline-styles` ne le
      // signale pas : il ne flagge que les valeurs littérales, et hairlineWidth n'en
      // est pas une. L'exception reste documentée ici plutôt que par une dérogation.
      style={
        orientation === 'horizontal'
          ? { height: StyleSheet.hairlineWidth }
          : { width: StyleSheet.hairlineWidth }
      }
    />
  );
}
