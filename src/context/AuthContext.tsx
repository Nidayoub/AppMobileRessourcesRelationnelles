import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { User as ApiUser, authService } from '../services/api';
import { isTokenExpired, getUserIdFromToken, getUserRolesFromToken } from '../utils/jwtHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clé de stockage pour le token
const TOKEN_STORAGE_KEY = 'auth_token';

// Type pour l'utilisateur dans le contexte d'authentification
export type User = {
  id: string;
  firstName: string; 
  lastName: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
};

// Type pour le contexte d'authentification
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (firstName: string, lastName: string, username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  checkTokenExpiration: () => Promise<boolean>;
};

// Création du contexte d'authentification
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Convertit un ApiUser en User pour le contexte
 * Avec une gestion plus robuste des données manquantes
 */
const mapApiUserToContextUser = (apiUser: ApiUser): User => {
  // Vérification que apiUser existe et contient des données
  if (!apiUser || typeof apiUser !== 'object') {
    console.error('Invalid API user data:', apiUser);
    return {
      id: 'unknown',
      firstName: 'Utilisateur',
      lastName: 'Temporaire',
      username: 'user',
      email: '',
      role: 'user',
      isActive: true
    };
  }
  
  return {
    id: apiUser.idUtilisateur || apiUser.id || 'unknown',
    firstName: apiUser.prenom || '',
    lastName: apiUser.nom || '',
    username: apiUser.nomUtilisateur || apiUser.username || 'utilisateur',
    email: apiUser.email || '',
    role: apiUser.roleEnum || apiUser.role || 'user',
    isActive: apiUser.accountActivated || apiUser.isActive || true
  };
};

/**
 * Fournisseur d'authentification qui gère l'état utilisateur
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // États
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Vérifie si le token est expiré et déconnecte l'utilisateur si c'est le cas
   */
  const checkTokenExpiration = useCallback(async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) return false;
      
      const expired = isTokenExpired(token);
      
      if (expired) {
        console.log('Token expired, logging out user');
        await logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return false;
    }
  }, []);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const isAuth = await authService.isAuthenticated();
        
        if (isAuth) {
          // Vérifier si le token est valide
          const isValid = await checkTokenExpiration();
          
          if (isValid) {
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
              setUser(mapApiUserToContextUser(currentUser));
            }
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    
    // Vérifier l'expiration du token toutes les 5 minutes
    const tokenCheckInterval = setInterval(() => {
      checkTokenExpiration();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(tokenCheckInterval);
  }, [checkTokenExpiration]);

  /**
   * Connecte un utilisateur avec nom d'utilisateur et mot de passe
   */
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.login({
        nomUtilisateur: username,
        password
      });
      
      // Log de débogage
      console.log('Login response in AuthContext:', JSON.stringify(response, null, 2));
      
      if (response && response.User) {
        setUser(mapApiUserToContextUser(response.User));
        return true;
      } else {
        console.error('Invalid login response structure:', response);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Inscrit un nouvel utilisateur
   */
  const register = async (
    firstName: string, 
    lastName: string, 
    username: string,
    email: string, 
    password: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Registering with data:', { firstName, lastName, username, email, passwordLength: password.length });
      
      await authService.register({
        prenom: firstName,
        nom: lastName,
        nomUtilisateur: username,
        email,
        password,
        role: 'user' // Définir explicitement le rôle
      });
      
      return true;
    } catch (error) {
      console.error('Register error in AuthContext:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Déconnecte l'utilisateur actuel
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Valeurs du contexte
  const contextValue: AuthContextType = {
    user, 
    isAuthenticated: !!user, 
    login, 
    register, 
    logout,
    isLoading,
    checkTokenExpiration
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook pour utiliser le contexte d'authentification
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 