import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { setUserSubscriptionPlan } from '../../utils/userUtils';

const { width, height } = Dimensions.get('window');
const isMobile = width < 768;
const isTablet = width >= 768 && width < 1024;
const isDesktop = width >= 1024;

interface ModalPremiumProps {
  visible: boolean;
  onClose: () => void;
  onAssinar: () => void;
  navigation?: any;
}

const ModalPremium: React.FC<ModalPremiumProps> = ({ visible, onClose, onAssinar, navigation }) => {
  const navigationHook = navigation || useNavigation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handleAssinar = () => {
    setIsProcessing(true);
    setShowLoadingScreen(true);
    
    // Definir plano premium no localStorage
    setUserSubscriptionPlan('PREMIUM');
    
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    setTimeout(() => {
      console.log('Finalizando animação e redirecionando...');
      setIsProcessing(false);
      setShowLoadingScreen(false);
      onClose();
      
      // Redirecionar para areaprestador com plano premium
      try {
        console.log('Tentando redirecionar usando window.location...');
        window.location.href = '/areaprestador?plan=premium';
        console.log('Redirecionamento via window.location executado!');
      } catch (error) {
        console.error('Erro no redirecionamento window.location:', error);
        
        try {
          console.log('Tentando redirecionar para AreaPrestador via React Navigation...');
          navigationHook.reset({
            index: 0,
            routes: [{ name: 'AreaPrestador' as never }],
          });
          console.log('Redirecionamento React Navigation executado!');
        } catch (navError) {
          console.error('Erro no React Navigation:', navError);
          try {
            navigationHook.navigate('AreaPrestador' as never);
            console.log('Fallback navigate executado!');
          } catch (fallbackError) {
            console.error('Erro no fallback final:', fallbackError);
          }
        }
      }
    }, 3000);
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (showLoadingScreen) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.loadingOverlay}>
          <LinearGradient
            colors={['#000000', '#1a1a1a', '#000000']}
            style={styles.loadingContainer}
          >
            <View style={styles.diamondContainer}>
              <Animated.View 
                style={{
                  transform: [
                    { rotateY: rotateInterpolate },
                    { scale: pulseAnim }
                  ]
                }}
              >
                <Ionicons name="diamond" size={isMobile ? 80 : isTablet ? 100 : 120} color="rgba(255, 255, 255, 1)ff" />
              </Animated.View>
            </View>
            
            <Text style={styles.loadingText}>Processando Assinatura Premium...</Text>
            <Text style={styles.loadingSubtext}>Redirecionando para sua área...</Text>
          </LinearGradient>
        </View>
      </Modal>
    );
  }

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
            colors={['#000000FF', '#1f1d18ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconeContainer}>
                <Animated.View 
                  style={{
                    transform: [
                      { rotateY: rotateInterpolate },
                      { scale: scaleAnim }
                    ]
                  }}
                >
                  <Ionicons name="diamond" size={32} color="#ffffffff" />
                </Animated.View>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Badge Premium */}
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>PREMIUM</Text>
            </View>

            {/* Título */}
            <Text style={styles.titulo}>Plano Premium</Text>
            
            {/* Preço */}
            <View style={styles.precoContainer}>
              <Text style={styles.preco}>R$ 69,99</Text>
              <Text style={styles.precoPeriodo}>/mês</Text>
            </View>

            {/* Benefícios */}
            <View style={styles.beneficiosContainer}>
              <Text style={styles.beneficiosTitulo}>O que você recebe:</Text>
              {[
                'Seja o primeiro a ver as propostas',
                'Agende sua visita via chat',
                'Pagamento sem burocracia',
                'Suporte prioritário 24/7',
                'Perfil premium destacado',
                'Relatórios avançados',
                'Integração com WhatsApp',
                'Histórico completo de serviços',
              ].map((beneficio, index) => (
                <View key={index} style={styles.beneficioItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#ffffffff" />
                  <Text style={styles.beneficioTexto}>{beneficio}</Text>
                </View>
              ))}
            </View>

            {/* Botões */}
            <View style={styles.botoesContainer}>
              <TouchableOpacity 
                style={[styles.botaoSecundario, isProcessing && styles.botaoDisabled]} 
                onPress={onClose}
                disabled={isProcessing}
              >
                <Text style={styles.textoBotaoSecundario}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.botaoPrincipal, isProcessing && styles.botaoDisabled]} 
                onPress={handleAssinar}
                disabled={isProcessing}
              >
                <Text style={styles.textoBotaoPrincipal}>
                  {isProcessing ? 'Processando...' : 'Assinar Premium'}
                </Text>
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
    borderWidth: 2,
    borderColor: '#ccccccff',
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
    backgroundColor: '#000000ff',
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
  premiumBadge: {
    backgroundColor: '#ffffffff',
    paddingHorizontal: isMobile ? 15 : 20,
    paddingVertical: isMobile ? 6 : 8,
    borderRadius: isMobile ? 15 : 20,
    marginBottom: isMobile ? 12 : 15,
  },
  premiumBadgeText: {
    color: '#000',
    fontSize: isMobile ? 12 : 14,
    fontWeight: 'bold',
  },
  titulo: {
    fontSize: isMobile ? 22 : isTablet ? 26 : 28,
    fontWeight: 'bold',
    color: '#ffffffff',
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
    color: '#ffffffff',
  },
  precoPeriodo: {
    fontSize: isMobile ? 14 : 18,
    color: '#fff',
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
    backgroundColor: '#ffffffff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBotaoPrincipal: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  garantia: {
    fontSize: isMobile ? 12 : 14,
    color: '#fff',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: isMobile ? 10 : 0,
  },
  botaoDisabled: {
    opacity: 0.6,
  },
  // Estilos para a tela de loading
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: isMobile ? 15 : 20,
  },
  diamondContainer: {
    marginBottom: isMobile ? 30 : 40,
    shadowColor: '#ffffffff',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: isMobile ? 15 : 20,
    elevation: isMobile ? 15 : 20,
  },
  loadingText: {
    fontSize: isMobile ? 18 : isTablet ? 22 : 24,
    fontWeight: 'bold',
    color: '#ffffffff',
    textAlign: 'center',
    marginBottom: isMobile ? 8 : 10,
    paddingHorizontal: isMobile ? 20 : 0,
  },
  loadingSubtext: {
    fontSize: isMobile ? 14 : 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
    paddingHorizontal: isMobile ? 20 : 0,
  },
});

export default ModalPremium;
