
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_CONFIG } from "../../../../configIp";
import { authService } from "../../../services/authService";

interface AgendamentoData {
  data: string;
  horario: string;
  status?:
    | "pendente"
    | "aceito"
    | "recusado"
    | "confirmado"
    | "recusado_pelo_prestador"
    | string;
  observacoes?: string;
  id_agendamento?: number;
  id_prestador?: number;
  id_usuario?: number;
}

interface AgendamentoButtonsProps {
  agendamento: AgendamentoData;
  messageId: number;
  idPrestador?: number;
  currentUserId: number;
  chatId?: number; // Adicionar chatId para enviar mensagens automáticas
  onStatusChanged?: (messageId: number, newStatus: string) => void;
}

const AgendamentoButtons: React.FC<AgendamentoButtonsProps> = ({
  agendamento,
  messageId,
  idPrestador,
  currentUserId,
  chatId,
  onStatusChanged,
}) => {
  const [loading, setLoading] = useState(false);
  const [isPrestador, setIsPrestador] = useState(false);
  const [prestadorId, setPrestadorId] = useState<number | undefined>();

  // Use useEffect para verificar async
  useEffect(() => {
    const checkPrestador = async () => {
      try {
        const { user, userData } = await authService.getAuthData();
        const prestador = userData?.tipo_usuario === "PRESTADOR" || user?.tipo === "PRESTADOR";

        setIsPrestador(prestador);
        
        // Se for prestador, usa o currentUserId como prestadorId
        const prestadorIdToUse = prestador ? currentUserId : (agendamento.id_prestador || idPrestador);
        setPrestadorId(prestadorIdToUse);

      } catch (error) {
        console.error("❌ Erro ao verificar prestador:", error);
        // Fallback: assume que é prestador para teste
        setIsPrestador(true);
        setPrestadorId(currentUserId);
      }
    };

    checkPrestador();
  }, [agendamento.id_prestador, currentUserId, idPrestador]);

  // Verificar se o status permite ação
  const isPendente =
    agendamento.status === "pendente" ||
    agendamento.status === "pendente_confirmacao" ||
    !agendamento.status; // Se não tem status, assume pendente

  // Função para mostrar badge de status
  const getStatusBadge = () => {
    if (!agendamento.status || agendamento.status === "pendente") {
      return null;
    }

    const isAceito =
      agendamento.status === "aceito" || agendamento.status === "confirmado";
    const isRecusado =
      agendamento.status === "recusado" ||
      agendamento.status === "recusado_pelo_prestador";

    if (isAceito || isRecusado) {
      return (
        <View
          style={[
            styles.statusBadge,
            isAceito ? styles.statusAccepted : styles.statusRejected,
          ]}
        >
          <Text style={styles.statusBadgeText}>
            {isAceito ? "✓ Aceito" : "✗ Recusado"}
          </Text>
        </View>
      );
    }

    return null;
  };

  if (!isPrestador) {
    return getStatusBadge();
  }

  if (!isPendente) {
    return getStatusBadge();
  }

  const responderAgendamento = async (aceito: boolean) => {
    if (!agendamento.id_agendamento) {
      Alert.alert("Erro", "ID do agendamento não encontrado.");
      return;
    }

    // Usar o prestadorId determinado no useEffect
    const prestadorIdToUse = prestadorId;

    if (!prestadorIdToUse) {
      Alert.alert("Erro", "ID do prestador não encontrado.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/agendamentos/responder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_agendamento: agendamento.id_agendamento,
            id_prestador: prestadorIdToUse,
            aceito: aceito,
            motivo_recusa: aceito ? null : "Recusado pelo prestador",
          }),
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${responseText}`);
      }

      const result = JSON.parse(responseText);

      // Enviar mensagem automática via API
      if (chatId) {
        await enviarMensagemAutomatica(aceito);
      }

      // Chamar callback para atualizar estado no componente pai
      if (onStatusChanged) {
        const newStatus = aceito ? "confirmado" : "recusado_pelo_prestador";
        onStatusChanged(messageId, newStatus);
      }

      Alert.alert(
        "Sucesso",
        aceito ? "Agendamento aceito!" : "Agendamento recusado."
      );
    } catch (error: any) {
      console.error("❌ Erro ao responder agendamento:", error);
      Alert.alert(
        "Erro",
        error.message ||
          "Não foi possível processar a resposta. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  // Função para enviar mensagem automática quando aceitar ou recusar
  const enviarMensagemAutomatica = async (aceito: boolean) => {
    if (!chatId) {
      return;
    }

    try {
      // Formatar data e horário para a mensagem
      const dataFormatada = new Date(agendamento.data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      // Mensagem automática baseada na ação
      const mensagemAutomatica = aceito
        ? `✅ Agendamento aceito!\n📅 Data: ${dataFormatada}\n🕐 Horário: ${agendamento.horario}`
        : `❌ Agendamento recusado.\n📅 Data: ${dataFormatada}\n🕐 Horário: ${agendamento.horario}`;

      // Enviar mensagem via API
      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/chats/mensagem`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_chat: chatId,
            id_remetente: currentUserId,
            mensagem: mensagemAutomatica,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        // O WebSocket irá automaticamente notificar o outro usuário em tempo real
      } else {
        console.error("❌ Erro ao enviar mensagem automática:", response.status);
      }
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem automática:", error);
    }
  };

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[styles.button, styles.acceptButton]}
        onPress={() => responderAgendamento(true)}
        disabled={loading}
      >
        <Ionicons name="checkmark-circle" size={18} color="#fff" />
        <Text style={styles.buttonText}>
          {loading ? "Aceitando..." : "Aceitar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.rejectButton]}
        onPress={() => responderAgendamento(false)}
        disabled={loading}
      >
        <Ionicons name="close-circle" size={18} color="#fff" />
        <Text style={styles.buttonText}>
          {loading ? "Recusando..." : "Recusar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: "#10b981",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  statusBadge: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  statusAccepted: {
    backgroundColor: "#10b981",
  },
  statusRejected: {
    backgroundColor: "#ef4444",
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default AgendamentoButtons;