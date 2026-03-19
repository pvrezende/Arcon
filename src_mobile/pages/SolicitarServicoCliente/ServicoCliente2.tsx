// ServicoCliente.tsx - Componente atualizado e corrigido
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  Modal,
  Alert
} from "react-native";
import Navbar from "../../componentes/navbar";
import Footer from "../../componentes/footer";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth"; // ✅ Usando o hook unificado
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get("window");

const tagsDisponiveis = ["Limpeza", "Manutenção", "Instalação", "Reposição de Gás", "Troca de Peças"];
const marcasDisponiveis = ["Elgin", "LG", "Midea", "Electrolux", "Fujitsu", "Samsung"];
const btusDisponiveis = ["9000", "12000", "18000", "24000", "30000"];

const ServicoCliente: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userData, user_id, isCliente } = useAuth(); // ✅ Usando o contexto unificado
  
  const [btu, setBtu] = useState("");
  const [marca, setMarca] = useState("");
  const [descricao, setDescricao] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showDropdownMarcas, setShowDropdownMarcas] = useState(false);
  const [showDropdownBtu, setShowDropdownBtu] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalErro, setModalErro] = useState(false);
  const [descricaoErro, setDescricaoErro] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nomeCliente, setNomeCliente] = useState("");
  const [userId, setUserId] = useState(""); // Estado específico para user_id

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(titleTranslateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // ✅ Carregar dados do usuário usando o contexto unificado
    const loadUserData = async () => {
      try {
        console.log("🔍 Carregando dados do usuário...");
        
        // 1. Tentar do contexto (mais rápido e confiável)
        if (userData && user_id) {
          console.log("✅ Dados do contexto:", {
            nome: userData.nome,
            user_id: user_id,
            tipo: userData.tipo_usuario
          });
          setNomeCliente(userData.nome);
          setUserId(user_id);
          return;
        }

        // 2. Se contexto não tiver, tentar carregar do AsyncStorage
        console.log("🔄 Contexto não disponível, buscando do AsyncStorage...");
        
        const userDataString = await AsyncStorage.getItem('userData');
        const storedUserId = await AsyncStorage.getItem('user_id');
        
        if (userDataString) {
          const userFromStorage = JSON.parse(userDataString);
          console.log("✅ Dados do AsyncStorage:", userFromStorage);
          
          const nome = userFromStorage.nome || userFromStorage.displayName || 'Cliente';
          const userIdFromStorage = storedUserId || userFromStorage.id_usuario?.toString() || userFromStorage.id;
          
          setNomeCliente(nome);
          setUserId(userIdFromStorage || "");
        } else {
          console.log("⚠️ Nenhum usuário encontrado");
          setNomeCliente('Cliente');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados do usuário:', error);
        setNomeCliente('Cliente');
      }
    };

    loadUserData();
  }, [userData, user_id]); // ✅ Recarregar quando userData ou user_id mudarem

  // ✅ Verificar se usuário é cliente
  useEffect(() => {
    if (!isCliente && userData) {
      Alert.alert(
        'Acesso Restrito', 
        'Esta funcionalidade é apenas para clientes.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [isCliente, userData, navigation]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    console.log("🟡 Botão pressionado - início da função");

    // ✅ Verificação mais robusta do user_id
    let finalUserId = userId;
    
    // Se não tiver userId do estado, tentar buscar novamente
    if (!finalUserId) {
      console.log("🔄 UserId não encontrado no estado, buscando alternativas...");
      
      // Tentar do contexto
      if (user_id) {
        finalUserId = user_id;
        console.log("✅ UserId do contexto:", finalUserId);
      } 
      // Tentar do userData do contexto
      else if (userData?.id_usuario) {
        finalUserId = userData.id_usuario.toString();
        console.log("✅ UserId do userData (contexto):", finalUserId);
      }
      // Tentar do AsyncStorage como último recurso
      else {
        try {
          const storedUserId = await AsyncStorage.getItem('user_id');
          if (storedUserId) {
            finalUserId = storedUserId;
            console.log("✅ UserId do AsyncStorage:", finalUserId);
          }
        } catch (error) {
          console.error("❌ Erro ao buscar userId do AsyncStorage:", error);
        }
      }
    }

    // Verifica se temos o user_id após todas as tentativas
    if (!finalUserId) {
      console.log("🔴 User ID não disponível após todas as tentativas");
      Alert.alert(
        'Erro de Autenticação', 
        'Não foi possível identificar o usuário. Por favor, faça login novamente.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Validação dos campos obrigatórios
    if (!btu || !marca || !descricao || selectedTags.length === 0) {
      console.log("🔴 Campos obrigatórios faltando:", { 
        btu, 
        marca, 
        descricao, 
        tags: selectedTags.length,
        userId: finalUserId
      });
      if (!descricao) setDescricaoErro(true);
      setModalErro(true);
      return;
    }

    setDescricaoErro(false);
    setLoading(true);

    console.log("🟢 Validação passou - navegando para ListaPrestadores");
    
    // Prepara os dados do serviço
    const servicoData = {
      cliente: nomeCliente,
      btu,
      marca,
      descricao,
      tags: selectedTags,
      user_id: finalUserId, // ✅ Usa o userId final
      data_solicitacao: new Date().toISOString()
    };

    console.log("📦 Dados a serem enviados:", servicoData);

    try {
      // Pequeno delay para garantir que o loading seja visível
      setTimeout(() => {
        navigation.navigate('ListaPrestadores', { 
          servicoData,
          tagsString: selectedTags.join(", ")
        });
        setLoading(false);
      }, 500);
      
    } catch (error) {
      console.log("🔴 Erro na navegação:", error);
      setModalErro(true);
      setLoading(false);
    }
  };

  return (
    <View style={styles.pageContainer}>
      <Navbar />
      <ScrollView contentContainerStyle={styles.container}>
        

        <Animated.Text
          style={[
            styles.title,
            { opacity: titleOpacity, transform: [{ translateY: titleTranslateY }] },
          ]}
        >
          Solicitar Manutenção
        </Animated.Text>
        <Text style={styles.subtitle}>
          Preencha os dados do seu ar-condicionado para solicitar o serviço
        </Text>

        <View style={styles.form}>
  

          <Text style={styles.label}>Nome do Cliente</Text>
          <View
            style={[styles.input, { backgroundColor: "#e5e7eb", justifyContent: "center" }]}
          >
            <Text style={{ color: "#334155" }}>
              {nomeCliente || "Carregando..."}
            </Text>
          </View>

          <Text style={styles.label}>BTU</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowDropdownBtu(!showDropdownBtu)}
          >
            <Text style={styles.dropdownText}>
              {btu ? btu : "Selecione o BTU"}
            </Text>
          </TouchableOpacity>
          {showDropdownBtu && (
            <View style={styles.dropdownMenu}>
              {btusDisponiveis.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setBtu(b);
                    setShowDropdownBtu(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Marca</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowDropdownMarcas(!showDropdownMarcas)}
          >
            <Text style={styles.dropdownText}>
              {marca ? marca : "Selecione a marca"}
            </Text>
          </TouchableOpacity>
          {showDropdownMarcas && (
            <View style={styles.dropdownMenu}>
              {marcasDisponiveis.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setMarca(m);
                    setShowDropdownMarcas(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>
            Descrição <Text style={{ color: "#DC2626" }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea, descricaoErro && styles.inputError]}
            placeholder="Descreva brevemente o problema"
            multiline
            numberOfLines={4}
            value={descricao}
            onChangeText={(text) => {
              setDescricao(text);
              if (text) setDescricaoErro(false);
            }}
          />
          {descricaoErro && (
            <Text style={{ color: "#DC2626", marginBottom: 10, fontSize: 12 }}>
              Este campo é obrigatório
            </Text>
          )}

          <Text style={styles.label}>Tags</Text>
          <View style={styles.tagsContainer}>
            {tagsDisponiveis.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[styles.tag, selectedTags.includes(tag) && styles.tagSelected]}
                onPress={() => toggleTag(tag)}
              >
                <Text
                  style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextSelected]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, (loading || !userId) && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={loading || !userId}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Enviando..." : !userId ? "Carregando..." : "Enviar Solicitação"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Footer />

      {/* Modais */}
      <Modal
        visible={modalSucesso}
        transparent
        animationType="fade"
        onRequestClose={() => setModalSucesso(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.successBox}>
              <View style={styles.iconContainer}>
                <Ionicons name="snow" size={60} color="#0284c7" />
              </View>
              <Text style={styles.successTitle}>Sucesso!</Text>
              <Text style={styles.successSubtitle}>
                Serviço solicitado com sucesso. Aguarde o contato de um técnico.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => setModalSucesso(false)}
            >
              <Text style={styles.successButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalErro}
        transparent
        animationType="fade"
        onRequestClose={() => setModalErro(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={[styles.successBox, { backgroundColor: "#fffcdeff" }]}>
              <View style={styles.iconContainer}>
                <Ionicons name="snow" size={25} color="#000000ff" />
              </View>
              <Text style={[styles.successTitle, { color: "#000000ff" }]}>
                Atenção!
              </Text>
              <Text style={styles.successSubtitle}>
                Preencha todos os campos obrigatórios e selecione pelo menos uma tag.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.successButton, { backgroundColor: "#F1DD00" }]}
              onPress={() => setModalErro(false)}
            >
              <Text style={styles.successButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: { flex: 1, backgroundColor: "#DEEAF5FF" },
  container: {
    flexGrow: 1,
    paddingVertical: 20,
    alignItems: "center",
    width: "100%",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginLeft: 16,
    marginBottom: 10,
  },
  backButtonText: {
    color: "#0284c7",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0284c7",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#334155",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  form: {
    width: "95%",
    maxWidth: 600,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  // Novos estilos para debug
  debugInfo: {
    backgroundColor: "#fef3c7",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#d97706",
  },
  debugText: {
    fontSize: 12,
    color: "#92400e",
    fontFamily: "monospace",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#0284c7",
  },
  input: {
    backgroundColor: "#f9fafb",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    marginBottom: 15,
    fontSize: 14,
    color: "#334155",
  },
  inputError: {
    borderColor: "#DC2626",
    borderWidth: 2,
  },
  textArea: { 
    height: 100, 
    textAlignVertical: "top" 
  },
  dropdown: {
    backgroundColor: "#f9fafb",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0284c7",
    marginBottom: 10,
  },
  dropdownText: { fontSize: 14, color: "#334155" },
  dropdownMenu: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#0284c7",
    borderRadius: 12,
    marginBottom: 15,
  },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 12 },
  dropdownItemText: { fontSize: 14, color: "#334155" },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#0284c7",
    backgroundColor: "#f9fafb",
  },
  tagSelected: { backgroundColor: "#0284c7" },
  tagText: { color: "#0284c7", fontSize: 12 },
  tagTextSelected: { color: "#fff" },
  submitButton: {
    backgroundColor: "#0284c7",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  submitButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  successBox: {
    width: "100%",
    backgroundColor: "#DBEAFE",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginBottom: 15,
  },
  iconContainer: { 
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1DD00",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  successTitle: { fontSize: 24, fontWeight: "700", color: "#0284c7", marginBottom: 8 },
  successSubtitle: {
    fontSize: 14,
    color: "#334155",
    textAlign: "center",
    marginBottom: 20,
  },
  successButton: {
    backgroundColor: "#0284c7",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  successButtonText: { color: "#000000ff", fontSize: 16, fontWeight: "700" },
});

export default ServicoCliente;