import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from './Button';
import { Hairline } from './Hairline';
import { Text, type TextVariant } from './Text';

/**
 * Les trois primitives. Peu de logique, mais tout le reste s'appuie dessus : une erreur
 * ici se propage à treize écrans.
 *
 * `className` survit dans l'arbre de test — c'est ce qui permet de vérifier la règle
 * centrale du projet : UNE SEULE classe de couleur émise. NativeWind départage les
 * classes de même spécificité par leur ordre dans la FEUILLE DE STYLE, pas dans la
 * chaîne : deux classes de couleur donneraient un résultat imprévisible.
 */
const classes = (testID: string) =>
  (screen.getByTestId(testID).props.className as string).trim().split(/\s+/);

describe('Text — couleur', () => {
  it('n’émet qu’une seule classe de couleur', async () => {
    await render(
      <Text testID="t" variant="body" color="error">
        bonjour
      </Text>,
    );

    const couleurs = classes('t').filter((c) => c.startsWith('text-text-') || c.startsWith('text-feedback-'));
    expect(couleurs).toHaveLength(1);
    expect(couleurs[0]).toBe('text-feedback-error');
  });

  it('applique la couleur par défaut de la variante quand aucune n’est donnée', async () => {
    await render(
      <Text testID="t" variant="label">
        libellé
      </Text>,
    );

    expect(classes('t')).toContain('text-text-support');
  });

  it('la prop `color` remplace la couleur par défaut, sans la doubler', async () => {
    await render(
      <Text testID="t" variant="label" color="default">
        libellé
      </Text>,
    );

    expect(classes('t')).toContain('text-text-default');
    expect(classes('t')).not.toContain('text-text-support');
  });

  it('couvre les cinq couleurs du système', async () => {
    const attendues: Record<string, string> = {
      default: 'text-text-default',
      support: 'text-text-support',
      placeholder: 'text-text-placeholder',
      'on-action': 'text-text-on-action',
      'on-ink': 'text-text-on-ink',
      error: 'text-feedback-error',
    };

    for (const [couleur, classe] of Object.entries(attendues)) {
      await render(
        <Text testID={couleur} color={couleur as never}>
          x
        </Text>,
      );
      expect(classes(couleur)).toContain(classe);
    }
  });
});

describe('Text — typographie', () => {
  /**
   * Les classes sont écrites EN TOUTES LETTRES dans le source : le scanner de Tailwind
   * lit le texte, un `text-${variant}` ne serait jamais généré. Ce test le vérifie pour
   * les dix variantes.
   */
  const variantes: TextVariant[] = [
    'wordmark',
    'section',
    'input',
    'button',
    'label',
    'link',
    'body',
    'mono-display',
    'mono-dense',
    'mono-meta',
    'mono-accent',
  ];

  it.each(variantes)('la variante %s émet ses quatre classes typographiques', async (variante) => {
    await render(
      <Text testID={variante} variant={variante}>
        x
      </Text>,
    );

    const emises = classes(variante);
    expect(emises).toContain(`text-${variante}`);
    expect(emises).toContain(`font-${variante}`);
    expect(emises).toContain(`tracking-${variante}`);
    expect(emises.some((c) => c.startsWith('leading-'))).toBe(true);
  });

  it('rend `body` par défaut', async () => {
    await render(<Text testID="t">sans variante</Text>);
    expect(classes('t')).toContain('text-body');
  });

  /** Deux variantes portent la casse machine du §06 : capitales et tracking. */
  it('met en capitales les voix machine', async () => {
    await render(
      <>
        <Text testID="bouton" variant="button">
          x
        </Text>
        <Text testID="etiquette" variant="label">
          x
        </Text>
        <Text testID="corps" variant="body">
          x
        </Text>
      </>,
    );

    expect(classes('bouton')).toContain('uppercase');
    expect(classes('etiquette')).toContain('uppercase');
    expect(classes('corps')).not.toContain('uppercase');
  });

  it('accepte des classes de mise en page sans toucher aux autres', async () => {
    await render(
      <Text testID="t" variant="body" className="flex-1">
        x
      </Text>,
    );

    expect(classes('t')).toContain('flex-1');
    expect(classes('t')).toContain('text-body');
  });
});

describe('Button — états', () => {
  it('annonce son rôle et son état au lecteur d’écran', async () => {
    await render(
      <Button testID="b" onPress={() => {}}>
        valider
      </Button>,
    );

    const bouton = screen.getByTestId('b');
    expect(bouton.props.accessibilityRole).toBe('button');
    expect(bouton.props.accessibilityState).toEqual({ disabled: false, busy: false });
  });

  it('désactivé : l’état est annoncé et le tap ne fait rien', async () => {
    const presse = jest.fn();
    await render(
      <Button testID="b" onPress={presse} disabled>
        valider
      </Button>,
    );

    fireEvent.press(screen.getByTestId('b'));

    expect(presse).not.toHaveBeenCalled();
    expect(screen.getByTestId('b').props.accessibilityState).toEqual({
      disabled: true,
      busy: false,
    });
  });

  /** Le double-tap pendant un envoi est le cas que la spec vise en A2 §10. */
  it('en chargement : le tap ne fait rien et l’état est « occupé »', async () => {
    const presse = jest.fn();
    await render(
      <Button testID="b" onPress={presse} loading>
        valider
      </Button>,
    );

    fireEvent.press(screen.getByTestId('b'));

    expect(presse).not.toHaveBeenCalled();
    expect(screen.getByTestId('b').props.accessibilityState).toEqual({
      disabled: true,
      busy: true,
    });
  });

  it('en chargement : le libellé cède la place à l’indicateur', async () => {
    await render(
      <Button testID="b" onPress={() => {}} loading>
        valider
      </Button>,
    );

    expect(screen.queryByText('valider')).toBeNull();
  });

  it('actif : le tap passe', async () => {
    const presse = jest.fn();
    await render(
      <Button testID="b" onPress={presse}>
        valider
      </Button>,
    );

    fireEvent.press(screen.getByTestId('b'));

    expect(presse).toHaveBeenCalledTimes(1);
  });

  it('transmet l’appui long — c’est ainsi que C5 marque une série à l’échec', async () => {
    const long = jest.fn();
    await render(
      <Button testID="b" onPress={() => {}} onLongPress={long}>
        valider
      </Button>,
    );

    fireEvent(screen.getByTestId('b'), 'longPress');

    expect(long).toHaveBeenCalledTimes(1);
  });
});

describe('Button — les quatre variantes', () => {
  it('primary : aplat accent ET contour, sans quoi il ne tient pas 3:1', async () => {
    await render(
      <Button testID="b" onPress={() => {}}>
        x
      </Button>,
    );

    expect(classes('b')).toEqual(expect.arrayContaining(['bg-action', 'border-action-border']));
  });

  it('secondary : contour seul, en control-border', async () => {
    await render(
      <Button testID="b" variant="secondary" onPress={() => {}}>
        x
      </Button>,
    );

    expect(classes('b')).toContain('border-control-border');
    expect(classes('b')).not.toContain('bg-action');
  });

  it('accent-outline : contour de focus, aucun aplat', async () => {
    await render(
      <Button testID="b" variant="accent-outline" onPress={() => {}}>
        x
      </Button>,
    );

    expect(classes('b')).toContain('border-control-border-focus');
    expect(classes('b')).not.toContain('bg-action');
  });

  it('destructive : ni fond ni contour, le texte porte tout', async () => {
    await render(
      <Button testID="b" variant="destructive" onPress={() => {}}>
        x
      </Button>,
    );

    expect(classes('b')).not.toContain('bg-action');
    expect(classes('b').some((c) => c.startsWith('border-'))).toBe(false);
  });

  /** États pressed et disabled en opacité : le système n'a aucun token d'état (Q8). */
  it('opacité 40 une fois désactivé, et plus d’effet au tap', async () => {
    await render(
      <Button testID="b" onPress={() => {}} disabled>
        x
      </Button>,
    );

    expect(classes('b')).toContain('opacity-40');
    expect(classes('b')).not.toContain('active:opacity-70');
  });

  it('angles vifs et hauteur minimale de 44pt', async () => {
    await render(
      <Button testID="b" onPress={() => {}}>
        x
      </Button>,
    );

    expect(classes('b')).toEqual(expect.arrayContaining(['rounded-control', 'min-h-touch']));
  });
});

describe('Hairline', () => {
  /**
   * Le composant n'accepte volontairement que l'orientation et des marges : ni couleur ni
   * épaisseur. On l'inspecte donc par son arbre rendu, pas par un testID qu'il n'expose
   * pas — et c'est très bien ainsi, un filet n'a rien à laisser régler de l'extérieur.
   */
  async function rendre(orientation?: 'horizontal' | 'vertical') {
    const rendu = await render(<Hairline orientation={orientation} />);
    return rendu.toJSON() as unknown as {
      props: { className: string; style: { height?: number; width?: number } };
    };
  }

  it('porte la couleur de filet du système', async () => {
    const filet = await rendre();
    expect(filet.props.className).toContain('bg-divider');
  });

  /**
   * LA SEULE DÉROGATION `style` DU PROJET. `StyleSheet.hairlineWidth` vaut 0,5 ou 0,33
   * selon la densité de l'écran — une valeur connue à l'exécution seulement, donc
   * impossible à exprimer en classe Tailwind.
   */
  it('horizontal : une hauteur sous le pixel, et toute la largeur', async () => {
    const filet = await rendre('horizontal');

    expect(filet.props.className).toContain('w-full');
    expect(filet.props.style.height).toBeGreaterThan(0);
    expect(filet.props.style.height).toBeLessThanOrEqual(1);
  });

  it('vertical : une largeur sous le pixel, et toute la hauteur', async () => {
    const filet = await rendre('vertical');

    expect(filet.props.className).toContain('h-full');
    expect(filet.props.style.width).toBeGreaterThan(0);
    expect(filet.props.style.width).toBeLessThanOrEqual(1);
  });

  it('est horizontal par défaut', async () => {
    const filet = await rendre();
    expect(filet.props.style.height).toBeDefined();
    expect(filet.props.style.width).toBeUndefined();
  });
});
