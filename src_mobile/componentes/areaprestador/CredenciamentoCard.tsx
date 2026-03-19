import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

interface CredenciamentoCardProps {
  possuiCredenciamento?: boolean;
}

const CredenciamentoCard: React.FC<CredenciamentoCardProps> = ({ 
  possuiCredenciamento = false 
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    // @ts-ignore - navegação pode ter tipos diferentes
    navigation.navigate('Credenciamento');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <View style={[
            styles.iconCircle, 
            possuiCredenciamento ? styles.iconCircleSuccess : styles.iconCircleWarning
          ]}>
            <Ionicons 
              name={possuiCredenciamento ? "shield-checkmark" : "shield-outline"} 
              size={32} 
              color="#ffffff" 
            />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>
            {possuiCredenciamento 
              ? "Credenciamento Cadastrado" 
              : "Complete seu Credenciamento"}
          </Text>
          
          <Text style={styles.description}>
            {possuiCredenciamento 
              ? "Visualize ou atualize suas informações de credenciamento profissional"
              : "Adicione suas certificações e credenciais para aumentar a confiança dos clientes"}
          </Text>

          <View style={styles.badgeContainer}>
            <View style={[
              styles.badge,
              possuiCredenciamento ? styles.badgeSuccess : styles.badgeWarning
            ]}>
              <Ionicons 
                name={possuiCredenciamento ? "checkmark-circle" : "alert-circle"} 
                size={14} 
                color={possuiCredenciamento ? "#22c55e" : "#f59e0b"} 
              />
              <Text style={[
                styles.badgeText,
                possuiCredenciamento ? styles.badgeTextSuccess : styles.badgeTextWarning
              ]}>
                {possuiCredenciamento ? "Completo" : "Ação Recomendada"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={24} color="#0284c7" />
        </View>
      </TouchableOpacity>

      {!possuiCredenciamento && (
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Benefícios do Credenciamento:</Text>
          <View style={styles.benefitItem}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text style={styles.benefitText}>Aumente a confiança dos clientes</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="trending-up" size={14} color="#f59e0b" />
            <Text style={styles.benefitText}>Destaque-se da concorrência</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="ribbon" size={14} color="#f59e0b" />
            <Text style={styles.benefitText}>Valide suas credenciais profissionais</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  iconContainer: {
    marginRight: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircleSuccess: {
    backgroundColor: "#22c55e",
  },
  iconCircleWarning: {
    backgroundColor: "#f59e0b",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: "row",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  badgeSuccess: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  badgeWarning: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  badgeTextSuccess: {
    color: "#166534",
  },
  badgeTextWarning: {
    color: "#92400e",
  },
  arrowContainer: {
    marginLeft: 12,
  },
  benefitsContainer: {
    backgroundColor: "#fffbeb",
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 10,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  benefitText: {
    fontSize: 13,
    color: "#78350f",
    flex: 1,
  },
});

export default CredenciamentoCard;

