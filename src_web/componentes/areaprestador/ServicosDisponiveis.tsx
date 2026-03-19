import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface ServicosDisponiveisProps {
  servicos: any[];
  onServicoSelecionado?: (servico: any) => void;
  servicoAtivo?: any;
  onServicoArrastado?: (servico: any) => void;
  prestadorId?: string | null;
}

const ServicosDisponiveis: React.FC<ServicosDisponiveisProps> = ({
  servicos,
  onServicoSelecionado,
  servicoAtivo,
  onServicoArrastado,
  prestadorId,
}) => {
  const getTipoServico = (servico: any) => {
    // Se id_prestador for null/undefined = DISPONÍVEL PARA TODOS
    if (!servico.id_prestador || servico.id_prestador === null || servico.id_prestador === 'null') {
      return { 
        tipo: "DISPONÍVEL", 
        cor: "#059669", 
        texto: "DISPONÍVEL",
        icon: "globe" as const
      };
    }
    
    // Se id_prestador for igual ao prestador atual = EXCLUSIVO
    if (String(servico.id_prestador) === String(prestadorId)) {
      return { 
        tipo: "EXCLUSIVO", 
        cor: "#dc2626", 
        texto: "EXCLUSIVO",
        icon: "lock-closed" as const
      };
    }
    
    // Caso contrário (não deveria acontecer após o filtro) = DISPONÍVEL
    return { 
      tipo: "DISPONÍVEL", 
      cor: "#059669", 
      texto: "DISPONÍVEL",
      icon: "globe" as const
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="list-circle" size={24} color="#0284c7" />
          <Text style={styles.title}>Serviços Disponíveis ({servicos.length})</Text>
        </View>
        <Text style={styles.subtitle}>
          Encontre e gerencie seus serviços de forma simples
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {servicos.map((servico, index) => {
          const tipoServico = getTipoServico(servico);
          const isAtivo = servicoAtivo?.id === servico.id;
          
          return (
            <TouchableOpacity
              key={servico.id.toString()}
              style={[
                styles.servicoCard,
                isAtivo && styles.servicoCardAtivo
              ]}
              onPress={() => onServicoSelecionado?.(servico)}
              activeOpacity={0.7}
            >
              <View style={styles.servicoHeader}>
                <View style={styles.servicoInfo}>
                  <Text style={styles.servicoCliente} numberOfLines={1}>
                    {servico.cliente}
                  </Text>
                </View>
                
                <View style={[styles.tipoBadge, { backgroundColor: tipoServico.cor }]}>
                  <Ionicons name={tipoServico.icon} size={12} color="#fff" />
                  <Text style={styles.tipoText}>{tipoServico.texto}</Text>
                </View>
              </View>

              <View style={styles.servicoDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="business" size={14} color="#64748b" />
                  <Text style={styles.detailText}>{servico.marca}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="location" size={14} color="#64748b" />
                  <Text style={styles.detailText}>2km</Text>
                </View>
              </View>

              <View style={styles.tagsContainer}>
                {servico.tag.split(", ").slice(0, 1).map((tag: string, tagIndex: number) => (
                  <View key={tagIndex} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              {isAtivo && (
                <View style={styles.ativoIndicatorBottom}>
                  <Ionicons name="checkmark-circle" size={16} color="#0284c7" />
                  <Text style={styles.ativoText}>Selecionado</Text>
                </View>
              )}

              <TouchableOpacity 
                style={styles.dragButton}
                onPress={() => onServicoArrastado?.(servico)}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle" size={20} color="#10b981" />
                <Text style={styles.dragButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    margin: screenWidth < 768 ? 16 : 20,
    marginTop: 0,
    borderRadius: screenWidth < 768 ? 12 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    maxHeight: screenWidth < 768 ? 400 : 600,
  },
  header: {
    padding: screenWidth < 768 ? 16 : 20,
    paddingBottom: screenWidth < 768 ? 12 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  title: {
    fontSize: screenWidth < 768 ? 16 : 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: screenWidth < 768 ? 12 : 14,
    color: '#64748b',
    lineHeight: screenWidth < 768 ? 16 : 20,
  },
  scrollContainer: {
    maxHeight: screenWidth < 768 ? 300 : 700,
  },
  scrollContent: {
    padding: screenWidth < 768 ? 12 : 16,
    paddingTop: screenWidth < 768 ? 6 : 8,
  },
  servicoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: screenWidth < 768 ? 8 : 12,
    padding: screenWidth < 768 ? 12 : 16,
    marginBottom: screenWidth < 768 ? 8 : 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  servicoCardAtivo: {
    backgroundColor: '#eff6ff',
    borderColor: '#0284c7',
    borderWidth: 2,
  },
  servicoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  servicoInfo: {
    flex: 1,
    marginRight: 12,
  },
  servicoTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  servicoCliente: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  tipoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tipoText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  servicoDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  ativoIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  ativoIndicatorBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#0284c7',
  },
  ativoText: {
    fontSize: 10,
    color: '#0284c7',
    fontWeight: '600',
  },
  dragButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  dragButtonText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default ServicosDisponiveis;
