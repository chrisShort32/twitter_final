import React from 'react';
import { Platform, View, Text } from 'react-native';
import CubeTransition from 'react-native-cube-transition';
import UserProfileScreen from './UserProfileScreen'; // adjust if needed

const CubeSwipeScreen = ({ route }) => {
  const { username } = route.params;

  return Platform.select({
    web: () => (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>This swipe feature is mobile-only</Text>
      </View>
    ),
    default: () => (
      <CubeTransition
        pages={[
          <UserProfileScreen
            key="profile"
            route={{ params: { username, timestamp: Date.now() } }}
          />,
        ]}
      />
    ),
  })();
};

export default CubeSwipeScreen;

