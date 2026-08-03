import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import { getMe, updateMe, type ProfileUpdate } from '../../src/auth/services/auth.service';
import { ApiError, NetworkError, ValidationError, type UserProfile } from '../../src/shared/api';
import { Button } from '../../src/shared/components/primitives/Button';
import { ConfirmDialog } from '../../src/shared/components/ui/ConfirmDialog';
import { ErrorBanner } from '../../src/shared/components/ui/ErrorBanner';
import { Input } from '../../src/shared/components/ui/Input';
import { LoadingState } from '../../src/shared/components/ui/LoadingState';
import { ScreenHeader } from '../../src/shared/components/ui/ScreenHeader';
import { SectionHeader } from '../../src/shared/components/ui/SectionHeader';
import { useAuth } from '../../src/shared/context/AuthContext';

/**
 * Fenêtre entre deux changements de pseudo, en jours.
 *
 * COPIE DE LA RÈGLE SERVEUR, `DELAI_CHANGEMENT_PSEUDO` dans accounts/serializers.py. Elle
 * ne sert qu'à AFFICHER l'échéance : c'est le serveur qui autorise ou refuse, lui seul
 * connaît l'heure de référence. Si la valeur change côté Django, cette constante doit
 * suivre — sinon l'écran annoncera une date fausse, sans jamais laisser passer une
 * modification interdite.
 */
const JOURS_ENTRE_CHANGEMENTS_PSEUDO = 30;

/** Date du prochain changement autorisé, ou `null` si le pseudo n'a jamais été changé. */
function prochainChangementPseudo(derniereModification: string | null): Date | null {
  if (!derniereModification) return null;

  const date = new Date(derniereModification);
  date.setDate(date.getDate() + JOURS_ENTRE_CHANGEMENTS_PSEUDO);
  return date;
}

/**
 * Format jour/mois/année, construit à la main.
 *
 * `toLocaleDateString` dépendrait de la locale de l'appareil : un téléphone en anglais
 * afficherait 9/12/2026 pour le 12 septembre. Ici c'est une donnée, pas une phrase.
 */
function formatDate(date: Date): string {
  const jour = String(date.getDate()).padStart(2, '0');
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  return `${jour}/${mois}/${date.getFullYear()}`;
}

/**
 * D1 — Profil.
 *
 * TROIS SECTIONS DE LA SPEC SONT ABSENTES, chacune faute d'endpoint côté Django. Aucune
 * n'est affichée en grisé : un bouton qui ne fait rien coûte plus cher qu'un bouton
 * manquant, il fait douter du reste de l'écran.
 *
 *   Sécurité, changer le mot de passe — POST /api/auth/change-password/ n'existe pas.
 *   Mes données, export RGPD          — GET /api/auth/me/export/ n'existe pas.
 *   Mes données, suppression          — DELETE /api/auth/me/ n'existe pas.
 */
export default function Profil() {
  const { session, majUtilisateur, logout } = useAuth();

  const [profil, setProfil] = useState<UserProfile | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const [pseudo, setPseudo] = useState('');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [erreursChamps, setErreursChamps] = useState<{
    pseudo?: string;
    prenom?: string;
    nom?: string;
  }>({});
  const [enregistrement, setEnregistrement] = useState(false);

  const [confirmationDeconnexion, setConfirmationDeconnexion] = useState(false);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);

    try {
      const p = await getMe();
      setProfil(p);
      // `pseudo` peut être null en base ; le champ de saisie, lui, veut une chaîne.
      setPseudo(p.pseudo ?? '');
      setPrenom(p.first_name);
      setNom(p.last_name);
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Le serveur a rencontré un problème.');
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  /**
   * Rien à enregistrer tant que rien n'a bougé.
   *
   * C'est aussi la CONFIRMATION de l'enregistrement : à la réponse du serveur, `profil`
   * est remplacé par ce qu'il a réellement retenu, les deux valeurs coïncident de nouveau
   * et le bouton s'éteint. La preuve que la sauvegarde a pris est l'extinction de
   * l'action, pas un bandeau de succès qui s'ajouterait à l'écran.
   */
  const modifie =
    profil !== null &&
    (pseudo !== (profil.pseudo ?? '') || prenom !== profil.first_name || nom !== profil.last_name);

  /**
   * Verrou du pseudo — règle des 30 jours glissants.
   *
   * `null` dans les deux cas où le champ reste ouvert : profil pas encore chargé, ou
   * pseudo jamais modifié depuis l'inscription (le premier changement est offert).
   */
  const ouvertureP = prochainChangementPseudo(profil?.pseudo_updated_at ?? null);
  const pseudoVerrouille = ouvertureP !== null && Date.now() < ouvertureP.getTime();

  const enregistrer = async () => {
    if (enregistrement || !modifie || profil === null) return;

    setEnregistrement(true);
    setErreur(null);
    setErreursChamps({});

    // D1 §9 BR-1 : PATCH, donc on n'envoie QUE ce qui a bougé. Renvoyer un pseudo
    // inchangé serait sans effet — `validate_pseudo` le laisse passer — mais renvoyer un
    // champ non modifié à chaque enregistrement finit toujours par masquer un bug.
    const changements: ProfileUpdate = {};
    if (pseudo !== (profil.pseudo ?? '')) changements.pseudo = pseudo.trim();
    if (prenom !== profil.first_name) changements.first_name = prenom;
    if (nom !== profil.last_name) changements.last_name = nom;

    try {
      const p = await updateMe(changements);
      setProfil(p);
      setPseudo(p.pseudo ?? '');
      setPrenom(p.first_name);
      setNom(p.last_name);

      // La session mémorise l'utilisateur pour l'accès hors ligne d'A1 §9 BR-5. Sans
      // cette mise à jour, elle garderait l'ancien pseudo jusqu'à la prochaine connexion.
      await majUtilisateur({
        id: p.id,
        email: p.email,
        email_verified: p.email_verified,
        pseudo: p.pseudo,
      });
    } catch (e) {
      if (e instanceof ValidationError) {
        // Le serveur renvoie sous la clé `pseudo` aussi bien « déjà pris » que le refus
        // des 30 jours. Les deux s'affichent sous le champ, aucun en bannière.
        setErreursChamps({
          pseudo: e.fieldError('pseudo'),
          prenom: e.fieldError('first_name'),
          nom: e.fieldError('last_name'),
        });
      } else if (e instanceof NetworkError) {
        setErreur(e.message);
      } else {
        setErreur('Le serveur a rencontré un problème.');
      }
    } finally {
      setEnregistrement(false);
    }
  };

  /**
   * D1 §9 BR-4 : purge locale de SecureStore.
   *
   * AUCUNE NAVIGATION ICI, et c'est volontaire. La session passe à `unauthenticated`,
   * `Stack.Protected` retire le groupe `(tabs)` du navigateur, et expo-router retombe sur
   * `(auth)`. Un `router.replace` posé par-dessus referait le même trajet, avec le risque
   * de viser une route déjà démontée.
   */
  const seDeconnecter = async () => {
    setConfirmationDeconnexion(false);
    await logout();
  };

  /**
   * Le titre suit le profil chargé, et retombe sur la session tant que `/me/` n'a pas
   * répondu — c'est ce qui évite un en-tête vide pendant le squelette de chargement.
   */
  const pseudoAffiche =
    profil?.pseudo ?? (session.status === 'authenticated' ? session.user.pseudo : null);

  return (
    <KeyboardAvoidingView
      // D1 §12 : KeyboardAvoidingView sur le formulaire d'édition.
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface-page"
    >
      <ScrollView contentContainerClassName="gap-3 p-4" keyboardShouldPersistTaps="handled">
        <ScreenHeader
          // Le pseudo est facultatif en base (`null=True`) : l'email prend le relais
          // plutôt qu'un titre vide.
          title={pseudoAffiche ?? profil?.email ?? 'Profil'}
          subtitle={profil?.email}
          attributes={
            profil
              ? [
                  // Registre codé plutôt que « Membre depuis le 2 août 2026 » : la date
                  // ISO est tronquée et inversée, sans dépendre d'un formateur de locale.
                  ['membre depuis', profil.created_at.slice(0, 10).split('-').reverse().join('/')],
                  ['email vérifié', profil.email_verified ? 'oui' : 'non'],
                ]
              : undefined
          }
        />

        {erreur ? <ErrorBanner message={erreur} onRetry={() => void charger()} /> : null}

        {chargement ? (
          <LoadingState rows={3} />
        ) : (
          <>
            <SectionHeader>informations</SectionHeader>

            {/*
              LE LIBELLÉ PORTE LE VERROU. Le système n'a aucun jeton d'état désactivé —
              décision Q8 de MAPPING.md, les états d'interaction ne sont pas tokenisés —
              donc un champ non modifiable ne se distingue par aucune couleur. Écrire la
              raison dans le libellé est le seul signal disponible, et c'est aussi celui
              que le lecteur d'écran annonce : `Input` recopie le libellé dans son
              `accessibilityLabel`.

              La date n'est PAS mise dans `error` : rien n'est en erreur tant que
              l'utilisateur n'a rien tenté, et la couleur d'alerte le laisserait croire.
            */}
            <Input
              label={
                pseudoVerrouille && ouvertureP
                  ? `Pseudo — modifiable le ${formatDate(ouvertureP)}`
                  : 'Pseudo'
              }
              value={pseudo}
              onChangeText={setPseudo}
              error={erreursChamps.pseudo}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!enregistrement && !pseudoVerrouille}
              returnKeyType="next"
            />

            <Input
              label="Prénom"
              value={prenom}
              onChangeText={setPrenom}
              error={erreursChamps.prenom}
              autoCapitalize="words"
              autoComplete="given-name"
              editable={!enregistrement}
              returnKeyType="next"
            />

            <Input
              label="Nom"
              value={nom}
              onChangeText={setNom}
              error={erreursChamps.nom}
              autoCapitalize="words"
              autoComplete="family-name"
              editable={!enregistrement}
              returnKeyType="done"
              onSubmitEditing={() => void enregistrer()}
            />

            <Button onPress={() => void enregistrer()} loading={enregistrement} disabled={!modifie}>
              Enregistrer
            </Button>

            <SectionHeader>session</SectionHeader>

            {/* D1 §6 : « bouton séparé visuellement des actions destructives ». Il n'y a
                pour l'instant aucune action destructive sur cet écran — quand la
                suppression de compte arrivera, elle ne devra pas être posée ici. */}
            <Button variant="secondary" onPress={() => setConfirmationDeconnexion(true)}>
              Se déconnecter
            </Button>
          </>
        )}
      </ScrollView>

      {/* D1 §7 : « confirmation légère ». Pas de re-saisie de mot de passe — elle est
          réservée aux actions irréversibles (BR-3), et une déconnexion se répare en se
          reconnectant. */}
      <ConfirmDialog
        visible={confirmationDeconnexion}
        title="déconnexion"
        message="Tes séances restent sur le serveur. Il faudra ressaisir ton mot de passe pour revenir."
        confirmLabel="Se déconnecter"
        onConfirm={() => void seDeconnecter()}
        onCancel={() => setConfirmationDeconnexion(false)}
      />
    </KeyboardAvoidingView>
  );
}
