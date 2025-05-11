// src/data/users.ts
// Types d'utilisateurs disponibles dans l'application

export type UserRole = 'visitor' | 'citizen' | 'admin';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string; // Ne pas utiliser en production, les mots de passe doivent être hashés
  role: UserRole;
  profilePicture?: string;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export const users: User[] = [
  // Compte visiteur (normal sans droits spécifiques)
  {
    id: 'user-001',
    firstName: 'Pierre',
    lastName: 'Dupont',
    email: 'pierre.dupont@example.com',
    password: 'password123',
    role: 'visitor',
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date('2024-04-05'),
    isActive: true
  },
  
  // Compte citoyen (avec droits de base)
  {
    id: 'user-002',
    firstName: 'Marie',
    lastName: 'Martin',
    email: 'marie.martin@example.com',
    password: 'secure456',
    role: 'citizen',
    profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg',
    createdAt: new Date('2024-02-10'),
    lastLogin: new Date('2024-04-08'),
    isActive: true
  },
  
  // Compte administrateur (avec droits étendus)
  {
    id: 'user-003',
    firstName: 'Fred',
    lastName: 'Caflers',
    email: 'fred.caflers@example.com',
    password: 'motdepasse',
    role: 'admin',
    profilePicture: 'https://randomuser.me/api/portraits/men/22.jpg',
    createdAt: new Date('2023-11-05'),
    lastLogin: new Date('2024-04-09'),
    isActive: true
  },
  
  // Nouveaux comptes administrateurs
  {
    id: 'admin-001',
    firstName: 'Sophie',
    lastName: 'Moreau',
    email: 'sophie.moreau@ressources-relationnelles.fr',
    password: 'Admin2024!',
    role: 'admin',
    profilePicture: 'https://randomuser.me/api/portraits/women/32.jpg',
    createdAt: new Date('2023-10-15'),
    lastLogin: new Date('2024-04-10'),
    isActive: true
  },
  {
    id: 'admin-002',
    firstName: 'Thomas',
    lastName: 'Laurent',
    email: 'thomas.laurent@ressources-relationnelles.fr',
    password: 'TL_Admin2024',
    role: 'admin',
    profilePicture: 'https://randomuser.me/api/portraits/men/45.jpg',
    createdAt: new Date('2023-09-22'),
    lastLogin: new Date('2024-04-11'),
    isActive: true
  },
  {
    id: 'admin-003',
    firstName: 'Émilie',
    lastName: 'Bernard',
    email: 'emilie.bernard@ressources-relationnelles.fr',
    password: 'EB_S3cure!',
    role: 'admin',
    profilePicture: 'https://randomuser.me/api/portraits/women/63.jpg',
    createdAt: new Date('2023-12-18'),
    lastLogin: new Date('2024-04-09'),
    isActive: true
  },
  {
    id: 'admin-004',
    firstName: 'Nicolas',
    lastName: 'Petit',
    email: 'nicolas.petit@ressources-relationnelles.fr',
    password: 'AdminNP2024',
    role: 'admin',
    profilePicture: 'https://randomuser.me/api/portraits/men/57.jpg',
    createdAt: new Date('2024-01-05'),
    lastLogin: new Date('2024-04-12'),
    isActive: true
  }
];

// Fonctions utilitaires pour la gestion des utilisateurs

export const findUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email);
};

export const findUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

export const authenticateUser = (email: string, password: string): User | null => {
  const user = findUserByEmail(email);
  if (user && user.password === password && user.isActive) {
    return user;
  }
  return null;
}; 