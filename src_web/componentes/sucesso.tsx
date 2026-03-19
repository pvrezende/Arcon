import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AprovadoScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Ícone central */}
      <View style={styles.iconContainer}>
        <Ionicons name="snow" size={80} color="#0284c7" />
      </View>

      {/* Mensagem de aprovado */}
      <Text style={styles.title}>Sucesso!</Text>
      <Text style={styles.subtitle}>
     Um link de recuperação será enviado, caso um e-mail esteja associado à conta.
        
      </Text>

      {/* Botão voltar (opcional) */}
    
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f7fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    backgroundColor: '#bae6fd',
    padding: 30,
    borderRadius: 100,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0284c7',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#334155',
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
});

export default AprovadoScreen;
