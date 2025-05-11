import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StatusBar, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList } from '../../navigation/AuthStack';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Error states
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register, isLoading } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    // Reset errors
    setFirstNameError('');
    setLastNameError('');
    setUsernameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    
    // Validate inputs
    let hasError = false;
    
    if (!firstName.trim()) {
      setFirstNameError('Le prénom est requis');
      hasError = true;
    }

    if (!lastName.trim()) {
      setLastNameError('Le nom est requis');
      hasError = true;
    }
    
    if (!username.trim()) {
      setUsernameError('Le nom d\'utilisateur est requis');
      hasError = true;
    }
    
    if (!email.trim()) {
      setEmailError('L\'email est requis');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Format d\'email invalide');
      hasError = true;
    }
    
    if (!password.trim()) {
      setPasswordError('Le mot de passe est requis');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      hasError = true;
    }
    
    if (password !== confirmPassword) {
      setConfirmPasswordError('Les mots de passe ne correspondent pas');
      hasError = true;
    }
    
    if (hasError) return;
    
    // Proceed with registration
    try {
      const success = await register(firstName, lastName, username, email, password);
      
      if (success) {
        Alert.alert(
          'Inscription réussie',
          'Votre compte a été créé. Vous pouvez maintenant vous connecter.',
          [{ text: 'OK', onPress: navigateToLogin }]
        );
      } else {
        Alert.alert(
          'Échec d\'inscription',
          'Impossible de créer votre compte. Veuillez réessayer.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Une erreur est survenue. Veuillez réessayer.'
      );
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={navigateToLogin}>
          <MaterialIcons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        
        <View style={styles.formContainer}>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Rejoignez (RE)Sources Relationnelles</Text>
          
          <View style={styles.inputContainer}>
            <MaterialIcons name="person" size={20} color="#757575" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Prénom"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>
          {firstNameError ? <Text style={styles.errorText}>{firstNameError}</Text> : null}
          
          <View style={styles.inputContainer}>
            <MaterialIcons name="person" size={20} color="#757575" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nom"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>
          {lastNameError ? <Text style={styles.errorText}>{lastNameError}</Text> : null}
          
          <View style={styles.inputContainer}>
            <MaterialIcons name="account-circle" size={20} color="#757575" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nom d'utilisateur"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
          
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={20} color="#757575" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          
          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={20} color="#757575" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <MaterialIcons 
                name={showPassword ? "visibility-off" : "visibility"} 
                size={20} 
                color="#757575" 
              />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          
          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={20} color="#757575" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <MaterialIcons 
                name={showConfirmPassword ? "visibility-off" : "visibility"} 
                size={20} 
                color="#757575" 
              />
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
          
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.registerButtonText}>S'inscrire</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Vous avez déjà un compte ?</Text>
          <TouchableOpacity onPress={navigateToLogin}>
            <Text style={styles.loginLink}>Se connecter</Text>
          </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 8,
  },
  formContainer: {
    marginTop: 60,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#000000',
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
  },
  registerButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#757575',
    fontSize: 14,
    marginRight: 4,
  },
  loginLink: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen; 