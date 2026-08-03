import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, View } from 'react-native';

import { ApiError, type Exercise } from '../../shared/api';
import { Hairline } from '../../shared/components/primitives/Hairline';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { ErrorBanner } from '../../shared/components/ui/ErrorBanner';
import { FilterChipsRow } from '../../shared/components/ui/FilterChipsRow';
import { ListItem } from '../../shared/components/ui/ListItem';
import { LoadingState } from '../../shared/components/ui/LoadingState';
import { SearchInput } from '../../shared/components/ui/SearchInput';
import { listExercises, MUSCLE_GROUPS, type ExerciseQuery } from '../services/exercises.service';

export type ExerciseLibraryProps = {
  /**
   * C1 §3 : la sortie DÉPEND DU MODE. En Browse, taper ouvre C2 ; en Select depuis C5,
   * taper ajoute l'exercice à la séance et ferme l'écran. Le composant ne tranche pas —
   * il ne connaît ni la navigation ni la séance en cours.
   */
  onExercicePresse: (exercice: Exercise) => void;
};

/** Ce qui restreint la liste. Toute modification relance à l'offset 0. */
type Filtres = { search: string; groupes: readonly string[] };

const AUCUN_FILTRE: Filtres = { search: '', groupes: [] };

/**
 * C1 — Bibliothèque d'exercices, mode Browse.
 *
 * Recherche serveur, filtres par groupe musculaire, liste paginée, défilement infini sur
 * les 873 exercices.
 *
 * UN ÉLÉMENT DE LA SPEC RESTE ABSENT : `MuscleGroupIcon`. Les 18 icônes n'existent pas
 * (C1 §14, « asset inexistant ») et le système n'a aucune famille d'icônes — la
 * contrainte §12 de la Design-System-Specification en interdit le mélange, et en choisir
 * une ici serait une décision de design prise à la sauvette. Ticket ouvert :
 * `visuels-du-catalogue-exercices-2026-08-02`.
 *
 * ÉCART ASSUMÉ AVEC C1 §12 : pas de `getItemLayout`. Il exige une hauteur d'item
 * CONSTANTE, or une ligne avec sous-titre ne fait pas la même hauteur qu'une ligne sans.
 * Une constante fausse produit exactement ce que §12 cherche à éviter — des sauts de
 * scroll. À rétablir le jour où la ligne aura une hauteur fixe.
 */
export function ExerciseLibrary({ onExercicePresse }: ExerciseLibraryProps) {
  const [exercices, setExercices] = useState<Exercise[]>([]);
  const [total, setTotal] = useState(0);
  const [filtres, setFiltres] = useState<Filtres>(AUCUN_FILTRE);
  const [enChargement, setEnChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  /**
   * Numéro de la requête en cours.
   *
   * Sans ce compteur, une recherche lente partie en premier écraserait le résultat d'une
   * recherche plus récente déjà revenue — l'utilisateur verrait s'afficher les résultats
   * d'un mot qu'il a fini d'effacer. Le debounce de 350ms réduit le risque, il ne
   * l'élimine pas : deux requêtes peuvent voler en parallèle.
   */
  const demandeRef = useRef(0);

  const charger = useCallback(async (f: Filtres, offset: number) => {
    const demande = ++demandeRef.current;

    setEnChargement(true);
    setErreur(null);

    const query: ExerciseQuery = { search: f.search, muscleGroups: f.groupes, offset };

    try {
      const page = await listExercises(query);

      // Une demande plus récente a pris la main : ce résultat est périmé, on le jette.
      if (demande !== demandeRef.current) return;

      setExercices((precedents) => {
        if (offset === 0) return page.results;

        /**
         * C1 §16 : « scroll infini sans doublon ». Ceinture en plus des bretelles depuis
         * que `ExerciseViewset.get_queryset` trie par `name` : une clé dupliquée dans une
         * FlatList fait disparaître des lignes, l'échec serait silencieux.
         */
        const connus = new Set(precedents.map((e) => e.id));
        return [...precedents, ...page.results.filter((e) => !connus.has(e.id))];
      });

      setTotal(page.count);
    } catch (e) {
      if (demande !== demandeRef.current) return;

      // C1 §8 : « Error (liste précédente conservée) ». On n'efface rien — l'utilisateur
      // garde ce qu'il avait sous les yeux, et la bannière lui offre de reprendre.
      setErreur(e instanceof ApiError ? e.message : 'Le serveur a rencontré un problème.');
    } finally {
      if (demande === demandeRef.current) setEnChargement(false);
    }
  }, []);

  /**
   * Toute modification des filtres relance à l'offset 0.
   *
   * C'est aussi ce qui déclenche le PREMIER chargement, au montage, avec des filtres
   * vides. Un effet unique plutôt qu'un appel dispersé dans chaque gestionnaire : sinon
   * la remise à zéro de la pagination finirait par être oubliée quelque part.
   */
  useEffect(() => {
    void charger(filtres, 0);
  }, [charger, filtres]);

  /**
   * Stable par `useCallback` — non négociable : `SearchInput` a `onSearch` dans les
   * dépendances de son effet de debounce, et une fonction recréée à chaque rendu
   * relancerait le minuteur en boucle sans jamais lancer la recherche.
   *
   * L'objet n'est remplacé QUE si le texte a changé. Le debounce s'exécute une fois au
   * montage avec une requête vide ; sans cette garde, il déclencherait un second
   * chargement identique au premier.
   */
  const rechercher = useCallback((q: string) => {
    setFiltres((f) => (f.search === q ? f : { ...f, search: q }));
  }, []);

  /** C1 §9 BR-3 : sélection multiple, OU entre les chips. */
  const basculerGroupe = useCallback((groupe: string) => {
    setFiltres((f) => ({
      ...f,
      groupes: f.groupes.includes(groupe)
        ? f.groupes.filter((g) => g !== groupe)
        : [...f.groupes, groupe],
    }));
  }, []);

  /** C1 §6 : la page suivante part AVANT que l'utilisateur atteigne réellement le bas. */
  const chargerLaSuite = () => {
    if (enChargement || erreur || exercices.length >= total) return;
    void charger(filtres, exercices.length);
  };

  const premiereCharge = enChargement && exercices.length === 0;

  return (
    <View className="flex-1 gap-3">
      <SearchInput
        label="Rechercher un exercice"
        placeholder="Développé couché"
        onSearch={rechercher}
      />

      <FilterChipsRow
        options={MUSCLE_GROUPS}
        selection={filtres.groupes}
        onToggle={basculerGroupe}
      />

      {erreur ? (
        <ErrorBanner message={erreur} onRetry={() => void charger(filtres, exercices.length)} />
      ) : null}

      {premiereCharge ? (
        // C1 §8 : « Loading (recherche/filtre changé — skeleton) ». Six lignes fantômes
        // pour tenir la hauteur d'écran, la page en contient 25.
        <LoadingState rows={6} />
      ) : (
        /**
         * LE CONTENEUR N'EST PAS DÉCORATIF. Une FlatList sans contrainte de hauteur se
         * dimensionne sur son contenu — 873 lignes — et déborde de son parent. Sur iOS,
         * ce qui dépasse du cadre d'une vue ne reçoit plus les touchers : la liste
         * s'affiche, mais le champ de recherche au-dessus cesse de répondre.
         */
        <View className="flex-1">
          <FlatList
            data={exercices}
            keyExtractor={(exercice) => exercice.id}
            renderItem={({ item }) => (
              <ListItem
                title={item.name}
                // Les valeurs viennent de `MUSCLE_GROUP_CHOICES` en base : des codes
                // (`LOWER_BACK`). Le tiret bas est le seul retrait — c'est un registre
                // codé, pas une phrase, et §01 le veut ainsi.
                subtitle={item.muscle_group.replace(/_/g, ' ')}
                onPress={() => onExercicePresse(item)}
              />
            )}
            ItemSeparatorComponent={Hairline}
            onEndReached={chargerLaSuite}
            onEndReachedThreshold={0.5}
            // Une ligne fantôme en pied : la même forme que ce qui arrive, au lieu d'un
            // indicateur abstrait.
            ListFooterComponent={enChargement ? <LoadingState rows={1} /> : null}
            ListEmptyComponent={
              // C1 §8 : Empty n'apparaît qu'une fois le chargement terminé — sinon un
              // « aucun résultat » clignoterait entre deux frappes.
              enChargement ? null : (
                <EmptyState
                  title="Aucun exercice ne correspond"
                  description={
                    filtres.groupes.length > 0
                      ? `Aucun exercice ne réunit ${filtres.search ? `« ${filtres.search} » et ` : ''}${filtres.groupes.length} filtre${filtres.groupes.length > 1 ? 's' : ''} de groupe musculaire.`
                      : `« ${filtres.search} » ne ressort ni dans les noms, ni dans les descriptions, ni dans le matériel.`
                  }
                />
              )
            }
            // Un premier tap doit activer une ligne, pas seulement refermer le clavier.
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          />
        </View>
      )}
    </View>
  );
}
