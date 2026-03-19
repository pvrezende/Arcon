import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal, ActivityIndicator
} from 'react-native';
import Navbar from '../../../componentes/navbar';
import Footer from '../../../componentes/footer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../../hooks/useAuth';

const LoginCliente = ({ navigation }: any) => {
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [erroEmail, setErroEmail] = useState('');
  const [erroSenha, setErroSenha] = useState('');

  const goToHome = () => navigation.navigate('Home');

  const validarFormulario = () => {
    let valido = true;
    setErroEmail('');
    setErroSenha('');

    if (!email) {
      setErroEmail('Email é obrigatório');
      valido = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setErroEmail('Email com formato inválido');
      valido = false;
    }

    if (!senha) {
      setErroSenha('Senha é obrigatória');
      valido = false;
    } else if (senha.length < 6) {
      setErroSenha('Senha deve ter pelo menos 6 caracteres');
      valido = false;
    }

    return valido;
  };

  const handleLogin = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    setModalLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('senha', senha);
      
      const response = await fetch('http://192.168.0.183:8000/login', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      console.log('📥 Resposta login:', data);
      
      setLoading(false);
      setModalLoading(false);
      
      if (data.success && data.data?.user) {
        // Verificar se é cliente
        if (data.data.user.tipo_usuario === 'CLIENTE') {
          // Login com hook - navegação automática
          await authLogin(data.data.token, data.data.user);
          // App.Mobile.tsx redireciona automaticamente!
        } else {
          Alert.alert('Erro', 'Este login é apenas para clientes.');
        }
      } else {
        Alert.alert('Erro no Login', data.message || 'Credenciais inválidas.');
      }
    } catch (error: any) {
      setLoading(false);
      setModalLoading(false);
      Alert.alert('Erro', 'Erro de conexão. Verifique sua internet.');
    }
  };


  return (
    <View style={styles.container}>
      <Navbar />
     
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Botão Voltar */}
        <View style={styles.botaoVoltarContainer}>
          <TouchableOpacity style={styles.botaoVoltar} onPress={goToHome}>
            <Ionicons name="arrow-back" size={20} color="#0284c7" />
            <Text style={styles.botaoVoltarTexto}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Login do Cliente</Text>
            <Text style={styles.subtitle}>Entre na sua conta para acessar os serviços disponíveis</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, erroEmail ? styles.inputError : null]}
                placeholder="Digite seu email"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErroEmail('');
                }}
                editable={!loading}
              />
              {erroEmail ? <Text style={styles.errorText}>{erroEmail}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={[styles.input, erroSenha ? styles.inputError : null]}
                placeholder="Digite sua senha"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                value={senha}
                onChangeText={(text) => {
                  setSenha(text);
                  setErroSenha('');
                }}
                editable={!loading}
              />
              {erroSenha ? <Text style={styles.errorText}>{erroSenha}</Text> : null}
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Carregando...' : 'Entrar'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('cliente')}
              disabled={loading}
            >
              <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('RecuperarSenhaCliente')}
              disabled={loading}
            >
              <Text style={styles.linkText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Footer />

      {/* Modal de Loading */}
      <Modal transparent visible={modalLoading} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#0284c7" />
            <Text style={styles.modalText}>Entrando...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  // Estilos do botão Voltar (sem caixa)
  botaoVoltarContainer: {
    width: '100%',
    marginBottom: 20,
  },
  botaoVoltar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  botaoVoltarTexto: {
    marginLeft: 8,
    color: '#0284c7',
    fontSize: 16,
    fontWeight: '600',
  },
  content: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  formContainer: { alignItems: 'center', width: '100%' },
  header: { marginBottom: 24, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#0284c7ff', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', maxWidth: 300, lineHeight: 22 },
  formCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5, width: '100%', maxWidth: 400 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 15, color: '#334155', marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#F8FAFC', paddingVertical: 16, paddingHorizontal: 18, borderRadius: 14, fontSize: 16, color: '#0F172A', borderWidth: 1.5, borderColor: '#E2E8F0' },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  button: { backgroundColor: '#0284c7', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 16, shadowColor: '#0284c7', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  buttonDisabled: { backgroundColor: '#CBD5E1', shadowColor: '#64748B' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  linkButton: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#0284c7', fontSize: 14, fontWeight: '600' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 16, alignItems: 'center' },
  modalText: { marginTop: 12, fontSize: 16, fontWeight: '600', color: '#0284c7' },
});

export default LoginCliente;