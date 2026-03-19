import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
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

const { width } = Dimensions.get('window');

const MenuResponsive = () => {
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

              {/* Chat */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigation("ListaChats")}
              >
                <View style={styles.menuItemIcon}>
                  <Ionicons name="chatbubble-outline" size={22} color="#64748b" />
                </View>
                <Text style={styles.menuItemText}>Chat</Text>
                <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
              </TouchableOpacity>

              {/* Planos e Licenças */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigation("PaginaLicenca")}
              >
                <View style={styles.menuItemIcon}>
                  <Ionicons name="card-outline" size={22} color="#64748b" />
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

const styles = StyleSheet.create({
  avatarButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  } as any,
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'web' ? 60 : 0,
    paddingRight: width < 768 ? 0 : 16,
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    }),
  },
  menuContainerMobile: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    paddingTop: 0,
  },
  menuContainerDesktop: {
    width: 320,
    borderRadius: 16,
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  userAvatarContainer: {
    marginRight: 12,
  },
  userAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  } as any,
  userAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  closeButton: {
    padding: 4,
  },
  menuItems: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemIcon: {
    width: 28,
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  logoutSection: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingVertical: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoutIcon: {
    width: 28,
    alignItems: 'center',
    marginRight: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
  },
});

export default MenuResponsive;
