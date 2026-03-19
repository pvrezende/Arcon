import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_CONFIG } from "../../../../configIp";

const { width: screenWidth } = Dimensions.get("window");

interface PerfilPrestadorModalProps {
  visible: boolean;
  prestadorId: string | null;
  onClose: () => void;
}

interface PrestadorData {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  tipo_prestador?: string;
  area_atuacao?: string;
  categoria_loja?: string;
}

interface Comentario {
  id: string;
  clienteNome: string;
  rating: number;
  comentario: string;
  data: string;
}

const PerfilPrestadorModal: React.FC<PerfilPrestadorModalProps> = ({
  visible,
  prestadorId,
  onClose,
}) => {
  const [prestadorData, setPrestadorData] = useState<PrestadorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);

  // Monitorar mudanças na largura da tela
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Função para gerar estilos dinâmicos baseados na largura da tela
  const getDynamicStyles = () => {
    const isMobile = screenWidth < 768;
    
    return {
      modalOverlay: {
        paddingHorizontal: isMobile ? 10 : 20,
      },
      modalContainer: {
        borderRadius: isMobile ? 16 : 20,
        width: isMobile ? screenWidth - 20 : 600,
        maxHeight: isMobile ? "95%" : "80%",
      },
      modalHeader: {
        padding: isMobile ? 16 : 20,
      },
      modalTitle: {
        fontSize: isMobile ? 18 : 20,
      },
      infoSection: {
        padding: isMobile ? 16 : 20,
      },
      prestadorNome: {
        fontSize: isMobile ? 20 : 24,
      },
      statsSection: {
        padding: isMobile ? 16 : 20,
      },
      comentariosSection: {
        padding: isMobile ? 16 : 20,
      },
      comentarioItem: {
        padding: isMobile ? 12 : 16,
      },
    };
  };

  const dynamicStyles = getDynamicStyles();

  // Comentários mockados
  const comentariosMockados: Comentario[] = [
    {
      id: "mock1",
      clienteNome: "Maria Santos",
      rating: 5,
      comentario: "Excelente profissional! Chegou no horário combinado, trabalho impecável e preço justo. Super recomendo!",
      data: "15/09/2025"
    },
    {
      id: "mock2", 
      clienteNome: "João Silva",
      rating: 5,
      comentario: "Muito satisfeito com o serviço. Prestador competente, educado e deixou tudo funcionando perfeitamente. Voltaria a contratar com certeza!",
      data: "28/08/2025"
    },
    {
      id: "mock3",
      clienteNome: "Ana Costa",
      rating: 5,
      comentario: "Ótimo trabalho! Resolveu o problema rapidamente e ainda deu dicas de manutenção. Profissional de confiança.",
      data: "10/07/2025"
    },
    {
      id: "mock4",
      clienteNome: "Carlos Oliveira",
      rating: 5,
      comentario: "Serviço de qualidade excepcional. Prestador muito atencioso e detalhista. Recomendo para todos!",
      data: "05/06/2025"
    },
    {
      id: "mock5",
      clienteNome: "Fernanda Lima",
      rating: 5,
      comentario: "Profissional exemplar! Trabalho rápido, eficiente e com preço justo. Já contratei várias vezes.",
      data: "20/05/2025"
    }
  ];

  const buscarDadosPrestador = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_CONFIG.BACKEND_URL}/prestador/${id}`);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.prestador) {
        const prestador = data.prestador;
        
        // Mapear os dados do backend para nossa interface
        const prestadorInfo: PrestadorData = {
          id: id,
          nome: prestador.NOME || "Nome não informado",
          telefone: prestador.TELEFONE || prestador.telefone,
          email: prestador.EMAIL || prestador.email,
          tipo_prestador: prestador.TIPO_PRESTADOR || prestador.tipo_prestador,
          area_atuacao: prestador.AREA_ATUACAO || prestador.area_atuacao,
          categoria_loja: prestador.CATEGORIA_LOJA || prestador.categoria_loja,
        };
        
        setPrestadorData(prestadorInfo);
      } else {
        throw new Error("Prestador não encontrado");
      }
    } catch (err) {
      console.error("Erro ao buscar dados do prestador:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      
      // Fallback com dados mockados em caso de erro
      setPrestadorData({
        id: id,
        nome: "Prestador",
        telefone: "(11) 99999-9999",
        email: "prestador@exemplo.com",
        tipo_prestador: "MANUAL",
        area_atuacao: "Manutenção Geral",
        categoria_loja: "Serviços Técnicos"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && prestadorId) {
      buscarDadosPrestador(prestadorId);
    }
  }, [visible, prestadorId]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? "star" : "star-outline"}
        size={16}
        color="#FFD700"
        style={styles.star}
      />
    ));
  };

  const renderComentario = (comentario: Comentario) => (
    <View key={comentario.id} style={[styles.comentarioItem, dynamicStyles.comentarioItem]}>
      <View style={styles.comentarioHeader}>
        <Text style={styles.clienteNome}>{comentario.clienteNome}</Text>
        <View style={styles.ratingContainer}>
          {renderStars(comentario.rating)}
        </View>
      </View>
      <Text style={styles.comentarioTexto}>{comentario.comentario}</Text>
      <Text style={styles.comentarioData}>{comentario.data}</Text>
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, dynamicStyles.modalOverlay]}>
        <View style={[styles.modalContainer, dynamicStyles.modalContainer]}>
          {/* Header */}
          <View style={[styles.modalHeader, dynamicStyles.modalHeader]}>
            <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>Perfil do Prestador</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0284c7" />
              <Text style={styles.loadingText}>Carregando dados...</Text>
            </View>
          ) : error && !prestadorData ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#ef4444" />
              <Text style={styles.errorText}>Erro ao carregar dados</Text>
              <Text style={styles.errorSubText}>{error}</Text>
            </View>
          ) : prestadorData ? (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Informações Básicas */}
              <View style={[styles.infoSection, dynamicStyles.infoSection]}>
                <View style={styles.avatarContainer}>
                  <Ionicons name="person-circle" size={80} color="#0284c7" />
                </View>
                
                <Text style={[styles.prestadorNome, dynamicStyles.prestadorNome]}>{prestadorData.nome}</Text>
                
                <View style={styles.ratingSection}>
                  <View style={styles.ratingContainer}>
                    {renderStars(5)}
                  </View>
                  <Text style={styles.ratingText}>5.0 (25 avaliações)</Text>
                </View>


                {/* Especialidades */}
                <View style={styles.especialidadesSection}>
                  <Text style={styles.sectionTitle}>Especialidades</Text>
                  <View style={styles.especialidadesContainer}>
                    <View style={styles.especialidadeTag}>
                      <Text style={styles.especialidadeText}>
                        {prestadorData.area_atuacao || "Manutenção Geral"}
                      </Text>
                    </View>
                    {prestadorData.categoria_loja && (
                      <View style={styles.especialidadeTag}>
                        <Text style={styles.especialidadeText}>
                          {prestadorData.categoria_loja}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Estatísticas */}
              <View style={[styles.statsSection, dynamicStyles.statsSection]}>
                <Text style={styles.sectionTitle}>Estatísticas</Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>150+</Text>
                    <Text style={styles.statLabel}>Serviços Realizados</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>5.0</Text>
                    <Text style={styles.statLabel}>Avaliação Média</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>98%</Text>
                    <Text style={styles.statLabel}>Taxa de Sucesso</Text>
                  </View>
                </View>
              </View>

              {/* Comentários */}
              <View style={[styles.comentariosSection, dynamicStyles.comentariosSection]}>
                <Text style={styles.sectionTitle}>Avaliações dos Clientes</Text>
                {comentariosMockados.map(renderComentario)}
              </View>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontWeight: "bold",
    color: "#1e293b",
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ef4444",
    marginTop: 16,
  },
  errorSubText: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
    textAlign: "center",
  },
  modalContent: {
    flex: 1,
  },
  infoSection: {
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  prestadorNome: {
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 12,
    textAlign: "center",
  },
  ratingSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 4,
  },
  star: {
    marginHorizontal: 2,
  },
  ratingText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  especialidadesSection: {
    width: "100%",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 12,
  },
  especialidadesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  especialidadeTag: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#0284c7",
  },
  especialidadeText: {
    fontSize: 12,
    color: "#0284c7",
    fontWeight: "600",
  },
  statsSection: {
    backgroundColor: "#f8fafc",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0284c7",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginTop: 4,
  },
  comentariosSection: {
    // Padding será aplicado dinamicamente
  },
  comentarioItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  comentarioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  clienteNome: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e293b",
  },
  comentarioTexto: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 8,
  },
  comentarioData: {
    fontSize: 12,
    color: "#9ca3af",
  },
});

export default PerfilPrestadorModal;
