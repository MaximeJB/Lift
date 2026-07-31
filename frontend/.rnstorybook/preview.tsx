// Sans cet import, aucune classe NativeWind ne s'applique dans Storybook — et rien
// ne le signale : les composants s'affichent simplement sans style.
import '../global.css';

import type { Preview } from '@storybook/react-native';
import { View } from 'react-native';

const preview: Preview = {
  decorators: [
    (Story) => (
      <View className="flex-1 bg-surface-page p-3">
        <Story />
      </View>
    ),
  ],
};

export default preview;
