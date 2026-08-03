import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import { ApiError, type Exercise, type WorkoutSession } from '../../src/shared/api';
import { Button } from '../../src/shared/components/primitives/Button';
import { EmptyState } from '../../src/shared/components/ui/EmptyState';
import { ErrorBanner } from '../../src/shared/components/ui/ErrorBanner';
import { LoadingState } from '../../src/shared/components/ui/LoadingState';
import { ScreenHeader } from '../../src/shared/components/ui/ScreenHeader';
import { SectionHeader } from '../../src/shared/components/ui/SectionHeader';
import { StatTile } from '../../src/shared/components/ui/StatTile';
import { TextLink } from '../../src/shared/components/ui/TextLink';
import { useAuth } from '../../src/shared/context/AuthContext';
import { getExercise } from '../../src/workout/services/exercises.service';
import { listSessions } from '../../src/workout/services/sessions.service';
import {
  debutDeSemaine,
  recordsRecents,
  seancesEntre,
  variationPourCent,
  volume,
  type RecordRecent,
} from '../../src/workout/stats';

/** `12450` → `12 450 kg`. B1 §11 : la valeur est annoncée AVEC son unité. */
function kilos(valeur: number): string {
  return `${Math.round(valeur).toLocaleString('fr-FR').replace(/ | /g, ' ')} kg`;
}

/** `2026-08-03` → `03/08`. L'année n'apporte rien sur un record récent. */
function jourEtMois(iso: string): string {
  const [, mois, jour] = iso.split('-');
  return `${jour}/${mois}`;
}

/**
 * B1 — Accueil.
 *
 * LES DEUX ENDPOINTS DE STATISTIQUES N'EXISTENT PAS. `GET /api/lift/stats/weekly/` et
 * `/api/lift/stats/prs/` sont listés « bloquants » en Phase 5 de la spec. Tout est donc
 * calculé ICI, à partir de `listSessions` et des formules de `stats.ts` — les mêmes qu'en
 * C6 et C8, ce que le tableau de traçabilité de la Phase 5 exige.
 *
 * LA LIMITE EST CONNUE : une page de 25 séances. Pour la semaine courante c'est très
 * large ; pour les records, un plus ancien que ces 25 séances sortirait de la fenêtre et
 * serait « rebattu » à tort. Le calcul devra passer côté serveur quand l'historique
 * grandira — un record ne se cherche pas en téléchargeant tout.
 *
 * B1 §9 BR-6 : le bouton « Démarrer une séance » est rendu AVANT tout état de chargement
 * ou d'erreur, et reste actif quoi qu'il arrive aux statistiques. §8 le confirme :
 * « Error (bannière discrète, CTA reste utilisable) ».
 */
export default function Accueil() {
  const { session } = useAuth();

  const [seances, setSeances] = useState<WorkoutSession[]>([]);
  const [nomsExercices, setNomsExercices] = useState<Record<string, string>>({});
  const [chargement, setChargement] = useState(true);
  const [rafraichissement, setRafraichissement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setErreur(null);

    try {
      const page = await listSessions();
      setSeances(page.results);

      /**
       * Les noms des exercices concernés par un record. `SetSerializer` ne renvoie que
       * l'UUID — correction backend identifiée en Phase 5. Cinq appels au maximum, et
       * une défaillance n'empêche pas l'écran de s'afficher : la carte porterait
       * « Exercice » plutôt que rien.
       */
      const ids = recordsRecents(page.results).map((r) => r.exerciceId);
      const exercices = await Promise.all(ids.map((id) => getExercise(id).catch(() => null)));
      setNomsExercices(
        Object.fromEntries(
          exercices.filter((e): e is Exercise => e !== null).map((e) => [e.id, e.name]),
        ),
      );
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Le serveur a rencontré un problème.');
    } finally {
      setChargement(false);
      setRafraichissement(false);
    }
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  // B1 §9 BR-1 : semaine calendaire courante, lundi → dimanche.
  const lundi = debutDeSemaine();
  const lundiProchain = new Date(lundi);
  lundiProchain.setDate(lundiProchain.getDate() + 7);
  const lundiPrecedent = new Date(lundi);
  lundiPrecedent.setDate(lundiPrecedent.getDate() - 7);

  const cetteSemaine = seancesEntre(seances, lundi, lundiProchain);
  const semainePrecedente = seancesEntre(seances, lundiPrecedent, lundi);

  const volumeSemaine = cetteSemaine.reduce((total, s) => total + volume(s.sets), 0);
  const volumePrecedent = semainePrecedente.reduce((total, s) => total + volume(s.sets), 0);
  const variation = variationPourCent(volumeSemaine, volumePrecedent);

  const records: RecordRecent[] = recordsRecents(seances);

  const pseudo = session.status === 'authenticated' ? session.user.pseudo : null;

  /**
   * B1 §6 : salutation adaptative. Le premier cas ne s'adresse qu'à quelqu'un qui n'a
   * jamais rien enregistré — après une seule séance, la question n'a plus de sens.
   */
  const salutation =
    !chargement && seances.length === 0 ? 'Prêt pour ta première séance ?' : 'Ta semaine';

  return (
    <View className="flex-1 bg-surface-page p-4">
      <ScreenHeader title={salutation} subtitle={pseudo ?? undefined} />

      <ScrollView
        contentContainerClassName="gap-3 pb-4"
        refreshControl={
          <RefreshControl
            refreshing={rafraichissement}
            onRefresh={() => {
              setRafraichissement(true);
              void charger();
            }}
          />
        }
      >
        {/* B1 §9 BR-6 : hors de toute branche conditionnelle. Si les statistiques
            échouent, on peut toujours s'entraîner. */}
        <Button onPress={() => router.push('/lift')}>Démarrer une séance</Button>

        {erreur ? <ErrorBanner message={erreur} onRetry={() => void charger()} /> : null}

        {chargement ? (
          <LoadingState rows={3} />
        ) : (
          <>
            {/* Deux tuiles côte à côte, de largeur égale. B1 §9 BR-3 : la variation est
                absente — pas à zéro — quand la semaine précédente ne vaut rien. */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <StatTile
                  label="Volume cette semaine"
                  value={kilos(volumeSemaine)}
                  delta={
                    variation !== null
                      ? `${variation >= 0 ? '+' : ''}${Math.round(variation)} % vs semaine passée`
                      : undefined
                  }
                />
              </View>
              <View className="flex-1">
                <StatTile label="Séances" value={`${cetteSemaine.length}`} />
              </View>
            </View>

            <SectionHeader>Records récents</SectionHeader>

            {records.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                // `grow-0` : sans lui, un ScrollView horizontal s'étire sur toute la
                // hauteur disponible et laisse une bande vide sous les cartes.
                className="grow-0"
                contentContainerClassName="flex-row gap-5"
              >
                {records.map((record) => (
                  <StatTile
                    key={record.exerciceId}
                    label={nomsExercices[record.exerciceId] ?? 'Exercice'}
                    value={`${Math.round(record.estime)} kg`}
                    delta={jourEtMois(record.date)}
                    // B1 §3 : tap sur une PR-card → C2.
                    onPress={() =>
                      router.push({
                        pathname: '/lift/[id]',
                        params: {
                          id: record.exerciceId,
                          nom: nomsExercices[record.exerciceId] ?? '',
                        },
                      })
                    }
                  />
                ))}
              </ScrollView>
            ) : (
              <EmptyState
                title="Aucun record pour l'instant"
                description="Ils apparaîtront ici dès qu'une série dépassera ton meilleur résultat sur un exercice."
              />
            )}

            <View className="items-center pt-3">
              {/* B1 §3 : « Voir l'historique » → C7. Le segment voyage en paramètre, le
                  tab Lift s'ouvre donc directement sur le bon. */}
              <TextLink
                onPress={() => router.push({ pathname: '/lift', params: { segment: 'Historique' } })}
              >
                Voir tout l&apos;historique
              </TextLink>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
