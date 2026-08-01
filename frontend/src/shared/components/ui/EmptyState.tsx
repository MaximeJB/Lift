import { View } from 'react-native';

import { Button } from '../primitives/Button';
import { Text } from '../primitives/Text';

export type EmptyStateProps = {
  title: string;
  description?: string;
  /** C7 §8 : l'etat vide de l'historique renvoie vers C3. C1 §8 n'a pas d'action. */
  actionLabel?: string;
  onAction?: () => void;
};

/**
 * Absence de donnees — EmptySearchState C1, EmptyHistoryState C7.
 *
 * Barre de repere NEUTRE : c'est un constat, pas un evenement. C'est cette barre qui
 * distingue les trois etats plein cadre entre eux — neutre ici, accent pour la
 * reussite, alerte pour le blocage.
 *
 * Pas de live region : une liste vide n'a pas a interrompre le lecteur d'ecran, elle
 * fait partie du contenu normal de l'ecran.
 *
 * L'action est OPTIONNELLE : C7 propose de demarrer une seance, C1 n'a rien a proposer
 * quand une recherche ne donne rien.
 */
export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center gap-2 p-4">
      <View className="h-1 w-5 bg-control-border" />

      <Text variant="body" className="text-center">
        {title}
      </Text>

      {description ? (
        <Text variant="body" color="support" className="text-center">
          {description}
        </Text>
      ) : null}

      {actionLabel && onAction ? (
        <View className="w-full pt-3">
          <Button onPress={onAction}>{actionLabel}</Button>
        </View>
      ) : null}
    </View>
  );
}
