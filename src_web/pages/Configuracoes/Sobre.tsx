import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions 
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Navbar from "../../componentes/navbar";
import Footer from "../../componentes/footer";
import { StackNavigationProp } from '@react-navigation/stack';

// Definindo os tipos para as rotas de navegação 
type RootStackParamList = {
  Configuracoes: undefined;
};

type SobreNavigationProp = StackNavigationProp<RootStackParamList>;

interface SobreProps {
  navigation: SobreNavigationProp;
}

// Tipo para os ícones do Ionicons
type IoniconsName = keyof typeof Ionicons.glyphMap;

interface CompanyValue {
  icon: IoniconsName;
  title: string;
  description: string;
  color: string;
}

const { width } = Dimensions.get('window');
const isMobile = width < 768;

const SobreConsertAR: React.FC<SobreProps> = ({ navigation }) => {

  // Função para voltar para a página anterior
  const goBack = (): void => {
    navigation.goBack();
  };

  // Valores da empresa - CORRIGIDO com tipos específicos
  const companyValues: CompanyValue[] = [
    {
      icon: "shield-checkmark",
      title: "Confiança",
      description: "No ConsertAR, acreditamos que confiança é a base de qualquer relacionamento duradouro. Por isso, trabalhamos com total transparência em cada etapa do atendimento. Nossos clientes sabem exatamente o que esperar e têm a segurança de contar com uma equipe responsável. Cada conserto é tratado com seriedade, sempre buscando superar expectativas. Assim, construímos vínculos sólidos e duradouros.",
      color: "#0369a1"
    },
    {
      icon: "flash",
      title: "Agilidade",
      description: "Valorizamos o tempo de nossos clientes e entendemos a importância de soluções rápidas e eficazes. Por isso, nossa equipe é treinada para oferecer atendimentos ágeis sem abrir mão da qualidade. Do agendamento até a conclusão do serviço, tudo é pensado para ser prático e eficiente. A rapidez nos processos é um diferencial que garante satisfação. Afinal, seu problema não pode esperar.",
      color: "#059669"
    },
    {
      icon: "heart",
      title: "Compromisso",
      description: "Nosso compromisso vai além de entregar um serviço bem-feito: é com cada cliente e sua tranquilidade. Trabalhamos de forma ética e responsável, respeitando prazos e acordos estabelecidos. Buscamos compreender as necessidades individuais e oferecer soluções personalizadas. Cada reparo é realizado com atenção aos detalhes e dedicação total. Assim, garantimos resultados consistentes e duradouros.",
      color: "#dc2626"
    },
    {
      icon: "star",
      title: "Excelência",
      description: "A excelência é o padrão que norteia todas as nossas ações no ConsertAR. Investimos em capacitação, tecnologia e boas práticas para oferecer sempre o melhor. Cada detalhe importa: desde o primeiro contato até a finalização do serviço. Trabalhamos constantemente para aprimorar processos e superar expectativas. É essa busca que nos diferencia e gera orgulho em cada entrega.",
      color: "#d97706"
    }
  ];

  return (
    <View style={styles.container}>
      {/* Navbar no topo */}
      <Navbar />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Botão Voltar - COM FUNDO AZUL E TEXTO BRANCO */}
        <View style={styles.botaoVoltarContainer}>
          <TouchableOpacity style={styles.botaoVoltar} onPress={goBack}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
            <Text style={styles.botaoVoltarTexto}>Voltar</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroBackground}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Ionicons name="snow" size={32} color="#ffffff" />
              </View>
            </View>
            
            <Text style={styles.heroTitle}>Sobre o ConsertAR</Text>
            <Text style={styles.heroSubtitle}>
              Conheça os valores que nos movem e a missão que nos guia
            </Text>
          </View>
        </View>

        {/* Introdução */}
        <View style={styles.introSection}>
          <Text style={styles.introText}>
            O <Text style={styles.highlight}>ConsertAR</Text> nasceu da necessidade de unir 
            <Text style={styles.highlight}> tecnologia, confiança e praticidade </Text> 
            no mundo dos consertos. Somos mais que um serviço, somos a solução que você precisa 
            com a qualidade que você merece.
          </Text>
        </View>

        {/* Valores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nossos Valores</Text>
          <Text style={styles.sectionSubtitle}>
            Princípios que guiam cada ação e decisão em nossa empresa
          </Text>
          
          <View style={styles.valuesContainer}>
            {companyValues.map((value, index) => (
              <View 
                key={index} 
                style={[
                  styles.valueCard,
                  { borderLeftColor: value.color }
                ]}
              >
                <View style={[styles.valueIconContainer, { backgroundColor: `${value.color}15` }]}>
                  <Ionicons name={value.icon} size={28} color={value.color} />
                </View>
                <Text style={[styles.valueTitle, { color: value.color }]}>
                  {value.title}
                </Text>
                <Text style={styles.valueDescription}>{value.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Missão e Visão */}
        <View style={styles.missionVisionSection}>
          <View style={styles.missionVisionContainer}>
            <View style={styles.missionVisionCard}>
              <View style={[styles.mvIconContainer, { backgroundColor: '#0284c7' }]}>
                <Ionicons name="rocket" size={28} color="#ffffff" />
              </View>
              <Text style={styles.mvTitle}>Nossa Missão</Text>
              <Text style={styles.mvDescription}>
                Proporcionar soluções rápidas, eficientes e confiáveis em consertos, 
                transformando problemas em satisfação através da excelência no atendimento 
                e qualidade nos serviços prestados.
              </Text>
            </View>

            <View style={styles.missionVisionCard}>
              <View style={[styles.mvIconContainer, { backgroundColor: '#7c3aed' }]}>
                <Ionicons name="eye" size={28} color="#ffffff" />
              </View>
              <Text style={styles.mvTitle}>Nossa Visão</Text>
              <Text style={styles.mvDescription}>
                Ser referência nacional em serviços de conserto, reconhecida pela 
                inovação, confiabilidade e compromisso com a satisfação total do cliente, 
                expandindo nosso alcance e impacto positivo.
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Footer na base */}
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc',
  },
  // ESTILOS DO BOTÃO VOLTAR - FUNDO AZUL E TEXTO BRANCO
  botaoVoltarContainer: { 
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#0284c7', // FUNDO AZUL
  },
  botaoVoltar: { 
    flexDirection: 'row', 
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'transparent',
  },
  botaoVoltarTexto: { 
    marginLeft: 8, 
    color: '#ffffff', // TEXTO BRANCO
    fontSize: 16, 
    fontWeight: '500' 
  },
  scrollContainer: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: '#0284c7',
    paddingBottom: 40,
  },
  heroBackground: {
    alignItems: 'center',
    padding: isMobile ? 30 : 40,
    paddingTop: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heroTitle: {
    fontSize: isMobile ? 32 : 40,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: isMobile ? 16 : 18,
    color: '#e0f2fe',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 600,
  },
  introSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: isMobile ? 20 : 40,
    marginTop: -20,
    padding: 25,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  introText: {
    fontSize: 17,
    color: '#475569',
    lineHeight: 26,
    textAlign: 'center',
  },
  highlight: {
    color: '#0284c7',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#ffffff',
    margin: isMobile ? 20 : 40,
    marginTop: 30,
    padding: isMobile ? 25 : 30,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: isMobile ? 26 : 30,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 35,
    lineHeight: 22,
  },
  valuesContainer: {
    flexDirection: 'column',
  },
  valueCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    padding: 25,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  valueIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  valueTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'left',
  },
  valueDescription: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'left',
    lineHeight: 22,
  },
  missionVisionSection: {
    backgroundColor: '#ffffff',
    margin: isMobile ? 20 : 40,
    marginTop: 20,
    marginBottom: 40,
  },
  missionVisionContainer: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: 20,
  },
  missionVisionCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: isMobile ? 20 : 0,
  },
  mvIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  mvTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 15,
    textAlign: 'center',
  },
  mvDescription: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default SobreConsertAR;