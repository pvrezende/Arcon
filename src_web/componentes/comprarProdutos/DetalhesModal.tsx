import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './DetalhesModal.styles';

interface Loja {
  nome: string;
  avaliacao: number;
  avaliacoes: number;
  endereco: string;
}

interface Produto {
  id: string;
  modelo: string;
  marca: string;
  btu: string;
  caracteristicas: string[];
  preco: number;
  precoOriginal?: number;
  desconto: number;
  frete: string;
  disponivel: boolean;
  loja: Loja;
  descricaoCompleta?: string;
}

interface DetalhesModalProps {
  open: boolean;
  onClose: () => void;
  produto: Produto | null;
}

const { height } = Dimensions.get('window');

const DetalhesModal: React.FC<DetalhesModalProps> = ({ open, onClose, produto }) => {
  if (!produto) return null;

  const formatarPreco = (preco: number): string => {
    return preco.toFixed(2).replace('.', ',');
  };

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
          <Text style={styles.headerTitle} numberOfLines={2}>
            {produto.modelo}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Imagem do produto */}
          <View style={styles.imageContainer}>
            <View style={styles.imagePlaceholder}>
              <Ionicons name="snow-outline" size={60} color="#666" />
            </View>
          </View>

          {/* Informações básicas */}
          <View style={styles.contentContainer}>
            <View style={styles.infoGrid}>
              {/* Especificações */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Especificações</Text>
                <View style={styles.specContainer}>
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Marca:</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{produto.marca}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Capacidade:</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{produto.btu} BTU</Text>
                    </View>
                  </View>
                  
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Disponibilidade:</Text>
                    <View style={[
                      styles.badge,
                      produto.disponivel ? styles.badgeAvailable : styles.badgeUnavailable
                    ]}>
                      <Text style={[
                        styles.badgeText,
                        produto.disponivel ? styles.badgeTextAvailable : styles.badgeTextUnavailable
                      ]}>
                        {produto.disponivel ? 'Disponível' : 'Indisponível'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Preço */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Preço</Text>
                <View style={styles.priceContainer}>
                  {produto.precoOriginal && produto.precoOriginal > produto.preco && (
                    <Text style={styles.originalPrice}>
                      De: R$ {formatarPreco(produto.precoOriginal)}
                    </Text>
                  )}
                  
                  <Text style={styles.currentPrice}>
                    R$ {formatarPreco(produto.preco)}
                  </Text>
                  
                  {produto.desconto > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>-{produto.desconto}% OFF</Text>
                    </View>
                  )}
                  
                  <View style={styles.shippingInfo}>
                    <Ionicons name="car" size={16} color="#666" />
                    <Text style={styles.shippingText}>Frete: {produto.frete}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Descrição Completa */}
            {produto.descricaoCompleta && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Descrição</Text>
                <Text style={styles.descriptionText}>{produto.descricaoCompleta}</Text>
              </View>
            )}


            {/* Características */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Características</Text>
              <View style={styles.characteristicsContainer}>
                {produto.caracteristicas.map((caracteristica, index) => (
                  <View key={index} style={styles.characteristicBadge}>
                    <Text style={styles.characteristicText}>{caracteristica}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Informações da loja */}
            {produto.loja && (
              <View style={styles.storeSection}>
                <View style={styles.storeTitleContainer}>
                  <Ionicons 
                  name="shield-checkmark" 
                  size={14} 
                  color="#666"
                  style={{ marginBottom: 10 }}
                  />
                  <Text style={styles.sectionTitle}>Vendido por</Text>
                </View>
                
                <View style={styles.storeInfo}>
                  <View style={styles.storeHeader}>
                    <Text style={styles.storeName}>{produto.loja.nome}</Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.ratingValue}>{produto.loja.avaliacao}</Text>
                      <Text style={styles.ratingCount}>({produto.loja.avaliacoes})</Text>
                    </View>
                  </View>
                  
                  <View style={styles.addressContainer}>
                    <Ionicons name="location" size={16} color="#666" />
                    <Text style={styles.addressText}>{produto.loja.endereco}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.closeFooterButton} onPress={onClose}>
            <Text style={styles.closeFooterButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default DetalhesModal;

