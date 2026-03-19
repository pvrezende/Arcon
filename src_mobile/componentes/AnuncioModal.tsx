import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Produto {
  id: number;
  NOME: string;
  MARCA: string;
  ENDERECO: string;
  VALOR1: number;
  VALOR2: number;
  BTU: number;
  ESPPRO: string;
  TIPO: string;
  created_at?: string;
  VIEW?: number;
}

interface AnuncioModalProps {
  visible: boolean;
  produto: Produto | null;
  onClose: () => void;
  onEdit: (produto: Produto) => void;
  onDelete: (produto: Produto) => void;
}

const AnuncioModal: React.FC<AnuncioModalProps> = ({
  visible,
  produto,
  onClose,
  onEdit,
  onDelete
}) => {
  const screenWidth = Dimensions.get('window').width;

  if (!produto) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não disponível';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return 'Data não disponível';
    }
  };

  const calcularDesconto = () => {
    if (produto.VALOR1 > 0 && produto.VALOR2 > 0) {
      const desconto = ((produto.VALOR1 - produto.VALOR2) / produto.VALOR1) * 100;
      return Math.round(desconto);
    }
    return 0;
  };

  const desconto = calcularDesconto();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { maxWidth: Math.min(screenWidth * 0.95, 600) }]}>
          {/* Header do Modal */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={[
                styles.tipoBadge,
                produto.TIPO === 'NOVO' ? styles.tipoNovoModal : styles.tipoUsadoModal
              ]}>
                <Ionicons 
                  name={produto.TIPO === 'NOVO' ? 'sparkles' : 'refresh'} 
                  size={16} 
                  color="#fff" 
                />
                <Text style={styles.tipoBadgeText}>{produto.TIPO}</Text>
              </View>
            </View>
            
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Título Principal */}
            <Text style={styles.modalTitle}>{produto.NOME}</Text>
            <Text style={styles.modalMarca}>Marca: {produto.MARCA}</Text>

            {/* Informações Técnicas */}
            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <View style={styles.infoCardHeader}>
                  <Ionicons name="thermometer" size={20} color="#3b82f6" />
                  <Text style={styles.infoCardTitle}>Potência</Text>
                </View>
                <Text style={styles.infoCardValue}>{produto.BTU} BTU</Text>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoCardHeader}>
                  <Ionicons name="eye" size={20} color="#059669" />
                  <Text style={styles.infoCardTitle}>Visualizações</Text>
                </View>
                <Text style={styles.infoCardValue}>{produto.VIEW || 0}</Text>
              </View>
            </View>

            {/* Preços */}
            <View style={styles.precoSection}>
              <Text style={styles.precoSectionTitle}>Preço</Text>
              <View style={styles.precoContainer}>
                {produto.VALOR1 > 0 && produto.VALOR1 !== produto.VALOR2 && (
                  <>
                    <Text style={styles.precoOriginal}>
                      De: R$ {produto.VALOR1.toLocaleString('pt-BR')}
                    </Text>
                    {desconto > 0 && (
                      <View style={styles.descontoBadge}>
                        <Text style={styles.descontoText}>-{desconto}%</Text>
                      </View>
                    )}
                  </>
                )}
                <Text style={styles.precoFinal}>
                  R$ {produto.VALOR2.toLocaleString('pt-BR')}
                </Text>
              </View>
            </View>

            {/* Localização */}
            <View style={styles.localizacaoSection}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="location" size={16} color="#ef4444" /> Localização
              </Text>
              <Text style={styles.endereco}>{produto.ENDERECO}</Text>
            </View>

            {/* Especificações */}
            {produto.ESPPRO && (
              <View style={styles.especificacaoSection}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="document-text" size={16} color="#7c3aed" /> Especificações
                </Text>
                <Text style={styles.especificacao}>{produto.ESPPRO}</Text>
              </View>
            )}

            {/* Data de Criação */}
            <View style={styles.metaSection}>
              <Text style={styles.metaText}>
                <Ionicons name="calendar" size={14} color="#64748b" /> 
                Publicado em: {formatDate(produto.created_at)}
              </Text>
            </View>
          </ScrollView>

          {/* Botões de Ação */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                onEdit(produto);
                onClose();
              }}
            >
              <Ionicons name="pencil" size={20} color="#fff" />
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                onDelete(produto);
                onClose();
              }}
            >
              <Ionicons name="trash" size={20} color="#fff" />
              <Text style={styles.deleteButtonText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flex: 1,
  },
  tipoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  tipoNovoModal: {
    backgroundColor: '#0284c7',
  },
  tipoUsadoModal: {
    backgroundColor: '#d97706',
  },
  tipoBadgeText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 30,
  },
  modalMarca: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
    fontWeight: '500',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    fontWeight: '500',
  },
  infoCardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  precoSection: {
    marginBottom: 24,
  },
  precoSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  precoContainer: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#bbf7d0',
  },
  precoOriginal: {
    fontSize: 16,
    color: '#64748b',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  precoFinal: {
    fontSize: 28,
    fontWeight: '800',
    color: '#059669',
  },
  descontoBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  descontoText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  localizacaoSection: {
    marginBottom: 24,
  },
  endereco: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 22,
  },
  especificacaoSection: {
    marginBottom: 24,
  },
  especificacao: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  metaSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  metaText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AnuncioModal;