import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PerfilPrestadorModal from "./PerfilPrestador/PerfilPrestadorModal";

const PRIMARY_BLUE = "#0284c7";
const LIGHT_BLUE_BACKGROUND = "#f0f9ff";
const ACCEPT_GREEN = "#0d9488";
const REJECT_RED = "#dc3545";
const GREY_CANCEL = "#6c757d";

interface PropostaCardProps {
  proposta: {
    id: number;
    servicos: string;
    prestador: string;
    valor: string;
    data: string;
    horario: string;
    prestador_id?: string;
    descricao?: string;
  };
  onAceitar: () => void;
  onRecusar: () => void;
  onCardPress?: () => void;
  ehRecusada: boolean;
  ehAceita: boolean;
  screenWidth?: number;
}

const PropostaCard: React.FC<PropostaCardProps> = ({
  proposta,
  onAceitar,
  onRecusar,
  onCardPress,
  ehRecusada,
  ehAceita,
  screenWidth,
}) => {
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animação de piscar para a bolinha verde
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    pulseAnimation.start();
    
    return () => pulseAnimation.stop();
  }, [pulseAnim]);
  let cardStyle;
  let titleComponent;
  let statusIcon;
  let statusMessage;

  if (ehAceita) {
    cardStyle = styles.cardAceito;
    titleComponent = (
      <View style={styles.titleWithIcon}>
        <Ionicons
          name="checkmark-circle-outline"
          size={20}
          color={ACCEPT_GREEN}
          style={styles.titleLeadingIcon}
        />
        <Text style={styles.cardTitleText}>Proposta Aceita</Text>
      </View>
    );
    statusIcon = "✓";
    statusMessage = "Proposta aceita com sucesso!";
  } else if (ehRecusada) {
    cardStyle = styles.cardRecusado;
    titleComponent = (
      <View style={styles.titleWithIcon}>
        <Ionicons
          name="close-circle-outline"
          size={20}
          color={REJECT_RED}
          style={styles.titleLeadingIcon}
        />
        <Text style={styles.cardTitleText}>Proposta Recusada</Text>
      </View>
    );
    statusIcon = "✗";
    statusMessage = "Proposta recusada.";
  } else {
    cardStyle = styles.cardNormal;
    titleComponent = (
      <View style={styles.titleWithIcon}>
        <View style={styles.stickyNoteBackground}>
          <Ionicons name="document-text" size={16} color="white" />
        </View>
        <Text style={styles.cardTitleText}>Nova Proposta</Text>
      </View>
    );
    statusIcon = "●";
    statusMessage = "Aguardando sua confirmação";
  }

  const showButtons = !ehRecusada && !ehAceita;

  // Calcular largura do card baseada na largura da tela
  const getCardWidth = () => {
    if (!screenWidth) return '100%';
    
    if (screenWidth >= 1200) {
      // Desktop grande - 3 colunas com largura fixa
      return 350;
    } else if (screenWidth >= 900) {
      // Desktop médio - 3 colunas menores
      return (screenWidth - 120) / 3 - 20;
    } else if (screenWidth >= 600) {
      // Tablet - 2 colunas
      return (screenWidth - 80) / 2 - 15;
    } else {
      // Mobile - 1 coluna com padding adequado
      return screenWidth - 32; // 16px de padding em cada lado
    }
  };

  // Estilos dinâmicos baseados no tamanho da tela
  const getDynamicStyles = () => {
    const width = screenWidth || 400;
    
    let padding, borderRadius, fontSize, lineHeight, marginBottom;
    
    if (width >= 900) {
      // Desktop
      padding = 24;
      borderRadius = 20;
      fontSize = 16;
      lineHeight = 22;
      marginBottom = 20;
    } else if (width >= 600) {
      // Tablet
      padding = 20;
      borderRadius = 16;
      fontSize = 15;
      lineHeight = 20;
      marginBottom = 16;
    } else {
      // Mobile
      padding = 16;
      borderRadius = 12;
      fontSize = 14;
      lineHeight = 18;
      marginBottom = 12;
    }
    
    return {
      padding,
      borderRadius,
      fontSize,
      lineHeight,
      marginBottom
    };
  };

  const cardWidth = getCardWidth();
  const dynamicStyles = getDynamicStyles();

  return (
    <View style={[
      styles.cardContainer, 
      cardStyle, 
      { 
        width: cardWidth,
        padding: dynamicStyles.padding,
        borderRadius: dynamicStyles.borderRadius
      }
    ]}>
      {/* HEADER SIMPLIFICADO */}
      <View style={styles.header}>
        {titleComponent}
        <Animated.View
          style={[
            styles.statusIndicator,
            ehAceita
              ? styles.statusAceito
              : ehRecusada
              ? styles.statusRecusado
              : styles.statusPendente,
            !ehAceita && !ehRecusada && { opacity: pulseAnim }
          ]}
        >
          <Text style={styles.statusIcon}>{statusIcon}</Text>
        </Animated.View>
      </View>

      <View style={styles.statusContainer}>
        <Text
          style={[
            styles.statusText,
            ehAceita
              ? styles.statusTextAceito
              : ehRecusada
              ? styles.statusTextRecusado
              : styles.statusTextPendente,
            { fontSize: dynamicStyles.fontSize - 2 }
          ]}
        >
          {statusMessage}
        </Text>
      </View>

      {/* SEÇÃO DE INFORMAÇÕES DO SERVIÇO */}
      <View style={[
        styles.serviceInfoSection,
        { 
          borderRadius: dynamicStyles.borderRadius - 4,
          padding: dynamicStyles.padding - 4,
          marginBottom: dynamicStyles.marginBottom
        }
      ]}>
        <View style={styles.descricaoContainer}>
          <Text style={[
            styles.descricaoTitulo,
            { fontSize: dynamicStyles.fontSize - 4 }
          ]}>Descrição do Serviço</Text>
          <Text style={[
            styles.descricaoText,
            { fontSize: dynamicStyles.fontSize, lineHeight: dynamicStyles.lineHeight }
          ]}>{proposta.servicos}</Text>
        </View>

        {/* Descrição da Proposta */}
        {proposta.descricao && (
          <View style={[
            styles.descricaoPropostaContainer,
            { borderRadius: dynamicStyles.borderRadius - 8 }
          ]}>
            <Text style={[
              styles.descricaoPropostaTitulo,
              { fontSize: dynamicStyles.fontSize - 4 }
            ]}>Comentário do Prestador</Text>
            <Text style={[
              styles.descricaoPropostaText,
              { fontSize: dynamicStyles.fontSize, lineHeight: dynamicStyles.lineHeight }
            ]}>{proposta.descricao}</Text>
          </View>
        )}
      </View>

      {/* BOTÃO PARA VER INFORMAÇÕES DO PRESTADOR */}
      <View style={[
        styles.infoButtonSection,
        { 
          borderRadius: dynamicStyles.borderRadius - 4,
          padding: dynamicStyles.padding - 8,
          marginBottom: dynamicStyles.marginBottom
        }
      ]}>
        <TouchableOpacity
          style={[
            styles.infoButton,
            { borderRadius: dynamicStyles.borderRadius - 8 }
          ]}
          onPress={() => {
            console.log('🔘 Botão Ver Perfil clicado!');
            setShowPerfilModal(true);
          }}
          activeOpacity={0.8}
        >
          <View style={[
            styles.infoButtonContent,
            { padding: dynamicStyles.padding - 8 }
          ]}>
            <Ionicons 
              name="person-circle-outline" 
              size={screenWidth && screenWidth < 600 ? 18 : 20} 
              color="#64748b" 
            />
            <Text style={[
              styles.infoButtonText,
              { fontSize: dynamicStyles.fontSize - 2 }
            ]}>Ver Perfil do Prestador</Text>
            <Ionicons 
              name="chevron-forward" 
              size={screenWidth && screenWidth < 600 ? 14 : 16} 
              color="#64748b" 
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* SEÇÃO DE DETALHES DA PROPOSTA */}
      <View style={[
        styles.propostaDetailsSection,
        { 
          borderRadius: dynamicStyles.borderRadius - 4,
          padding: dynamicStyles.padding - 8,
          marginBottom: dynamicStyles.marginBottom
        }
      ]}>
        <Text style={[
          styles.propostaDetailsLabel,
          { fontSize: dynamicStyles.fontSize - 1 }
        ]}>Detalhes da Proposta</Text>
        
        <View style={styles.detalhesGrid}>
          {/* Prestador */}
          <View style={styles.detalheLinha}>
            <Text style={[
              styles.detalhesLabel,
              { fontSize: dynamicStyles.fontSize - 2 }
            ]}>Prestador:</Text>
            <View style={styles.infoBackground}>
              <Text style={[
                styles.detalhesValue,
                { fontSize: dynamicStyles.fontSize - 2 }
              ]}>{proposta.prestador}</Text>
            </View>
          </View>

          {/* Valor */}
          <View style={styles.detalheLinha}>
            <Text style={[
              styles.detalhesLabel,
              { fontSize: dynamicStyles.fontSize - 2 }
            ]}>Valor:</Text>
            <View style={styles.infoBackground}>
              <Text style={[
                styles.detalhesValue, 
                styles.valorDestaque,
                { fontSize: dynamicStyles.fontSize }
              ]}>
                {proposta.valor}
              </Text>
            </View>
          </View>

          {/* Data e Horário na mesma linha */}
          <View style={styles.detalheLinha}>
            <Text style={[
              styles.detalhesLabel,
              { fontSize: dynamicStyles.fontSize - 2 }
            ]}>Data/Hora:</Text>
            <View style={styles.infoBackground}>
              <Text style={[
                styles.detalhesValue,
                { fontSize: dynamicStyles.fontSize - 2 }
              ]}>{proposta.data} às {proposta.horario}</Text>
            </View>
          </View>
        </View>
      </View>

      {showButtons && (
        <View style={[
          styles.buttonContainer,
          { marginTop: dynamicStyles.marginBottom }
        ]}>
          <TouchableOpacity
            style={[
              styles.button, 
              styles.recusarButton,
              { borderRadius: dynamicStyles.borderRadius - 4 }
            ]}
            onPress={onRecusar}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.buttonText,
              { fontSize: dynamicStyles.fontSize - 2 }
            ]}>
              Recusar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button, 
              styles.aceitarButton,
              { borderRadius: dynamicStyles.borderRadius - 4 }
            ]}
            onPress={onAceitar}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.buttonText,
              { fontSize: dynamicStyles.fontSize - 2 }
            ]}> Aceitar </Text>
          </TouchableOpacity>
        </View>
      )}
      {!showButtons && (
        <View
          style={[
            styles.statusMessageContainer,
            ehAceita
              ? styles.statusMessageAceito
              : styles.statusMessageRecusado,
          ]}
        >
          <Text
            style={[
              styles.statusMessageText,
              ehAceita
                ? styles.statusMessageTextAceito
                : styles.statusMessageTextRecusado,
            ]}
          >
            {ehAceita
              ? "✅ Esta proposta foi aceita e removida da lista"
              : "❌ Esta proposta foi recusada e removida da lista"}
          </Text>
        </View>
      )}
      
      {/* Modal do Perfil do Prestador */}
      <PerfilPrestadorModal
        visible={showPerfilModal}
        prestadorId={proposta.prestador_id || null}
        onClose={() => setShowPerfilModal(false)}
      />
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#fff",
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    minWidth: 280,
    minHeight: 400,
  },
  cardNormal: {
    // Linha azul removida
  },
  cardAceito: {
    borderLeftWidth: 4,
    borderLeftColor: ACCEPT_GREEN,
    backgroundColor: LIGHT_BLUE_BACKGROUND,
  },
  cardRecusado: {
    borderLeftWidth: 4,
    borderLeftColor: REJECT_RED,
    backgroundColor: "#fff8f8",
  },
  serviceInfoSection: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  descricaoContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  descricaoTitulo: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    textAlign: "left",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  descricaoText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    textAlign: "left",
    lineHeight: 20,
  },
  descricaoPropostaContainer: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  descricaoPropostaTitulo: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0284c7",
    textAlign: "left",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  descricaoPropostaText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    textAlign: "left",
    lineHeight: 20,
    fontStyle: "italic",
  },
  infoButtonSection: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  infoButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  infoButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoButtonText: {
    color: "#64748b",
    fontWeight: "500",
    fontSize: 14,
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  propostaDetailsSection: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  propostaDetailsLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  titleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  titleLeadingIcon: {
    marginRight: 8,
  },
  stickyNoteBackground: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PRIMARY_BLUE,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  cardTitleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statusContainer: {
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    fontStyle: "italic",
  },
  statusTextPendente: {
    color: "#666",
  },
  statusTextAceito: {
    color: ACCEPT_GREEN,
  },
  statusTextRecusado: {
    color: REJECT_RED,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statusPendente: {
    backgroundColor: "#10b981", // Verde mais vibrante
  },
  statusAceito: {
    backgroundColor: ACCEPT_GREEN,
  },
  statusRecusado: {
    backgroundColor: REJECT_RED,
  },
  statusIcon: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  divider: {
    borderBottomColor: "#f0f0f0",
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  detalhesGrid: {
    gap: 10,
  },
  detalheLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    
    gap: 10, 
  },
  detalhesLabel: {
    fontWeight: "500",
    color: "#666",
    fontSize: 14,
    // width: "20%", 
  },
  infoBackground: {
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flex: 1, 
    
    alignItems: "flex-end", 
  },
  detalhesValue: {
    color: "#333",
    fontSize: 14,
    
  },
  valorDestaque: {
    fontWeight: "bold",
    color: PRIMARY_BLUE,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  button: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: "40%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  aceitarButton: {
    backgroundColor: PRIMARY_BLUE,
  },
  recusarButton: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    flexShrink: 1,
    flexWrap: "wrap",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusMessageContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  statusMessageAceito: {
    backgroundColor: "#d4edda",
    borderColor: "#c3e6cb",
    borderWidth: 1,
  },
  statusMessageRecusado: {
    backgroundColor: "#f8d7da",
    borderColor: "#f5c6cb",
    borderWidth: 1,
  },
  statusMessageText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  statusMessageTextAceito: {
    color: "#0d9488",
  },
  statusMessageTextRecusado: {
    color: "#721c24",
  },
});

export default PropostaCard;