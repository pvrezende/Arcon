// componentes/credencialprestador/CredencialPrestador.js
import React, { useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated
} from "react-native";
import { Ionicons } from '@expo/vector-icons';

const CredencialPrestador = ({ visible, onClose }) => {
  // Animações
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Iniciar animação quando o modal ficar visível
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Resetar animações quando o modal fechar
      scaleAnim.setValue(0.8);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    // Animação de saída
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              opacity: fadeAnim
            }
          ]}
        >
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.modalContent,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: fadeAnim
                }
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Credenciais do Prestador</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={handleClose}
                >
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.credenciaisContainer}>
                <View style={styles.credencialItem}>
                  <View style={styles.credencialIcon}>
                    <Ionicons name="shield-checkmark" size={24} color="#10b981" />
                  </View>
                  <View style={styles.credencialInfo}>
                    <Text style={styles.credencialLabel}>Status</Text>
                    <Text style={styles.credencialValue}>Prestador Verificado</Text>
                  </View>
                </View>
                
                <View style={styles.credencialItem}>
                  <View style={styles.credencialIcon}>
                    <Ionicons name="business" size={24} color="#0284c7" />
                  </View>
                  <View style={styles.credencialInfo}>
                    <Text style={styles.credencialLabel}>Credenciado por:</Text>
                    <Text style={styles.credencialValue}>Elgin</Text>
                  </View>
                </View>
                
                <View style={styles.credencialItem}>
                  <View style={styles.credencialIcon}>
                    <Ionicons name="calendar" size={24} color="#9957f0ff" />
                  </View>
                  <View style={styles.credencialInfo}>
                    <Text style={styles.credencialLabel}>Membro desde</Text>
                    <Text style={styles.credencialValue}>Janeiro 2024</Text>
                  </View>
                </View>
                
                <View style={styles.credencialItem}>
                  <View style={styles.credencialIcon}>
                    <Ionicons name="star" size={24} color="#f59e0b" />
                  </View>
                  <View style={styles.credencialInfo}>
                    <Text style={styles.credencialLabel}>Avaliação</Text>
                    <Text style={styles.credencialValue}>4.8/5.0</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.modalFooter}>
                <Text style={styles.modalFooterText}>
                  Suas credenciais ajudam os clientes a confiarem no seu trabalho
                </Text>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
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
    padding: 0,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#FFA500',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeButton: {
    padding: 4,
  },
  credenciaisContainer: {
    padding: 24,
  },
  credencialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  credencialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  credencialInfo: {
    flex: 1,
  },
  credencialLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  credencialValue: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
  },
  modalFooter: {
    padding: 24,
    backgroundColor: '#FFA500',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  modalFooterText: {
    fontSize: 14,
    color: '#ffffffff',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CredencialPrestador;