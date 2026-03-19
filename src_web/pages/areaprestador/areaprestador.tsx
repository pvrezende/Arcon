import React, { useState, useEffect } from "react";
import { View, RefreshControl, Dimensions, Text, Alert, ScrollView, TouchableOpacity } from "react-native";
import Navbar from "../../componentes/navbar";
import Footer from "../../componentes/footer";
import Navegacao from "../../componentes/Navegacao";
import ServiceCard, { ServiceCardsContainer } from "../../componentes/areaprestador/serviceCard/ServiceCard";
import ServiceCardsResponsiveGrid from "../../componentes/areaprestador/serviceCard/ServiceCardsResponsiveGrid";
import EmptyState from "../../componentes/areaprestador/EmptyState";
import StatisticsCards from "../../componentes/areaprestador/StatisticsCards";
import PremiumHero from "../../componentes/areaprestador/PremiumHero";
import ProHero from "../../componentes/areaprestador/ProHero";
import ServicosDisponiveis from "../../componentes/areaprestador/ServicosDisponiveis";
import { Ionicons } from '@expo/vector-icons';
import { API_CONFIG } from "../../../configIp";
import { authService } from "../../services/authService";
import { getUserSubscriptionPlan, SubscriptionPlan } from "../../utils/userUtils";
import styles from "./areaprestador.styles";

interface ServicoItem {
  id: string | number;
  servico: string;
  cliente: string;
  marca: string;
  tag: string;
  distancia: string;
  prestador_id?: string;
  tipo?: string;
  btu?: string;
  proposta?: string;
  decisao?: string;
  decisao2?: string;
  user_id?: string | number;
  ja_enviou_proposta?: boolean;
  total_propostas?: number;
  registro_original?: any;
}

interface NavigationProps {
  navigation: any;
}

const AreaPrestador: React.FC<NavigationProps> = ({ navigation }) => {
  const [servicos, setServicos] = useState<ServicoItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);
  const [prestadorId, setPrestadorId] = useState<string | null>(null);
  const [prestadorNome, setPrestadorNome] = useState("");
  const [servicosRespondidos, setServicosRespondidos] = useState(new Set());
  const [servicoSelecionado, setServicoSelecionado] = useState<any>(null);
  const [servicosArrastados, setServicosArrastados] = useState<any[]>([]);
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>('FREE');

  const isMobile = screenWidth < 768;

  // FUNÇÕES PARA GERENCIAR SERVIÇOS RESPONDIDOS LOCALMENTE
  const carregarServicosRespondidos = () => {
    try {
      const stored = localStorage.getItem(`servicos_respondidos_${prestadorId}`);
      if (stored) {
        const ids = JSON.parse(stored);
        setServicosRespondidos(new Set(ids));
      }
    } catch (error) {
      // Erro ao carregar serviços respondidos
    }
  };

  const salvarServicoRespondido = (servicoId: string | number) => {
    try {
      if (servicosRespondidos.has(String(servicoId))) {
        return;
      }
      
      const novosRespondidos = new Set(servicosRespondidos);
      novosRespondidos.add(String(servicoId));
      setServicosRespondidos(novosRespondidos);
      
      const chave = `servicos_respondidos_${prestadorId}`;
      const dados = JSON.stringify([...novosRespondidos]);
      
      localStorage.setItem(chave, dados);
    } catch (error) {
      // Erro ao salvar serviço respondido
    }
  };

  // Hook para detectar mudanças de tamanho da tela
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Obter o usuário logado usando authService
  const getCurrentUser = async (): Promise<string | null> => {
    try {
      const storedUser = await authService.getUser();
      if (storedUser) {
        return storedUser.id_prestador || storedUser.id || storedUser.uid;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  };

  // Verificar se o prestador está cadastrado
  const checkPrestadorCadastrado = async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.CHECK_PRESTADOR}/${userId}`);
      const result = await response.json();
      
      if (result.cadastrado) {
        setPrestadorId(userId);
        setPrestadorNome(result.data.NOME || "Prestador");
        return true;
      } else {
        setPrestadorId(null);
        return false;
      }
    } catch (error) {
      setPrestadorId(null);
      return false;
    }
  };


  // Buscar serviços disponíveis para o prestador (filtrados por ID)
  const fetchServicos = async (): Promise<void> => {
    try {
      const userId = await getCurrentUser();
      if (!userId) {
        setServicos([]);
        return;
      }
      
      // Serviços filtrados por prestador (específicos + broadcast)
      const url = `${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.PROPOSTAS_SERVICOS_DISPONIVEIS}/${userId}`;
      const response = await fetch(url);
      const data = await response.json();
      
     // Na função fetchServicos, substitua esta parte:
const dadosFormatados: ServicoItem[] = data.map((item: any, index: number) => {
  console.log(`DEBUG Serviço ${index}:`, {
    id_prestador: item.id_prestador,
    tipo_id_prestador: typeof item.id_prestador,
    prestador_id: item.prestador_id,
    tipo_prestador_id: typeof item.prestador_id
  });
  
  
  const isExclusivo = item.id_prestador && 
                     item.id_prestador !== null && 
                     item.id_prestador !== 'null' && 
                     String(item.id_prestador) === String(userId);
  
  const isDisponivelTodos = !item.id_prestador || 
                           item.id_prestador === null || 
                           item.id_prestador === 'null';

  // Se não for nem exclusivo nem disponível, não mostrar
  if (!isExclusivo && !isDisponivelTodos) {
    return null;
  }

  return {
    id: item.id_solicitacao || item.id,
    servico: item.servico || item.SERVICO,
    cliente: item.cliente_nome || item.CLIENTE || 'Cliente',
    marca: item.marca || item.MARCA,
    tag: item.tag || item.TAG,
    distancia: item.distancia || item.DISTANCIA || "2km",
    id_prestador: item.id_prestador, // ← CORRETO: usar id_prestador do backend
    tipo: isExclusivo ? "EXCLUSIVO" : "DISPONÍVEL",
    btu: item.btu || item.BTU || "N/A",
    proposta: item.proposta_prestador || item.PROPOSTA,
    decisao: item.decisao_prestaor || item.DECISAO,
    decisao2: item.decisao_cliente || item.DECISAO2,
    user_id: item.id_usuario || item.user_id,
    ja_enviou_proposta: item.ja_enviou_proposta || false,
    total_propostas: item.total_propostas || 0,
    registro_original: item
  };
}).filter(Boolean); // Remove null values

      // FILTRAR SERVIÇOS JÁ RESPONDIDOS E COM PROPOSTAS ENVIADAS
      const servicosFiltrados = dadosFormatados.filter((servico: ServicoItem) => {
        const jaRespondido = servicosRespondidos.has(String(servico.id));
        const jaEnviouProposta = servico.ja_enviou_proposta === true;
        
        if (jaRespondido) {
          return false;
        }
        
        if (jaEnviouProposta) {
          salvarServicoRespondido(servico.id);
          return false;
        }
        
        return true;
      });

      setServicos(servicosFiltrados);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os serviços");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Inicializar - fluxo simplificado
  useEffect(() => {
    const initializePrestador = async () => {
      setLoading(true);
      const userId = await getCurrentUser();
      if (userId) {
        setPrestadorId(userId);
        carregarServicosRespondidos();
        await fetchServicos(); 
        try {
          // Primeiro, tentar obter o nome do usuário do localStorage
          const userData = await authService.getUser();
          let userName = "Usuário";
          
          console.log('🔍 Dados do usuário encontrados:', userData);
          
          if (userData && userData.nome) {
            userName = userData.nome;
            console.log('✅ Nome encontrado em userData.nome:', userName);
          } else if (userData && userData.name) {
            userName = userData.name;
            console.log('✅ Nome encontrado em userData.name:', userName);
          } else {
            console.log('⚠️ Nome não encontrado no localStorage, tentando API...');
            // Se não tiver no localStorage, tentar da API
            const response = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.CHECK_PRESTADOR}/${userId}`);
            const result = await response.json();
            if (result.cadastrado && result.data.NOME) {
              userName = result.data.NOME;
              console.log('✅ Nome encontrado na API:', userName);
            }
          }
          
          console.log('🎯 Nome final definido:', userName);
          setPrestadorNome(userName);
        } catch (error) {
          setPrestadorNome("Usuário");
        }
      } else {
        setServicos([]);
      }
      setLoading(false);
      
      // Detectar plano de assinatura do usuário
      const userData = await authService.getUser();
      const plan = getUserSubscriptionPlan(userData);
      
      // Verificar se há parâmetro de plano na URL (para redirecionamento dos modais)
      const urlParams = new URLSearchParams(window.location.search);
      const planFromUrl = urlParams.get('plan');
      
      if (planFromUrl && ['basico', 'pro', 'premium'].includes(planFromUrl.toLowerCase())) {
        // Se há parâmetro de plano na URL, usar esse plano
        setSubscriptionPlan(planFromUrl.toUpperCase() as SubscriptionPlan);
        // Limpar parâmetro da URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        // Se não há parâmetro na URL, usar plano detectado ou padrão
        setSubscriptionPlan(plan);
      }
    };
    initializePrestador();
  }, []);

  // CARREGAR SERVIÇOS RESPONDIDOS QUANDO PRESTADOR_ID MUDAR
  useEffect(() => {
    if (prestadorId) {
      carregarServicosRespondidos();
    }
  }, [prestadorId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchServicos();
  };

  const removerServicoEnviado = (servicoId: string | number): void => {
    salvarServicoRespondido(servicoId);
    
    setServicos(prevServicos => {
      const novosServicos = prevServicos.filter((servico: ServicoItem) => {
        const manter = String(servico.id) !== String(servicoId);
        return manter;
      });
      return novosServicos;
    });

    // Também remover dos cards arrastados
    setServicosArrastados(prev => prev.filter(servico => String(servico.id) !== String(servicoId)));
  };

  // Funções para gerenciar cards arrastados
  const adicionarServicoArrastado = (servico: any) => {
    if (servicosArrastados.length >= 4) {
      Alert.alert(
        "Limite atingido",
        "Você pode adicionar no máximo 4 serviços para comparação. Remova um serviço antes de adicionar outro.",
        [{ text: "OK" }]
      );
      return;
    }
    
    if (!servicosArrastados.find(s => s.id === servico.id)) {
      setServicosArrastados(prev => [...prev, servico]);
    }
  };

  const removerServicoArrastado = (servicoId: string | number) => {
    setServicosArrastados(prev => prev.filter(servico => String(servico.id) !== String(servicoId)));
  };

  const limparServicosArrastados = () => {
    setServicosArrastados([]);
  };

  const handleRecusarServico = (servicoId: string | number): void => {
    removerServicoEnviado(servicoId);
  };

  const handleCadastroSucesso = (novoPrestadorId: string, nomePrestador: string): void => {
    setPrestadorId(novoPrestadorId);
    setPrestadorNome(nomePrestador);
  };

  // Calcular estatísticas
  const servicosEspecificos = servicos.filter((item: ServicoItem) => item.tipo === "EXCLUSIVO").length;
  const servicosDisponiveis = servicos.filter((item: ServicoItem) => item.tipo === "DISPONÍVEL").length;
  
  // Debug das estatísticas
  console.log('📊 Estatísticas:', {
    totalServicos: servicos.length,
    servicosEspecificos,
    servicosDisponiveis,
    servicosDetalhes: servicos.map(s => ({ id: s.id, tipo: s.tipo, servico: s.servico }))
  });

  return (
    <View style={styles.container}>
      <Navbar />
      
      <View style={styles.navegacaoContainer}>
        <Navegacao 
          items={[]} 
          showHomeIcon={false}
        />
      </View>
      
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0284c7"
            colors={["#0284c7"]}
          />
        }
      >
        {/* Hero Section */}
        {subscriptionPlan === 'PREMIUM' ? (
          <PremiumHero userName={prestadorNome} />
        ) : subscriptionPlan === 'PRO' ? (
          <ProHero userName={prestadorNome} />
        ) : (
          <View style={styles.heroSection}>
            <View style={styles.heroBackground}>
              <View style={styles.logoContainer}>
                <View style={styles.logoIcon}>
                  <Ionicons name="construct" size={32} color="#ffffff" />
                </View>
              </View>
              
              <Text style={styles.heroTitle}>Área do Prestador</Text>
              <Text style={styles.heroSubtitle}>
                Gerencie seus serviços e encontre novas oportunidades de trabalho
              </Text>
            </View>
          </View>
        )}

        {/* Estatísticas em Destaque - apenas para planos Pro e Premium */}
        {prestadorId && subscriptionPlan !== 'BASICO' && (
          <StatisticsCards
            totalServicos={servicos.length}
            servicosEspecificos={servicosEspecificos}
            servicosDisponiveis={servicosDisponiveis}
          />
        )}

        {/* Layout Principal com Serviços */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="sync" size={48} color="#0284c7" />
            <Text style={styles.loadingText}>Carregando serviços...</Text>
          </View>
        ) : servicos.length > 0 ? (
          <>
            {/* Layout para Plano Básico - apenas ServiceCards */}
            {subscriptionPlan === 'BASICO' ? (
              <View style={styles.responsiveContainer}>
                <ServiceCardsResponsiveGrid
                  services={servicos}
                  prestadorId={prestadorId}
                  prestadorNome={prestadorNome}
                  onPropostaEnviada={removerServicoEnviado}
                  onRecusarServico={handleRecusarServico}
                />
              </View>
            ) : (
              <>
                {/* Layout Desktop - com funcionalidade completa para Pro e Premium */}
                {screenWidth >= 1024 ? (
              <View style={styles.mainContent}>
                {/* Lista de Serviços à Esquerda */}
                <View style={styles.leftPanel}>
                  <ServicosDisponiveis
                    servicos={servicos}
                    onServicoSelecionado={setServicoSelecionado}
                    servicoAtivo={servicoSelecionado}
                    onServicoArrastado={adicionarServicoArrastado}
                    prestadorId={prestadorId}
                  />
                </View>

                {/* Container Unificado dos Serviços Selecionados */}
                <View style={styles.rightPanel}>
                  <View style={styles.unifiedContainer}>
                    <View style={styles.unifiedHeader}>
                      <View style={styles.headerLeft}>
                        <Ionicons name="layers" size={24} color="#0284c7" />
                        <Text style={styles.unifiedTitle}>
                          Serviços Selecionados ({servicosArrastados.length}/4)
                        </Text>
                      </View>
                      {servicosArrastados.length > 0 && (
                        <TouchableOpacity 
                          style={styles.clearButton}
                          onPress={limparServicosArrastados}
                        >
                          <Ionicons name="trash-outline" size={16} color="#dc2626" />
                          <Text style={styles.clearButtonText}>Limpar</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <ScrollView 
                      style={styles.unifiedCardsContainer}
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.unifiedCardsContent}
                    >
                      {servicosArrastados.length > 0 ? (
                        <View style={styles.unifiedCardsRow}>
                          {servicosArrastados.map((servico) => (
                            <View key={servico.id} style={styles.unifiedCardWrapper}>
                              <TouchableOpacity 
                                style={styles.removeButtonTop}
                                onPress={() => removerServicoArrastado(servico.id)}
                              >
                                <Ionicons name="close" size={16} color="#dc2626" />
                              </TouchableOpacity>
                              <ServiceCard
                                item={servico}
                                prestadorId={prestadorId}
                                prestadorNome={prestadorNome}
                                onPropostaEnviada={removerServicoEnviado}
                                onRecusarServico={handleRecusarServico}
                                cardWidth={screenWidth < 768 ? screenWidth - 100 : 340}
                                transparent={true}
                              />
                            </View>
                          ))}
                        </View>
                      ) : (
                        <View style={styles.unifiedEmptyContainer}>
                          <Ionicons name="hand-left" size={48} color="#94a3b8" />
                          <Text style={styles.unifiedEmptyTitle}>Adicione Serviços</Text>
                          <Text style={styles.unifiedEmptyText}>
                            Clique em "Adicionar" nos serviços da lista à esquerda para comparar lado a lado
                          </Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                </View>
              </View>
            ) : (
              /* Layout Mobile/Tablet - apenas ServiceCards em grid para Pro e Premium */
              <View style={styles.responsiveContainer}>
                <ServiceCardsResponsiveGrid
                  services={servicos}
                  prestadorId={prestadorId}
                  prestadorNome={prestadorNome}
                  onPropostaEnviada={removerServicoEnviado}
                  onRecusarServico={handleRecusarServico}
                />
              </View>
            )}
              </>
            )}
          </>
        ) : (
          <EmptyState />
        )}
      <Footer />
      </ScrollView>

     
    </View>
  );
};

export default AreaPrestador;
