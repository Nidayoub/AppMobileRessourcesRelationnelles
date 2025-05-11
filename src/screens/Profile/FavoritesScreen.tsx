import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator,
  StatusBar,
  Alert
} from 'react-native';
import { useProgress } from '../../context/ProgressContext';
import { Resource } from '../../data/resources';
import ResourceCard from '../../components/ResourceCard';
import Header from '../../components/Header';
import { ressourceService, Ressource } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const FavoritesScreen = () => {
  const [loading, setLoading] = useState(true);
  const [favoriteResources, setFavoriteResources] = useState<Ressource[]>([]);
  const { favorites } = useProgress();
  const { user } = useAuth();
  
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      // Normalement, il faudrait un endpoint spécifique pour récupérer les favoris
      // Comme alternative, on récupère toutes les ressources et on filtre
      const resources = await ressourceService.getAllRessources();
      
      // Ici, on devrait filtrer selon les favoris de l'utilisateur stockés dans le backend
      // Pour l'instant, on utilise le contexte local comme source de vérité
      const favResources = resources.filter(resource => 
        favorites.includes(resource.id || resource.idRessource || '')
      );
      
      setFavoriteResources(favResources);
    } catch (error) {
      console.error('Erreur lors de la récupération des favoris:', error);
      Alert.alert(
        'Erreur',
        'Impossible de récupérer vos ressources favorites. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [favorites, user]);
  
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Aucune ressource favorite</Text>
      <Text style={styles.emptySubtext}>
        Ajoutez des ressources à vos favoris pour les retrouver ici
      </Text>
    </View>
  );
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title="Mes favoris" showBackButton />
      
      <FlatList
        data={favoriteResources}
        keyExtractor={(item) => item.id || item.idRessource || Math.random().toString()}
        renderItem={({ item }) => (
          <ResourceCard 
            resource={{
              id: item.id || item.idRessource || '',
              title: item.titre,
              category: item.type as any,
              type: item.type as any,
              content: item.contenu,
              summary: item.contenu.substring(0, 100) + '...',
              author: item.utilisateur?.nomUtilisateur || 'Auteur inconnu',
              public: item.statut === 'PUBLISHED',
              date: item.dateCreation || item.date_creation || new Date().toISOString(),
              views: 0,
              comments: []
            }}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
});

export default FavoritesScreen; 