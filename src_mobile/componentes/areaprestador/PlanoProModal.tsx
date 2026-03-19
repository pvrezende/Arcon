// componentes/planmodals/ProPlanModal.js
import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Modal
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ProPlanModal = ({ visible, onClose, plan, selectedPlan, onSelectPlan }) => {
  if (!plan) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header com gradiente */}
          <LinearGradient
            colors={plan.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalHeader}
          >
            <View style={styles.headerContent}>
              <View style={styles.planIconContainer}>
                <Ionicons name={plan.icon} size={32} color="#ffffff" />
              </View>
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{plan.price}</Text>
                <Text style={styles.period}>{plan.period}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Conteúdo do modal */}
          <ScrollView style={styles.modalBody}>
            <Text style={styles.featuresTitle}>Benefícios Incluídos:</Text>
            
            <View style={styles.featuresList}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons 
                    name="checkmark-circle" 
                    size={20} 
                    color={plan.gradient[1]} 
                  />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Footer com botão */}
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[
                styles.selectButton,
                { backgroundColor: plan.gradient[1] }
              ]}
              onPress={() => {
                onSelectPlan(plan.id);
                onClose();
              }}
            >
              <Text style={styles.selectButtonText}>
                {selectedPlan === plan.id ? '✓ Plano Selecionado' : 'Selecionar Este Plano'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 24,
    position: 'relative',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 10,
  },
  planIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  priceContainer: {
    alignItems: 'center',
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
  },
  period: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  modalBody: {
    padding: 24,
    maxHeight: 300,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  selectButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProPlanModal;