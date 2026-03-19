import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert,
  ScrollView,
  Modal,
  TextInput,
  Dimensions,
  Animated,
  Easing
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Navbar from "../../componentes/navbar";
import Footer from "../../componentes/footer";
import { StackNavigationProp } from '@react-navigation/stack';
import { authService } from "../../services/authService";

// Definindo os tipos para as rotas de navegação 
type RootStackParamList = {
  Perfil: undefined;
  PerfilModal: undefined;
  HistoricoCliente: undefined;
  Configuracoes: { 
    userUpdated?: boolean;
    userName?: string;
    userPhoto?: string;
  };
  SobreConsertAR: undefined;
  Ajuda: undefined;
  Home: undefined;
  Main: undefined;
  TrialScreen: undefined; // ✅ ADICIONADO
};

type ConfiguracoesNavigationProp = StackNavigationProp<RootStackParamList>;

interface ConfiguracoesProps {
  navigation: ConfiguracoesNavigationProp;
  route: {
    params?: {
      userUpdated?: boolean;
      userName?: string;
      userPhoto?: string;
    };
  };
}

const { width, height } = Dimensions.get('window');
const isMobile = width < 768;
const isTablet = width >= 768 && width < 1024;

const Configuracoes: React.FC<ConfiguracoesProps> = ({ navigation, route }) => {
  const [user, setUser] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userFullName, setUserFullName] = useState<string>('');
  const [joinDate, setJoinDate] = useState<string>('');
  
  // Animações
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // ✅ FUNÇÃO PARA NAVEGAÇÃO DO TRIAL
  const handleNavigation = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
  };

  // Carregar dados do usuário usando authService
  const loadUserData = async () => {
    try {
      const userData = await authService.getUser();
      
      if (userData) {
        setUser(userData);
        setProfileImage(userData.photoURL || null);
        const fullName = userData.nome || '';
        setUserFullName(fullName);
        setUserName(fullName);
        
        // Formatar data de criação da conta
        if (userData.metadata?.creationTime) {
          const creationDate = new Date(userData.metadata.creationTime);
          const formattedDate = creationDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          setJoinDate(formattedDate);
        } else {
          setJoinDate('Data não disponível');
        }
      }
    } catch (error) {
      console.log('Erro ao buscar dados do usuário:', error);
      setJoinDate('Data não disponível');
    }
  };

  useEffect(() => {
    loadUserData();
    
    // Animações de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Verificar se houve atualização do perfil
  useEffect(() => {
    if (route.params?.userUpdated) {
      if (route.params.userName) {
        setUserName(route.params.userName);
        setUserFullName(route.params.userName);
      }
      if (route.params.userPhoto) {
        setProfileImage(route.params.userPhoto);
      }
      loadUserData();
    }
  }, [route.params]);

  // Função para obter o nome a ser exibido
  const getDisplayName = (): string => {
    const name = userFullName || userName || user?.displayName || '';
    return name || 'Usuário';
  };

  const handleUpdateEmail = async (): Promise<void> => {
    if (!user || !currentPassword || !newEmail) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    // TODO: Implementar atualização de e-mail via API backend
    Alert.alert('Aviso', 'Atualização de e-mail em desenvolvimento.');
    setModalVisible(false);
    setCurrentPassword('');
    setNewEmail('');
  };

  const handleUpdatePassword = async (): Promise<void> => {
    if (!user || !currentPassword || !newPassword) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    // TODO: Implementar atualização de senha via API backend
    Alert.alert('Aviso', 'Atualização de senha em desenvolvimento.');
    setModalVisible(false);
    setCurrentPassword('');
    setNewPassword('');
  };

  const getInitials = (name: string): string => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  };

  // Componente para o floco de neve
  const Snowflake = ({ style, size = 200 }) => (
    <View style={[styles.snowflake, { width: size, height: size }, style]}>
      <Ionicons name="snow" size={size * 0.6} color="rgba(255, 255, 255, 0.1)" />
    </View>
  );

  return (
    <View style={styles.container}>
      <Navbar />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header com gradiente */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Animated.View 
              style={[
                styles.heroContent,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <Text style={styles.heroTitle}>Configurações</Text>
              <Text style={styles.heroSubtitle}>
                Gerencie suas preferências e informações da conta
              </Text>
            </Animated.View>
          </View>
          
          {/* Elementos decorativos do header */}
          <View style={styles.headerDecoration}>
            <Snowflake 
              style={styles.snowflake1}
              size={200}
            />
            <Snowflake 
              style={styles.snowflake2}
              size={250}
            />
          </View>
        </View>

        <View style={styles.content}>
          {/* Seção de Informações do Usuário */}
          <Animated.View 
            style={[
              styles.userInfoSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.avatarContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>
                    {getInitials(getDisplayName())}
                  </Text>
                </View>
              )}
              <View style={styles.avatarStatus} />
            </View>
            
            <Text style={styles.userName}>
              {getDisplayName()}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email || 'email@exemplo.com'}
            </Text>
            
            {/* ✅ BOTÃO TRIAL ADICIONADO AQUI - ABAIXO DO EMAIL */}
            <TouchableOpacity
              style={styles.trialButton}
              onPress={() => handleNavigation("TrialScreen")}
              activeOpacity={0.7}
            >
              <View style={styles.trialButtonContent}>
                <Ionicons name="diamond" size={16} color="#ffffff" />
                <Text style={styles.trialButtonText}>Plano Atual Basico</Text>
              </View>
            </TouchableOpacity>

          </Animated.View>

          {/* Container Único para Todas as Configurações */}
          <Animated.View 
            style={[
              styles.settingsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Seção de Perfil */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <View style={[styles.sectionIconContainer, { backgroundColor: '#0284c715' }]}>
                    <Ionicons name="person" size={20} color="#0284c7" />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Perfil</Text>
                    <Text style={styles.sectionSubtitle}>
                      Gerencie suas informações pessoais
                    </Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => navigation.navigate("Perfil")}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#0284c710' }]}>
                  <Ionicons name="person-circle-outline" size={22} color="#0284c7" />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuText}>Editar Perfil</Text>
                  <Text style={styles.menuDescription}>Atualize suas informações pessoais</Text>
                </View>
                <View style={styles.chevronContainer}>
                  <Ionicons name="chevron-forward" size={20} color="#64748B" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Seção de Segurança */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <View style={[styles.sectionIconContainer, { backgroundColor: '#dc262615' }]}>
                    <Ionicons name="lock-closed" size={20} color="#dc2626" />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Segurança</Text>
                    <Text style={styles.sectionSubtitle}>
                      Proteja sua conta e dados
                    </Text>
                  </View>
                </View>
              </View>

              {/* Alterar E-mail */}
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setModalType('email');
                  setModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#f59e0b10' }]}>
                  <Ionicons name="mail-outline" size={22} color="#f59e0b" />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuText}>Alterar E-mail</Text>
                  <Text style={styles.menuDescription}>Atualize seu endereço de e-mail</Text>
                </View>
                <View style={styles.chevronContainer}>
                  <Ionicons name="chevron-forward" size={20} color="#64748B" />
                </View>
              </TouchableOpacity>

              {/* Alterar Senha */}
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setModalType('password');
                  setModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#ef444410' }]}>
                  <Ionicons name="lock-closed-outline" size={22} color="#ef4444" />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuText}>Alterar Senha</Text>
                  <Text style={styles.menuDescription}>Atualize sua senha de acesso</Text>
                </View>
                <View style={styles.chevronContainer}>
                  <Ionicons name="chevron-forward" size={20} color="#64748B" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Seção Sobre o App */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <View style={[styles.sectionIconContainer, { backgroundColor: '#05966915' }]}>
                    <Ionicons name="information-circle" size={20} color="#059669" />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Sobre</Text>
                    <Text style={styles.sectionSubtitle}>
                      Conheça mais sobre o aplicativo
                    </Text>
                  </View>
                </View>
              </View>

              {/* Sobre o ConsertAR */}
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigation.navigate("SobreConsertAR")}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#05966910' }]}>
                  <Ionicons name="business-outline" size={22} color="#059669" />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuText}>Sobre o ConsertAR!</Text>
                  <Text style={styles.menuDescription}>Conheça nossa missão e valores</Text>
                </View>
                <View style={styles.chevronContainer}>
                  <Ionicons name="chevron-forward" size={20} color="#64748B" />
                </View>
              </TouchableOpacity>

              {/* Ajuda */}
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigation.navigate("Ajuda")}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#dc262610' }]}>
                  <Ionicons name="help-circle-outline" size={22} color="#dc2626" />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuText}>Ajuda</Text>
                  <Text style={styles.menuDescription}>Tire suas dúvidas</Text>
                </View>
                <View style={styles.chevronContainer}>
                  <Ionicons name="chevron-forward" size={20} color="#64748B" />
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Espaço extra no final */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      <Footer />

      {/* Modal para Alterar E-mail/Senha */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: fadeAnim }]
              }
            ]}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={[styles.modalIconContainer, 
                  { backgroundColor: modalType === 'email' ? '#f59e0b15' : '#ef444415' }
                ]}>
                  <Ionicons 
                    name={modalType === 'email' ? "mail-outline" : "lock-closed-outline"} 
                    size={32} 
                    color={modalType === 'email' ? '#f59e0b' : '#ef4444'} 
                  />
                </View>
                <Text style={styles.modalTitle}>
                  {modalType === 'email' ? 'Alterar E-mail' : 'Alterar Senha'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {modalType === 'email' 
                    ? 'Digite sua senha atual e o novo e-mail' 
                    : 'Digite sua senha atual e a nova senha'
                  }
                </Text>
              </View>
              
              <TextInput
                style={styles.input}
                placeholder="Senha atual"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholderTextColor="#94a3b8"
              />
              
              {modalType === 'email' ? (
                <TextInput
                  style={styles.input}
                  placeholder="Novo e-mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={newEmail}
                  onChangeText={setNewEmail}
                  placeholderTextColor="#94a3b8"
                />
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="Nova senha"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholderTextColor="#94a3b8"
                />
              )}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setModalVisible(false);
                    setCurrentPassword('');
                    setNewEmail('');
                    setNewPassword('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={modalType === 'email' ? handleUpdateEmail : handleUpdatePassword}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  // BOTÃO VOLTAR - ESTRUTURA ORIGINAL QUE FUNCIONAVA
  botaoVoltarContainer: { 
    paddingHorizontal: isMobile ? 20 : 40,
    paddingTop: isMobile ? 20 : 30,
    paddingBottom: 10,
    backgroundColor: '#0284c7',
  },
  botaoVoltar: { 
    flexDirection: 'row', 
    alignItems: 'center',
    padding: 8,
    alignSelf: 'flex-start',
  },
  botaoVoltarTexto: { 
    marginLeft: 8, 
    color: '#ffffff',
    fontSize: 16, 
    fontWeight: '500' 
  },
  // Header Styles
  header: {
    backgroundColor: '#0284c7',
    paddingBottom: isMobile ? 80 : 100,
    overflow: 'hidden',
    position: 'relative',
  },
  headerContent: {
    paddingHorizontal: isMobile ? 20 : 40,
    paddingTop: 0,
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Snowflake Styles
  snowflake: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
  snowflake1: {
    top: -50,
    right: -50,
  },
  snowflake2: {
    bottom: -80,
    left: -80,
  },
  // Hero Section
  heroContent: {
    alignItems: isMobile ? 'flex-start' : 'center',
    paddingTop: 20,
  },
  heroTitle: {
    fontSize: isMobile ? 32 : 48,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: isMobile ? 'left' : 'center',
  },
  heroSubtitle: {
    fontSize: isMobile ? 16 : 18,
    color: '#e0feecff',
    textAlign: isMobile ? 'left' : 'center',
    lineHeight: 24,
    maxWidth: 600,
  },
  // User Info Section
  userInfoSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: isMobile ? 20 : isTablet ? 60 : 120,
    marginTop: isMobile ? -60 : -80,
    padding: isMobile ? 25 : 35,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  avatarContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: isMobile ? 100 : 120,
    height: isMobile ? 100 : 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  avatarPlaceholder: {
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: isMobile ? 36 : 42,
    fontWeight: 'bold',
  },
  avatarStatus: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10b981',
    borderWidth: 3,
    borderColor: '#10b981',
  },
  userName: {
    fontSize: isMobile ? 24 : 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 5,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: isMobile ? 15 : 16,
    color: '#64748b',
    marginBottom: 15,
    textAlign: 'center',
  },
  // ✅ NOVO: Estilos para o botão TRIAL
  trialButton: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#0369a1',
  },
  trialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  trialButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Container para a data de cadastro
  joinDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  joinDateText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
    fontWeight: '500',
  },
  // Container Único para Todas as Configurações
  settingsContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: isMobile ? 20 : isTablet ? 60 : 120,
    marginTop: 25,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f8fafc',
    overflow: 'hidden',
  },
  // Sections dentro do container único
  section: {
    padding: isMobile ? 25 : 30,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  sectionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  // Menu Items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
  },
  chevronContainer: {
    padding: 4,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 450,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  modalIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  confirmButton: {
    backgroundColor: '#0284c7',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default Configuracoes;