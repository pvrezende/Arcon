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

interface RecusaModalProps {
  visible: boolean;
  onClose: () => void;
  message?: string;
  title?: string;
}

const RecusaModal: React.FC<RecusaModalProps> = ({
  visible,
  onClose,
  message = "O serviço foi recusado com sucesso e removido da sua lista.",
  title = "Serviço Recusado"
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
      padding: isWeb ? 40 : 30,
      maxWidth: isWeb ? 500 : "90%",
      width: "100%",
      alignItems: "center",
      elevation: 10,
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 20,
    },

    successBox: {
      backgroundColor: "#e0f2fe",
      borderRadius: 16,
      padding: isWeb ? 24 : 20,
      alignItems: "center",
      width: "100%",
      marginBottom: 20,
    },

    iconContainer: {
      backgroundColor: "#0284c7",
      borderRadius: 50,
      width: 50,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },

    successTitle: {
      fontSize: isWeb ? 24 : 20,
      fontWeight: "bold",
      color: "#0284c7",
      marginBottom: 12,
      textAlign: "center",
    },

    successSubtitle: {
      fontSize: isWeb ? 16 : 14,
      color: "#64748b",
      textAlign: "center",
      lineHeight: isWeb ? 24 : 20,
    },

    successButton: {
      backgroundColor: "#0284c7",
      paddingVertical: isWeb ? 16 : 14,
      paddingHorizontal: isWeb ? 32 : 28,
      borderRadius: 12,
      width: "100%",
      alignItems: "center",
      elevation: 3,
      shadowColor: "#0284c7",
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
    },

    successButtonText: {
      color: "#ffffff",
      fontSize: isWeb ? 16 : 14,
      fontWeight: "600",
    },

    animatedContainer: {
      transform: [{ scale: 1 }],
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
        <View style={[styles.container, styles.animatedContainer]}>
          <View style={styles.successBox}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name="snow" 
                size={25} 
                color="#ffffff" 
              />
            </View>
            <Text style={styles.successTitle}>{title}</Text>
            <Text style={styles.successSubtitle}>{message}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.successButton} 
            onPress={() => {
              console.log("👆 [RecusaModal] Botão 'Entendi' clicado - chamando onClose");
              onClose();
            }}
          >
            <Text style={styles.successButtonText}>Entendi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default RecusaModal;
