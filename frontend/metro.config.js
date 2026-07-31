const path = require('path');

const { withStorybook } = require('@storybook/react-native/metro/withStorybook');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// NativeWind en premier (il ajoute le transformer CSS), Storybook par-dessus.
// `enabled: false` retire Storybook du bundle : l'app de production ne l'embarque pas.
module.exports = withStorybook(withNativeWind(config, { input: './global.css' }), {
  configPath: path.resolve(__dirname, './.rnstorybook'),
  enabled: process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true',
});
