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
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import FilterDropdown, { createTypeFilterOptions, BackendResourceType } from '../../components/FilterDropdown';
import { ressourceService, CreateRessourceData } from '../../services/api';

type FormData = {
  title: string;
  content: string;
  summary: string;
  type: BackendResourceType | '';
  isPublic: boolean;
};

const CreateResourceScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  
  // Rediriger vers l'écran de profil si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!user) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour créer une ressource.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ProfileStack' as never)
          }
        ]
      );
    }
  }, [user, navigation]);
  
  // Si l'utilisateur n'est pas connecté, afficher un message de chargement
  // pour éviter l'affichage momentané du formulaire
  if (!user) {
    return (
      <View style={styles.container}>
        <Header title="Créer une ressource" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Redirection...</Text>
        </View>
      </View>
    );
  }
  
  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    defaultValues: {
      title: '',
      content: '',
      summary: '',
      type: '',
      isPublic: true,
    },
  });
  
  const watchType = watch('type');
  
  const onSubmit = async (data: FormData) => {
    // Validate required fields
    if (!data.type) {
      Alert.alert('Erreur', 'Veuillez sélectionner un type de ressource');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Mapper les données du formulaire au format attendu par l'API
      const ressourceData: CreateRessourceData = {
        titre: data.title,
        contenu: data.content,
        type: data.type,
        statut: data.isPublic ? 'PUBLIC' : 'PRIVE'  // Valeurs correctes selon la contrainte SQL
      };
      
      console.log('Sending resource data to API:', JSON.stringify(ressourceData, null, 2));
      console.log('Resource type:', data.type);
      
      // Appel réel à l'API
      const response = await ressourceService.createRessource(ressourceData);
      console.log('API response:', response);
      
      // Afficher un message de succès
      Alert.alert(
        'Ressource créée',
        'Votre ressource a été créée avec succès!',
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Simplement retourner à l'écran d'accueil
              // Le hook useIsFocused que nous avons ajouté déclenchera une actualisation
              navigation.goBack();
            } 
          }
        ]
      );
    } catch (error) {
      console.error('Error creating resource:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la création de la ressource. Veuillez réessayer.'
      );
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Header title="Créer une ressource" />
      
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
                  message: 'Le titre doit comporter au moins 5 caractères'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInput
                    style={[styles.input, errors.title && styles.inputError]}
                    placeholder="Titre de votre ressource"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                  {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
                </View>
              )}
              name="title"
            />
            
            <Text style={styles.inputLabel}>Résumé</Text>
            <Controller
              control={control}
              rules={{
                required: 'Le résumé est requis',
                maxLength: {
                  value: 150,
                  message: 'Le résumé ne doit pas dépasser 150 caractères'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInput
                    style={[styles.input, errors.summary && styles.inputError]}
                    placeholder="Bref résumé de votre ressource"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                  />
                  {errors.summary && <Text style={styles.errorText}>{errors.summary.message}</Text>}
                </View>
              )}
              name="summary"
            />
            
            <View style={styles.typeContainer}>
              <Text style={styles.inputLabel}>Type de ressource</Text>
              <FilterDropdown
                title="Type"
                options={createTypeFilterOptions()}
                selectedValue={watchType}
                onSelect={(value) => setValue('type', value as BackendResourceType)}
              />
              {errors.type && <Text style={styles.errorText}>{errors.type.message}</Text>}
            </View>
            
            <Text style={styles.sectionTitle}>Contenu</Text>
            
            <Controller
              control={control}
              rules={{
                required: 'Le contenu est requis',
                minLength: {
                  value: 50,
                  message: 'Le contenu doit comporter au moins 50 caractères'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInput
                    style={[styles.contentInput, errors.content && styles.inputError]}
                    placeholder="Contenu détaillé de votre ressource..."
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    textAlignVertical="top"
                  />
                  {errors.content && <Text style={styles.errorText}>{errors.content.message}</Text>}
                </View>
              )}
              name="content"
            />
            
            <View style={styles.visibilityContainer}>
              <View style={styles.visibilityTextContainer}>
                <Text style={styles.visibilityTitle}>Visibilité</Text>
                <Text style={styles.visibilitySubtitle}>
                  {watch('isPublic') 
                    ? 'Visible par tous les utilisateurs' 
                    : 'Visible uniquement par vous'}
                </Text>
              </View>
              
              <Controller
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{ false: '#E0E0E0', true: '#BBDEFB' }}
                    thumbColor={value ? '#2196F3' : '#F5F5F5'}
                  />
                )}
                name="isPublic"
              />
            </View>
            
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit(onSubmit)}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <MaterialIcons name="publish" size={20} color="#FFFFFF" style={styles.submitIcon} />
                  <Text style={styles.submitButtonText}>Publier</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginTop: 16,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#616161',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212121',
    marginBottom: 16,
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
  },
  typeContainer: {
    marginBottom: 16,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212121',
    marginBottom: 16,
    minHeight: 150,
  },
  visibilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  visibilityTextContainer: {
    flex: 1,
  },
  visibilityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  visibilitySubtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
});

export default CreateResourceScreen; 