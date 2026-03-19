import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text, StyleSheet, View, TextInput, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_CONFIG } from "../../configIp";
import { authService } from '../services/authService';

const Prestadorcomponenteid = ({ onCadastroSucesso }) => {
  const [usuario, setUsuario] = useState<any>(null);
  const [jaCadastrado, setJaCadastrado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nomeUser, setNomeUser] = useState("");
  const [cadastrando, setCadastrando] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await authService.getUser();
        console.log("👤 [PrestadorComponente] Usuário carregado:", storedUser);
        
        if (storedUser) {
          const userId = storedUser.id_usuario || storedUser.id || storedUser.uid;
          setUsuario({ uid: userId });
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("❌ [PrestadorComponente] Erro ao carregar usuário:", error);
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  useEffect(() => {
    const verificarCadastro = async () => {
      if (!usuario?.uid) {
        setLoading(false);
        return;
      }

      try {
        console.log(`🔍 [PrestadorComponente] Verificando cadastro para usuário: ${usuario.uid}`);
        
        const res = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.CHECK_PRESTADOR}/${usuario.uid}`);
        const data = await res.json();

        console.log(`📋 [PrestadorComponente] Resposta do servidor:`, data);

        if (res.ok && data?.cadastrado) {
          console.log("✅ [PrestadorComponente] Prestador já cadastrado");
          setJaCadastrado(true);
          if (onCadastroSucesso) {
            onCadastroSucesso(usuario.uid, data.data?.NOME || "Prestador");
          }
        } else {
          console.log("📝 [PrestadorComponente] Prestador NÃO cadastrado - pode se cadastrar");
          setJaCadastrado(false);
        }
      } catch (error) {
        console.error("❌ [PrestadorComponente] Erro ao verificar prestador:", error);
        setJaCadastrado(false);
      } finally {
        setLoading(false);
      }
    };

    if (usuario?.uid) {
      verificarCadastro();
    }
  }, [usuario]);

  const handleCadastro = async () => {
    if (!usuario || !nomeUser.trim()) {
      Alert.alert("Atenção", "Por favor, digite seu nome");
      return;
    }

    try {
      setCadastrando(true);
      console.log(`📝 [PrestadorComponente] Cadastrando prestador: ${nomeUser} (ID: ${usuario.uid})`);

      const res = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.ADD_PRESTADOR}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json"
        },
        body: new URLSearchParams({
          prestador_id: usuario.uid,
          nome: nomeUser.trim(),
        }).toString(),
      });

      const data = await res.json();
      console.log(`📋 [PrestadorComponente] Resposta do cadastro:`, data);

      if (res.ok) {
        console.log("✅ [PrestadorComponente] Cadastro realizado com sucesso!");
        setJaCadastrado(true);
        if (onCadastroSucesso) {
          onCadastroSucesso(usuario.uid, nomeUser.trim());
        }
        Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
      } else {
        console.warn("❌ [PrestadorComponente] Erro ao cadastrar:", data.detail || "Falha ao cadastrar");
        Alert.alert("Erro", data.detail || "Falha ao realizar cadastro");
      }
    } catch (error) {
      console.error("❌ [PrestadorComponente] Erro de conexão:", error);
      Alert.alert("Erro", "Erro de conexão. Tente novamente.");
    } finally {
      setCadastrando(false);
    }
  };

  // DEBUG: Mostrar estado atual
  console.log(`🔍 [PrestadorComponente] Estado: loading=${loading}, jaCadastrado=${jaCadastrado}, usuario=${!!usuario}`);

  // Não renderizar se estiver carregando ou já cadastrado
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>Verificando cadastro...</Text>
      </View>
    );
  }

  if (jaCadastrado || !usuario) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="briefcase-outline" size={40} color="#0284c7" />
      </View>
      <Text style={styles.title}>Bem-vindo Prestador!</Text>
      <Text style={styles.subtitle}>
        Como gostaria de ser chamado e reconhecido pelos clientes?
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Digite seu nome profissional"
        value={nomeUser}
        onChangeText={setNomeUser}
        placeholderTextColor="#94a3b8"
        editable={!cadastrando}
      />
      
      <TouchableOpacity 
        style={[
          styles.button, 
          (!nomeUser.trim() || cadastrando) && styles.buttonDisabled
        ]} 
        onPress={handleCadastro}
        disabled={!nomeUser.trim() || cadastrando}
      >
        {cadastrando ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <Ionicons name="rocket-outline" size={18} color="#ffffff" />
            <Text style={styles.buttonText}> Vamos lá!</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    backgroundColor: "#e0f2fe",
    padding: 20,
    borderRadius: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#f8fafc",
  },
  button: {
    backgroundColor: "#0284c7",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: "#cbd5e1",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
  },
});

export default Prestadorcomponenteid;