import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './ConfirmacaoPagamento.styles';

interface Produto {
  modelo: string;
  preco: number;
}

interface Pedido {
  numero: string;
  total: number;
  itens: number;
  data: string;
  produtos?: Produto[];
}

interface ConfirmacaoPagamentoProps {
  open: boolean;
  onClose: () => void;
  pedido: Pedido | null;
}

const ConfirmacaoPagamento: React.FC<ConfirmacaoPagamentoProps> = ({ 
  open, 
  onClose, 
  pedido 
}) => {
  const formatCurrency = (value: number): string => {
    return value.toFixed(2).replace('.', ',');
  };

  return (
    <Modal
      visible={open}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Pedido Confirmado!</Text>
          </View>
          
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              {/* Ícone de Sucesso */}
              <View style={styles.successIconContainer}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={40} color="#059669" />
                </View>
              </View>
              
              {/* Título e Mensagem */}
              <Text style={styles.successTitle}>
                🎉 Compra realizada com sucesso!
              </Text>
              
              <Text style={styles.successMessage}>
                Seu pedido foi processado e você receberá informações sobre a entrega em breve.
              </Text>
              
              {/* Detalhes do Pedido */}
              {pedido && (
                <View style={styles.orderDetails}>
                  <Text style={styles.orderDetailsTitle}>Detalhes do Pedido:</Text>
                  
                  <View style={styles.orderInfo}>
                    <View style={styles.orderRow}>
                      <Text style={styles.orderLabel}>Número do Pedido:</Text>
                      <Text style={styles.orderValue}>{pedido.numero}</Text>
                    </View>
                    
                    <View style={styles.orderRow}>
                      <Text style={styles.orderLabel}>Data:</Text>
                      <Text style={styles.orderValue}>{pedido.data}</Text>
                    </View>
                    
                    <View style={styles.orderRow}>
                      <Text style={styles.orderLabel}>Itens:</Text>
                      <Text style={styles.orderValue}>{pedido.itens} produto(s)</Text>
                    </View>
                    
                    <View style={styles.separator} />
                    
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total Pago:</Text>
                      <Text style={styles.totalValue}>
                        R$ {formatCurrency(pedido.total)}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Lista de Produtos */}
                  {pedido.produtos && pedido.produtos.length > 0 && (
                    <View style={styles.productsSection}>
                      <View style={styles.productsSeparator} />
                      <Text style={styles.productsTitle}>Produtos:</Text>
                      <View style={styles.productsList}>
                        {pedido.produtos.map((produto, index) => (
                          <View key={index} style={styles.productRow}>
                            <Text style={styles.productName} numberOfLines={1}>
                              {produto.modelo}
                            </Text>
                            <Text style={styles.productPrice}>
                              R$ {formatCurrency(produto.preco)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}
              
              {/* Mensagem Final */}
              <Text style={styles.finalMessage}>
                Você receberá um e-mail de confirmação em instantes.
              </Text>
            </View>
          </ScrollView>
          
          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.continueButton} onPress={onClose}>
              <Text style={styles.continueButtonText}>Continuar Navegando</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmacaoPagamento;

