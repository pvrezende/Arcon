import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ServiceInfoModalProps {
  visible: boolean;
  onClose: () => void;
  serviceData: {
    cliente: string;
    marca: string;
    servico: string;
    tag: string;
    distancia: string;
    tipo?: string;
    id_prestador?: string;
  };
  prestadorId?: string | null;
}

const ServiceInfoModal: React.FC<ServiceInfoModalProps> = ({
  visible,
  onClose,
  serviceData,
  prestadorId,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768;

  // Determinar tipo de serviço - LÓGICA CORRIGIDA
  const getTipoServico = () => {
    // Se id_prestador for null/undefined = DISPONÍVEL PARA TODOS
    if (!serviceData.id_prestador || serviceData.id_prestador === null || serviceData.id_prestador === 'null') {
      return { 
        tipo: "DISPONÍVEL", 
        cor: "#059669", 
        texto: "DISPONÍVEL",
        descricao: "Disponível para todos",
        icon: "globe" as const,
        badgeIcon: "earth" as const
      };
    }
    
    // Se id_prestador for igual ao prestador atual = EXCLUSIVO
    if (String(serviceData.id_prestador) === String(prestadorId)) {
      return { 
        tipo: "EXCLUSIVO", 
        cor: "#dc2626", 
        texto: "EXCLUSIVO",
        descricao: "Proposta Premium - Enviado especialmente para você",
        icon: "lock-closed" as const,
        badgeIcon: "star" as const
      };
    }
    
    // Caso contrário (não deveria acontecer após o filtro) = DISPONÍVEL
    return { 
      tipo: "DISPONÍVEL", 
      cor: "#059669", 
      texto: "DISPONÍVEL",
      descricao: "Disponível para todos",
      icon: "globe" as const,
      badgeIcon: "earth" as const
    };
  };

  const tipoServico = getTipoServico();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContainer,
          isMobile && styles.modalContainerMobile
        ]}>
          {/* Header do Modal */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="information-circle" size={24} color="#fff" />
              </View>
              <Text style={styles.modalTitle}>Informações do Serviço</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Conteúdo do Modal */}
          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Status do Serviço */}
            <View style={styles.statusSection}>
              <View style={styles.statusHeader}>
                <Ionicons name="shield-checkmark" size={20} color="#0284c7" />
                <Text style={styles.sectionTitle}>Status do Serviço</Text>
              </View>
              <View style={[styles.tipoBadge, { backgroundColor: tipoServico.cor }]}>
                <Ionicons name={tipoServico.badgeIcon} size={16} color="#fff" />
                <Text style={styles.tipoText}>{tipoServico.texto}</Text>
              </View>
              <Text style={styles.statusDescription}>{tipoServico.descricao}</Text>
            </View>

            {/* Descrição do Serviço */}
            <View style={styles.descricaoSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text" size={20} color="#0284c7" />
                <Text style={styles.sectionTitle}>Descrição do Serviço</Text>
              </View>
              <View style={styles.descricaoContainer}>
                <Text style={styles.descricaoText}>{serviceData.servico}</Text>
              </View>
            </View>

            {/* Informações do Cliente */}
            <View style={styles.infoSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person-circle" size={20} color="#0284c7" />
                <Text style={styles.sectionTitle}>Informações do Cliente</Text>
              </View>
              
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons name="person" size={18} color="#0284c7" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Nome do Cliente</Text>
                  <Text style={styles.infoValue}>{serviceData.cliente}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons name="business" size={18} color="#0284c7" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Marca</Text>
                  <Text style={styles.infoValue}>{serviceData.marca}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons name="location" size={18} color="#0284c7" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Distância</Text>
                  <Text style={styles.infoValue}>{serviceData.distancia}</Text>
                </View>
              </View>
            </View>

            {/* Tags */}
            {serviceData.tag && (
              <View style={styles.tagsSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="pricetag" size={20} color="#0284c7" />
                  <Text style={styles.sectionTitle}>Categorias</Text>
                </View>
                <View style={styles.tagsContainer}>
                  {serviceData.tag.split(", ").map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer do Modal */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeModalButtonText}>Fechar</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContainerMobile: {
    maxWidth: '95%',
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    backgroundColor: '#0284c7',
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
    shadowColor: '#0284c7',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusSection: {
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0284c7',
    marginLeft: 8,
  },
  tipoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  tipoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusDescription: {
    fontSize: 14,
    color: '#0369a1',
    fontWeight: '500',
  },
  descricaoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  descricaoContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  descricaoText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
    lineHeight: 22,
    textAlign: 'left',
  },
  infoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  infoIcon: {
    backgroundColor: '#f0f9ff',
    borderRadius: 10,
    padding: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  tagsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  tagText: {
    color: '#0369a1',
    fontWeight: '600',
    fontSize: 12,
  },
  modalFooter: {
    padding: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  closeModalButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0284c7',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  closeModalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default ServiceInfoModal;
