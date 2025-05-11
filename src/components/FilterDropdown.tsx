import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ResourceCategory } from '../data/resources';

// Types de ressources définis par le backend
export type BackendResourceType = 'ARTICLE' | 'TUTORIEL' | 'VIDEO' | 'AUDIO' | 'LINK' | 'OTHER';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  title: string;
  options: FilterOption[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  title,
  options,
  selectedValue,
  onSelect,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find(option => option.value === selectedValue);

  const handleSelect = (value: string) => {
    onSelect(value);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.dropdownButton} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.dropdownLabel}>{title}</Text>
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedText}>
            {selectedOption ? selectedOption.label : 'Tous'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color="#757575" />
        </View>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{title}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#757575" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={[{ label: 'Tous', value: '' }, ...options]}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      selectedValue === item.value && styles.selectedOption,
                    ]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedValue === item.value && styles.selectedOptionText,
                    ]}>
                      {item.label}
                    </Text>
                    {selectedValue === item.value && (
                      <MaterialIcons name="check" size={20} color="#2196F3" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Helper functions pour créer les options
export const createTypeFilterOptions = (): FilterOption[] => {
  // Utiliser les types réels du backend
  const types: BackendResourceType[] = ['ARTICLE', 'TUTORIEL', 'VIDEO', 'AUDIO', 'LINK', 'OTHER'];
  return types.map(type => ({ 
    label: type.charAt(0) + type.slice(1).toLowerCase(), // Format: Article, Tutoriel, etc.
    value: type 
  }));
};

export const createCategoryFilterOptions = (): FilterOption[] => {
  // Types comme catégories (puisque le backend ne supporte pas les catégories)
  const types: BackendResourceType[] = ['ARTICLE', 'TUTORIEL', 'VIDEO', 'AUDIO', 'LINK', 'OTHER'];
  return types.map(type => ({ 
    label: type.charAt(0) + type.slice(1).toLowerCase(),
    value: type 
  }));
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownLabel: {
    fontSize: 14,
    color: '#757575',
  },
  selectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalContent: {
    maxHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
  },
  optionText: {
    fontSize: 14,
    color: '#212121',
  },
  selectedOptionText: {
    fontWeight: '500',
    color: '#2196F3',
  },
});

export default FilterDropdown; 