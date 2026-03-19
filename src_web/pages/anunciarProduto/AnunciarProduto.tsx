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
  Platform,
  Modal,
  Alert,
} from "react-native";
import Navbar from "../../componentes/navbar";
import Footer from "../../componentes/footer";
import { Ionicons } from "@expo/vector-icons";
import FormularioAnuncio from "../../componentes/anunciarProduto/FormularioAnuncio";
import ModalSucesso from "../../componentes/anunciarProduto/ModalSucesso";
import { anunciarProduto, AnuncioData } from "../../componentes/anunciarProduto/anuncioService";
import { styles } from "./AnunciarProduto.styles";

const { width } = Dimensions.get("window");

const marcasDisponiveis = ["Samsung", "LG", "Midea", "Electrolux", "Fujitsu", "Consul", "Springer", "Gree", "Carrier", "York"];
const btusDisponiveis = ["7000", "9000", "12000", "18000", "22000", "24000", "30000", "36000"];

interface AnunciarProdutoProps {
  navigation: any;
  route?: {
    params?: {
      tipo?: string;
      editMode?: boolean;
      produto?: any;
    };
  };
}

const AnunciarProduto: React.FC<AnunciarProdutoProps> = ({ navigation, route }) => {
  const [usuario, setUsuario] = useState<any>(null);

  const [formData, setFormData] = useState({
    nome: "",
    marca: "",
    endereco: "",
    valor1: "",
    valor2: "",
    btu: "",
    especificacao: "",
    tipo: "",
  });

  const [showDropdownMarcas, setShowDropdownMarcas] = useState(false);
  const [showDropdownBtu, setShowDropdownBtu] = useState(false);
  const [showDropdownTipo, setShowDropdownTipo] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalErro, setModalErro] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

    // Carregar usuário do localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUsuario({ uid: parsedUser.id || parsedUser.uid });
    }
  }, []);

  useEffect(() => {
    // Inicializar com tipo recebido da navegação
    const tipoRecebido = route?.params?.tipo;
    const editMode = route?.params?.editMode;
    const produto = route?.params?.produto;

    if (tipoRecebido) {
      setFormData(prev => ({
        ...prev,
        tipo: tipoRecebido
      }));
    }

    if (editMode && produto) {
      // Preencher formulário para edição
      setFormData({
        nome: produto.NOME || "",
        marca: produto.MARCA || "",
        endereco: produto.ENDERECO || "",
        valor1: produto.VALOR1?.toString() || "",
        valor2: produto.VALOR2?.toString() || "",
        btu: produto.BTU?.toString() || "",
        especificacao: produto.ESPPRO || "",
        tipo: produto.TIPO || "",
      });
    }
  }, [route?.params]);

  const handleInputChange = (campo: string, valor: string) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const validarFormulario = () => {
    const { nome, marca, endereco, valor1, valor2, btu, especificacao } = formData;
    
    if (!nome.trim()) {
      Alert.alert("Erro", "Por favor, preencha o nome do produto");
      return false;
    }
    if (!marca) {
      Alert.alert("Erro", "Por favor, selecione uma marca");
      return false;
    }
    if (!endereco.trim()) {
      Alert.alert("Erro", "Por favor, preencha o endereço");
      return false;
    }
    
    // Validar valor2 (obrigatório)
    const valor2Num = parseFloat(valor2.replace(/[^0-9.,]/g, '').replace(',', '.'));
    if (!valor2 || isNaN(valor2Num) || valor2Num <= 0) {
      Alert.alert("Erro", "Por favor, preencha um valor de venda válido");
      return false;
    }
    
    // Validar valor1 (opcional, mas se preenchido deve ser válido)
    if (valor1) {
      const valor1Num = parseFloat(valor1.replace(/[^0-9.,]/g, '').replace(',', '.'));
      if (isNaN(valor1Num) || valor1Num < 0) {
        Alert.alert("Erro", "Valor original deve ser um número válido");
        return false;
      }
    }
    
    if (!btu) {
      Alert.alert("Erro", "Por favor, selecione o BTU");
      return false;
    }
    if (!especificacao.trim()) {
      Alert.alert("Erro", "Por favor, preencha as especificações do produto");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) return;

    setIsLoading(true);

    try {
      const dadosAnuncio: AnuncioData = {
        ...formData,
        prestador_id: usuario?.uid || '', // ID do usuário logado
      };

      await anunciarProduto(dadosAnuncio);
      
      setModalSucesso(true);
      
      // Limpar formulário
      setFormData({
        nome: "",
        marca: "",
        endereco: "",
        valor1: "",
        valor2: "",
        btu: "",
        especificacao: "",
        tipo: "",
      });

    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao anunciar o produto. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.pageContainer}>
      <Navbar />
      
      <ScrollView contentContainerStyle={styles.container}>
        {/* Botão Voltar */}
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
          Anuncie seu Ar-condicionado
        </Animated.Text>
        
        <Text style={styles.subtitle}>
          Preencha os dados do seu ar-condicionado usado para colocá-lo à venda
        </Text>

        <FormularioAnuncio
          formData={formData}
          onInputChange={handleInputChange}
          marcasDisponiveis={marcasDisponiveis}
          btusDisponiveis={btusDisponiveis}
          showDropdownMarcas={showDropdownMarcas}
          setShowDropdownMarcas={setShowDropdownMarcas}
          showDropdownBtu={showDropdownBtu}
          setShowDropdownBtu={setShowDropdownBtu}
          showDropdownTipo={showDropdownTipo}
          setShowDropdownTipo={setShowDropdownTipo}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          tipoTravado={!!route?.params?.tipo} // Trava o tipo se vier da DashLojista
        />
      </ScrollView>

      <Footer />

      <ModalSucesso
        visible={modalSucesso}
        onClose={() => {
          setModalSucesso(false);
          navigation.goBack();
        }}
      />
    </View>
  );
};



export default AnunciarProduto;