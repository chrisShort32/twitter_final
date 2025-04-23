import React, {useRef} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import FeedbackSurveyScreen from '../screens/FeedbackSurveyScreen';
import { useAuth } from '../context/AuthContext';
import { Dimensions } from 'react-native';




const Stack = createStackNavigator();


const AppNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const previousIndexRef = useRef(0);
  const { width } = Dimensions.get('window');
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
          transitionSpec: {
            open: { animation: 'timing', config: {duration: 800}},
            close: {animation: 'timing', config: {duration: 600}},
          },
        }}
      >
        {isAuthenticated ? (
          // User is signed in
          <>
            <Stack.Screen name="Home" component={HomeScreen}/>
            <Stack.Screen 
              name="UserProfile" 
              component={UserProfileScreen} 
              options={{
                gestureEnabled: true,
                animationEnabled: true,
                detachPreviousScreen: false,
                presentation: 'card',
                cardStyleInterpolator: ({ current, next, index, closing }) => {
                  const isBack = index < previousIndexRef.current;
                  console.log('index', index, 'prev', previousIndexRef.current, 'isBack', isBack);
                  previousIndexRef.current = index;
                  return {
                    cardStyle: {
                      backgroundColor: '#fff',
                      
                      //backfaceVisibility: 'hidden',
                      transform: [
                        { perspective: 600 },

                        {
                          rotateY: current.progress.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: isBack ? ['180deg', '90deg', '0deg'] : ['180deg', '90deg', '0deg'],
                            extrapolate: 'clamp',
                          }),
                        },
                        {
                          scaleX: current.progress.interpolate({
                            inputRange: [0,0.5,1],
                            outputRange: [0.85,1.05,1],
                          }),
                        },
                      ],
                      
                      opacity: current.progress.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 0.7, 1],
                      }),
                      shadowColor: '#000',
                      shadowOffset: {
                        width: 10,
                        height: 0,
                      },
                      shadowOpacity: current.progress.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 0.4, 0], // Shadow peaks mid-flip
                      }),
                      shadowRadius: 15,
                      elevation: 8,
                    },
                    containerStyle: {
                      backgroundColor: '#ff000',
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