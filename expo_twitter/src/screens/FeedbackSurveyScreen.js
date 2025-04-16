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
  TouchableOpacity,
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
  const [navigationAttempts, setNavigationAttempts] = useState({});
  const [timeoutId, setTimeoutId] = useState(null);

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

  // Safety mechanism to prevent getting stuck on loading screen
  useEffect(() => {
    if (isLoading) {
      // Set a timeout to force exit loading state after 10 seconds
      const id = setTimeout(() => {
        console.log('🚨 Safety timeout triggered - forcing exit from loading state');
        setIsLoading(false);
        
        // If we were trying to go to results screen, force it now
        if (currentScreen === 2) {
          console.log('⚠️ Forcing transition to results screen');
          setCurrentScreen(3);
        }
      }, 10000);
      
      setTimeoutId(id);
      
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [isLoading, currentScreen]);

  // Log current screen for debugging
  useEffect(() => {
    console.log(`📱 Current screen index: ${currentScreen}`);
    
    // When switching to results screen, update the key to force a re-render
    if (currentScreen === 3) {
      console.log('🔄 Results screen rendered, key:', resultsKey);
    }
  }, [currentScreen, resultsKey]);

  // Critical transition effect - ensure results screen loads properly
  useEffect(() => {
    // Special case for results screen - if it's active, ensure data is refreshed
    if (currentScreen === 3) {
      // Generate a new key to force remount
      const newKey = Date.now();
      setResultsKey(newKey);
      console.log(`🔁 Forced refresh of results screen with key: ${newKey}`);
      
      // Ensure we're not in loading state
      setIsLoading(false);
    }
  }, [currentScreen]);

  const handleNavigation = (data, direction) => {
    // Track navigation attempts for debugging
    const fromScreen = currentScreen;
    const toScreen = direction === 'next' ? currentScreen + 1 : currentScreen - 1;
    
    console.log(`🔀 Navigation attempt from screen ${fromScreen} to ${toScreen}`);
    setNavigationAttempts(prev => ({
      ...prev,
      [`${fromScreen}->${toScreen}`]: (prev[`${fromScreen}->${toScreen}`] || 0) + 1
    }));
    
    // Handle data from current screen
    if (currentScreen === 0 && direction === 'next') {
      // From intro screen - store if user likes the app
      setFeedbackData({ ...feedbackData, likesApp: data });
    } else if (currentScreen === 1 && direction === 'next') {
      // From options screen - store selected reasons
      setFeedbackData({ ...feedbackData, selectedOptions: data });
    }

    // If going to results screen, use special handling
    if (currentScreen === 2 && direction === 'next') {
      console.log("🚨 Critical transition to results screen");
      setIsLoading(true);
      
      // Generate new key for results screen
      const newKey = Date.now();
      setResultsKey(newKey);
      console.log(`📊 Preparing results screen with key: ${newKey}`);
      
      // Use a shorter timeout to ensure UI updates before transition
      setTimeout(() => {
        // First update state
        setCurrentScreen(3);
        
        // Then after a brief delay, finish loading
        setTimeout(() => {
          setIsLoading(false);
          console.log("✅ Completed transition to results screen");
        }, 300);
      }, 300);
      
      // Add safety timeout to prevent getting stuck in loading state
      setTimeout(() => {
        if (isLoading) {
          console.log("⚠️ Safety timeout triggered - results transition taking too long");
          setIsLoading(false);
        }
      }, 5000);
    } else {
      // Regular navigation
      if (direction === 'next') {
        setCurrentScreen(prev => prev + 1);
      } else {
        setCurrentScreen(prev => Math.max(0, prev - 1));
      }
    }
  };
  
  // Special direct navigation function for emergency use
  const forceNavigateToResults = () => {
    console.log("🚨 Emergency direct navigation to results");
    
    // Clear any existing timeouts
    if (timeoutId) clearTimeout(timeoutId);
    
    // Generate a new key and force transition
    const newKey = Date.now();
    setResultsKey(newKey);
    
    // Just go directly to results without loading screen
    setCurrentScreen(3);
    setIsLoading(false);
  };

  // Button component to force navigate to results if stuck
  const EmergencyButton = () => (
    <TouchableOpacity
      style={styles.emergencyButton}
      onPress={forceNavigateToResults}
    >
      <Text style={styles.emergencyButtonText}>Show Results</Text>
    </TouchableOpacity>
  );

  const renderCurrentScreen = () => {
    // Safeguard against invalid screen index
    if (currentScreen < 0 || currentScreen > 3) {
      console.error(`❌ Invalid screen index: ${currentScreen}`);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            An error occurred with the feedback flow. Invalid screen index.
          </Text>
          <Button
            title="Go to Results" 
            onPress={forceNavigateToResults}
          />
          <Button 
            title="Return Home" 
            onPress={() => navigation.navigate('Home')}
          />
        </View>
      );
    }
    
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
        // Ensure results screen always gets a fresh key for remounting
        return (
          <View style={styles.fullScreenContainer}>
            <FeedbackResultsScreen key={resultsKey} />
          </View>
        );
      default:
        // This should never happen due to the safeguard above
        return null;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DA1F2" />
        <Text style={styles.loadingText}>Loading results...</Text>
        
        {/* Emergency button to force results screen if loading takes too long */}
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={forceNavigateToResults}
        >
          <Text style={styles.emergencyButtonText}>Show Results Now</Text>
        </TouchableOpacity>
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
    gap: 15,
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
    marginBottom: 30,
  },
  emergencyButton: {
    marginTop: 20,
    backgroundColor: '#F5F8FA',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1DA1F2',
  },
  emergencyButtonText: {
    color: '#1DA1F2',
    fontSize: 14,
  },
});

export default FeedbackSurveyScreen; 