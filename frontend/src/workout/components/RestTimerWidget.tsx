import { View } from 'react-native';

import { Hairline } from '../../shared/components/primitives/Hairline';
import { Text } from '../../shared/components/primitives/Text';
import { TextLink } from '../../shared/components/ui/TextLink';

export type RestTimerWidgetProps = {
  /** Secondes restantes. Le décompte lui-même appartient à l'écran, pas au widget. */
  restant: number;
  /** Durée visée, ajustable en direct. Détermine le nombre de cellules. */
  total: number;
  onAjuster: (secondes: number) => void;
  onPasser: () => void;
};

/** `90` → `1:30`. Le repos se lit en minutes et secondes, jamais en secondes brutes. */
function mmss(secondes: number): string {
  const s = Math.max(0, secondes);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Une cellule par tranche de 15 secondes — le pas exact des boutons d'ajustement. */
export const SECONDES_PAR_CELLULE = 15;

/**
 * Bandeau de repos entre deux séries — RestTimerWidget C5.
 *
 * Retenu le 02/08/2026 parmi trois propositions montées dans Storybook, décomptes en
 * marche. Les deux écartées montraient le chiffre seul, et le chiffre accompagné de la
 * série qu'on venait de faire.
 *
 * LES CELLULES SONT ALIGNÉES SUR LES BOUTONS : une case vaut 15 secondes, soit exactement
 * ce qu'ajoutent ou retirent `+15 s` et `−15 s`. Taper sur un bouton allume ou éteint une
 * case entière — le geste et l'affichage parlent de la même unité. C'est aussi la barre de
 * cellules déjà validée pour le compteur de force du mot de passe : dans ce produit, une
 * quantité se lit en cases pleines.
 *
 * NON BLOQUANT, C5 §6 et §16 : il n'empêche jamais de logguer la série suivante. Aucun
 * focus capturé, aucune modale, et il se pose sous le contenu sans le recouvrir — C5 §13,
 * « sticky ne masque jamais le formulaire actif ».
 *
 * AUCUNE ANIMATION CONTINUE. La Design-System-Specification §10 note tout ce qui touche au
 * mouvement à 45% de confiance, la section la moins sûre du document, et en déduit « state
 * changes that snap or step rather than glide ». Le thème fermé va dans le même sens : une
 * largeur proportionnelle exigerait un `style` en dur, que la règle du projet interdit. Le
 * décompte saute donc d'un pas d'une seconde, et les cellules d'un pas de quinze.
 *
 * C5 §12 : le décompte est annoncé PÉRIODIQUEMENT au lecteur d'écran (30s, 10s, 0s), pas à
 * chaque seconde. C'est l'écran appelant qui décide quand annoncer ; ce composant ne pose
 * donc aucune région live.
 *
 * Score anti-slop 0 — voir SLOP.md.
 */
export function RestTimerWidget({ restant, total, onAjuster, onPasser }: RestTimerWidgetProps) {
  const cellules = Math.max(1, Math.ceil(total / SECONDES_PAR_CELLULE));
  const cellulesRestantes = Math.ceil(restant / SECONDES_PAR_CELLULE);

  return (
    <View className="bg-surface-page">
      <Hairline />

      <View className="gap-2 px-4 py-2">
        <View className="flex-row gap-1">
          {Array.from({ length: cellules }, (_, i) => (
            <View
              key={i}
              className={`h-2 flex-1 ${i < cellulesRestantes ? 'bg-text-default' : 'bg-divider'}`}
            />
          ))}
        </View>

        <View className="flex-row items-center justify-between gap-3">
          <Text variant="mono-display" accessibilityLabel={`Repos, ${restant} secondes`}>
            {mmss(restant)}
          </Text>

          <View className="flex-row items-center gap-3">
            <TextLink onPress={() => onAjuster(-SECONDES_PAR_CELLULE)} color="support">
              −15 s
            </TextLink>
            <TextLink onPress={() => onAjuster(SECONDES_PAR_CELLULE)} color="support">
              +15 s
            </TextLink>
            <TextLink onPress={onPasser}>Passer</TextLink>
          </View>
        </View>
      </View>
    </View>
  );
}
