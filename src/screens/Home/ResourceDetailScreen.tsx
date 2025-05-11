import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Share, 
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Comment, ressourceService, commentService, CreateCommentData } from '../../services/api';
import { useProgress } from '../../context/ProgressContext';
import { useAuth } from '../../context/AuthContext';
import { HomeStackParamList } from '../../navigation/MainTabNavigator';
import Header from '../../components/Header';
import CommentItem from '../../components/CommentItem';

type ResourceDetailScreenRouteProp = RouteProp<HomeStackParamList, 'ResourceDetail'>;

const ResourceDetailScreen = () => {
  const route = useRoute<ResourceDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { resourceId } = route.params;
  const { user } = useAuth();
  const { 
    isFavorite, 
    isExplored, 
    addToFavorites, 
    removeFromFavorites, 
    markAsExplored 
  } = useProgress();
  
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [resource, setResource] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // Récupérer les commentaires de la ressource
  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const result = await commentService.getComments(resourceId);
      if (Array.isArray(result)) {
        setComments(result);
      } else {
        console.log('Format de réponse inattendu pour les commentaires:', result);
        setComments([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };
  
  useEffect(() => {
    const fetchResource = async () => {
      setLoading(true);
      try {
        console.log('Chargement de la ressource avec ID:', resourceId);
        
        // Récupérer toutes les ressources
        const allResources = await ressourceService.getAllRessources();
        
        // Rechercher la ressource spécifique avec l'ID fourni
        const matchedResource = allResources.find(r => {
          // Compare both id and idRessource fields using string comparison to handle type differences
          const resourceIdStr = String(resourceId);
          const rIdStr = String(r.id || '');
          const rIdRessourceStr = String(r.idRessource || '');
          
          const isMatch = rIdStr === resourceIdStr || rIdRessourceStr === resourceIdStr;
          
          if (isMatch) {
            console.log('Ressource trouvée:', r);
          }
          
          return isMatch;
        });
        
        if (matchedResource) {
          // Adapter la ressource au format attendu
          const adaptedResource = {
            id: matchedResource.idRessource || matchedResource.id || '',
            title: matchedResource.titre || '',
            content: matchedResource.contenu || '',
            type: matchedResource.type || '',
            category: matchedResource.type || '',
            date: matchedResource.dateCreation 
                  ? new Date(matchedResource.dateCreation).toLocaleDateString()
                  : new Date().toLocaleDateString(),
            author: matchedResource.utilisateur 
                    ? `${matchedResource.utilisateur.prenom} ${matchedResource.utilisateur.nom}`
                    : "Auteur inconnu",
            public: matchedResource.statut === 'PUBLIC',
            summary: (matchedResource.contenu || '').substring(0, 120) + '...',
            views: 0
          };
          
          setResource(adaptedResource);
          
          // Charger les commentaires
          fetchComments();
        } else {
          console.log('Ressource non trouvée avec ID:', resourceId);
          setResource(null);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la ressource:', error);
        setResource(null);
      } finally {
        setLoading(false);
        markAsExplored(resourceId);
      }
    };
    
    fetchResource();
  }, [resourceId]);
  
  // Publier un nouveau commentaire
  const handleSubmitComment = async () => {
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour commenter.',
        [
          {
            text: 'Se connecter',
            onPress: () => navigation.navigate('ProfileStack' as never)
          },
          {
            text: 'Annuler',
            style: 'cancel'
          }
        ]
      );
      return;
    }
    
    // Vérifier que le commentaire n'est pas vide
    if (!newComment.trim()) {
      return;
    }
    
    try {
      setSubmittingComment(true);
      
      const commentData: CreateCommentData = {
        Commentaire: newComment.trim(),
        ressourceId: resourceId
      };
      
      await commentService.createComment(resourceId, commentData);
      
      // Effacer le champ après soumission réussie
      setNewComment('');
      
      // Actualiser la liste des commentaires
      fetchComments();
      
      Alert.alert('Succès', 'Votre commentaire a été publié.');
    } catch (error) {
      console.error('Erreur lors de la publication du commentaire:', error);
      Alert.alert('Erreur', 'Impossible de publier votre commentaire. Veuillez réessayer.');
    } finally {
      setSubmittingComment(false);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Chargement de la ressource...</Text>
      </View>
    );
  }
  
  if (!resource) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ressource non trouvée</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const handleToggleFavorite = () => {
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour ajouter des ressources à vos favoris.',
        [
          {
            text: 'Se connecter',
            onPress: () => navigation.navigate('ProfileStack' as never)
          },
          {
            text: 'Annuler',
            style: 'cancel'
          }
        ]
      );
      return;
    }
    
    if (isFavorite(resource.id)) {
      removeFromFavorites(resource.id);
    } else {
      addToFavorites(resource.id);
    }
  };
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Découvrez "${resource.title}" sur (RE)Sources Relationnelles`,
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager cette ressource.');
    }
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Header 
        title={resource.title} 
        showBackButton
        rightIcon="share"
        onRightIconPress={handleShare}
      />
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        bounces={false}
        overScrollMode="never"
      >
        <View>
          <View style={styles.resourceHeader}>
            <View style={styles.typeContainer}>
              <Text style={styles.type}>{resource.type}</Text>
            </View>
            <Text style={styles.category}>{resource.category}</Text>
          </View>
          
          <Text style={styles.title}>{resource.title}</Text>
          
          <View style={styles.authorContainer}>
            <Text style={styles.authorLabel}>Par </Text>
            <Text style={styles.author}>{resource.author}</Text>
            <Text style={styles.date}> • {resource.date}</Text>
          </View>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleToggleFavorite}
            >
              <MaterialIcons 
                name={isFavorite(resource.id) ? "favorite" : "favorite-outline"} 
                size={24} 
                color={isFavorite(resource.id) ? "#FF6B6B" : "#757575"} 
              />
              <Text style={styles.actionText}>
                {isFavorite(resource.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleShare}
            >
              <MaterialIcons name="share" size={24} color="#757575" />
              <Text style={styles.actionText}>Partager</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.contentTitle}>Contenu</Text>
          <Text style={styles.content}>{resource.content}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Commentaires ({comments.length})</Text>
            
            {/* Formulaire de commentaire */}
            <View style={styles.commentForm}>
              <TextInput
                style={styles.commentInput}
                placeholder="Laissez un commentaire..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
              />
              <TouchableOpacity 
                style={[
                  styles.submitCommentButton,
                  (!newComment.trim() || submittingComment) && styles.disabledButton
                ]}
                onPress={handleSubmitComment}
                disabled={!newComment.trim() || submittingComment}
              >
                {submittingComment ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitCommentText}>Publier</Text>
                )}
              </TouchableOpacity>
            </View>
            
            {/* Affichage des commentaires */}
            {commentsLoading ? (
              <View style={styles.loadingCommentsContainer}>
                <ActivityIndicator size="small" color="#2196F3" />
                <Text style={styles.loadingCommentsText}>Chargement des commentaires...</Text>
              </View>
            ) : comments.length === 0 ? (
              <View style={styles.emptyCommentsContainer}>
                <Text style={styles.emptyCommentsText}>Aucun commentaire pour le moment</Text>
                <Text style={styles.emptyCommentsSubtext}>Soyez le premier à commenter</Text>
              </View>
            ) : (
              comments.map(comment => (
                <CommentItem 
                  key={comment.idCommentaire} 
                  comment={{
                    id: comment.idCommentaire || '',
                    author: comment.nom_utilisateur || '',
                    text: comment.Commentaire || '',
                    date: comment.date || '',
                    replies: []
                  }} 
                  onReply={() => {}}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#757575',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100, // Espace supplémentaire pour le clavier
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeContainer: {
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  type: {
    fontSize: 12,
    fontWeight: '500',
    color: '#00796B',
  },
  category: {
    fontSize: 12,
    color: '#757575',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorLabel: {
    fontSize: 14,
    color: '#757575',
  },
  author: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
  },
  date: {
    fontSize: 14,
    color: '#757575',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#424242',
  },
  commentsSection: {
    marginTop: 8,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  commentForm: {
    marginBottom: 16,
  },
  commentInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    maxHeight: 150,
    fontSize: 16,
    color: '#212121',
    marginBottom: 8,
    textAlignVertical: 'top',
  },
  submitCommentButton: {
    backgroundColor: '#2196F3',
    borderRadius: 4,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  submitCommentText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingCommentsContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCommentsText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#757575',
  },
  emptyCommentsContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  emptyCommentsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#757575',
  },
  emptyCommentsSubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 4,
  },
});

export default ResourceDetailScreen; 