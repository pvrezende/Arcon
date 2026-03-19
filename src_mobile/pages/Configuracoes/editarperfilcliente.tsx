import React, { useState, useEffect, JSX } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert,
  ScrollView,
  TextInput,
  Dimensions,
  Modal
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Navbar from "../../componentes/navbar";
import Footer from "../../componentes/footer";
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { authService } from "../../services/authService"; // ADICIONAR ESTA IMPORT

// Definindo os tipos para as rotas de navegação 
type RootStackParamList = {
  Configuracoes: {
    userUpdated?: boolean;
    userName?: string;
    userPhoto?: string;
  };
  Perfil: undefined;
};

type PerfilNavigationProp = StackNavigationProp<RootStackParamList>;

interface PerfilProps {
  navigation: PerfilNavigationProp;
}

// Interface para os dados do perfil do CLIENTE
interface ProfileData {
  nome: string;
  telefone: string;
  cpf: string;
  endereco: string;
}

interface UserType {
  uid: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  photoURL?: string;
  nome?: string;
  telefone?: string;
  cpf?: string;
  endereco?: string;
  metadata?: {
    creationTime?: string;
  };
}

const { width } = Dimensions.get('window');
const isMobile = width < 768;

const Perfil: React.FC<PerfilProps> = ({ navigation }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    nome: '',
    telefone: '',
    cpf: '',
    endereco: ''
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [originalData, setOriginalData] = useState<ProfileData>({
    nome: '',
    telefone: '',
    cpf: '',
    endereco: ''
  });
  const [rating, setRating] = useState<number>(4);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Função para converter objeto de endereço em string - MANTIDA
  const formatEndereco = (endereco: any): string => {
    if (!endereco) return '';
    
    if (typeof endereco === 'string') {
      return endereco;
    }
    
    if (typeof endereco === 'object') {
      const partes = [];
      
      if (endereco.rua) partes.push(endereco.rua);
      if (endereco.numero) partes.push(endereco.numero);
      if (endereco.bairro) partes.push(endereco.bairro);
      if (endereco.cidade) partes.push(endereco.cidade);
      if (endereco.estado) partes.push(endereco.estado);
      if (endereco.cep) partes.push(endereco.cep);
      if (endereco.complemento) partes.push(`Complemento: ${endereco.complemento}`);
      
      return partes.join(', ');
    }
    
    return String(endereco);
  };

  // 🔄 CORREÇÃO: Usar authService em vez de localStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await authService.getUser(); // ← USAR O MESMO SERVIÇO
        
        if (userData) {
          const currentUser: UserType = {
            uid: userData.uid || userData.id,
            displayName: userData.displayName,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            photoURL: userData.photoURL,
            nome: userData.nome,
            telefone: userData.telefone,
            cpf: userData.cpf,
            endereco: userData.endereco,
            metadata: userData.metadata
          };
          
          setUser(currentUser);
          
          // Formatar os dados, especialmente o endereço
          const formattedData: ProfileData = {
            nome: userData.nome || userData.displayName || 'Cliente',
            telefone: userData.telefone || userData.phoneNumber || '',
            cpf: userData.cpf || '',
            endereco: formatEndereco(userData.endereco) || ''
          };
          
          setProfileData(formattedData);
          setOriginalData(formattedData);
          setProfileImage(userData.photoURL || null);
          
          console.log('Dados carregados no Perfil:', {
            nome: formattedData.nome,
            email: userData.email,
            telefone: formattedData.telefone
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do perfil.');
      }
    };

    loadUserData();
  }, []);

  const goBack = (): void => {
    navigation.goBack();
  };

  const pickImage = async (): Promise<void> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para alterar a foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const takePhoto = async (): Promise<void> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua câmera para tirar uma foto.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const showImagePickerOptions = (): void => {
    Alert.alert(
      'Alterar Foto de Perfil',
      'Escolha uma opção:',
      [
        {
          text: 'Tirar Foto',
          onPress: takePhoto,
        },
        {
          text: 'Escolher da Galeria',
          onPress: pickImage,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  // 🔄 CORREÇÃO: Salvar usando método apropriado
  const handleSaveProfile = async (): Promise<void> => {
    if (!user) {
      Alert.alert('Erro', 'Usuário não encontrado.');
      return;
    }

    try {
      // TODO: Implementar atualização no backend via authService
      // Por enquanto, apenas atualiza os estados locais
      
      const updatedUser = {
        ...user,
        nome: profileData.nome,
        telefone: profileData.telefone,
        cpf: profileData.cpf,
        endereco: profileData.endereco,
        photoURL: profileImage
      };
      
      setUser(updatedUser);

      // Mostrar modal de sucesso
      setModalVisible(true);

      setIsEditing(false);
      setOriginalData(profileData);

      console.log('Perfil atualizado:', {
        nome: profileData.nome,
        telefone: profileData.telefone,
        cpf: profileData.cpf
      });

    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil: ' + error.message);
    }
  };

  const handleModalClose = (): void => {
    setModalVisible(false);
    
    navigation.navigate('Configuracoes', { 
      userUpdated: true,
      userName: profileData.nome,
      userPhoto: profileImage || user?.photoURL
    });
  };

  const handleCancelEdit = (): void => {
    setProfileData(originalData);
    setIsEditing(false);
  };

  const handleStartEdit = (): void => {
    setOriginalData(profileData);
    setIsEditing(true);
  };

  const handleFieldChange = (field: keyof ProfileData, value: string): void => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getInitials = (name: string): string => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'CL';
  };

  // 🔄 CORREÇÃO: Formatar data de criação corretamente
  const formatJoinDate = (): string => {
    if (!user?.metadata?.creationTime) return 'Data não disponível';
    
    const joinDate = new Date(user.metadata.creationTime);
    return joinDate.toLocaleDateString('pt-BR');
  };

  const renderStars = (): JSX.Element[] => {
    const stars = [];
    const totalStars = 5;
    
    for (let i = 1; i <= totalStars; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#FFD700" : "#CBD5E1"}
          style={styles.starIcon}
        />
      );
    }
    
    return stars;
  };

  return (
    <View style={styles.container}>
      <Navbar />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.botaoVoltarContainer}>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Meu Perfil</Text>
          
          {/* Seção da Foto de Perfil */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>
                    {getInitials(profileData.nome)}
                  </Text>
                </View>
              )}
            </View>
            
            <Text style={styles.userName}>{profileData.nome}</Text>
            <Text style={styles.userEmail}>{user?.email || 'email@exemplo.com'}</Text>
            
            <TouchableOpacity 
              style={styles.changePhotoButton}
              onPress={showImagePickerOptions}
            >
              <Ionicons name="camera-outline" size={18} color="#0284c7" />
              <Text style={styles.changePhotoText}>Alterar Foto</Text>
            </TouchableOpacity>

            <View style={isMobile ? styles.ratingContainerMobile : styles.ratingContainerDesktop}>
              <Text style={styles.ratingLabel}>Avaliação do Cliente:</Text>
              <View style={styles.ratingContent}>
                <View style={styles.starsContainer}>
                  {renderStars()}
                </View>
                <Text style={styles.ratingText}>{rating}/5</Text>
              </View>
            </View>
          </View>

          {/* Formulário de Dados Pessoais */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Ionicons name="person-outline" size={18} color="#64748b" />
                <Text style={styles.label}>Nome Completo</Text>
              </View>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={profileData.nome}
                onChangeText={(value) => handleFieldChange('nome', value)}
                placeholder="Digite seu nome completo"
                editable={isEditing}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Ionicons name="call-outline" size={18} color="#64748b" />
                <Text style={styles.label}>Telefone</Text>
              </View>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={profileData.telefone}
                onChangeText={(value) => handleFieldChange('telefone', value)}
                placeholder="(11) 99999-9999"
                keyboardType="phone-pad"
                editable={isEditing}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Ionicons name="card-outline" size={18} color="#64748b" />
                <Text style={styles.label}>CPF</Text>
              </View>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={profileData.cpf}
                onChangeText={(value) => handleFieldChange('cpf', value)}
                placeholder="000.000.000-00"
                keyboardType="numeric"
                editable={isEditing}
              />
            </View>
          </View>

          {/* Formulário de Endereço SIMPLIFICADO */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Endereço</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Ionicons name="location-outline" size={18} color="#64748b" />
                <Text style={styles.label}>Endereço Completo</Text>
              </View>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled, styles.textArea]}
                value={profileData.endereco}
                onChangeText={(value) => handleFieldChange('endereco', value)}
                placeholder="Digite seu endereço completo (Rua, número, bairro, cidade, estado, CEP)"
                editable={isEditing}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Botões de Ação */}
          <View style={styles.actionsSection}>
            {!isEditing ? (
              <TouchableOpacity 
                style={styles.editButton}
                onPress={handleStartEdit}
              >
                <Ionicons name="create-outline" size={20} color="#fff" />
                <Text style={styles.editButtonText}>Editar Perfil</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editModeButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancelEdit}
                >
                  <Ionicons name="close-circle-outline" size={18} color="#64748b" />
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleSaveProfile}
                >
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                  <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Informações da Conta */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Informações da Conta</Text>
            <View style={styles.infoItem}>
              <Ionicons name="mail-outline" size={16} color="#64748b" />
              <Text style={styles.infoText}>
                E-mail: {user?.email || 'Não informado'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={16} color="#64748b" />
              <Text style={styles.infoText}>
                {/* 🔄 CORREÇÃO: Usar a função formatJoinDate */}
                Conta criada em: {formatJoinDate()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Footer />

      {/* Modal de sucesso */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.successBox}>
              <View style={styles.iconContainer}>
                <Ionicons name="checkmark-circle" size={60} color="#10b981" />
              </View>
              <Text style={styles.successTitle}>Sucesso!</Text>
              <Text style={styles.successSubtitle}>
                Dados atualizados com sucesso!
              </Text>
            </View>
            <TouchableOpacity
              style={styles.successButton}
              onPress={handleModalClose}
            >
              <Text style={styles.successButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Os estilos permanecem EXATAMENTE os mesmos
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC',
  },
  botaoVoltarContainer: { 
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  botaoVoltar: { 
    flexDirection: 'row', 
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'transparent',
  },
  botaoVoltarTexto: { 
    marginLeft: 8, 
    color: '#0284c7', 
    fontSize: 16, 
    fontWeight: '500' 
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 10,
  },
  title: { 
    fontSize: 28, 
    fontWeight: "800",
    color: '#0284c7',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatarSection: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#e2e8f0',
  },
  avatarPlaceholder: {
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#e2e8f0',
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 15,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  changePhotoText: {
    color: '#0284c7',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  ratingContainerDesktop: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  ratingContainerMobile: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    width: '100%',
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginRight: 8,
  },
  ratingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 6,
  },
  starIcon: {
    marginHorizontal: 1,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  formSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputDisabled: {
    backgroundColor: '#f8fafc',
    color: '#64748b',
  },
  actionsSection: {
    marginBottom: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284c7',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  editModeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  saveButton: {
    backgroundColor: '#0284c7',
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 5,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    maxWidth: 400,
    width: '90%',
  },
  successBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  successButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  successButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Perfil;