import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { isTokenExpired as isJwtExpired, getTokenExpirationTime } from '../utils/jwtHelper';

// Clés de stockage AsyncStorage
const TOKEN_STORAGE_KEY = 'auth_token';
const USER_STORAGE_KEY = 'user';

// Configuration API
const API_URL = 'https://4416-2a02-8440-910b-674-b529-77a7-ccae-cfd4.ngrok-free.app';

// Durée de validité du token en millisecondes (30 minutes)
const TOKEN_VALIDITY_DURATION = 30 * 60 * 1000; // 30 minutes

// Stockage de la date d'expiration du token
let tokenExpirationTime: number | null = null;

// Headers par défaut pour toutes les requêtes
const baseHeaders = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'ngrok-skip-browser-warning': 'true',
};

// Interfaces
export interface LoginData {
  nomUtilisateur: string;
  password: string;
}

export interface RegisterData {
  nom: string;
  prenom: string;
  nomUtilisateur: string;
  email: string;
  password: string;
  role?: string;
}

export interface User {
  idUtilisateur?: string;
  id?: string;                // Alternative au cas où l'API utilise 'id' au lieu de 'idUtilisateur'
  nom?: string;
  prenom?: string;
  nomUtilisateur?: string;
  username?: string;          // Alternative au cas où l'API utilise 'username' au lieu de 'nomUtilisateur'
  email?: string;
  roleEnum?: string;
  role?: string;              // Alternative au cas où l'API utilise 'role' au lieu de 'roleEnum'
  accountActivated?: boolean;
  isActive?: boolean;         // Alternative au cas où l'API utilise 'isActive' au lieu de 'accountActivated'
  dateInscription?: string;
  createdAt?: string;         // Alternative pour la date d'inscription
}

export interface AdminUserData {
  nom: string;
  prenom: string;
  nomUtilisateur: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  Token?: string;      // Format attendu par notre application
  token?: string;      // Format alternatif (minuscules)
  User?: User;         // Format attendu par notre application
  user?: User;         // Format alternatif (minuscules)
  profile?: User;      // Autre format possible
}

export interface Ressource {
  id?: string;
  idRessource?: string;
  titre: string;
  contenu: string;
  type: string;
  statut: 'PUBLIC' | 'PRIVE';  // Valeurs correctes selon la contrainte SQL
  date_creation?: string;
  dateCreation?: string;
  utilisateur_id?: string;
  utilisateur?: User;
}

export interface CreateRessourceData {
  titre: string;
  contenu: string;
  type: string;
  statut: 'PUBLIC' | 'PRIVE';  // Valeurs correctes selon la contrainte SQL
}

export interface UpdateRessourceData {
  titre: string;
  contenu: string;
  type: string;
  statut: 'PUBLIC' | 'PRIVE';  // Valeurs correctes selon la contrainte SQL
  date_creation?: string;
}

export interface Comment {
  idCommentaire: string;
  Commentaire: string;
  date: string;
  nom_utilisateur: string;
  report_count: number;
  is_verification_needed: boolean;
  ressourceId?: string;
}

export interface CreateCommentData {
  Commentaire: string;
  ressourceId: string;
}

export interface ResetPasswordData {
  newPassword: string;
  confirmPassword: string;
}

// Fonctions utilitaires pour le traitement des données utilisateur

/**
 * Créer un utilisateur par défaut avec le minimum requis
 */
const createDefaultUser = (username: string): User => ({
  idUtilisateur: 'unknown',
  nom: 'Utilisateur',
  prenom: 'Temporaire',
  nomUtilisateur: username,
  email: '',
  roleEnum: 'user',
  accountActivated: true
});

/**
 * Normaliser les données utilisateur pour s'assurer que tous les champs requis sont présents
 */
const normalizeUserData = (userData: any, username: string): User => {
  if (!userData || typeof userData !== 'object') {
    return createDefaultUser(username);
  }
  
  // Construire un objet utilisateur complet en fusionnant avec des valeurs par défaut
  return {
    idUtilisateur: userData.idUtilisateur || userData.id || 'unknown',
    nom: userData.nom || userData.lastName || 'Nom',
    prenom: userData.prenom || userData.firstName || 'Prénom',
    nomUtilisateur: userData.nomUtilisateur || userData.username || username,
    email: userData.email || '',
    roleEnum: userData.roleEnum || userData.role || 'user',
    accountActivated: userData.accountActivated || userData.isActive || true,
    dateInscription: userData.dateInscription || userData.createdAt
  };
};

// Récupération du token depuis AsyncStorage
const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    return token;
  } catch (error) {
    console.error('Error retrieving token from AsyncStorage:', error);
    return null;
  }
};

// Vérifier si le token est expiré
const isTokenExpired = async (): Promise<boolean> => {
  const token = await getToken();
  if (!token) return true;
  
  return isJwtExpired(token);
};

// Récupérer un nouveau token avec le refresh token
const refreshToken = async (): Promise<boolean> => {
  try {
    // Si votre API supporte le rafraîchissement du token, implémentez cette logique ici
    // Exemple :
    // const refreshTokenValue = await AsyncStorage.getItem('refreshToken');
    // if (!refreshTokenValue) return false;
    
    // const response = await fetch(`${API_URL}/v1/sources-relationnelles/auth/refresh`, {
    //   method: 'POST',
    //   headers: baseHeaders,
    //   body: JSON.stringify({ refreshToken: refreshTokenValue })
    // });
    
    // if (!response.ok) return false;
    
    // const data = await response.json();
    // await AsyncStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    // await AsyncStorage.setItem('refreshToken', data.refreshToken);
    
    // tokenExpirationTime = Date.now() + TOKEN_VALIDITY_DURATION;
    // return true;
    
    // Pour l'instant, comme cette fonctionnalité n'est pas implémentée côté API, on retourne false
    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

// Fonction HTTP principale
const fetchWithoutSignal = async (
  endpoint: string,
  options: {
    method: string;
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
    useToken?: string;
  }
) => {
  const isAuthEndpoint = endpoint.includes('/auth/');
  if (!isAuthEndpoint && await isTokenExpired()) {
    const refreshed = await refreshToken();
    if (!refreshed) {
      console.log('Token expired and refresh failed');
    }
  }

  const token = options.useToken || await getToken();
  
  const requestHeaders = {
    ...baseHeaders,
    ...(!isAuthEndpoint && token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const timeoutMs = options.timeout || 30000;
  const url = `${API_URL}/${endpoint}`;
  
  console.log('Request details:', {
    url,
    method: options.method,
    headers: requestHeaders,
    body: options.body
  });
  
  const requestOptions: RequestInit = {
    method: options.method,
    headers: requestHeaders,
  };
  
  if (Platform.OS === 'android') {
    // @ts-ignore - propriété non standard spécifique à RN
    requestOptions.insecure = true;
  }
  
  if (options.body) {
    requestOptions.body = JSON.stringify(options.body);
  }

  try {
    const fetchPromise = fetch(url, requestOptions);
    const timeoutPromise = new Promise<Response>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
    });
    
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    // Log de la réponse complète
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const responseText = await response.clone().text();
    console.log('Response body:', responseText);
    
    if (response.status === 401) {
      if (!endpoint.includes('/users/profile')) {
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
      }
      throw new Error('Authentication required');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}, Details: ${responseText}`);
    }
    
    try {
      return JSON.parse(responseText);
    } catch (error) {
      return responseText;
    }
  } catch (error) {
    console.error('❌ Fetch error:', error);
    throw error;
  }
};

// Services d'authentification
export const authService = {
  login: async (data: LoginData) => {
    try {
      // Formatage des données selon le format attendu par l'API
      const loginData = {
        nomUtilisateur: data.nomUtilisateur, 
        password: data.password
      };

      console.log('Attempting login with formatted data:', JSON.stringify(loginData, null, 2));
      
      const response = await fetchWithoutSignal('v1/sources-relationnelles/auth/login', {
        method: 'POST',
        body: loginData
      });
      
      // Log de débogage pour voir la structure de la réponse
      console.log('API Login response:', JSON.stringify(response, null, 2));
      
      // Extraire le token de la réponse
      const token = response.Token || response.token;
      
      if (!token) {
        throw new Error('No token returned from server');
      }
      
      // Construire les données utilisateur directement depuis la réponse de connexion
      const userData: User = {
        idUtilisateur: response.id,
        email: response.email,
        nomUtilisateur: response.username || response.nomUtilisateur,
        nom: response.nom || response.lastName || 'Utilisateur',  // Ajout du nom
        prenom: response.prenom || response.firstName || '',      // Ajout du prénom
        username: response.username || response.nomUtilisateur,   // Assurer que username est défini
        role: response.role || 'ROLE_USER'                       // Rôle de l'utilisateur
      };
      
      // Stocker le token et les données utilisateur
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      
      // Extraire la date d'expiration du token JWT
      const tokenExp = getTokenExpirationTime(token);
      if (tokenExp) {
        tokenExpirationTime = tokenExp;
      } else {
        // Fallback si le token ne contient pas d'expiration
        tokenExpirationTime = Date.now() + TOKEN_VALIDITY_DURATION;
      }
      
      return { Token: token, User: userData } as AuthResponse;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (data: RegisterData) => {
    try {
      return await fetchWithoutSignal('v1/sources-relationnelles/auth/register', {
        method: 'POST',
        body: { 
          ...data, 
          role: data.role || 'ROLE_USER' // Utiliser 'ROLE_USER' comme valeur par défaut si role est undefined
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  },
  
  getCurrentUser: async (): Promise<User | null> => {
    const userJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },
  
  isAuthenticated: async (): Promise<boolean> => {
    const token = await getToken();
    return !!token;
  },

  forgotPassword: async (email: string) => {
    try {
      return await fetchWithoutSignal(`v1/sources-relationnelles/users/forgot-password?email=${encodeURIComponent(email)}`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  resetPassword: async (token: string, passwordData: ResetPasswordData) => {
    try {
      return await fetchWithoutSignal(`v1/sources-relationnelles/users/update-password?token=${encodeURIComponent(token)}`, {
        method: 'PUT',
        body: passwordData
      });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }
};

// Services de gestion des utilisateurs (Admin)
export const adminService = {
  createUser: async (data: AdminUserData) => {
    try {
      return await fetchWithoutSignal('v1/sources-relationnelles/admin/create', {
        method: 'POST',
        body: data
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  enableUser: async (userId: string) => {
    try {
      return await fetchWithoutSignal(`v1/sources-relationnelles/admin/enable/${userId}`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Error enabling user:', error);
      throw error;
    }
  },
  
  disableUser: async (userId: string) => {
    try {
      return await fetchWithoutSignal(`v1/sources-relationnelles/admin/disable/${userId}`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Error disabling user:', error);
      throw error;
    }
  },
  
  getAllUsers: async () => {
    try {
      return await fetchWithoutSignal('v1/sources-relationnelles/users/all', {
        method: 'GET'
      });
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },
  
  getUserByEmail: async (email: string) => {
    try {
      return await fetchWithoutSignal(`v1/sources-relationnelles/users/email?email=${encodeURIComponent(email)}`, {
        method: 'GET'
      });
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }
};

// Services de gestion des ressources
export const ressourceService = {
  getAllRessources: async (page = 0, size = 20): Promise<Ressource[]> => {
    try {
      return await fetchWithoutSignal(`v1/sources-relationnelles/ressources/all?page=${page}&size=${size}`, {
        method: 'GET'
      });
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  },
  
  getRessourceByTitle: async (title: string) => {
    try {
      return await fetchWithoutSignal(
        `v1/sources-relationnelles/ressources/title?title=${encodeURIComponent(title)}`,
        { method: 'GET' }
      ) as Ressource;
    } catch (error) {
      console.error('Error fetching resource by title:', error);
      throw error;
    }
  },
  
  createRessource: async (data: CreateRessourceData) => {
    try {
      return await fetchWithoutSignal('v1/sources-relationnelles/ressources/create', {
        method: 'POST',
        body: data
      });
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  },
  
  updateRessource: async (id: string, data: UpdateRessourceData) => {
    try {
      return await fetchWithoutSignal(`v1/sources-relationnelles/ressources/update/${id}`, {
        method: 'PUT',
        body: data
      });
    } catch (error) {
      console.error('Error updating resource:', error);
      throw error;
    }
  },
  
  deleteRessource: async (id: string) => {
    try {
      return await fetchWithoutSignal(`v1/sources-relationnelles/ressources/delete/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  },
  
  getCompleteRessources: async () => {
    try {
      return await fetchWithoutSignal('v1/sources-relationnelles/ressources/complete', {
        method: 'GET'
      });
    } catch (error) {
      console.error('Error fetching complete resources:', error);
      throw error;
    }
  },
  
  getRessourcesCount: async () => {
    try {
      return await fetchWithoutSignal('v1/sources-relationnelles/ressources/count', {
        method: 'GET'
      });
    } catch (error) {
      console.error('Error fetching resources count:', error);
      throw error;
    }
  }
};

// Services de gestion des commentaires
export const commentService = {
  createComment: async (ressourceId: string, commentData: CreateCommentData) => {
    try {
      return await fetchWithoutSignal(`v1/sources-relationnelles/comments/create?ressourceId=${ressourceId}`, {
        method: 'POST',
        body: commentData
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },
  
  getComments: async (ressourceId: string, page = 0, size = 20) => {
    try {
      return await fetchWithoutSignal(
        `v1/sources-relationnelles/comments/getComments?ressourceId=${ressourceId}&page=${page}&size=${size}`,
        { method: 'GET' }
      );
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },
  
  reportComment: async (commentId: string) => {
    try {
      return await fetchWithoutSignal(`v1/sources-relationnelles/comments/report?commentsId=${commentId}`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Error reporting comment:', error);
      throw error;
    }
  },
  
  deleteComment: async (commentId: string) => {
    try {
      return await fetchWithoutSignal(`v1/sources-relationnelles/comments/delete?commentsId=${commentId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },
  
  getReportedComments: async (page = 0, size = 20) => {
    try {
      return await fetchWithoutSignal(
        `v1/sources-relationnelles/comments/reportedComments?page=${page}&size=${size}`,
        { method: 'GET' }
      );
    } catch (error) {
      console.error('Error fetching reported comments:', error);
      throw error;
    }
  }
};

// API générique
export const api = {
  get: async (endpoint: string) => fetchWithoutSignal(endpoint, { method: 'GET' }),
  post: async (endpoint: string, data: any) => fetchWithoutSignal(endpoint, { method: 'POST', body: data }),
  put: async (endpoint: string, data: any) => fetchWithoutSignal(endpoint, { method: 'PUT', body: data }),
  delete: async (endpoint: string) => fetchWithoutSignal(endpoint, { method: 'DELETE' })
}; 