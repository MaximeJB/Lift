import '../global.css';

import type { Preview } from '@storybook/react';
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
