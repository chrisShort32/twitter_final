import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import UserProfileScreen from '../screens/UserProfileScreen';
import { useNavigation } from '@react-navigation/native';
import { useCubeNav } from '../context/CubeNavigationContext';

const CubeProfileTransition = ({ username, onClose }) => {
  const rotateY = useSharedValue(90);
  const navigation = useNavigation();
  const timestamp = Date.now();
  


  React.useEffect(() => {
    rotateY.value = withTiming(0, { duration: 500 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const transform = [
      { perspective: 800 },
      { rotateY: `${interpolate(rotateY.value, [0, 90], [0, 90])}deg` },
    ];
    return { transform };
  });

  const { popProfile, profileStack, resetToHome } = useCubeNav();

  const handleSwipeBack = () => {
    rotateY.value = withTiming(90, { duration: 500 }, () => {
      runOnJS(() => {
        if (profileStack.length > 1) {
          popProfile();
          navigation.goBack(); // Go to previous profile
        } else {
          resetToHome();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }
      })();
    });
  };
  

  return (
    <PanGestureHandler onGestureEvent={({ nativeEvent }) => {
      if (nativeEvent.translationX > 50) handleSwipeBack();
    }}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <UserProfileScreen
            key={timestamp}
            navigation={navigation}
            route={{ params: { username, timestamp } }}
        />


      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default CubeProfileTransition;
