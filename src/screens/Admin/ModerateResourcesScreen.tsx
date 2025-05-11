import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { ressourceService, Ressource } from '../../services/api';

const ModerateResourcesScreen = () => {
  const navigation = useNavigation();
  const [resourcesList, setResourcesList] = useState<Ressource[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0
  });

  const fetchResources = async (pageNum = 0, shouldRefresh = false) => {
    try {
      if (shouldRefresh) {
        setRefreshing(true);
      } else if (pageNum === 0) {
        setLoading(true);
      }
      
      const resources = await ressourceService.getAllRessources(pageNum);
      
      if (shouldRefresh || pageNum === 0) {
        setResourcesList(resources);
      } else {
        setResourcesList(prev => [...prev, ...resources]);
      }
      
      setHasMore(resources.length === 20); // Assuming page size is 20
      setPage(pageNum);
      
      // Calculate stats
      if (pageNum === 0 || shouldRefresh) {
        const total = await ressourceService.getRessourcesCount();
        const published = resources.filter(r => r.statut === 'PUBLIC').length;
        const draft = resources.filter(r => r.statut === 'PRIVE').length;
        const archived = resources.filter(r => r.statut === 'ARCHIVED').length;
        
        setStats({
          total: total || resources.length,
          published,
          draft,
          archived
        });
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      Alert.alert('Erreur', 'Impossible de charger les ressources');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleRefresh = () => {
    fetchResources(0, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading && !refreshing) {
      fetchResources(page + 1);
    }
  };

  const handleApproveResource = (resource: Ressource) => {
    const resourceId = resource.id || resource.idRessource;
    if (!resourceId) {
      Alert.alert('Erreur', 'ID de ressource manquant');
      return;
    }
    
    Alert.alert(
      'Publier la ressource',
      `Voulez-vous vraiment publier "${resource.titre}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Publier',
          onPress: async () => {
            try {
              // Mettre à jour l'UI d'abord pour une réponse immédiate
              const updatedResources = resourcesList.map(item => 
                (item.id === resourceId || item.idRessource === resourceId) 
                  ? { ...item, statut: 'PUBLIC' } 
                  : item
              );
              setResourcesList(updatedResources);
              
              // Mettre à jour la ressource via l'API
              await ressourceService.updateRessource(resourceId, {
                ...resource,
                titre: resource.titre,
                contenu: resource.contenu,
                type: resource.type,
                statut: 'PUBLIC'
              });
              
              Alert.alert('Succès', 'Ressource publiée avec succès');
            } catch (error) {
              console.error('Error approving resource:', error);
              Alert.alert('Erreur', 'Impossible de publier la ressource');
              // Recharger en cas d'erreur
              fetchResources(0, true);
            }
          }
        }
      ]
    );
  };

  const handleArchiveResource = (resource: Ressource) => {
    const resourceId = resource.id || resource.idRessource;
    if (!resourceId) {
      Alert.alert('Erreur', 'ID de ressource manquant');
      return;
    }
    
    Alert.alert(
      'Archiver la ressource',
      `Voulez-vous vraiment archiver "${resource.titre}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Archiver',
          style: 'destructive',
          onPress: async () => {
            try {
              // Mettre à jour l'UI d'abord pour une réponse immédiate
              const updatedResources = resourcesList.map(item => 
                (item.id === resourceId || item.idRessource === resourceId) 
                  ? { ...item, statut: 'PRIVE' } 
                  : item
              );
              setResourcesList(updatedResources);
              
              // Mettre à jour la ressource via l'API
              await ressourceService.updateRessource(resourceId, {
                ...resource,
                titre: resource.titre,
                contenu: resource.contenu,
                type: resource.type,
                statut: 'PRIVE'
              });
              
              Alert.alert('Succès', 'Ressource archivée avec succès');
            } catch (error) {
              console.error('Error archiving resource:', error);
              Alert.alert('Erreur', 'Impossible d\'archiver la ressource');
              // Recharger en cas d'erreur
              fetchResources(0, true);
            }
          }
        }
      ]
    );
  };

  const handleDeleteResource = (resource: Ressource) => {
    const resourceId = resource.id || resource.idRessource;
    if (!resourceId) {
      Alert.alert('Erreur', 'ID de ressource manquant');
      return;
    }
    
    Alert.alert(
      'Supprimer la ressource',
      `Voulez-vous vraiment supprimer définitivement "${resource.titre}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              // Mettre à jour l'UI d'abord pour une réponse immédiate
              const updatedResources = resourcesList.filter(item => 
                item.id !== resourceId && item.idRessource !== resourceId
              );
              setResourcesList(updatedResources);
              
              // Supprimer la ressource via l'API
              await ressourceService.deleteRessource(resourceId);
              
              Alert.alert('Succès', 'Ressource supprimée avec succès');
            } catch (error) {
              console.error('Error deleting resource:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la ressource');
              // Recharger en cas d'erreur
              fetchResources(0, true);
            }
          }
        }
      ]
    );
  };

  const handleEditResource = (resource: Ressource) => {
    const resourceId = resource.id || resource.idRessource;
    if (!resourceId) {
      Alert.alert('Erreur', 'ID de ressource manquant');
      return;
    }
    
    // Naviguer vers l'écran d'édition
    navigation.navigate('EditResource', { resourceId } as never);
  };

  const getStatusColorAndText = (status: string) => {
    switch (status) {
      case 'PUBLIC':
        return { color: '#4CAF50', bgColor: '#E8F5E9', text: 'Publié' };
      case 'PRIVE':
        return { color: '#FF9800', bgColor: '#FFF3E0', text: 'Brouillon' };
      case 'ARCHIVED':
        return { color: '#9E9E9E', bgColor: '#F5F5F5', text: 'Archivé' };
      default:
        return { color: '#2196F3', bgColor: '#E3F2FD', text: status };
    }
  };

  const renderResourceItem = ({ item }: { item: Ressource }) => {
    const { color, bgColor, text } = getStatusColorAndText(item.statut);
    const resourceId = item.id || item.idRessource;
    
    return (
      <View style={styles.resourceItem}>
        <View style={styles.resourceInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.resourceTitle}>{item.titre}</Text>
            <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
              <Text style={[styles.statusText, { color }]}>{text}</Text>
            </View>
          </View>
          
          <Text style={styles.resourceType}>{item.type}</Text>
          <Text style={styles.resourceContent} numberOfLines={2}>{item.contenu}</Text>
          <Text style={styles.resourceDate}>
            {item.date_creation ? new Date(item.date_creation).toLocaleDateString() : 'Date inconnue'}
          </Text>
        </View>
        
        <View style={styles.actionsContainer}>
          {item.statut !== 'PUBLIC' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApproveResource(item)}
            >
              <MaterialIcons name="check" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditResource(item)}
          >
            <MaterialIcons name="edit" size={18} color="#FFFFFF" />
          </TouchableOpacity>
          
          {item.statut !== 'ARCHIVED' ? (
            <TouchableOpacity 
              style={[styles.actionButton, styles.archiveButton]}
              onPress={() => handleArchiveResource(item)}
            >
              <MaterialIcons name="archive" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteResource(item)}
            >
              <MaterialIcons name="delete" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        {loading && <ActivityIndicator size="small" color="#2196F3" />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Modération des ressources" />
      
      {loading && page === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Chargement des ressources...</Text>
        </View>
      ) : (
        <>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.published}</Text>
              <Text style={styles.statLabel}>Publiées</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.draft}</Text>
              <Text style={styles.statLabel}>Brouillons</Text>
            </View>
          </View>
          
          <FlatList
            data={resourcesList}
            renderItem={renderResourceItem}
            keyExtractor={item => item.id || item.idRessource || Math.random().toString()}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh}
                colors={["#2196F3"]}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="article" size={48} color="#BDBDBD" />
                <Text style={styles.emptyText}>Aucune ressource à modérer</Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#757575',
  },
  listContainer: {
    padding: 8,
  },
  resourceItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  resourceInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  resourceType: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  resourceContent: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 4,
    lineHeight: 20,
  },
  resourceDate: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  archiveButton: {
    backgroundColor: '#FF9800',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});

export default ModerateResourcesScreen; 