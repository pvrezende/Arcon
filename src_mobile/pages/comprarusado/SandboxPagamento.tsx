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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './SandboxPagamento.styles';

interface SandboxPagamentoProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalValue?: number;
}

type PaymentMethod = 'credit' | 'debit' | 'pix';

const SandboxPagamento: React.FC<SandboxPagamentoProps> = ({
  open,
  onClose,
  onConfirm,
  totalValue = 0,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit');
  const [installments, setInstallments] = useState(1);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [pixCode, setPixCode] = useState('');

  useEffect(() => {
    if (!open) {
      clearFields();
    } else {
      generatePixCode();
    }
  }, [open]);

  const clearFields = () => {
    setCardNumber('');
    setCardName('');
    setExpiryDate('');
    setCvv('');
    setPaymentMethod('credit');
    setInstallments(1);
    setError('');
    setIsProcessing(false);
    setConfirmationOpen(false);
    setPixCode('');
  };

  const generatePixCode = () => {
    const timestamp = Date.now().toString().slice(-8);
    setPixCode(`00020126580014BR.GOV.BCB.PIX01360123456789${timestamp}5204000053039865802BR5925LOJA EXEMPLO6009SAO PAULO6304`);
  };

  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string): string => {
    const v = value.replace(/\\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  const validateCard = (): string | null => {
    const cardNumberClean = cardNumber.replace(/\\s/g, '');
    
    if (paymentMethod !== 'pix') {
      if (!cardName.trim()) {
        return 'Nome no cartão é obrigatório.';
      }
      
      if (cardNumberClean.length < 13 || cardNumberClean.length > 19) {
        return 'Número do cartão deve ter entre 13 e 19 dígitos.';
      }
      
      if (!/^[0-9]+$/.test(cardNumberClean)) {
        return 'Número do cartão deve conter apenas números.';
      }
      
      if (expiryDate.length !== 5 || !expiryDate.includes('/')) {
        return 'Data de expiração deve estar no formato MM/AA.';
      }
      
      if (cvv.length !== 3 || !/^[0-9]+$/.test(cvv)) {
        return 'CVV deve ter 3 dígitos.';
      }
    }
    
    return null;
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    if (formatted.replace(/\\s/g, '').length <= 19) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryDateChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    if (formatted.length <= 5) {
      setExpiryDate(formatted);
    }
  };

  const handleCvvChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (cleanValue.length <= 3) {
      setCvv(cleanValue);
    }
  };

  const handleNameChange = (value: string) => {
    const cleanValue = value.replace(/[^a-zA-Z\\s]/g, '').toUpperCase();
    if (cleanValue.length <= 30) {
      setCardName(cleanValue);
    }
  };

  const handleConfirm = () => {
    const validationError = validateCard();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (paymentMethod === 'pix' && totalValue <= 0) {
      setError('Valor inválido para pagamento PIX.');
      return;
    }

    setError('');
    setIsProcessing(true);

    const processingTime = paymentMethod === 'pix' ? 1000 : 2500;
    
    setTimeout(() => {
      setIsProcessing(false);
      setConfirmationOpen(true);
    }, processingTime);
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
              <Ionicons name="checkmark-circle" size={60} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Pagamento Aprovado!</Text>
            <Text style={styles.successMessage}>
              Sua compra foi processada com sucesso.
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Finalizar Pagamento</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Valor Total */}
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
              {[
                { key: 'credit', label: 'Cartão de Crédito', icon: 'card' },
                { key: 'debit', label: 'Cartão de Débito', icon: 'card' },
                { key: 'pix', label: 'PIX', icon: 'flash' },
              ].map((method) => (
                <TouchableOpacity
                  key={method.key}
                  style={[
                    styles.paymentMethodButton,
                    paymentMethod === method.key && styles.paymentMethodButtonActive,
                  ]}
                  onPress={() => setPaymentMethod(method.key as PaymentMethod)}
                >
                  <Ionicons
                    name={method.icon as any}
                    size={20}
                    color={paymentMethod === method.key ? '#2563EB' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.paymentMethodText,
                      paymentMethod === method.key && styles.paymentMethodTextActive,
                    ]}
                  >
                    {method.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Formulário do Cartão */}
          {paymentMethod !== 'pix' && (
            <View style={styles.section}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nome no Cartão</Text>
                <TextInput
                  style={styles.input}
                  placeholder="NOME COMPLETO"
                  value={cardName}
                  onChangeText={handleNameChange}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Número do Cartão</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChangeText={handleCardNumberChange}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Validade</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/AA"
                    value={expiryDate}
                    onChangeText={handleExpiryDateChange}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>

                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="000"
                    value={cvv}
                    onChangeText={handleCvvChange}
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>
          )}

          {/* PIX */}
          {paymentMethod === 'pix' && (
            <View style={styles.section}>
              <View style={styles.pixContainer}>
                <Ionicons name="qr-code" size={100} color="#6B7280" />
                <Text style={styles.pixTitle}>Pagamento PIX</Text>
                <Text style={styles.pixSubtitle}>
                  Escaneie o QR Code ou copie o código abaixo
                </Text>
                <View style={styles.pixCodeContainer}>
                  <Text style={styles.pixCode} numberOfLines={3}>
                    {pixCode}
                  </Text>
                  <TouchableOpacity style={styles.copyButton}>
                    <Ionicons name="copy" size={16} color="#2563EB" />
                    <Text style={styles.copyButtonText}>Copiar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Erro */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.confirmButton, isProcessing && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.confirmButtonText}>
                {paymentMethod === 'pix' ? 'Aguardar Pagamento' : 'Confirmar Pagamento'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SandboxPagamento;