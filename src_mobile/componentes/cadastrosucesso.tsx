// cadastrosucesso.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CadastroSucessoProps {
  onClose: () => void;
}

const CadastroSucesso: React.FC<CadastroSucessoProps> = ({ onClose }) => {
  return (
    <View style={styles.modalContainer}> {/* Use um container diferente para o modal */}
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={80} color="#22c55e" /> {/* Sugestão de ícone mais adequado */}
      </View>
      <Text style={styles.title}>Sucesso!</Text>
      <Text style={styles.subtitle}>
        Você foi cadastrado com sucesso.
      </Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={onClose}
      >
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... estilos
  modalContainer: { // Estilo para o container dentro do modal
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  iconContainer: {
    backgroundColor: '#dcfce7',
    padding: 30,
    borderRadius: 100,
    marginBottom: 24,
  },
});

export default CadastroSucesso;