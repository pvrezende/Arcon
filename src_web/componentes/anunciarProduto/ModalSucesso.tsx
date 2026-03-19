import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ModalSucessoProps {
  visible: boolean;
  onClose: () => void;
}

const ModalSucesso: React.FC<ModalSucessoProps> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.successBox}>
            <View style={styles.iconContainer}>
              <Ionicons name="snow" size={25} color="#ffffff" />
            </View>
            <Text style={styles.successTitle}>Sucesso!</Text>
            <Text style={styles.successSubtitle}>
              Seu ar-condicionado foi anunciado com sucesso. Você receberá notificações sobre interessados.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.successButton}
            onPress={onClose}
          >
            <Text style={styles.successButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  successBox: {
    width: "100%",
    backgroundColor: "#DBEAFE",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginBottom: 15,
  },
  iconContainer: { 
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0284c7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  successTitle: { 
    fontSize: 24, 
    fontWeight: "700", 
    color: "#0284c7", 
    marginBottom: 8 
  },
  successSubtitle: {
    fontSize: 14,
    color: "#334155",
    textAlign: "center",
    marginBottom: 10,
  },
  successButton: {
    backgroundColor: "#0284c7",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  successButtonText: { 
    color: "#ffffff", 
    fontSize: 16, 
    fontWeight: "700" 
  },
});

export default ModalSucesso;
