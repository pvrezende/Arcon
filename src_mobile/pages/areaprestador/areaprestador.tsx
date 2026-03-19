import React, { useState, useEffect, useRef } from "react";
import {
  View,
  RefreshControl,
  Dimensions,
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import Navbar from "../../componentes/navbar";
import Footer from "../../componentes/footer";
import ServiceCard from "../../componentes/areaprestador/ServiceCard";
import EmptyState from "../../componentes/areaprestador/EmptyState";
import CadastrarPrestador from "../../componentes/prestadorcomponenteid";
import CredencialPrestador from "../../../src_mobile/componentes/areaprestador/ModalCredencial";
import PropostasAndamento from "../../componentes/areaprestador/PropostasAndamento";
import Agendamentos from "../../componentes/areaprestador/Agendamentos";
import ServicosConcluidos from "../../componentes/areaprestador/ServiçosConcluidos";
import { Ionicons } from '@expo/vector-icons';
import { API_CONFIG } from "../../../configIp";
import { authService } from "../../services/authService";
import { LinearGradient } from 'expo-linear-gradient';
import { storage } from "../../services/storageService"; 

interface AreaPrestadorProps {
  navigation: any;
}

interface Servico {
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
  id_prestador?: string;
}

interface UserData {
  id_usuario?: string;
  id?: string;
  uid?: string;
  nome?: string;
  displayName?: string;
  email?: string;
  id_prestador?: string;
}

type ActiveComponent = 'propostas' | 'agendamentos' | 'concluidos' | null;

const AreaPrestador: React.FC<AreaPrestadorProps> = ({ navigation }) => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [screenWidth, setScreenWidth] = useState<number>(Dimensions.get("window").width);
  const [prestadorId, setPrestadorId] = useState<string | null>(null);
  const [prestadorNome, setPrestadorNome] = useState<string>("");
  const [possuiCredenciamento, setPossuiCredenciamento] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [modalCredenciaisVisible, setModalCredenciaisVisible] = useState<boolean>(false);
  const [activeComponent, setActiveComponent] = useState<ActiveComponent>(null);
  const [servicosRespondidos, setServicosRespondidos] = useState<Set<string>>(new Set());
  
  // Animações principais
  const [fadeAnim] = useState<Animated.Value>(new Animated.Value(0));
  const [slideAnim] = useState<Animated.Value>(new Animated.Value(50));

  // Animações para os flocos de neve
  const [snowflake1Y] = useState<Animated.Value>(new Animated.Value(300));
  const [snowflake1Opacity] = useState<Animated.Value>(new Animated.Value(0));
  const [snowflake2Y] = useState<Animated.Value>(new Animated.Value(-100));
  const [snowflake2Opacity] = useState<Animated.Value>(new Animated.Value(0));

  // Refs para controlar as animações
  const snowflake1AnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const snowflake2AnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const isMobile = screenWidth < 768;

  // FUNÇÕES PARA GERENCIAR SERVIÇOS RESPONDIDOS COM STORAGE SERVICE
  const carregarServicosRespondidos = async (): Promise<void> => {
    try {
      if (!prestadorId) return;
      
      const chave = `servicos_respondidos_${prestadorId}`;
      const dados = await storage.getObject<string[]>(chave);
      
      if (dados && Array.isArray(dados)) {
        setServicosRespondidos(new Set(dados));
      }
    } catch (error) {
      console.error("❌ Erro ao carregar serviços respondidos:", error);
    }
  };

  const salvarServicoRespondido = async (servicoId: string | number): Promise<void> => {
    try {
      if (!prestadorId) return;
      
      if (servicosRespondidos.has(String(servicoId))) {
        return;
      }
      
      const novosRespondidos = new Set(servicosRespondidos);
      novosRespondidos.add(String(servicoId));
      setServicosRespondidos(novosRespondidos);
      
      const chave = `servicos_respondidos_${prestadorId}`;
      const dados = Array.from(novosRespondidos);
      
      await storage.setObject(chave, dados);
    } catch (error) {
      console.error("❌ Erro ao salvar serviço respondido:", error);
    }
  };

  // Hook para detectar mudanças de tamanho da tela
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Função para animar os flocos de neve
  const startSnowflakeAnimations = (): void => {
    const headerHeight = 300;
    const topPosition = -100;
    
    // FLOCO 1: Começa na BASE e SEMPRE SOBE primeiro
    snowflake1AnimRef.current = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(snowflake1Y, {
            toValue: topPosition,
            duration: 9000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(snowflake1Opacity, {
              toValue: 1,
              duration: 1500,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(snowflake1Opacity, {
              toValue: 1,
              duration: 4500,
              useNativeDriver: true,
            }),
            Animated.timing(snowflake1Opacity, {
              toValue: 0,
              duration: 3000,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(snowflake1Y, {
            toValue: headerHeight,
            duration: 9000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(snowflake1Opacity, {
              toValue: 1,
              duration: 1500,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(snowflake1Opacity, {
              toValue: 1,
              duration: 4500,
              useNativeDriver: true,
            }),
            Animated.timing(snowflake1Opacity, {
              toValue: 0,
              duration: 3000,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ])
    );

    // FLOCO 2: Começa no TOPO e SEMPRE DESCE primeiro
    snowflake2AnimRef.current = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(snowflake2Y, {
            toValue: headerHeight,
            duration: 12000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(snowflake2Opacity, {
              toValue: 1,
              duration: 1500,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(snowflake2Opacity, {
              toValue: 1,
              duration: 4500,
              useNativeDriver: true,
            }),
            Animated.timing(snowflake2Opacity, {
              toValue: 0,
              duration: 3000,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(snowflake2Y, {
            toValue: topPosition,
            duration: 12000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(snowflake2Opacity, {
              toValue: 1,
              duration: 1500,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(snowflake2Opacity, {
              toValue: 1,
              duration: 4500,
              useNativeDriver: true,
            }),
            Animated.timing(snowflake2Opacity, {
              toValue: 0,
              duration: 3000,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ])
    );

    snowflake1AnimRef.current.start();
    snowflake2AnimRef.current.start();
  };

  // Parar animações quando o componente desmontar
  const stopSnowflakeAnimations = (): void => {
    if (snowflake1AnimRef.current) {
      snowflake1AnimRef.current.stop();
    }
    if (snowflake2AnimRef.current) {
      snowflake2AnimRef.current.stop();
    }
  };

  // Obter o usuário logado usando authService
  const getCurrentUser = async (): Promise<string | null> => {
    try {
      const storedUser = await authService.getUser();
      if (storedUser) {
        setUserData(storedUser);
        // PRIORIDADE: id_prestador > id_usuario > id > uid
        return storedUser.id_prestador || storedUser.id_usuario || storedUser.id || storedUser.uid || null;
      } else {
        return null;
      }
    } catch (error) {
      console.error("❌ Erro ao obter usuário:", error);
      return null;
    }
  };

  // Função para obter o nome do usuário
  const getUserName = (): string => {
    if (userData) {
      return userData.nome || userData.displayName || userData.email?.split('@')[0] || "Prestador";
    }
    return "Prestador";
  };

  // BUSCAR SERVIÇOS DISPONÍVEIS - LÓGICA SIMPLIFICADA SEM CHECK-PRESTADOR
  const fetchServicos = async (): Promise<void> => {
    try {
      const userId = await getCurrentUser();
      if (!userId) {
        console.log("⚠️ Nenhum userId - não buscando serviços");
        setServicos([]);
        return;
      }

      console.log(`🔍 [AreaPrestador] Buscando serviços para usuário ID: ${userId}`);
      
      // USAR O ENDPOINT CORRETO PARA SERVICOS DISPONIVEIS
      const url = `${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.PROPOSTAS_SERVICOS_DISPONIVEIS}/${userId}`;
      console.log(`📡 [AreaPrestador] URL: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`📦 [AreaPrestador] Dados recebidos:`, data);
      console.log(`📦 [AreaPrestador] Serviços recebidos: ${data.length}`);
      
      if (data.length === 0) {
        console.log("📭 Nenhum serviço disponível");
        setServicos([]);
        return;
      }

      // FORMATAR DADOS
      const dadosFormatados: Servico[] = data.map((item: any, index: number) => {
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
          id_prestador: item.id_prestador,
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

      console.log(`✅ [AreaPrestador] Serviços formatados:`, dadosFormatados);

      // FILTRAR SERVIÇOS JÁ RESPONDIDOS E COM PROPOSTAS ENVIADAS
      const servicosFiltrados = dadosFormatados.filter((servico: Servico) => {
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
      
      // Se encontrou serviços, considera que o prestador está cadastrado
      if (dadosFormatados.length > 0 && userId) {
        setPrestadorId(userId);
        setPrestadorNome(getUserName());
      }
    } catch (error) {
      console.error("❌ Erro ao buscar serviços:", error);
      Alert.alert("Erro", "Não foi possível carregar os serviços");
      setServicos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Inicializar
  useEffect(() => {
    const initializePrestador = async (): Promise<void> => {
      setLoading(true);
      const userId = await getCurrentUser();
      
      if (userId) {
        console.log("👤 Usuário encontrado:", userId);
        
        // BUSCAR SERVIÇOS DIRETAMENTE - SEM VERIFICAÇÃO DE CADASTRO
        setPrestadorId(userId);
        setPrestadorNome(getUserName());
        
        // Carregar serviços respondidos antes de buscar serviços
        await carregarServicosRespondidos();
        
        // Buscar serviços reais
        await fetchServicos();
        
        // Animações de entrada
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          })
        ]).start();
        
        setLoading(false);
        return;
      } else {
        console.log("❌ Nenhum usuário encontrado");
        setLoading(false);
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

  // Monitorar estado para debug
  useEffect(() => {
    console.log("🔄 Estado atualizado:", {
      loading,
      prestadorId,
      servicosCount: servicos.length,
      activeComponent,
      possuiCredenciamento,
      servicosRespondidos: servicosRespondidos.size
    });
  }, [loading, prestadorId, servicos.length, activeComponent, possuiCredenciamento, servicosRespondidos]);

  // Inicializar animações quando o componente montar
  useEffect(() => {
    startSnowflakeAnimations();
    
    return () => {
      stopSnowflakeAnimations();
    };
  }, []);

  // Reiniciar animações quando o prestador for cadastrado
  useEffect(() => {
    if (prestadorId) {
      startSnowflakeAnimations();
    }
  }, [prestadorId]);

  // Buscar serviços quando prestadorId mudar
  useEffect(() => {
    if (prestadorId) {
      fetchServicos();
    } else {
      setServicos([]);
      setLoading(false);
      setRefreshing(false);
    }
  }, [prestadorId]);

  const onRefresh = (): void => {
    setRefreshing(true);
    fetchServicos();
  };

  // REMOVER SERVIÇO ENVIADO - ATUALIZADO PARA SALVAR COMO RESPONDIDO
  const removerServicoEnviado = async (servicoId: string | number): Promise<void> => {
    await salvarServicoRespondido(servicoId);
    
    setServicos(prevServicos => {
      return prevServicos.filter(servico => String(servico.id) !== String(servicoId));
    });
  };

  const handleRecusarServico = async (servicoId: string | number): Promise<void> => {
    await removerServicoEnviado(servicoId);
  };

  const handleCadastroSucesso = async (novoPrestadorId: string, nomePrestador: string): Promise<void> => {
    setPrestadorId(novoPrestadorId);
    setPrestadorNome(nomePrestador);
    
    // Carregar serviços respondidos após cadastro
    await carregarServicosRespondidos();
    
    // Animações após cadastro
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();
  };

  // Abrir modal de credenciais
  const abrirModalCredenciais = (): void => {
    setModalCredenciaisVisible(true);
  };

  // Fechar modal de credenciais
  const fecharModalCredenciais = (): void => {
    setModalCredenciaisVisible(false);
  };

  // Navegação entre componentes
  const handleNavigateTo = (component: ActiveComponent): void => {
    setActiveComponent(component);
  };

  const handleBackToMain = (): void => {
    setActiveComponent(null);
  };

  // Componente para o floco de neve animado
  const Snowflake = ({ 
    style, 
    size = 200, 
    translateYAnim,
    opacityAnim,
    rotate = false 
  }: { 
    style: any; 
    size?: number;
    translateYAnim: Animated.Value;
    opacityAnim: Animated.Value;
    rotate?: boolean;
  }) => {
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (rotate) {
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 20000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ).start();
      }
    }, [rotate]);

    const rotateInterpolate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View 
        style={[
          styles.snowflake, 
          { 
            width: size, 
            height: size,
            opacity: opacityAnim,
            transform: [
              { translateY: translateYAnim },
              ...(rotate ? [{ rotate: rotateInterpolate }] : [])
            ]
          }, 
          style
        ]}
      >
        <Ionicons name="snow" size={size * 0.9} color="#ffffff1a" />
      </Animated.View>
    );
  };

  // Componente para criar a curva de encaixe
  const CurvedEdge = () => (
    <View style={styles.curvedEdgeContainer}>
      <View style={styles.curvedEdge}>
        <View style={styles.curveNotch} />
      </View>
    </View>
  );

  // Componente Botão Premium
  const PremiumButton = ({ 
    title, 
    subtitle, 
    count, 
    icon, 
    colors, 
    onPress 
  }: {
    title: string;
    subtitle: string;
    count: number;
    icon: string;
    colors: string[];
    onPress: () => void;
  }) => {
    const [buttonScale] = useState(new Animated.Value(1));

    const handlePressIn = () => {
      Animated.spring(buttonScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Animated.View style={[
          styles.premiumButton,
          { transform: [{ scale: buttonScale }] }
        ]}>
          <LinearGradient
            colors={colors}
            style={styles.premiumGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.glowEffect} />
            
            <View style={styles.buttonContent}>
              <View style={styles.leftSection}>
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                    style={styles.iconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name={icon} size={24} color={colors[0]} />
                  </LinearGradient>
                </View>
                
                <View style={styles.textContainer}>
                  <Text style={styles.buttonTitle}>{title}</Text>
                  <Text style={styles.buttonSubtitle}>{subtitle}</Text>
                </View>
              </View>
              
              <View style={styles.rightSection}>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{count}</Text>
                </View>
                <View style={styles.arrowCircle}>
                  <Ionicons name="chevron-forward" size={16} color="#ffffff" />
                </View>
              </View>
            </View>
            
            <View style={styles.decorationCircle1} />
            <View style={styles.decorationCircle2} />
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // Renderizar componente ativo
  const renderActiveComponent = (): JSX.Element | null => {
    switch (activeComponent) {
      case 'propostas':
        return <PropostasAndamento onBack={handleBackToMain} />;
      case 'agendamentos':
        return <Agendamentos onBack={handleBackToMain} />;
      case 'concluidos':
        return <ServicosConcluidos onBack={handleBackToMain} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Navbar />
      
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
        {/* HEADER PRINCIPAL COM GRADIENTE E CURVA DE ENCAIXE */}
        <View style={styles.headerWrapper}>
          <LinearGradient
            colors={["#0284c7", "#025b88ff", "#022f69ff"]}
            style={styles.mainHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Elementos decorativos do header com animação */}
            <View style={styles.headerDecoration}>
              {/* FLOCO 1 (DIREITO) - Começa na BASE e SOBE primeiro COM FADE IN/OUT */}
              <Snowflake 
                style={styles.snowflake1}
                size={200}
                translateYAnim={snowflake1Y}
                opacityAnim={snowflake1Opacity}
                rotate={true}
              />
              {/* FLOCO 2 (ESQUERDO) - Começa no TOPO e DESCE primeiro COM FADE IN/OUT */}
              <Snowflake 
                style={styles.snowflake2}
                size={250}
                translateYAnim={snowflake2Y}
                opacityAnim={snowflake2Opacity}
                rotate={true}
              />
            </View>

            <Animated.View 
              style={[
                styles.heroCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {/* Avatar e Status - conteúdo alinhado à esquerda */}
              <View style={styles.avatarSection}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Ionicons name="construct" size={32} color="#ffffff" />
                  </View>
                  <View style={styles.statusIndicator} />
                </View>
                
                <View style={styles.welcomeTextContainer}>
                  <Text style={styles.welcomeLabel}>Bem-vindo de volta, 👋</Text>
                  <Text style={styles.userName}>
                    {prestadorNome || getUserName()}!
                  </Text>
                  
                  {/* Botão Verificado com Gradient Dourado */}
                  {prestadorId && (
                    <TouchableOpacity 
                      style={styles.verifiedButton}
                      onPress={abrirModalCredenciais}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={['#FFD700', '#FFA500', '#FF8C00']}
                        style={styles.verifiedGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <View style={styles.verifiedContent}>
                          <Ionicons name="checkmark-circle" size={12} color="#0284c7" />
                          <Text style={styles.verifiedText}>Verificado</Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Título e Subtítulo */}
              <View style={styles.titleSection}>
                <Text style={styles.heroTitle}>Área do Prestador</Text>
                <Text style={styles.heroSubtitle}>
                  Acompanhe seus serviços, propostas e oportunidades disponíveis
                </Text>
              </View>
            </Animated.View>
          </LinearGradient>

          {/* CURVA DE ENCAIXE - Conecta visualmente o header com o conteúdo */}
          <CurvedEdge />
        </View>

        <View style={styles.content}>
          {/* Modal de Credenciais */}
          <CredencialPrestador 
            visible={modalCredenciaisVisible}
            onClose={fecharModalCredenciais}
          />

          {/* BOTÕES DE GERENCIAMENTO - SEM CONTAINER BRANCO */}
          {prestadorId && !activeComponent && (
            <Animated.View 
              style={[
                styles.managementSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.managementHeader}>
                <Text style={styles.managementTitle}>Gerenciar Serviços</Text>
                <Text style={styles.managementSubtitle}>
                  Acompanhe e gerencie todas as suas atividades
                </Text>
              </View>
              
              <View style={styles.botoesGrid}>
                <PremiumButton
                  title="Propostas"
                  subtitle="Em andamento"
                  count={3}
                  icon="build"
                  colors={['#10b981', '#059669']}
                  onPress={() => handleNavigateTo('propostas')}
                />
                
                <PremiumButton
                  title="Agendamentos"
                  subtitle="Próximos serviços"
                  count={4}
                  icon="calendar"
                  colors={['#f59e0b', '#d97706']}
                  onPress={() => handleNavigateTo('agendamentos')}
                />
                
                <PremiumButton
                  title="Concluídos"
                  subtitle="Histórico completo"
                  count={12}
                  icon="checkmark-done"
                  colors={['#3b82f6', '#1d4ed8']}
                  onPress={() => handleNavigateTo('concluidos')}
                />
              </View>
            </Animated.View>
          )}

          {/* Componente Ativo - SÓ MOSTRA SE HÁ COMPONENTE ATIVO */}
          {prestadorId && activeComponent && (
            <Animated.View 
              style={[
                styles.componentSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {renderActiveComponent()}
            </Animated.View>
          )}

          {/* Cadastro para novos prestadores */}
          {!prestadorId && (
            <Animated.View 
              style={[
                styles.cadastrarContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <CadastrarPrestador 
                onCadastroSucesso={handleCadastroSucesso}
              />
              
              <View style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <Ionicons name="rocket" size={24} color="#0284c7" />
                  <Text style={styles.infoTitle}>Próximos Passos</Text>
                </View>
                <Text style={styles.infoDescription}>
                  Após completar seu cadastro, você poderá adicionar certificações e credenciais profissionais para aumentar a confiança dos clientes.
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Estados de Loading e Vazio - SÓ MOSTRA SE NÃO HÁ COMPONENTE ATIVO */}
          {loading && !activeComponent ? (
            <Animated.View 
              style={[
                styles.loadingContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.loadingAnimation}>
                <Ionicons name="sync" size={48} color="#0284c7" />
              </View>
              <Text style={styles.loadingText}>Carregando serviços...</Text>
            </Animated.View>
          ) : !prestadorId && !activeComponent ? (
            <Animated.View 
              style={[
                styles.emptyStateContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.emptyStateIcon}>
                <Ionicons name="person-add" size={64} color="#cbd5e1" />
              </View>
              <Text style={styles.emptyStateTitle}>Cadastro Necessário</Text>
              <Text style={styles.emptyStateText}>
                Complete seu cadastro para acessar os serviços disponíveis na sua região
              </Text>
            </Animated.View>
          ) : null}

          {/* SERVIÇOS DISPONÍVEIS - FORA DO CONTAINER */}
          {!loading && prestadorId && !activeComponent && (
            <Animated.View 
              style={[
                styles.servicesSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="list" size={24} color="#0f172a" />
                  <Text style={styles.sectionTitle}>
                    Serviços Disponíveis
                  </Text>
                </View>
                <View style={styles.counterBadge}>
                  <Text style={styles.counterText}>{servicos.length}</Text>
                </View>
              </View>
              
              <Text style={styles.sectionSubtitle}>
                {servicos.length > 0 
                  ? "Encontre e gerencie seus serviços de forma simples" 
                  : "Nenhum serviço disponível no momento"}
              </Text>
              
              {servicos.length > 0 ? (
                <View style={styles.listContainer}>
                  {servicos.map((item) => (
                    <ServiceCard
                      key={item.id.toString()}
                      item={item}
                      onPropostaEnviada={removerServicoEnviado}
                      onRecusarServico={handleRecusarServico}
                      prestadorId={prestadorId}
                      prestadorNome={prestadorNome}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.noServicesContainer}>
                  <Ionicons name="search" size={48} color="#cbd5e1" />
                  <Text style={styles.noServicesText}>
                    Nenhum serviço disponível
                  </Text>
                  <Text style={styles.noServicesSubtext}>
                    Novos serviços aparecerão aqui quando estiverem disponíveis
                  </Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* Empty State para serviços */}
          {servicos.length === 0 && !activeComponent && prestadorId && !loading && (
            <Animated.View 
              style={[
                styles.emptyStateContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <EmptyState />
            </Animated.View>
          )}
        </View>

        {/* Espaço extra no final */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Footer />
    </View>
  );
};

// Estilos permanecem exatamente iguais
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flex: 1,
  },
  headerWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  mainHeader: {
    paddingBottom: 40,
    overflow: 'hidden',
    position: 'relative',
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroCard: {
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 0,
  },
  curvedEdgeContainer: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  curvedEdge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    alignItems: 'center',
  },
  curveNotch: {
    width: 120,
    height: 8,
    backgroundColor: '#ffffffff',
    borderRadius: 4,
    marginTop: 8,
    opacity: 0.3,
  },
  snowflake: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  snowflake1: {
    top: -100,
    right: -50,
  },
  snowflake2: {
    top: -100,
    left: -80,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8fafc',
    marginTop: -15,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeLabel: {
    fontSize: 14,
    color: '#e0f2fe',
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'left',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'left',
    marginBottom: 8,
  },
  verifiedButton: {
    alignSelf: 'flex-start',
    marginTop: 0,
  },
  verifiedGradient: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  verifiedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  titleSection: {
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'left',
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#e0f2fe',
    lineHeight: 22,
    textAlign: 'left',
  },
  managementSection: {
    marginHorizontal: 20,
    marginTop: 5,
  },
  managementHeader: {
    marginBottom: 25,
    alignItems: 'center',
  },
  managementTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0284c7',
    marginBottom: 4,
    textAlign: 'center',
  },
  managementSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  botoesGrid: {
    gap: 12,
  },
  premiumButton: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 12,
    overflow: 'hidden',
  },
  premiumGradient: {
    padding: 18,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  glowEffect: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  buttonSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  countText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1e293b',
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  decorationCircle1: {
    position: 'absolute',
    bottom: -15,
    left: -15,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  decorationCircle2: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  componentSection: {
    marginHorizontal: 20,
    marginTop: 15,
  },
  cadastrarContainer: {
    marginHorizontal: 20,
    marginTop: 15,
  },
  infoCard: {
    backgroundColor: '#e0f2fe',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0284c7',
    marginTop: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0c4a6e',
    marginLeft: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#075985',
    lineHeight: 20,
  },
  loadingContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 15,
    padding: 40,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingAnimation: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyStateContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 15,
    padding: 40,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  servicesSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginLeft: 8,
  },
  counterBadge: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  counterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 20,
  },
  listContainer: {
    gap: 16,
  },
  noServicesContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noServicesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  noServicesSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default AreaPrestador;