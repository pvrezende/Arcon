import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Navbar from "../../componentes/navbar";
import Footer from "../../componentes/footer";
import PropostaCard from "../../componentes/propostaCliente/propostaCard";
import PrestadorModal from "../../componentes/prestadoresList/PrestadorModal";
import { API_CONFIG } from "../../../configIp";
import { useAuth } from "../../hooks/useAuth";

interface PropostaData {
  id: number;
  servicos: string;
  prestador: string;
  valor: string;
  data: string;
  horario: string;
  prestador_id: string;
  solicitacao_id: number;
}

interface DatabaseItem {
  id_proposta: number;
  solicitacao_id: number;
  prestador_id: number;
  prestador_nome: string;
  cliente_nome: string;
  valor: number;
  descricao?: string;
  mensagem?: string;
  servico: string;
  tag?: string;
  marca?: string;
  data_envio: string;
  status_proposta: string;
}

const PropostaCliente = ({ navigation, route }: any) => {
  const [propostasData, setPropostasData] = useState<PropostaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPrestadorId, setSelectedPrestadorId] = useState<string | null>(null);
  
  // Usar o hook de autenticação unificado
  const { user, userData, loading: authLoading } = useAuth();

  // Função para voltar para a tela anterior
  const goToHome = () => {
    // Tenta voltar para a tela anterior
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Se não houver tela anterior, vai para Home
      navigation.navigate("Home");
    }
  };

  // Verificar autenticação usando o hook unificado
  useEffect(() => {
    if (!authLoading) {
      if (!user || !userData) {
        setLoading(false);
        setError("Usuário não autenticado. Faça login novamente.");
       
      } else {
      }
    }
  }, [authLoading, user, userData]);

  const formatarData = (dataString: string) => {
    if (!dataString) return "Data não informada";
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString("pt-BR");
    } catch {
      return "Data inválida";
    }
  };

  const formatarHorario = (dataString: string) => {
    if (!dataString) return "Horário não informado";
    try {
      const data = new Date(dataString);
      return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Horário inválido";
    }
  };

  const formatarValor = (valor: string | number): string => {
    if (!valor) return "Valor não informado";
    
    try {
      // Converte para número se for string
      const valorNum = typeof valor === 'string' ? parseFloat(valor) : valor;
      
      // Verifica se é um número válido
      if (isNaN(valorNum)) return "Valor inválido";
      
      // Formata como moeda brasileira
      return valorNum.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
    } catch (error) {
      return "Valor inválido";
    }
  };

  const buscarNomeUsuario = async (userId: string): Promise<string> => {
    try {
      
      // Primeiro tenta buscar como prestador na tabela prestadores
      const prestadorResponse = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.CHECK_PRESTADOR}/${userId}`);
      
      if (prestadorResponse.ok) {
        const prestadorData = await prestadorResponse.json();
        
        if (prestadorData.cadastrado && prestadorData.data) {
          // Verifica diferentes possíveis nomes de campos
          const nome = prestadorData.data.NOME || prestadorData.data.nome || prestadorData.data.Nome || 
                      prestadorData.data.name || prestadorData.data.NAME || prestadorData.data.user_name ||
                      prestadorData.data.userName || prestadorData.data.nome_usuario;
          
          if (nome) {
            return nome;
          }
        }
      }
      
      // Se não encontrou como prestador, tenta buscar na tabela usuarios via endpoint genérico
    
      const usuarioResponse = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.DADOS}?id_prestador=${userId}`);
      
      if (usuarioResponse.ok) {
        const usuarioData = await usuarioResponse.json();
      
        
        if (usuarioData) {
          // Verifica diferentes possíveis nomes de campos
          const nome = usuarioData.nome || usuarioData.NOME || usuarioData.Nome || 
                      usuarioData.name || usuarioData.NAME || usuarioData.user_name ||
                      usuarioData.userName || usuarioData.nome_usuario || usuarioData.CLIENTE;
          
          if (nome) {
       
            return nome;
          }
        }
      }
      
  
      return `Usuário ${userId}`;
    } catch (error) {
      console.error(`❌ Erro ao buscar nome do usuário ${userId}:`, error);
      return `Usuário ${userId}`;
    }
  };

  const fetchPropostas = async () => {
    if (!user || !userData) {
      setError("Usuário não identificado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userId = userData.id_usuario || userData.id;

      
      //  AGORA COM user_id NA URL - apenas propostas do usuário logado
      const response = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.PROPOSTAS}/${userId}`);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data: DatabaseItem[] = await response.json();
    

      // Filtra apenas propostas ativas (status_proposta = 'enviada')
      const propostasCompletas = data.filter((item: DatabaseItem) => 
        item.id_proposta && 
        item.solicitacao_id && 
        item.servico && 
        item.valor &&
        item.status_proposta === 'enviada' // Só mostra propostas enviadas aguardando decisão
      );

      // Mapear os dados e buscar nomes dos prestadores quando necessário
      const propostasFormatadas: PropostaData[] = await Promise.all(
        propostasCompletas.map(async (item: DatabaseItem) => {
          
          let nomePrestador = item.prestador_nome;
          
          // Só busca o nome se não vier do backend ou se for "Prestador não encontrado"
          if (item.prestador_id && (!nomePrestador || nomePrestador === "Prestador não encontrado" || nomePrestador === "Prestador não identificado")) {
            try {
              nomePrestador = await buscarNomeUsuario(item.prestador_id.toString());
            } catch (error) {
              console.error("Erro ao buscar nome do usuário:", error);
              nomePrestador = item.prestador_nome || `Usuário ${item.prestador_id}`;
            }
          } else if (!nomePrestador) {
            nomePrestador = "Prestador não identificado";
          }

          const proposta = {
            id: item.id_proposta,
            servicos: item.servico,
            prestador: nomePrestador,
            valor: formatarValor(item.valor),
            data: formatarData(item.data_envio || new Date().toISOString()),
            horario: formatarHorario(item.data_envio || new Date().toISOString()),
            prestador_id: item.prestador_id.toString(),
            solicitacao_id: item.solicitacao_id,
          };
          
          console.log(`📋 [Proposta ${item.id_proposta}] Proposta final:`, {
            id: proposta.id,
            prestador: proposta.prestador,
            prestador_id: proposta.prestador_id
          });
          
          return proposta;
        })
      );

      console.log(`📝 Nomes dos prestadores:`, propostasFormatadas.map(p => ({
        id: p.id,
        nome: p.prestador
      })));
      
      setPropostasData(propostasFormatadas);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      console.error("Erro ao buscar propostas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && userData && !authLoading) {
      fetchPropostas();
    }
  }, [user, userData, authLoading]);

  const handleVerPrestador = (prestadorId: string | undefined) => {
    if (prestadorId) {
      setSelectedPrestadorId(prestadorId);
      setModalVisible(true);
    } else {
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedPrestadorId(null);
  };


const handleAcaoProposta = async (propostaId: number, acao: "aceitar" | "recusar") => {
  try {
    const propostaAceitaParaChat = propostasData.find(p => p.id === propostaId);

    const userId = userData?.id_usuario || userData?.id;
    if (!userId) {
      throw new Error("Usuário não identificado");
    }

    // 🔥 NOVO ENDPOINT: /propostas/{proposta_id}/aceitar ou /rejeitar
    const endpoint = acao === "aceitar" ? "aceitar" : "rejeitar";
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/propostas/${propostaId}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `cliente_id=${userId}`
    });

    if (response.ok) {

      
      await fetchPropostas();
      
      // 🔥 CHAT CRIADO APENAS NO ACEITE
      if (acao === "aceitar" && propostaAceitaParaChat && user) {
        await criarOuBuscarChat(propostaId, propostaAceitaParaChat);
      }
    } else {
      throw new Error('Erro ao atualizar proposta');
    }
  } catch (err) {
    console.error('Erro ao processar ação:', err);
    setError('Erro ao processar ação');
  }
};

// Função separada para criar ou buscar chat
const criarOuBuscarChat = async (propostaId: number, propostaData: PropostaData) => {
  try {
    console.log('🎯 Verificando/Criando chat para proposta:', propostaId);
    
    // 1. Primeiro verifica se já existe chat para esta solicitação
    const verificarResponse = await fetch(
      `${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.CHAT.VERIFICAR_CHAT.replace('{id_solicitacao}', propostaId.toString())}`
    );
    
    let chatId;
    let isNewChat = false;
    
    if (verificarResponse.ok) {
      const verificarData = await verificarResponse.json();
      
      if (verificarData.existe_chat && verificarData.id_chat) {
        // Chat já existe, usa o ID existente
        chatId = verificarData.id_chat;
        console.log('✅ Chat existente encontrado:', chatId);
      } else {
        // Chat não existe, cria um novo
        console.log('📝 Criando novo chat...');
        const criarResponse = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.CHAT.INICIAR}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_solicitacao: propostaId
          })
        });
        
        if (criarResponse.ok) {
          const criarData = await criarResponse.json();
          chatId = criarData.id_chat;
          isNewChat = true;
          console.log('✅ Novo chat criado:', chatId);
        } else {
          throw new Error('Erro ao criar chat');
        }
      }
      
      // Navega para o chat
      navigation.navigate("chatInterativo", { 
        propostaId: propostaId,
        propostaData: propostaData,
        chatId: chatId,
        prestadorId: propostaData.prestador_id,
        isNewChat: isNewChat
      });
      
    } else {
      throw new Error('Erro ao verificar chat existente');
    }
    
  } catch (chatError) {
    console.error('❌ Erro no processo de chat:', chatError);
    // Navega mesmo com erro, mas sem chatId
    navigation.navigate("chatInterativo", { 
      propostaId: propostaId,
      propostaData: propostaData,
      prestadorId: propostaData.prestador_id
    });
  }
};

  // Agora as propostas já vêm filtradas do servidor (sem DECISAO2 e apenas do usuário logado)
  const propostasAtivas = propostasData;
  const temPropostasAtivas = propostasAtivas.length > 0;

  // Loading state (incluindo loading de autenticação)
  if (loading || authLoading) {
    return (
      <View style={styles.container}>
        <Navbar />
        
        {/* Botão Voltar */}
        <View style={styles.botaoVoltarContainer}>
          <TouchableOpacity style={styles.botaoVoltar} onPress={goToHome}>
            <Ionicons name="arrow-back" size={20} color="#0284c7" />
            <Text style={styles.botaoVoltarTexto}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.messageContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.messageText}>Carregando suas propostas...</Text>
          </View>
        </View>
        <Footer />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Navbar />
        
        {/* Botão Voltar */}
        <View style={styles.botaoVoltarContainer}>
          <TouchableOpacity style={styles.botaoVoltar} onPress={goToHome}>
            <Ionicons name="arrow-back" size={20} color="#0284c7" />
            <Text style={styles.botaoVoltarTexto}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.messageContainer}>
            <Text style={styles.errorText}>Erro: {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchPropostas}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Footer />
      </View>
    );
  }

  let content;

  if (!user || !userData) {
    content = (
      <View style={styles.messageContainer}>
        <Text style={styles.errorText}>Usuário não autenticado</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.retryButtonText}>Fazer Login</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (!temPropostasAtivas) {
    content = (
      <View style={styles.messageContainer}>
        <Ionicons name="document-text-outline" size={64} color="#ccc" />
        <Text style={styles.messageText}>
          {propostasData.length === 0 
            ? "Você não tem nenhuma proposta no momento" 
            : "Todas as suas propostas foram processadas"
          }
        </Text>
        <Text style={styles.subMessageText}>
          {propostasData.length === 0 
            ? "Os prestadores ainda não enviaram propostas para seus serviços."
            : "Você já respondeu a todas as propostas recebidas."
          }
        </Text>
      </View>
    );
  } else {
    content = (
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerText}>
            {propostasAtivas.length} proposta{propostasAtivas.length > 1 ? 's' : ''} disponível{propostasAtivas.length > 1 ? 's' : ''}
          </Text>
          <Text style={styles.subHeaderText}>
            Apenas você pode ver estas propostas
          </Text>
        </View>
        
        {propostasAtivas.map((proposta) => (
          <PropostaCard
            key={proposta.id}
            proposta={proposta}
            onAceitar={() => handleAcaoProposta(proposta.id, "aceitar")}
            onRecusar={() => handleAcaoProposta(proposta.id, "recusar")}
            onCardPress={() => handleVerPrestador(proposta.prestador_id)}
            ehRecusada={false}
            ehAceita={false}
          />
        ))}
      </ScrollView>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <Navbar />
        
        {/* Botão Voltar */}
        <View style={styles.botaoVoltarContainer}>
          <TouchableOpacity style={styles.botaoVoltar} onPress={goToHome}>
            <Ionicons name="arrow-back" size={20} color="#0284c7" />
            <Text style={styles.botaoVoltarTexto}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          {content}
        </View>
        <Footer />
      </View>
      
      {
        <PrestadorModal
          visible={modalVisible}
          prestadorId={selectedPrestadorId}
          onClose={handleCloseModal}
        >
        </PrestadorModal>
      }
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  mainContent: {
    flex: 1,
  },
  messageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  messageText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 5,
  },
  subMessageText: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    marginTop: 5,
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  scrollViewContent: {
    paddingVertical: 10,
  },
  headerInfo: {
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  subHeaderText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 2,
  },
  botaoVoltarContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  botaoVoltar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  botaoVoltarTexto: {
    fontSize: 16,
    color: "#0284c7",
    marginLeft: 5,
    fontWeight: "500",
  },
});

export default PropostaCliente;
