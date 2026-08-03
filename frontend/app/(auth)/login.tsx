import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { Button } from '../../src/shared/components/primitives/Button';
import { Text } from '../../src/shared/components/primitives/Text';
import { ErrorBanner } from '../../src/shared/components/ui/ErrorBanner';
import { Input } from '../../src/shared/components/ui/Input';
import { PasswordInput } from '../../src/shared/components/ui/PasswordInput';
import { TextLink } from '../../src/shared/components/ui/TextLink';
import { NetworkError } from '../../src/shared/api';
import { useAuth } from '../../src/shared/context/AuthContext';

/**
 * A2 — Connexion.
 *
 * Assemble uniquement des composants du catalogue. Aucun style, aucune classe hors
 * thème, aucun `<Text>` de React Native.
 */

/**
 * Validation de forme, côté client, avant tout appel réseau — A2 §9 BR-1.
 *
 * Volontairement PERMISSIVE : elle empêche d'envoyer une requête manifestement vouée à
 * l'échec, elle ne prétend pas valider une adresse. La seule preuve qu'un email existe
 * est un message reçu ; le backend reste l'autorité.
 */
function formatValide(email: string, password: string): boolean {
  return /.+@.+\..+/.test(email.trim()) && password.length > 0;
}

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<{ message: string; reseau: boolean } | null>(null);

  const soumettre = async () => {
    // A2 §10 : « double-tap → bloqué pendant Loading ».
    if (enCours) return;

    setEnCours(true);
    setErreur(null);

    try {
      await login(email, password);
      // A2 §9 BR-3 : les jetons sont déjà écrits par le service. `replace` et non
      // `push` : revenir en arrière sur un écran de connexion après s'être connecté
      // n'aurait aucun sens.
      router.replace('/');
    } catch (e) {
      // A2 §9 BR-2 : message GÉNÉRIQUE. Ne jamais dire lequel des deux champs est faux —
      // cela permettrait d'énumérer les comptes existants.
      //
      // Seule distinction faite : réseau ou pas. Elle est nécessaire car A2 §8 n'offre
      // le bouton « Réessayer » que dans le cas réseau — réessayer un mot de passe faux
      // n'a aucun sens.
      const reseau = e instanceof NetworkError;
      setErreur({
        message: reseau
          ? 'Serveur injoignable. Vérifie ta connexion.'
          : 'Identifiants invalides.',
        reseau,
      });
      // A2 §9 BR-5 : les valeurs saisies RESTENT dans les champs. On ne remet rien à zéro.
    } finally {
      setEnCours(false);
    }
  };

  return (
    <KeyboardAvoidingView
      // A2 §12 : `padding` sur iOS, `height` sur Android — les deux systèmes gèrent le
      // clavier différemment, et un seul comportement laisserait le bouton sous le
      // clavier sur l'une des deux plateformes.
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface-page"
    >
      <ScrollView
        // Le formulaire tient sur un écran ordinaire ; le scroll ne sert qu'aux petits
        // appareils clavier ouvert. `keyboardShouldPersistTaps` évite qu'un premier tap
        // serve seulement à fermer le clavier au lieu d'activer le lien visé.
        contentContainerClassName="flex-grow justify-center p-4"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-form self-center gap-4">
          <Text variant="wordmark">LIFT</Text>

          {erreur ? (
            <ErrorBanner
              message={erreur.message}
              // A2 §8 : « Réessayer » n'apparaît que sur une erreur réseau.
              onRetry={erreur.reseau ? soumettre : undefined}
            />
          ) : null}

          <Input
            label="Adresse email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            editable={!enCours}
            returnKeyType="next"
          />

          <PasswordInput
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            autoComplete="current-password"
            textContentType="password"
            editable={!enCours}
            returnKeyType="go"
            onSubmitEditing={soumettre}
          />

          <View className="pt-2">
            <Button
              onPress={soumettre}
              loading={enCours}
              // A2 §9 BR-1 : désactivé tant que le format n'est pas valide.
              disabled={!formatValide(email, password)}
            >
              Se connecter
            </Button>
          </View>

          <View className="items-center">
            <TextLink onPress={() => router.push('/forgot-password')} color="support">
              Mot de passe oublié ?
            </TextLink>
            <TextLink onPress={() => router.push('/register')}>Créer un compte</TextLink>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
