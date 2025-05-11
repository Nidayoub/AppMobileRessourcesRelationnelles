import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Image,
  StatusBar,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useProgress } from '../../context/ProgressContext';
import { ProfileStackParamList } from '../../navigation/MainTabNavigator';
import Header from '../../components/Header';
import StatCard from '../../components/StatCard';
import ResourceCard from '../../components/ResourceCard';
import { ressourceService, Ressource } from '../../services/api';

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout } = useAuth();
  const { favorites, explored, saved } = useProgress();
  const isFocused = useIsFocused();
  const [userResources, setUserResources] = useState<Ressource[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  
  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          onPress: () => logout(),
          style: 'destructive',
        },
      ]
    );
  };
  
  const navigateToFavorites = () => {
    navigation.navigate('Favorites');
  };
  
  const navigateToProgress = () => {
    navigation.navigate('Progress');
  };
  
  const navigateToDashboard = () => {
    if (user?.role === 'admin') {
      navigation.navigate('Dashboard');
    }
  };
  
  const navigateToLogin = () => {
    navigation.navigate('Login');
  };
  
  const navigateToRegister = () => {
    navigation.navigate('Register');
  };
  
  // Charger les ressources créées par l'utilisateur
  const loadUserResources = async () => {
    if (!user) return;
    
    try {
      setLoadingResources(true);
      const allResources = await ressourceService.getAllRessources();
      
      // Filtrer pour ne garder que les ressources de l'utilisateur actuel
      const filteredResources = allResources.filter(resource => {
        return resource.utilisateur && resource.utilisateur.idUtilisateur === user.id;
      });
      
      console.log(`Ressources de l'utilisateur: ${filteredResources.length} trouvées`);
      setUserResources(filteredResources);
    } catch (error) {
      console.error('Erreur lors du chargement des ressources utilisateur:', error);
    } finally {
      setLoadingResources(false);
    }
  };
  
  // Charger les ressources au montage et quand l'écran est à nouveau affiché
  useEffect(() => {
    if (isFocused && user) {
      loadUserResources();
    }
  }, [isFocused, user]);

  // Rendu pour les utilisateurs non connectés
  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header title="Connexion" />
        
        <View style={styles.guestContainer}>
          <View style={styles.guestIconContainer}>
            <MaterialIcons name="person-outline" size={80} color="#BDBDBD" />
          </View>
          
          <Text style={styles.guestTitle}>Vous n'êtes pas connecté</Text>
          <Text style={styles.guestSubtitle}>
            Connectez-vous pour accéder à toutes les fonctionnalités de l'application
          </Text>
          
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={navigateToLogin}
          >
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={navigateToRegister}
          >
            <Text style={styles.registerButtonText}>Créer un compte</Text>
          </TouchableOpacity>
          
          <Text style={styles.guestMessage}>
            En tant qu'invité, vous pouvez toujours consulter les ressources publiques.
          </Text>
        </View>
      </View>
    );
  }
  
  // Rendu pour les utilisateurs connectés
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title="Profil" rightIcon="logout" onRightIconPress={handleLogout} />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{user.firstName.charAt(0)}</Text>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.username}>@{user.username}</Text>
            <View style={styles.roleContainer}>
              <Text style={styles.roleText}>
                {user.role === 'admin' ? 'Administrateur' : user.role === 'citizen' ? 'Citoyen' : 'Visiteur'}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <StatCard 
            title="Ressources explorées" 
            value={explored.length.toString()} 
            icon="visibility" 
            iconColor="#4CAF50" 
            backgroundColor="#E8F5E9" 
          />
          
          <StatCard 
            title="Ressources favorites" 
            value={favorites.length.toString()} 
            icon="favorite" 
            iconColor="#F44336" 
            backgroundColor="#FFEBEE" 
          />
          
          <StatCard 
            title="Ressources sauvegardées" 
            value={saved.length.toString()} 
            icon="bookmark" 
            iconColor="#FF9800" 
            backgroundColor="#FFF3E0" 
          />
        </View>
        
        {/* Mes ressources */}
        <View style={styles.resourcesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes ressources</Text>
            <Text style={styles.resourceCount}>{userResources.length} ressource(s)</Text>
          </View>
          
          {loadingResources ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.loadingText}>Chargement des ressources...</Text>
            </View>
          ) : userResources.length === 0 ? (
            <View style={styles.emptyResourcesContainer}>
              <MaterialIcons name="library-books" size={48} color="#BDBDBD" />
              <Text style={styles.emptyResourcesText}>Vous n'avez pas encore créé de ressources</Text>
              <TouchableOpacity 
                style={styles.createResourceButton}
                onPress={() => navigation.navigate('Create' as never)}
              >
                <Text style={styles.createResourceButtonText}>Créer une ressource</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={userResources}
              keyExtractor={(item) => item.idRessource || item.id || String(Math.random())}
              renderItem={({ item }) => {
                // Adapter les propriétés selon la structure reçue
                const resourceProps = {
                  id: item.idRessource || item.id || '',
                  title: item.titre || '',
                  content: item.contenu || '',
                  type: item.type || '',
                  date: item.dateCreation 
                        ? new Date(item.dateCreation).toLocaleDateString() 
                        : item.date_creation 
                          ? new Date(item.date_creation).toLocaleDateString()
                          : '',
                  author: user ? `${user.firstName} ${user.lastName}` : 'Vous',
                  public: item.statut === 'PUBLIC',
                  summary: item.contenu 
                    ? (item.contenu.length > 120 ? item.contenu.substring(0, 117) + '...' : item.contenu)
                    : 'Aucun contenu',
                  comments: item.commentaires || []
                };
                
                return <ResourceCard resource={resourceProps} compact={true} />;
              }}
              scrollEnabled={false}
              style={styles.resourceList}
              contentContainerStyle={styles.resourceListContent}
            />
          )}
        </View>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionItem} onPress={navigateToFavorites}>
            <MaterialIcons name="favorite" size={24} color="#F44336" style={styles.optionIcon} />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Mes favoris</Text>
              <Text style={styles.optionSubtitle}>Consultez vos ressources préférées</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionItem} onPress={navigateToProgress}>
            <MaterialIcons name="insights" size={24} color="#4CAF50" style={styles.optionIcon} />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Ma progression</Text>
              <Text style={styles.optionSubtitle}>Suivez votre parcours d'apprentissage</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" />
          </TouchableOpacity>
          
          {user.role === 'admin' && (
            <TouchableOpacity style={styles.optionItem} onPress={navigateToDashboard}>
              <MaterialIcons name="dashboard" size={24} color="#2196F3" style={styles.optionIcon} />
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Tableau de bord</Text>
                <Text style={styles.optionSubtitle}>Accédez aux statistiques utilisateurs</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.optionItem} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color="#F44336" style={styles.optionIcon} />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Déconnexion</Text>
              <Text style={styles.optionSubtitle}>Quitter votre session</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F44336',
  },
  scrollContainer: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  username: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
    fontStyle: 'italic'
  },
  roleContainer: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2196F3',
  },
  statsContainer: {
    padding: 16,
  },
  optionsContainer: {
    padding: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  optionIcon: {
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#757575',
  },
  // Styles pour les utilisateurs non connectés
  guestContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 32,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  registerButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  guestMessage: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
  },
  resourcesSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  resourceCount: {
    fontSize: 14,
    color: '#757575',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#757575',
  },
  emptyResourcesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyResourcesText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 20,
  },
  createResourceButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  createResourceButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  resourceList: {
    marginTop: 8,
  },
  resourceListContent: {
    paddingBottom: 8,
  },
});

export default ProfileScreen; 