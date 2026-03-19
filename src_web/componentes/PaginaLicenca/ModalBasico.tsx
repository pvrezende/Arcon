import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { setUserSubscriptionPlan } from '../../utils/userUtils';

const { width, height } = Dimensions.get('window');
const isMobile = width < 768;
const isTablet = width >= 768 && width < 1024;
const isDesktop = width >= 1024;

interface ModalBasicoProps {
  visible: boolean;
  onClose: () => void;
  onAssinar: () => void;
}

const ModalBasico: React.FC<ModalBasicoProps> = ({ visible, onClose, onAssinar }) => {
  const handleAssinar = () => {
    // Definir plano básico no localStorage
    setUserSubscriptionPlan('BASICO');
    
    // Redirecionar para areaprestador (hero section normal)
    window.location.href = '/areaprestador';
    
    // Fechar modal
    onClose();
  };
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#0752dbff', '#2818b8ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconeContainer}>
                <Ionicons name="snow" size={32} color="#dde9ffff" />
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Título */}
            <Text style={styles.titulo}>Plano Básico</Text>
            
            {/* Preço */}
            <View style={styles.precoContainer}>
              <Text style={styles.preco}>R$ 29,99</Text>
              <Text style={styles.precoPeriodo}>/mês</Text>
            </View>

            {/* Benefícios */}
            <View style={styles.beneficiosContainer}>
              <Text style={styles.beneficiosTitulo}>O que você recebe:</Text>
              {[
                'com anúncios',
                'até 10 propostas por dia',
                'Encontre clientes fácil',
                'Suporte básico por email',
                'Perfil profissional simples',
                'Histórico de serviços básico',
                'Notificações por email',
                'Acesso à plataforma web',
              ].map((beneficio, index) => (
                <View key={index} style={styles.beneficioItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#3451f5ff" />
                  <Text style={styles.beneficioTexto}>{beneficio}</Text>
                </View>
              ))}
            </View>

            {/* Botões */}
            <View style={styles.botoesContainer}>
              <TouchableOpacity style={styles.botaoSecundario} onPress={onClose}>
                <Text style={styles.textoBotaoSecundario}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botaoPrincipal} onPress={handleAssinar}>
                <Text style={styles.textoBotaoPrincipal}>Assinar Agora</Text>
              </TouchableOpacity>
            </View>

            {/* Garantia */}
            <Text style={styles.garantia}>
              7 dias grátis - Cancele quando quiser
            </Text>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: isMobile ? 10 : 20,
  },
  modalContainer: {
    width: isMobile ? width - 20 : isTablet ? 450 : 500,
    maxWidth: isDesktop ? 550 : '90%',
    maxHeight: isMobile ? '90%' : '85%',
  },
  modalContent: {
    borderRadius: isMobile ? 15 : 20,
    padding: isMobile ? 20 : isTablet ? 25 : 30,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: isMobile ? 15 : 20,
  },
  iconeContainer: {
    width: isMobile ? 50 : 60,
    height: isMobile ? 50 : 60,
    borderRadius: isMobile ? 25 : 30,
    backgroundColor: '#172b9bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: isMobile ? 35 : 40,
    height: isMobile ? 35 : 40,
    borderRadius: isMobile ? 17.5 : 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontSize: isMobile ? 22 : isTablet ? 26 : 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: isMobile ? 8 : 10,
    textAlign: 'center',
  },
  precoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: isMobile ? 20 : 30,
    justifyContent: 'center',
  },
  preco: {
    fontSize: isMobile ? 36 : isTablet ? 42 : 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  precoPeriodo: {
    fontSize: isMobile ? 14 : 18,
    color: '#dde9ffff',
    marginLeft: 5,
  },
  beneficiosContainer: {
    width: '100%',
    marginBottom: isMobile ? 20 : 30,
  },
  beneficiosTitulo: {
    fontSize: isMobile ? 16 : 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: isMobile ? 12 : 15,
    textAlign: 'center',
  },
  beneficioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isMobile ? 6 : 8,
    paddingHorizontal: isMobile ? 5 : 10,
  },
  beneficioTexto: {
    fontSize: isMobile ? 14 : 16,
    color: '#fff',
    marginLeft: isMobile ? 8 : 10,
    flex: 1,
    lineHeight: isMobile ? 18 : 20,
  },
  botoesContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 15,
    marginBottom: 20,
  },
  botaoSecundario: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBotaoSecundario: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoPrincipal: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBotaoPrincipal: {
    color: '#0752dbff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  garantia: {
    fontSize: isMobile ? 12 : 14,
    color: '#dde9ffff',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: isMobile ? 10 : 0,
  },
});

export default ModalBasico;
