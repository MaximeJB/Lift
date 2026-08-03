import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { RestTimerWidget, SECONDES_PAR_CELLULE } from './RestTimerWidget';
import { champsPour, SetInputForm } from './SetInputForm';
import { SetRow, type LoggedSet } from './SetRow';

/**
 * Le cœur de C5. La ligne de série est l'élément le plus répété de l'application — 15 à 30
 * par séance — et le formulaire a SIX variantes selon `exercise_type`, avec des libellés
 * différents pour la même paire de champs.
 */
async function presser(element: unknown) {
  await act(async () => {
    fireEvent.press(element as never);
  });
}

async function saisir(element: unknown, texte: string) {
  await act(async () => {
    fireEvent.changeText(element as never, texte);
  });
}

const texteDeLArbre = (noeud: unknown): string[] => {
  const n = noeud as { children?: unknown[] } | string | null;
  if (typeof n === 'string') return [n];
  if (!n || typeof n !== 'object') return [];
  return Array.isArray(n.children) ? n.children.flatMap(texteDeLArbre) : [];
};

describe('champsPour — les six types de C5 §7', () => {
  it('WEIGHT_REPS : poids et répétitions', () => {
    const champs = champsPour('WEIGHT_REPS');
    expect(champs.poidsLabel).toBe('Poids');
    expect(champs.reps).toBe(true);
    expect(champs.duree).toBe(false);
  });

  /** Trois gestes différents, trois mots différents pour la même paire de champs. */
  it('BODYWEIGHT_WEIGHTED : la charge est ADDITIONNELLE', () => {
    expect(champsPour('BODYWEIGHT_WEIGHTED').poidsLabel).toBe('Charge additionnelle');
  });

  it('BODYWEIGHT_ASSISTED : la charge est une ASSISTANCE', () => {
    expect(champsPour('BODYWEIGHT_ASSISTED').poidsLabel).toBe('Assistance');
  });

  it('REPS_ONLY : aucune charge', () => {
    const champs = champsPour('REPS_ONLY');
    expect(champs.poidsLabel).toBeNull();
    expect(champs.reps).toBe(true);
  });

  /** C5 §16, anti-pattern explicite : jamais poids+reps sur un exercice en durée. */
  it('DURATION : ni charge, ni répétitions, ni RPE', () => {
    const champs = champsPour('DURATION');
    expect(champs.poidsLabel).toBeNull();
    expect(champs.reps).toBe(false);
    expect(champs.duree).toBe(true);
    expect(champs.rpe).toBe(false);
  });

  it('DISTANCE_DURATION : la distance passe par les notes, repli assumé', () => {
    const champs = champsPour('DISTANCE_DURATION');
    expect(champs.duree).toBe(true);
    expect(champs.notesLabel).toBe('Distance');
    expect(champs.rpe).toBe(false);
  });

  /**
   * 653 exercices sur 873 ont un `exercise_type` VIDE, et quatre portent des valeurs
   * absentes de `TRAINING_FORMAT_CHOICES`. Le repli couvre trois exercices sur quatre.
   */
  it('type vide : repli sur poids et répétitions', () => {
    expect(champsPour('')).toEqual(champsPour('WEIGHT_REPS'));
  });

  it('type inconnu : même repli, sans lever', () => {
    expect(champsPour('SHORT_DISTANCE_WEIGHT')).toEqual(champsPour('WEIGHT_REPS'));
    expect(champsPour('STEPS_DURATION')).toEqual(champsPour('WEIGHT_REPS'));
  });

  it('le RPE est disponible partout sauf sur les formats en durée', () => {
    expect(champsPour('WEIGHT_REPS').rpe).toBe(true);
    expect(champsPour('REPS_ONLY').rpe).toBe(true);
    expect(champsPour('DURATION').rpe).toBe(false);
    expect(champsPour('DISTANCE_DURATION').rpe).toBe(false);
  });
});

describe('SetInputForm — ce qui s’affiche', () => {
  it('WEIGHT_REPS montre les deux champs', async () => {
    await render(<SetInputForm exerciseType="WEIGHT_REPS" onValider={async () => {}} />);

    expect(screen.getByLabelText('Poids')).toBeTruthy();
    expect(screen.getByLabelText('Répétitions')).toBeTruthy();
  });

  it('DURATION ne montre NI poids NI répétitions', async () => {
    await render(<SetInputForm exerciseType="DURATION" onValider={async () => {}} />);

    expect(screen.queryByLabelText('Poids')).toBeNull();
    expect(screen.queryByLabelText('Répétitions')).toBeNull();
    expect(screen.getByLabelText('Durée')).toBeTruthy();
  });

  it('DURATION ne montre pas le sélecteur de RPE', async () => {
    await render(<SetInputForm exerciseType="DURATION" onValider={async () => {}} />);
    expect(screen.queryByLabelText('RPE 8')).toBeNull();
  });

  it('le sélecteur de RPE offre les dix valeurs', async () => {
    await render(<SetInputForm exerciseType="WEIGHT_REPS" onValider={async () => {}} />);

    for (const n of [1, 5, 10]) {
      expect(screen.getByLabelText(`RPE ${n}`)).toBeTruthy();
    }
  });
});

describe('SetInputForm — validation client, C5 §9 BR-2', () => {
  /**
   * Le modèle Django n'a AUCUN validateur sur `weight_kg` et `reps`. Cette vérification
   * est donc la seule qui existe avant l'écriture.
   */
  it('refuse de valider tant que les champs sont vides', async () => {
    const valider = jest.fn();
    await render(<SetInputForm exerciseType="WEIGHT_REPS" onValider={valider} />);

    await presser(screen.getByText('+ Ajouter une série'));

    expect(valider).not.toHaveBeenCalled();
  });

  it('refuse un poids à zéro', async () => {
    const valider = jest.fn();
    await render(<SetInputForm exerciseType="WEIGHT_REPS" onValider={valider} />);

    await saisir(screen.getByLabelText('Poids'), '0');
    await saisir(screen.getByLabelText('Répétitions'), '8');
    await presser(screen.getByText('+ Ajouter une série'));

    expect(valider).not.toHaveBeenCalled();
  });

  it('refuse zéro répétition', async () => {
    const valider = jest.fn();
    await render(<SetInputForm exerciseType="WEIGHT_REPS" onValider={valider} />);

    await saisir(screen.getByLabelText('Poids'), '80');
    await saisir(screen.getByLabelText('Répétitions'), '0');
    await presser(screen.getByText('+ Ajouter une série'));

    expect(valider).not.toHaveBeenCalled();
  });

  it('accepte une série complète', async () => {
    const valider = jest.fn().mockResolvedValue(undefined);
    await render(<SetInputForm exerciseType="WEIGHT_REPS" onValider={valider} />);

    await saisir(screen.getByLabelText('Poids'), '80');
    await saisir(screen.getByLabelText('Répétitions'), '8');
    await presser(screen.getByText('+ Ajouter une série'));

    expect(valider).toHaveBeenCalledWith(
      expect.objectContaining({ poidsKg: '80', reps: 8, is_warmup: false, is_failure: false }),
    );
  });

  it('n’exige pas de poids sur un exercice en répétitions seules', async () => {
    const valider = jest.fn().mockResolvedValue(undefined);
    await render(<SetInputForm exerciseType="REPS_ONLY" onValider={valider} />);

    await saisir(screen.getByLabelText('Répétitions'), '12');
    await presser(screen.getByText('+ Ajouter une série'));

    expect(valider).toHaveBeenCalledWith(expect.objectContaining({ poidsKg: null, reps: 12 }));
  });
});

describe('SetInputForm — la durée, deux écritures acceptées', () => {
  it('un nombre seul vaut des secondes', async () => {
    const valider = jest.fn().mockResolvedValue(undefined);
    await render(<SetInputForm exerciseType="DURATION" onValider={valider} />);

    await saisir(screen.getByLabelText('Durée'), '45');
    await presser(screen.getByText('+ Ajouter une série'));

    expect(valider).toHaveBeenCalledWith(expect.objectContaining({ dureeSecondes: 45 }));
  });

  it('`mm:ss` est converti en secondes', async () => {
    const valider = jest.fn().mockResolvedValue(undefined);
    await render(<SetInputForm exerciseType="DURATION" onValider={valider} />);

    await saisir(screen.getByLabelText('Durée'), '1:30');
    await presser(screen.getByText('+ Ajouter une série'));

    expect(valider).toHaveBeenCalledWith(expect.objectContaining({ dureeSecondes: 90 }));
  });

  it('une saisie illisible bloque la validation', async () => {
    const valider = jest.fn();
    await render(<SetInputForm exerciseType="DURATION" onValider={valider} />);

    await saisir(screen.getByLabelText('Durée'), 'bientôt');
    await presser(screen.getByText('+ Ajouter une série'));

    expect(valider).not.toHaveBeenCalled();
  });

  it('une durée nulle bloque la validation', async () => {
    const valider = jest.fn();
    await render(<SetInputForm exerciseType="DURATION" onValider={valider} />);

    await saisir(screen.getByLabelText('Durée'), '0');
    await presser(screen.getByText('+ Ajouter une série'));

    expect(valider).not.toHaveBeenCalled();
  });
});

describe('SetInputForm — après validation', () => {
  /**
   * Une série suit presque toujours la précédente au même poids : remettre les champs à
   * zéro obligerait à retaper 80 et 8 quinze fois par séance.
   */
  it('garde le poids et les répétitions', async () => {
    const valider = jest.fn().mockResolvedValue(undefined);
    await render(<SetInputForm exerciseType="WEIGHT_REPS" onValider={valider} />);

    await saisir(screen.getByLabelText('Poids'), '80');
    await saisir(screen.getByLabelText('Répétitions'), '8');
    await presser(screen.getByText('+ Ajouter une série'));

    expect(screen.getByLabelText('Poids').props.value).toBe('80');
    expect(screen.getByLabelText('Répétitions').props.value).toBe('8');
  });

  /** Ils changent d'une série à l'autre, et un échauffement resté coché fausserait tout. */
  it('remet le RPE et l’échauffement à zéro', async () => {
    const valider = jest.fn().mockResolvedValue(undefined);
    await render(<SetInputForm exerciseType="WEIGHT_REPS" onValider={valider} />);

    await saisir(screen.getByLabelText('Poids'), '80');
    await saisir(screen.getByLabelText('Répétitions'), '8');
    await presser(screen.getByLabelText('RPE 8'));
    await presser(screen.getByRole('checkbox'));

    await presser(screen.getByText('+ Ajouter une série'));
    expect(valider).toHaveBeenCalledWith(expect.objectContaining({ rpe: 8, is_warmup: true }));

    await presser(screen.getByText('+ Ajouter une série'));
    expect(valider).toHaveBeenLastCalledWith(
      expect.objectContaining({ rpe: null, is_warmup: false }),
    );
  });

  it('le RPE se retire d’un second tap sur la même valeur', async () => {
    const valider = jest.fn().mockResolvedValue(undefined);
    await render(<SetInputForm exerciseType="WEIGHT_REPS" onValider={valider} />);

    await saisir(screen.getByLabelText('Poids'), '80');
    await saisir(screen.getByLabelText('Répétitions'), '8');
    await presser(screen.getByLabelText('RPE 8'));
    await presser(screen.getByLabelText('RPE 8'));
    await presser(screen.getByText('+ Ajouter une série'));

    expect(valider).toHaveBeenCalledWith(expect.objectContaining({ rpe: null }));
  });
});

describe('SetInputForm — l’appui long, C5 §7', () => {
  it('enregistre la série comme menée à l’échec', async () => {
    const valider = jest.fn().mockResolvedValue(undefined);
    await render(<SetInputForm exerciseType="WEIGHT_REPS" onValider={valider} />);

    await saisir(screen.getByLabelText('Poids'), '80');
    await saisir(screen.getByLabelText('Répétitions'), '5');

    await act(async () => {
      fireEvent(screen.getByText('+ Ajouter une série'), 'longPress');
    });

    expect(valider).toHaveBeenCalledWith(expect.objectContaining({ is_failure: true }));
  });

  /** Un geste caché n'est pas découvrable : l'indice est aussi ce qu'annonce le lecteur d'écran. */
  it('porte un indice d’accessibilité qui l’explique', async () => {
    await render(<SetInputForm exerciseType="WEIGHT_REPS" onValider={async () => {}} />);

    const bouton = screen.getByRole('button', { name: '+ Ajouter une série' });
    expect(bouton.props.accessibilityHint).toMatch(/échec/i);
  });
});

describe('SetRow — les quatre marques', () => {
  const rendreLigne = async (set: LoggedSet) => {
    const rendu = await render(<SetRow set={set} />);
    return texteDeLArbre(rendu.toJSON()).join(' ');
  };

  it('affiche poids et répétitions', async () => {
    const texte = await rendreLigne({ numero: 3, poidsKg: '80', reps: 8 });
    expect(texte).toContain('80 kg × 8');
  });

  it('affiche une durée en minutes et secondes', async () => {
    const texte = await rendreLigne({ numero: 1, dureeSecondes: 90 });
    expect(texte).toContain('1:30');
  });

  it('affiche les répétitions seules quand il n’y a pas de charge', async () => {
    const texte = await rendreLigne({ numero: 1, reps: 12 });
    expect(texte).toContain('12 reps');
  });

  it('affiche un tiret quand il n’y a rien à montrer', async () => {
    const texte = await rendreLigne({ numero: 1 });
    expect(texte).toContain('—');
  });

  it('affiche le RPE seulement s’il est renseigné', async () => {
    expect(await rendreLigne({ numero: 1, poidsKg: '80', reps: 8, rpe: 7 })).toContain('RPE 7');
    expect(await rendreLigne({ numero: 1, poidsKg: '80', reps: 8 })).not.toContain('RPE');
  });

  /** Aucune couleur : l'accent est pris par le bouton de validation, et §12 interdit la seconde. */
  it('marque un échauffement', async () => {
    expect(await rendreLigne({ numero: 1, poidsKg: '40', reps: 12, is_warmup: true })).toContain(
      'ÉCH',
    );
  });

  it('marque une série menée à l’échec', async () => {
    expect(await rendreLigne({ numero: 5, poidsKg: '80', reps: 5, is_failure: true })).toContain(
      'ÉCHEC',
    );
  });

  it('l’échec prime sur l’échauffement', async () => {
    const texte = await rendreLigne({
      numero: 1,
      poidsKg: '80',
      reps: 5,
      is_warmup: true,
      is_failure: true,
    });

    expect(texte).toContain('ÉCHEC');
  });

  it('marque un record', async () => {
    expect(await rendreLigne({ numero: 3, poidsKg: '100', reps: 5, record: true })).toContain(
      'record',
    );
  });

  it('marque une série non synchronisée', async () => {
    expect(await rendreLigne({ numero: 1, poidsKg: '80', reps: 8, enAttente: true })).toContain(
      'NON SYNC',
    );
  });

  it('cumule record et non synchronisée — c’est le cas d’une coupure réseau', async () => {
    const texte = await rendreLigne({
      numero: 1,
      poidsKg: '100',
      reps: 5,
      record: true,
      enAttente: true,
    });

    expect(texte).toContain('record');
    expect(texte).toContain('NON SYNC');
  });

  it('n’affiche aucune marque sur une série ordinaire', async () => {
    const texte = await rendreLigne({ numero: 2, poidsKg: '80', reps: 8 });

    expect(texte).not.toContain('ÉCH');
    expect(texte).not.toContain('record');
    expect(texte).not.toContain('NON SYNC');
  });
});

describe('RestTimerWidget', () => {
  const rendreTimer = async (restant: number, total: number) => {
    const rendu = await render(
      <RestTimerWidget restant={restant} total={total} onAjuster={() => {}} onPasser={() => {}} />,
    );

    const compter = (noeud: unknown): number => {
      const n = noeud as { props?: { className?: string }; children?: unknown[] } | null;
      if (!n || typeof n !== 'object') return 0;
      const ici = n.props?.className?.includes('h-2 flex-1') ? 1 : 0;
      const enfants = Array.isArray(n.children) ? n.children.map(compter).reduce((a, b) => a + b, 0) : 0;
      return ici + enfants;
    };

    return { cellules: compter(rendu.toJSON()), texte: texteDeLArbre(rendu.toJSON()).join(' ') };
  };

  it('une cellule par tranche de 15 secondes', async () => {
    const { cellules } = await rendreTimer(90, 90);
    expect(cellules).toBe(6);
  });

  it('une seule cellule au plancher de 15 secondes', async () => {
    const { cellules } = await rendreTimer(15, 15);
    expect(cellules).toBe(1);
  });

  /** Une durée non multiple de 15 arrondit vers le haut : la dernière tranche existe. */
  it('arrondit vers le haut sur une durée intermédiaire', async () => {
    const { cellules } = await rendreTimer(100, 100);
    expect(cellules).toBe(7);
  });

  it('affiche toujours au moins une cellule, même à zéro', async () => {
    const { cellules } = await rendreTimer(0, 0);
    expect(cellules).toBe(1);
  });

  it('lit le décompte en minutes et secondes', async () => {
    expect((await rendreTimer(90, 90)).texte).toContain('1:30');
    expect((await rendreTimer(45, 90)).texte).toContain('0:45');
  });

  it('le pas des boutons vaut exactement une cellule', () => {
    expect(SECONDES_PAR_CELLULE).toBe(15);
  });

  it('ajuste par tranches de quinze, dans les deux sens', async () => {
    const ajuster = jest.fn();
    await render(
      <RestTimerWidget restant={90} total={90} onAjuster={ajuster} onPasser={() => {}} />,
    );

    await presser(screen.getByText('+15 s'));
    expect(ajuster).toHaveBeenCalledWith(15);

    await presser(screen.getByText('−15 s'));
    expect(ajuster).toHaveBeenCalledWith(-15);
  });

  it('« Passer » clôt le repos', async () => {
    const passer = jest.fn();
    await render(
      <RestTimerWidget restant={90} total={90} onAjuster={() => {}} onPasser={passer} />,
    );

    await presser(screen.getByText('Passer'));

    expect(passer).toHaveBeenCalledTimes(1);
  });

  /** C5 §12 : le décompte est annoncé périodiquement, pas à chaque seconde. */
  it('annonce le restant en secondes au lecteur d’écran', async () => {
    await render(
      <RestTimerWidget restant={42} total={90} onAjuster={() => {}} onPasser={() => {}} />,
    );

    expect(screen.getByLabelText('Repos, 42 secondes')).toBeTruthy();
  });
});
