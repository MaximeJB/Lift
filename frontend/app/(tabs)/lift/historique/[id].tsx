import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import {
  ApiError,
  NetworkError,
  type Exercise,
  type WorkoutSession,
  type WorkoutSet,
} from '../../../../src/shared/api';
import { Hairline } from '../../../../src/shared/components/primitives/Hairline';
import { Text } from '../../../../src/shared/components/primitives/Text';
import { ConfirmDialog } from '../../../../src/shared/components/ui/ConfirmDialog';
import { ErrorBanner } from '../../../../src/shared/components/ui/ErrorBanner';
import { Input } from '../../../../src/shared/components/ui/Input';
import { LoadingState } from '../../../../src/shared/components/ui/LoadingState';
import { ScreenHeader } from '../../../../src/shared/components/ui/ScreenHeader';
import { SectionHeader } from '../../../../src/shared/components/ui/SectionHeader';
import { TextLink } from '../../../../src/shared/components/ui/TextLink';
import { SetRow } from '../../../../src/workout/components/SetRow';
import { getExercise } from '../../../../src/workout/services/exercises.service';
import {
  deleteSession,
  deleteSet,
  getSession,
  listSessions,
  updateSession,
} from '../../../../src/workout/services/sessions.service';
import { recordsBattus, volume } from '../../../../src/workout/stats';

/** `1234.5` → `1 235 kg`. Une charge totale ne se lit pas au gramme près. */
function kilos(valeur: number): string {
  return `${Math.round(valeur).toLocaleString('fr-FR').replace(/ | /g, ' ')} kg`;
}

/** `2026-08-03` → `03/08/2026`, sans dépendre d'un formateur de locale. */
function dateLisible(iso: string): string {
  const [annee, mois, jour] = iso.split('-');
  return `${jour}/${mois}/${annee}`;
}

/**
 * C8 — Détail d'une séance passée.
 *
 * AUCUN NOUVEAU COMPOSANT, comme l'annonce C8 §7 : `SetRow` vient de C5, le relevé et la
 * suppression de C6, les formules de `stats.ts`.
 *
 * C8 §9 BR-1 : toute édition est persistée IMMÉDIATEMENT, sans bouton « Enregistrer »
 * global. C'est la différence de fond avec C6, où la sauvegarde est le geste qui clôt un
 * parcours. Ici on corrige une donnée mal saisie il y a trois jours ; attendre une
 * validation globale ferait perdre la correction au premier retour en arrière.
 *
 * DEUX ÉLÉMENTS DE LA SPEC SONT ABSENTS :
 *
 *   Photo — même dépendance qu'en C6 : ni champ, ni endpoint, ni stockage. Ticket
 *   `photo-de-seance-infrastructure-2026-08-02`.
 *
 *   Ajout d'exercice et saisie de nouvelles séries (§6) — le formulaire adaptatif suppose
 *   de connaître le `exercise_type` de chaque exercice de la séance, donc une requête par
 *   exercice avant de pouvoir afficher quoi que ce soit d'éditable. Les séries existantes
 *   sont consultables et supprimables ; en ajouter passe par C5. Signalé plutôt que
 *   bâclé.
 */
export default function DetailSeancePassee() {
  const { id, nom } = useLocalSearchParams<{ id: string; nom?: string }>();

  const [seance, setSeance] = useState<WorkoutSession | null>(null);
  const [anterieures, setAnterieures] = useState<WorkoutSet[]>([]);
  const [nomsExercices, setNomsExercices] = useState<Record<string, string>>({});

  const [titre, setTitre] = useState('');
  const [notes, setNotes] = useState('');

  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<{ message: string; reseau: boolean } | null>(null);
  const [confirmationSuppression, setConfirmationSuppression] = useState(false);
  const [serieASupprimer, setSerieASupprimer] = useState<WorkoutSet | null>(null);

  const charger = useCallback(async () => {
    if (!id) return;

    setChargement(true);
    setErreur(null);

    try {
      const courante = await getSession(id);
      setSeance(courante);
      setTitre(courante.title);
      setNotes(courante.notes);

      // L'historique EXCLUT la séance affichée : sans ça elle se comparerait à elle-même
      // et ne signalerait jamais aucun record.
      const historique = await listSessions();
      setAnterieures(historique.results.filter((s) => s.id !== courante.id).flatMap((s) => s.sets));

      // `SetSerializer` ne renvoie que l'UUID de l'exercice — correction backend
      // identifiée en Phase 5. Sans ces appels, l'écran afficherait des identifiants.
      const ids = [...new Set(courante.sets.map((s) => s.exercise))];
      const exercices = await Promise.all(ids.map((x) => getExercise(x).catch(() => null)));
      setNomsExercices(
        Object.fromEntries(
          exercices.filter((e): e is Exercise => e !== null).map((e) => [e.id, e.name]),
        ),
      );
    } catch (e) {
      setErreur({
        message: e instanceof ApiError ? e.message : 'Le serveur a rencontré un problème.',
        reseau: e instanceof NetworkError,
      });
    } finally {
      setChargement(false);
    }
  }, [id]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const series = seance?.sets ?? [];
  const seriesRetenues = series.filter((s) => !s.is_warmup);
  const records = seance ? recordsBattus(series, anterieures) : [];
  const exercicesIds = [...new Set(series.map((s) => s.exercise))];

  /**
   * C8 §9 BR-1 : persisté au blur du champ, pas à chaque frappe.
   *
   * Un PATCH par caractère saisi enverrait trente requêtes pour un titre. Le blur est le
   * moment où l'utilisateur a fini — c'est aussi celui où il quitte l'écran.
   */
  const enregistrerChamp = async (changements: { title?: string; notes?: string }) => {
    if (!seance) return;

    try {
      const maj = await updateSession(seance.id, changements);
      setSeance(maj);
    } catch (e) {
      setErreur({
        message: e instanceof ApiError ? e.message : 'Le serveur a rencontré un problème.',
        reseau: e instanceof NetworkError,
      });
    }
  };

  /** C8 §9 BR-3 : les stats se recalculent après toute modification de série. */
  const supprimerSerie = async (serie: WorkoutSet) => {
    setSerieASupprimer(null);

    try {
      await deleteSet(serie.id);
      setSeance((s) => (s ? { ...s, sets: s.sets.filter((x) => x.id !== serie.id) } : s));
    } catch (e) {
      setErreur({
        message: e instanceof ApiError ? e.message : 'Le serveur a rencontré un problème.',
        reseau: e instanceof NetworkError,
      });
    }
  };

  /** C8 §9 BR-2 : même mécanisme qu'en C6 — DELETE, avec cascade sur les séries. */
  const supprimerSeance = async () => {
    if (!seance) return;
    setConfirmationSuppression(false);

    try {
      await deleteSession(seance.id);
      router.back();
    } catch (e) {
      setErreur({
        message: e instanceof ApiError ? e.message : 'Le serveur a rencontré un problème.',
        reseau: e instanceof NetworkError,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface-page"
    >
      <ScrollView
        contentContainerClassName="gap-3 p-4"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <ScreenHeader
          title={seance?.title ?? nom ?? 'Séance'}
          leading={
            <TextLink onPress={() => router.back()} encadre>
              Retour
            </TextLink>
          }
          attributes={
            seance
              ? [
                  ['date', dateLisible(seance.date)],
                  ['durée', seance.duration_minutes !== null ? `${seance.duration_minutes} min` : '—'],
                ]
              : undefined
          }
        />

        {erreur ? (
          <ErrorBanner
            message={erreur.message}
            onRetry={erreur.reseau ? () => void charger() : undefined}
          />
        ) : null}

        {chargement ? (
          <LoadingState rows={5} />
        ) : seance ? (
          <>
            <Input
              label="Titre de la séance"
              value={titre}
              onChangeText={setTitre}
              // C6 §9 BR-5 appliqué ici aussi : un titre vidé revient au précédent plutôt
              // que d'écrire une chaîne vide en base.
              onBlur={() => void enregistrerChamp({ title: titre.trim() || seance.title })}
            />

            <SectionHeader>Relevé</SectionHeader>
            <View className="gap-1">
              {(
                [
                  ['volume', kilos(volume(series))],
                  ['séries', `${seriesRetenues.length}`],
                  ['exercices', `${exercicesIds.length}`],
                ] as const
              ).map(([cle, valeur]) => (
                <View key={cle} className="flex-row items-baseline justify-between py-1">
                  <Text variant="mono-meta" color="support">
                    {cle}
                  </Text>
                  <Text variant="mono-display">{valeur}</Text>
                </View>
              ))}
            </View>

            {records.length > 0 ? (
              <>
                <SectionHeader>Records</SectionHeader>
                {records.map((record) => (
                  <View
                    key={record.exerciceId}
                    className="flex-row items-baseline justify-between py-1"
                  >
                    <Text variant="body" className="flex-1">
                      {nomsExercices[record.exerciceId] ?? 'Exercice'}
                    </Text>
                    <Text variant="mono-dense">{`${Math.round(record.estime)} kg`}</Text>
                  </View>
                ))}
              </>
            ) : null}

            {/* Une section par exercice, dans l'ordre où ils ont été travaillés. Les séries
                arrivent déjà triées par `set_number` — le Meta du modèle le déclare. */}
            {exercicesIds.map((exerciceId) => (
              <View key={exerciceId}>
                <SectionHeader>{nomsExercices[exerciceId] ?? 'Exercice'}</SectionHeader>
                <Hairline />
                {series
                  .filter((s) => s.exercise === exerciceId)
                  .map((serie) => (
                    <View key={serie.id}>
                      <View className="flex-row items-center gap-3">
                        <View className="flex-1">
                          <SetRow
                            set={{
                              numero: serie.set_number,
                              poidsKg: serie.weight_kg,
                              reps: serie.reps,
                              dureeSecondes: serie.duration_seconds,
                              rpe: serie.rpe,
                              is_warmup: serie.is_warmup,
                              is_failure: serie.is_failure,
                            }}
                          />
                        </View>
                        <TextLink onPress={() => setSerieASupprimer(serie)} color="error">
                          Supprimer
                        </TextLink>
                      </View>
                      <Hairline />
                    </View>
                  ))}
              </View>
            ))}

            <SectionHeader>Notes</SectionHeader>
            <Input
              label="Note libre"
              value={notes}
              onChangeText={setNotes}
              onBlur={() => void enregistrerChamp({ notes: notes.trim() })}
              multiline
              numberOfLines={4}
            />

            {/* Écarté du reste : C6 §16 vaut ici aussi, un bouton destructif ne se place
                pas à portée d'un tap distrait. */}
            <View className="items-center pt-5">
              <TextLink onPress={() => setConfirmationSuppression(true)} color="error">
                Supprimer la séance
              </TextLink>
            </View>
          </>
        ) : null}
      </ScrollView>

      <ConfirmDialog
        visible={serieASupprimer !== null}
        title="suppression / série"
        message={
          serieASupprimer
            ? `Série ${serieASupprimer.set_number} — ${serieASupprimer.weight_kg} kg × ${serieASupprimer.reps}.`
            : ''
        }
        confirmLabel="Supprimer la série"
        onConfirm={() => serieASupprimer && void supprimerSerie(serieASupprimer)}
        onCancel={() => setSerieASupprimer(null)}
      />

      <ConfirmDialog
        visible={confirmationSuppression}
        title="suppression / séance"
        consequences={[
          ['séries', `${series.length}`],
          ['exercices', `${exercicesIds.length}`],
          ['volume', kilos(volume(series))],
        ]}
        message="La séance et toutes ses séries sont supprimées définitivement."
        confirmLabel="Supprimer la séance"
        onConfirm={() => void supprimerSeance()}
        onCancel={() => setConfirmationSuppression(false)}
      />
    </KeyboardAvoidingView>
  );
}
