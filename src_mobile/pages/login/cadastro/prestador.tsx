import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, 
  Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import Navbar from '../../../componentes/navbar';
import Footer from '../../../componentes/footer';
// Implementar nova validação de cadastro
// Aguardando implementação das novas validações
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_CONFIG } from '../../../../configIp';
import { CepService } from '../../../services/cepService';
import type { RootStackParamList } from '../../../types/navigation';

const Prestador = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Estado para dados do formulário
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [complemento, setComplemento] = useState('');
  const [areaAtuacao, setAreaAtuacao] = useState('');
  const [celular, setCelular] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [tipo, setTipo] = useState<'loja' | 'manual' | null>(null);
  
  // Estado para dados do portfólio
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [descricao, setDescricao] = useState('');
  
  // Estado para controle da interface
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  // Opções de serviços
  const opcoesServicos = [
    "Limpeza",
    "Manutenção",
    "Instalação",
    "Reposição de Gás",
    "Troca de Peças",
  ];

  const goToHome = () => {
    navigation.navigate('Home');
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

  // Funções para o portfólio
  const toggleSelecionar = (opcao: string) => {
    if (selecionados.includes(opcao)) {
      setSelecionados(selecionados.filter((item) => item !== opcao));
    } else {
      if (selecionados.length >= 4) {
        Alert.alert("Limite atingido", "Você só pode selecionar até 4 opções.");
        return;
      }
      setSelecionados([...selecionados, opcao]);
    }
  };

  // Validação da primeira etapa - ATUALIZADA (complemento NÃO obrigatório)
  const validarPrimeiraEtapa = () => {
    if (!nome || !cnpj || !email || !confirmEmail || !cep || !endereco || !numero || !bairro || !cidade || !estado || !areaAtuacao || !celular || !tipo || !senha || !confirmarSenha) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return false;
    }

    if (email !== confirmEmail) {
      Alert.alert('Erro', 'Os emails não coincidem.');
      return false;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return false;
    }

    if (senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return false;
    }

    // Validação de CEP
    if (cep.replace(/\D/g, '').length !== 8) {
      Alert.alert('Erro', 'Digite um CEP válido com 8 dígitos.');
      return false;
    }

    // Validação de CNPJ
    if (cnpj.replace(/\D/g, '').length !== 14) {
      Alert.alert('Erro', 'Digite um CNPJ válido com 14 dígitos.');
      return false;
    }

    return true;
  };

  // Validação da segunda etapa
  const validarSegundaEtapa = () => {
    if (selecionados.length === 0) {
      Alert.alert("Erro", "Selecione pelo menos uma opção.");
      return false;
    }
    if (!descricao.trim()) {
      Alert.alert("Erro", "Adicione uma descrição.");
      return false;
    }
    return true;
  };

  // Avançar para a próxima etapa
  const avancarEtapa = () => {
    if (validarPrimeiraEtapa()) {
      setEtapaAtual(2);
    }
  };

  // Voltar para a etapa anterior
  const voltarEtapa = () => {
    setEtapaAtual(1);
  };

  // Finalizar cadastro - ATUALIZADA (complemento NÃO obrigatório)
  const handleSubmit = async () => {
    if (!validarSegundaEtapa()) return;

    setLoading(true);

    try {
      // Preparar dados para envio conforme especificação do MD
      const dadosPrestador = {
        nome: nome,
        email: email,
        senha: senha,
        telefone: celular.replace(/\D/g, ''), // Remove formatação
        tipo_usuario: "PRESTADOR",
        cnpj: cnpj.replace(/\D/g, ''), // Remove formatação
        razao_social: nome, // Usando o nome como razão social por enquanto
        nome_fantasia: nome, // Usando o nome como nome fantasia por enquanto
        tipo_prestador: tipo || "manual", // "loja" ou "manual"
        area_atuacao: areaAtuacao || '', // Área de atuação (pode ser vazio para lojas)
        endereco: endereco,
        numero: numero,
        bairro: bairro,
        cidade: cidade,
        estado: estado,
        cep: cep.replace(/\D/g, ''), // Remove formatação
        complemento: complemento || '' // Campo opcional mas precisa ser enviado
      };

      console.log('📤 Dados sendo enviados para cadastro:', dadosPrestador);
      console.log('📤 Tipo selecionado:', tipo);
      console.log('📤 Platform:', Platform.OS);

      // No mobile, FormData nativo funciona melhor que URLSearchParams
      const formData = new FormData();
      Object.keys(dadosPrestador).forEach(key => {
        formData.append(key, dadosPrestador[key]);
      });
      
      // Fazer requisição para o backend
      const response = await fetch('http://192.168.0.183:8000/cadastro', {
        method: 'POST',
        body: formData
      });
      
      console.log('📥 Status da resposta cadastro prestador:', response.status);
      
      const data = await response.json();
      
      console.log('📥 Resposta do backend no cadastro:', data);
      
      // Se tiver detail com erros, mostrar quais campos estão faltando
      if (data.detail && Array.isArray(data.detail)) {
        console.log('❌ Campos com erro:');
        data.detail.forEach((erro: any) => {
          console.log(`  - Campo: ${erro.loc.join('.')}, Erro: ${erro.msg}`);
        });
      }
      
      setLoading(false);
      
      if (data.success) {
        Alert.alert(
          'Cadastro realizado com sucesso!', 
          'Sua conta foi criada com sucesso. Você já pode fazer login.',
          [{ 
            text: 'OK', 
            onPress: () => navigation.navigate('loginprestador')
          }]
        );
      } else {
        Alert.alert('Erro no Cadastro', data.message || 'Erro ao criar conta. Tente novamente.');
      }
      
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Erro', 'Erro de conexão. Verifique sua internet e tente novamente.');
    }
  };

  // Formatação de CNPJ
  const formatCNPJ = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 14) {
      if (numbers.length > 12) {
        return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
      } else if (numbers.length > 8) {
        return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
      } else if (numbers.length > 5) {
        return numbers.replace(/^(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
      } else if (numbers.length > 2) {
        return numbers.replace(/^(\d{2})(\d{0,3})/, '$1.$2');
      }
    }
    return text;
  };

  // Formatação de celular
  const formatPhone = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 11) {
      if (numbers.length > 6) {
        return numbers.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
      } else if (numbers.length > 2) {
        return numbers.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
      } else if (numbers.length > 0) {
        return numbers.replace(/^(\d{0,2})/, '($1');
      }
    }
    return text;
  };

  // Renderizar a primeira etapa (dados cadastrais) - ATUALIZADA
  const renderizarEtapa1 = () => (
    <View style={styles.formCard}>
      {/* Indicador de progresso */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.progressCircle, styles.progressCircleActive]}>
            <Text style={styles.progressTextActive}>1</Text>
          </View>
          <Text style={styles.progressLabelActive}>Dados Cadastrais</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStep}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>2</Text>
          </View>
          <Text style={styles.progressLabel}>Portfólio</Text>
        </View>
      </View>

      {/* Informações Pessoais */}
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

      {/* Empresa */}
      <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Empresa</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>CNPJ *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="00.000.000/0000-00"
          placeholderTextColor="#94a3b8"
          keyboardType="number-pad"
          value={formatCNPJ(cnpj)}
          onChangeText={(text) => setCnpj(text.replace(/\D/g, ''))}
          maxLength={18}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Área de atuação *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: Instalação de ar-condicionado"
          placeholderTextColor="#94a3b8"
          value={areaAtuacao}
          onChangeText={setAreaAtuacao}
        />
      </View>

      {/* Contato */}
      <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Contato</Text>
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
          placeholder="confirme.seu@email.com"
          placeholderTextColor="#94a3b8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={confirmEmail}
          onChangeText={setConfirmEmail}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Celular/WhatsApp *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="(00) 00000-0000"
          placeholderTextColor="#94a3b8"
          keyboardType="phone-pad"
          value={formatPhone(celular)}
          onChangeText={(text) => setCelular(text.replace(/\D/g, ''))}
          maxLength={15}
        />
      </View>

      {/* Endereço - SEÇÃO ATUALIZADA */}
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
            editable={false}
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
            editable={false}
            maxLength={2}
          />
        </View>
      </View>

      {/* CAMPO COMPLEMENTO - AGORA NÃO OBRIGATÓRIO */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Complemento</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Apto, Bloco, etc. (opcional)"
          placeholderTextColor="#94a3b8"
          value={complemento}
          onChangeText={setComplemento}
        />
      </View>

      {/* Senha */}
      <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Segurança</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Senha *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Mínimo de 6 caracteres"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirmar Senha *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Digite novamente sua senha"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />
      </View>

      {/* Tipo de prestador */}
      <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Tipo de Prestador</Text>
      <View style={styles.row}>
        <TouchableOpacity 
          style={[styles.radioButton, tipo === 'loja' && styles.radioSelected]} 
          onPress={() => setTipo('loja')}
        >
          <Text style={[styles.radioText, tipo === 'loja' && styles.radioTextSelected]}>Loja</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.radioButton, tipo === 'manual' && styles.radioSelected]} 
          onPress={() => setTipo('manual')}
        >
          <Text style={[styles.radioText, tipo === 'manual' && styles.radioTextSelected]}>Serviço Manual</Text>
        </TouchableOpacity>
      </View>

      {/* Botão para próxima etapa */}
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={avancarEtapa} 
        activeOpacity={0.8}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          Próxima Etapa
        </Text>
      </TouchableOpacity>

      <Text style={styles.termsText}>
        Ao se cadastrar, você concorda com nossos{' '}
        <Text style={styles.link}>Termos de Uso</Text> e{' '}
        <Text style={styles.link}>Política de Privacidade</Text>
      </Text>
    </View>
  );

  // Renderizar a segunda etapa (portfólio)
  const renderizarEtapa2 = () => (
    <View style={styles.formCard}>
      {/* Indicador de progresso */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.progressCircle, styles.progressCircleCompleted]}>
            <Text style={styles.progressTextCompleted}>✓</Text>
          </View>
          <Text style={styles.progressLabelCompleted}>Dados Cadastrais</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStep}>
          <View style={[styles.progressCircle, styles.progressCircleActive]}>
            <Text style={styles.progressTextActive}>2</Text>
          </View>
          <Text style={styles.progressLabelActive}>Portfólio</Text>
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Monte seu Portfólio</Text>
        <Text style={styles.subtitle}>
          Adicione os serviços que você oferece e descreva seu trabalho
        </Text>
      </View>

      <Text style={styles.subtitleCard}>
        Escolha até 4 serviços que você oferece
      </Text>

      <View style={styles.optionsContainer}>
        {opcoesServicos.map((opcao, index) => {
          const selecionado = selecionados.includes(opcao);
          return (
            <TouchableOpacity
              key={index}
              style={[styles.option, selecionado && styles.optionSelected]}
              onPress={() => toggleSelecionar(opcao)}
            >
              <Text
                style={[
                  styles.optionText,
                  selecionado && styles.optionTextSelected,
                ]}
              >
                {opcao}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.subtitleCard}>Descrição do seu trabalho</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Ex: Faço manutenção elétrica, hidráulica e instalações..."
        placeholderTextColor="#94a3b8"
        multiline
        maxLength={250}
        value={descricao}
        onChangeText={setDescricao}
      />
      <Text style={styles.charCount}>{descricao.length}/250</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.buttonSecondary, loading && styles.buttonDisabled]} 
          onPress={voltarEtapa} 
          activeOpacity={0.8}
          disabled={loading}
        >
          <Text style={styles.buttonSecondaryText}>
            Voltar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSubmit} 
          activeOpacity={0.8}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
        {/* Botão Voltar - IGUAL AO DA PÁGINA DO CLIENTE */}
        <View style={styles.botaoVoltarContainer}>
          <TouchableOpacity style={styles.botaoVoltar} onPress={goToHome}>
            <Ionicons name="arrow-back" size={20} color="#0284c7" />
            <Text style={styles.botaoVoltarTexto}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Cadastro de Prestador</Text>
          <Text style={styles.subtitle}>
            {etapaAtual === 1 
              ? "Preencha os dados abaixo para se tornar nosso parceiro" 
              : "Complete seu portfólio para atrair mais clientes"}
          </Text>
        </View>

        {etapaAtual === 1 ? renderizarEtapa1() : renderizarEtapa2()}
        
      </ScrollView>

      <Footer />
    </KeyboardAvoidingView>
  );
};

// Estilos atualizados
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  // ESTILOS DO BOTÃO VOLTAR - IGUAL AO DO CLIENTE
  botaoVoltarContainer: { paddingHorizontal: 0, paddingVertical: 10, backgroundColor: '#F8FAFC', marginBottom: 10 },
  botaoVoltar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 20 },
  botaoVoltarTexto: { marginLeft: 8, color: '#0284c7', fontSize: 14, fontWeight: '500' },
  
  content: { paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 30, paddingHorizontal: 20, paddingTop: 10 },
  title: { fontSize: 28, fontWeight: '800', color: '#0284c7', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', maxWidth: 300 },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#334155', marginBottom: 8, fontWeight: '600' },
  input: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  radioButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0284c7',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  radioSelected: { backgroundColor: '#0284c7' },
  radioText: { color: '#0284c7', fontWeight: '600' },
  radioTextSelected: { color: '#fff' },
  button: {
    backgroundColor: '#0284c7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0284c7',
    flex: 1,
    marginRight: 10,
  },
  buttonSecondaryText: {
    color: '#0284c7',
    fontSize: 16,
    fontWeight: '700'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  termsText: { textAlign: 'center', color: '#64748B', fontSize: 14 },
  link: { color: '#0284c7', fontWeight: '600' },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 26,
    marginTop: 8,
  },
  option: {
    borderWidth: 1.5,
    borderColor: '#0284c7',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 22,
    margin: 6,
    backgroundColor: '#fff',
    shadowColor: '#0284c7',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  optionSelected: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
    shadowOpacity: 0.15,
    elevation: 4,
  },
  optionText: {
    color: '#0284c7',
    fontSize: 15,
    fontWeight: '600',
  },
  optionTextSelected: { color: '#fff' },
  subtitleCard: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 10,
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 13,
    color: '#64748B',
    marginBottom: 18,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  progressStep: {
    alignItems: 'center',
    width: 100,
  },
  progressCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  progressCircleActive: {
    backgroundColor: '#0284c7',
  },
  progressCircleCompleted: {
    backgroundColor: '#16a34a',
  },
  progressText: {
    color: '#64748B',
    fontWeight: 'bold',
  },
  progressTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  progressTextCompleted: {
    color: '#fff',
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  progressLabelActive: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '600',
    textAlign: 'center',
  },
  progressLabelCompleted: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
    textAlign: 'center',
  },
  progressLine: {
    height: 2,
    width: 40,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 5,
  },
  // ESTILOS PARA O CEP
  cepContainer: { flexDirection: 'row', alignItems: 'center' },
  cepInput: { flex: 1, marginRight: 10 },
  cepButton: { backgroundColor: '#10b981', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, minWidth: 80, alignItems: 'center' },
  cepButtonDisabled: { backgroundColor: '#94a3b8' },
  cepButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' }
});

export default Prestador;
