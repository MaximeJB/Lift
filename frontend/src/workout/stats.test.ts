import type { WorkoutSession, WorkoutSet } from '../shared/api';

import {
  debutDeSemaine,
  dureeEnMinutes,
  meilleurParExercice,
  recordsBattus,
  recordsRecents,
  seancesEntre,
  unRepMax,
  unRepMaxDe,
  variationPourCent,
  volume,
} from './stats';

/**
 * Les formules que trois écrans affichent — B1, C6 et C8. Le tableau de traçabilité de la
 * Phase 5 de la spec exige qu'elles soient « identiques partout » : ces tests sont ce qui
 * l'empêche de dériver.
 *
 * `weight_kg` est écrit en CHAÎNE partout, comme le fait DRF pour un `DecimalField`. Le
 * tester avec des nombres masquerait la conversion, et c'est justement là que ça casse.
 */
function serie(partiel: Partial<WorkoutSet> = {}): WorkoutSet {
  return {
    id: Math.random().toString(36).slice(2),
    workout_session: 'seance-1',
    exercise: 'bench',
    set_number: 1,
    weight_kg: '80',
    reps: 8,
    rpe: null,
    duration_seconds: null,
    rest_seconds: null,
    notes: '',
    is_warmup: false,
    is_failure: false,
    created_at: '',
    updated_at: '',
    synced_at: null,
    ...partiel,
  };
}

function seance(date: string, sets: WorkoutSet[], id = date): WorkoutSession {
  return {
    id,
    user: 'u1',
    template: null,
    title: `Séance ${date}`,
    date,
    start_time: null,
    end_time: null,
    duration_minutes: null,
    notes: '',
    sets,
    created_at: '',
    updated_at: '',
    synced_at: null,
  };
}

describe('volume', () => {
  it('somme poids × répétitions', () => {
    expect(volume([serie({ weight_kg: '80', reps: 8 }), serie({ weight_kg: '60', reps: 10 })])).toBe(
      1240,
    );
  });

  it('exclut les séries d’échauffement — B1 §9 BR-2', () => {
    const series = [serie({ weight_kg: '80', reps: 8 }), serie({ weight_kg: '40', reps: 12, is_warmup: true })];
    expect(volume(series)).toBe(640);
  });

  it('vaut 0 sans série, plutôt que NaN', () => {
    expect(volume([])).toBe(0);
  });

  it('traite une charge illisible comme 0 au lieu de contaminer la somme', () => {
    expect(volume([serie({ weight_kg: 'abc', reps: 8 }), serie({ weight_kg: '80', reps: 8 })])).toBe(
      640,
    );
  });
});

describe('unRepMax — formule d’Epley', () => {
  it('applique poids × (1 + reps/30)', () => {
    expect(unRepMax(serie({ weight_kg: '100', reps: 10 }))).toBeCloseTo((100 * 40) / 30, 6);
  });

  it('rend le poids lui-même à une seule répétition — B1 §10', () => {
    // 140 × (1 + 1/30) = 140 × 31/30. La fraction exacte évite une décimale tronquée
    // qui échouerait sur la précision demandée.
    expect(unRepMax(serie({ weight_kg: '140', reps: 1 }))).toBeCloseTo((140 * 31) / 30, 6);
  });

  it('vaut 0 sans charge : un exercice en durée n’a pas de 1RM', () => {
    expect(unRepMaxDe(null, 30)).toBe(0);
    expect(unRepMaxDe('0', 10)).toBe(0);
    expect(unRepMaxDe('80', 0)).toBe(0);
  });
});

describe('meilleurParExercice', () => {
  it('garde le meilleur estimé de chaque exercice', () => {
    const meilleurs = meilleurParExercice([
      serie({ exercise: 'bench', weight_kg: '80', reps: 8 }),
      serie({ exercise: 'bench', weight_kg: '90', reps: 5 }),
      serie({ exercise: 'squat', weight_kg: '100', reps: 5 }),
    ]);

    expect(meilleurs.get('bench')).toBeCloseTo(105, 0);
    expect(meilleurs.get('squat')).toBeCloseTo((100 * 35) / 30, 6);
  });

  it('ignore les échauffements, même lourds', () => {
    const meilleurs = meilleurParExercice([
      serie({ exercise: 'bench', weight_kg: '200', reps: 5, is_warmup: true }),
      serie({ exercise: 'bench', weight_kg: '80', reps: 8 }),
    ]);

    expect(meilleurs.get('bench')).toBeCloseTo((80 * 38) / 30, 6);
  });
});

describe('recordsBattus', () => {
  it('signale un dépassement du meilleur antérieur', () => {
    const records = recordsBattus(
      [serie({ exercise: 'bench', weight_kg: '100', reps: 5 })],
      [serie({ exercise: 'bench', weight_kg: '80', reps: 5 })],
    );

    expect(records).toHaveLength(1);
    expect(records[0].exerciceId).toBe('bench');
    expect(records[0].precedent).toBeCloseTo((80 * 35) / 30, 6);
  });

  it('ne signale rien quand la séance est en dessous', () => {
    expect(
      recordsBattus(
        [serie({ exercise: 'bench', weight_kg: '70', reps: 5 })],
        [serie({ exercise: 'bench', weight_kg: '100', reps: 5 })],
      ),
    ).toHaveLength(0);
  });

  it('traite un exercice jamais chargé comme un record, précédent à 0', () => {
    const records = recordsBattus([serie({ exercise: 'squat', weight_kg: '60', reps: 5 })], []);
    expect(records[0].precedent).toBe(0);
  });
});

describe('debutDeSemaine — lundi → dimanche, B1 §9 BR-1', () => {
  it('ramène un mercredi au lundi de la même semaine', () => {
    // 2026-08-05 est un mercredi.
    expect(debutDeSemaine(new Date(2026, 7, 5, 14, 30)).getDate()).toBe(3);
  });

  it('ramène un dimanche SIX jours en arrière, pas au lendemain', () => {
    // 2026-08-09 est un dimanche : la semaine commence le lundi 3.
    expect(debutDeSemaine(new Date(2026, 7, 9, 23, 59)).getDate()).toBe(3);
  });

  it('laisse un lundi sur place et remet l’heure à zéro', () => {
    const lundi = debutDeSemaine(new Date(2026, 7, 3, 18, 45));
    expect(lundi.getDate()).toBe(3);
    expect(lundi.getHours()).toBe(0);
  });
});

describe('seancesEntre', () => {
  const seances = [seance('2026-08-02', []), seance('2026-08-03', []), seance('2026-08-09', [])];

  it('inclut la borne de début et exclut celle de fin', () => {
    const retenues = seancesEntre(seances, new Date(2026, 7, 3), new Date(2026, 7, 10));
    expect(retenues.map((s) => s.date)).toEqual(['2026-08-03', '2026-08-09']);
  });
});

describe('variationPourCent — B1 §9 BR-3', () => {
  it('calcule la progression', () => {
    expect(variationPourCent(1200, 1000)).toBeCloseTo(20);
  });

  it('rend null quand la période précédente vaut 0, au lieu de diviser par zéro', () => {
    expect(variationPourCent(1200, 0)).toBeNull();
  });

  it('rend une valeur négative pour une baisse', () => {
    expect(variationPourCent(800, 1000)).toBeCloseTo(-20);
  });
});

describe('recordsRecents — B1 §9 BR-5', () => {
  it('ne garde qu’un record par exercice, le plus récent', () => {
    const records = recordsRecents([
      seance('2026-08-01', [serie({ exercise: 'bench', weight_kg: '80', reps: 5 })]),
      seance('2026-08-05', [serie({ exercise: 'bench', weight_kg: '90', reps: 5 })]),
      seance('2026-08-06', [serie({ exercise: 'bench', weight_kg: '100', reps: 5 })]),
    ]);

    expect(records).toHaveLength(1);
    expect(records[0].date).toBe('2026-08-06');
  });

  it('trie par date décroissante', () => {
    const records = recordsRecents([
      seance('2026-08-01', [serie({ exercise: 'bench', weight_kg: '80', reps: 5 })]),
      seance('2026-08-05', [serie({ exercise: 'squat', weight_kg: '120', reps: 5 })]),
    ]);

    expect(records.map((r) => r.exerciceId)).toEqual(['squat', 'bench']);
  });

  it('juge un record contre ce qui le PRÉCÈDE, pas contre la suite', () => {
    // La séance la plus lourde arrive en premier dans la liste, comme le renvoie l'API,
    // triée par date décroissante. La plus ancienne ne doit pas être vue comme un record.
    const records = recordsRecents([
      seance('2026-08-06', [serie({ exercise: 'bench', weight_kg: '100', reps: 5 })]),
      seance('2026-08-01', [serie({ exercise: 'bench', weight_kg: '80', reps: 5 })]),
    ]);

    expect(records).toHaveLength(1);
    expect(records[0].date).toBe('2026-08-06');
  });

  it('se limite à cinq entrées', () => {
    const seances = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((exercice, i) =>
      seance(`2026-08-0${i + 1}`, [serie({ exercise: exercice, weight_kg: '80', reps: 5 })]),
    );

    expect(recordsRecents(seances)).toHaveLength(5);
  });

  it('ignore les échauffements', () => {
    expect(
      recordsRecents([
        seance('2026-08-01', [serie({ weight_kg: '200', reps: 5, is_warmup: true })]),
      ]),
    ).toHaveLength(0);
  });
});

describe('dureeEnMinutes', () => {
  it('mesure l’écart entre deux instants', () => {
    const duree = dureeEnMinutes('2026-08-03T14:00:00.000Z', new Date('2026-08-03T15:12:00.000Z'));
    expect(duree).toBe(72);
  });

  it('rend null sans instant de début plutôt qu’une durée fausse', () => {
    expect(dureeEnMinutes(null)).toBeNull();
  });

  it('rend null sur une date illisible', () => {
    expect(dureeEnMinutes('pas une date')).toBeNull();
  });
});
