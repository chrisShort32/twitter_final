import React from 'react';
import CubeProfileTransition from '../components/CubeProfileTransition';

const CubeSwipeScreen = ({ route, navigation }) => {
  const { username } = route.params;

  if (!username) {
    console.warn('[CubeSwipeScreen] No username passed!');
    return null;
  }

  return (
    <CubeProfileTransition
      username={username}
      onClose={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      }}
    />
  );
};

export default CubeSwipeScreen;




