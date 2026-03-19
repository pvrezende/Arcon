import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SuccessModal from "./SuccessModal";
import RecusaModal from "./RecusaModal";
import { API_CONFIG } from "../../../configIp";
import { storage } from "../../services/storageService"; // ✅ IMPORTE O STORAGE SERVICE

interface ServiceCardProps {
  item: {
    id: string | number;
    servico: string;
    cliente: string;
    marca: string;
    tag: string;
    distancia: string;
    prestador_id?: string;
    tipo?: string;
  };
  prestadorId: string | null;
  prestadorNome?: string;
  onPropostaEnviada: (id: string | number) => void;
  onRecusarServico: (id: string | number) => void;
  cardWidth?: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  item,
  prestadorId,
  prestadorNome = "",
  onPropostaEnviada,
  onRecusarServico,
  cardWidth,
}) => {
  const [valorProposta, setValorProposta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [recusando, setRecusando] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [propostaEnviada, setPropostaEnviada] = useState(false);
  const [showRecusaModal, setShowRecusaModal] = useState(false);

  // ✅ FUNÇÃO PARA SALVAR SERVIÇO RESPONDIDO USANDO STORAGE SERVICE
  const salvarServicoRespondido = async (servicoId: string | number): Promise<void> => {
    try {
      if (!prestadorId) return;
      
      const chave = `servicos_respondidos_${prestadorId}`;
      const dadosAtuais = await storage.getObject<string[]>(chave) || [];
      
      if (dadosAtuais.includes(String(servicoId))) {
        return;
      }
      
      const novosDados = [...dadosAtuais, String(servicoId)];
      await storage.setObject(chave, novosDados);
      
      console.log("✅ Serviço salvo como respondido:", servicoId);
    } catch (error) {
      console.error("❌ Erro ao salvar serviço respondido:", error);
    }
  };

  // Debug para modal de recusa
  React.useEffect(() => {
  }, [showRecusaModal]);

  // 🔥 DETERMINAR TIPO DE SERVIÇO
  const getTipoServico = () => {
    if (item.prestador_id) {
      return { 
        tipo: "EXCLUSIVO", 
        cor: "#dc2626", 
        texto: "EXCLUSIVO",
        descricao: "Serviço direcionado especificamente para você",
        icon: "lock-closed" as const,
        badgeIcon: "star" as const
      };
    }
    return { 
      tipo: "DISPONÍVEL", 
      cor: "#059669", 
      texto: "DISPONÍVEL",
      descricao: "Disponível para todos os prestadores",
      icon: "globe" as const,
      badgeIcon: "earth" as const
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
    console.log(`🔢 [ServiceCard] Valor numérico calculado: ${valor} (de "${valorProposta}")`);
    return valor;
  };
  
  const obterValorEmReais = () => {
    const valorNumerico = obterValorNumerico();
    const valorReais = valorNumerico / 100;
    console.log(`💰 [ServiceCard] Valor em reais: ${valorReais} (de ${valorNumerico} centavos)`);
    return valorReais;
  };

  // 🔥 ENVIO DE PROPOSTA
  const enviarProposta = async () => {
    console.log("🚀 [ServiceCard] Botão Enviar clicado!");
    console.log("📊 [ServiceCard] Valor proposta:", valorProposta);
    console.log("📊 [ServiceCard] Prestador ID:", prestadorId);
    console.log("📊 [ServiceCard] Serviço ID:", item.id);
    
    const valorReais = obterValorEmReais();
    console.log("💰 [ServiceCard] Valor em reais:", valorReais);
    
    if (valorReais < 1) {
      console.log("⚠️ [ServiceCard] Valor abaixo do mínimo");
      Alert.alert("Atenção", "Valor mínimo: R$ 1,00.");
      return;
    }

    // 🔥 VERIFICAR SE JÁ ESTÁ ENVIANDO (evitar duplo clique)
    if (enviando) {
      console.log("⚠️ [ServiceCard] Proposta já está sendo enviada - ignorando clique");
      return;
    }

    const prestadorIdString = prestadorId?.toString();
    if (!prestadorIdString) {
      console.log("⚠️ [ServiceCard] Prestador ID não encontrado");
      Alert.alert("Erro", "ID do prestador não encontrado.");
      return;
    }
    
    console.log("✅ [ServiceCard] Usando prestador ID:", prestadorIdString);

    setEnviando(true);
    console.log("📤 [ServiceCard] Iniciando envio...");
    
    try {
      const formData = new URLSearchParams({
        id_solicitacao: item.id.toString(),
        id_prestador: prestadorIdString,
        valor: valorReais.toString(), // 🔥 CORRIGIDO: Enviar valor em reais como string
        descricao: "Proposta enviada pelo prestador",
      });

      console.log("📤 [ServiceCard] FormData sendo enviado:");
      console.log("   - id_solicitacao:", item.id.toString());
      console.log("   - id_prestador:", prestadorIdString);
      console.log("   - valor:", valorReais.toString());
      console.log("   - descricao: Proposta enviada pelo prestador");

      // 🔥 ENDPOINT CORRETO: Prestador envia proposta (/propostas/add2)
      const response = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.PROPOSTAS_PRESTADOR_ENVIA}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      console.log("📡 [ServiceCard] Response status:", response.status);
      
      const result = await response.json();
      console.log("📥 [ServiceCard] Response data:", result);
      
      if (!response.ok) {
        throw new Error(result.erro || `Status ${response.status}`);
      }

      if (result.success) {
        console.log("✅ [ServiceCard] Proposta enviada com sucesso!");
        
        // ✅ SALVAR NO STORAGE SERVICE EM VEZ DE LOCALSTORAGE
        await salvarServicoRespondido(item.id);
        
        setShowSuccessModal(true);
        setPropostaEnviada(true);
        
        // 🔥 REMOVER IMEDIATAMENTE DA LISTA
        console.log("🗑️ [ServiceCard] Removendo serviço da lista imediatamente");
        onPropostaEnviada(item.id);
        
        setTimeout(() => {
          handleCloseSuccessModal();
        }, 4000);
      } else {
        // 🔥 TRATAR CASO DE PROPOSTA JÁ ENVIADA
        if (result.msg && result.msg.includes("já enviou uma proposta")) {
          console.log("⚠️ [ServiceCard] Proposta já foi enviada anteriormente - removendo da lista");
          console.log("⚠️ [ServiceCard] ID do serviço:", result.id_procurado || item.id);
          
          // ✅ SALVAR NO STORAGE SERVICE EM VEZ DE LOCALSTORAGE
          await salvarServicoRespondido(result.id_procurado || item.id);
          
          // Remover da lista mesmo quando já foi enviada
          onPropostaEnviada(result.id_procurado || item.id);
          
          // Mostrar modal informativo
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
      console.error("❌ [ServiceCard] Erro ao enviar proposta:", error);
      Alert.alert(
        "Erro", 
        error.message || "Erro ao enviar proposta. Tente novamente."
      );
      setEnviando(false);
    }
  };

  // 🔥 RECUSA DE SERVIÇO
  const recusarServicoBackend = async () => {
    console.log("🚫 [ServiceCard] Iniciando recusa de serviço");
    console.log("🚫 [ServiceCard] ID do serviço:", item.id, "Tipo:", typeof item.id);
    console.log("🚫 [ServiceCard] ID do prestador:", prestadorId);
    
    const prestadorIdString = prestadorId?.toString();
    if (!prestadorIdString) {
      Alert.alert("Erro", "ID do prestador não encontrado");
      return;
    }
    
    console.log("✅ [ServiceCard] Usando prestador ID para recusa:", prestadorIdString);

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
      console.log("📡 [ServiceCard] Response recusa:", result);

      if (result.success) {
        console.log("✅ [ServiceCard] Serviço recusado com sucesso - ID:", item.id);
        
        // ✅ SALVAR NO STORAGE SERVICE EM VEZ DE LOCALSTORAGE
        await salvarServicoRespondido(item.id);
        
        // Mostrar modal customizado de recusa com pequeno delay
        setTimeout(() => {
          setShowRecusaModal(true);
        }, 100);
      } else {
        throw new Error(result.message || "Erro ao recusar serviço");
      }
    } catch (error) {
      console.error("❌ [ServiceCard] Erro ao recusar serviço:", error);
      Alert.alert("Erro", "Não foi possível recusar o serviço. Tente novamente.");
      setRecusando(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setEnviando(false);
  };

  const confirmarRecusa = () => {
    // Executar recusa diretamente sem modal de confirmação
    recusarServicoBackend();
  };

  // 🔥 ESTILOS DINÂMICOS BASEADOS NO TAMANHO
  const getDynamicStyles = () => {
    const width = cardWidth || 300;
    
    let padding, titleSize, lineHeight, iconSize, subtitleSize;
    
    if (width >= 500) {
      // Cards extra grandes (desktop grande)
      padding = 24;
      titleSize = 18;
      lineHeight = 24;
      iconSize = 24;
      subtitleSize = 14;
    } else if (width >= 400) {
      // Cards grandes (desktop)
      padding = 20;
      titleSize = 17;
      lineHeight = 22;
      iconSize = 22;
      subtitleSize = 13;
    } else if (width >= 300) {
      // Cards médios (tablet)
      padding = 18;
      titleSize = 16;
      lineHeight = 20;
      iconSize = 20;
      subtitleSize = 12;
    } else {
      // Cards pequenos (mobile)
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
    <View style={[
      styles.card, 
      cardWidth ? { width: cardWidth } : {},
      { padding: dynamicStyles.padding }
    ]}>
      {/* HEADER COMPACTO */}
      <View style={styles.cardHeader}>
        <View style={styles.headerMain}>
          <View style={styles.serviceInfo}>
            <View style={styles.titleRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="construct" size={dynamicStyles.iconSize} color="#fff" />
              </View>
              <Text style={[styles.titulo, dynamicStyles.titleStyle]} numberOfLines={2}>{item.servico}</Text>
            </View>
            
            <View style={styles.metaRow}>
              <View style={[styles.tipoBadge, { backgroundColor: tipoServico.cor }]}>
                <Ionicons name={tipoServico.badgeIcon} size={10} color="#fff" />
                <Text style={styles.tipoText}>{tipoServico.texto}</Text>
              </View>
              
              <View style={styles.distanciaContainer}>
                <Ionicons name="location" size={10} color="#64748b" />
                <Text style={styles.distanciaText}>{item.distancia}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.tagsContainer}>
          {item.tag.split(", ").map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* INFORMAÇÕES COMPACTAS - ALTURA FIXA */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="person" size={14} color="#0284c7" />
            <Text style={styles.infoLabel}>Cliente:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{item.cliente}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="business" size={14} color="#0284c7" />
            <Text style={styles.infoLabel}>Marca:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{item.marca}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name={tipoServico.icon} size={14} color="#0284c7" />
          <Text style={styles.infoLabel}>Status:</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {tipoServico.descricao}
          </Text>
        </View>
      </View>

      {/* SEÇÃO DE PROPOSTA - ALTURA FIXA */}
      <View style={styles.propostaSection}>
        <Text style={styles.propostaLabel}>💰 Sua Proposta</Text>
        
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
          />
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.btn, styles.btnRecusar, recusando && styles.btnDisabled]}
            onPress={confirmarRecusa}
            disabled={enviando || recusando}
          >
            <Ionicons name="close" size={16} color="#fff" />
            <Text style={styles.btnText}>
              {recusando ? "Recusando..." : "Recusar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnEnviar, enviando && styles.btnDisabled]}
            onPress={enviarProposta}
            disabled={enviando || recusando || !valorProposta}
          >
            <Text style={styles.btnText}>
              {enviando ? "Enviando..." : "Enviar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <SuccessModal
        visible={showSuccessModal}
        onClose={handleCloseSuccessModal}
        title="✅ Proposta Enviada!"
        message={`Sua proposta de R$ ${valorProposta} foi enviada com sucesso! ${
          tipoServico.tipo === "EXCLUSIVO" 
            ? "O cliente escolheu você especificamente para este serviço!" 
            : "Aguarde a resposta do cliente."
        }`}
      />

      <RecusaModal
        visible={showRecusaModal}
        onClose={() => {
          console.log("🔄 [ServiceCard] Fechando modal e removendo card - ID:", item.id);
          setShowRecusaModal(false);
          setRecusando(false);
          // Usar setTimeout para garantir que o estado seja atualizado antes de remover
          setTimeout(() => {
            console.log("🔄 [ServiceCard] Executando onRecusarServico com ID:", item.id);
            onRecusarServico(item.id);
          }, 50);
        }}
        title="Serviço Recusado"
        message="O serviço foi recusado com sucesso e removido da sua lista. Você não verá mais este serviço."
      />
    </View>
  );
};

// COMPONENTE CONTAINER
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

  const cardWidth = (screenWidth - 40) / 2 - 6;

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    
    // 🔥 DINÂMICO - altura e padding maiores
    flexGrow: 1,
    minHeight: 380, // Cards mais altos
    maxWidth: "100%",
  },

  cardHeader: {
    marginBottom: 16,
    minHeight: 70,
  },

  headerMain: {
    marginBottom: 12,
  },

  serviceInfo: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    flexWrap: "wrap",
  },

  iconContainer: {
    backgroundColor: "#0284c7",
    borderRadius: 10,
    padding: 8,
    marginRight: 10,
    marginTop: 2,
  },

  titulo: {
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
    flexWrap: "wrap",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },

  tipoBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  tipoText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
  },

  distanciaContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  distanciaText: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "500",
    marginLeft: 4,
  },

  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    minHeight: 30,
  },

  tag: {
    backgroundColor: "#f0f9ff",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#e0f2fe",
  },

  tagText: {
    color: "#0369a1",
    fontWeight: "600",
    fontSize: 10,
  },

  infoSection: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    minHeight: 80,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    flexWrap: "wrap",
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    flexWrap: "wrap",
  },

  infoLabel: {
    color: "#64748b",
    fontWeight: "600",
    fontSize: 11,
    marginLeft: 6,
    marginRight: 4,
    width: 50,
  },

  infoValue: {
    color: "#1e293b",
    fontWeight: "500",
    fontSize: 12,
    flex: 1,
    flexWrap: "wrap",
  },

  propostaSection: {
    minHeight: 120,
  },

  propostaLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
    textAlign: "center",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#fff",
  },

  currencyPrefix: {
    backgroundColor: "#0284c7",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  currencyText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "600",
  },

  inputDisabled: {
    backgroundColor: "#f8fafc",
    color: "#94a3b8",
  },

  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap", // 🔥 faz quebrar linha se a tela for estreita
    gap: 8,
  },

  btn: {
    flexGrow: 1, // 🔥 expande igualmente
    flexShrink: 1,
    minWidth: "35%", // 🔥 garante que dois caibam lado a lado
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },

  btnRecusar: {
    backgroundColor: "#ef4444",
  },

  btnEnviar: {
    backgroundColor: "#0284c7",
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 6,
    fontSize: 13,
    flexShrink: 1,
    flexWrap: "wrap",
  },

  btnDisabled: {
    opacity: 0.6,
  },
});

export default ServiceCard;