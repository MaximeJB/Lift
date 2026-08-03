import { View } from 'react-native';

import { Text } from '../primitives/Text';

export type ForceMotDePasse = 'FAIBLE' | 'MOYEN' | 'FORT';

/**
 * Les huit critères comptés. Un critère tenu = une cellule remplie.
 *
 * Ils sont MESURABLES et énumérés ici en clair : le composant ne devine pas une
 * « force » par un score opaque, il compte des faits vérifiables sur la chaîne. C'est ce
 * qui autorise la barre à exister sans décorer — chaque cellule correspond à quelque
 * chose que l'utilisateur peut faire changer.
 *
 * Le premier critère est le plancher d'A3 §9 BR-3 (≥ 8 caractères). Les sept autres ne
 * conditionnent RIEN côté soumission : le backend n'impose aucune règle de complexité
 * aujourd'hui, et en inventer une bloquerait des mots de passe que l'API accepte.
 */
const CRITERES = [
  { nom: '8 caractères', tenu: (p: string) => p.length >= 8 },
  { nom: '12 caractères', tenu: (p: string) => p.length >= 12 },
  { nom: '16 caractères', tenu: (p: string) => p.length >= 16 },
  { nom: 'minuscule', tenu: (p: string) => /[a-z]/.test(p) },
  { nom: 'majuscule', tenu: (p: string) => /[A-Z]/.test(p) },
  { nom: 'chiffre', tenu: (p: string) => /[0-9]/.test(p) },
  { nom: 'symbole', tenu: (p: string) => /[^a-zA-Z0-9]/.test(p) },
  { nom: 'sans triplé', tenu: (p: string) => !/(.)\1\1/.test(p) },
] as const;

/**
 * Compte les critères tenus et en déduit l'un des trois verdicts d'A3 §7.
 *
 * Exporté pour que le catalogue puisse montrer le barème sur de vrais mots de passe —
 * et pour qu'il soit testable sans monter de composant.
 */
export function evaluerForce(password: string): { points: number; verdict: ForceMotDePasse } {
  const points = CRITERES.reduce((total, critere) => total + (critere.tenu(password) ? 1 : 0), 0);
  const verdict: ForceMotDePasse = points <= 2 ? 'FAIBLE' : points <= 5 ? 'MOYEN' : 'FORT';

  return { points, verdict };
}

/**
 * Indicateur de force du mot de passe — A3 §7.
 *
 * LA COULEUR NE SIGNALE RIEN ICI. A3 §11 l'exige (« avec texte, pas seulement une
 * couleur ») et la contrainte §12 de la Design-System-Specification interdit de faire
 * co-exister plusieurs couleurs saturées dans une vue : le trio rouge / orange / vert
 * est donc hors système, pas seulement déconseillé. La quantité est portée par le NOMBRE
 * de cellules remplies, le verdict par le mot. Deux signaux, aucun chromatique.
 *
 * Les cellules sont des carrés de 8pt séparés de 4pt, de largeur fixe : c'est la cadence
 * de cellule monospace du §02 (« monospace character cells create a mechanical, even
 * cadence »), pas une barre de progression étirée sur la largeur disponible.
 *
 * Remplissage CONTIGU, de gauche à droite : la barre lit un décompte, pas une grille de
 * cases indépendantes. Un remplissage à trous se lirait comme un composant cassé.
 *
 * L'annonce passe par `accessibilityValue.text` et non par une région live : le mot de
 * passe se tape caractère par caractère, une région live relancerait le lecteur d'écran
 * à chaque frappe. La valeur reste disponible dès que le champ prend le focus.
 *
 * Score anti-slop 0 — voir SLOP.md. Retenu le 02/08/2026 parmi trois propositions.
 */
export function PasswordStrengthMeter({ password }: { password: string }) {
  // A3 §7 : « Caché si vide ». Rien à mesurer, rien à annoncer.
  if (password.length === 0) return null;

  const { points, verdict } = evaluerForce(password);

  return (
    <View
      className="flex-row items-center gap-2"
      accessibilityRole="progressbar"
      accessibilityLabel="Force du mot de passe"
      accessibilityValue={{ text: `${verdict}, ${points} critères sur ${CRITERES.length}` }}
    >
      <View className="flex-row gap-1">
        {CRITERES.map((critere, i) => (
          <View
            key={critere.nom}
            // Rempli : `text-default`, l'encre du système. Vide : `divider`, le filet
            // décoratif — volontairement discret, il n'identifie aucun composant et
            // n'est donc pas soumis au 3:1 de WCAG 1.4.11.
            className={`h-2 w-2 ${i < points ? 'bg-text-default' : 'bg-divider'}`}
          />
        ))}
      </View>

      <Text variant="mono-meta" color="default">
        {verdict}
      </Text>
    </View>
  );
}
