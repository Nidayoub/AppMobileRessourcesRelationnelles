import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList } from '../../navigation/AuthStack';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    // Reset errors
    setUsernameError('');
    setPasswordError('');
    
    // Validate inputs
    let hasError = false;
    
    if (!username.trim()) {
      setUsernameError('Le nom d\'utilisateur est requis');
      hasError = true;
    }
    
    if (!password.trim()) {
      setPasswordError('Le mot de passe est requis');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      hasError = true;
    }
    
    if (hasError) return;
    
    // Proceed with login
    try {
      const success = await login(username, password);
      
      if (!success) {
        Alert.alert(
          'Échec de connexion',
          'Identifiants incorrects. Veuillez réessayer.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Une erreur est survenue. Veuillez réessayer.'
      );
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
      }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
      }}>
        <View style={{
          alignItems: 'center',
          marginBottom: 48,
        }}>
          <Text style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: '#2196F3',
          }}>(RE)Sources</Text>
          <Text style={{
            fontSize: 18,
            color: '#424242',
            marginTop: 4,
          }}>Relationnelles</Text>
        </View>
        
        <View style={{
          marginBottom: 24,
        }}>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#212121',
            marginBottom: 24,
          }}>Connexion</Text>
          
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#E0E0E0',
            borderRadius: 8,
            paddingHorizontal: 12,
            marginBottom: 12,
            height: 50,
          }}>
            <MaterialIcons name="person" size={20} color="#757575" style={{ marginRight: 12 }} />
            <TextInput
              style={{
                flex: 1,
                height: 50,
                fontSize: 16,
                color: '#212121',
              }}
              placeholder="Nom d'utilisateur"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {usernameError ? <Text style={{
            color: '#F44336',
            fontSize: 12,
            marginTop: -8,
            marginBottom: 12,
            marginLeft: 4,
          }}>{usernameError}</Text> : null}
          
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#E0E0E0',
            borderRadius: 8,
            paddingHorizontal: 12,
            marginBottom: 12,
            height: 50,
          }}>
            <MaterialIcons name="lock" size={20} color="#757575" style={{ marginRight: 12 }} />
            <TextInput
              style={{
                flex: 1,
                height: 50,
                fontSize: 16,
                color: '#212121',
              }}
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={{ padding: 8 }}
            >
              <MaterialIcons
                name={showPassword ? "visibility-off" : "visibility"} 
                size={20} 
                color="#757575" 
              />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={{
            color: '#F44336',
            fontSize: 12,
            marginTop: -8,
            marginBottom: 12,
            marginLeft: 4,
          }}>{passwordError}</Text> : null}
          
          <TouchableOpacity style={{
            alignSelf: 'flex-end',
            marginBottom: 24,
          }}>
            <Text style={{
              color: '#2196F3',
              fontSize: 14,
            }}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{
              backgroundColor: '#2196F3',
              borderRadius: 8,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={{
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: '600',
              }}>Se connecter</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{
            color: '#757575',
            fontSize: 14,
            marginRight: 4,
          }}>Vous n'avez pas de compte ?</Text>
          <TouchableOpacity onPress={navigateToRegister}>
            <Text style={{
              color: '#2196F3',
              fontSize: 14,
              fontWeight: '600',
            }}>S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen; 