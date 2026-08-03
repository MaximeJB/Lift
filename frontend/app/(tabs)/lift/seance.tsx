import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ApiError,
  NetworkError,
  type Exercise,
  type WorkoutSession,
} from '../../../src/shared/api';
import { Button } from '../../../src/shared/components/primitives/Button';
import { Hairline } from '../../../src/shared/components/primitives/Hairline';
import { Text } from '../../../src/shared/components/primitives/Text';
import { ConfirmDialog } from '../../../src/shared/components/ui/ConfirmDialog';
import { ErrorBanner } from '../../../src/shared/components/ui/ErrorBanner';
import { LoadingState } from '../../../src/shared/components/ui/LoadingState';
import { ScreenHeader } from '../../../src/shared/components/ui/ScreenHeader';
import { SectionHeader } from '../../../src/shared/components/ui/SectionHeader';
import { TextLink } from '../../../src/shared/components/ui/TextLink';
import { ExerciseLibrary } from '../../../src/workout/components/ExerciseLibrary';
import {
  RestTimerWidget,
  SECONDES_PAR_CELLULE,
} from '../../../src/workout/components/RestTimerWidget';
import { SetInputForm, type SaisieSerie } from '../../../src/workout/components/SetInputForm';
import { SetRow, type LoggedSet } from '../../../src/workout/components/SetRow';
import {
  createSession,
  createSet,
  listSessions,
  updateSet,
  type CreateSetInput,
} from '../../../src/workout/services/sessions.service';
import { meilleurParExercice, unRepMaxDe } from '../../../src/workout/stats';

/**
 * C5 §9 BR-4 : durée par défaut du repos en séance libre.
 *
 * Depuis un template, elle viendrait de `TemplateExercise.rest_seconds`. Aucun template
 * n'existe en base au 02/08/2026 — ce chemin sera branché avec C4.
 */
const REPOS_PAR_DEFAUT = 90;

/** `12:34` sous l'heure, `1:02:03` au-delà. Le zéro de tête ne sert à rien en minutes. */
function chrono(secondes: number): string {
  const s = Math.max(0, Math.floor(secondes));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);

  const mm = String(m).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');

  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

/** Format `AAAA-MM-JJ` attendu par Django, sans dépendre d'un formateur de locale. */
function dateDuJour(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Instant courant en ISO 8601, avec la date ET le fuseau.
 *
 * `WorkoutSession.start_time` est un `DateTimeField`, pas un `TimeField` — le nom trompe.
 * Une heure seule (`14:32:05`) est refusée par DRF avec « Datetime has wrong format », et
 * la création de séance échouait avant même que l'utilisateur ait touché quoi que ce soit.
 * Constaté le 03/08/2026 au premier essai sur appareil.
 */
function maintenantISO(): string {
  return new Date().toISOString();
}

/**
 * Une série à l'écran, qu'elle soit confirmée par le serveur ou non.
 *
 * `payload` est conservé pour pouvoir RENVOYER la série telle quelle après une coupure
 * réseau : le reconstruire depuis l'affichage perdrait les notes et les drapeaux.
 */
type SerieLocale = LoggedSet & {
  /** Clé React stable, posée à la création optimiste. L'identifiant serveur arrive après. */
  cle: string;
  idServeur?: string;
  payload: CreateSetInput;
};

/** Repos en cours. `debut` sert à mesurer le temps RÉELLEMENT écoulé — C5 §9 BR-5. */
type Repos = {
  exerciceId: string;
  /** Série que ce repos suit, et sur laquelle la durée sera patchée. */
  cle: string;
  /** Durée visée, ajustable en direct par tranches de 15 secondes. */
  total: number;
  debut: number;
};

/**
 * C5 — Séance en cours.
 *
 *   LOT 1   création de la séance, en-tête et chrono, ajout d'exercices, sortie protégée.
 *   LOT 2, celui-ci   enregistrement des séries, en écriture optimiste.
 *   LOT 3, à venir    RestTimerWidget, et le PATCH du repos réellement écoulé (§9 BR-5).
 *
 * ÉCRITURE OPTIMISTE — C5 §14 : « écriture optimiste avec rollback visuel en cas d'erreur
 * serveur ». La série s'affiche AVANT la réponse. Les deux échecs sont traités
 * différemment, et c'est ce que la spec demande :
 *
 *   réseau (§11)  la ligne RESTE, marquée NON SYNC, et la bannière propose de renvoyer.
 *                 Perdre une série parce que le Wi-Fi de la salle a lâché serait le pire
 *                 défaut possible de cet écran.
 *   refus serveur la ligne est RETIRÉE. La donnée a été examinée et rejetée : la garder
 *                 à l'écran ferait croire à un enregistrement qui n'aura jamais lieu.
 */
export default function Seance() {
  const { template, nom } = useLocalSearchParams<{ template?: string; nom?: string }>();

  const [seance, setSeance] = useState<WorkoutSession | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<{ message: string; reseau: boolean } | null>(null);

  /** Exercices présents dans la séance. Hors template, ils viennent tous du modal C1. */
  const [exercices, setExercices] = useState<Exercise[]>([]);
  /** Séries par identifiant d'exercice, dans l'ordre où elles ont été loguées. */
  const [series, setSeries] = useState<Record<string, SerieLocale[]>>({});

  const [repos, setRepos] = useState<Repos | null>(null);

  /**
   * Meilleur 1RM estimé connu par exercice, avant cette séance.
   *
   * Chargé une fois au démarrage. Il monte au fil de la séance : battre son record deux
   * fois de suite doit signaler DEUX records, mais un troisième set plus léger ne doit
   * plus rien signaler.
   */
  const [recordsConnus, setRecordsConnus] = useState<Map<string, number>>(new Map());

  /**
   * Vrai seulement si l'historique a REELLEMENT ete lu.
   *
   * Sans ce drapeau, un historique injoignable laisse la carte vide, donc tout meilleur
   * connu vaut 0, donc la premiere serie venue bat un record. Signale par un test le
   * 03/08/2026 : mieux vaut ne rien annoncer qu'annoncer un faux record.
   */
  const [recordsUtilisables, setRecordsUtilisables] = useState(false);

  const [choixOuvert, setChoixOuvert] = useState(false);
  const [confirmationSortie, setConfirmationSortie] = useState(false);

  /**
   * Instant de départ, en horodatage JS.
   *
   * PAS `start_time` de la réponse : c'est une heure locale sans date (`14:32:05`), et la
   * reconstruire en `Date` obligerait à supposer le fuseau du serveur. L'écart entre deux
   * horodatages JS est juste, y compris si l'app passe en arrière-plan.
   */
  const departRef = useRef<number | null>(null);
  const [maintenant, setMaintenant] = useState(() => Date.now());

  /**
   * C5 §9 BR-7 : titre généré à la création, non modifiable ici — C6 s'en charge.
   * Une séance libre porte sa date, sans quoi l'historique afficherait dix lignes
   * « Séance libre » indiscernables.
   */
  const demarrer = useCallback(async () => {
    setChargement(true);
    setErreur(null);

    try {
      const creee = await createSession({
        title: nom ?? `Séance libre — ${dateDuJour()}`,
        template: template ?? null,
        date: dateDuJour(),
        start_time: maintenantISO(),
      });

      departRef.current = Date.now();
      setSeance(creee);

      /**
       * Les records antérieurs, pour pouvoir signaler un PR À LA VALIDATION.
       *
       * Volontairement APRÈS la création et sans bloquer : une séance doit pouvoir
       * démarrer même si l'historique ne répond pas. Sans lui, tout premier chargement
       * d'un exercice compterait comme un record — d'où le silence en cas d'échec.
       */
      try {
        const historique = await listSessions();
        setRecordsConnus(
          meilleurParExercice(
            historique.results.filter((s) => s.id !== creee.id).flatMap((s) => s.sets),
          ),
        );
        setRecordsUtilisables(true);
      } catch {
        // Historique indisponible : aucun record ne sera signalé de la séance. Mieux vaut
        // ne rien annoncer qu'annoncer un record qui n'en est pas un.
      }
    } catch (e) {
      setErreur({
        message: e instanceof ApiError ? e.message : 'Le serveur a rencontré un problème.',
        reseau: e instanceof NetworkError,
      });
    } finally {
      setChargement(false);
    }
  }, [nom, template]);

  useEffect(() => {
    void demarrer();
  }, [demarrer]);

  /**
   * Le chrono avance d'une seconde. Il ne tourne QUE si la séance existe : sur un écran
   * en erreur, un compteur qui défile laisserait croire qu'une séance est en cours.
   */
  useEffect(() => {
    if (!seance) return;

    const battement = setInterval(() => setMaintenant(Date.now()), 1000);
    return () => clearInterval(battement);
  }, [seance]);

  const ecoule = departRef.current ? (maintenant - departRef.current) / 1000 : 0;

  const toutesLesSeries = Object.values(series).flat();
  const enAttente = toutesLesSeries.filter((s) => s.enAttente);

  /**
   * Le restant se DÉDUIT de l'horloge, il ne se décrémente pas.
   *
   * Un compteur qu'on diminue d'une unité par tick dérive dès que l'app passe en
   * arrière-plan ou qu'un rendu saute. La différence entre deux horodatages, elle, reste
   * juste. `maintenant` est déjà rafraîchi chaque seconde par le chrono de la séance —
   * un seul battement pour les deux.
   */
  const restantRepos = repos
    ? Math.max(0, repos.total - Math.round((maintenant - repos.debut) / 1000))
    : 0;

  /** Remplace une série identifiée par sa clé, sans toucher aux autres exercices. */
  const majSerie = (exerciceId: string, cle: string, changements: Partial<SerieLocale>) => {
    setSeries((etat) => ({
      ...etat,
      [exerciceId]: (etat[exerciceId] ?? []).map((s) => (s.cle === cle ? { ...s, ...changements } : s)),
    }));
  };

  const retirerSerie = (exerciceId: string, cle: string) => {
    setSeries((etat) => ({
      ...etat,
      [exerciceId]: (etat[exerciceId] ?? []).filter((s) => s.cle !== cle),
    }));
  };

  /** Envoie une série déjà affichée. Sert à la création comme au renvoi après coupure. */
  const envoyer = async (exerciceId: string, serie: SerieLocale) => {
    try {
      const creee = await createSet(serie.payload);
      majSerie(exerciceId, serie.cle, { idServeur: creee.id, enAttente: false });
      setErreur(null);
    } catch (e) {
      if (e instanceof NetworkError) {
        setErreur({ message: e.message, reseau: true });
        return;
      }

      retirerSerie(exerciceId, serie.cle);
      setErreur({
        message: e instanceof ApiError ? e.message : 'Le serveur a rencontré un problème.',
        reseau: false,
      });
    }
  };

  /**
   * Clôt le repos en cours et enregistre sa durée réelle — C5 §9 BR-5 : « le temps de
   * repos réellement écoulé est enregistré via PATCH sur la série qui vient d'être
   * complétée ».
   *
   * La durée envoyée est le temps d'HORLOGE, pas la durée visée : c'est bien le repos pris
   * qui intéresse, pas celui qui était prévu. Un `+15 s` tapé sans attendre ne le change
   * donc pas.
   *
   * Deux silences assumés. Une série pas encore synchronisée n'a pas d'identifiant serveur,
   * il n'y a rien à patcher — le repos est perdu, pas la série. Et un échec de ce PATCH
   * n'affiche rien : le temps de repos est une métadonnée, interrompre une séance pour ça
   * serait disproportionné.
   */
  const cloturerRepos = async (courant: Repos | null) => {
    if (!courant) return;

    const ecoule = Math.round((Date.now() - courant.debut) / 1000);
    setRepos(null);

    const serie = (series[courant.exerciceId] ?? []).find((s) => s.cle === courant.cle);
    if (!serie?.idServeur) return;

    try {
      await updateSet(serie.idServeur, { rest_seconds: ecoule });
    } catch {
      // Volontairement muet — voir ci-dessus.
    }
  };

  /** Le repos s'arrête de lui-même à zéro, et la durée part sans intervention. */
  useEffect(() => {
    if (repos && restantRepos === 0) void cloturerRepos(repos);
    // `cloturerRepos` lit `series` à l'appel ; l'inclure ici relancerait l'effet à chaque
    // série loguée, alors que seul le passage à zéro doit le déclencher.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repos, restantRepos]);

  const logguer = async (exercice: Exercise, saisie: SaisieSerie) => {
    if (!seance) return;

    // C5 §16 : « ne jamais bloquer la validation d'une nouvelle série parce que le timer
    // précédent est encore actif ». Le repos en cours est clos, pas opposé à l'utilisateur.
    await cloturerRepos(repos);

    const dejaLa = series[exercice.id] ?? [];
    // C5 §9 BR-3 : auto-incrémenté par le client, par exercice, jamais saisi.
    const numero = dejaLa.length + 1;

    /**
     * B1 §9 BR-4 : 1RM estimé par la formule d'Epley, la même qu'en B1, C6 et C8.
     *
     * Un échauffement ne peut pas produire de record — même règle que dans `stats.ts`,
     * sinon un jour de décharge ferait tomber des PR absurdes.
     */
    const estime = unRepMaxDe(saisie.poidsKg, saisie.reps);
    const meilleurConnu = recordsConnus.get(exercice.id) ?? 0;
    const record =
      recordsUtilisables && !saisie.is_warmup && estime > 0 && estime > meilleurConnu;

    if (record) {
      setRecordsConnus((connus) => new Map(connus).set(exercice.id, estime));
    }

    const payload: CreateSetInput = {
      workout_session: seance.id,
      exercise: exercice.id,
      set_number: numero,
      /**
       * `weight_kg` et `reps` ne sont PAS nullables sur le modèle `Set`. Un exercice en
       * durée n'a ni l'un ni l'autre : on envoie des zéros faute de mieux. C'est une
       * limite du backend, signalée — elle faussera tout calcul de volume total.
       */
      weight_kg: saisie.poidsKg ?? '0',
      reps: saisie.reps ?? 0,
      rpe: saisie.rpe,
      duration_seconds: saisie.dureeSecondes,
      notes: saisie.notes,
      is_warmup: saisie.is_warmup,
      is_failure: saisie.is_failure,
    };

    const optimiste: SerieLocale = {
      cle: `${exercice.id}-${numero}-${Date.now()}`,
      numero,
      poidsKg: saisie.poidsKg,
      reps: saisie.reps,
      dureeSecondes: saisie.dureeSecondes,
      rpe: saisie.rpe,
      is_warmup: saisie.is_warmup,
      is_failure: saisie.is_failure,
      record,
      enAttente: true,
      payload,
    };

    setSeries((etat) => ({ ...etat, [exercice.id]: [...dejaLa, optimiste] }));

    /**
     * C5 §9 BR-4 : le repos démarre À LA VALIDATION, avant même que le serveur ait
     * répondu. Une coupure réseau ne doit pas retarder le chronomètre — c'est le corps qui
     * récupère, pas la requête.
     *
     * Une série d'échauffement démarre aussi un repos : la spec ne fait pas d'exception, et
     * on souffle après un échauffement lourd comme après une série de travail.
     */
    setRepos({
      exerciceId: exercice.id,
      cle: optimiste.cle,
      total: REPOS_PAR_DEFAUT,
      debut: Date.now(),
    });

    await envoyer(exercice.id, optimiste);
  };

  /** Renvoie toutes les séries restées en attente, dans l'ordre où elles ont été loguées. */
  const renvoyerLesEnAttente = async () => {
    for (const [exerciceId, liste] of Object.entries(series)) {
      for (const serie of liste.filter((s) => s.enAttente)) {
        await envoyer(exerciceId, serie);
      }
    }
  };

  /** C5 §11 : sortie libre tant qu'aucune série n'est loguée, confirmation ensuite. */
  const quitter = () => {
    if (toutesLesSeries.length > 0) {
      setConfirmationSortie(true);
      return;
    }
    router.back();
  };

  const ajouter = (exercice: Exercise) => {
    setExercices((liste) => (liste.some((e) => e.id === exercice.id) ? liste : [...liste, exercice]));
    setChoixOuvert(false);
  };

  return (
    <KeyboardAvoidingView
      // C5 §13 : « KeyboardAvoidingView critique ici vu la fréquence de saisie ».
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface-page"
    >
      <View className="flex-1 p-4">
        <ScreenHeader
          title={seance?.title ?? nom ?? 'Séance'}
          // C5 §4 : pas de bouton retour classique pendant une séance active. Le libellé
          // dit ce qu'il fait — on quitte une séance, on ne « revient » pas d'un écran.
          leading={
            <TextLink onPress={quitter} encadre>
              Quitter
            </TextLink>
          }
          // C5 §9 BR-6 : « Terminer » ne fait QU'UNE navigation vers C6. Aucune écriture.
          trailing={
            seance ? (
              <TextLink
                encadre
                onPress={() =>
                  router.push({ pathname: '/lift/finaliser', params: { seance: seance.id } })
                }
              >
                Terminer
              </TextLink>
            ) : undefined
          }
          attributes={
            seance
              ? [
                  ['écoulé', chrono(ecoule)],
                  ['séries', String(toutesLesSeries.length)],
                  ...(enAttente.length > 0
                    ? ([['non synchronisées', String(enAttente.length)]] as const)
                    : []),
                ]
              : undefined
          }
        />

        {erreur ? (
          <ErrorBanner
            message={erreur.message}
            // Réessayer n'a de sens que sur une coupure : une donnée refusée le sera
            // encore. Au démarrage il n'y a rien à renvoyer, seulement la séance à créer.
            onRetry={
              erreur.reseau
                ? seance
                  ? () => void renvoyerLesEnAttente()
                  : () => void demarrer()
                : undefined
            }
          />
        ) : null}

        {chargement ? (
          <LoadingState rows={2} />
        ) : seance ? (
          <ScrollView
            contentContainerClassName="gap-2 pb-4"
            keyboardShouldPersistTaps="handled"
            // Second recours : faire glisser la liste referme le clavier. Un geste que
            // beaucoup connaissent déjà, et qui ne coûte aucun élément à l'écran.
            keyboardDismissMode="on-drag"
          >
            {exercices.length === 0 ? (
              <Text variant="body" color="support">
                Aucun exercice pour l&apos;instant. Ajoute le premier pour commencer à logguer.
              </Text>
            ) : null}

            {exercices.map((exercice) => {
              const liste = series[exercice.id] ?? [];

              return (
                <View key={exercice.id}>
                  <SectionHeader>{exercice.name}</SectionHeader>

                  {/* C5 §6 : « nom + cible du template si applicable ». Hors template,
                      aucune cible n'est affichée — C5 §11 l'exige explicitement. */}
                  <Text variant="mono-meta" color="support">
                    {exercice.muscle_group.replace(/_/g, ' ')}
                  </Text>

                  {liste.length > 0 ? <Hairline /> : null}
                  {liste.map((serie) => (
                    <View key={serie.cle}>
                      <SetRow set={serie} />
                      <Hairline />
                    </View>
                  ))}

                  <View className="pt-2">
                    <SetInputForm
                      exerciseType={exercice.exercise_type}
                      onValider={(saisie) => logguer(exercice, saisie)}
                    />
                  </View>
                </View>
              );
            })}

            <View className="pt-3">
              {/* Contour accent — demande du 03/08/2026, le bouton ne se trouvait pas
                  du premier coup d'œil. Voir la variante dans Button.tsx et l'écart
                  assumé à la contrainte §12 qui y est documenté. */}
              <Button variant="accent-outline" onPress={() => setChoixOuvert(true)}>
                + Ajouter un exercice
              </Button>
            </View>
          </ScrollView>
        ) : null}
      </View>

      {/*
        Hors du ScrollView, donc collé en bas — C5 §5 : « bandeau sticky en bas, non
        bloquant ». Dans le KeyboardAvoidingView, il remonte avec le clavier au lieu de
        passer dessous, ce qui satisfait §13 : il ne masque jamais le formulaire actif.
      */}
      {repos ? (
        <RestTimerWidget
          restant={restantRepos}
          total={repos.total}
          onAjuster={(secondes) =>
            setRepos((r) =>
              r ? { ...r, total: Math.max(SECONDES_PAR_CELLULE, r.total + secondes) } : r,
            )
          }
          onPasser={() => void cloturerRepos(repos)}
        />
      ) : null}

      {/*
        C1 en mode Select — C1 §4 : « modal indépendant avec bouton fermer explicite pour
        revenir à C5 sans ajout ».

        C'est le MÊME composant qu'au segment Exercices, pas une copie : `ExerciseLibrary`
        ne connaît ni la navigation ni la séance, seulement ce qu'on fait d'un tap. C1 §9
        BR-2 : le tap ajoute immédiatement, sans étape de confirmation qui coûterait du
        temps en pleine séance.
      */}
      <Modal visible={choixOuvert} animationType="slide" onRequestClose={() => setChoixOuvert(false)}>
        {/*
          SON PROPRE SafeAreaView. Un `Modal` de React Native s'affiche dans une racine
          SÉPARÉE de l'arbre de l'application : celui posé dans `app/_layout.tsx` ne le
          couvre pas, et son en-tête se retrouvait sous l'encoche. Constaté le 03/08/2026.
        */}
        <SafeAreaView edges={['top']} className="flex-1 bg-surface-page p-4">
          <ScreenHeader
            title="Ajouter un exercice"
            // C1 §11 : le bouton de fermeture est le PREMIER élément focusable.
            leading={<TextLink onPress={() => setChoixOuvert(false)}>Fermer</TextLink>}
          />
          <ExerciseLibrary onExercicePresse={ajouter} />
        </SafeAreaView>
      </Modal>

      <ConfirmDialog
        visible={confirmationSortie}
        title="quitter la séance"
        consequences={[
          ['séries loguées', String(toutesLesSeries.length)],
          ...(enAttente.length > 0
            ? ([['non synchronisées', String(enAttente.length)]] as const)
            : []),
        ]}
        message={
          enAttente.length > 0
            ? 'Les séries non synchronisées seront perdues : elles ne sont enregistrées que sur cet écran.'
            : 'Elles restent enregistrées. La séance ne sera simplement pas finalisée.'
        }
        confirmLabel="Quitter"
        onConfirm={() => {
          setConfirmationSortie(false);
          router.back();
        }}
        onCancel={() => setConfirmationSortie(false)}
      />
    </KeyboardAvoidingView>
  );
}
