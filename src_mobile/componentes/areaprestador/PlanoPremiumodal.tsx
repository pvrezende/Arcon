// componentes/planmodals/PremiumPlanModal.tsx
import React, { useRef, useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Modal,
  Animated,
  Dimensions
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Componente para os diamantes caindo continuo
const FallingDiamond = ({ delay = 0 }) => {
  const [position] = useState(new Animated.Value(-50));
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    const startAnimation = () => {
      // Reset para posição inicial
      position.setValue(-50);
      opacity.setValue(0);

      // Animação de entrada 
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          // Animação de queda
          Animated.timing(position, {
            toValue: height + 50,
            duration: 8000 + Math.random() * 4000, // 8-12 segundos
            useNativeDriver: true,
          }),
          // Animação de fade in/out repeat
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.4,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.4,
              duration: 6000, // visível por mais tempo
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(() => {
        // Reinicia IMEDIATAMENTE a animação quando terminar
        startAnimation();
      });
    };

    startAnimation();

    // Cleanup quando o componente desmontar
    return () => {
      position.stopAnimation();
      opacity.stopAnimation();
    };
  }, [delay]);

  const left = 10 + Math.random() * (width - 20); // Margem nas laterais

  return (
    <Animated.View
      style={[
        styles.fallingDiamond,
        {
          left,
          transform: [{ translateY: position }],
          opacity,
        },
      ]}
      pointerEvents="none"
    >
      <Ionicons 
        name="diamond" 
        size={8 + Math.random() * 12} // Tamanhos mais variados
        color="#ffffff" 
        style={{ opacity: 0.7 + Math.random() * 0.3 }} // Opacidade variada
      />
    </Animated.View>
  );
};

const DiamondRain = () => {
  // AUMENTEI o número de diamantes para chuva mais densa e contínua
  const diamonds = Array.from({ length: 80 }, (_, index) => (
    <FallingDiamond 
      key={index} 
      delay={index * 150} // Delay maior entre diamantes
    />
  ));

  return (
    <View style={styles.diamondRainContainer} pointerEvents="none">
      {diamonds}
    </View>
  );
};

const PremiumPlanModal = ({ visible, onClose, plan, selectedPlan, onSelectPlan }) => {
  const [diamondRotateAnim] = useState(new Animated.Value(0));
  const [diamondGlowAnim] = useState(new Animated.Value(0));

  // Efeito para as animações do diamante 
  useEffect(() => {
    if (visible && plan?.id === "premium") {
      // Animação de rotação vertical como uma peteca
      Animated.loop(
        Animated.timing(diamondRotateAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();

      // Animação de brilho pulsante
      Animated.loop(
        Animated.sequence([
          Animated.timing(diamondGlowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(diamondGlowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      // Reset das animações quando o modal fechar
      diamondRotateAnim.setValue(0);
      diamondGlowAnim.setValue(0);
    }
  }, [visible, plan]);

  // Animação de rotação vertical como uma peteca 
  const diamondRotateAnimatedStyle = plan?.id === "premium" ? {
    transform: [
      { perspective: 1000 }, // perspective PRIMEIRO
      {
        rotateY: diamondRotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg']
        }) as any 
      }
    ] as any,
  } : {};

  // Animação de brilho do diamante
  const diamondGlowAnimatedStyle = plan?.id === "premium" ? {
    opacity: diamondGlowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 1]
    }),
    shadowOpacity: diamondGlowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.8]
    }),
  } : {};

  if (!plan) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        onClose();
        diamondRotateAnim.setValue(0);
        diamondGlowAnim.setValue(0);
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          {/* Chuva de diamantes apenas para o plano Premium - AGORA CONTÍNUA */}
          {plan.id === "premium" && <DiamondRain />}
          
          <LinearGradient
            colors={plan.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalGradient}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <Animated.View style={[
                  styles.modalIconContainer,
                  diamondGlowAnimatedStyle
                ]}>
                  {plan.id === "premium" ? (
                    <Animated.View style={[diamondRotateAnimatedStyle, styles.diamond3DContainer]}>
                      <Ionicons 
                        name={plan.icon} 
                        size={32} 
                        color="#ffffff" 
                      />
                    </Animated.View>
                  ) : (
                    <Ionicons 
                      name={plan.icon} 
                      size={32} 
                      color="#ffffff" 
                    />
                  )}
                </Animated.View>
                <Text style={styles.modalTitle}>{plan.name}</Text>
                <View style={styles.modalPriceContainer}>
                  <Text style={styles.modalPrice}>{plan.price}</Text>
                  <Text style={styles.modalPeriod}>{plan.period}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  onClose();
                  diamondRotateAnim.setValue(0);
                  diamondGlowAnim.setValue(0);
                }}
              >
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView style={styles.modalBody}>
            <View style={styles.featuresList}>
              <Text style={styles.featuresTitle}>Benefícios Incluídos:</Text>
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

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[
                styles.selectPlanButton,
                { backgroundColor: plan.gradient[1] }
              ]}
              onPress={() => {
                onSelectPlan(plan.id);
                onClose();
                diamondRotateAnim.setValue(0);
                diamondGlowAnim.setValue(0);
              }}
            >
              <Text style={styles.selectPlanButtonText}>
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
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  modalGradient: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    padding: 24,
    position: 'relative',
  },
  modalHeaderContent: {
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  modalPriceContainer: {
    alignItems: 'center',
  },
  modalPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
  },
  modalPeriod: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  modalBody: {
    maxHeight: 400,
    padding: 24,
  },
  featuresList: {
    gap: 12,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    fontWeight: '500',
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  selectPlanButton: {
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
  selectPlanButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  diamondRainContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  fallingDiamond: {
    position: 'absolute',
    zIndex: 1,
  },
  // Container para o efeito 3D do diamante
  diamond3DContainer: {
    transformStyle: 'preserve-3d' as any, 
  },
});

export default PremiumPlanModal;