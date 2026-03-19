import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Alert,
  Animated
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Navbar from "../../componentes/navbar";
import Footer from "../../componentes/footer";
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import BasicPlanModal from "../../componentes/areaprestador/PlanoBasicoModal";
import ProPlanModal from "../../componentes/areaprestador/PlanoProModal";
import PremiumPlanModal from "../../componentes/areaprestador/PlanoPremiumodal";

type RootStackParamList = {
  Configuracoes: undefined;
  Dashboard: undefined;
};

type TrialNavigationProp = StackNavigationProp<RootStackParamList>;

interface TrialProps {
  navigation: TrialNavigationProp;
}

type IoniconsName = keyof typeof Ionicons.glyphMap;

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  icon: IoniconsName;
  color: string;
  backgroundColor: string;
  borderColor: string;
  features: string[];
  popular?: boolean;
  gradient: readonly [string, string, ...string[]];
}

const { width, height } = Dimensions.get('window');
const isMobile = width < 768;
const isSmallMobile = width < 375;

// ✅ ANIMAÇÕES PRÉ-CRIADAS FORA DO COMPONENTE (executam antes do render)
const createPreInitializedSnowflakes = () => {
  const snowflakes = [];
  
  // ✅ MAIS FLOCOS - 100 flocos
  for (let i = 0; i < 150; i++) {
    const startY = -Math.random() * height; // Começa em posições aleatórias acima da tela
    const currentY = startY + (Math.random() * height * 1.5); // Posição atual aleatória
    const progress = Math.random(); // Progresso aleatório
    
    const translateY = new Animated.Value(currentY);
    const translateX = new Animated.Value(Math.random() * 80 - 40);
    const rotate = new Animated.Value(progress * 360);
    const opacity = new Animated.Value(0.5 + Math.random() * 0.5);
    
    // ✅ MAIS DEVAGAR - durações maiores
    const duration = 12000 + Math.random() * 15000; // 15-35 segundos
    const swingRange = Math.random() * 120 - 60; // Mais movimento horizontal
    // ✅ FLOCOS MAIORES
    const size = 20 + Math.random() * 40; // 20-60 pixels
    
    // ✅ INICIAR ANIMAÇÃO IMEDIATAMENTE (não espera pelo componente)
    Animated.loop(
      Animated.parallel([
        // Queda contínua - MAIS DEVAGAR
        Animated.timing(translateY, {
          toValue: height + 200,
          duration: duration,
          useNativeDriver: true,
        }),
        // Balanço horizontal - MAIS SUAVE
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: swingRange,
            duration: duration / 3,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: -swingRange / 2,
            duration: duration / 3,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: swingRange / 3,
            duration: duration / 3,
            useNativeDriver: true,
          }),
        ]),
        // Rotação contínua - MAIS DEVAGAR
        Animated.timing(rotate, {
          toValue: 360 + progress * 360,
          duration: 8000 + Math.random() * 12000,
          useNativeDriver: true,
        }),
        // Opacidade flutuante - MAIS SUAVE
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.8,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.9,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.7,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
    
    snowflakes.push({
      id: i,
      translateY,
      translateX,
      rotate,
      opacity,
      size,
    });
  }
  
  return snowflakes;
};

// ✅ CRIAR AS ANIMAÇÕES ANTES DO COMPONENTE MONTAR
const preInitializedSnowflakes = createPreInitializedSnowflakes();

const TrialScreen: React.FC<TrialProps> = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");
  const [basicModalVisible, setBasicModalVisible] = useState(false);
  const [proModalVisible, setProModalVisible] = useState(false);
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);

  // Usar as animações pré-inicializadas
  const [snowflakes] = useState(preInitializedSnowflakes);

  const plans: Plan[] = [
    {
      id: "basic",
      name: "Básico",
      price: "R$ 49",
      period: "por mês",
      icon: "construct",
      color: "#ffffff",
      backgroundColor: "#0284c7",
      borderColor: "#0284c7",
      gradient: ["#0398e2ff", "#036697ff", "#00285cff"] as const,
      features: [
        "Até 5 serviços por mês",
        "Perfil visível na plataforma",
        "Acesso a clientes da sua região",
        "Suporte por email",
        "Avaliações de clientes"
      ]
    },
    {
      id: "pro",
      name: "Profissional",
      price: "R$ 139",
      period: "por mês",
      icon: "snow",
      color: "#ffffff",
      backgroundColor: "#cfa109ff",
      borderColor: "#cfa109ff",
      gradient: ["rgba(255, 72, 0, 1)", "rgba(255, 72, 0, 1)", "#d42148ff"] as const,
      features: [
        "Serviços ilimitados",
        "Destaque nos resultados de busca",
        "Acesso a clientes em toda a cidade",
        "Suporte prioritário",
        "Perfil verificado",
        "Agendamento inteligente",
        "Relatórios de desempenho"
      ],
      popular: true
    },
    {
      id: "premium",
      name: "Premium",
      price: "R$ 149",
      period: "por mês",
      icon: "diamond",
      color: "#ffffff",
      backgroundColor: "#1f2937",
      borderColor: "#374151",
      gradient: ["#374151", "#1f2937", "#0b101aff"] as const,
      features: [
        "Todos os recursos do Pro",
        "Posição premium nos resultados",
        "Acesso a clientes premium",
        "Suporte 24/7 dedicado",
        "Campanhas promocionais incluídas",
        "Treinamentos exclusivos",
        "Certificado de excelência",
        "Indicações prioritárias"
      ]
    }
  ];

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handlePlanPress = (planId: string) => {
    switch (planId) {
      case "basic":
        setBasicModalVisible(true);
        break;
      case "pro":
        setProModalVisible(true);
        break;
      case "premium":
        setPremiumModalVisible(true);
        break;
    }
  };

  const handleContinue = () => {
    if (!selectedPlan) {
      Alert.alert("Selecione um plano", "Escolha um plano para continuar usando o ConsertAR");
      return;
    }

    Alert.alert(
      "Plano Selecionado",
      `Você escolheu o plano ${plans.find(p => p.id === selectedPlan)?.name}. Redirecionando para pagamento...`,
      [
        {
          text: "Continuar",
          onPress: () => {
            navigation.navigate('Dashboard');
          }
        }
      ]
    );
  };

  // Componente para os flocos de neve 
  const Snowflake = ({ snowflake }: { snowflake: any }) => {
    const rotate = snowflake.rotate.interpolate({
      inputRange: [0, 360],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View
        style={[
          styles.snowflake,
          {
            left: `${Math.random() * 100}%`,
            transform: [
              { translateY: snowflake.translateY },
              { translateX: snowflake.translateX },
              { rotate }
            ],
            opacity: snowflake.opacity,
            width: snowflake.size,
            height: snowflake.size,
          },
        ]}
      >
        <Ionicons 
          name="snow" 
          size={snowflake.size * 0.5} // ✅ ÍCONES MAIORES
          color="rgba(255, 255, 255, 0.35)" // ✅ MAIS BRANCO
        />
      </Animated.View>
    );
  };

  const renderPlanCard = (item: Plan) => {
    const isSelected = selectedPlan === item.id;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.planCard,
          isSelected && styles.planCardSelected,
        ]}
        onPress={() => handlePlanPress(item.id)}
      >
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          <View style={styles.planContent}>
            <View style={styles.planLeft}>
              <View style={[styles.planIconContainer, { 
                backgroundColor: 'rgba(255,255,255,0.2)',
              }]}>
                <Ionicons name={item.icon} size={isMobile ? 24 : 28} color={item.color} />
              </View>
              <View style={styles.planInfo}>
                <Text style={[styles.planName, { color: item.color }]}>{item.name}</Text>
                <Text style={[styles.planDescription, { color: 'rgba(255,255,255,0.8)' }]}>
                  {item.features.length} benefícios incluídos
                </Text>
              </View>
            </View>

            <View style={styles.planRight}>
              <View style={styles.priceContainer}>
                <Text style={[styles.price, { color: item.color }]}>{item.price}</Text>
                <Text style={[styles.period, { color: 'rgba(255,255,255,0.8)' }]}>{item.period}</Text>
              </View>
              <View style={[
                styles.selectionIndicator,
                { 
                  backgroundColor: isSelected ? item.color : 'rgba(255,255,255,0.3)',
                }
              ]}>
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color={item.gradient[1]} />
                )}
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={['#00285cff', '#036697ff', '#0398e2ff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Flocos de neve animados em background */}
      <View style={styles.snowContainer}>
        {snowflakes.map((snowflake) => (
          <Snowflake
            key={snowflake.id}
            snowflake={snowflake}
          />
        ))}
      </View>

      <Navbar />
      
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Escolha seu Plano!</Text>
            <Text style={styles.heroSubtitle}>
              Continue recebendo serviços de ar condicionado com um plano que atenda suas necessidades!
            </Text>
          </View>
        </View>

        {/* Container dos Planos Disponíveis */}
        <View style={styles.plansContainerSection}>
          <View style={styles.plansContainerCard}>
            <View style={styles.plansContainerHeader}>
              <View style={styles.plansContainerContent}>
                <Text style={styles.plansContainerTitle}>Planos Disponíveis</Text>
                <Text style={styles.plansContainerText}>
                  Escolha o plano ideal para continuar recebendo serviços de ar condicionado:
                </Text>
              </View>
            </View>
            
            {/* Cards de Planos - Layout Compacto */}
            <View style={styles.plansSection}>
              <View style={styles.plansGrid}>
                {plans.map(plan => renderPlanCard(plan))}
              </View>
            </View>
          </View>
        </View>

        {/* Botão Continuar */}
        <View style={styles.continueSection}>
          <TouchableOpacity 
            style={[
              styles.continueButton,
              !selectedPlan && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedPlan}
          >
            <LinearGradient
              colors={
                selectedPlan === "basic" 
                  ? ['#0398e2', '#036697', '#00285c'] as const
                  : selectedPlan === "pro" 
                  ? ['#ff4800', '#ff4800', '#d42148'] as const
                  : selectedPlan === "premium"
                  ? ['#374151', '#1f2937', '#0b101a'] as const
                  : ['#94a3b8', '#64748b'] as const
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueButtonGradient}
            >
              <View style={styles.continueButtonContent}>
                <Text style={styles.continueButtonText}>
                  {selectedPlan 
                    ? `Continuar com ${plans.find(p => p.id === selectedPlan)?.name}` 
                    : 'Selecione um Plano'
                  }
                </Text>
                {selectedPlan ? (
                  <Ionicons 
                    name={plans.find(p => p.id === selectedPlan)?.icon} 
                    size={20} 
                    color="#ffffff" 
                  />
                ) : (
                  <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.securityInfo}>
            <Ionicons name="shield-checkmark" size={14} color="#10b981" />
            <Text style={styles.secureText}>
              Pagamento 100% seguro • Dados protegidos 
            </Text>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
            <Text style={styles.sectionSubtitle}>
              Tire suas dúvidas sobre nossos planos
            </Text>
          </View>
          <View style={styles.faqGrid}>
            {[
              {
                question: "Posso mudar de plano depois?",
                answer: "Sim, você pode fazer upgrade a qualquer momento. A diferença será cobrada proporcionalmente."
              },
              {
                question: "Qual a forma de pagamento?",
                answer: "Aceitamos cartão de crédito, PIX e boleto. Parcelamos em até 12x no cartão."
              },
              {
                question: "Há fidelidade?",
                answer: "Não, você pode cancelar quando quiser sem multa ou taxa adicional."
              },
              {
                question: "Suporte é 24 horas?",
                answer: "Apenas no plano Premium. Outros planos têm suporte em horário comercial."
              }
            ].map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <View style={styles.faqHeader}>
                  <Ionicons name="help-circle" size={20} color="#0284c7" />
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                </View>
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Modais dos Planos */}
      <BasicPlanModal
        visible={basicModalVisible}
        onClose={() => setBasicModalVisible(false)}
        plan={plans.find(p => p.id === "basic")}
        selectedPlan={selectedPlan}
        onSelectPlan={handlePlanSelection}
      />

      <ProPlanModal
        visible={proModalVisible}
        onClose={() => setProModalVisible(false)}
        plan={plans.find(p => p.id === "pro")}
        selectedPlan={selectedPlan}
        onSelectPlan={handlePlanSelection}
      />

      <PremiumPlanModal
        visible={premiumModalVisible}
        onClose={() => setPremiumModalVisible(false)}
        plan={plans.find(p => p.id === "premium")}
        selectedPlan={selectedPlan}
        onSelectPlan={handlePlanSelection}
      />

      <Footer />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  snowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  snowflake: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    paddingTop: isMobile ? 60 : 100,
    paddingBottom: 50,
    paddingHorizontal: isMobile ? 24 : 40,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: 600,
  },
  heroTitle: {
    fontSize: isMobile ? 32 : 48,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: isMobile ? 38 : 52,
  },
  heroSubtitle: {
    fontSize: isMobile ? 16 : 18,
    color: '#e0f2fe',
    textAlign: 'center',
    lineHeight: isMobile ? 24 : 26,
    marginBottom: 40,
    fontWeight: '500',
  },
  plansContainerSection: {
    paddingHorizontal: isMobile ? 20 : 40,
    marginTop: 0,
    zIndex: 10,
  },
  plansContainerCard: {
    backgroundColor: '#ffffff',
    padding: isMobile ? 24 : 28,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  plansContainerHeader: {
    marginBottom: 24,
  },
  plansContainerContent: {
    flex: 1,
  },
  plansContainerTitle: {
    fontSize: isMobile ? 22 : 25,
    fontWeight: '900',
    color: '#0284c7',
    marginBottom: 6,
    textAlign: 'center',
  },
  plansContainerText: {
    fontSize: isMobile ? 14 : 15,
    color: '#64748b',
    lineHeight: isMobile ? 20 : 22,
    fontWeight: '500',
    textAlign: 'center',
  },
  plansSection: {
    paddingTop: 0,
    backgroundColor: 'transparent',
  },
  plansGrid: {
    gap: 16,
    width: '100%',
  },
  planCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientBackground: {
    borderRadius: 13,
    padding: isMobile ? 20 : 24,
  },
  planCardSelected: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    transform: [{ scale: 1.02 }],
  },
  planContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  planIconContainer: {
    width: isMobile ? 48 : 56,
    height: isMobile ? 48 : 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isMobile ? 12 : 16,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: isMobile ? 18 : 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: isMobile ? 13 : 14,
    fontWeight: '500',
  },
  planRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isMobile ? 12 : 16,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: '800',
  },
  period: {
    fontSize: isMobile ? 12 : 13,
    marginTop: 2,
    fontWeight: '500',
  },
  selectionIndicator: {
    width: isMobile ? 24 : 28,
    height: isMobile ? 24 : 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueSection: {
    padding: isMobile ? 20 : 40,
    paddingTop: 30,
    paddingBottom: 30,
    alignItems: 'center',
  },
  continueButton: {
    borderRadius: 14,
    marginBottom: 16,
    width: '100%',
    maxWidth: 300,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonGradient: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    shadowColor: '#64748b',
  },
  continueButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isMobile ? 14 : 16,
    paddingHorizontal: 20,
    gap: 10,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: isMobile ? 15 : 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(249, 241, 246, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  secureText: {
    fontSize: isMobile ? 12 : 13,
    color: '#475569',
    fontWeight: '600',
  },
  faqSection: {
    padding: isMobile ? 20 : 40,
    paddingTop: 40,
    paddingBottom: isMobile ? 80 : 100,
    backgroundColor: '#ffffff',
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: isMobile ? 40 : 50,
    paddingHorizontal: isMobile ? 10 : 0,
  },
  sectionTitle: {
    fontSize: isMobile ? 28 : 40,
    fontWeight: '800',
    color: '#0284c7',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: isMobile ? 34 : 44,
  },
  sectionSubtitle: {
    fontSize: isMobile ? 15 : 17,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: isMobile ? 22 : 24,
    maxWidth: 500,
    fontWeight: '500',
  },
  faqGrid: {
    gap: 20,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  faqItem: {
    backgroundColor: '#ffffff',
    padding: isMobile ? 20 : 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  faqQuestion: {
    fontSize: isMobile ? 16 : 17,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  faqAnswer: {
    fontSize: isMobile ? 14 : 15,
    color: '#64748b',
    lineHeight: isMobile ? 20 : 22,
    fontWeight: '500',
    paddingLeft: 32,
  },
});

export default TrialScreen;