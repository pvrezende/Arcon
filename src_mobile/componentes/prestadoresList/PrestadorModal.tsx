import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_CONFIG } from '../../../configIp';

interface PrestadorDetalhes {
  id: string;
  nome: string;
  foto?: string;
  rating: number;
  servicosRealizados: number;
  descricao?: string;
  especialidades: string[];
  telefone?: string;
  email?: string;
  comentarios: Array<{
    id: string;
    clienteNome: string;
    clienteFoto?: string;
    rating: number;
    comentario: string;
    data: string;
  }>;
}

interface PrestadorModalProps {
  visible: boolean;
  prestadorId: string | null;
  onClose: () => void;
}

const PrestadorModal: React.FC<PrestadorModalProps> = ({ visible, prestadorId, onClose }) => {
  const [prestadorData, setPrestadorData] = React.useState<PrestadorDetalhes | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Debug para verificar se o modal está sendo chamado
  React.useEffect(() => {
    console.log('🔥 PrestadorModal - visible:', visible, 'prestadorId:', prestadorId);
  }, [visible, prestadorId]);

  // Buscar dados do prestador quando o modal abrir
  React.useEffect(() => {
    if (visible && prestadorId) {
      console.log('🚀 Modal abriu - iniciando busca dos dados');
      buscarDadosPrestador(prestadorId);
    } else if (visible && !prestadorId) {
      console.log('⚠️ Modal abriu mas prestadorId é null');
    }
  }, [visible, prestadorId]);

  const buscarDadosPrestador = async (id: string) => {
    try {
      console.log('🔄 Iniciando buscarDadosPrestador - setLoading(true)');
      setLoading(true);
      setError(null);
      
      console.log(`🔍 Fazendo fetch para: ${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.CHECK_PRESTADOR}/${id}`);
      const response = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.CHECK_PRESTADOR}/${id}`);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Resposta da API recebida:', data);
      
      if (data.cadastrado && data.data) {
        console.log('✅ Prestador cadastrado encontrado:', data.data.NOME);
        
        // Função para encontrar telefone em diferentes campos
        const encontrarTelefone = (dados: any) => {
          const camposTelefone = ['CELULAR', 'TELEFONE', 'PHONE', 'TEL', 'NUMERO', 'CONTATO'];
          for (const campo of camposTelefone) {
            if (dados[campo] && typeof dados[campo] === 'string' && dados[campo].trim()) {
              return dados[campo].trim();
            }
          }
          return null;
        };

        // Função para encontrar email em diferentes campos  
        const encontrarEmail = (dados: any) => {
          const camposEmail = ['CONFIRM_EMAIL', 'EMAIL', 'E_MAIL', 'MAIL', 'NOME_USER'];
          for (const campo of camposEmail) {
            if (dados[campo] && typeof dados[campo] === 'string' && dados[campo].trim()) {
              const email = dados[campo].trim();
              // Verificar se tem formato de email básico
              if (email.includes('@') && email.includes('.')) {
                return email;
              }
            }
          }
          return null;
        };

        const telefoneEncontrado = encontrarTelefone(data.data);
        const emailEncontrado = encontrarEmail(data.data);
        
        // Comentários mockados positivos
        const comentariosMockados = [
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
            rating: 4,
            comentario: "Ótimo trabalho! Resolveu o problema rapidamente e ainda deu dicas de manutenção. Profissional de confiança.",
            data: "10/07/2025"
          }
        ];

        // Mapear os dados do backend para nossa interface
        const prestadorInfo: PrestadorDetalhes = {
          id: id,
          nome: data.data.NOME || "Nome não informado",
          rating: 4.7, // Melhor rating baseado nos comentários positivos
          servicosRealizados: Math.floor(Math.random() * 100) + 25, // Mais serviços para parecer experiente
          descricao: `Prestador de serviços especializado em ${data.data.SERVICO || 'manutenção'}. Profissional qualificado e experiente com ótimas avaliações de clientes.`,
          especialidades: data.data.SERVICO ? [data.data.SERVICO] : ["Manutenção Geral"],
          telefone: telefoneEncontrado,
          email: emailEncontrado,
          comentarios: comentariosMockados
        };
        
        console.log('💾 Salvando dados do prestador no estado:', prestadorInfo);
        setPrestadorData(prestadorInfo);
      } else {
        console.log('❌ Prestador não cadastrado ou dados inválidos');
        throw new Error("Prestador não encontrado");
      }
      
    } catch (err) {
      console.error("Erro ao buscar dados do prestador:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      
      // Dados fallback em caso de erro com comentários mockados
      const comentariosFallback = [
        {
          id: "fallback1",
          clienteNome: "Cliente Exemplo",
          rating: 4,
          comentario: "Bom profissional, cumpriu com o combinado.",
          data: "01/09/2025"
        },
        {
          id: "fallback2",
          clienteNome: "Usuário Teste", 
          rating: 5,
          comentario: "Recomendo! Trabalho bem feito.",
          data: "20/08/2025"
        },
        {
          id: "fallback3",
          clienteNome: "Maria Exemplo",
          rating: 4,
          comentario: "Prestador pontual e competente.",
          data: "15/07/2025"
        }
      ];

      setPrestadorData({
        id: prestadorId || '1',
        nome: "Prestador não encontrado",
        rating: 4.3,
        servicosRealizados: 28,
        especialidades: ["Serviços Gerais"],
        comentarios: comentariosFallback
      });
    } finally {
      console.log('🏁 Finalizando busca - setLoading(false)');
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={16} color="#fbbf24" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={16} color="#fbbf24" />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={16} color="#d1d5db" />
        );
      }
    }
    return stars;
  };

  const getAvatarInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').substring(0, 2);
  };

  if (!prestadorId) return null;

  console.log('🎨 Renderizando modal - prestadorData:', prestadorData ? 'DADOS EXISTEM' : 'NULL/UNDEFINED');
  console.log('🎨 Estados: loading:', loading, 'error:', error, 'visible:', visible);
  
  if (prestadorData) {
    console.log('📋 Dados do prestador para renderização:', {
      nome: prestadorData.nome,
      especialidades: prestadorData.especialidades,
      telefone: prestadorData.telefone,
      email: prestadorData.email,
      comentarios: prestadorData.comentarios?.length || 0
    });
  }

  return (
    <Modal 
      visible={visible} 
      animationType="fade" 
      transparent={true} 
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Detalhes do Prestador</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0284c7" />
                <Text style={styles.loadingText}>Carregando dados do prestador...</Text>
                <Text style={[styles.loadingText, {fontSize: 12, marginTop: 10}]}>
                  Debug: ID {prestadorId}
                </Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#dc3545" />
                <Text style={styles.errorText}>{error}</Text>
                <Text style={[styles.errorText, {fontSize: 12, marginTop: 10}]}>
                  Debug: ID {prestadorId}
                </Text>
              </View>
            ) : prestadorData ? (
              <>
            {console.log('🎯 Renderizando conteúdo do prestador:', prestadorData.nome)}
            {/* Perfil do Prestador */}
            <View style={styles.profileSection}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  {prestadorData?.foto ? (
                    <Text>Foto aqui</Text>
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {prestadorData ? getAvatarInitials(prestadorData.nome) : "?"}
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.profileInfo}>
                  <Text style={styles.prestadorNome}>{prestadorData?.nome || "Carregando..."}</Text>
                  <View style={styles.ratingContainer}>
                    <View style={styles.starsContainer}>
                      {renderStars(prestadorData?.rating || 0)}
                    </View>
                    <Text style={styles.ratingText}>
                      {prestadorData?.rating || 0} • {prestadorData?.servicosRealizados || 0} serviços realizados
                    </Text>
                  </View>
                </View>
              </View>

              {prestadorData?.descricao && (
                <Text style={styles.descricao}>{prestadorData.descricao}</Text>
              )}
            </View>

            {/* Especialidades */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="construct-outline" size={20} color="#0284c7" />
                <Text style={styles.sectionTitle}>Especialidades</Text>
              </View>
              <View style={styles.especialidadesContainer}>
                {(prestadorData?.especialidades || []).map((especialidade, index) => (
                  <View key={index} style={styles.especialidadeTag}>
                    <Text style={styles.especialidadeText}>{especialidade}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Contato */}
           <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="call-outline" size={20} color="#0284c7" />
                <Text style={styles.sectionTitle}>Contato</Text>
            </View>
              <View style={styles.contatoContainer}>
                {prestadorData?.telefone ? (
                  <View style={styles.contatoItem}>
                    <Ionicons name="call" size={16} color="#64748b" />
                    <Text style={styles.contatoText}>{prestadorData.telefone}</Text>
                  </View>
                ) : (
                  <View style={styles.contatoItem}>
                    <Ionicons name="call" size={16} color="#94a3b8" />
                    <Text style={styles.contatoTextUnavailable}>Telefone não informado</Text>
                  </View>
                )}
                
                {prestadorData?.email ? (
                  <View style={styles.contatoItem}>
                    <Ionicons name="mail" size={16} color="#64748b" />
                    <Text style={styles.contatoText}>{prestadorData.email}</Text>
                  </View>
                ) : (
                  <View style={styles.contatoItem}>
                    <Ionicons name="mail" size={16} color="#94a3b8" />
                    <Text style={styles.contatoTextUnavailable}>Email não informado</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Avaliações */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="chatbubbles-outline" size={20} color="#0284c7" />
                <Text style={styles.sectionTitle}>
                  Avaliações ({(prestadorData?.comentarios || []).length})
                </Text>
              </View>
              
              {(prestadorData?.comentarios || []).map((comentario) => (
                <View key={comentario.id} style={styles.comentarioCard}>
                  <View style={styles.comentarioHeader}>
                    <View style={styles.clienteInfo}>
                      <Text style={styles.clienteNome}>{comentario.clienteNome}</Text>
                      <View style={styles.comentarioRating}>
                        {renderStars(comentario.rating)}
                      </View>
                    </View>
                    <Text style={styles.comentarioData}>{comentario.data}</Text>
                  </View>
                  <Text style={styles.comentarioTexto}>{comentario.comentario}</Text>
                </View>
              ))}
            </View>
            </>
            ) : (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Dados do prestador não encontrados</Text>
                <Text style={[styles.errorText, {fontSize: 12, marginTop: 10}]}>
                  Debug: prestadorData é null/undefined
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  profileSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#64748b',
  },
  profileInfo: {
    flex: 1,
  },
  prestadorNome: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'column',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#64748b',
  },
  descricao: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  especialidadesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  especialidadeTag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0284c7',
  },
  especialidadeText: {
    fontSize: 14,
    color: '#0284c7',
    fontWeight: '500',
  },
  contatoContainer: {
    gap: 12,
  },
  contatoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contatoText: {
    fontSize: 16,
    color: '#374151',
  },
  contatoTextUnavailable: {
    fontSize: 16,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  comentarioCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0284c7',
  },
  comentarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  comentarioRating: {
    flexDirection: 'row',
  },
  comentarioTexto: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
  },
  comentarioData: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default PrestadorModal;
