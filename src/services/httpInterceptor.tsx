import React, { ReactNode, createContext, useContext, useRef } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

// Définition du type pour le contexte
type HttpInterceptorContextType = {
  handleApiError: (error: any) => void;
};

// Création du contexte
const HttpInterceptorContext = createContext<HttpInterceptorContextType | undefined>(undefined);

/**
 * Composant provider pour l'intercepteur HTTP
 * Permet de gérer centralement les erreurs HTTP et les problèmes d'authentification
 */
export const HttpInterceptorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const isHandlingAuthError = useRef(false);

  /**
   * Gère les erreurs API et redirige vers la page de login si nécessaire
   */
  const handleApiError = (error: any) => {
    if (error?.message?.includes('Authentication required') && !isHandlingAuthError.current) {
      isHandlingAuthError.current = true;
      
      Alert.alert(
        'Session expirée',
        'Votre session a expiré. Veuillez vous reconnecter.',
        [
          {
            text: 'OK',
            onPress: async () => {
              await logout();
              // @ts-ignore
              navigation.navigate('ProfileStack', { screen: 'Login' });
              setTimeout(() => {
                isHandlingAuthError.current = false;
              }, 1000);
            }
          }
        ]
      );
      
      return;
    }
    
    // Gérer d'autres types d'erreurs
    console.error('API Error:', error);
    
    // Afficher une alerte générique pour les autres erreurs
    if (!error?.message?.includes('cancelled')) {
      Alert.alert(
        'Erreur',
        'Une erreur est survenue. Veuillez réessayer plus tard.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <HttpInterceptorContext.Provider value={{ handleApiError }}>
      {children}
    </HttpInterceptorContext.Provider>
  );
};

/**
 * Hook pour utiliser l'intercepteur HTTP
 */
export const useHttpInterceptor = () => {
  const context = useContext(HttpInterceptorContext);
  
  if (context === undefined) {
    throw new Error('useHttpInterceptor must be used within a HttpInterceptorProvider');
  }
  
  return context;
}; 