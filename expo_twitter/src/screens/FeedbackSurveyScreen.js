import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  ActivityIndicator,
  SafeAreaView,
  BackHandler,
  Button,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import FeedbackIntroScreen from './feedback/FeedbackIntroScreen';
import FeedbackOptionsScreen from './feedback/FeedbackOptionsScreen';
import FeedbackSubmitScreen from './feedback/FeedbackSubmitScreen';
import FeedbackResultsScreen from './feedback/FeedbackResultsScreen';

const { width } = Dimensions.get('window');

const FeedbackSurveyScreen = () => {
  const navigation = useNavigation();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    likesApp: null,
    selectedOptions: [],
  });
  const [resultsKey, setResultsKey] = useState(Date.now());

  // Handle back button press
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (currentScreen > 0) {
          setCurrentScreen(currentScreen - 1);
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [currentScreen])
  );

  // Log current screen for debugging
  useEffect(() => {
    console.log(`Current screen index: ${currentScreen}`);
  }, [currentScreen]);

  const handleNavigation = (data, direction) => {
    console.log(`Navigation from screen ${currentScreen} to ${direction === 'next' ? 'next' : 'previous'}`);
    
    // Handle data from current screen
    if (currentScreen === 0 && direction === 'next') {
      // From intro screen - store if user likes the app
      setFeedbackData({ ...feedbackData, likesApp: data });
    } else if (currentScreen === 1 && direction === 'next') {
      // From options screen - store selected reasons
      setFeedbackData({ ...feedbackData, selectedOptions: data });
    }

    // If going to results screen, update the key to force refresh
    if (currentScreen === 2 && direction === 'next') {
      console.log("Transitioning to results screen - updating results key");
      setIsLoading(true);
      
      // Brief delay to ensure screen transition feels smooth
      setTimeout(() => {
        setResultsKey(Date.now());
        setCurrentScreen(3);
        setIsLoading(false);
      }, 300);
    } else {
      // Regular navigation
      if (direction === 'next') {
        setCurrentScreen(prev => prev + 1);
      } else {
        setCurrentScreen(prev => Math.max(0, prev - 1));
      }
    }
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 0:
        return (
          <FeedbackIntroScreen 
            onSwipeNext={(data) => handleNavigation(data, 'next')} 
          />
        );
      case 1:
        return (
          <FeedbackOptionsScreen 
            likesApp={feedbackData.likesApp} 
            onSwipeNext={(data) => handleNavigation(data, 'next')} 
          />
        );
      case 2:
        return (
          <FeedbackSubmitScreen 
            feedbackData={feedbackData}
            onSwipeNext={() => handleNavigation(null, 'next')}
          />
        );
      case 3:
        return (
          <View style={styles.fullScreenContainer}>
            <FeedbackResultsScreen key={resultsKey} />
          </View>
        );
      default:
        // Fallback for unexpected screen index
        Alert.alert(
          "Error", 
          "An unexpected error occurred in the feedback flow. Please try again.",
          [{ text: "OK", onPress: () => navigation.navigate('Home') }]
        );
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              An unexpected error occurred. Please try again.
            </Text>
            <Button 
              title="Return to Home" 
              onPress={() => navigation.navigate('Home')} 
            />
          </View>
        );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DA1F2" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenContainer}>
        {renderCurrentScreen()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenContainer: {
    flex: 1,
    width: '100%',
  },
  fullScreenContainer: {
    flex: 1,
    width: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#657786',
  }
});

export default FeedbackSurveyScreen; 