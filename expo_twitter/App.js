import React, { useRef, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LogBox, View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { GestureHandlerRootView, Swipeable, PanGestureHandler, State } from 'react-native-gesture-handler';

import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Asyncstorage has been extracted from react-native',
  'VirtualizedLists should never be nested',
]);

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;

const renderLeftActions = (progress, dragX) => {
  return (
    <View style={styles.leftAction}>
      <Text style={styles.actionText}>Add</Text>
    </View>
  );
};

const renderRightActions = (progress, dragX) => {
  return (
    <View style={styles.rightAction}>
      <Text style={styles.actionText}>Search</Text>
    </View>
  );
};

export default function App() {
  const swipeableRef = useRef(null);
  const [currentAction, setCurrentAction] = useState('');
  const translateY = useRef(new Animated.Value(0)).current;

  const handleSwipeAction = (action) => {
    setCurrentAction(action);
    console.log(`${action} action triggered`);
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY } = event.nativeEvent;

      if (translationY < -SWIPE_THRESHOLD) {
        handleSwipeAction('Display');
      } else if (translationY > SWIPE_THRESHOLD) {
        handleSwipeAction('Zoom');
      }

      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 10,
      }).start();
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthProvider>
        <GestureHandlerRootView style={styles.container}>
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View style={[styles.gestureContainer, {
              transform: [{ translateY }]
            }]}>
              <Swipeable
                ref={swipeableRef}
                renderLeftActions={renderLeftActions}
                renderRightActions={renderRightActions}
                onSwipeableLeftOpen={() => handleSwipeAction('Add')}
                onSwipeableRightOpen={() => handleSwipeAction('Search')}
                overshootLeft={false}
                overshootRight={false}
              >
                <View style={styles.swipeableContent}>
                  <Text style={styles.swipeText}>Swipe me in any direction!</Text>
                  <Text style={styles.swipeInstructions}>
                    ← Add | Search →{'\n'}
                    ↑ Display | Zoom ↓
                  </Text>
                  {currentAction && (
                    <Text style={styles.actionIndicator}>{currentAction} action triggered!</Text>
                  )}
                </View>
              </Swipeable>
            </Animated.View>
          </PanGestureHandler>
        </GestureHandlerRootView>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  gestureContainer: {
    width: '100%',
    padding: 20,
  },
  swipeableContent: {
    height: 150,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderRadius: 10,
  },
  leftAction: {
    flex: 1,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
    borderRadius: 10,
  },
  rightAction: {
    flex: 1,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
    borderRadius: 10,
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  swipeText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
  },
  swipeInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  actionIndicator: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
