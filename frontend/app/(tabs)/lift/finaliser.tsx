import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { ApiError, NetworkError, type WorkoutSession, type WorkoutSet } from '../../../src/shared/api';
import { Button } from '../../../src/shared/components/primitives/Button';
import { Text } from '../../../src/shared/components/primitives/Text';
import { ConfirmDialog } from '../../../src/shared/components/ui/ConfirmDialog';
import { ErrorBanner } from '../../../src/shared/components/ui/ErrorBanner';
import { Input } from '../../../src/shared/components/ui/Input';
import { LoadingState } from '../../../src/shared/components/ui/LoadingState';
import { ScreenHeader } from '../../../src/shared/components/ui/ScreenHeader';
import { SectionHeader } from '../../../src/shared/components/ui/SectionHeader';
import { TextLink } from '../../../src/shared/components/ui/TextLink';
import { getExercise } from '../../../src/workout/services/exercises.service';
import {
  deleteSession,
  getSession,
  listSessions,
  updateSession,
} from '../../../src/workout/services/sessions.service';
import { dureeEnMinutes, recordsBattus, volume, type RecordBattu } from '../../../src/workout/stats';

/**
 * Instant courant en ISO 8601. `end_time` est un `DateTimeField`, pas un `TimeField` —
 * une heure seule est refusée par DRF. Même piège qu'en C5, voir `maintenantISO` là-bas.
 */
function maintenantISO(): string {
  return new Date().toISOString();
}

/** `1234.5` → `1 235 kg`. Une charge totale ne se lit pas au gramme près. */
function kilos(valeur: number): string {
  return `${Math.round(valeur).toLocaleString('fr-FR').replace(/ | /g, ' ')} kg`;
}

/**
 * C6 — Finaliser la séance.
 *
 * LA SECTION PHOTO EST ABSENTE, et ce n'est pas un choix de mise en page. C6 §15 la
 * qualifie de « nouvelle dépendance backend bloquante » : `WorkoutSession` n'a aucun champ
 * `photo`, aucun endpoint d'upload n'existe, et aucun stockage de fichiers n'est configuré.
 * Trois briques manquantes, dont deux d'infrastructure.
 *
 * LE PR SE CALCULE CONTRE L'HISTORIQUE. Trois requêtes au chargement : la séance, les
 * séances antérieures pour connaître les records, et le nom des exercices concernés —
 * `SetSerializer` ne renvoie que l'UUID de l'exercice, correction backend déjà identifiée
 * en Phase 5 de la spec. Sans les noms, l'encart PR afficherait des identifiants.
 */
export default function Finaliser() {
  const { seance: seanceId } = useLocalSearchParams<{ seance?: string }>();

  const [seance, setSeance] = useState<WorkoutSession | null>(null);
  const [anterieures, setAnterieures] = useState<WorkoutSet[]>([]);
  const [nomsExercices, setNomsExercices] = useState<Record<string, string>>({});

  const [titre, setTitre] = useState('');
  const [notes, setNotes] = useState('');

  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState<{ message: string; reseau: boolean } | null>(null);
  const [confirmationSuppression, setConfirmationSuppression] = useState(false);

  const charger = useCallback(async () => {
    if (!seanceId) return;

    setChargement(true);
    setErreur(null);

    try {
      const courante = await getSession(seanceId);
      setSeance(courante);
      setTitre(courante.title);
      setNotes(courante.notes);

      /**
       * L'historique EXCLUT la séance en cours : sans ça elle se comparerait à elle-même
       * et ne battrait jamais aucun record.
       *
       * Une seule page suffit tant que l'historique est court. Le jour où il dépassera 25
       * séances, ce calcul devra passer côté serveur — un record ne se cherche pas en
       * téléchargeant tout.
       */
      const historique = await listSessions();
      setAnterieures(
        historique.results.filter((s) => s.id !== courante.id).flatMap((s) => s.sets),
      );

      const ids = [...new Set(courante.sets.map((s) => s.exercise))];
      const exercices = await Promise.all(
        ids.map((id) => getExercise(id).catch(() => null)),
      );
      setNomsExercices(
        Object.fromEntries(
          exercices.filter((e) => e !== null).map((e) => [e.id, e.name]),
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
  }, [seanceId]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const series = seance?.sets ?? [];
  const seriesRetenues = series.filter((s) => !s.is_warmup);
  const exercicesTravailles = new Set(series.map((s) => s.exercise)).size;
  const duree = seance ? dureeEnMinutes(seance.start_time) : null;
  const records: RecordBattu[] = seance ? recordsBattus(series, anterieures) : [];

  /**
   * C6 §9 BR-1 : `title`, `notes`, `end_time` et `duration_minutes` partent ensemble.
   * BR-5 : un titre vidé revient SILENCIEUSEMENT au titre auto-généré. Bloquer
   * l'enregistrement sur un champ vide punirait un utilisateur qui vient de s'entraîner
   * pour une broutille.
   */
  const enregistrer = async () => {
    if (!seance || enregistrement) return;

    setEnregistrement(true);
    setErreur(null);

    try {
      await updateSession(seance.id, {
        title: titre.trim() || seance.title,
        notes: notes.trim(),
        end_time: maintenantISO(),
        duration_minutes: duree,
      });

      /**
       * VIDER LA PILE DU TAB LIFT AVANT DE PARTIR.
       *
       * `router.replace('/')` change d'onglet mais ne touche pas à la pile interne de
       * Lift : C5 et C6 y restent empilés. Revenir sur l'onglet Lift rouvrait donc l'écran
       * de finalisation d'une séance déjà enregistrée, qui proposait de l'enregistrer une
       * seconde fois. Constaté le 03/08/2026.
       *
       * `dismissAll` ramène la pile à `/lift`, où l'historique montre la séance finalisée.
       */
      router.dismissAll();
      // C6 §3 : « Enregistrer la séance » → B1.
      router.replace('/');
    } catch (e) {
      setErreur({
        message: e instanceof ApiError ? e.message : 'Le serveur a rencontré un problème.',
        reseau: e instanceof NetworkError,
      });
    } finally {
      setEnregistrement(false);
    }
  };

  /** C6 §9 BR-4 : DELETE, avec cascade sur les séries. Irréversible côté serveur. */
  const annuler = async () => {
    if (!seance) return;

    setConfirmationSuppression(false);
    setEnregistrement(true);

    try {
      await deleteSession(seance.id);
      // Même raison qu'à l'enregistrement : sans ça, la pile garde un écran qui pointe
      // vers une séance qui n'existe plus.
      router.dismissAll();
      router.replace('/');
    } catch (e) {
      setErreur({
        message: e instanceof ApiError ? e.message : 'Le serveur a rencontré un problème.',
        reseau: e instanceof NetworkError,
      });
    } finally {
      setEnregistrement(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface-page"
    >
      <ScrollView contentContainerClassName="gap-3 p-4" keyboardShouldPersistTaps="handled">
        <ScreenHeader
          title="Séance terminée"
          // C6 §4 : le retour vers C5 reste possible — la séance existe en base mais n'est
          // pas finalisée, on peut encore aller logguer une série oubliée.
          leading={<TextLink onPress={() => router.back()}>Retour</TextLink>}
        />

        {erreur ? (
          <ErrorBanner
            message={erreur.message}
            onRetry={erreur.reseau ? () => void charger() : undefined}
          />
        ) : null}

        {chargement ? (
          <LoadingState rows={4} />
        ) : seance ? (
          <>
            <Input
              label="Titre de la séance"
              value={titre}
              onChangeText={setTitre}
              editable={!enregistrement}
              // BR-5 : vidé, il reprendra le titre auto-généré à l'enregistrement. Le
              // placeholder le dit plutôt que de laisser croire à un champ obligatoire.
              placeholder={seance.title}
            />

            <SectionHeader>Relevé</SectionHeader>

            {/*
              Registre codé, en colonne label/valeur — §01 : « terse, uppercase, coded ».
              Le volume est la mesure qui distingue ce produit de ses concurrents, il est
              donc en tête, dans la voix des chiffres mis en avant.
            */}
            <View className="gap-1">
              {(
                [
                  ['volume', kilos(volume(series))],
                  ['durée', duree !== null ? `${duree} min` : '—'],
                  ['séries', `${seriesRetenues.length}`],
                  ['exercices', `${exercicesTravailles}`],
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

            {/*
              C6 §11 : les records sont annoncés en priorité au lecteur d'écran. C'est la
              seule information de cet écran qui mérite d'interrompre — le reste est un
              constat, un record est un événement.

              C6 §6 : encart caché s'il n'y en a aucun. Pas de « aucun PR aujourd'hui » :
              la spec ne le demande pas, et ce serait un reproche déguisé.
            */}
            {records.length > 0 ? (
              <>
                <SectionHeader>Records battus</SectionHeader>
                <View className="gap-1" accessibilityLiveRegion="assertive">
                  {records.map((record) => (
                    <View
                      key={record.exerciceId}
                      className="flex-row items-baseline justify-between py-1"
                    >
                      <Text variant="body" className="flex-1">
                        {nomsExercices[record.exerciceId] ?? 'Exercice'}
                      </Text>
                      <Text variant="mono-dense">
                        {`${Math.round(record.estime)} kg`}
                      </Text>
                      <Text variant="mono-meta" color="support" className="pl-3">
                        {record.precedent > 0 ? `+${Math.round(record.estime - record.precedent)}` : 'premier'}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null}

            <SectionHeader>Notes</SectionHeader>
            <Input
              label="Note libre"
              value={notes}
              onChangeText={setNotes}
              editable={!enregistrement}
              multiline
              numberOfLines={4}
            />

            <View className="pt-2">
              <Button onPress={() => void enregistrer()} loading={enregistrement}>
                Enregistrer la séance
              </Button>
            </View>

            {/*
              C6 §16 : « ne pas placer le bouton d'annulation de façon à risquer un tap
              accidentel ». D'où l'écart, et un lien de texte plutôt qu'un bouton — il ne
              se tape pas au même geste que le primaire.
            */}
            <View className="items-center pt-5">
              <TextLink onPress={() => setConfirmationSuppression(true)} color="error">
                Annuler la séance
              </TextLink>
            </View>
          </>
        ) : null}
      </ScrollView>

      <ConfirmDialog
        visible={confirmationSuppression}
        title="suppression / séance"
        // Ce que le dialogue DOIT dire, c'est ce qui disparaît, chiffré. « Action
        // irréversible » sans le nombre de séries ne renseigne personne.
        consequences={[
          ['séries', `${series.length}`],
          ['exercices', `${exercicesTravailles}`],
          ['volume', kilos(volume(series))],
        ]}
        message="La séance et toutes ses séries sont supprimées définitivement."
        confirmLabel="Supprimer la séance"
        onConfirm={() => void annuler()}
        onCancel={() => setConfirmationSuppression(false)}
      />
    </KeyboardAvoidingView>
  );
}
