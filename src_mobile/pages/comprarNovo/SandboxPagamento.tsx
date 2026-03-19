import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_CONFIG } from '../../../configIp';
import Navbar from '../../componentes/navbar';
import Footer from '../../componentes/footer';

interface SandboxPagamentoProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalValue?: number;
}

interface CustomerData {
  nome: string;
  email: string;
  telefone: string;
  evento: string;
}

const { width } = Dimensions.get('window');

const SandboxPagamento: React.FC<SandboxPagamentoProps> = ({
  open,
  onClose,
  onConfirm,
  totalValue = 0,
}) => {
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [mercadoPagoUrl, setMercadoPagoUrl] = useState('');

  const [customerData, setCustomerData] = useState<CustomerData>({
    nome: '',
    email: '',
    telefone: '',
    evento: 'Compra de AR',
  });

  useEffect(() => {
    if (open) {
      loadUserDataFromLocalStorage();
    } else {
      clearFields();
    }
  }, [open]);

  const loadUserDataFromLocalStorage = async () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCustomerData(prev => ({
          ...prev,
          nome: userData.nome || '',
          email: userData.email || '',
          telefone: userData.telefone || '',
        }));
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    }
  };

  const clearFields = () => {
    setError('');
    setIsProcessing(false);
    setConfirmationOpen(false);
    setMercadoPagoUrl('');
    setCustomerData({
      nome: '',
      email: '',
      telefone: '',
      evento: 'Compra de AR',
    });
  };

  const validateCustomerData = (): string | null => {
    if (!customerData.nome.trim()) {
      return 'Nome é obrigatório.';
    }
    if (!customerData.email.trim()) {
      return 'Email é obrigatório.';
    }
    if (!customerData.telefone.trim()) {
      return 'Telefone é obrigatório.';
    }
    if (!customerData.evento.trim()) {
      return 'Evento é obrigatório.';
    }
    if (!/\S+@\S+\.\S+/.test(customerData.email)) {
      return 'Email inválido.';
    }
    return null;
  };

  const generateMercadoPagoPayment = async (): Promise<string> => {
    try {
      const response = await fetch(`${API_CONFIG.PAYMENT_URL}${API_CONFIG.ENDPOINTS.INSCRICAO}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...customerData,
          valor: totalValue,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.payment_url) {
        throw new Error('URL de pagamento não recebida');
      }

      return data.payment_url;
    } catch (error) {
      console.error('Erro detalhado ao gerar pagamento Mercado Pago:', error);
      throw error;
    }
  };

  const handleMercadoPagoPayment = async () => {
    const validationError = validateCustomerData();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const paymentUrl = await generateMercadoPagoPayment();
      setMercadoPagoUrl(paymentUrl);
      
      const canOpen = await Linking.canOpenURL(paymentUrl);
      if (canOpen) {
        await Linking.openURL(paymentUrl);
        
        setTimeout(() => {
          setIsProcessing(false);
          setConfirmationOpen(true);
        }, 3000);
      } else {
        throw new Error('Não foi possível abrir o link de pagamento');
      }
    } catch (error) {
      setIsProcessing(false);
      setError(error.message || 'Erro ao processar pagamento via Mercado Pago');
    }
  };

  const handleConfirm = async () => {
    await handleMercadoPagoPayment();
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
    clearFields();
    onClose();
    onConfirm();
  };

  const formatCurrency = (value: number): string => {
    return value.toFixed(2).replace('.', ',');
  };

  if (confirmationOpen) {
    return (
      <Modal visible={open} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.confirmationContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Pagamento Aprovado!</Text>
            <Text style={styles.successMessage}>
              Seu pagamento foi processado com sucesso via Mercado Pago.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={handleConfirmationClose}
            >
              <Text style={styles.successButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Navbar */}
        <Navbar />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Finalizar Pagamento</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerDivider} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Valor Total em VERDE */}
          {totalValue > 0 && (
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total a pagar</Text>
              <Text style={styles.totalValue}>
                R$ {formatCurrency(totalValue)}
              </Text>
            </View>
          )}

          {/* Método de Pagamento */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Método de Pagamento</Text>
            <View style={styles.paymentMethodContainer}>
              <View style={styles.paymentMethodCard}>
                <View style={styles.paymentMethodIcon}>
                  <Ionicons name="card" size={24} color="#009EE3" />
                </View>
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodName}>Mercado Pago</Text>
                  <Text style={styles.paymentMethodDescription}>
                    Pague com cartão, PIX ou saldo Mercado Pago
                  </Text>
                </View>
                <View style={styles.paymentMethodBadge}>
                  <Text style={styles.paymentMethodBadgeText}>Recomendado</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Formulário do Cliente - DADOS TRAVADOS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Seus Dados</Text>
              <View style={styles.requiredIndicator}>
                <Text style={styles.requiredText}>Dados carregados automaticamente</Text>
              </View>
            </View>
            
            {/* Nome - Travado */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nome Completo</Text>
              <View style={styles.lockedField}>
                <Text style={styles.lockedFieldText}>
                  {customerData.nome || 'Carregando...'}
                </Text>
                <Ionicons name="lock-closed" size={16} color="#64748B" />
              </View>
            </View>

            {/* Email - Travado */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.lockedField}>
                <Text style={styles.lockedFieldText}>
                  {customerData.email || 'Carregando...'}
                </Text>
                <Ionicons name="lock-closed" size={16} color="#64748B" />
              </View>
            </View>

            {/* Telefone - Travado */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Telefone</Text>
              <View style={styles.lockedField}>
                <Text style={styles.lockedFieldText}>
                  {customerData.telefone || 'Não informado'}
                </Text>
                <Ionicons name="lock-closed" size={16} color="#64748B" />
              </View>
            </View>

            {/* Evento - Travado */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Evento</Text>
              <View style={styles.lockedField}>
                <Text style={styles.lockedFieldText}>Compra de AR</Text>
                <Ionicons name="lock-closed" size={16} color="#64748B" />
              </View>
            </View>

            <View style={styles.infoContainer}>
              <Ionicons name="information-circle-outline" size={22} color="#009EE3" />
              <Text style={styles.infoText}>
                Seus dados foram carregados automaticamente da sua conta. Para alterar, atualize seu perfil.
              </Text>
            </View>
          </View>

          {/* Erro */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Footer */}
        <Footer />
        
        {/* Botão de Pagamento Fixo */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <TouchableOpacity
              style={[
                styles.confirmButton, 
                isProcessing && styles.confirmButtonDisabled
              ]}
              onPress={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="lock-closed" size={18} color="white" />
                  <Text style={styles.confirmButtonText}>
                    Pagar com Mercado Pago
                  </Text>
                </>
              )}
            </TouchableOpacity>
            
            <Text style={styles.securityText}>
              <Ionicons name="shield-checkmark" size={14} color="#6B7280" />
              {' '}Pagamento 100% seguro via Mercado Pago
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 20, // Reduzido para acomodar a navbar
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
    marginBottom: 100, // Espaço para o footer fixo
  },
  totalContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  totalLabel: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10B981',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  requiredIndicator: {
    marginLeft: 12,
  },
  requiredText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  paymentMethodContainer: {
    marginTop: 8,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#009EE3',
  },
  paymentMethodIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  paymentMethodDescription: {
    fontSize: 12,
    color: '#64748B',
  },
  paymentMethodBadge: {
    backgroundColor: '#009EE3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paymentMethodBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  lockedField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
  },
  lockedFieldText: {
    fontSize: 16,
    color: '#1E293B',
    flex: 1,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
  },
  inputDisabled: {
    backgroundColor: '#F1F5F9',
    color: '#94A3B8',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#009EE3',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    marginTop: 0,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    backgroundColor: 'white',
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerContent: {
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    marginBottom: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmationContainer: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  successButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  successButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SandboxPagamento;