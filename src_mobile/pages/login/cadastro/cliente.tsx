import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
// Implementar nova validação de cadastro
// Aguardando implementação das novas validações
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_CONFIG } from '../../../../configIp';
import { CepService } from '../../../services/cepService';

// Componentes personalizados
import Navbar from '../../../componentes/navbar';
import Footer from '../../../componentes/footer';
import CadastroSucesso from '../../../componentes/cadastrosucesso';

const Cliente = () => {
  const navigation = useNavigation();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [complemento, setComplemento] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  const goToHome = () => {
    navigation.navigate('Home' as never);
  };

  // Função para buscar CEP
  const buscarCep = async (cepDigitado: string) => {
    const cepLimpo = cepDigitado.replace(/\D/g, '');
    
    // Verifica se o CEP tem 8 dígitos
    if (cepLimpo.length !== 8) {
      return;
    }

    setLoadingCep(true);

    try {
      const endereco = await CepService.buscarCep(cepLimpo);
      
      if (endereco) {
        // Preenche automaticamente os campos com os dados do CEP
        setEndereco(endereco.logradouro || '');
        setBairro(endereco.bairro || '');
        setCidade(endereco.localidade || '');
        setEstado(endereco.uf || '');
        
        Alert.alert('Sucesso', 'Endereço encontrado! Preencha o número e complemento.');
      } else {
        Alert.alert('CEP não encontrado', 'Verifique o CEP digitado.');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível buscar o CEP. Tente novamente.');
    } finally {
      setLoadingCep(false);
    }
  };

  // Formatação de CEP
  const formatCEP = (text: string) => {
    return CepService.formatarCep(text);
  };

  // Limpa todos os campos do formulário
  const limparFormulario = () => {
    setNome('');
    setEmail('');
    setConfirmEmail('');
    setSenha('');
    setConfirmSenha('');
    setTelefone('');
    setCpf('');
    setCep('');
    setEndereco('');
    setNumero('');
    setBairro('');
    setCidade('');
    setEstado('');
    setComplemento('');
  };

  // Fecha o modal de sucesso e retorna à tela de login
  const handleCloseModal = () => {
    setModalVisible(false);
    limparFormulario();
    navigation.navigate('LoginCliente' as never);
  };

  // Função principal de cadastro - ATUALIZADA (complemento NÃO obrigatório)
  const handleSubmit = async () => {
    // Validação básica de campos - ATUALIZADA (complemento NÃO obrigatório)
    if (!nome || !email || !confirmEmail || !senha || !confirmSenha || !telefone || !cpf || !cep || !endereco || !numero || !bairro || !cidade || !estado) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    if (email !== confirmEmail) {
      Alert.alert('Erro', 'Os emails não coincidem.');
      return;
    }

    if (senha !== confirmSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    // Validação de CEP
    if (cep.replace(/\D/g, '').length !== 8) {
      Alert.alert('Erro', 'Digite um CEP válido com 8 dígitos.');
      return;
    }

    // Validação de CPF
    if (cpf.replace(/\D/g, '').length !== 11) {
      Alert.alert('Erro', 'Digite um CPF válido com 11 dígitos.');
      return;
    }

    setLoading(true);

    try {
      // Preparar dados para envio conforme especificação do MD
      const dadosCliente = {
        nome: nome,
        email: email,
        senha: senha,
        telefone: telefone.replace(/\D/g, ''), // Remove formatação
        tipo_usuario: "CLIENTE",
        cpf: cpf.replace(/\D/g, ''), // Remove formatação
        endereco: endereco,
        numero: numero,
        bairro: bairro,
        cidade: cidade,
        estado: estado,
        cep: cep.replace(/\D/g, ''), // Remove formatação
        complemento: complemento || '' // Campo opcional mas precisa ser enviado
      };

      console.log('📤 Dados sendo enviados para cadastro:', dadosCliente);
      console.log('📤 Platform:', Platform.OS);
      
      // No mobile, FormData nativo funciona melhor que URLSearchParams
      const formData = new FormData();
      Object.keys(dadosCliente).forEach(key => {
        formData.append(key, dadosCliente[key]);
      });
      
      // Fazer requisição para o backend
      const response = await fetch('http://192.168.0.183:8000/cadastro', {
        method: 'POST',
        body: formData
      });
      
      console.log('📥 Status da resposta cadastro:', response.status);
      
      const data = await response.json();
      
      console.log('📥 Resposta do backend:', data);
      
      // Se tiver detail com erros, mostrar quais campos estão faltando
      if (data.detail && Array.isArray(data.detail)) {
        console.log('❌ Campos com erro:');
        data.detail.forEach((erro: any) => {
          console.log(`  - Campo: ${erro.loc.join('.')}, Erro: ${erro.msg}`);
        });
      }
      
      setLoading(false);
      
      if (data.success) {
        // Mostrar modal de sucesso
        setModalVisible(true);
      } else {
        Alert.alert('Erro no Cadastro', data.message || 'Erro ao criar conta. Tente novamente.');
      }
      
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Erro', 'Erro de conexão. Verifique sua internet e tente novamente.');
    }
  };

  // Formatação de telefone
  const formatPhone = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 11) {
      if (numbers.length <= 6) return numbers.replace(/(\d{0,2})(\d{0,4})/, '($1) $2');
      else if (numbers.length <= 10) return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      else return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    return text;
  };

  // Formatação de CPF
  const formatCPF = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 11) {
      if (numbers.length <= 3) return numbers;
      else if (numbers.length <= 6) return numbers.replace(/(\d{3})(\d{0,3})/, '$1.$2');
      else if (numbers.length <= 9) return numbers.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
      else return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    }
    return text;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Navbar />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Botão Voltar - AGORA DENTRO DO SCROLLVIEW PARA ROLAR JUNTO */}
        <View style={styles.botaoVoltarContainer}>
          <TouchableOpacity style={styles.botaoVoltar} onPress={goToHome}>
            <Ionicons name="arrow-back" size={20} color="#0284c7" />
            <Text style={styles.botaoVoltarTexto}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Criar sua conta</Text>
          <Text style={styles.subtitle}>Preencha os dados abaixo para se cadastrar</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome completo *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome completo"
              placeholderTextColor="#94a3b8"
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>CPF *</Text>
              <TextInput
                style={styles.input}
                placeholder="000.000.000-00"
                placeholderTextColor="#94a3b8"
                keyboardType="number-pad"
                value={formatCPF(cpf)}
                onChangeText={(text) => setCpf(text.replace(/\D/g, ''))}
                maxLength={14}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Telefone *</Text>
              <TextInput
                style={styles.input}
                placeholder="(00) 00000-0000"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                value={formatPhone(telefone)}
                onChangeText={(text) => setTelefone(text.replace(/\D/g, ''))}
                maxLength={15}
              />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Endereço</Text>

          {/* CAMPO CEP */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CEP *</Text>
            <View style={styles.cepContainer}>
              <TextInput
                style={[styles.input, styles.cepInput]}
                placeholder="00000-000"
                placeholderTextColor="#94a3b8"
                keyboardType="number-pad"
                value={formatCEP(cep)}
                onChangeText={(text) => {
                  const cepLimpo = text.replace(/\D/g, '');
                  setCep(cepLimpo);
                  // Busca automática quando o CEP estiver completo
                  if (cepLimpo.length === 8) {
                    buscarCep(cepLimpo);
                  }
                }}
                maxLength={9}
              />
              <TouchableOpacity
                style={[styles.cepButton, loadingCep && styles.cepButtonDisabled]}
                onPress={() => buscarCep(cep)}
                disabled={loadingCep || cep.replace(/\D/g, '').length !== 8}
              >
                <Text style={styles.cepButtonText}>
                  {loadingCep ? '...' : 'Buscar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 2, marginRight: 10 }]}>
              <Text style={styles.label}>Endereço *</Text>
              <TextInput
                style={styles.input}
                placeholder="Rua, Avenida, etc."
                placeholderTextColor="#94a3b8"
                value={endereco}
                onChangeText={setEndereco}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Número *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nº"
                placeholderTextColor="#94a3b8"
                keyboardType="number-pad"
                value={numero}
                onChangeText={setNumero}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Bairro *</Text>
              <TextInput
                style={styles.input}
                placeholder="Bairro"
                placeholderTextColor="#94a3b8"
                value={bairro}
                onChangeText={setBairro}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Cidade *</Text>
              <TextInput
                style={styles.input}
                placeholder="Cidade"
                placeholderTextColor="#94a3b8"
                value={cidade}
                onChangeText={setCidade}
                editable={false} // Não editável pois vem do CEP
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Estado *</Text>
              <TextInput
                style={styles.input}
                placeholder="UF"
                placeholderTextColor="#94a3b8"
                value={estado}
                onChangeText={setEstado}
                editable={false} // Não editável pois vem do CEP
                maxLength={2}
              />
            </View>
          </View>

          {/* CAMPO COMPLEMENTO - AGORA NÃO OBRIGATÓRIO */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Complemento</Text>
            <TextInput
              style={styles.input}
              placeholder="Apto, Bloco, Casa, etc. (opcional)"
              placeholderTextColor="#94a3b8"
              value={complemento}
              onChangeText={setComplemento}
            />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Dados de Acesso</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="repita.seu@email.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={confirmEmail}
              onChangeText={setConfirmEmail}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Senha *</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                value={senha}
                onChangeText={setSenha}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Confirmar Senha *</Text>
              <TextInput
                style={styles.input}
                placeholder="Repita sua senha"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                value={confirmSenha}
                onChangeText={setConfirmSenha}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Cadastrando...' : 'Criar conta'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            Ao criar uma conta, você concorda com nossos{' '}
            <Text style={styles.link}>Termos de Uso</Text> e{' '}
            <Text style={styles.link}>Política de Privacidade</Text>
          </Text>
        </View>
      </ScrollView>

      <Footer />

      {/* Modal de Sucesso */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={handleCloseModal}
        style={styles.modal}
        backdropOpacity={0.8}
        animationIn="zoomIn"
        animationOut="zoomOut"
        coverScreen={true}
      >
        <CadastroSucesso onClose={handleCloseModal} />
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  // ESTILOS DO BOTÃO VOLTAR - AGORA DENTRO DO SCROLLVIEW
  botaoVoltarContainer: { paddingHorizontal: 0, paddingVertical: 10, backgroundColor: '#F8FAFC', marginBottom: 10 },
  botaoVoltar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 20 },
  botaoVoltarTexto: { marginLeft: 8, color: '#0284c7', fontSize: 14, fontWeight: '500' },
  
  content: { paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 30, paddingHorizontal: 20, paddingTop: 10 },
  title: { fontSize: 28, fontWeight: '800', color: '#0284c7', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', maxWidth: 300 },
  formCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, marginHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 20, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#334155', marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#F8FAFC', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, fontSize: 16, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { backgroundColor: '#0284c7', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 20, shadowColor: '#0284c7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 5 },
  buttonDisabled: { backgroundColor: '#94a3b8' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  termsText: { textAlign: 'center', color: '#64748B', fontSize: 14 },
  link: { color: '#0284c7', fontWeight: '600' },
  modal: { justifyContent: 'center', alignItems: 'center', margin: 0, zIndex: 9999 },
  // ESTILOS PARA O CEP
  cepContainer: { flexDirection: 'row', alignItems: 'center' },
  cepInput: { flex: 1, marginRight: 10 },
  cepButton: { backgroundColor: '#10b981', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, minWidth: 80, alignItems: 'center' },
  cepButtonDisabled: { backgroundColor: '#94a3b8' },
  cepButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' }
});

export default Cliente;
