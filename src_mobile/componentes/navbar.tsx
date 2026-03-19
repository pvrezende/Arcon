import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AvatarDash from "./avatarDash";
import SinoNotificacoes from "./SinoNotificacoes";
import SinoNotificacoesPrestador from "./SinoNotificacoesPrestador";

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

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
    if (searchVisible) setSearchText("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0284c7" />

        <View style={styles.navbar}>
          {/* Logo */}
          <TouchableOpacity
            style={styles.logoContainer}
            onPress={() => navigation?.navigate("Home")}
            activeOpacity={0.7}
          >
            <View style={styles.logoIcon}>
              <Ionicons name="snow" size={20} color="#ffffff" />
            </View>
            <Text style={styles.logo}>
              Consert<Text style={styles.logoAR}>AR</Text>
            </Text>
          </TouchableOpacity>

          {/* Search Bar */}
          {searchVisible && (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar serviços..."
                value={searchText}
                onChangeText={setSearchText}
                autoFocus
                placeholderTextColor="#64748b"
              />
              <TouchableOpacity onPress={toggleSearch} style={styles.closeButton}>
                <Ionicons name="close" size={22} color="#334155" />
              </TouchableOpacity>
            </View>
          )}

          {/* Avatar e Sino */}
          <View style={styles.actions}>
            {!searchVisible && (
              <>
                {/* 🟢 Renderização Condicional: O sino correto baseado no tipo de usuário */}
                {showSino && (
                  isPrestador ? 
                    <SinoNotificacoesPrestador navigation={navigation} /> : 
                    <SinoNotificacoes navigation={navigation} />
                )}
                <AvatarDash />
              </>
            )}
          </View>
        </View>
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 60,
  },
  logoContainer: { flexDirection: "row", alignItems: "center" },
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
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#bae6fd",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    flex: 1,
    marginHorizontal: 8,
  },
  searchInput: { flex: 1, fontSize: 16, color: "#0f172a" },
  closeButton: { padding: 4 },
});

export default Navbar;
