import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

// Componentes
import Navbar from "../../componentes/navbar";
import Footer from "../../componentes/footer";
import AnuncioModal from "../../componentes/AnuncioModal";
import { API_CONFIG } from "../../../configIp";

interface Produto {
  id: number;
  NOME: string;
  MARCA: string;
  ENDERECO: string;
  VALOR1: number;
  VALOR2: number;
  BTU: number;
  ESPPRO: string;
  TIPO: string;
  created_at?: string;
  VIEW?: number;
}

interface MeusAnunciosProps {
  navigation: any;
  route?: {
    params?: {
      lojistaId?: string;
    };
  };
}

const MeusAnuncios: React.FC<MeusAnunciosProps> = ({ navigation, route }) => {
  const [usuario, setUsuario] = useState<any>(null);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados do modal
  const [modalVisible, setModalVisible] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    // Carregar usuário do localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUsuario({ uid: parsedUser.id || parsedUser.uid });
    }
  }, []);

  // Refresh automático quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      if (usuario?.uid) {
        buscarMeusAnuncios();
      }
    }, [usuario?.uid])
  );

  useEffect(() => {
    if (usuario?.uid) {
      buscarMeusAnuncios();
    }
  }, [usuario?.uid]);

  const buscarMeusAnuncios = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!usuario?.uid) {
        setError("Usuário não autenticado");
        return;
      }

      // Buscar apenas anúncios do prestador/lojista logado
      const response = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.MEUS_ANUNCIOS}/${usuario.uid}`);
      const data = await response.json();

      if (data.success) {
        setProdutos(data.products || []);
      } else {
        setError("Erro ao buscar anúncios");
      }
    } catch (err) {
      console.error("Erro ao buscar anúncios:", err);
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 SISTEMA RESPONSIVO PARA CARDS DE ANÚNCIOS
  const getResponsiveLayout = () => {
    let numColumns, cardWidth, gap, horizontalPadding;
    
    if (screenWidth >= 1400) {
      // Desktop Extra Large
      numColumns = 3;
      gap = 24;
      horizontalPadding = 60;
    } else if (screenWidth >= 1000) {
      // Desktop Large
      numColumns = 3;
      gap = 20;
      horizontalPadding = 40;
    } else if (screenWidth >= 768) {
      // Desktop Medium / Tablet Large
      numColumns = 2;
      gap = 20;
      horizontalPadding = 32;
    } else if (screenWidth >= 600) {
      // Tablet Small
      numColumns = 2;
      gap = 16;
      horizontalPadding = 24;
    } else {
      // Mobile
      numColumns = 1;
      gap = 0;
      horizontalPadding = 16;
    }

    // Calcular largura do card
    const availableWidth = screenWidth - (horizontalPadding * 2);
    const totalGapWidth = gap * Math.max(0, numColumns - 1);
    cardWidth = (availableWidth - totalGapWidth) / numColumns;
    
    return { numColumns, cardWidth, gap, horizontalPadding };
  };

  const { numColumns, cardWidth, gap, horizontalPadding } = getResponsiveLayout();

  // 🔥 ESTILOS RESPONSIVOS DENTRO DO COMPONENTE
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F8FAFC",
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      marginLeft: 5,
      marginBottom: 10,
    },
    backButtonText: {
      color: "#0284c7",
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 5,
    },
    conteudo: {
      flexGrow: 1,
      paddingHorizontal: horizontalPadding,
      paddingVertical: 20,
      paddingBottom: 100,
      maxWidth: 1600,
      alignSelf: 'center',
      width: '100%',
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
      flexWrap: "wrap",
      gap: 16,
    },
    titulo: {
      fontSize: 28,
      fontWeight: "700",
      color: "#1e293b",
      flex: 1,
      minWidth: 200,
    },
    headerButtons: {
      flexDirection: "row",
      gap: 12,
    },
    botaoNovo: {
      backgroundColor: "#0284c7",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 4,
    },
    botaoNovoText: {
      color: "#ffffff",
      fontSize: 14,
      fontWeight: "600",
    },
    botaoUsado: {
      backgroundColor: "#d97706",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 4,
    },
    botaoUsadoText: {
      color: "#ffffff",
      fontSize: 14,
      fontWeight: "600",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: "#64748b",
    },
    errorContainer: {
      padding: 20,
      alignItems: "center",
    },
    errorText: {
      fontSize: 16,
      color: "#ef4444",
      textAlign: "center",
      marginBottom: 16,
    },
    botaoTentar: {
      backgroundColor: "#0284c7",
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    botaoTentarText: {
      color: "#ffffff",
      fontWeight: "600",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 60,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: "#475569",
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 16,
      color: "#64748b",
      textAlign: "center",
      marginBottom: 24,
    },
    botaoCriarPrimeiro: {
      backgroundColor: "#0284c7",
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    botaoCriarPrimeiroText: {
      color: "#ffffff",
      fontWeight: "600",
      fontSize: 16,
    },
    info: {
      marginBottom: 16,
    },
    infoText: {
      fontSize: 14,
      color: "#64748b",
    },
    
    // 🔥 NOVOS ESTILOS RESPONSIVOS
    flatlistContainer: {
      paddingBottom: 20,
    },
    row: {
      justifyContent: 'flex-start',
      marginBottom: 16,
    },
    
    // 🔥 CARD RESPONSIVO E MODERNO
    produtoCard: {
      backgroundColor: "#ffffff",
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1,
      borderColor: '#f1f5f9',
    },
    
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    
    tipoBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    
    tipoNovo: {
      backgroundColor: "#",
    },
    
    tipoUsado: {
      backgroundColor: "#d97706",
    },
    
    tipoText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "700",
      marginLeft: 4,
    },
    
    acoes: {
      flexDirection: "row",
      gap: 6,
    },
    
    botaoAcao: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: "#f8fafc",
      borderWidth: 1,
      borderColor: '#e2e8f0',
    },
    
    cardContent: {
      gap: 12,
    },
    
    nomeProduto: {
      fontSize: 18,
      fontWeight: "700",
      color: "#1e293b",
      lineHeight: 24,
    },
    
    marca: {
      fontSize: 14,
      color: "#64748b",
      fontWeight: "500",
    },
    
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    
    btuContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#eff6ff",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    
    btu: {
      fontSize: 13,
      fontWeight: "600",
      color: "#3b82f6",
      marginLeft: 4,
    },
    
    viewsContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    
    views: {
      fontSize: 13,
      color: "#64748b",
      marginLeft: 4,
      fontWeight: "500",
    },
    
    precoContainer: {
      backgroundColor: "#f0fdf4",
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#bbf7d0",
    },
    
    precoOriginalContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
      position: 'relative',
    },
    
    precoOriginal: {
      fontSize: 14,
      color: "#64748b",
      textDecorationLine: "line-through",
    },
    
    descontoBadge: {
      backgroundColor: "#ef4444",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      marginLeft: 8,
    },
    
    descontoText: {
      color: "#fff",
      fontSize: 11,
      fontWeight: "700",
    },
    
    precoFinal: {
      fontSize: 20,
      fontWeight: "800",
      color: "#059669",
    },
    
    localizacaoContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fafafa",
      padding: 8,
      borderRadius: 6,
    },
    
    endereco: {
      fontSize: 13,
      color: "#64748b",
      marginLeft: 4,
      flex: 1,
    },
    
    verMaisContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f8fafc",
      padding: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#e2e8f0",
      marginTop: 4,
    },
    
    verMaisText: {
      fontSize: 12,
      color: "#64748b",
      fontWeight: "500",
      marginRight: 4,
    },
  });

  const confirmarExclusao = (produto: Produto) => {
    Alert.alert(
      "Excluir Anúncio",
      `Deseja excluir o anúncio "${produto.NOME}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => excluirAnuncio(produto.id)
        }
      ]
    );
  };

  const excluirAnuncio = async (produtoId: number) => {
    try {
      if (!usuario?.uid) {
        Alert.alert("Erro", "Usuário não autenticado");
        return;
      }

      const formData = new URLSearchParams();
      formData.append('prestador_id', usuario.uid);

      const response = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.ANUNCIO}/${produtoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert("Sucesso", "Anúncio excluído com sucesso!");
        buscarMeusAnuncios(); // Recarregar lista
      } else {
        Alert.alert("Erro", data.detail || "Não foi possível excluir o anúncio");
      }
    } catch (err) {
      console.error("Erro ao excluir:", err);
      Alert.alert("Erro", "Erro de conexão ao excluir anúncio");
    }
  };

  const editarAnuncio = (produto: Produto) => {
    navigation.navigate('AnunciarProduto', { 
      editMode: true, 
      produto: produto 
    });
  };

  // 🔥 FUNÇÕES DO MODAL
  const abrirModal = (produto: Produto) => {
    setProdutoSelecionado(produto);
    setModalVisible(true);
  };

  const fecharModal = () => {
    setModalVisible(false);
    setProdutoSelecionado(null);
  };

  const handleEditarDoModal = (produto: Produto) => {
    editarAnuncio(produto);
  };

  const handleExcluirDoModal = (produto: Produto) => {
    confirmarExclusao(produto);
  };

  // 🔥 RENDER CARD RESPONSIVO E CLICÁVEL
  const renderProdutoCard = ({ item: produto, index }: { item: Produto, index: number }) => {
    const calcularDesconto = () => {
      if (produto.VALOR1 > 0 && produto.VALOR2 > 0) {
        const desconto = ((produto.VALOR1 - produto.VALOR2) / produto.VALOR1) * 100;
        return Math.round(desconto);
      }
      return 0;
    };

    const desconto = calcularDesconto();
    const isLastInRow = (index + 1) % numColumns === 0;

    return (
      <TouchableOpacity
        style={[
          styles.produtoCard,
          { 
            width: cardWidth,
            marginRight: isLastInRow ? 0 : gap,
          }
        ]}
        onPress={() => abrirModal(produto)}
        activeOpacity={0.7}
      >
        {/* Header com tipo e ações rápidas */}
        <View style={styles.cardHeader}>
          <View style={[
            styles.tipoBadge,
            produto.TIPO === 'NOVO' ? styles.tipoNovo : styles.tipoUsado
          ]}>
            <Ionicons 
              name={produto.TIPO === 'NOVO' ? 'sparkles' : 'refresh'} 
              size={12} 
              color="#fff" 
            />
            <Text style={styles.tipoText}>{produto.TIPO}</Text>
          </View>
          
          <View style={styles.acoes}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                editarAnuncio(produto);
              }}
              style={styles.botaoAcao}
            >
              <Ionicons name="pencil" size={16} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                confirmarExclusao(produto);
              }}
              style={styles.botaoAcao}
            >
              <Ionicons name="trash" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Conteúdo principal */}
        <View style={styles.cardContent}>
          <Text style={styles.nomeProduto} numberOfLines={2}>
            {produto.NOME}
          </Text>
          
          <Text style={styles.marca} numberOfLines={1}>
            {produto.MARCA}
          </Text>
          
          <View style={styles.infoRow}>
            <View style={styles.btuContainer}>
              <Ionicons name="thermometer" size={14} color="#3b82f6" />
              <Text style={styles.btu}>{produto.BTU} BTU</Text>
            </View>
            
            <View style={styles.viewsContainer}>
              <Ionicons name="eye" size={14} color="#64748b" />
              <Text style={styles.views}>{produto.VIEW || 0}</Text>
            </View>
          </View>

          {/* Preços */}
          <View style={styles.precoContainer}>
            {produto.VALOR1 > 0 && produto.VALOR1 !== produto.VALOR2 && (
              <View style={styles.precoOriginalContainer}>
                <Text style={styles.precoOriginal}>
                  R$ {produto.VALOR1.toLocaleString('pt-BR')}
                </Text>
                {desconto > 0 && (
                  <View style={styles.descontoBadge}>
                    <Text style={styles.descontoText}>-{desconto}%</Text>
                  </View>
                )}
              </View>
            )}
            <Text style={styles.precoFinal}>
              R$ {produto.VALOR2.toLocaleString('pt-BR')}
            </Text>
          </View>

          {/* Localização */}
          <View style={styles.localizacaoContainer}>
            <Ionicons name="location" size={12} color="#64748b" />
            <Text style={styles.endereco} numberOfLines={1}>
              {produto.ENDERECO}
            </Text>
          </View>

          {/* Indicador de mais detalhes */}
          <View style={styles.verMaisContainer}>
            <Text style={styles.verMaisText}>Toque para ver detalhes</Text>
            <Ionicons name="chevron-forward" size={14} color="#64748b" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Navbar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text style={styles.loadingText}>Carregando seus anúncios...</Text>
        </View>
        <Footer />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Navbar />
      
      <ScrollView contentContainerStyle={styles.conteudo}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#0284c7" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        
        <View style={styles.header}>
          <Text style={styles.titulo}>Meus Anúncios</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('AnunciarProduto', { tipo: 'NOVO' })}
              style={styles.botaoNovo}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text style={styles.botaoNovoText}>Novo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => navigation.navigate('AnunciarProduto', { tipo: 'USADO' })}
              style={styles.botaoUsado}
            >
              <Ionicons name="add-circle-outline" size={20} color="#ffffff" />
              <Text style={styles.botaoUsadoText}>Usado</Text>
            </TouchableOpacity>
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={buscarMeusAnuncios} style={styles.botaoTentar}>
              <Text style={styles.botaoTentarText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {!error && produtos.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={80} color="#94a3b8" />
            <Text style={styles.emptyTitle}>Nenhum anúncio encontrado</Text>
            <Text style={styles.emptySubtitle}>
              Você ainda não possui anúncios cadastrados
            </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('AnunciarProduto')}
              style={styles.botaoCriarPrimeiro}
            >
              <Text style={styles.botaoCriarPrimeiroText}>Criar Primeiro Anúncio</Text>
            </TouchableOpacity>
          </View>
        )}

        {produtos.length > 0 && (
          <>
            <View style={styles.info}>
              <Text style={styles.infoText}>
                {produtos.length} anúncio{produtos.length !== 1 ? 's' : ''} encontrado{produtos.length !== 1 ? 's' : ''}
              </Text>
            </View>

            <FlatList
              data={produtos}
              renderItem={renderProdutoCard}
              keyExtractor={(item) => item.id.toString()}
              numColumns={numColumns}
              key={`flatlist-${numColumns}-${screenWidth}`}
              columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
              contentContainerStyle={styles.flatlistContainer}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false} // Desabilitar scroll do FlatList já que está dentro do ScrollView
            />
          </>
        )}
      </ScrollView>
      
      {/* Modal de detalhes */}
      <AnuncioModal
        visible={modalVisible}
        produto={produtoSelecionado}
        onClose={fecharModal}
        onEdit={handleEditarDoModal}
        onDelete={handleExcluirDoModal}
      />
      
      <Footer />
    </View>
  );
};

export default MeusAnuncios;
