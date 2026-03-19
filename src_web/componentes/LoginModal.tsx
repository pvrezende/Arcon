import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  onClientePress: () => void;
  onPrestadorPress: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  visible,
  onClose,
  onClientePress,
  onPrestadorPress,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header do Modal */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Entrar</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Conteúdo do Modal */}
          <View style={styles.modalContent}>
            <Text style={styles.subtitle}>
              Escolha como você deseja entrar:
            </Text>

            {/* Botão Cliente */}
            <TouchableOpacity 
              style={styles.loginOptionButton}
              onPress={onClientePress}
            >
              <View style={styles.buttonContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name="person-outline" size={24} color="#0284c7" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.buttonTitle}>Cliente</Text>
                  <Text style={styles.buttonSubtitle}>
                    Contratar serviços de climatização
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#64748b" />
              </View>
            </TouchableOpacity>

            {/* Botão Prestador */}
            <TouchableOpacity 
              style={styles.loginOptionButton}
              onPress={onPrestadorPress}
            >
              <View style={styles.buttonContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name="briefcase-outline" size={24} color="#10b981" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.buttonTitle}>Prestador</Text>
                  <Text style={styles.buttonSubtitle}>
                    Oferecer serviços de climatização
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#64748b" />
              </View>
            </TouchableOpacity>

            {/* Informação adicional */}
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle-outline" size={16} color="#64748b" />
              <Text style={styles.infoText}>
                Você será redirecionado para a página de login correspondente
              </Text>
            </View>
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
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#E0F2FE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  loginOptionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
});

export default LoginModal;
