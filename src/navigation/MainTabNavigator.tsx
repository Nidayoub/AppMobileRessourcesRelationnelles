import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/Home/HomeScreen';
import ResourceDetailScreen from '../screens/Home/ResourceDetailScreen';
import CreateResourceScreen from '../screens/Create/CreateResourceScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import FavoritesScreen from '../screens/Profile/FavoritesScreen';
import ProgressScreen from '../screens/Profile/ProgressScreen';
import DashboardScreen from '../screens/Admin/DashboardScreen';
import ModerateResourcesScreen from '../screens/Admin/ModerateResourcesScreen';
import EditResourceScreen from '../screens/Admin/EditResourceScreen';
import ModerateCommentsScreen from '../screens/Admin/ModerateCommentsScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// Types
import { useAuth } from '../context/AuthContext';

// Constantes pour les styles
const COLORS = {
  primary: '#2196F3',
  inactive: '#757575',
  background: '#FFFFFF',
  border: '#F0F0F0',
}

// Types pour la navigation
export type HomeStackParamList = {
  Home: undefined;
  ResourceDetail: { resourceId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Favorites: undefined;
  Progress: undefined;
  Dashboard: undefined;
  ModerateResources: undefined;
  ModerateComments: undefined;
  EditResource: { resourceId: string };
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  HomeStack: undefined;
  Create: undefined;
  ProfileStack: undefined;
};

// Créer les navigateurs
const HomeStack = createStackNavigator<HomeStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Options communes pour les navigateurs Stack
const stackOptions = { headerShown: false };

// Home Stack Navigator
const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={stackOptions}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen name="ResourceDetail" component={ResourceDetailScreen} />
  </HomeStack.Navigator>
);

// Profile Stack Navigator
const ProfileStackNavigator = () => {
  const { user } = useAuth();
  
  return (
    <ProfileStack.Navigator screenOptions={stackOptions}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      
      {/* Écrans pour utilisateurs connectés */}
      {user && (
        <>
          <ProfileStack.Screen name="Favorites" component={FavoritesScreen} />
          <ProfileStack.Screen name="Progress" component={ProgressScreen} />
        </>
      )}
      
      {/* Écrans pour utilisateurs non connectés */}
      {!user && (
        <>
          <ProfileStack.Screen name="Login" component={LoginScreen} />
          <ProfileStack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
      
      {/* Écrans admin */}
      {user?.role === 'admin' && (
        <>
          <ProfileStack.Screen name="Dashboard" component={DashboardScreen} />
          <ProfileStack.Screen name="ModerateResources" component={ModerateResourcesScreen} />
          <ProfileStack.Screen name="ModerateComments" component={ModerateCommentsScreen} />
          <ProfileStack.Screen name="EditResource" component={EditResourceScreen} />
        </>
      )}
    </ProfileStack.Navigator>
  );
};

// Fonction pour obtenir l'icône selon le nom de route
const getIconName = (routeName: string): keyof typeof MaterialIcons.glyphMap => {
  switch (routeName) {
    case 'HomeStack': return 'home';
    case 'Create': return 'add-circle';
    case 'ProfileStack': return 'person';
    default: return 'home';
  }
};

// Main Tab Navigator
const MainTabNavigator = () => {
  const { user } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name={getIconName(route.name)} size={size} color={color} />
        ),
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          elevation: 8,
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowColor: '#000',
          shadowOffset: { height: -2, width: 0 },
          height: 60,
        },
      })}
    >
      <Tab.Screen 
        name="HomeStack" 
        component={HomeStackNavigator} 
        options={{ tabBarLabel: 'Accueil' }}
      />
      
      {/* L'onglet Create n'est visible que pour les utilisateurs connectés */}
      {user && (
        <Tab.Screen 
          name="Create" 
          component={CreateResourceScreen} 
          options={{ tabBarLabel: 'Créer' }}
        />
      )}
      
      <Tab.Screen 
        name="ProfileStack" 
        component={ProfileStackNavigator} 
        options={{ tabBarLabel: user ? 'Profil' : 'Connexion' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator; 