import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ConfirmacaoModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmacaoModal: React.FC<ConfirmacaoModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title = "Confirmar Exclusão",
  message = "Tem certeza que deseja excluir este credenciamento?",
  confirmText = "Excluir",
  cancelText = "Cancelar"
}) => {
  const [screenWidth, setScreenWidth] = React.useState(Dimensions.get("window").width);

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });

    return () => subscription?.remove();
  }, []);

  const isWeb = screenWidth > 768;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },

    container: {
      backgroundColor: "#ffffff",
      borderRadius: 20,
      padding: isWeb ? 30 : 25,
      maxWidth: isWeb ? 400 : "90%",
      width: "100%",
      alignItems: "center",
      elevation: 10,
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 20,
    },

    warningBox: {
      backgroundColor: "#fef2f2",
      borderRadius: 16,
      padding: isWeb ? 20 : 15,
      alignItems: "center",
      width: "100%",
      marginBottom: 20,
    },

    iconContainer: {
      backgroundColor: "#dc2626",
      borderRadius: 50,
      width: 60,
      height: 60,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },

    title: {
      fontSize: isWeb ? 22 : 20,
      fontWeight: "700",
      color: "#dc2626",
      marginBottom: 8,
      textAlign: "center",
    },

    message: {
      fontSize: isWeb ? 16 : 14,
      color: "#64748b",
      textAlign: "center",
      lineHeight: isWeb ? 24 : 20,
    },

    buttonsContainer: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
      marginTop: 20,
    },

    cancelButton: {
      flex: 1,
      backgroundColor: "#f1f5f9",
      paddingVertical: isWeb ? 14 : 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#e2e8f0",
    },

    cancelButtonText: {
      color: "#64748b",
      fontSize: isWeb ? 16 : 14,
      fontWeight: "600",
    },

    confirmButton: {
      flex: 1,
      backgroundColor: "#dc2626",
      paddingVertical: isWeb ? 14 : 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: "center",
      elevation: 3,
      shadowColor: "#dc2626",
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
    },

    confirmButtonText: {
      color: "#ffffff",
      fontSize: isWeb ? 16 : 14,
      fontWeight: "600",
    },
  });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.warningBox}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name="snow" 
                size={30} 
                color="#ffffff" 
              />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmacaoModal;
