import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EnviadaModal from "../EnviadaModal";
import RecusaModal from "../RecusaModal";
import ServiceInfoModal from "./ServiceInfoModal";
import { API_CONFIG } from "../../../../configIp";
import { styles } from "./ServiceCards.styles";

interface ServiceCardProps {
  item: {
    id: string | number;
    servico: string;
    cliente: string;
    marca: string;
    tag: string;
    distancia: string;
    id_prestador?: string; // ← CORRIGIDO: usar id_prestador
    tipo?: string;
    btu?: string;
  };
  prestadorId: string | null;
  prestadorNome?: string;
  onPropostaEnviada: (id: string | number) => void;
  onRecusarServico: (id: string | number) => void;
  cardWidth?: number;
  transparent?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  item,
  prestadorId,
  prestadorNome = "",
  onPropostaEnviada,
  onRecusarServico,
  cardWidth,
  transparent = false,
}) => {
  const [valorProposta, setValorProposta] = useState("");
  const [comentarioPrestador, setComentarioPrestador] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [recusando, setRecusando] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [showRecusaModal, setShowRecusaModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // DETERMINAR TIPO DE SERVIÇO - LÓGICA CORRIGIDA
  const getTipoServico = () => {
    // Se id_prestador for null/undefined = DISPONÍVEL PARA TODOS
    if (!item.id_prestador || item.id_prestador === null || item.id_prestador === 'null') {
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
    if (String(item.id_prestador) === String(prestadorId)) {
      return { 
        tipo: "EXCLUSIVO", 
        cor: "#dc2626", 
        texto: "EXCLUSIVO",
        descricao: "Proposta Premium - Enviado especialmente para você",
        icon: "lock-closed" as const,
        badgeIcon: "star" as const
      };
    }
    
    // Caso contrário (não deveria acontecer após o filtro) = não mostrar
    return { 
      tipo: "INDISPONÍVEL", 
      cor: "#6b7280", 
      texto: "INDISPONÍVEL",
      descricao: "Serviço não disponível",
      icon: "close-circle" as const,
      badgeIcon: "close" as const
    };
  };

  const tipoServico = getTipoServico();

  const formatarValor = (valor: string) => {
    const numeros = valor.replace(/\D/g, "");
    if (!numeros) return "";
    const valorNumerico = parseInt(numeros) / 100;
    return valorNumerico.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleValorChange = (texto: string) => {
    setValorProposta(formatarValor(texto));
  };

  const obterValorNumerico = () => {
    const numeros = valorProposta.replace(/\D/g, "");
    const valor = parseInt(numeros) || 0;
    return valor;
  };
  
  const obterValorEmReais = () => {
    const valorNumerico = obterValorNumerico();
    const valorReais = valorNumerico / 100;
    return valorReais;
  };

  // ENVIO DE PROPOSTA
  const enviarProposta = async () => {
    const valorReais = obterValorEmReais();
    
    // Verificar se já está enviando
    if (enviando) {
      return;
    }

    const prestadorIdString = prestadorId?.toString();
    if (!prestadorIdString) {
      Alert.alert("Erro", "ID do prestador não encontrado.");
      return;
    }

    setEnviando(true);
    
    try {
      const formData = new URLSearchParams({
        id_solicitacao: item.id.toString(),
        id_prestador: prestadorIdString,
        valor: valorReais.toString(), 
        descricao: comentarioPrestador || "Proposta enviada pelo prestador",
      });

      // Debug: Log dos dados sendo enviados
      console.log("📤 Dados sendo enviados:", {
        id_solicitacao: item.id.toString(),
        id_prestador: prestadorIdString,
        valor: valorReais.toString(),
        descricao: comentarioPrestador || "Proposta enviada pelo prestador",
        url: `${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.PROPOSTAS_PRESTADOR_ENVIA}`
      });

      // Prestador envia proposta (/propostas/add2)
      const response = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.PROPOSTAS_PRESTADOR_ENVIA}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      
      const result = await response.json();
      
      // Debug: Log da resposta
      console.log("📥 Resposta do servidor:", {
        status: response.status,
        ok: response.ok,
        result: result
      });
      
      if (!response.ok) {
        console.error("❌ Erro na resposta:", result);
        
        // Tratar erros específicos
        if (result.error && result.error.includes("Solicitação não encontrada")) {
          Alert.alert(
            "Erro", 
            "Serviço não encontrado. Pode ter sido removido ou já processado.",
            [{ text: "OK" }]
          );
        } else if (result.error && result.error.includes("já enviou uma proposta")) {
          Alert.alert(
            "Proposta já enviada", 
            "Você já enviou uma proposta para este serviço.",
            [{ text: "OK" }]
          );
        } else {
          Alert.alert(
            "Erro", 
            result.error || result.msg || `Erro ${response.status}. Tente novamente.`,
            [{ text: "OK" }]
          );
        }
        
        setEnviando(false);
        return;
      }

      if (result.success) {
        setSuccessModalVisible(true);
        setEnviando(false); 
      } else {
        if (result.msg && result.msg.includes("já enviou uma proposta")) {
          onPropostaEnviada(result.id_procurado || item.id);
          Alert.alert(
            "Proposta já enviada", 
            "Você já enviou uma proposta para este serviço. Ele foi removido da sua lista.",
            [{ text: "OK" }]
          );
        } else {
          throw new Error(result.msg || "Erro ao enviar proposta");
        }
      }
    } catch (error) {
      Alert.alert(
        "Erro", 
        (error as Error).message || "Erro ao enviar proposta. Tente novamente."
      );
      setEnviando(false);
    }
  };

  // RECUSA DE SERVIÇO
  const recusarServicoBackend = async () => {
    const prestadorIdString = prestadorId?.toString();
    if (!prestadorIdString) {
      Alert.alert("Erro", "ID do prestador não encontrado");
      return;
    }

    setRecusando(true);
    try {
      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.RECUSAR_SERVICO}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            id_registro: item.id.toString(),
            prestador_id: prestadorIdString,
          }).toString(),
        }
      );

      const result = await response.json();

      if (result.success) {
        setTimeout(() => {
          setShowRecusaModal(true);
        }, 100);
      } else {
        throw new Error(result.message || "Erro ao recusar serviço");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível recusar o serviço. Tente novamente.");
      setRecusando(false);
    }
  };

  const confirmarRecusa = () => {
    recusarServicoBackend();
  };

  // ESTILOS DINÂMICOS BASEADOS NO TAMANHO
  const getDynamicStyles = () => {
    const width = cardWidth || 300;
    
    let padding, titleSize, lineHeight, iconSize, subtitleSize;
    
    if (width >= 500) {
      padding = 24;
      titleSize = 18;
      lineHeight = 24;
      iconSize = 24;
      subtitleSize = 14;
    } else if (width >= 400) {
      padding = 20;
      titleSize = 17;
      lineHeight = 22;
      iconSize = 22;
      subtitleSize = 13;
    } else if (width >= 300) {
      padding = 18;
      titleSize = 16;
      lineHeight = 20;
      iconSize = 20;
      subtitleSize = 12;
    } else {
      padding = 16;
      titleSize = 15;
      lineHeight = 18;
      iconSize = 18;
      subtitleSize = 11;
    }
    
    return {
      padding,
      titleStyle: { fontSize: titleSize, lineHeight },
      iconSize,
      subtitleSize
    };
  };

  const dynamicStyles = getDynamicStyles();

  return (
    <View 
      style={[
        transparent ? styles.cardTransparent : styles.card, 
        cardWidth ? { width: cardWidth } : {},
        { padding: dynamicStyles.padding }
      ]}
    >
      {/* BADGE DO TIPO DE SERVIÇO */}
      <View style={styles.tipoServicoBadge}>
        <View style={[styles.badgeContainer, { backgroundColor: tipoServico.cor }]}>
          <Ionicons name={tipoServico.badgeIcon} size={14} color="#ffffff" />
          <Text style={styles.badgeText}>{tipoServico.texto}</Text>
        </View>
        <Text style={styles.tipoServicoDescricao}>{tipoServico.descricao}</Text>
      </View>

      {/* HEADER SIMPLIFICADO DO SERVIÇO */}
      <View style={styles.serviceHeaderSection}>
        {/* Campo de Comentário do Prestador */}
        <View style={styles.comentarioContainer}>
          <Text style={styles.comentarioTitulo}>Comentário para o Cliente</Text>
          <TextInput
            style={styles.comentarioInput}
            placeholder="Escreva um comentário sobre este serviço..."
            value={comentarioPrestador}
            onChangeText={setComentarioPrestador}
            multiline={true}
            numberOfLines={3}
            textAlignVertical="top"
            placeholderTextColor="#94a3b8"
            editable={!enviando && !recusando}
          />
        </View>
      </View>

      {/* BOTÃO PARA VER INFORMAÇÕES */}
      <View style={styles.infoButtonSection}>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => setShowInfoModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.infoButtonContent}>
            <Ionicons name="information-circle" size={20} color="#64748b" />
            <Text style={styles.infoButtonText}>Ver Informações do Serviço</Text>
            <Ionicons name="chevron-forward" size={16} color="#64748b" />
          </View>
        </TouchableOpacity>
      </View>

      {/* SEÇÃO DE PROPOSTA - ALTURA FIXA */}
      <View style={styles.propostaSection}>
        <Text style={styles.propostaLabel}>Sua Proposta</Text>
        
        <View style={styles.inputContainer}>
          <View style={styles.currencyPrefix}>
            <Text style={styles.currencyText}>R$</Text>
          </View>
          <TextInput
            style={[styles.input, (enviando || recusando) && styles.inputDisabled]}
            placeholder="0,00"
            keyboardType="numeric"
            value={valorProposta}
            onChangeText={handleValorChange}
            editable={!enviando && !recusando}
            placeholderTextColor="#94a3b8"
            autoComplete="off"
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.btn, styles.btnRecusar, recusando && styles.btnDisabled]}
            onPress={confirmarRecusa}
            disabled={enviando || recusando}
          >
            <Text style={styles.btnText}>
              {recusando ? "Recusando..." : "Recusar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnEnviar, enviando && styles.btnDisabled]}
            onPress={enviarProposta}
            disabled={enviando || recusando}
          >
            <Text style={styles.btnText}>
              {enviando ? "Enviando..." : "Enviar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ServiceInfoModal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        serviceData={{
          cliente: item.cliente,
          marca: item.marca,
          servico: item.servico,
          tag: item.tag,
          distancia: item.distancia,
          tipo: item.tipo,
          id_prestador: item.id_prestador,
        }}
        prestadorId={prestadorId}
      />

      <EnviadaModal
        visible={successModalVisible}
        onClose={() => {
          setSuccessModalVisible(false);
          setEnviando(false);
          setTimeout(() => {
            onPropostaEnviada(item.id);
          }, 50);
        }}
        title="Proposta Enviada!"
      />

      <RecusaModal
        visible={showRecusaModal}
        onClose={() => {
          setShowRecusaModal(false);
          setRecusando(false);
          setTimeout(() => {
            onRecusarServico(item.id);
          }, 50);
        }}
        title="Serviço Recusado"
      />
    </View>
  );
};

interface ServiceCardsContainerProps {
  services: ServiceCardProps['item'][];
  prestadorId: string | null;
  prestadorNome?: string;
  onPropostaEnviada: (id: string | number) => void;
  onRecusarServico: (id: string | number) => void;
}

export const ServiceCardsContainer: React.FC<ServiceCardsContainerProps> = ({
  services,
  prestadorId,
  prestadorNome,
  onPropostaEnviada,
  onRecusarServico,
}) => {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Layout responsivo - 3 cards por linha centralizados
  const getCardWidth = () => {
    let calculatedWidth;
    
    if (screenWidth >= 1200) {
      // Desktop grande - 3 colunas com largura fixa para garantir exatamente 3 por linha
      calculatedWidth = 320;
    } else if (screenWidth >= 900) {
      // Desktop médio - 3 colunas menores com mais espaço para padding
      calculatedWidth = (screenWidth - 120) / 3 - 20;
    } else if (screenWidth >= 600) {
      // Tablet - 2 colunas com mais espaço para padding
      calculatedWidth = (screenWidth - 80) / 2 - 15;
    } else {
      // Mobile - 1 coluna com padding adequado
      calculatedWidth = screenWidth - 40;
    }
    
    // Limitar largura máxima para evitar cards muito largos
    return Math.min(calculatedWidth, 400);
  };

  const cardWidth = getCardWidth();

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.cardsGrid}>
        {services.map((item) => (
          <ServiceCard
            key={item.id.toString()}
            item={item}
            prestadorId={prestadorId}
            prestadorNome={prestadorNome}
            onPropostaEnviada={onPropostaEnviada}
            onRecusarServico={onRecusarServico}
            cardWidth={cardWidth}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default ServiceCard;