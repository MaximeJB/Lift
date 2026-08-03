import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { Badge } from './Badge';
import { BlockedState } from './BlockedState';
import { ConfirmDialog } from './ConfirmDialog';
import { EmptyState } from './EmptyState';
import { ErrorBanner } from './ErrorBanner';
import { FilterChipsRow } from './FilterChipsRow';
import { ListItem } from './ListItem';
import { LoadingState } from './LoadingState';
import { PasswordStrengthMeter, evaluerForce } from './PasswordStrengthMeter';
import { ScreenHeader } from './ScreenHeader';
import { SectionHeader } from './SectionHeader';
import { SegmentedControl } from './SegmentedControl';
import { StatTile } from './StatTile';
import { SuccessState } from './SuccessState';
import { TabBarView } from './TabBar';
import { TextLink } from './TextLink';

/**
 * Le reste du catalogue. Chacun de ces composants porte une règle du système ou de la
 * spec — c'est ce qui est vérifié ici, pas leur apparence.
 */
async function presser(element: unknown) {
  await act(async () => {
    fireEvent.press(element as never);
  });
}

const classes = (testID: string) =>
  (screen.getByTestId(testID).props.className as string).trim().split(/\s+/);

/**
 * Certains rôles — `alert`, `tablist` — ne font pas partie des requêtes `getByRole` de
 * RNTL. On les cherche donc dans l'arbre, ce qui vérifie exactement la même chose : ce que
 * le composant déclare au système d'accessibilité.
 */
type NoeudRole = { props?: Record<string, unknown>; children?: unknown[] } | null;

function noeudsParRole(noeud: unknown, role: string): Record<string, unknown>[] {
  const n = noeud as NoeudRole;
  if (!n || typeof n !== 'object') return [];

  const ici = n.props?.accessibilityRole === role ? [n.props] : [];
  const enfants = Array.isArray(n.children)
    ? n.children.flatMap((e) => noeudsParRole(e, role))
    : [];

  return [...ici, ...enfants];
}

const texteDeLArbre = (noeud: unknown): string[] => {
  const n = noeud as { children?: unknown[] } | string | null;
  if (typeof n === 'string') return [n];
  if (!n || typeof n !== 'object') return [];
  return Array.isArray(n.children) ? n.children.flatMap(texteDeLArbre) : [];
};

describe('ListItem', () => {
  it('affiche titre et sous-titre', async () => {
    await render(<ListItem title="Bench Press" subtitle="CHEST" />);

    expect(screen.getByText('Bench Press')).toBeTruthy();
    expect(screen.getByText('CHEST')).toBeTruthy();
  });

  /** C1 §11 et C7 §11 : un seul label combiné, pour éviter trois annonces séparées. */
  it('combine titre, bande et sous-titre en un seul label accessible', async () => {
    await render(
      <ListItem title="Bench Press" subtitle="CHEST" banner="record" onPress={() => {}} />,
    );

    expect(screen.getByLabelText('Bench Press, record, CHEST')).toBeTruthy();
  });

  it('n’est tappable que si un gestionnaire est fourni', async () => {
    await render(<ListItem title="Bench Press" />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('transmet le tap', async () => {
    const ouvrir = jest.fn();
    await render(<ListItem title="Bench Press" onPress={ouvrir} />);

    await presser(screen.getByRole('button'));

    expect(ouvrir).toHaveBeenCalledTimes(1);
  });

  /** C7 §9 BR-2 : rien ne doit occuper d'espace si l'élément est absent. */
  it('n’affiche ni bande ni sous-titre quand ils manquent', async () => {
    const rendu = await render(<ListItem title="Bench Press" />);
    const textes = texteDeLArbre(rendu.toJSON());

    expect(textes).toEqual(['Bench Press']);
  });

  it('la bande absorbe le sous-titre plutôt que de le doubler', async () => {
    const rendu = await render(<ListItem title="Bench" subtitle="hier" banner="record" />);
    const textes = texteDeLArbre(rendu.toJSON());

    expect(textes.filter((t) => t === 'hier')).toHaveLength(1);
  });

  it('accepte la voix de section pour les listes courtes', async () => {
    await render(<ListItem title="Séance libre" titleVariant="section" />);
    expect(screen.getByText('Séance libre').props.className).toContain('text-section');
  });
});

describe('SectionHeader et ScreenHeader', () => {
  it('SectionHeader porte le rôle d’en-tête', async () => {
    await render(<SectionHeader>informations</SectionHeader>);
    expect(screen.getByRole('header')).toBeTruthy();
  });

  /** Changé le 03/08 : le mono était illisible pour un titre qu'on lit pendant l'effort. */
  it('SectionHeader parle la voix grotesque, pas le monospace', async () => {
    await render(<SectionHeader>Ab Crunch Machine</SectionHeader>);
    expect(screen.getByText('Ab Crunch Machine').props.className).toContain('text-section');
  });

  it('ScreenHeader affiche son titre en en-tête', async () => {
    await render(<ScreenHeader title="Profil" />);
    expect(screen.getByRole('header')).toBeTruthy();
  });

  it('ScreenHeader rend les attributs en couples clé/valeur', async () => {
    await render(
      <ScreenHeader
        title="Séance"
        attributes={[
          ['écoulé', '12:34'],
          ['séries', '5'],
        ]}
      />,
    );

    expect(screen.getByText('écoulé')).toBeTruthy();
    expect(screen.getByText('12:34')).toBeTruthy();
    expect(screen.getByText('séries')).toBeTruthy();
  });

  it('ScreenHeader n’affiche le sous-titre que s’il existe', async () => {
    await render(<ScreenHeader title="Profil" subtitle="max@lift.com" />);
    expect(screen.getByText('max@lift.com')).toBeTruthy();
  });

  /** C1 §11 : en modal, le bouton de fermeture est le PREMIER élément focusable. */
  it('ScreenHeader rend l’élément de gauche avant le titre', async () => {
    const rendu = await render(
      <ScreenHeader title="Ajouter un exercice" leading={<TextLink onPress={() => {}}>Fermer</TextLink>} />,
    );

    const textes = texteDeLArbre(rendu.toJSON());
    expect(textes.indexOf('Fermer')).toBeLessThan(textes.indexOf('Ajouter un exercice'));
  });
});

describe('TextLink', () => {
  it('porte le rôle de lien et la cible de 44pt', async () => {
    await render(
      <TextLink testID="l" onPress={() => {}}>
        Retour
      </TextLink>,
    );

    expect(screen.getByTestId('l').props.accessibilityRole).toBe('link');
    expect(classes('l')).toContain('min-h-touch');
  });

  /**
   * WCAG 1.4.11 : un élément interactif doit être identifiable. Un lien nu posé dans un
   * en-tête ne dit pas où commence la zone tappable — signalé le 03/08 sur C5.
   */
  it('encadré, il gagne un contour à 3,31:1', async () => {
    await render(
      <TextLink testID="l" encadre onPress={() => {}}>
        Quitter
      </TextLink>,
    );

    expect(classes('l')).toContain('border-control-border');
  });

  it('nu par défaut — un lien en fin de phrase n’a pas besoin de cadre', async () => {
    await render(
      <TextLink testID="l" onPress={() => {}}>
        Mot de passe oublié ?
      </TextLink>,
    );

    expect(classes('l')).not.toContain('border-control-border');
  });

  /** L'accent en texte plafonne à 3.87:1 : le lien se distingue par sa place, pas sa teinte. */
  it('accepte la voix destructive pour les actions dangereuses', async () => {
    await render(
      <TextLink color="error" onPress={() => {}}>
        Supprimer
      </TextLink>,
    );

    expect(screen.getByText('Supprimer').props.className).toContain('text-feedback-error');
  });
});

describe('Badge et StatTile', () => {
  it('Badge affiche son texte en voix machine', async () => {
    await render(<Badge>machine</Badge>);
    expect(screen.getByText('machine').props.className).toContain('text-label');
  });

  it('StatTile annonce la valeur AVEC son unité', async () => {
    await render(<StatTile label="Volume" value="12 450 kg" onPress={() => {}} />);
    expect(screen.getByLabelText('Volume, 12 450 kg')).toBeTruthy();
  });

  it('StatTile intègre la variation dans l’annonce quand elle existe', async () => {
    await render(<StatTile label="Volume" value="12 450 kg" delta="+20 %" onPress={() => {}} />);
    expect(screen.getByLabelText('Volume, 12 450 kg, +20 %')).toBeTruthy();
  });

  /** B1 §9 BR-3 : la variation est ABSENTE, pas à zéro, quand il n'y a rien à comparer. */
  it('StatTile n’affiche pas de variation quand elle n’est pas fournie', async () => {
    const rendu = await render(<StatTile label="Séances" value="3" />);
    expect(texteDeLArbre(rendu.toJSON())).toEqual(['Séances', '3']);
  });

  it('StatTile n’est tappable qu’en PRCard', async () => {
    await render(<StatTile label="Séances" value="3" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('Les trois états plein cadre', () => {
  /** Trois registres distincts : barre neutre, barre accent, barre alerte. */
  it('EmptyState est un constat, sans action obligatoire', async () => {
    await render(<EmptyState title="Aucun exercice ne correspond" />);

    expect(screen.getByText('Aucun exercice ne correspond')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('EmptyState propose une sortie quand on lui en donne une', async () => {
    const agir = jest.fn();
    await render(
      <EmptyState title="Aucune séance" actionLabel="Démarrer une séance" onAction={agir} />,
    );

    await presser(screen.getByText('Démarrer une séance'));

    expect(agir).toHaveBeenCalledTimes(1);
  });

  /** A5 §7 : cet état remplace l'écran, la sortie est donc OBLIGATOIRE. */
  it('BlockedState impose une sortie et interrompt le lecteur d’écran', async () => {
    const agir = jest.fn();
    const rendu = await render(
      <BlockedState title="Lien expiré" actionLabel="Redemander un lien" onAction={agir} />,
    );

    expect(JSON.stringify(rendu.toJSON())).toContain('assertive');
    await presser(screen.getByText('Redemander un lien'));
    expect(agir).toHaveBeenCalledTimes(1);
  });

  /** A4 §6 : le retour est un LIEN, pas un bouton — l'action vient d'aboutir. */
  it('SuccessState propose un lien, jamais un bouton', async () => {
    const revenir = jest.fn();
    await render(
      <SuccessState title="Message envoyé" linkLabel="Revenir à la connexion" onLink={revenir} />,
    );

    expect(screen.getByRole('link')).toBeTruthy();
    await presser(screen.getByText('Revenir à la connexion'));
    expect(revenir).toHaveBeenCalledTimes(1);
  });

  it('SuccessState se passe de lien', async () => {
    await render(<SuccessState title="Message envoyé" />);
    expect(screen.queryByRole('link')).toBeNull();
  });
});

describe('LoadingState', () => {
  /** Trois lignes fantômes n'ont pas à être parcourues une par une. */
  it('s’annonce comme un seul élément de progression', async () => {
    await render(<LoadingState />);
    expect(screen.getByLabelText('Chargement')).toBeTruthy();
  });

  it('rend autant de lignes qu’on lui en demande', async () => {
    const rendu = await render(<LoadingState rows={6} />);

    const compter = (noeud: unknown): number => {
      const n = noeud as { props?: { className?: string }; children?: unknown[] } | null;
      if (!n || typeof n !== 'object') return 0;
      const ici = n.props?.className?.includes('h-2 w-6') ? 1 : 0;
      const enfants = Array.isArray(n.children)
        ? n.children.map(compter).reduce((a, b) => a + b, 0)
        : 0;
      return ici + enfants;
    };

    expect(compter(rendu.toJSON())).toBe(6);
  });
});

describe('ErrorBanner', () => {
  it('annonce l’erreur sans interrompre la saisie', async () => {
    const rendu = await render(<ErrorBanner message="Serveur injoignable." />);

    const [banniere] = noeudsParRole(rendu.toJSON(), 'alert');
    expect(banniere).toBeDefined();
    expect(banniere.accessibilityLiveRegion).toBe('polite');
  });

  /** A2 §8 : « Réessayer » n'apparaît que sur une erreur réseau. */
  it('n’offre « Réessayer » que si un recours est fourni', async () => {
    await render(<ErrorBanner message="Identifiants invalides." />);
    expect(screen.queryByText('Réessayer')).toBeNull();
  });

  it('le recours vit DANS la bannière', async () => {
    const reessayer = jest.fn();
    await render(<ErrorBanner message="Serveur injoignable." onRetry={reessayer} />);

    await presser(screen.getByText('Réessayer'));

    expect(reessayer).toHaveBeenCalledTimes(1);
  });
});

describe('ConfirmDialog', () => {
  it('reste invisible tant qu’on ne l’ouvre pas', async () => {
    const rendu = await render(
      <ConfirmDialog
        visible={false}
        title="suppression"
        confirmLabel="Supprimer"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(texteDeLArbre(rendu.toJSON())).not.toContain('Supprimer');
  });

  /**
   * Le cœur du composant : un dialogue qui annonce « action irréversible » sans dire CE
   * QUI disparaît décore au lieu de documenter — critère B4 du barème.
   */
  it('énumère ce qui sera détruit, chiffré', async () => {
    await render(
      <ConfirmDialog
        visible
        title="suppression / séance"
        consequences={[
          ['séries', '12'],
          ['volume', '4 320 kg'],
        ]}
        confirmLabel="Supprimer"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(screen.getByText('séries')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('4 320 kg')).toBeTruthy();
  });

  /** C6 §11 : « Annuler » d'abord, pour qu'un tap réflexe tombe sur le choix sûr. */
  it('place « Annuler » avant l’action destructive', async () => {
    const rendu = await render(
      <ConfirmDialog
        visible
        title="suppression"
        confirmLabel="Supprimer la séance"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    const textes = texteDeLArbre(rendu.toJSON());
    expect(textes.indexOf('Annuler')).toBeLessThan(textes.indexOf('Supprimer la séance'));
  });

  it('transmet les deux décisions', async () => {
    const confirmer = jest.fn();
    const annuler = jest.fn();
    await render(
      <ConfirmDialog
        visible
        title="suppression"
        confirmLabel="Supprimer"
        onConfirm={confirmer}
        onCancel={annuler}
      />,
    );

    await presser(screen.getByText('Supprimer'));
    await presser(screen.getByText('Annuler'));

    expect(confirmer).toHaveBeenCalledTimes(1);
    expect(annuler).toHaveBeenCalledTimes(1);
  });

  /**
   * Peindre en rouge une action qu'on souhaite faire apprend à ignorer la couleur
   * d'alerte — et c'est ce qu'on ne veut pas le jour où elle porte une suppression.
   */
  it('accepte une voix primaire pour ce qui ne détruit rien', async () => {
    await render(
      <ConfirmDialog
        visible
        title="nouvelle séance"
        confirmLabel="Commencer"
        confirmVariant="primary"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(screen.getByText('Commencer').props.className).toContain('text-text-on-action');
  });
});

describe('SegmentedControl', () => {
  const SEGMENTS = ['Séances', 'Historique', 'Exercices'] as const;

  it('annonce une liste d’onglets et l’onglet actif', async () => {
    const rendu = await render(
      <SegmentedControl segments={SEGMENTS} value="Séances" onChange={() => {}} />,
    );

    expect(noeudsParRole(rendu.toJSON(), 'tablist')).toHaveLength(1);
    expect(noeudsParRole(rendu.toJSON(), 'tab')).toHaveLength(3);
  });

  it('marque le segment courant comme sélectionné', async () => {
    await render(<SegmentedControl segments={SEGMENTS} value="Historique" onChange={() => {}} />);

    const onglets = screen.getAllByRole('tab');
    const selectionnes = onglets.filter(
      (o) => (o.props.accessibilityState as { selected?: boolean } | undefined)?.selected,
    );

    expect(selectionnes).toHaveLength(1);
  });

  it('remonte le segment demandé', async () => {
    const changer = jest.fn();
    await render(<SegmentedControl segments={SEGMENTS} value="Séances" onChange={changer} />);

    await presser(screen.getByText('Exercices'));

    expect(changer).toHaveBeenCalledWith('Exercices');
  });

  /** §01 : « coded — IDs, coordinates, versions ». L'index vient de la position. */
  it('numérote les segments, sans que l’appelant ait à le faire', async () => {
    const rendu = await render(
      <SegmentedControl segments={SEGMENTS} value="Séances" onChange={() => {}} />,
    );

    const textes = texteDeLArbre(rendu.toJSON()).join(' ');
    expect(textes).toContain('01');
    expect(textes).toContain('03');
  });
});

describe('FilterChipsRow', () => {
  const GROUPES = ['CHEST', 'BACK', 'LOWER_BACK'] as const;

  it('rend les tirets bas en espaces', async () => {
    await render(<FilterChipsRow options={GROUPES} selection={[]} onToggle={() => {}} />);
    expect(screen.getByText('LOWER BACK')).toBeTruthy();
  });

  /** L'inversion figure/fond, retenue le 02/08. Aucune couleur ne porte la sélection. */
  it('un chip sélectionné s’affiche en aplat d’encre', async () => {
    await render(<FilterChipsRow options={GROUPES} selection={['CHEST']} onToggle={() => {}} />);

    const actif = screen.getByLabelText('CHEST');
    expect(actif.props.className).toContain('bg-text-default');
    expect(actif.props.accessibilityState.selected).toBe(true);
  });

  it('un chip non sélectionné garde son contour et rien d’autre', async () => {
    await render(<FilterChipsRow options={GROUPES} selection={['CHEST']} onToggle={() => {}} />);

    const inactif = screen.getByLabelText('BACK');
    expect(inactif.props.className).toContain('border-control-border');
    expect(inactif.props.className).not.toContain('bg-text-default');
  });

  it('remonte le code brut, jamais le libellé affiché', async () => {
    const basculer = jest.fn();
    await render(<FilterChipsRow options={GROUPES} selection={[]} onToggle={basculer} />);

    await presser(screen.getByLabelText('LOWER BACK'));

    expect(basculer).toHaveBeenCalledWith('LOWER_BACK');
  });
});

describe('PasswordStrengthMeter', () => {
  it('reste caché tant que le champ est vide — A3 §7', async () => {
    const rendu = await render(<PasswordStrengthMeter password="" />);
    expect(rendu.toJSON()).toBeNull();
  });

  it('les huit critères, du plus faible au plus fort', () => {
    expect(evaluerForce('lift')).toEqual({ points: 2, verdict: 'FAIBLE' });
    expect(evaluerForce('benchpress')).toEqual({ points: 3, verdict: 'MOYEN' });
    expect(evaluerForce('Bench-Press-2026')).toEqual({ points: 8, verdict: 'FORT' });
  });

  it('un triplé de caractères coûte un point', () => {
    expect(evaluerForce('aaabbbccc').points).toBeLessThan(evaluerForce('abcabcabc').points);
  });

  it('affiche le verdict en toutes lettres', async () => {
    await render(<PasswordStrengthMeter password="Bench-Press-2026" />);
    expect(screen.getByText('FORT')).toBeTruthy();
  });

  /**
   * A3 §11 : « avec texte, pas seulement une couleur ». L'annonce donne le verdict ET le
   * décompte, sans région live — le mot de passe se tape caractère par caractère.
   */
  it('annonce le verdict et le décompte au lecteur d’écran', async () => {
    await render(<PasswordStrengthMeter password="lift" />);

    const jauge = screen.getByLabelText('Force du mot de passe');
    expect(jauge.props.accessibilityValue.text).toBe('FAIBLE, 2 critères sur 8');
  });
});

describe('TabBarView', () => {
  const ITEMS = [
    { key: 'accueil', label: 'Accueil', active: true, onPress: jest.fn() },
    { key: 'lift', label: 'Lift', active: false, onPress: jest.fn() },
  ];

  it('annonce chaque onglet et celui qui est actif', async () => {
    await render(<TabBarView items={ITEMS} />);

    const onglets = screen.getAllByRole('tab');
    expect(onglets).toHaveLength(2);
    expect(onglets[0].props.accessibilityState.selected).toBe(true);
  });

  it('transmet le tap au bon onglet', async () => {
    await render(<TabBarView items={ITEMS} />);

    await presser(screen.getByText('Lift'));

    expect(ITEMS[1].onPress).toHaveBeenCalledTimes(1);
  });
});
