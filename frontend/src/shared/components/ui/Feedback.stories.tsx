import type { Meta, StoryObj } from '@storybook/react-native';
import { ErrorBanner } from './ErrorBanner';
import { LoadingState } from './LoadingState';
import { BlockedState } from './BlockedState';
import { EmptyState } from './EmptyState';
import { SuccessState } from './SuccessState';

const meta = { title: 'UI/Feedback' } satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** A2 §8 — message générique, ne dit jamais quel champ est faux. */
export const BanniereIdentifiants: Story = {
  render: () => <ErrorBanner message="Identifiants invalides." />,
};

/** A2 §8 — erreur réseau, la seule qui porte un bouton Réessayer. */
export const BanniereReseau: Story = {
  render: () => (
    <ErrorBanner message="Serveur injoignable. Vérifie ta connexion." onRetry={() => {}} />
  ),
};

/** C1 §8 — recherche sans résultat. */
export const RechercheVide: Story = {
  render: () => (
    <EmptyState
      title="Aucun exercice trouvé"
      description="Essaie un autre terme ou retire des filtres."
    />
  ),
};

/** C7 §8 — aucune séance, avec CTA vers C3. */
export const HistoriqueVide: Story = {
  render: () => (
    <EmptyState
      title="Lancez votre première séance !"
      description="Vos séances passées apparaîtront ici."
      actionLabel="Démarrer une séance"
      onAction={() => {}}
    />
  ),
};

/** A5 §7 — lien de réinitialisation périmé. */
export const TokenInvalide: Story = {
  render: () => (
    <BlockedState
      title="Ce lien n'est plus valide"
      description="Les liens de réinitialisation expirent après un délai limité."
      actionLabel="Redemander un lien"
      onAction={() => {}}
    />
  ),
};

/** A4 §6 — message générique, identique que le compte existe ou non. */
export const Succes: Story = {
  render: () => (
    <SuccessState
      title="Vérifie ta boîte mail"
      description="Si un compte existe pour cette adresse, tu recevras un lien de réinitialisation."
      linkLabel="Retour à la connexion"
      onLink={() => {}}
    />
  ),
};

/** B1, C1, C3, C7, D1 — la forme du contenu à venir, pas un signal abstrait. */
export const Chargement: Story = { render: () => <LoadingState /> };

/** Caler le nombre de lignes sur ce que l'écran affichera vraiment. */
export const ChargementUneLigne: Story = { render: () => <LoadingState rows={1} /> };
