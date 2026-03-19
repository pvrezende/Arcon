import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DetalhesCliente } from "./DetalhesCliente"; // 👈 Importa o modal

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
  ehRecusada: boolean;
  ehAceita: boolean;
}

const PropostaCard: React.FC<PropostaCardProps> = ({
  proposta,
  onAceitar,
  onRecusar,
  ehRecusada,
  ehAceita,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

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

  return (
    <View style={[styles.cardContainer, cardStyle]}>
      <View style={styles.header}>
        {titleComponent}
        <View
          style={[
            styles.statusIndicator,
            ehAceita
              ? styles.statusAceito
              : ehRecusada
              ? styles.statusRecusado
              : styles.statusPendente,
          ]}
        >
          <Text style={styles.statusIcon}>{statusIcon}</Text>
        </View>
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
          ]}
        >
          {statusMessage}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.detalhesGrid}>
        {/* Linha 1: Serviço */}
        <View style={styles.detalheLinha}>
          <Text style={styles.detalhesLabel}>Serviço:</Text>
          <View style={styles.infoBackground}>
            <Text style={styles.detalhesValue}>{proposta.servicos}</Text>
          </View>
        </View>

        {/* Linha 2: Prestador */}
        <View style={styles.detalheLinha}>
          <Text style={styles.detalhesLabel}>Prestador:</Text>
          <View style={styles.prestadorRow}>
            <View style={styles.infoBackground}>
              <Text style={styles.detalhesValue}>{proposta.prestador}</Text>
            </View>
            <TouchableOpacity
              style={styles.verDetalhesButton}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="person-circle-outline"
                size={16}
                color={PRIMARY_BLUE}
              />
              <Text style={styles.verDetalhesText}>Ver Detalhes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Linha 3: Valor */}
        <View style={styles.detalheLinha}>
          <Text style={styles.detalhesLabel}>Valor:</Text>
          <View style={styles.infoBackground}>
            <Text style={[styles.detalhesValue, styles.valorDestaque]}>
              {proposta.valor}
            </Text>
          </View>
        </View>

        {/* Linha 4: Data */}
        <View style={styles.detalheLinha}>
          <Text style={styles.detalhesLabel}>Data:</Text>
          <View style={styles.infoBackground}>
            <Text style={styles.detalhesValue}>{proposta.data}</Text>
          </View>
        </View>

        {/* Linha 5: Horário */}
        <View style={styles.detalheLinha}>
          <Text style={styles.detalhesLabel}>Horário:</Text>
          <View style={styles.infoBackground}>
            <Text style={styles.detalhesValue}>{proposta.horario}</Text>
          </View>
        </View>
      </View>

      {/* Botões Aceitar/Recusar */}
      {showButtons && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.recusarButton]}
            onPress={onRecusar}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, styles.buttonTextRecusar]}>
              Recusar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.aceitarButton]}
            onPress={onAceitar}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Aceitar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Mensagem final quando aceito/recusado */}
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

      {/* 🔗 Modal de Detalhes */}
      <DetalhesCliente
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        prestador={proposta.prestador}
        valor={proposta.valor}
        descricao={proposta.descricao ?? "Sem descrição disponível."}
      />
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cardNormal: {
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY_BLUE,
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
    backgroundColor: PRIMARY_BLUE,
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
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  aceitarButton: {
    backgroundColor: PRIMARY_BLUE,
  },
  recusarButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  buttonTextRecusar: {
    color: GREY_CANCEL,
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
  prestadorRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  verDetalhesButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#0284c7",
    gap: 4,
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  verDetalhesText: {
    fontSize: 11,
    color: "#0284c7",
    fontWeight: "600",
  },
});

export default PropostaCard;
