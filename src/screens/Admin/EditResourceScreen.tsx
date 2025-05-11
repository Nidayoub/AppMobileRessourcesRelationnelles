import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import FilterDropdown from '../../components/FilterDropdown';
import { ressourceService, Ressource, UpdateRessourceData } from '../../services/api';

type RouteParams = {
  EditResource: {
    resourceId: string;
  };
};

type FormData = {
  titre: string;
  contenu: string;
  type: string;
  statut: string;
};

// Options pour les types de ressources
const RESOURCE_TYPES = [
  { label: 'Texte', value: 'TEXT' },
  { label: 'Vidéo', value: 'VIDEO' },
  { label: 'Audio', value: 'AUDIO' },
  { label: 'Lien', value: 'LINK' },
  { label: 'Autre', value: 'OTHER' }
];

// Options pour les statuts
const RESOURCE_STATUSES = [
  { label: 'Publié', value: 'PUBLISHED' },
  { label: 'Brouillon', value: 'DRAFT' },
  { label: 'Archivé', value: 'ARCHIVED' }
];

const EditResourceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'EditResource'>>();
  const { resourceId } = route.params || {};
  const { user } = useAuth();
  
  const [resource, setResource] = useState<Ressource | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Gestion du formulaire avec React Hook Form
  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>();
  
  const watchType = watch('type');
  const watchStatut = watch('statut');
  
  const fetchResource = async () => {
    try {
      setLoading(true);
      
      // Cette partie est un peu difficile car l'API ne semble pas avoir d'endpoint 
      // pour récupérer une ressource par ID. Nous devons donc récupérer toutes les ressources
      // et filtrer celle qui nous intéresse.
      const allResources = await ressourceService.getAllRessources();
      const foundResource = allResources.find(r => 
        r.id === resourceId || r.idRessource === resourceId
      );
      
      if (foundResource) {
        setResource(foundResource);
        
        // Initialiser le formulaire avec les données de la ressource
        setValue('titre', foundResource.titre);
        setValue('contenu', foundResource.contenu);
        setValue('type', foundResource.type);
        setValue('statut', foundResource.statut);
        
        setLoading(false);
      } else {
        throw new Error('Ressource introuvable');
      }
    } catch (error) {
      console.error('Error fetching resource:', error);
      Alert.alert(
        'Erreur',
        'Ressource introuvable',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };
  
  useEffect(() => {
    // Vérifier que l'utilisateur est un administrateur
    if (!user || !['ROLE_ADMIN', 'ROLE_SUPERADMIN'].includes(user.roleEnum)) {
      Alert.alert(
        'Accès refusé',
        'Vous devez être administrateur pour accéder à cette page',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }
    
    fetchResource();
  }, [resourceId, setValue, navigation, user]);
  
  const onSubmit = async (data: FormData) => {
    if (!resource) return;
    
    try {
      setSubmitting(true);
      
      const resourceId = resource.id || resource.idRessource;
      if (!resourceId) {
        throw new Error('ID de ressource manquant');
      }
      
      const updateData: UpdateRessourceData = {
        titre: data.titre,
        contenu: data.contenu,
        type: data.type,
        statut: data.statut
      };
      
      await ressourceService.updateRessource(resourceId, updateData);
      
      Alert.alert(
        'Ressource mise à jour',
        'La ressource a été mise à jour avec succès',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error updating resource:', error);
      Alert.alert(
        'Erreur',
        'Impossible de mettre à jour la ressource'
      );
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDeleteResource = () => {
    if (!resource) return;
    
    const resourceId = resource.id || resource.idRessource;
    if (!resourceId) {
      Alert.alert('Erreur', 'ID de ressource manquant');
      return;
    }
    
    Alert.alert(
      'Supprimer la ressource',
      'Êtes-vous sûr de vouloir supprimer définitivement cette ressource ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              setSubmitting(true);
              await ressourceService.deleteRessource(resourceId);
              
              Alert.alert(
                'Ressource supprimée',
                'La ressource a été supprimée avec succès',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              console.error('Error deleting resource:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la ressource');
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Éditer la ressource" leftIcon="arrow-back" onLeftIconPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Chargement de la ressource...</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Header 
        title="Éditer la ressource" 
        leftIcon="arrow-back" 
        onLeftIconPress={() => navigation.goBack()} 
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Informations générales</Text>
            
            <Text style={styles.inputLabel}>Titre</Text>
            <Controller
              control={control}
              rules={{
                required: 'Le titre est requis',
                minLength: {
                  value: 5,
                  message: 'Le titre doit contenir au moins 5 caractères'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.titre && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Titre de la ressource"
                />
              )}
              name="titre"
            />
            {errors.titre && <Text style={styles.errorText}>{errors.titre.message}</Text>}
            
            <Text style={styles.inputLabel}>Type</Text>
            <Controller
              control={control}
              rules={{ required: 'Le type est requis' }}
              render={({ field: { onChange, value } }) => (
                <FilterDropdown
                  placeholder="Sélectionner un type"
                  value={value}
                  items={RESOURCE_TYPES}
                  onChange={onChange}
                  style={errors.type && styles.inputError}
                />
              )}
              name="type"
            />
            {errors.type && <Text style={styles.errorText}>{errors.type.message}</Text>}
            
            <Text style={styles.inputLabel}>Statut</Text>
            <Controller
              control={control}
              rules={{ required: 'Le statut est requis' }}
              render={({ field: { onChange, value } }) => (
                <FilterDropdown
                  placeholder="Sélectionner un statut"
                  value={value}
                  items={RESOURCE_STATUSES}
                  onChange={onChange}
                  style={errors.statut && styles.inputError}
                />
              )}
              name="statut"
            />
            {errors.statut && <Text style={styles.errorText}>{errors.statut.message}</Text>}
            
            <Text style={styles.inputLabel}>Contenu</Text>
            <Controller
              control={control}
              rules={{
                required: 'Le contenu est requis',
                minLength: {
                  value: 10,
                  message: 'Le contenu doit contenir au moins 10 caractères'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.inputMultiline, errors.contenu && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Contenu de la ressource"
                  multiline
                  numberOfLines={10}
                  textAlignVertical="top"
                />
              )}
              name="contenu"
            />
            {errors.contenu && <Text style={styles.errorText}>{errors.contenu.message}</Text>}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={handleDeleteResource}
                disabled={submitting}
              >
                <MaterialIcons name="delete" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Supprimer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.saveButton, submitting && styles.disabledButton]}
                onPress={handleSubmit(onSubmit)}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="save" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Enregistrer</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
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
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputMultiline: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  switchLabel: {
    fontSize: 16,
    color: '#212121',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default EditResourceScreen;