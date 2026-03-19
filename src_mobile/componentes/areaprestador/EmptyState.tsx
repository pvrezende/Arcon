import React from "react";
import { 
  View, 
  Text, 
  Dimensions, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Platform 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const isWeb = width > 768;

interface EmptyStateProps {
  message?: string;
  onRefresh?: () => void; // callback opcional para refresh
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  message = "Nenhum serviço disponível no momento",
  onRefresh
}) => {

  const handleRefresh = () => {
    if (Platform.OS === "web") {
      window.location.reload(); // refresh no web
    } else {
      if (onRefresh) {
        onRefresh(); // refresh via callback no mobile
      } else {
        Alert.alert("Atualizar", "Recarregando os dados...");
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: isWeb ? 80 : 60,
      paddingHorizontal: 32,
    },

    iconContainer: {
      backgroundColor: "rgba(2, 132, 199, 0.1)",
      borderRadius: isWeb ? 40 : 30,
      padding: isWeb ? 32 : 24,
      marginBottom: 24,
      borderWidth: 2,
      borderColor: "rgba(2, 132, 199, 0.2)",
    },

    title: {
      fontSize: isWeb ? 24 : 20,
      fontWeight: "bold",
      color: "#334155",
      marginBottom: 12,
      textAlign: "center",
    },

    message: {
      fontSize: isWeb ? 16 : 14,
      color: "#64748b",
      textAlign: "center",
      lineHeight: isWeb ? 24 : 20,
      marginBottom: 32,
      maxWidth: isWeb ? 400 : 300,
    },

    suggestions: {
      gap: 12,
      alignItems: "center",
    },

    suggestionItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "#ffffff",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "#e2e8f0",
    },

    suggestionText: {
      color: "#64748b",
      fontSize: 14,
      fontWeight: "500",
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconContainer} onPress={handleRefresh}>
        <Ionicons name="search-outline" size={isWeb ? 64 : 48} color="#0284c7" />
      </TouchableOpacity>
      
      <Text style={styles.title}>Ops! Lista vazia</Text>
      <Text style={styles.message}>{message}</Text>
      
      <View style={styles.suggestions}>
        <View style={styles.suggestionItem}>
          <Ionicons name="time-outline" size={16} color="#0284c7" />
          <Text style={styles.suggestionText}>Novos serviços em breve</Text>
        </View>
      </View>
    </View>
  );
};

export default EmptyState;
