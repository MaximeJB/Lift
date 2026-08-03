import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { NetworkError, ValidationError } from '../../src/shared/api';
import { Button } from '../../src/shared/components/primitives/Button';
import { Text } from '../../src/shared/components/primitives/Text';
import { Checkbox } from '../../src/shared/components/ui/Checkbox';
import { ErrorBanner } from '../../src/shared/components/ui/ErrorBanner';
import { Input } from '../../src/shared/components/ui/Input';
import { PasswordInput } from '../../src/shared/components/ui/PasswordInput';
import { PasswordStrengthMeter } from '../../src/shared/components/ui/PasswordStrengthMeter';
import { TextLink } from '../../src/shared/components/ui/TextLink';
import { useAuth } from '../../src/shared/context/AuthContext';

/**
 * A3 — Inscription.
 *
 * Assemble uniquement des composants du catalogue. Aucun style, aucune classe hors
 * thème, aucun `<Text>` de React Native.
 */

type Champ = 'email' | 'pseudo' | 'password' | 'passwordConfirm';

type Valeurs = Record<Champ, string>;

const VIDE: Valeurs = { email: '', pseudo: '', password: '', passwordConfirm: '' };

/**
 * Correspondance clé d'erreur DRF → champ de l'écran.
 *
 * Le sérialiseur parle en `snake_case` et ne connaît pas `passwordConfirm`. Sans cette
 * table, une erreur sur `password_confirm` n'atterrirait sous aucun champ et
 * disparaîtrait silencieusement.
 */
const CHAMP_PAR_CLE_API: Record<string, Champ> = {
  email: 'email',
  pseudo: 'pseudo',
  password: 'password',
  password_confirm: 'passwordConfirm',
};

/**
 * Validation de forme, côté client, avant tout appel réseau.
 *
 * Les quatre règles viennent d'A3 §9 :
 *   BR-1  les deux mots de passe sont comparés ICI. Le backend renvoie une
 *         ValidationError au message VIDE sur ce cas — laisser partir la requête
 *         afficherait une erreur blanche sous le champ.
 *   BR-2  pseudo contre `^[a-zA-Z0-9_]{3,20}$`, le pattern du sérialiseur.
 *   BR-3  mot de passe ≥ 8 caractères. Le backend n'impose rien aujourd'hui : c'est la
 *         seule règle de complexité du produit, et elle est portée ici.
 *
 * Le contrôle d'email reste PERMISSIF, comme en A2 : il empêche d'envoyer une requête
 * manifestement vouée à l'échec, il ne prétend pas valider une adresse.
 */
function validerLocalement(v: Valeurs): Partial<Record<Champ, string>> {
  const erreurs: Partial<Record<Champ, string>> = {};

  if (!/.+@.+\..+/.test(v.email.trim())) {
    erreurs.email = "Format d'adresse invalide.";
  }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(v.pseudo.trim())) {
    erreurs.pseudo = '3 à 20 caractères : lettres, chiffres ou tiret bas.';
  }
  if (v.password.length < 8) {
    erreurs.password = 'Au moins 8 caractères.';
  }
  if (v.passwordConfirm !== v.password) {
    erreurs.passwordConfirm = 'Les deux mots de passe diffèrent.';
  }

  return erreurs;
}

export default function Register() {
  const { register } = useAuth();

  const [valeurs, setValeurs] = useState<Valeurs>(VIDE);

  /**
   * A3 §9 BR-4 : la case n'est JAMAIS pré-cochée. L'état initial est `false` et rien ne
   * le modifie en dehors d'un tap de l'utilisateur.
   */
  const [cguAcceptees, setCguAcceptees] = useState(false);
  const [enCours, setEnCours] = useState(false);

  /**
   * Un champ ne montre son erreur qu'une fois QUITTÉ.
   *
   * A3 §7 donne « Saisie, blur » comme interactions du champ : sans cette mémoire,
   * « Au moins 8 caractères » s'afficherait dès la première lettre tapée, c'est-à-dire
   * pour reprocher à l'utilisateur de ne pas avoir fini d'écrire.
   */
  const [quittes, setQuittes] = useState<Partial<Record<Champ, boolean>>>({});
  const [erreursServeur, setErreursServeur] = useState<Partial<Record<Champ, string>>>({});
  const [erreurGlobale, setErreurGlobale] = useState<{ message: string; reseau: boolean } | null>(
    null,
  );

  const erreursLocales = validerLocalement(valeurs);

  // A3 §6 : bouton désactivé tant que le formulaire est invalide OU la case décochée.
  // A3 §10 : décocher juste avant de soumettre le redésactive dans le même rendu.
  const soumissionPossible = Object.keys(erreursLocales).length === 0 && cguAcceptees;

  /**
   * L'erreur du serveur prime sur l'erreur locale : « cette adresse est déjà utilisée »
   * est plus informatif que « format invalide », et une adresse déjà prise est de toute
   * façon bien formée.
   */
  const erreurDe = (champ: Champ) =>
    erreursServeur[champ] ?? (quittes[champ] ? erreursLocales[champ] : undefined);

  const modifier = (champ: Champ) => (valeur: string) => {
    setValeurs((v) => ({ ...v, [champ]: valeur }));

    // Le verdict du serveur portait sur l'ancienne valeur. Le garder affiché pendant que
    // l'utilisateur corrige lui ferait croire que sa correction ne sert à rien.
    setErreursServeur((e) => (champ in e ? { ...e, [champ]: undefined } : e));
  };

  const quitter = (champ: Champ) => () => setQuittes((q) => ({ ...q, [champ]: true }));

  const soumettre = async () => {
    // Double-tap bloqué pendant Loading — même règle qu'A2 §10.
    if (enCours || !soumissionPossible) return;

    setEnCours(true);
    setErreurGlobale(null);
    setErreursServeur({});

    try {
      await register({
        email: valeurs.email,
        password: valeurs.password,
        passwordConfirm: valeurs.passwordConfirm,
        pseudo: valeurs.pseudo,
      });

      // A3 §9 BR-5 : les jetons sont déjà écrits par le service et le contexte a basculé
      // en `authenticated`. `replace` et non `push` : revenir en arrière sur un
      // formulaire d'inscription après s'être inscrit n'aurait aucun sens.
      router.replace('/');
    } catch (e) {
      if (e instanceof ValidationError) {
        // A3 §10 : email ET pseudo déjà pris s'affichent EN MÊME TEMPS. On collecte donc
        // tous les champs reconnus, on ne s'arrête pas au premier.
        const parChamp: Partial<Record<Champ, string>> = {};
        for (const cle of Object.keys(e.fields)) {
          const champ = CHAMP_PAR_CLE_API[cle];
          if (champ) parChamp[champ] = e.fieldError(cle);
        }

        setErreursServeur(parChamp);

        // A3 §16 : ce qui n'est rattachable à aucun champ — et cela seul — part en
        // bannière. Sans « Réessayer » : renvoyer une donnée refusée la ferait refuser
        // à l'identique.
        if (Object.keys(parChamp).length === 0) {
          // `non_field_errors` est la clé de DRF pour un refus qui ne vise aucun champ —
          // la lire évite de remplacer un message précis par le générique de la classe.
          const message =
            e.fieldError('detail') ?? e.fieldError('non_field_errors') ?? e.message;
          setErreurGlobale({ message, reseau: false });
        }
      } else if (e instanceof NetworkError) {
        // A3 §8 : la bannière est RÉSERVÉE au réseau, et c'est le seul cas où
        // « Réessayer » a un sens. Le message distingue déjà coupure et délai dépassé.
        setErreurGlobale({ message: e.message, reseau: true });
      } else {
        setErreurGlobale({ message: 'Le serveur a rencontré un problème.', reseau: false });
      }
      // Les valeurs saisies RESTENT dans les champs — même règle qu'A2 §9 BR-5.
    } finally {
      setEnCours(false);
    }
  };

  return (
    <KeyboardAvoidingView
      // A3 §12 : `padding` sur iOS, `height` sur Android — les deux systèmes gèrent le
      // clavier différemment, et un seul comportement laisserait le bouton sous le
      // clavier sur l'une des deux plateformes.
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface-page"
    >
      <ScrollView
        // A3 §12 : scroll actif par défaut, le formulaire est plus long qu'A2.
        // PAS de `justify-center` ici, contrairement au Login : six contrôles centrés
        // débordent du cadre clavier ouvert, et le centrage sans raison fonctionnelle
        // est le critère A1 du barème anti-slop.
        contentContainerClassName="flex-grow p-4"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-form self-center gap-4">
          <Text variant="wordmark">LIFT</Text>

          {erreurGlobale ? (
            <ErrorBanner
              message={erreurGlobale.message}
              onRetry={erreurGlobale.reseau ? soumettre : undefined}
            />
          ) : null}

          <Input
            label="Adresse email"
            value={valeurs.email}
            onChangeText={modifier('email')}
            onBlur={quitter('email')}
            error={erreurDe('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            editable={!enCours}
            returnKeyType="next"
          />

          <Input
            label="Pseudo"
            value={valeurs.pseudo}
            onChangeText={modifier('pseudo')}
            onBlur={quitter('pseudo')}
            error={erreurDe('pseudo')}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            textContentType="username"
            editable={!enCours}
            returnKeyType="next"
          />

          {/* Le compteur appartient au champ mot de passe : `gap-2` le rapproche de lui,
              là où les autres contrôles sont séparés par `gap-4`. La proximité groupe. */}
          <View className="gap-2">
            <PasswordInput
              label="Mot de passe"
              value={valeurs.password}
              onChangeText={modifier('password')}
              onBlur={quitter('password')}
              error={erreurDe('password')}
              autoComplete="new-password"
              textContentType="newPassword"
              editable={!enCours}
              returnKeyType="next"
            />
            <PasswordStrengthMeter password={valeurs.password} />
          </View>

          <PasswordInput
            label="Confirmation du mot de passe"
            value={valeurs.passwordConfirm}
            onChangeText={modifier('passwordConfirm')}
            onBlur={quitter('passwordConfirm')}
            error={erreurDe('passwordConfirm')}
            autoComplete="new-password"
            textContentType="newPassword"
            editable={!enCours}
            returnKeyType="go"
            onSubmitEditing={soumettre}
          />

          <Checkbox checked={cguAcceptees} onToggle={setCguAcceptees}>
            {/* Les deux liens sont IMBRIQUÉS dans le flux de texte : ils suivent la
                ligne de base au lieu de former des blocs de 44pt qui désaxeraient la
                case. WCAG 2.5.8 exempte les liens en ligne de la cible minimale. */}
            <Text variant="body">
              J&apos;accepte les{' '}
              <Text variant="link" accessibilityRole="link" onPress={() => router.push('/cgu')}>
                conditions générales
              </Text>{' '}
              et la{' '}
              <Text
                variant="link"
                accessibilityRole="link"
                onPress={() => router.push('/confidentialite')}
              >
                politique de confidentialité
              </Text>
              .
            </Text>
          </Checkbox>

          <View className="pt-2">
            <Button onPress={soumettre} loading={enCours} disabled={!soumissionPossible}>
              Créer un compte
            </Button>
          </View>

          <View className="items-center">
            <TextLink onPress={() => router.back()}>Déjà un compte ? Se connecter</TextLink>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
