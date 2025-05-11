import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  backgroundColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconColor = '#4CAF50',
  backgroundColor = '#E8F5E9',
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.iconContainer}>
        <MaterialIcons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
});

export default StatCard; 