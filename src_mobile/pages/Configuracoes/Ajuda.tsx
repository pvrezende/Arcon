import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Linking 
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Navbar from "../../componentes/navbar";
import Footer from "../../componentes/footer";
import { StackNavigationProp } from '@react-navigation/stack';
import { API_CONFIG } from "../../../configIp";

// Definindo os tipos para as rotas de navegação 
type RootStackParamList = {
  Configuracoes: undefined;
};

type AjudaNavigationProp = StackNavigationProp<RootStackParamList>;

interface AjudaProps {
  navigation: AjudaNavigationProp;
}

// Tipo para os ícones do Ionicons
type IoniconsName = keyof typeof Ionicons.glyphMap;

interface ContactChannel {
  icon: IoniconsName;
  title: string;
  description: string;
  number?: string;
  email?: string;
  link?: string;
  action: () => void;
  color: string;
}

const { width } = Dimensions.get('window');
const isMobile = width < 768;

const Ajuda: React.FC<AjudaProps> = ({ navigation }) => {

  // Função para voltar para a página anterior

  // Função para abrir email
  const openEmail = (): void => {
    Linking.openURL('mailto:suporte@consertar.com.br');
  };

  // Função para fazer ligação
  const makeCall = (): void => {
    Linking.openURL('tel:+551134567890');
  };

  // Função para abrir WhatsApp
  const openWhatsApp = (): void => {
    Linking.openURL(API_CONFIG.EXTERNAL.WHATSAPP);
  };

  // Perguntas frequentes
  const faqItems = [
    {
      question: "Como agendar um serviço?",
      answer: "Na tela inicial, clique em 'Solicitar Serviço', escolha o tipo de serviço necessário, preencha os detalhes e aguarde as propostas dos técnicos."
    },
    {
      question: "Quais formas de pagamento são aceitas?",
      answer: "Aceitamos cartão de crédito, débito, PIX e dinheiro. O pagamento pode ser feito diretamente ao técnico ou via app para maior segurança."
    },
    {
      question: "Como avalio o serviço prestado?",
      answer: "Após a conclusão do serviço, você receberá uma solicitação para avaliar o técnico. Sua opinião é muito importante para nós!"
    },
    {
      question: "E se eu não ficar satisfeito com o serviço?",
      answer: "Entre em contato conosco imediatamente pelo suporte. Garantimos a qualidade dos serviços e mediamos qualquer insatisfação."
    },
    {
      question: "Os técnicos são verificados?",
      answer: "Sim! Todos os técnicos passam por verificação de documentos, experiência e avaliações antes de serem aprovados em nossa plataforma."
    },
    {
      question: "Posso cancelar um agendamento?",
      answer: "Sim, você pode cancelar até 2 horas antes do horário agendado sem custos. Cancelamentos em cima da hora podem ter taxas."
    }
  ];

  // Canais de atendimento - CORRIGIDO com tipos específicos
  const contactChannels: ContactChannel[] = [
    {
      icon: "call",
      title: "Telefone",
      description: "Atendimento 24h para emergências",
      number: "(11) 3456-7890",
      action: makeCall,
      color: "#10b981"
    },
    {
      icon: "chatbubble-ellipses",
      title: "WhatsApp",
      description: "Suporte rápido via mensagem",
      number: "(11) 98765-4321",
      action: openWhatsApp,
      color: "#25d366"
    },
    {
      icon: "mail",
      title: "E-mail",
      description: "Respondemos em até 24h",
      email: "suporte@consertar.com.br",
      action: openEmail,
      color: "#ea580c"
    },
    {
      icon: "help-circle",
      title: "Central de Ajuda",
      description: "Tutoriais e guias detalhados",
      link: "Acessar FAQ Completo",
      action: () => console.log("Abrir FAQ completo"),
      color: "#8b5cf6"
    }
  ];

  return (
    <View style={styles.container}>
      {/* Navbar no topo */}
      <Navbar />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Botão Voltar - MESMO ESTILO DA PÁGINA SOBRE */}

        {/* Hero Section */}
               <View style={styles.heroSection}>
                 <View style={styles.heroBackground}>
                   <View style={styles.logoContainer}>
                     <View style={styles.logoIcon}>
                       <Ionicons name="snow" size={32} color="#ffffff" />
                     </View>
                   </View>
            
            <Text style={styles.heroTitle}>Central de Ajuda</Text>
            <Text style={styles.heroSubtitle}>
              Estamos aqui para ajudar você! Escolha o melhor canal para seu atendimento
            </Text>
          </View>
        </View>

        {/* Canais de Atendimento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Canais de Atendimento</Text>
          <Text style={styles.sectionSubtitle}>
            Entre em contato conosco pelos canais abaixo
          </Text>
          
          <View style={styles.contactGrid}>
            {contactChannels.map((channel, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.contactCard}
                onPress={channel.action}
              >
                <View style={[styles.contactIconContainer, { backgroundColor: channel.color }]}>
                  <Ionicons name={channel.icon} size={28} color="#ffffff" />
                </View>
                <View style={styles.contactContent}>
                  <Text style={styles.contactTitle}>{channel.title}</Text>
                  <Text style={styles.contactDescription}>{channel.description}</Text>
                  {channel.number && (
                    <Text style={styles.contactDetail}>{channel.number}</Text>
                  )}
                  {channel.email && (
                    <Text style={styles.contactDetail}>{channel.email}</Text>
                  )}
                  {channel.link && (
                    <Text style={styles.contactLink}>{channel.link}</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Perguntas Frequentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
          <Text style={styles.sectionSubtitle}>
            Encontre respostas rápidas para as dúvidas mais comuns
          </Text>
          
          <View style={styles.faqContainer}>
            {faqItems.map((item, index) => (
              <View key={index} style={styles.faqItem}>
                <View style={styles.faqQuestion}>
                  <Ionicons name="help-circle-outline" size={20} color="#0284c7" />
                  <Text style={styles.faqQuestionText}>{item.question}</Text>
                </View>
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Horário de Atendimento */}
        <View style={styles.sectionBlue}>
          <Text style={styles.sectionTitleWhite}>Horários de Atendimento</Text>
          <View style={styles.scheduleContainer}>
            <View style={styles.scheduleItem}>
              <Ionicons name="time" size={24} color="#ffffff" />
              <View style={styles.scheduleText}>
                <Text style={styles.scheduleDay}>Segunda a Sexta</Text>
                <Text style={styles.scheduleTime}>8h às 18h</Text>
              </View>
            </View>
            <View style={styles.scheduleItem}>
              <Ionicons name="time" size={24} color="#ffffff" />
              <View style={styles.scheduleText}>
                <Text style={styles.scheduleDay}>Sábados</Text>
                <Text style={styles.scheduleTime}>8h às 12h</Text>
              </View>
            </View>
            <View style={styles.scheduleItem}>
              <Ionicons name="warning" size={24} color="#ffffff" />
              <View style={styles.scheduleText}>
                <Text style={styles.scheduleDay}>Emergências 24h</Text>
                <Text style={styles.scheduleTime}>Serviços urgentes</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dica Rápida */}
        <View style={styles.tipSection}>
          <View style={styles.tipIcon}>
            <Ionicons name="bulb" size={28} color="#ffffff" />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Dica Rápida</Text>
            <Text style={styles.tipText}>
              Para um atendimento mais rápido, tenha em mãos o modelo do seu ar-condicionado 
              e uma descrição detalhada do problema.
            </Text>
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
  // BOTÃO VOLTAR - EXATAMENTE IGUAL À PÁGINA SOBRE
  botaoVoltarContainer: { 
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#0284c7',
  },
  botaoVoltar: { 
    flexDirection: 'row', 
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'transparent',
  },
  botaoVoltarTexto: { 
    marginLeft: 8, 
    color: '#ffffff',
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
  contactGrid: {
    gap: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  contactIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 6,
  },
  contactDetail: {
    fontSize: 15,
    color: '#0284c7',
    fontWeight: '500',
  },
  contactLink: {
    fontSize: 15,
    color: '#ea580c',
    fontWeight: '500',
  },
  faqContainer: {
    gap: 16,
  },
  faqItem: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 12,
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    paddingLeft: 32,
  },
  sectionBlue: {
    backgroundColor: '#0284c7',
    margin: isMobile ? 20 : 40,
    marginTop: 20,
    padding: isMobile ? 25 : 30,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitleWhite: {
    fontSize: isMobile ? 26 : 30,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 25,
    textAlign: 'center',
  },
  scheduleContainer: {
    gap: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  scheduleText: {
    marginLeft: 16,
  },
  scheduleDay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  scheduleTime: {
    fontSize: 14,
    color: '#e0f2fe',
  },
  tipSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    margin: isMobile ? 20 : 40,
    marginTop: 20,
    marginBottom: 40,
    padding: 25,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  tipIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#d97706',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#fef3c7',
    lineHeight: 20,
  },
});

export default Ajuda;