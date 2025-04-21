import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import CubeSwipeScreen from '../screens/CubeSwipeScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import FeedbackSurveyScreen from '../screens/FeedbackSurveyScreen';
import { useAuth } from '../context/AuthContext';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { flex: 1 },
          animationEnabled: true,
        }}
      >
        {isAuthenticated ? (
          // User is signed in
          <>
            <Stack.Screen name="Home" component={HomeScreen}/>
            <Stack.Screen
              name="CubeSwipe"
              component={CubeSwipeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="UserProfile" 
              component={UserProfileScreen} 
              options={{
                gestureEnabled: false,
                animationEnabled: true,
                detachPreviousScreen: false,
                presentation: 'card',
                cardStyleInterpolator: ({ current, layouts }) => {
                  return {
                    cardStyle: {
                      transform: [
                        {
                          translateX: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.width, 0],
                          }),
                        },
                      ],
                    },
                  };
                },
              }}
            />
            <Stack.Screen 
              name="FeedbackSurvey" 
              component={FeedbackSurveyScreen} 
              options={{
                gestureEnabled: false,
                animationEnabled: true,
                detachPreviousScreen: false,
                presentation: 'card',
              }}
            />
          </>
        ) : (
          // User is not signed in
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default AppNavigator; 