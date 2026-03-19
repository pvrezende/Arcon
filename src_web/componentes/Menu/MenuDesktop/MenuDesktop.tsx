import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  Alert, 
  Image,
  Platform,
  ScrollView,
  Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../hooks/useAuth';

const MenuDesktop = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const { userData, logout: authLogout } = useAuth();
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(400)).current;

  if (!userData) {
    return null;
  }

  const handleNavigation = (screen: string) => {
    setMenuVisible(false);
    // @ts-ignore
    navigation.navigate(screen);
  };

  const handleLogout = async () => {
    try {
      setMenuVisible(false);
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

  useEffect(() => {
    if (menuVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [menuVisible]);

  return (
    <View>
      <TouchableOpacity 
        onPress={() => setMenuVisible(!menuVisible)}
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

     {/* Perfil */}
      <Modal transparent visible={menuVisible} animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.sidePanel, { transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.header}>
              <View style={styles.headerContent}>
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
              </View>
              <TouchableOpacity 
                onPress={() => setMenuVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.menuContent} showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ações Rápidas</Text>
                
                {/* Chat */}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigation("ListaChats")}
                >
                  <View style={styles.menuItemIcon}>
                    <Ionicons name="chatbubble-outline" size={22} color="#0ea5e9" />
                  </View>
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuItemText}>Chat</Text>
                    <Text style={styles.menuItemSubtext}>Conversas ativas</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                </TouchableOpacity>
              </View>

              {/* Credenciamento */}
              {userData?.tipo_usuario === 'PRESTADOR' && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Área do Prestador</Text>
                  
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleNavigation("Credenciamento")}
                  >
                    <View style={styles.menuItemIcon}>
                      <Ionicons name="ribbon-outline" size={22} color="#0284c7" />
                    </View>
                    <View style={styles.menuItemContent}>
                      <Text style={styles.menuItemText}>Credenciamento</Text>
                      <Text style={styles.menuItemSubtext}>Gerencie seus credenciamentos</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Configurações */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Conta e Configurações</Text>
                
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigation("Configuracoes")}
                >
                  <View style={styles.menuItemIcon}>
                    <Ionicons name="settings-outline" size={22} color="#64748b" />
                  </View>
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuItemText}>Configurações</Text>
                    <Text style={styles.menuItemSubtext}>Preferências e privacidade</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigation("HistoricoCliente")}
                >
                  <View style={styles.menuItemIcon}>
                    <Ionicons name="time-outline" size={22} color="#64748b" />
                  </View>
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuItemText}>Histórico</Text>
                    <Text style={styles.menuItemSubtext}>Atividades recentes</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                </TouchableOpacity>
              </View>

              {/* Planos */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Planos e Suporte</Text>
                
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigation("PaginaLicenca")}
                >
                  <View style={styles.menuItemIcon}>
                    <Ionicons name="card-outline" size={22} color="#10b981" />
                  </View>
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuItemText}>Planos</Text>
                    <Text style={styles.menuItemSubtext}>Gerenciar assinatura</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={handleLogout}
              >
                <View style={styles.logoutIcon}>
                  <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                </View>
                <Text style={styles.logoutText}>Sair da Conta</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  sidePanel: {
    width: 400,
    height: '100%',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    ...(Platform.OS === 'web' && {
      boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.15)',
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#fafafa',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatarContainer: {
    marginRight: 16,
  },
  userAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  } as any,
  userAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  menuContent: {
    flex: 1,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuItemIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
    marginBottom: 2,
  },
  menuItemSubtext: {
    fontSize: 13,
    color: '#64748b',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#fafafa',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
  },
});

export default MenuDesktop;