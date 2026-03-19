import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  Alert, 
  Image,
  Platform,
  ScrollView,
  Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../hooks/useAuth';
import styles from './MenuDesktop.styles';

const MenuDesktopClient = () => {
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
                <Text style={styles.sectionTitle}>Área do Cliente</Text>

                {/* Comprar Produtos */}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigation("ComprarProdutos")}
                >
                  <View style={styles.menuItemIcon}>
                    <Ionicons name="storefront-outline" size={22} color="#10b981" />
                  </View>
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuItemText}>Produtos Comprados</Text>
                    <Text style={styles.menuItemSubtext}>Registros de compras</Text>
                  </View>
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
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuItemText}>Chat</Text>
                    <Text style={styles.menuItemSubtext}>Conversas ativas</Text>
                  </View>
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
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuItemText}>Propostas</Text>
                    <Text style={styles.menuItemSubtext}>Suas propostas</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                </TouchableOpacity>
              </View>

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


export default MenuDesktopClient;
