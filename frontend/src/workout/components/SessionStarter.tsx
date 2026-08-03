import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { ApiError, type WorkoutTemplate } from '../../shared/api';
import { Hairline } from '../../shared/components/primitives/Hairline';
import { Badge } from '../../shared/components/ui/Badge';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { ErrorBanner } from '../../shared/components/ui/ErrorBanner';
import { ListItem } from '../../shared/components/ui/ListItem';
import { LoadingState } from '../../shared/components/ui/LoadingState';
import { listTemplates } from '../services/templates.service';

/**
 * TROIS PROPOSITIONS EN CONCURRENCE — atelier du 03/08/2026.
 *
 * Signalé à l'essai sur appareil : avec zéro template en base, l'écran ne porte qu'une
 * seule carte en haut et paraît vide.
 *
 *   etatVide   la carte reste en haut, un état vide explique pourquoi il n'y a rien d'autre
 *   centre     le bloc entier se centre verticalement tant que le contenu est court
 *   grand      les cartes passent en Inter 18 — elles occupent la place qu'elles méritent
 *
 * Deux seront retirées après le choix.
 */
export type SessionStarterPresentation = 'etatVide' | 'centre' | 'grand';

export type SessionStarterViewProps = {
  templates: readonly WorkoutTemplate[];
  chargement: boolean;
  erreur: string | null;
  onRecharger: () => void;
  /** C3 §3 : tap sur « Séance libre » → C5 avec `template: null`. */
  onSeanceLibre: () => void;
  /** C3 §3 : tap sur un template → C4. */
  onTemplate: (template: WorkoutTemplate) => void;
  presentation?: SessionStarterPresentation;
};

/** `PUSH_PULL_LEGS` en base ; les catégories sont des codes, pas des phrases. */
const lisible = (code: string) => code.replace(/_/g, ' ');

/**
 * Sous-titre d'une carte template — durée et nombre d'exercices.
 *
 * C3 §9 BR-3 : le nombre d'exercices est `len(template.exercises)`, déjà imbriqué par le
 * sérialiseur. Aucune requête supplémentaire.
 */
function resume(template: WorkoutTemplate): string {
  const exercices = template.exercises.length;
  return `${template.estimated_duration} min · ${exercices} exercice${exercices > 1 ? 's' : ''}`;
}

/**
 * Rendu de C3, sans aucune dépendance au réseau.
 *
 * SÉPARÉ DE `SessionStarter` À DESSEIN, comme `TabBarView` l'est de `TabBar` : la version
 * connectée ne peut pas être montée au catalogue sans déclencher un appel. Extraire la
 * partie visuelle permet de comparer les propositions sur les deux états qui comptent —
 * zéro template, et quelques-uns.
 */
export function SessionStarterView({
  templates,
  chargement,
  erreur,
  onRecharger,
  onSeanceLibre,
  onTemplate,
  presentation = 'etatVide',
}: SessionStarterViewProps) {
  const voix = presentation === 'grand' ? ('section' as const) : ('body' as const);

  return (
    <ScrollView
      // Le centrage n'agit que tant que le contenu est plus court que l'écran :
      // `flex-grow` laisse le conteneur reprendre sa taille naturelle au-delà.
      contentContainerClassName={
        presentation === 'centre' ? 'flex-grow justify-center pb-4' : 'pb-4'
      }
      keyboardShouldPersistTaps="handled"
    >
      {/*
        C3 §15 : « ne pas bloquer l'accès à Séance libre si le chargement des templates
        échoue », et §16 en fait un critère d'acceptation. Elle est donc rendue AVANT tout
        état de chargement ou d'erreur, jamais dans une branche conditionnelle.

        C3 §6 : « carte visuellement égale aux templates ». Même composant, même voix, même
        hauteur — elle se distingue par sa position en tête et par son sous-titre.
      */}
      <ListItem
        title="Séance libre"
        subtitle="sans programme · exercices ajoutés au fil de la séance"
        titleVariant={voix}
        onPress={onSeanceLibre}
      />
      <Hairline />

      {erreur ? (
        <View className="pt-3">
          <ErrorBanner message={erreur} onRetry={onRecharger} />
        </View>
      ) : null}

      {/* C3 §8 : squelette sur les cartes template, la séance libre restant affichée
          immédiatement au-dessus. */}
      {chargement ? <LoadingState rows={3} /> : null}

      {templates.map((template) => (
        <View key={template.id}>
          <ListItem
            title={template.name}
            subtitle={resume(template)}
            titleVariant={voix}
            trailing={<Badge>{lisible(template.category)}</Badge>}
            onPress={() => onTemplate(template)}
          />
          <Hairline />
        </View>
      ))}

      {/*
        C3 §8 prévoit un état vide « défensif minimal ». Il ne remplace pas l'écran : la
        séance libre reste au-dessus, utilisable. Il dit seulement pourquoi il n'y a rien
        d'autre — un écran vide sans explication se lit comme une panne.
      */}
      {presentation === 'etatVide' && !chargement && !erreur && templates.length === 0 ? (
        <EmptyState
          title="Aucun programme enregistré"
          description="Les séances structurées apparaîtront ici. En attendant, la séance libre te laisse composer au fil de l'effort."
        />
      ) : null}
    </ScrollView>
  );
}

export type SessionStarterProps = Pick<
  SessionStarterViewProps,
  'onSeanceLibre' | 'onTemplate' | 'presentation'
>;

/**
 * C3 — Choisir un template, segment Séances du tab Lift.
 *
 * ATTENTION — la base contient ZÉRO template au 03/08/2026. C3 §14 pose le seeding des
 * ~10 templates prédéfinis comme condition de livraison de cet écran.
 */
export function SessionStarter({ onSeanceLibre, onTemplate, presentation }: SessionStarterProps) {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);

    try {
      const page = await listTemplates();
      /**
       * C3 §6 : « tri par catégorie puis alphabétique ». Le backend ne l'ordonne pas —
       * `WorkoutTemplateViewset.get_queryset` filtre sans `order_by`. Le tri se fait donc
       * ici, ce qui reste tenable sur une dizaine d'éléments (§13).
       *
       * `localeCompare` et non `<` : « Étirements » se classerait après « Zone » avec une
       * comparaison de codes de caractères.
       */
      setTemplates(
        [...page.results].sort(
          (a, b) =>
            a.category.localeCompare(b.category, 'fr') || a.name.localeCompare(b.name, 'fr'),
        ),
      );
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Le serveur a rencontré un problème.');
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  return (
    <SessionStarterView
      templates={templates}
      chargement={chargement}
      erreur={erreur}
      onRecharger={() => void charger()}
      onSeanceLibre={onSeanceLibre}
      onTemplate={onTemplate}
      presentation={presentation}
    />
  );
}
