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
} from "react-native";
import Navbar from "../../componentes/navbar";
import Footer from "../../componentes/footer";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "../../services/authService";
import { API_CONFIG } from "../../../configIp";

const { width } = Dimensions.get("window");

const tagsDisponiveis = ["Limpeza", "Manutenção", "Instalação", "Reposição de Gás", "Troca de Peças"];
const marcasDisponiveis = ["Samsung", "LG", "Midea", "Electrolux", "Fujitsu", "Elgin"];
const btusDisponiveis = ["9000", "12000", "18000", "24000", "30000"];

const ServicoCliente: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [usuario, setUsuario] = useState<any>(null);

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

    // Buscar nome do cliente do authService (sistema centralizado)
    const loadUserData = async () => {
      try {
        // Usa authService para pegar dados do usuário (funciona em web e mobile)
        const storedUser = await authService.getUser();
        
        if (storedUser) {
          const userName = storedUser.nome || storedUser.displayName || 'Cliente';
          const userId = storedUser.id_usuario || storedUser.id || storedUser.uid;
          
          console.log('✅ [ServicoCliente] Nome do usuário carregado do login:', userName);
          setUsuario({ 
            uid: userId, 
            displayName: userName, 
            email: storedUser.email 
          });
          setNomeCliente(userName);
        } else {
          console.log('⚠️ [ServicoCliente] Nenhum usuário autenticado encontrado');
          setNomeCliente('Cliente');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados do usuário:', error);
        setNomeCliente('Cliente');
      }
    };

    loadUserData();
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };


  // Função para navegar para escolha de prestadores
  const handleEscolherPrestadores = () => {
    // Validar campos antes de navegar
    if (!nomeCliente.trim() || !btu.trim() || !marca.trim() || !descricao.trim() || selectedTags.length === 0) {
      setModalErro(true);
      return;
    }

    // Preparar dados para levar para a tela seguinte
    const servicoData = {
      cliente: nomeCliente.trim(),
      btu: btu.trim(),
      marca: marca.trim(),
      descricao: descricao.trim(),
      tags: selectedTags,
      user_id: usuario?.uid,
    };

    const tagsString = selectedTags.join(", ");

    // Navegar para tela de seleção de prestadores
    navigation.navigate('ListaPrestadores', { 
      servicoData, 
      tagsString 
    });
  };

  return (
    <View style={styles.pageContainer}>
      <Navbar />
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#0284c7" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

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

          {/* Descrição com asterisco */}
          <Text style={styles.label}>
            Descrição <Text style={{ color: "#DC2626" }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
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
            style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
            onPress={handleEscolherPrestadores}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Enviando..." : "Enviar Solicitação"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Footer />

      {/* Modal de sucesso */}
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
              onPress={() => {
                setModalSucesso(false);
                navigation.navigate('dash_cliente');
              }}
            >
              <Text style={styles.successButtonText}>Voltar ao Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de erro */}
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
                Preencha todos os campos obrigatórios e selecione pelo menos uma
                tag.
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
  textArea: { height: 100, textAlignVertical: "top" },
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
