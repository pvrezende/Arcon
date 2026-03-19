import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './CarrinhoSidebar.styles';

interface Produto {
  id: string;
  modelo: string;
  marca: string;
  btu: string;
  preco: number;
  imagem?: string;
}

interface CarrinhoSidebarProps {
  open: boolean;
  onClose: () => void;
  carrinho: Produto[];
  onRemover: (index: number) => void;
  onFinalizar: () => void;
}

const { height, width } = Dimensions.get('window');

const CarrinhoSidebar: React.FC<CarrinhoSidebarProps> = ({
  open,
  onClose,
  carrinho,
  onRemover,
  onFinalizar,
}) => {
  const total = carrinho.reduce((acc, item) => acc + item.preco, 0);
  const totalFormatado = total.toFixed(2).replace('.', ',');

  return (
    <Modal
      visible={open}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdropTouchable} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={styles.sidebarContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerIcon}>
                <Ionicons name="cart" size={24} color="white" />
              </View>
              <View style={styles.headerTexts}>
                <Text style={styles.headerTitle}>Meu Carrinho</Text>
                <Text style={styles.headerSubtitle}>
                  {carrinho.length} {carrinho.length === 1 ? 'item' : 'itens'}
                </Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.content}>
          {/* Lista de Produtos */}
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {carrinho.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="cart-outline" size={48} color="#9CA3AF" />
                </View>
                <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
                <Text style={styles.emptySubtitle}>
                  Adicione produtos para começar sua compra
                </Text>
                <TouchableOpacity style={styles.continueButton} onPress={onClose}>
                  <Text style={styles.continueButtonText}>Continuar Comprando</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.itemsContainer}>
                {carrinho.map((item, idx) => (
                  <View key={idx} style={styles.itemCard}>
                    <View style={styles.itemContent}>
                      {/* Imagem do Produto */}
                      <View style={styles.itemImage}>
                        <Ionicons name="snow-outline" size={24} color="#666" />
                      </View>
                      
                      {/* Informações do Produto */}
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemModelo} numberOfLines={2}>
                          {item.modelo}
                        </Text>
                        
                        <View style={styles.itemBadges}>
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>{item.marca}</Text>
                          </View>
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>{item.btu} BTU</Text>
                          </View>
                        </View>
                        
                        <View style={styles.itemBottom}>
                          <Text style={styles.itemPreco}>
                            R$ {item.preco.toFixed(2).replace('.', ',')}
                          </Text>
                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => onRemover(idx)}
                          >
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer com Resumo e Checkout */}
          {carrinho.length > 0 && (
            <View style={styles.footer}>
              <View style={styles.summary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Subtotal ({carrinho.length} {carrinho.length === 1 ? 'item' : 'itens'})
                  </Text>
                  <Text style={styles.summaryValue}>R$ {totalFormatado}</Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Frete</Text>
                  <Text style={styles.summaryValueGreen}>Grátis</Text>
                </View>
                
                <View style={styles.separator} />
                
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>R$ {totalFormatado}</Text>
                </View>
              </View>

              {/* Botões de Ação */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.checkoutButton}
                  onPress={onFinalizar}
                  disabled={carrinho.length === 0}
                >
                  <Ionicons name="card" size={20} color="white" />
                  <Text style={styles.checkoutButtonText}>Finalizar Compra</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.continueShoppingButton} onPress={onClose}>
                  <Text style={styles.continueShoppingButtonText}>Continuar Comprando</Text>
                </TouchableOpacity>
              </View>

              {/* Garantias */}
              <View style={styles.guarantees}>
                <View style={styles.guaranteeItem}>
                  <View style={[styles.guaranteeDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.guaranteeText}>Compra Segura</Text>
                </View>
                <View style={styles.guaranteeItem}>
                  <View style={[styles.guaranteeDot, { backgroundColor: '#3B82F6' }]} />
                  <Text style={styles.guaranteeText}>Frete Grátis</Text>
                </View>
              </View>
            </View>
          )}
        </View>
        </View>
      </View>
    </Modal>
  );
};

export default CarrinhoSidebar;