import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { cssInterop } from 'nativewind';
import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, ScrollView, View } from 'react-native';

import { ApiError, type Exercise } from '../../../src/shared/api';
import { Text } from '../../../src/shared/components/primitives/Text';
import { Badge } from '../../../src/shared/components/ui/Badge';
import { ErrorBanner } from '../../../src/shared/components/ui/ErrorBanner';
import { LoadingState } from '../../../src/shared/components/ui/LoadingState';
import { ScreenHeader } from '../../../src/shared/components/ui/ScreenHeader';
import { SectionHeader } from '../../../src/shared/components/ui/SectionHeader';
import { TextLink } from '../../../src/shared/components/ui/TextLink';
import { getExercise } from '../../../src/workout/services/exercises.service';

/** Les codes de `MUSCLE_GROUP_CHOICES` sont écrits `LOWER_BACK` en base. */
const lisible = (code: string) => code.replace(/_/g, ' ');

/**
 * `VideoView` vient d'une bibliothèque tierce : NativeWind ne sait pas d'office que sa
 * prop `style` doit recevoir ce que produit `className`. Sans cette déclaration, la vue
 * serait rendue sans dimensions, donc invisible, et aucune erreur ne le signalerait.
 *
 * C'est la seule façon de dimensionner ce composant sans écrire de `style` en dur.
 */
cssInterop(VideoView, { className: 'style' });

/**
 * C2 — Détail d'un exercice.
 *
 * DEUX SECTIONS DE LA SPEC SONT ABSENTES, et les deux le resteront tant qu'un asset ou
 * une dépendance manquera :
 *
 *   Hero média (§6) — la cascade vidéo → image → icône n'a plus qu'un seul maillon.
 *   Mesuré le 02/08/2026 sur la base : 209 exercices sur 873 ont une `video_url`,
 *   et `image_url` est vide sur les 873. Lire la vidéo demande une dépendance
 *   (`expo-video`) qui n'est pas installée, et l'icône générique n'existe pas — même
 *   asset manquant qu'en C1. Il n'y a donc rien à afficher pour 76% des fiches.
 *
 *   BodyDiagram (§6) — silhouettes avant/arrière en SVG, avec le muscle principal et
 *   les secondaires surlignés. Ni les tracés ni `react-native-svg` n'existent dans le
 *   projet. Les mêmes données sont montrées en texte plus bas, ce qui couvre §11
 *   (« alternative textuelle obligatoire ») sans rien inventer visuellement.
 *
 * Ce qui reste est ce qui porte réellement l'information : 868 fiches sur 873 ont une
 * description, 796 un matériel, 489 sont marquées composées.
 */
export default function DetailExercice() {
  const { id, nom } = useLocalSearchParams<{ id: string; nom?: string }>();

  const [exercice, setExercice] = useState<Exercise | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);

    try {
      setExercice(await getExercise(id));
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Le serveur a rencontré un problème.');
    } finally {
      setChargement(false);
    }
  }, [id]);

  useEffect(() => {
    void charger();
  }, [charger]);

  /**
   * C2 §11 : « Respect de prefers-reduced-motion : pas d'autoplay si activé, tap-to-play
   * à la place. » Le réglage système est lu une fois au montage.
   */
  const [animationsReduites, setAnimationsReduites] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setAnimationsReduites);
  }, []);

  /**
   * Le lecteur existe même sans source : les hooks ne peuvent pas être conditionnels, et
   * `useVideoPlayer` accepte `null`. Aucun téléchargement n'est déclenché tant qu'aucune
   * URL n'est fournie — ce qui est le cas de 664 exercices sur 873.
   *
   * C2 §11 : jamais de son. Le muet n'est pas une préférence, c'est une obligation
   * d'accessibilité pour une lecture automatique.
   */
  const lecteur = useVideoPlayer(exercice?.video_url ?? null, (player) => {
    player.loop = true;
    player.muted = true;
  });

  useEffect(() => {
    if (!exercice?.video_url || animationsReduites) return;
    lecteur.play();
  }, [lecteur, exercice?.video_url, animationsReduites]);

  /**
   * C2 §9 BR-4 : « la vidéo ne joue jamais en arrière-plan une fois l'écran quitté. »
   *
   * L'écran reste MONTÉ quand on empile autre chose par-dessus : sans cette pause au
   * moment où il perd le focus, la boucle continuerait à tourner derrière.
   * `useFocusEffect` rend une fonction de nettoyage, exécutée à la perte du focus.
   */
  useFocusEffect(useCallback(() => () => lecteur.pause(), [lecteur]));

  return (
    <View className="flex-1 bg-surface-page p-4">
      <ScreenHeader
        /**
         * C2 §8 : « nom déjà disponible sans attendre le réseau ». C1 vient de l'afficher
         * dans sa liste et le passe en paramètre — le redemander au serveur ferait
         * attendre l'utilisateur pour une donnée qu'il a sous les yeux.
         */
        title={exercice?.name ?? nom ?? 'Exercice'}
        leading={<TextLink onPress={() => router.back()}>Retour</TextLink>}
        attributes={
          exercice
            ? [
                ['groupe musculaire', lisible(exercice.muscle_group)],
                // `exercise_type` est vide sur une partie du catalogue : un tiret vaut
                // mieux qu'une ligne d'attribut absente, qui décalerait les suivantes.
                ['format', exercice.exercise_type ? lisible(exercice.exercise_type) : '—'],
              ]
            : undefined
        }
      />

      {erreur ? <ErrorBanner message={erreur} onRetry={() => void charger()} /> : null}

      {chargement ? (
        <LoadingState rows={4} />
      ) : exercice ? (
        <ScrollView contentContainerClassName="gap-2 pb-4">
          {/*
            C2 §9 BR-1 — hero média. La cascade prévue est vidéo → image → icône
            générique ; il n'en reste que le premier maillon, `image_url` étant vide sur
            les 873 exercices et l'icône n'existant pas. Quand il n'y a pas de vidéo, rien
            n'est affiché : mieux vaut pas de zone qu'une zone vide.

            `aspect-video` fixe le ratio 16/9 demandé par §12 (« pas de déformation »).
            C'est un utilitaire de structure de Tailwind, pas un jeton de design — il ne
            porte ni couleur ni mesure du système.
          */}
          {exercice.video_url ? (
            <View className="aspect-video w-full">
              <VideoView
                player={lecteur}
                className="h-full w-full"
                contentFit="contain"
                // Les commandes n'apparaissent que si l'autoplay a été désactivé par le
                // réglage d'accessibilité : sans elles, l'utilisateur n'aurait aucun
                // moyen de lancer la démonstration.
                nativeControls={animationsReduites}
                accessibilityLabel={`Démonstration : ${exercice.name}`}
              />
            </View>
          ) : null}

          {/* C2 §6 : badge « Composé » si applicable, tag matériel masqué si vide. Les
              deux sont des étiquettes de même nature, donc la même rangée. */}
          {exercice.is_compound || exercice.equipment_needed ? (
            <View className="flex-row flex-wrap items-center gap-2">
              {exercice.is_compound ? <Badge>composé</Badge> : null}
              {exercice.equipment_needed ? <Badge>{exercice.equipment_needed}</Badge> : null}
            </View>
          ) : null}

          {/* C2 §10 : `secondary_muscle_groups` vide → aucune section vide affichée.
              124 exercices sur 873 en ont. */}
          {exercice.secondary_muscle_groups.length > 0 ? (
            <>
              <SectionHeader>muscles secondaires</SectionHeader>
              <View className="flex-row flex-wrap items-center gap-2">
                {exercice.secondary_muscle_groups.map((groupe) => (
                  <Badge key={groupe}>{lisible(groupe)}</Badge>
                ))}
              </View>
            </>
          ) : null}

          {/* C2 §6 : description masquée entièrement si vide. */}
          {exercice.description ? (
            <>
              <SectionHeader>description</SectionHeader>
              <Text variant="body">{exercice.description}</Text>
            </>
          ) : null}
        </ScrollView>
      ) : null}
    </View>
  );
}
