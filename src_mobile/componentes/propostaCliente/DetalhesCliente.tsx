import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";

type DetalhesClienteProps = {
  visible: boolean;
  onClose: () => void;
  prestador: string;
  valor?: string;
  descricao?: string;
};

export const DetalhesCliente: React.FC<DetalhesClienteProps> = ({
  visible,
  onClose,
  prestador,
  valor,
  descricao,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Detalhes do Prestador</Text>

          <Text style={styles.text}>
            <Text style={styles.label}>Nome:</Text> {prestador}
          </Text>

          {valor && (
            <Text style={styles.text}>
              <Text style={styles.label}>Valor:</Text> R$ {valor}
            </Text>
          )}

          {descricao && (
            <Text style={styles.text}>
              <Text style={styles.label}>Descrição:</Text> {descricao}
            </Text>
          )}

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Fechar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    color: "#111827",
  },
  text: {
    fontSize: 14,
    color: "#1f2937",
    marginBottom: 6,
  },
  label: {
    fontWeight: "600",
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#0284c7",
    borderRadius: 8,
    paddingVertical: 10,
  },
  closeText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});
