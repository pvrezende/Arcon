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

interface SucessoModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
}

const SucessoModal: React.FC<SucessoModalProps> = ({
  visible,
  onClose,
  title = "Credenciamento Atualizado!",
  message = "Seu credenciamento foi atualizado com sucesso.",
  buttonText = "Entendi"
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

    successBox: {
      backgroundColor: "#f0fdf4",
      borderRadius: 16,
      padding: isWeb ? 20 : 15,
      alignItems: "center",
      width: "100%",
      marginBottom: 20,
    },

    iconContainer: {
      backgroundColor: "#22c55e",
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
      color: "#22c55e",
      marginBottom: 8,
      textAlign: "center",
    },

    message: {
      fontSize: isWeb ? 16 : 14,
      color: "#64748b",
      textAlign: "center",
      lineHeight: isWeb ? 24 : 20,
    },

    button: {
      backgroundColor: "#22c55e",
      paddingVertical: isWeb ? 14 : 12,
      paddingHorizontal: 32,
      borderRadius: 12,
      width: "100%",
      alignItems: "center",
      elevation: 3,
      shadowColor: "#22c55e",
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
    },

    buttonText: {
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
          <View style={styles.successBox}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name="checkmark" 
                size={30} 
                color="#ffffff" 
              />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={onClose}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SucessoModal;
