/**
 * Environnement des tests.
 *
 * `src/shared/api/config.ts` LÈVE au chargement si `EXPO_PUBLIC_API_URL` est absente —
 * c'est voulu, un bundle sans URL d'API est inutilisable et doit le dire tout de suite.
 * En test, il faut donc la fournir avant que le moindre module soit importé.
 */
process.env.EXPO_PUBLIC_API_URL = 'http://api.test';
