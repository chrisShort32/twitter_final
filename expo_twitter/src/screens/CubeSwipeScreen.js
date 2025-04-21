import React from 'react';
import CubeTransition from 'react-native-cube-transition';
import UserProfileScreen from './UserProfileScreen'; // adjust path if needed

const CubeSwipeScreen = ({ route }) => {
  const { username } = route.params;

  return (
    <CubeTransition
      pages={[
        <UserProfileScreen
          key="profile"
          route={{ params: { username, timestamp: Date.now() } }}
        />,
      ]}
    />
  );
};

export default CubeSwipeScreen;
