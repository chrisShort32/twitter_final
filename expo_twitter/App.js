import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';

import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { CubeNavProvider } from './src/context/CubeNavigationContext';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Asyncstorage has been extracted from react-native',
  'VirtualizedLists should never be nested',
]);

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthProvider>
        <CubeNavProvider>
          <AppNavigator />
        </CubeNavProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
