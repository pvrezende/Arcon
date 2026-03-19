import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import Navbar from "../../componentes/navbar";
import Footer from "../../componentes/footer";
import Navegacao from "../../componentes/Navegacao";
import { API_CONFIG } from "../../../configIp";
import { authService } from "../../services/authService";

const Credenciamento = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [userId, setUserId] = useState(null);
  const [dadosExistentes, setDadosExistentes] = useState(null);

  // Campos do formulário
  const [formData, setFormData] = useState({
    certificado_credenciado: "",
    marca_credenciada: "",
    numero_credenciamento: "",
    validade_credenciamento: "",
    especialidades: "",
    observacoes: "",
  });

  // Buscar dados do usuário e credenciamento existente
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const storedUser = await authService.getUser();
        if (storedUser) {
          const id = storedUser.id_usuario || storedUser.id || storedUser.uid;
          setUserId(id);
          
          // 🔥 MOCK: Simulando dados existentes (comentar quando backend estiver pronto)
          // Simula que não há dados ainda (para testar formulário vazio)
          // Descomente as linhas abaixo para testar com dados preenchidos
          /*
          setDadosExistentes({
            certificado_credenciado: "NR-10, NR-35",
            marca_credenciada: "Samsung, LG, Electrolux",
            numero_credenciamento: "CREA-12345",
            validade_credenciamento: "31/12/2025",
            especialidades: "Instalação e manutenção de ar-condicionado, Refrigeração industrial",
            observacoes: "15 anos de experiência no mercado"
          });
          setFormData({
            certificado_credenciado: "NR-10, NR-35",
            marca_credenciada: "Samsung, LG, Electrolux",
            numero_credenciamento: "CREA-12345",
            validade_credenciamento: "31/12/2025",
            especialidades: "Instalação e manutenção de ar-condicionado, Refrigeração industrial",
            observacoes: "15 anos de experiência no mercado"
          });
          */
          
          // 🔥 Backend real (descomentar quando implementar)
          /*
          const response = await fetch(
            `${API_CONFIG.BACKEND_URL}/credenciamento/${id}`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.credenciamento) {
              setDadosExistentes(data.credenciamento);
              setFormData({
                certificado_credenciado: data.credenciamento.certificado_credenciado || "",
                marca_credenciada: data.credenciamento.marca_credenciada || "",
                numero_credenciamento: data.credenciamento.numero_credenciamento || "",
                validade_credenciamento: data.credenciamento.validade_credenciamento || "",
                especialidades: data.credenciamento.especialidades || "",
                observacoes: data.credenciamento.observacoes || "",
              });
            }
          }
          */
        } else {
          Alert.alert("Erro", "Usuário não encontrado. Faça login novamente.");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        // Não exibe erro em modo mock
        console.log("🔥 MODO MOCK: Erro ignorado");
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Formatar data para DD/MM/YYYY
  const formatarData = (texto: string) => {
    const numeros = texto.replace(/\D/g, "");
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`;
  };

  const handleDataChange = (texto: string) => {
    const dataFormatada = formatarData(texto);
    handleChange("validade_credenciamento", dataFormatada);
  };

  const validarFormulario = () => {
    // Verificar se pelo menos um campo foi preenchido
    const algumCampoPreenchido = Object.values(formData).some(
      value => value.trim() !== ""
    );

    if (!algumCampoPreenchido) {
      Alert.alert("Atenção", "Preencha pelo menos um campo antes de salvar.");
      return false;
    }

    // Validar formato da data se preenchida
    if (formData.validade_credenciamento) {
      const regex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!regex.test(formData.validade_credenciamento)) {
        Alert.alert("Atenção", "Data de validade inválida. Use o formato DD/MM/AAAA.");
        return false;
      }
    }

    return true;
  };

  const handleSalvar = async () => {
    if (!validarFormulario()) return;

    setSalvando(true);
    
    // 🔥 MOCK: Simulando salvamento (remover quando backend estiver pronto)
    try {
      // Simula delay de rede
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("🔥 MODO MOCK: Dados que seriam salvos:", {
        user_id: userId,
        ...formData
      });
      
      // Simula sucesso
      setDadosExistentes(formData);
      
      Alert.alert(
        "Sucesso! (MOCK)",
        "Suas informações de credenciamento foram salvas com sucesso.\n\n⚠️ Modo simulado: dados não foram salvos no banco de dados.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
      
      return;
    } catch (error) {
      console.error("Erro no mock:", error);
    } finally {
      setSalvando(false);
    }
    
    // 🔥 Backend real (descomentar quando implementar)
    /*
    try {
      const body = new URLSearchParams({
        user_id: userId.toString(),
        certificado_credenciado: formData.certificado_credenciado,
        marca_credenciada: formData.marca_credenciada,
        numero_credenciamento: formData.numero_credenciamento,
        validade_credenciamento: formData.validade_credenciamento,
        especialidades: formData.especialidades,
        observacoes: formData.observacoes,
      });

      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}/credenciamento/salvar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        Alert.alert(
          "Sucesso!",
          "Suas informações de credenciamento foram salvas com sucesso.",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error(result.message || "Erro ao salvar informações");
      }
    } catch (error) {
      console.error("Erro ao salvar credenciamento:", error);
      Alert.alert(
        "Erro",
        "Não foi possível salvar suas informações. Tente novamente."
      );
    } finally {
      setSalvando(false);
    }
    */
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Navbar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
        <Footer />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Navbar />
      
      <View style={styles.navegacaoContainer}>
        <Navegacao 
          items={[
            { label: "Área do Prestador", onPress: () => navigation.goBack() },
            { label: "Credenciamento", onPress: () => {} }
          ]} 
          showHomeIcon={true} 
        />
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroBackground}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Ionicons name="shield-checkmark" size={32} color="#ffffff" />
              </View>
            </View>
            
            <Text style={styles.heroTitle}>Credenciamento Profissional</Text>
            <Text style={styles.heroSubtitle}>
              Complete suas informações de credenciamento para oferecer mais confiança aos seus clientes
            </Text>
          </View>
        </View>

        {/* Formulário */}
        <View style={styles.formContainer}>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color="#0284c7" />
            <Text style={styles.infoText}>
              Preencha as informações abaixo para validar suas credenciais profissionais. 
              Todos os campos são opcionais, mas quanto mais informações você fornecer, 
              maior será a confiança dos clientes.
            </Text>
          </View>

          {/* Certificado Credenciado */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="document-text" size={16} color="#0284c7" /> 
              {" "}Certificado Credenciado
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: NR-10, NR-35, ISO 9001..."
              value={formData.certificado_credenciado}
              onChangeText={(text) => handleChange("certificado_credenciado", text)}
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.helpText}>
              Informe os certificados técnicos que você possui
            </Text>
          </View>

          {/* Marca Credenciada */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="business" size={16} color="#0284c7" /> 
              {" "}Marca Credenciada
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Samsung, LG, Electrolux..."
              value={formData.marca_credenciada}
              onChangeText={(text) => handleChange("marca_credenciada", text)}
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.helpText}>
              Marcas pelas quais você possui credenciamento oficial
            </Text>
          </View>

          {/* Número Credenciamento */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="barcode" size={16} color="#0284c7" /> 
              {" "}Número de Credenciamento
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o número do seu credenciamento"
              value={formData.numero_credenciamento}
              onChangeText={(text) => handleChange("numero_credenciamento", text)}
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.helpText}>
              Número de registro ou identificação do credenciamento
            </Text>
          </View>

          {/* Validade Credenciamento */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="calendar" size={16} color="#0284c7" /> 
              {" "}Validade do Credenciamento
            </Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              value={formData.validade_credenciamento}
              onChangeText={handleDataChange}
              keyboardType="numeric"
              maxLength={10}
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.helpText}>
              Data de validade do seu credenciamento
            </Text>
          </View>

          {/* Especialidades */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="construct" size={16} color="#0284c7" /> 
              {" "}Especialidades
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ex: Instalação de ar-condicionado, Manutenção elétrica, Refrigeração..."
              value={formData.especialidades}
              onChangeText={(text) => handleChange("especialidades", text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.helpText}>
              Liste suas principais áreas de atuação e especialidades
            </Text>
          </View>

          {/* Observações */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="chatbox-ellipses" size={16} color="#0284c7" /> 
              {" "}Observações
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Informações adicionais relevantes sobre seu credenciamento..."
              value={formData.observacoes}
              onChangeText={(text) => handleChange("observacoes", text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.helpText}>
              Adicione quaisquer informações adicionais que considere relevantes
            </Text>
          </View>

          {/* Botões de Ação */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => navigation.goBack()}
              disabled={salvando}
            >
              <Ionicons name="arrow-back" size={20} color="#64748b" />
              <Text style={styles.buttonTextSecondary}>Voltar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, salvando && styles.buttonDisabled]}
              onPress={handleSalvar}
              disabled={salvando}
            >
              {salvando ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.buttonTextPrimary}>Salvando...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                  <Text style={styles.buttonTextPrimary}>Salvar Informações</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {dadosExistentes && (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={20} color="#b700ffff" />
              <Text style={styles.successText}>
                Você já possui informações de credenciamento cadastradas. 
                Os dados acima serão atualizados ao salvar.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContainer: {
    flex: 1,
  },
  navegacaoContainer: {
    backgroundColor: "#a200ffff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  heroSection: {
    backgroundColor: "#ff009dff",
    paddingBottom: 40,
  },
  heroBackground: {
    alignItems: "center",
    padding: 30,
    paddingTop: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#0ea5e9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#e0f2fe",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 600,
  },
  formContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 40,
    padding: 25,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#e0f2fe",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#0284c7",
  },
  infoText: {
    flex: 1,
    color: "#0369a1",
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#1e293b",
    backgroundColor: "#ffffff",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  helpText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 6,
    fontStyle: "italic",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonPrimary: {
    backgroundColor: "#0284c7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonSecondary: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  buttonTextPrimary: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonTextSecondary: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  successBox: {
    flexDirection: "row",
    backgroundColor: "#f0fdf4",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#22c55e",
  },
  successText: {
    flex: 1,
    color: "#166534",
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 12,
  },
});

export default Credenciamento;

