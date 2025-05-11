import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ProfileStackParamList } from './MainTabNavigator';

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'Login'>;

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string; // 'admin' | 'user' etc.
}

/**
 * Composant qui protège les routes nécessitant une authentification
 * Si l'utilisateur n'est pas connecté, affiche un message avec un bouton de connexion
 * Si un rôle est requis et que l'utilisateur n'a pas ce rôle, affiche un message d'accès refusé
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  // Si l'utilisateur n'est pas connecté
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <MaterialIcons name="lock" size={64} color="#757575" />
        <Text style={styles.title}>Accès limité</Text>
        <Text style={styles.message}>
          Vous devez être connecté pour accéder à cette page.
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Si un rôle spécifique est requis
  if (requiredRole && user.role !== requiredRole) {
    return (
      <View style={styles.container}>
        <MaterialIcons name="error" size={64} color="#F44336" />
        <Text style={styles.title}>Accès refusé</Text>
        <Text style={styles.message}>
          Vous n'avez pas les droits nécessaires pour accéder à cette page.
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.buttonText}>Retour au profil</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Si tout est en ordre, afficher le contenu protégé
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 16,
    marginBottom: 8
  },
  message: {
    fontSize: 16,
    color: '#616161',
    textAlign: 'center',
    marginBottom: 24
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default ProtectedRoute; 