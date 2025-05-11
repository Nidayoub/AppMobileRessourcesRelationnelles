import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, SafeAreaView, StatusBar, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/native';
import ResourceCard from '../../components/ResourceCard';
import { ressourceService, Ressource } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Constantes pour les couleurs et l'interface
const COLORS = {
  primary: '#2196F3',
  background: '#F5F7FA',
  text: {
    dark: '#212121',
    medium: '#616161',
    light: '#757575',
    lighter: '#9E9E9E'
  },
  empty: '#BDBDBD',
  white: '#FFFFFF'
};

// Composant pour afficher un message quand aucune ressource n'est trouvée
const EmptyListMessage = () => (
  <View style={styles.emptyContainer}>
    <MaterialIcons name="search-off" size={48} color={COLORS.empty} />
    <Text style={styles.emptyText}>Aucune ressource trouvée</Text>
    <Text style={styles.emptySubtext}>Veuillez réessayer plus tard</Text>
  </View>
);

// Définir l'interface pour le type Comment
interface Comment {
  idCommentaire: string;
  Commentaire: string;
  date: string;
  nom_utilisateur: string;
  report_count: number;
  is_verification_needed: boolean;
}

// Définir l'interface pour le type Resource (utilisée par ResourceCard)
interface Resource {
  id: string;
  title: string;
  content: string;
  type: string;
  date: string;
  author: string;
  public: boolean;
  summary: string;
  comments: Comment[];
}

// Composant principal
const HomeScreen = () => {
  // États
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resources, setResources] = useState<Ressource[]>([]);
  
  // Hook de navigation et d'authentification
  const navigation = useNavigation();
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const route = useRoute();
  
  // Charger les ressources
  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await ressourceService.getAllRessources();
      console.log(`Récupération de ${data.length} ressources`);
      console.log('Ressources récupérées:', JSON.stringify(data, null, 2));
      
      // Filtrer les ressources pour n'afficher que les ressources publiques
      // ou les ressources privées de l'utilisateur connecté
      const filteredResources = data.filter(resource => {
        const isPublic = resource.statut === 'PUBLIC';
        let isOwner = false;
        
        if (user && resource.utilisateur) {
          // Vérifier si l'utilisateur est le propriétaire en utilisant l'ID utilisateur
          isOwner = resource.utilisateur.idUtilisateur === user.idUtilisateur;
        }
        
        console.log(`Resource ${resource.idRessource || resource.id}: Public=${isPublic}, Owner=${isOwner}`);
        return isPublic || isOwner;
      });
      
      console.log(`Après filtrage: ${filteredResources.length} ressources affichées`);
      setResources(filteredResources);
    } catch (error) {
      console.error('Error loading resources:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les ressources. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Charger les ressources au montage et lors du focus sur l'écran
  useEffect(() => {
    if (isFocused) {
      console.log('HomeScreen est maintenant en focus, actualisation des ressources');
      loadResources();
    }
  }, [isFocused]);
  
  // Gérer le rafraîchissement
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadResources();
  };
  
  // Composant d'en-tête
  const HeaderComponent = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>(RE)Sources Relationnelles</Text>
      <Text style={styles.subtitle}>Explorez des ressources pour améliorer vos relations</Text>
    </View>
  );

  // Afficher un chargement pendant le chargement initial
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement des ressources...</Text>
      </View>
    );
  }
  
  // Afficher la liste des ressources
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <FlatList
        data={resources}
        keyExtractor={(item) => item.idRessource || item.id || String(Math.random())}
        renderItem={({ item }) => {
          // Mieux gérer les propriétés utilisateur
          const authorName = item.utilisateur 
            ? `${item.utilisateur.prenom || ''} ${item.utilisateur.nom || ''}`.trim() 
            : 'Auteur inconnu';
          
          // Extraire le contenu pour le résumé, en s'assurant qu'il ne soit pas trop long
          const contentSummary = item.contenu 
            ? (item.contenu.length > 120 ? item.contenu.substring(0, 117) + '...' : item.contenu)
            : 'Aucun contenu';

          // Adapter les propriétés selon la structure reçue
          const resourceProps: Resource = {
            id: item.idRessource || item.id || '',
            title: item.titre || '',
            content: item.contenu || '',
            type: item.type || '',
            date: item.dateCreation 
                  ? new Date(item.dateCreation).toLocaleDateString() 
                  : item.date_creation 
                    ? new Date(item.date_creation).toLocaleDateString()
                    : '',
            author: authorName,
            public: item.statut === 'PUBLIC',
            summary: contentSummary,
            comments: item.commentaires || []
          };
          
          console.log('Rendering resource:', item.idRessource || item.id, item.titre);
          return <ResourceCard resource={resourceProps} />;
        }}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={HeaderComponent}
        ListEmptyComponent={EmptyListMessage}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text.light,
  },
  listContent: {
    padding: 16,
    paddingTop: 24,
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.dark,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.medium,
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.light,
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.text.lighter,
    textAlign: 'center',
  },
});

export default HomeScreen; 