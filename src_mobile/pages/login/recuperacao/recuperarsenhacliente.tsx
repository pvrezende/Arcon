// pages/login/recuperarsenhacliente.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, Modal
} from 'react-native';
// Implementar nova validação de recuperação de senha
// Aguardando implementação das novas validações
import Navbar from '../../../componentes/navbar';
import Footer from '../../../componentes/footer';
import BackButton from '../../../componentes/backbutton';
import AprovadoScreen from '../../../componentes/sucesso'; // <-- Altere para o caminho correto, se necessário

const RecuperarSenhaCliente = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const handleRecuperarSenha = async () => {
    if (!email) {
      Alert.alert('Erro', 'Digite seu email.');
      return;
    }

    try {
      // Implementar nova validação de recuperação de senha aqui
      // Aguardando implementação das novas validações
      
      // Simulação de loading por 2 segundos
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Por enquanto, apenas mostra uma mensagem
      Alert.alert(
        'Em Desenvolvimento', 
        'Sistema de recuperação de senha em atualização. Aguarde a implementação das novas validações.',
        [{ text: 'OK' }]
      );
      
    } catch (error: any) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Navbar />
      <BackButton />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Recuperar Senha</Text>
            <Text style={styles.subtitle}>
              Informe o email da sua conta para enviarmos as instruções
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite seu email"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, !email && styles.buttonDisabled]}
              onPress={handleRecuperarSenha}
              activeOpacity={0.8}
              disabled={!email}
            >
              <Text style={styles.buttonText}>Enviar Link</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('logincliente')}
            >
              <Text style={styles.linkText}>Voltar ao Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Footer />

      {/* MODAL DE SUCESSO */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AprovadoScreen />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('home'); // ✅ Navega para home.tsx
              }}
            >
              <Text style={styles.modalButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingBottom: 40 },
  formContainer: { alignItems: 'center', width: '100%' },
  header: { marginBottom: 24, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#0284c7ff', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', maxWidth: 320, lineHeight: 22 },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    width: '100%',
    maxWidth: 400,
  },
  inputGroup: { marginBottom: 24, width: '100%' },
  label: { fontSize: 15, color: '#334155', marginBottom: 8, fontWeight: '600' },
  input: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    fontSize: 16,
    color: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    width: '100%',
  },
  button: {
    backgroundColor: '#0284c7',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: { backgroundColor: '#CBD5E1', shadowColor: '#64748B' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  linkButton: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#0284c7', fontSize: 14, fontWeight: '600' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RecuperarSenhaCliente;
