import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useProgress } from '../../context/ProgressContext';
import Header from '../../components/Header';
import StatCard from '../../components/StatCard';
import { ressourceService, Ressource } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { BackendResourceType } from '../../components/FilterDropdown';

interface TypeStats {
  [key: string]: number;
}

const ProgressScreen = () => {
  const [loading, setLoading] = useState(true);
  const [typeStats, setTypeStats] = useState<TypeStats>({});
  const [totalExplored, setTotalExplored] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [allResources, setAllResources] = useState<Ressource[]>([]);
  
  const { favorites, explored } = useProgress();
  const { user } = useAuth();
  
  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Récupération de toutes les ressources
      const resources = await ressourceService.getAllRessources();
      setAllResources(resources);
      
      // Calculer les statistiques
      calculateStats(resources);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      Alert.alert(
        'Erreur',
        'Impossible de récupérer vos statistiques. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);
  
  useEffect(() => {
    if (allResources.length > 0) {
      calculateStats(allResources);
    }
  }, [favorites, explored, allResources]);
  
  const calculateStats = (resources: Ressource[]) => {
    // Get all resources that have been explored
    const exploredResources = resources.filter(resource => 
      explored.includes(resource.id || resource.idRessource || '')
    );
    
    // Calculate total progress percentage
    const totalResourcesCount = resources.length;
    const exploredCount = exploredResources.length;
    const percentage = totalResourcesCount > 0 
      ? Math.round((exploredCount / totalResourcesCount) * 100)
      : 0;
    
    setTotalExplored(exploredCount);
    setProgressPercentage(percentage);
    
    // Calculate stats by type
    const typeData: TypeStats = {};
    
    exploredResources.forEach(resource => {
      // For types
      const type = resource.type;
      if (typeData[type]) {
        typeData[type]++;
      } else {
        typeData[type] = 1;
      }
    });
    
    setTypeStats(typeData);
  };
  
  const renderProgressBar = () => {
    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${progressPercentage}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressBarText}>{progressPercentage}%</Text>
      </View>
    );
  };
  
  const renderTypeStats = () => {
    return Object.entries(typeStats).map(([type, count]) => (
      <View key={type} style={styles.statItem}>
        <View style={styles.statItemHeader}>
          <Text style={styles.statItemTitle}>{type}</Text>
          <Text style={styles.statItemValue}>{count}</Text>
        </View>
        <View style={styles.statItemBar}>
          <View 
            style={[
              styles.statItemBarFill, 
              { width: `${(count / totalExplored) * 100}%` }
            ]} 
          />
        </View>
      </View>
    ));
  };
  
  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'VIDEO': '#F44336',
      'TEXT': '#2196F3',
      'AUDIO': '#9C27B0',
      'LINK': '#FF9800',
      'OTHER': '#607D8B'
    };
    
    return colors[type] || '#2196F3';
  };
  
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
      <Header title="Ma progression" showBackButton />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.overviewSection}>
            <View style={styles.statsRow}>
              <StatCard 
                title="Ressources explorées" 
                value={totalExplored.toString()} 
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
            </View>
            
            <View style={styles.progressSection}>
              <Text style={styles.sectionTitle}>Progression globale</Text>
              {renderProgressBar()}
            </View>
          </View>
          
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Types explorés</Text>
            <View style={styles.statsContainer}>
              {Object.keys(typeStats).length > 0 ? renderTypeStats() : (
                <Text style={styles.emptyStatsText}>Aucune ressource explorée</Text>
              )}
            </View>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  overviewSection: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  progressBarContainer: {
    marginBottom: 24,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginBottom: 8,
  },
  progressBarFill: {
    height: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  progressBarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    textAlign: 'right',
  },
  detailsSection: {
    marginBottom: 24,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statItem: {
    marginBottom: 12,
  },
  statItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
  },
  statItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  statItemBar: {
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  statItemBarFill: {
    height: 8,
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  emptyStatsText: {
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
});

export default ProgressScreen; 