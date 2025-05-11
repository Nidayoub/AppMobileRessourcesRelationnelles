import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Alert,
  RefreshControl,
  Share
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../../components/Header';
import StatCard from '../../components/StatCard';
import { ressourceService, adminService } from '../../services/api';

// Types et interfaces
type ResourceType = 'VIDEO' | 'TEXT' | 'AUDIO' | 'LINK' | 'OTHER';
type ResourceStatus = 'PUBLIC' | 'PRIVE';

interface ResourceStats {
  totalResources: number;
  publishedResources: number;
  draftResources: number;
  archivedResources: number;
  resourcesByType: Record<string, number>;
  totalUsers: number;
}

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Récupérer toutes les ressources
      const resources = await ressourceService.getAllRessources(0, 100);
      const resourceCount = await ressourceService.getRessourcesCount();
      
      // Récupérer tous les utilisateurs
      const users = await adminService.getAllUsers();
      
      // Calculer les statistiques
      const publishedResources = resources.filter(r => r.statut === 'PUBLIC').length;
      const draftResources = resources.filter(r => r.statut === 'PRIVE').length;
      const archivedResources = 0; // Le backend ne gère pas les ressources archivées
      
      // Calcul par type de ressource
      const resourcesByType = resources.reduce((acc, resource) => {
        const type = resource.type || 'OTHER';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      setStats({
        totalResources: resourceCount || resources.length,
        publishedResources,
        draftResources,
        archivedResources,
        resourcesByType,
        totalUsers: users.length
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      Alert.alert('Erreur', 'Impossible de charger les statistiques du tableau de bord');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchStats();
  }, []);
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };
  
  const handleExport = async () => {
    if (!stats) return;
    
    // Créer un texte formaté pour le partage
    const statsText = `
Statistiques de l'application Sources Relationnelles
Date: ${new Date().toLocaleDateString()}

Ressources: ${stats.totalResources}
- Publiées: ${stats.publishedResources}
- Brouillons: ${stats.draftResources}
- Archivées: ${stats.archivedResources}

Utilisateurs: ${stats.totalUsers}

Types de ressources:
${Object.entries(stats.resourcesByType)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}
`;

    try {
      // Utiliser l'API Share de React Native pour partager les statistiques
      const result = await Share.share({
        message: statsText,
        title: 'Statistiques Sources Relationnelles'
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(`Shared via ${result.activityType}`);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing stats:', error);
      Alert.alert('Erreur', 'Impossible de partager les statistiques');
    }
  };
  
  const navigateToModerateResources = () => {
    navigation.navigate('ModerateResources' as never);
  };
  
  const navigateToModerateComments = () => {
    navigation.navigate('ModerateComments' as never);
  };
  
  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
        onPress={() => setActiveTab('overview')}
      >
        <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
          Vue d'ensemble
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'resources' && styles.activeTab]}
        onPress={() => setActiveTab('resources')}
      >
        <Text style={[styles.tabText, activeTab === 'resources' && styles.activeTabText]}>
          Ressources
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'users' && styles.activeTab]}
        onPress={() => setActiveTab('users')}
      >
        <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
          Utilisateurs
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderOverviewTab = () => {
    if (!stats) return null;
    
    return (
      <View style={styles.tabContent}>
        <View style={styles.statsRow}>
          <StatCard 
            title="Total ressources" 
            value={stats.totalResources.toString()} 
            icon="library-books" 
            iconColor="#2196F3" 
            backgroundColor="#E3F2FD" 
          />
          
          <StatCard 
            title="Total utilisateurs" 
            value={stats.totalUsers.toString()} 
            icon="people" 
            iconColor="#9C27B0" 
            backgroundColor="#F3E5F5" 
          />
        </View>
        
        <View style={styles.statsRow}>
          <StatCard 
            title="Ressources publiées" 
            value={stats.publishedResources.toString()} 
            icon="public" 
            iconColor="#4CAF50" 
            backgroundColor="#E8F5E9" 
          />
          
          <StatCard 
            title="Brouillons" 
            value={stats.draftResources.toString()} 
            icon="drafts" 
            iconColor="#FF9800" 
            backgroundColor="#FFF3E0" 
          />
        </View>
        
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          
          <View style={styles.actionCards}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={navigateToModerateResources}
            >
              <MaterialIcons name="dynamic-feed" size={24} color="#2196F3" />
              <Text style={styles.actionCardTitle}>Modérer les ressources</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={navigateToModerateComments}
            >
              <MaterialIcons name="comment" size={24} color="#4CAF50" />
              <Text style={styles.actionCardTitle}>Modérer les commentaires</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={handleExport}
            >
              <MaterialIcons name="file-download" size={24} color="#FF9800" />
              <Text style={styles.actionCardTitle}>Exporter les données</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  
  const renderResourcesTab = () => {
    if (!stats) return null;
    
    // Préparer les données pour le graphique de type de ressources
    const typeEntries = Object.entries(stats.resourcesByType);
    
    return (
      <View style={styles.tabContent}>
        <Text style={styles.chartTitle}>Répartition par type</Text>
        
        <View style={styles.barChart}>
          {typeEntries.map(([type, count]) => {
            const percentage = (count / stats.totalResources) * 100;
            return (
              <View key={type} style={styles.barChartItem}>
                <View style={styles.barLabelContainer}>
                  <Text style={styles.barLabel}>{type}</Text>
                  <Text style={styles.barValue}>{count}</Text>
                </View>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      { width: `${percentage}%`, backgroundColor: getTypeColor(type) }
                    ]} 
                  />
                </View>
              </View>
            );
          })}
        </View>
        
        <Text style={styles.chartTitle}>Répartition par statut</Text>
        
        <View style={styles.statusChartContainer}>
          <View style={styles.statusChart}>
            {stats.publishedResources > 0 && (
              <View 
                style={[
                  styles.statusSegment, 
                  { 
                    flex: stats.publishedResources, 
                    backgroundColor: '#4CAF50' 
                  }
                ]} 
              />
            )}
            {stats.draftResources > 0 && (
              <View 
                style={[
                  styles.statusSegment, 
                  { 
                    flex: stats.draftResources, 
                    backgroundColor: '#FF9800' 
                  }
                ]} 
              />
            )}
            {stats.archivedResources > 0 && (
              <View 
                style={[
                  styles.statusSegment, 
                  { 
                    flex: stats.archivedResources, 
                    backgroundColor: '#9E9E9E' 
                  }
                ]} 
              />
            )}
          </View>
          
          <View style={styles.statusLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Publiées ({stats.publishedResources})</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.legendText}>Brouillons ({stats.draftResources})</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#9E9E9E' }]} />
              <Text style={styles.legendText}>Archivées ({stats.archivedResources})</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };
  
  const renderUsersTab = () => {
    if (!stats) return null;
    
    return (
      <View style={styles.tabContent}>
        <View style={styles.centerStats}>
          <StatCard 
            title="Nombre total d'utilisateurs" 
            value={stats.totalUsers.toString()} 
            icon="people" 
            iconColor="#3F51B5" 
            backgroundColor="#E8EAF6" 
            fullWidth
          />
        </View>
        
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions utilisateurs</Text>
          
          <View style={styles.actionCards}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => {
                Alert.alert('Info', 'Fonctionnalité de création d\'utilisateur à implémenter');
              }}
            >
              <MaterialIcons name="person-add" size={24} color="#2196F3" />
              <Text style={styles.actionCardTitle}>Ajouter un utilisateur</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => {
                Alert.alert('Info', 'Fonctionnalité de gestion des rôles à implémenter');
              }}
            >
              <MaterialIcons name="security" size={24} color="#4CAF50" />
              <Text style={styles.actionCardTitle}>Gérer les rôles</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  
  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'VIDEO': '#F44336',
      'TEXT': '#2196F3',
      'AUDIO': '#9C27B0',
      'LINK': '#FF9800',
      'OTHER': '#607D8B'
    };
    
    return colors[type] || colors.OTHER;
  };
  
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'resources':
        return renderResourcesTab();
      case 'users':
        return renderUsersTab();
      default:
        return renderOverviewTab();
    }
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title="Tableau de bord" />
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Chargement des statistiques...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#2196F3']}
            />
          }
        >
          {renderTabs()}
          {renderActiveTab()}
        </ScrollView>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  tabContent: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  actionCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
    marginTop: 8,
    textAlign: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 16,
    marginBottom: 12,
  },
  barChart: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  barChartItem: {
    marginBottom: 12,
  },
  barLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 14,
    color: '#424242',
  },
  barValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
  },
  barContainer: {
    height: 12,
    backgroundColor: '#EEEEEE',
    borderRadius: 6,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 6,
  },
  statusChartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  statusChart: {
    height: 24,
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  statusSegment: {
    height: '100%',
  },
  statusLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#616161',
  },
  centerStats: {
    marginVertical: 8,
  }
});

export default DashboardScreen; 