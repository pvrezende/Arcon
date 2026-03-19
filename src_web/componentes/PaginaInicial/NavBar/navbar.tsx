import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LoginModal from "../../LoginModal";
import { useAuth } from "../../../hooks/useAuth";


interface NavbarProps {
  navigation?: any;
  onScrollToTop?: () => void;
  onScrollToSection?: (section: string) => void;
  showSino?: boolean;
  isPrestador?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  navigation, 
  showSino = true, 
  isPrestador = false 
}) => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const { user, userData } = useAuth();

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
    if (searchVisible) setSearchText("");
  };

  const handleLoginModalClose = () => {
    setLoginModalVisible(false);
  };

  const handleClienteLogin = () => {
    setLoginModalVisible(false);
    navigation?.navigate("logincliente");
  };

  const handlePrestadorLogin = () => {
    setLoginModalVisible(false);
    navigation?.navigate("loginprestador");
  };

  const handleLogoPress = () => {
    if (user && userData) {
      return;
    }
    navigation?.navigate("PaginaInicial");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0284c7" />

        <View style={styles.navbar}>
          {/* Logo */}
          <TouchableOpacity
            style={styles.logoContainer}
            onPress={handleLogoPress}
            activeOpacity={0.7}
          >
            <View style={styles.logoIcon}>
              <Ionicons name="snow" size={20} color="#ffffff" />
            </View>
            <Text style={styles.logo}>
              Consert<Text style={styles.logoAR}>AR</Text>
            </Text>
          </TouchableOpacity>

          {/* Botão Entrar */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => setLoginModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="log-in-outline" size={18} color="#ffffff" />
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de Login */}
      <LoginModal
        visible={loginModalVisible}
        onClose={handleLoginModalClose}
        onClientePress={handleClienteLogin}
        onPrestadorPress={handlePrestadorLogin}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#0284c7" },
  container: {
    backgroundColor: "#0284c7",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 3px rgba(0, 0, 0, 0.08)" }
      : { elevation: 3 }),
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 10,
    height: 60,
  },
  logoContainer: { 
    flexDirection: "row", 
    alignItems: "center",
    marginLeft: 40,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#0ea5e9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  logo: { fontSize: 20, fontWeight: "700", color: "#ffffff" },
  logoAR: { color: "#7dd3fc", fontWeight: "800" },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    marginRight: 40,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 16, color: "#0f172a" },
  closeButton: { padding: 4 },
});

export default Navbar;
