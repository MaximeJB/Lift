import type { WorkoutSession, WorkoutSet } from '../shared/api';

/**
 * Formules de performance — B1, C6, C8.
 *
 * ELLES NE SE RECOPIENT PAS. Le tableau de traçabilité de la spec d'interface, Phase 5,
 * liste « Formule 1RM estimé (Epley) » comme devant être « identique partout » sur ces
 * trois écrans. Trois copies divergeraient au premier ajustement, et un même exercice
 * afficherait deux records différents selon l'écran.
 *
 * Toutes ces fonctions sont pures : aucune requête, aucun état. Elles se testent sans
 * monter le moindre composant.
 */

/**
 * `weight_kg` arrive en CHAÎNE — DRF sérialise ainsi les `DecimalField` pour ne pas
 * perdre de précision en JSON. Toute arithmétique doit convertir d'abord, et une valeur
 * illisible vaut zéro plutôt que `NaN`, qui contaminerait toute une somme.
 */
function enNombre(valeur: string | number | null | undefined): number {
  const n = typeof valeur === 'string' ? Number(valeur) : (valeur ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Volume d'un ensemble de séries — B1 §9 BR-1 : « Σ(weight_kg × reps) ».
 *
 * B1 §9 BR-2 : les séries d'échauffement en sont EXCLUES. Les compter gonflerait le
 * volume d'un pratiquant qui s'échauffe sérieusement, ce qui est exactement l'inverse du
 * signal recherché.
 */
export function volume(series: readonly WorkoutSet[]): number {
  return series
    .filter((s) => !s.is_warmup)
    .reduce((total, s) => total + enNombre(s.weight_kg) * s.reps, 0);
}

/**
 * 1RM estimé d'une série — B1 §9 BR-4, formule d'Epley : `poids × (1 + reps/30)`.
 *
 * B1 §10 : une série à exactement 1 répétition passe quand même par la formule, qui rend
 * alors le poids lui-même. Aucun cas particulier à écrire.
 *
 * Renvoie 0 pour une série sans charge — un exercice en durée ou au poids du corps n'a
 * pas de 1RM, et l'inventer n'aurait aucun sens.
 */
export function unRepMax(serie: WorkoutSet): number {
  return unRepMaxDe(serie.weight_kg, serie.reps);
}

/**
 * Même formule, sur des valeurs brutes.
 *
 * Sert à C5, qui doit juger une série AU MOMENT de la saisie — avant qu'elle existe sous
 * forme de `WorkoutSet`. Fabriquer un faux objet pour appeler `unRepMax` marcherait, mais
 * le jour où le type gagne un champ obligatoire, ce faux objet cesserait de compiler pour
 * une raison sans rapport.
 */
export function unRepMaxDe(poidsKg: string | number | null, reps: number | null): number {
  const poids = enNombre(poidsKg);
  if (poids <= 0 || !reps || reps <= 0) return 0;

  return poids * (1 + reps / 30);
}

/**
 * Meilleur 1RM estimé par exercice, sur les séries fournies.
 *
 * Les échauffements sont écartés là aussi : une série légère ne peut pas produire un
 * record, et la laisser entrer ouvrirait la porte à des PR absurdes sur un jour de
 * décharge.
 */
export function meilleurParExercice(series: readonly WorkoutSet[]): Map<string, number> {
  const meilleurs = new Map<string, number>();

  for (const serie of series) {
    if (serie.is_warmup) continue;

    const estime = unRepMax(serie);
    if (estime <= 0) continue;

    const connu = meilleurs.get(serie.exercise) ?? 0;
    if (estime > connu) meilleurs.set(serie.exercise, estime);
  }

  return meilleurs;
}

/** Un record battu : l'exercice, la nouvelle valeur, et celle qu'elle dépasse. */
export type RecordBattu = {
  exerciceId: string;
  estime: number;
  precedent: number;
};

/**
 * Records battus par une séance — B1 §9 BR-5, C6 §9 BR-2.
 *
 * « Un 1RM estimé qui dépasse le précédent record connu ». L'historique doit donc EXCLURE
 * la séance en cours, sans quoi elle se comparerait à elle-même et ne battrait jamais rien.
 *
 * Un exercice jamais chargé auparavant compte comme un record : `precedent` vaut alors 0.
 * C'est voulu — la première fois qu'on charge une barre est un fait à signaler.
 */
export function recordsBattus(
  seriesDeLaSeance: readonly WorkoutSet[],
  seriesAnterieures: readonly WorkoutSet[],
): RecordBattu[] {
  const anterieurs = meilleurParExercice(seriesAnterieures);

  return [...meilleurParExercice(seriesDeLaSeance).entries()]
    .map(([exerciceId, estime]) => ({
      exerciceId,
      estime,
      precedent: anterieurs.get(exerciceId) ?? 0,
    }))
    .filter((record) => record.estime > record.precedent)
    .sort((a, b) => b.estime - a.estime);
}

/**
 * Durée d'une séance en minutes, depuis son instant de début.
 *
 * `start_time` est un `DateTimeField` côté Django malgré son nom : il porte la date, la
 * jour et le fuseau. Rien à recoller, rien à supposer sur le fuseau du serveur.
 *
 * Renvoie `null` si l'instant de début manque : mieux vaut ne rien afficher qu'une durée
 * fausse sur laquelle l'utilisateur bâtirait une comparaison.
 */
export function dureeEnMinutes(startTime: string | null, fin: Date = new Date()): number | null {
  if (!startTime) return null;

  const debut = new Date(startTime);
  if (Number.isNaN(debut.getTime())) return null;

  return Math.max(0, Math.round((fin.getTime() - debut.getTime()) / 60000));
}

/**
 * Lundi zéro heure de la semaine contenant `reference`, dans le fuseau de l'appareil.
 *
 * B1 §9 BR-1 : « semaine calendaire courante (lundi → dimanche) ». `getDay()` rend 0 pour
 * dimanche : le décalage ramène le dimanche six jours en arrière, pas au lendemain.
 *
 * B1 §10 : « changement de fuseau horaire → semaine calculée sur le fuseau actuel du
 * device ». C'est exactement ce que fait `Date` en local, sans conversion.
 */
export function debutDeSemaine(reference: Date = new Date()): Date {
  const jour = reference.getDay();
  const recul = jour === 0 ? 6 : jour - 1;

  const lundi = new Date(reference);
  lundi.setDate(lundi.getDate() - recul);
  lundi.setHours(0, 0, 0, 0);

  return lundi;
}

/** `AAAA-MM-JJ` local, le format du champ `date` de Django. */
function enJour(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Les séances dont le jour tombe dans `[debut, fin[`. Comparaison de chaînes triables. */
export function seancesEntre(
  seances: readonly WorkoutSession[],
  debut: Date,
  fin: Date,
): WorkoutSession[] {
  const depuis = enJour(debut);
  const jusqua = enJour(fin);

  return seances.filter((s) => s.date >= depuis && s.date < jusqua);
}

/**
 * Variation en pourcentage entre deux volumes.
 *
 * B1 §9 BR-3 : NON AFFICHÉE si le volume précédent vaut 0 — d'où le `null`. Une division
 * par zéro maquillée en « +∞ % » ou en « +100 % » raconterait une progression qui n'a
 * aucun sens : on ne progresse pas depuis rien.
 */
export function variationPourCent(courant: number, precedent: number): number | null {
  if (precedent <= 0) return null;
  return ((courant - precedent) / precedent) * 100;
}

/** Un record battu, daté — B1 §6, les PR-cards du carrousel. */
export type RecordRecent = {
  exerciceId: string;
  estime: number;
  /** Jour de la séance où il est tombé, `AAAA-MM-JJ`. */
  date: string;
};

/**
 * Les records les plus récents, un par exercice — B1 §9 BR-5.
 *
 * « Un 1RM estimé qui dépasse le précédent record connu, trié par date décroissante,
 * limité à 5 entrées. » L'historique est donc parcouru du plus ANCIEN au plus récent : un
 * record ne se juge que contre ce qui le précède.
 *
 * UN SEUL RECORD PAR EXERCICE. Trois séries de plus en plus lourdes produisent trois
 * dépassements successifs ; les afficher toutes remplirait les cinq places avec le même
 * mouvement. Seul le dernier est gardé — c'est aussi le plus élevé, puisqu'il a battu les
 * précédents.
 *
 * Les échauffements sont écartés, comme partout ailleurs dans ce fichier.
 */
export function recordsRecents(
  seances: readonly WorkoutSession[],
  limite = 5,
): RecordRecent[] {
  const chronologique = [...seances].sort((a, b) => a.date.localeCompare(b.date));

  const meilleurs = new Map<string, number>();
  const evenements: RecordRecent[] = [];

  for (const seance of chronologique) {
    for (const serie of seance.sets) {
      if (serie.is_warmup) continue;

      const estime = unRepMax(serie);
      if (estime <= 0) continue;

      if (estime > (meilleurs.get(serie.exercise) ?? 0)) {
        meilleurs.set(serie.exercise, estime);
        evenements.push({ exerciceId: serie.exercise, estime, date: seance.date });
      }
    }
  }

  const vus = new Set<string>();
  const recents: RecordRecent[] = [];

  for (let i = evenements.length - 1; i >= 0 && recents.length < limite; i -= 1) {
    const evenement = evenements[i];
    if (vus.has(evenement.exerciceId)) continue;

    vus.add(evenement.exerciceId);
    recents.push(evenement);
  }

  return recents;
}
