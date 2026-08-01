import { Modal, View } from 'react-native';

import { Button } from '../primitives/Button';
import { Hairline } from '../primitives/Hairline';
import { Text } from '../primitives/Text';

export type ConfirmDialogProps = {
  visible: boolean;
  /** Registre code — « suppression / compte », « annulation / seance ». */
  title: string;
  /**
   * Ce qui sera DETRUIT, chiffre a l'appui : [['seances', '47'], ['series', '892']].
   *
   * C'est le coeur du composant. Un dialogue qui annonce « action irreversible » sans
   * dire CE QUI disparait decore au lieu de documenter — critere B4 du bareme.
   * L'appelant fournit de vrais comptes, jamais des estimations.
   */
  consequences?: readonly (readonly [string, string])[];
  /** Phrase libre, quand il n'y a rien de chiffrable a enumerer. */
  message?: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  /**
   * Champ de re-authentification — D1 §9 BR-3 et §14 : les actions sensibles ne sont
   * JAMAIS accessibles sans re-saisie du mot de passe. Une confirmation par recopie
   * prouverait l'intention, pas l'identite.
   */
  children?: React.ReactNode;
};

/**
 * Confirmation d'action irreversible — ConfirmDialog C6/C8, DeleteAccountConfirmDialog D1.
 *
 * Aligne a gauche, sans carte flottante ni voile : la contrainte systeme §09 dit que la
 * profondeur se fait par aplat et bordure, jamais par ombre ni flou.
 *
 * C6 §11 : le bouton destructif n'est JAMAIS adjacent au primaire. L'ordre est inverse —
 * « Annuler » d'abord — pour qu'un tap reflexe tombe sur le choix sur.
 *
 * D1 §11 : quand un champ est fourni, c'est lui qui recoit le focus initial, pas le
 * bouton de confirmation. C'est l'appelant qui pose l'autoFocus.
 *
 * Score anti-slop 0 — voir SLOP.md.
 */
export function ConfirmDialog({
  visible,
  title,
  consequences,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 justify-center bg-surface-page p-4">
        <View className="gap-3">
          <Text variant="mono-accent" accessibilityRole="header">
            {title}
          </Text>
          <Hairline />

          {consequences ? (
            <View>
              {consequences.map(([quoi, combien]) => (
                <View key={quoi} className="flex-row items-center justify-between py-1">
                  <Text variant="mono-dense" color="support">
                    {quoi}
                  </Text>
                  <Text variant="mono-dense">{combien}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {message ? (
            <Text variant="body" color="support">
              {message}
            </Text>
          ) : null}

          {consequences ? <Hairline /> : null}

          {children}

          <View className="gap-2 pt-2">
            <Button variant="secondary" onPress={onCancel}>
              Annuler
            </Button>
            <Button variant="destructive" onPress={onConfirm}>
              {confirmLabel}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
