import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightIconPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  rightIcon,
  onRightIconPress,
}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
      />
      <View style={styles.content}>
        <View style={styles.leftContainer}>
          {showBackButton && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <MaterialIcons name="arrow-back" size={24} color="#212121" />
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        
        <View style={styles.rightContainer}>
          {rightIcon && (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={styles.rightButton}
              disabled={!onRightIconPress}
            >
              <MaterialIcons name={rightIcon} size={24} color="#212121" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  leftContainer: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
  },
  rightContainer: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  rightButton: {
    padding: 8,
    marginRight: -8,
  },
});

export default Header; 