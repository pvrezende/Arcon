// component/backbutton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const BackButton = () => {
  const navigation = useNavigation();

  const handlePress = () => {
    // chama goBack() se disponível
    if (navigation && typeof (navigation as any).goBack === 'function') {
      (navigation as any).goBack();
    }
  };

  return (
    <TouchableOpacity 
      style={styles.backButton}
      onPress={handlePress}
    >
      <Ionicons name="arrow-back" size={20} color="#fff" />
      <Text style={styles.backText}>Voltar</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
    position: 'absolute',
    top: 70, // Ajuste conforme necessário
    left: 20,
    zIndex: 1000, // Z-index muito alto
  },
  backText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

export default BackButton;