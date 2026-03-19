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
  title?: string;
}

const RecusaModal: React.FC<RecusaModalProps> = ({
  visible,
  onClose,
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
      padding: 10,
    },

    container: {
      backgroundColor: "#ffffff",
      borderRadius: 20,
      padding: isWeb ? 15 : 15,
      maxWidth: isWeb ? 250 : "50%",
      width: "100%",
      alignItems: "center",
      elevation: 10,
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 20,
    },

    successBox: {
      backgroundColor: "#ffe5e5ff",
      borderRadius: 16,
      padding: isWeb ? 20 : 15,
      alignItems: "center",
      width: "100%",
      marginBottom: 20,
    },

    iconContainer: {
      backgroundColor: "#e02e2eff",
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
      color: "#000000ff",
      marginBottom: 0,
      textAlign: "center",
    },

    successSubtitle: {
      fontSize: isWeb ? 16 : 14,
      color: "#64748b",
      textAlign: "center",
      lineHeight: isWeb ? 24 : 20,
    },

    successButton: {
      backgroundColor: "#e02e2eff",
      paddingVertical: isWeb ? 12 : 12,
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
      fontSize: isWeb ? 18 : 14,
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
          </View>
          
          <TouchableOpacity 
            style={styles.successButton} 
            onPress={onClose}
          >
            <Text style={styles.successButtonText}>Entendi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default RecusaModal;
