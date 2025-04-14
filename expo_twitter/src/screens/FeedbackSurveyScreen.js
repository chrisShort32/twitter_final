import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import FeedbackIntroScreen from './feedback/FeedbackIntroScreen';
import FeedbackOptionsScreen from './feedback/FeedbackOptionsScreen';
import FeedbackSubmitScreen from './feedback/FeedbackSubmitScreen';
import FeedbackResultsScreen from './feedback/FeedbackResultsScreen';

const { width } = Dimensions.get('window');

const FeedbackSurveyScreen = () => {
  const navigation = useNavigation();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [feedbackData, setFeedbackData] = useState({
    likesApp: null,
    selectedOptions: [],
  });
  
  const position = useRef(new Animated.Value(0)).current;
  
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only allow horizontal swipes
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 3);
      },
      onPanResponderGrant: () => {
        position.setOffset(position._value);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Only allow swiping to the left (forward)
        if (gestureState.dx < 0) {
          position.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        position.flattenOffset();
        
        // If swiped more than 1/3 of the screen width to the left and not on the last screen
        if (gestureState.dx < -width / 3 && currentScreen < 3) {
          Animated.spring(position, {
            toValue: -width,
            useNativeDriver: true,
          }).start(() => {
            position.setValue(0);
            setCurrentScreen(currentScreen + 1);
          });
        } else {
          Animated.spring(position, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;
  
  const handleSwipeNext = (data) => {
    // Handle data passed from the current screen
    if (currentScreen === 0) {
      // From intro screen - store if user likes the app
      setFeedbackData({ ...feedbackData, likesApp: data });
    } else if (currentScreen === 1) {
      // From options screen - store selected reasons
      setFeedbackData({ ...feedbackData, selectedOptions: data });
    }
    
    // Animate to the next screen
    Animated.timing(position, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      position.setValue(0);
      setCurrentScreen(currentScreen + 1);
    });
  };
  
  const renderScreen = () => {
    switch (currentScreen) {
      case 0:
        return <FeedbackIntroScreen onSwipeNext={handleSwipeNext} />;
      case 1:
        return (
          <FeedbackOptionsScreen 
            likesApp={feedbackData.likesApp} 
            onSwipeNext={handleSwipeNext} 
          />
        );
      case 2:
        return (
          <FeedbackSubmitScreen 
            feedbackData={feedbackData} 
            onSwipeNext={handleSwipeNext} 
          />
        );
      case 3:
        return <FeedbackResultsScreen />;
      default:
        return null;
    }
  };
  
  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.screenContainer,
          { transform: [{ translateX: position }] }
        ]}
        {...(currentScreen < 3 ? panResponder.panHandlers : {})}
      >
        {renderScreen()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenContainer: {
    flex: 1,
    width: width,
  },
});

export default FeedbackSurveyScreen; 