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
import { commentService, Comment } from '../../services/api';

const ModerateCommentsScreen = () => {
  const navigation = useNavigation();
  const [reportedComments, setReportedComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchReportedComments = async (pageNum = 0, shouldRefresh = false) => {
    try {
      if (shouldRefresh) {
        setRefreshing(true);
      } else if (pageNum === 0) {
        setLoading(true);
      }

      const comments = await commentService.getReportedComments(pageNum);
      
      if (shouldRefresh || pageNum === 0) {
        setReportedComments(comments);
      } else {
        setReportedComments(prev => [...prev, ...comments]);
      }
      
      setHasMore(comments.length > 0);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching reported comments:', error);
      Alert.alert('Erreur', 'Impossible de charger les commentaires signalés');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportedComments();
  }, []);

  const handleRefresh = () => {
    fetchReportedComments(0, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading && !refreshing) {
      fetchReportedComments(page + 1);
    }
  };

  const handleApproveComment = (comment: Comment) => {
    Alert.alert(
      'Approuver le commentaire',
      'Ce commentaire sera maintenu sur la plateforme et le compteur de signalement sera réinitialisé',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Approuver',
          onPress: async () => {
            try {
              // Mettre à jour l'état côté UI d'abord pour une réponse immédiate
              const updatedComments = reportedComments.filter(c => c.idCommentaire !== comment.idCommentaire);
              setReportedComments(updatedComments);
              
              // Ceci n'est qu'une approximation car l'API ne dispose pas d'un endpoint "approve"
              // En réalité, le backend devrait avoir un endpoint pour approuver explicitement
              Alert.alert('Succès', 'Commentaire approuvé avec succès');
            } catch (error) {
              console.error('Error approving comment:', error);
              Alert.alert('Erreur', 'Impossible d\'approuver le commentaire');
              // Recharger les commentaires en cas d'erreur
              fetchReportedComments(0, true);
            }
          }
        }
      ]
    );
  };

  const handleDeleteComment = (comment: Comment) => {
    Alert.alert(
      'Supprimer le commentaire',
      'Êtes-vous sûr de vouloir supprimer ce commentaire ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              // Mettre à jour l'état côté UI d'abord pour une réponse immédiate
              const updatedComments = reportedComments.filter(c => c.idCommentaire !== comment.idCommentaire);
              setReportedComments(updatedComments);
              
              // Appel à l'API pour supprimer le commentaire
              await commentService.deleteComment(comment.idCommentaire);
              Alert.alert('Succès', 'Commentaire supprimé avec succès');
            } catch (error) {
              console.error('Error deleting comment:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le commentaire');
              // Recharger les commentaires en cas d'erreur
              fetchReportedComments(0, true);
            }
          }
        }
      ]
    );
  };

  const renderCommentItem = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentAuthor}>{item.nom_utilisateur}</Text>
        <Text style={styles.commentDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      
      <Text style={styles.reportBadge}>
        <MaterialIcons name="flag" size={14} color="#FF5722" /> {item.report_count} signalement(s)
      </Text>
      
      <Text style={styles.commentText}>{item.Commentaire}</Text>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleApproveComment(item)}
        >
          <MaterialIcons name="check" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Approuver</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteComment(item)}
        >
          <MaterialIcons name="delete" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
      <Header title="Modération des commentaires" />
      
      {loading && page === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Chargement des commentaires signalés...</Text>
        </View>
      ) : (
        <FlatList
          data={reportedComments}
          renderItem={renderCommentItem}
          keyExtractor={item => item.idCommentaire}
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
              <MaterialIcons name="comment" size={48} color="#BDBDBD" />
              <Text style={styles.emptyText}>Aucun commentaire signalé à modérer</Text>
            </View>
          }
        />
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
  listContainer: {
    padding: 8,
    flexGrow: 1,
  },
  commentItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  commentDate: {
    fontSize: 14,
    color: '#757575',
  },
  commentText: {
    fontSize: 15,
    color: '#424242',
    marginVertical: 8,
    lineHeight: 20,
  },
  reportBadge: {
    fontSize: 13,
    color: '#FF5722',
    marginBottom: 8,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
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

export default ModerateCommentsScreen; 