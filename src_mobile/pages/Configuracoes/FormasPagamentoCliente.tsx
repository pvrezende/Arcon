import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  Alert,
  Switch
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Navbar from "../../componentes/navbar";
import Footer from "../../componentes/footer";
import { StackNavigationProp } from '@react-navigation/stack';

// Definindo os tipos para as rotas de navegação 
type RootStackParamList = {
  Configuracoes: undefined;
  Pagamentos: undefined;
};

type PagamentosNavigationProp = StackNavigationProp<RootStackParamList>;

interface PagamentosProps {
  navigation: PagamentosNavigationProp;
}

const Pagamentos: React.FC<PagamentosProps> = ({ navigation }) => {
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardHolder, setCardHolder] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');
  const [isCreditCard, setIsCreditCard] = useState<boolean>(true);
  const [saveCard, setSaveCard] = useState<boolean>(true);

  // Função para voltar para a página anterior
  const goBack = (): void => {
    navigation.goBack();
  };

  const formatCardNumber = (text: string): void => {
    // Remove todos os caracteres não numéricos
    const cleaned = text.replace(/\D/g, '');
    
    // Adiciona espaços a cada 4 dígitos
    const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
    
    // Limita a 19 caracteres (16 dígitos + 3 espaços)
    setCardNumber(formatted.substring(0, 19));
  };

  const formatExpiryDate = (text: string): void => {
    // Remove todos os caracteres não numéricos
    const cleaned = text.replace(/\D/g, '');
    
    // Adiciona barra após 2 dígitos
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    
    // Limita a 5 caracteres
    setExpiryDate(formatted.substring(0, 5));
  };

  const handleSaveCard = (): void => {
    // Validações básicas
    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      Alert.alert('Erro', 'Por favor, insira um número de cartão válido (16 dígitos)');
      return;
    }

    if (!cardHolder.trim()) {
      Alert.alert('Erro', 'Por favor, insira o nome do titular do cartão');
      return;
    }

    if (!expiryDate || expiryDate.length !== 5) {
      Alert.alert('Erro', 'Por favor, insira uma data de validade válida (MM/AA)');
      return;
    }

    if (!cvv || cvv.length < 3) {
      Alert.alert('Erro', 'Por favor, insira um CVV válido');
      return;
    }

    // Aqui você implementaria a lógica para salvar no Firebase/AsyncStorage
    const cardData = {
      number: cardNumber.replace(/\s/g, ''),
      holder: cardHolder,
      expiry: expiryDate,
      cvv: cvv,
      type: isCreditCard ? 'credit' : 'debit',
      saved: saveCard
    };

    console.log('Dados do cartão:', cardData);
    
    Alert.alert(
      'Sucesso!',
      `Cartão de ${isCreditCard ? 'Crédito' : 'Débito'} salvo com sucesso!`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Navbar no topo */}
      <Navbar />
      
      {/* Botão Voltar simplificado */}
      <View style={styles.botaoVoltarContainer}>
        <TouchableOpacity style={styles.botaoVoltar} onPress={goBack}>
          <Ionicons name="arrow-back" size={20} color="#0284c7" />
          <Text style={styles.botaoVoltarTexto}>Voltar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Formas de Pagamento</Text>
        
        {/* Seção de Informações */}
        <View style={styles.infoSection}>
          <Ionicons name="card-outline" size={24} color="#0284c7" />
          <Text style={styles.infoText}>
            Adicione seu cartão de crédito ou débito para pagamentos rápidos e seguros
          </Text>
        </View>

        {/* Seção de Tipo de Cartão */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Cartão</Text>
          <View style={styles.cardTypeContainer}>
            <TouchableOpacity 
              style={[
                styles.cardTypeButton,
                isCreditCard && styles.cardTypeButtonActive
              ]}
              onPress={() => setIsCreditCard(true)}
            >
              <Ionicons 
                name="card" 
                size={20} 
                color={isCreditCard ? "#fff" : "#0284c7"} 
              />
              <Text style={[
                styles.cardTypeText,
                isCreditCard && styles.cardTypeTextActive
              ]}>
                Crédito
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.cardTypeButton,
                !isCreditCard && styles.cardTypeButtonActive
              ]}
              onPress={() => setIsCreditCard(false)}
            >
              <Ionicons 
                name="card" 
                size={20} 
                color={!isCreditCard ? "#fff" : "#0284c7"} 
              />
              <Text style={[
                styles.cardTypeText,
                !isCreditCard && styles.cardTypeTextActive
              ]}>
                Débito
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Formulário do Cartão */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do Cartão</Text>
          
          {/* Número do Cartão */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Número do Cartão</Text>
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
              value={cardNumber}
              onChangeText={formatCardNumber}
              maxLength={19}
            />
            <Ionicons name="card" size={20} color="#64748b" style={styles.inputIcon} />
          </View>

          {/* Nome do Titular */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome do Titular</Text>
            <TextInput
              style={styles.input}
              placeholder="JOÃO M SILVA"
              value={cardHolder}
              onChangeText={setCardHolder}
              autoCapitalize="characters"
            />
            <Ionicons name="person" size={20} color="#64748b" style={styles.inputIcon} />
          </View>

          {/* Data de Validade e CVV */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.label}>Validade</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/AA"
                keyboardType="numeric"
                value={expiryDate}
                onChangeText={formatExpiryDate}
                maxLength={5}
              />
              <Ionicons name="calendar" size={20} color="#64748b" style={styles.inputIcon} />
            </View>

            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                keyboardType="numeric"
                secureTextEntry
                value={cvv}
                onChangeText={setCvv}
                maxLength={3}
              />
              <Ionicons name="lock-closed" size={20} color="#64748b" style={styles.inputIcon} />
            </View>
          </View>

          {/* Salvar Cartão */}
          <View style={styles.saveCardContainer}>
            <View style={styles.switchContainer}>
              <Switch
                value={saveCard}
                onValueChange={setSaveCard}
                trackColor={{ false: '#cbd5e1', true: '#0284c7' }}
                thumbColor={saveCard ? '#fff' : '#fff'}
              />
              <Text style={styles.saveCardText}>Salvar cartão para pagamentos futuros</Text>
            </View>
            <Ionicons name="shield-checkmark" size={20} color="#10b981" />
          </View>
        </View>

        {/* Botões de Ação */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#64748b" />
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.saveButton]}
            onPress={handleSaveCard}
          >
            <Ionicons name="save" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Salvar Cartão</Text>
          </TouchableOpacity>
        </View>

        {/* Informações de Segurança */}
        <View style={styles.securityInfo}>
          <Ionicons name="lock-closed" size={16} color="#10b981" />
          <Text style={styles.securityText}>
            Suas informações são criptografadas e protegidas
          </Text>
        </View>
      </ScrollView>

      {/* Footer na base */}
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
    marginBottom: 10,
  },
  // Estilos para o botão voltar simplificado
  botaoVoltarContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
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
    fontWeight: '500',
  },
  title: { 
    fontSize: 28, 
    fontWeight: "800",
    color: '#0284c7',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#0369a1',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000000ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 15,
  },
  cardTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0284c7',
    marginHorizontal: 5,
  },
  cardTypeButtonActive: {
    backgroundColor: '#0284c7',
  },
  cardTypeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#0284c7',
  },
  cardTypeTextActive: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    paddingRight: 40,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
    top: 40,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  saveCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveCardText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  saveButton: {
    backgroundColor: '#0284c7',
  },
  cancelButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  saveButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  securityText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
});

export default Pagamentos;