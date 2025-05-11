import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useProgress } from '../context/ProgressContext';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// Interface utilisée par le composant
export interface Resource {
  id: string;
  title: string;
  content: string;
  type: string;
  date: string;
  author: string;
  public: boolean;
  summary: string;
  comments?: any[];
}

// Constantes pour les couleurs
const COLORS = {
  background: '#fff',
  typeBackground: '#E0F2F1',
  typeText: '#00796B',
  text: {
    title: '#212121',
    summary: '#616161',
    author: '#424242',
    date: '#9E9E9E'
  },
  icon: {
    favorite: '#FF6B6B',
    explored: '#4CAF50'
  },
  shadow: '#000'
};

// Types de props
interface ResourceCardProps {
  resource: Resource;
  compact?: boolean;
}

// Composant pour afficher les icônes de progression
const ProgressIcons = ({ resourceId }: { resourceId: string }) => {
  const { isFavorite, isExplored } = useProgress();
  
  return (
    <View style={styles.statsContainer}>
      {isFavorite(resourceId) && (
        <MaterialIcons 
          name="favorite" 
          size={18} 
          color={COLORS.icon.favorite} 
          style={styles.icon} 
        />
      )}
      
      {isExplored(resourceId) && (
        <MaterialCommunityIcons 
          name="check-circle" 
          size={18} 
          color={COLORS.icon.explored} 
          style={styles.icon} 
        />
      )}
    </View>
  );
};

// Composant principal
const ResourceCard: React.FC<ResourceCardProps> = ({ resource, compact = false }) => {
  const navigation = useNavigation();
  
  // Naviguer vers l'écran de détail de la ressource
  const handlePress = () => {
    console.log('🔍 ResourceCard: Clic sur ressource avec id:', resource.id);
    console.log('📦 ResourceCard: Données complètes de la ressource:', resource);
    
    navigation.navigate('HomeStack', { 
      screen: 'ResourceDetail', 
      params: { resourceId: resource.id } 
    });
  };
  
  return (
    <TouchableOpacity 
      style={[styles.card, compact && styles.compactCard]} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* En-tête avec type */}
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <Text style={styles.type}>{resource.type}</Text>
        </View>
      </View>
      
      {/* Titre et résumé */}
      <Text style={styles.title} numberOfLines={2}>{resource.title}</Text>
      
      {!compact && (
        <Text style={styles.summary} numberOfLines={3}>
          {resource.summary}
        </Text>
      )}
      
      {/* Pied avec auteur, date et statistiques */}
      <View style={styles.footer}>
        <View style={styles.authorContainer}>
          <Text style={styles.author}>{resource.author}</Text>
          <Text style={styles.date}>{resource.date}</Text>
        </View>
        
        <ProgressIcons resourceId={resource.id} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  compactCard: {
    padding: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeContainer: {
    backgroundColor: COLORS.typeBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  type: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.typeText,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.text.title,
  },
  summary: {
    fontSize: 14,
    color: COLORS.text.summary,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  authorContainer: {
    flex: 1,
  },
  author: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.author,
  },
  date: {
    fontSize: 11,
    color: COLORS.text.date,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  }
});

export default ResourceCard; 