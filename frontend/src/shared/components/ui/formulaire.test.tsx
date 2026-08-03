import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { Checkbox } from './Checkbox';
import { Input } from './Input';
import { PasswordInput } from './PasswordInput';
import { SearchInput } from './SearchInput';

/**
 * Les composants de saisie. Deux règles d'accessibilité non négociables — libellé
 * explicite, cible de 44pt — et deux pièges déjà rencontrés en production.
 *
 * Le contour du champ n'est porté par aucun `testID` : c'est une vue de structure. On lit
 * donc les classes de tout l'arbre, ce qui a l'avantage de ne rien supposer de la forme
 * interne du composant.
 */
type Noeud = { props?: { className?: unknown }; children?: unknown[] } | null;

function classesDeLArbre(noeud: unknown): string[] {
  const n = noeud as Noeud;
  if (!n || typeof n !== 'object') return [];

  const ici = typeof n.props?.className === 'string' ? [n.props.className as string] : [];
  const enfants = Array.isArray(n.children) ? n.children.flatMap(classesDeLArbre) : [];

  return [...ici, ...enfants];
}

async function rendre(element: React.ReactElement) {
  const rendu = await render(element);
  return () => classesDeLArbre(rendu.toJSON()).join(' ');
}

/**
 * Avec le rendu asynchrone de RNTL 14, une mise a jour d'etat declenchee par un evenement
 * n'est pas encore appliquee au retour de `fireEvent`. L'envelopper dans `act` vide la
 * file de React avant qu'on relise l'arbre.
 */
async function declencher(element: unknown, nom: string) {
  await act(async () => {
    fireEvent(element as never, nom);
  });
}

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

describe('Input — le libellé', () => {
  /** A2 §11 : label explicite sur chaque champ, jamais un placeholder seul. */
  it('affiche le libellé au-dessus du champ', async () => {
    await render(<Input label="Adresse email" testID="champ" />);
    expect(screen.getByText('Adresse email')).toBeTruthy();
  });

  it('recopie le libellé dans accessibilityLabel', async () => {
    await render(<Input label="Adresse email" testID="champ" />);
    expect(screen.getByTestId('champ').props.accessibilityLabel).toBe('Adresse email');
  });
});

describe('Input — les trois états du filet', () => {
  it('Default : contour à 3,31:1 contre la page', async () => {
    const classes = await rendre(<Input label="Poids" testID="champ" />);
    expect(classes()).toContain('border-control-border');
  });

  it('Focus : le champ actif devient le point accentué', async () => {
    const classes = await rendre(<Input label="Poids" testID="champ" />);

    await declencher(screen.getByTestId('champ'), 'focus');

    expect(classes()).toContain('border-control-border-focus');
  });

  it('Error : le filet passe en alerte, et le message s’affiche', async () => {
    const classes = await rendre(
      <Input label="Poids" testID="champ" error="Au moins 8 caractères." />,
    );

    expect(classes()).toContain('border-field-border-error');
    expect(screen.getByText('Au moins 8 caractères.')).toBeTruthy();
  });

  it('l’erreur prime sur le focus', async () => {
    const classes = await rendre(<Input label="Poids" testID="champ" error="Invalide." />);

    await declencher(screen.getByTestId('champ'), 'focus');

    expect(classes()).toContain('border-field-border-error');
    expect(classes()).not.toContain('border-control-border-focus');
  });

  /** A2 §11 : l'erreur est annoncée dès qu'elle apparaît, sans voler le focus. */
  it('annonce l’erreur en région live polie', async () => {
    await render(<Input label="Poids" testID="champ" error="Invalide." />);
    expect(screen.getByText('Invalide.').props.accessibilityLiveRegion).toBe('polite');
  });

  it('n’affiche aucun message quand il n’y a pas d’erreur', async () => {
    await render(<Input label="Poids" testID="champ" />);
    expect(screen.queryByText('Invalide.')).toBeNull();
  });
});

describe('Input — le piège du spread', () => {
  /**
   * LE BUG DU 02/08/2026. Le spread `{...rest}` était appliqué APRÈS `onFocus` et
   * `onBlur` : un `onBlur` passé par l'appelant — comme le fait A3 sur ses quatre champs —
   * ÉCRASAIT celui qui remet le filet en état Default. Le champ restait marqué actif après
   * l'avoir quitté, sans la moindre erreur pour le signaler.
   */
  it('un onBlur passé par l’appelant ne remplace pas celui du composant', async () => {
    const surSortie = jest.fn();
    const classes = await rendre(<Input label="Poids" testID="champ" onBlur={surSortie} />);

    await declencher(screen.getByTestId('champ'), 'focus');
    expect(classes()).toContain('border-control-border-focus');

    await declencher(screen.getByTestId('champ'), 'blur');

    expect(surSortie).toHaveBeenCalledTimes(1);
    expect(classes()).toContain('border-control-border');
    expect(classes()).not.toContain('border-control-border-focus');
  });

  it('un onFocus passé par l’appelant s’ajoute au comportement interne', async () => {
    const surEntree = jest.fn();
    const classes = await rendre(<Input label="Poids" testID="champ" onFocus={surEntree} />);

    await declencher(screen.getByTestId('champ'), 'focus');

    expect(surEntree).toHaveBeenCalledTimes(1);
    expect(classes()).toContain('border-control-border-focus');
  });

  it('transmet la saisie à l’appelant', async () => {
    const surSaisie = jest.fn();
    await render(<Input label="Poids" testID="champ" onChangeText={surSaisie} />);

    await saisir(screen.getByTestId('champ'), '82.5');

    expect(surSaisie).toHaveBeenCalledWith('82.5');
  });
});

describe('PasswordInput', () => {
  it('masque le texte par défaut', async () => {
    await render(<PasswordInput label="Mot de passe" testID="champ" />);
    expect(screen.getByTestId('champ').props.secureTextEntry).toBe(true);
  });

  /** A2 §11 exige un accessibilityLabel DYNAMIQUE sur la bascule. */
  it('la bascule annonce l’action à venir, pas l’état courant', async () => {
    await render(<PasswordInput label="Mot de passe" testID="champ" />);

    const bascule = screen.getByLabelText('Afficher le mot de passe');
    await presser(bascule);

    expect(screen.getByLabelText('Masquer le mot de passe')).toBeTruthy();
  });

  it('révèle puis remasque le texte', async () => {
    await render(<PasswordInput label="Mot de passe" testID="champ" />);

    await presser(screen.getByLabelText('Afficher le mot de passe'));
    expect(screen.getByTestId('champ').props.secureTextEntry).toBe(false);

    await presser(screen.getByLabelText('Masquer le mot de passe'));
    expect(screen.getByTestId('champ').props.secureTextEntry).toBe(true);
  });

  it('n’autorise ni majuscule automatique ni correction', async () => {
    await render(<PasswordInput label="Mot de passe" testID="champ" />);

    const champ = screen.getByTestId('champ');
    expect(champ.props.autoCapitalize).toBe('none');
    expect(champ.props.autoCorrect).toBe(false);
  });
});

describe('SearchInput — le debounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  /**
   * C1 §13 impose 350 ms. Sans ce délai, chaque frappe partirait au serveur : cinq
   * requêtes pour un mot, sur un catalogue de 873 exercices.
   */
  it('n’émet qu’un appel pour cinq frappes rapprochées', async () => {
    const chercher = jest.fn();
    await render(<SearchInput label="Rechercher" testID="champ" onSearch={chercher} />);

    // Le montage déclenche déjà un appel avec une requête vide : c'est lui qui charge la
    // première page. On repart de zéro pour ne mesurer que la saisie.
    await act(async () => {
      jest.advanceTimersByTime(400);
    });
    chercher.mockClear();

    for (const texte of ['b', 'be', 'ben', 'benc', 'bench']) {
      await saisir(screen.getByTestId('champ'), texte);
    }

    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    expect(chercher).toHaveBeenCalledTimes(1);
    expect(chercher).toHaveBeenCalledWith('bench');
  });

  it('n’émet rien avant la fin du délai', async () => {
    const chercher = jest.fn();
    await render(<SearchInput label="Rechercher" testID="champ" onSearch={chercher} />);

    await act(async () => {
      jest.advanceTimersByTime(400);
    });
    chercher.mockClear();

    await saisir(screen.getByTestId('champ'), 'bench');
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(chercher).not.toHaveBeenCalled();
  });

  /** C'est ce premier appel qui charge la liste complète à l'ouverture de C1. */
  it('émet une requête vide au montage', async () => {
    const chercher = jest.fn();
    await render(<SearchInput label="Rechercher" testID="champ" onSearch={chercher} />);

    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    expect(chercher).toHaveBeenCalledWith('');
  });
});

describe('SearchInput — le bouton effacer', () => {
  it('n’apparaît que lorsqu’il y a quelque chose à effacer', async () => {
    await render(<SearchInput label="Rechercher" testID="champ" onSearch={() => {}} />);

    expect(screen.queryByLabelText('Effacer la recherche')).toBeNull();

    await saisir(screen.getByTestId('champ'), 'bench');
    expect(screen.getByLabelText('Effacer la recherche')).toBeTruthy();
  });

  it('vide le champ', async () => {
    await render(<SearchInput label="Rechercher" testID="champ" onSearch={() => {}} />);

    await saisir(screen.getByTestId('champ'), 'bench');
    await presser(screen.getByLabelText('Effacer la recherche'));

    expect(screen.getByTestId('champ').props.value).toBe('');
  });
});

describe('Checkbox', () => {
  /** A3 §9 BR-4 : jamais pré-cochée. C'est l'appelant qui garantit l'état initial. */
  it('annonce son rôle et son état au lecteur d’écran', async () => {
    await render(
      <Checkbox checked={false} onToggle={() => {}}>
        <></>
      </Checkbox>,
    );

    const case_ = screen.getByRole('checkbox');
    expect(case_.props.accessibilityState).toEqual({ checked: false });
  });

  it('bascule vers l’état inverse, jamais vers une valeur figée', async () => {
    const basculer = jest.fn();
    await render(
      <Checkbox checked onToggle={basculer}>
        <></>
      </Checkbox>,
    );

    await presser(screen.getByRole('checkbox'));

    expect(basculer).toHaveBeenCalledWith(false);
  });

  /**
   * Le carré fait 12pt ; `hitSlop` porte la cible réelle à 44pt (A2 §11). Sans lui, un
   * carré de cette taille serait intappable en pleine séance.
   */
  it('atteint 44pt de cible tactile par hitSlop', async () => {
    await render(
      <Checkbox checked={false} onToggle={() => {}}>
        <></>
      </Checkbox>,
    );

    expect(screen.getByRole('checkbox').props.hitSlop).toBe(14);
  });

  it('la zone tappable est le carré, pas toute la ligne', async () => {
    const basculer = jest.fn();
    await render(
      <Checkbox checked={false} onToggle={basculer}>
        <></>
      </Checkbox>,
    );

    // Un seul élément porte le rôle : les liens du texte restent atteignables seuls.
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
  });
});
