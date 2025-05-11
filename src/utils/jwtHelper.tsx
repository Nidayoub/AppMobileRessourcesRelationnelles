/**
 * Utilitaire pour gérer les JWT tokens
 */

// Fonction utilitaire pour décoder le base64 compatible avec React Native
const base64DecodeToUtf8 = (str: string): string => {
  // Convertir de base64url en base64
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  
  try {
    // Utilisation de la solution la plus compatible avec React Native
    return decodeURIComponent(
      atob(base64 + padding)
        .split('')
        .map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
  } catch (error) {
    console.error('Base64 decode error:', error);
    return '';
  }
};

/**
 * Décode un JWT et extrait son contenu
 */
export const decodeJWT = (token: string) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }
    
    const base64Url = parts[1];
    const jsonStr = base64DecodeToUtf8(base64Url);
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Vérifie si un token JWT est expiré
 */
export const isTokenExpired = (token: string): boolean => {
  const decodedToken = decodeJWT(token);
  
  if (!decodedToken || !decodedToken.exp) {
    return true; // Si le token est invalide ou ne contient pas de date d'expiration
  }
  
  // La date d'expiration dans JWT est en secondes, on la convertit en millisecondes
  const expirationTime = decodedToken.exp * 1000;
  const currentTime = Date.now();
  
  return currentTime >= expirationTime;
};

/**
 * Extrait la date d'expiration d'un token JWT
 */
export const getTokenExpirationTime = (token: string): number | null => {
  const decodedToken = decodeJWT(token);
  
  if (!decodedToken || !decodedToken.exp) {
    return null;
  }
  
  return decodedToken.exp * 1000; // Convertir les secondes en millisecondes
};

/**
 * Extrait l'identifiant de l'utilisateur du token JWT
 */
export const getUserIdFromToken = (token: string): string | null => {
  const decodedToken = decodeJWT(token);
  
  if (!decodedToken || !decodedToken.sub) {
    return null;
  }
  
  return decodedToken.sub;
};

/**
 * Extrait les rôles de l'utilisateur du token JWT
 */
export const getUserRolesFromToken = (token: string): string[] => {
  const decodedToken = decodeJWT(token);
  
  if (!decodedToken || !decodedToken.roles) {
    return [];
  }
  
  // Selon le format des rôles dans votre token
  return Array.isArray(decodedToken.roles) 
    ? decodedToken.roles 
    : [decodedToken.roles];
}; 