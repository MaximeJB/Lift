import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, SectionList, View } from 'react-native';

import { ApiError, type WorkoutSession } from '../../shared/api';
import { Hairline } from '../../shared/components/primitives/Hairline';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { ErrorBanner } from '../../shared/components/ui/ErrorBanner';
import { ListItem } from '../../shared/components/ui/ListItem';
import { LoadingState } from '../../shared/components/ui/LoadingState';
import { SectionHeader } from '../../shared/components/ui/SectionHeader';
import { listSessions } from '../services/sessions.service';
import { volume } from '../stats';

export type SessionHistoryProps = {
  /** C7 §3 : tap sur une séance → C8. */
  onSeancePressee: (seance: WorkoutSession) => void;
  /** C7 §8 : l'état vide renvoie vers C3, le segment voisin. */
  onDemarrer: () => void;
};

/** Noms de mois en clair, sans dépendre de la locale de l'appareil. */
const MOIS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

/** `2026-08-02` → `août 2026`. La clé de regroupement, et son libellé. */
function moisDe(date: string): string {
  const [annee, mois] = date.split('-');
  return `${MOIS[Number(mois) - 1] ?? mois} ${annee}`;
}

/** `2026-08-02` → `02/08`. L'année est déjà portée par l'en-tête de groupe. */
function jourEtMois(date: string): string {
  const [, mois, jour] = date.split('-');
  return `${jour}/${mois}`;
}

/**
 * Sous-titre d'une séance — durée et volume, en registre codé.
 *
 * C7 §9 BR-3 : la durée affichée est `duration_minutes`, calculé et FIGÉ à la sauvegarde
 * en C6. On ne la recalcule pas ici : une séance non finalisée n'en a pas, et inventer une
 * durée à partir de l'heure de début donnerait un nombre qui grandit à chaque affichage.
 */
function resume(seance: WorkoutSession): string {
  const duree = seance.duration_minutes !== null ? `${seance.duration_minutes} min` : 'non finalisée';
  const charge = volume(seance.sets);

  return charge > 0
    ? `${jourEtMois(seance.date)} · ${duree} · ${Math.round(charge)} kg`
    : `${jourEtMois(seance.date)} · ${duree}`;
}

/**
 * C7 — Historique des séances, segment Historique du tab Lift.
 *
 * `SectionList` et non `FlatList` — C7 §12 l'impose : c'est elle qui donne le regroupement
 * et les en-têtes collants sans les recalculer à la main au défilement.
 *
 * C7 §9 BR-1 : le regroupement par mois se fait CÔTÉ CLIENT, sur des données déjà triées
 * par le serveur (`ordering = ['-date', '-start_time']` dans le Meta du modèle). On ne
 * retrie donc rien — le faire risquerait d'introduire un ordre différent de celui de la
 * pagination, et donc des sauts au chargement de la page suivante.
 *
 * C7 §15 : « ne pas dupliquer les en-têtes de mois à cheval sur une pagination ». Le
 * regroupement est refait sur la liste ENTIÈRE à chaque page reçue, jamais par morceaux —
 * un mois coupé en deux pages ne peut donc pas produire deux en-têtes.
 *
 * PAS DE MINIATURE PHOTO. C7 §9 BR-2 ne lui réserve d'espace que si elle existe, et le
 * champ n'existe pas encore sur `WorkoutSession` — même dépendance que C6, ticket
 * `photo-de-seance-infrastructure-2026-08-02`.
 */
export function SessionHistory({ onSeancePressee, onDemarrer }: SessionHistoryProps) {
  const [seances, setSeances] = useState<WorkoutSession[]>([]);
  const [total, setTotal] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [rafraichissement, setRafraichissement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  /** Même garde qu'en C1 : une page lente ne doit pas écraser une page plus récente. */
  const demandeRef = useRef(0);

  const charger = useCallback(async (offset: number) => {
    const demande = ++demandeRef.current;

    setErreur(null);
    if (offset === 0) setChargement(true);

    try {
      const page = await listSessions(offset);
      if (demande !== demandeRef.current) return;

      setSeances((precedentes) => {
        if (offset === 0) return page.results;

        const connues = new Set(precedentes.map((s) => s.id));
        return [...precedentes, ...page.results.filter((s) => !connues.has(s.id))];
      });
      setTotal(page.count);
    } catch (e) {
      if (demande !== demandeRef.current) return;
      setErreur(e instanceof ApiError ? e.message : 'Le serveur a rencontré un problème.');
    } finally {
      if (demande === demandeRef.current) {
        setChargement(false);
        setRafraichissement(false);
      }
    }
  }, []);

  useEffect(() => {
    void charger(0);
  }, [charger]);

  /**
   * Regroupement mensuel, reconstruit à chaque rendu sur la liste complète.
   *
   * Les données arrivent déjà en date décroissante : parcourir dans l'ordre suffit à
   * produire des groupes ordonnés, sans aucun tri supplémentaire.
   */
  const sections: { title: string; data: WorkoutSession[] }[] = [];
  for (const seance of seances) {
    const titre = moisDe(seance.date);
    const dernier = sections[sections.length - 1];

    if (dernier?.title === titre) dernier.data.push(seance);
    else sections.push({ title: titre, data: [seance] });
  }

  const chargerLaSuite = () => {
    if (chargement || rafraichissement || erreur || seances.length >= total) return;
    void charger(seances.length);
  };

  if (chargement && seances.length === 0) {
    return <LoadingState rows={5} />;
  }

  return (
    <View className="flex-1 gap-3">
      {erreur ? (
        <ErrorBanner message={erreur} onRetry={() => void charger(seances.length)} />
      ) : null}

      <SectionList
        sections={sections}
        keyExtractor={(seance) => seance.id}
        // C7 §6 : en-têtes collants. Activé par défaut sur iOS, explicite pour Android.
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => <SectionHeader>{section.title}</SectionHeader>}
        renderItem={({ item }) => (
          <View>
            <ListItem
              title={item.title}
              subtitle={resume(item)}
              onPress={() => onSeancePressee(item)}
            />
            <Hairline />
          </View>
        )}
        onEndReached={chargerLaSuite}
        onEndReachedThreshold={0.5}
        ListFooterComponent={chargement && seances.length > 0 ? <LoadingState rows={1} /> : null}
        ListEmptyComponent={
          chargement ? null : (
            <EmptyState
              title="Aucune séance enregistrée"
              description="Ton historique se remplira à mesure que tu t'entraînes."
              // C7 §8 : le CTA renvoie vers C3, qui est le segment voisin — pas une
              // navigation, un changement de segment.
              actionLabel="Démarrer une séance"
              onAction={onDemarrer}
            />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={rafraichissement}
            onRefresh={() => {
              setRafraichissement(true);
              void charger(0);
            }}
          />
        }
      />
    </View>
  );
}
