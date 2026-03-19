import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  Alert, 
  Image,
  Platform,
  Dimensions,
  SafeAreaView,
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../../hooks/useAuth';
import styles from './MenuResponsive.styles';

const { width } = Dimensions.get('window');

const MenuResponsiveClient = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { userData, logout: authLogout } = useAuth();
  const navigation = useNavigation();

  if (!userData) {
    return null;
  }

  const handleNavigation = (screen: string) => {
    setModalVisible(false);
    // @ts-ignore
    navigation.navigate(screen);
  };

  const handleLogout = async () => {
    try {
      setModalVisible(false);
      await authLogout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      Alert.alert("Erro", "Não foi possível sair da conta.");
    }
  };

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const isMobile = width < 768;

  return (
    <View>
      {/* Avatar Button */}
      <TouchableOpacity 
        onPress={() => setModalVisible(!modalVisible)}
        style={styles.avatarButton}
        activeOpacity={0.7}
      >
        {userData.foto_perfil ? (
          <Image 
            source={{ uri: userData.foto_perfil }} 
            style={styles.avatarImage}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {getUserInitials(userData.nome || userData.email)}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Modal Menu */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <TouchableOpacity
          style={styles.modalOverlay}
          onPressOut={() => setModalVisible(false)}
          activeOpacity={1}
        >
          <SafeAreaView style={[
            styles.menuContainer,
            isMobile ? styles.menuContainerMobile : styles.menuContainerDesktop
          ]}>
            {/* User Info  */}
            <View style={styles.userInfoHeader}>
              <View style={styles.userAvatarContainer}>
                {userData.foto_perfil ? (
                  <Image 
                    source={{ uri: userData.foto_perfil }} 
                    style={styles.userAvatarImage}
                  />
                ) : (
                  <View style={styles.userAvatarPlaceholder}>
                    <Text style={styles.userAvatarText}>
                      {getUserInitials(userData.nome || userData.email)}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {userData.nome || 'Usuário'}
                </Text>
                <Text style={styles.userEmail}>
                  {userData.email}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

           
            <View style={styles.menuItems}>
              {/* Dashboard Cliente */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigation("DashCliente")}
              >
                <View style={styles.menuItemIcon}>
                  <Ionicons name="home-outline" size={22} color="#0ea5e9" />
                </View>
                <Text style={styles.menuItemText}>Dashboard</Text>
                <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
              </TouchableOpacity>

              {/* Comprar Produtos */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigation("ComprarProdutos")}
              >
                <View style={styles.menuItemIcon}>
                  <Ionicons name="storefront-outline" size={22} color="#10b981" />
                </View>
                <Text style={styles.menuItemText}>Comprar Produtos</Text>
                <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
              </TouchableOpacity>

              {/* Chat */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigation("ListaChats")}
              >
                <View style={styles.menuItemIcon}>
                  <Ionicons name="chatbubble-outline" size={22} color="#f59e0b" />
                </View>
                <Text style={styles.menuItemText}>Chat</Text>
                <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
              </TouchableOpacity>

              {/* Propostas */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigation("PropostaCliente")}
              >
                <View style={styles.menuItemIcon}>
                  <Ionicons name="document-text-outline" size={22} color="#8b5cf6" />
                </View>
                <Text style={styles.menuItemText}>Propostas</Text>
                <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
              </TouchableOpacity>

              {/* Configurações */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigation("Configuracoes")}
              >
                <View style={styles.menuItemIcon}>
                  <Ionicons name="settings-outline" size={22} color="#64748b" />
                </View>
                <Text style={styles.menuItemText}>Configurações</Text>
                <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
              </TouchableOpacity>

              {/* Histórico */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigation("HistoricoCliente")}
              >
                <View style={styles.menuItemIcon}>
                  <Ionicons name="time-outline" size={22} color="#64748b" />
                </View>
                <Text style={styles.menuItemText}>Histórico</Text>
                <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
              </TouchableOpacity>

              {/* Planos e Licenças */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigation("PaginaLicenca")}
              >
                <View style={styles.menuItemIcon}>
                  <Ionicons name="card-outline" size={22} color="#10b981" />
                </View>
                <Text style={styles.menuItemText}>Planos</Text>
                <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
              </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <View style={styles.logoutSection}>
              <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={handleLogout}
              >
                <View style={styles.logoutIcon}>
                  <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                </View>
                <Text style={styles.logoutText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};


export default MenuResponsiveClient;
