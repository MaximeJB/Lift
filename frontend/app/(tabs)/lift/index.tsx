import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ConfirmDialog } from '../../../src/shared/components/ui/ConfirmDialog';
import { SegmentedControl } from '../../../src/shared/components/ui/SegmentedControl';
import { ExerciseLibrary } from '../../../src/workout/components/ExerciseLibrary';
import { SessionHistory } from '../../../src/workout/components/SessionHistory';
import { SessionStarter } from '../../../src/workout/components/SessionStarter';

const SEGMENTS = ['Séances', 'Historique', 'Exercices'] as const;

/**
 * Tab Lift — C3 (Séances), C7 (Historique), C1 (Exercices en mode Browse).
 *
 * Le SegmentedControl est le header PERSISTANT de ce tab, partagé par les trois écrans.
 * C'est la structure actée en Phase 1 de la spec, et corrigée en Phase 5 point 2 :
 * C1 en mode Browse passe par ce segment, ce n'est pas un tab autonome.
 *
 * C3 §6 : la transition entre segments est immédiate, sans rechargement réseau si le
 * segment a déjà été visité. Le montage conditionnel ci-dessous ne le garantit PAS
 * encore — changer de segment démonte la bibliothèque et lui fait tout recharger. Le
 * jour où les trois segments existent, l'état de chacun devra remonter ici ou dans un
 * cache. Signalé plutôt que résolu à l'avance : deux des trois n'ont pas de contenu.
 *
 * SQUELETTE pour Séances et Historique — leurs écrans arrivent aux étapes suivantes.
 */
export default function Lift() {
  /**
   * B1 §3 : « Voir l'historique » ouvre ce tab directement sur le bon segment. Le
   * paramètre n'est lu qu'au montage — changer de segment ensuite reste local, sinon
   * revenir de C8 ramènerait toujours l'utilisateur là où le lien l'avait envoyé.
   */
  const { segment: segmentDemande } = useLocalSearchParams<{ segment?: string }>();

  const [segment, setSegment] = useState<(typeof SEGMENTS)[number]>(() =>
    SEGMENTS.includes(segmentDemande as (typeof SEGMENTS)[number])
      ? (segmentDemande as (typeof SEGMENTS)[number])
      : 'Séances',
  );
  const [confirmationDemarrage, setConfirmationDemarrage] = useState(false);

  return (
    <View className="flex-1 gap-4 bg-surface-page p-4">
      <SegmentedControl segments={SEGMENTS} value={segment} onChange={setSegment} />

      {segment === 'Séances' ? (
        <SessionStarter
          /**
           * LA CONFIRMATION EST ICI, PAS DANS C5. Entrer dans C5 crée la séance et lance
           * le chronomètre — signalé le 03/08/2026 : on se retrouve avec une séance en
           * cours alors qu'on cherchait encore un exercice. Demander avant d'ouvrir
           * l'écran est le seul endroit où le refus ne laisse aucune trace en base.
           */
          onSeanceLibre={() => setConfirmationDemarrage(true)}
          onTemplate={(template) =>
            router.push({
              pathname: '/lift/template/[id]',
              params: { id: template.id, nom: template.name },
            })
          }
        />
      ) : null}

      {segment === 'Exercices' ? (
        <ExerciseLibrary
          // C1 §3, mode Browse : taper une ligne ouvre C2. Le nom voyage en paramètre
          // pour que l'en-tête du détail s'affiche AVANT la réponse du serveur — sans
          // lui, l'écran s'ouvrirait sur un titre vide le temps de la requête.
          onExercicePresse={(exercice) =>
            router.push({ pathname: '/lift/[id]', params: { id: exercice.id, nom: exercice.name } })
          }
        />
      ) : null}

      {segment === 'Historique' ? (
        <SessionHistory
          onSeancePressee={(seance) =>
            router.push({
              pathname: '/lift/historique/[id]',
              params: { id: seance.id, nom: seance.title },
            })
          }
          // C7 §8 : l'état vide renvoie vers C3. Ce n'est pas une navigation — les trois
          // segments vivent dans cet écran, il suffit de changer celui qui est actif.
          onDemarrer={() => setSegment('Séances')}
        />
      ) : null}

      {/*
        Le chronomètre part à la seconde où C5 s'ouvre, et la séance existe en base dès
        cet instant. Demander avant est donc la seule façon de ne rien créer quand la
        réponse est non.
      */}
      <ConfirmDialog
        visible={confirmationDemarrage}
        title="nouvelle séance"
        message="Le chronomètre démarre tout de suite. Tu pourras ajouter tes exercices au fur et à mesure."
        confirmLabel="Commencer"
        confirmVariant="primary"
        onConfirm={() => {
          setConfirmationDemarrage(false);
          router.push('/lift/seance');
        }}
        onCancel={() => setConfirmationDemarrage(false)}
      />
    </View>
  );
}
