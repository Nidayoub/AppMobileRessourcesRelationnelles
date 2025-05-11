import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { HttpInterceptorProvider } from './services/httpInterceptor';
import MainTabNavigator from './navigation/MainTabNavigator';

// App component with providers
const App = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  
  // Initialiser l'application
  useEffect(() => {
    const loadApp = async () => {
      try {
        // Ici on pourrait charger les polices, initialiser les services, etc.
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn(error);
      } finally {
        setAppIsReady(true);
      }
    };
    
    loadApp();
  }, []);
  
  // Afficher un écran vide pendant le chargement
  if (!appIsReady) return null;
  
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <NavigationContainer>
        <AuthProvider>
          <HttpInterceptorProvider>
            <ProgressProvider>
              <MainTabNavigator />
            </ProgressProvider>
          </HttpInterceptorProvider>
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App; 