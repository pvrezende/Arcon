import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Modal, Text, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

const AvatarDash = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { userData, logout: authLogout } = useAuth();
  const navigation = useNavigation();

  // Se não há usuário logado, não renderiza nada
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
      setModalVisible(false); // fecha o menu ao sair
      
      // Usar o método logout do hook useAuth para limpar o estado imediatamente
      await authLogout();
      
      // NÃO navegar manualmente! O App.tsx redirecionará automaticamente
      // quando o estado do useAuth for atualizado
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      Alert.alert("Erro", "Não foi possível sair da conta.");
    }
  };

  return (
    <View>
      {/* Avatar */}
      <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
        <Ionicons name="person-circle" size={40} color="#fff" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPressOut={() => setModalVisible(false)}
          activeOpacity={1}
        >
          <View style={styles.menuContainer}>
            {/* Configurações */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("Configuracoes")}
            >
              <Ionicons name="settings" size={20} color="#0284c7" />
              <Text style={styles.menuItemText}>Configurações</Text>
            </TouchableOpacity>

            {/* Histórico - NOVO BOTÃO ADICIONADO */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("HistoricoCliente")}
            >
              <Ionicons name="time" size={20} color="#0284c7" />
              <Text style={styles.menuItemText}>Histórico</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("ListaChats")}
            >
              <Ionicons name="chatbox" size={20} color="#0284c7" />
              <Text style={styles.menuItemText}>Chat</Text>
            </TouchableOpacity>


            {/* Sair */}
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out" size={20} color="red" />
              <Text style={[styles.menuItemText, { color: 'red' }]}>Sair</Text>
            </TouchableOpacity>

      
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  menuContainer: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  menuItemText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default AvatarDash;