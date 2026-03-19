import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DetalhesModal from './DetalhesModal';
import CarrinhoSidebar from './CarrinhoSidebar';
import SandboxPagamento from './SandboxPagamento';
import ConfirmacaoPagamento from './ConfirmacaoPagamento';
import DadosUsuario from './DadosUsuario';
import PaginacaoProdutos from './PaginacaoProdutos';
import { styles } from './ComprarNovo.styles';
import Navbar from '../../componentes/navbar';
import { API_CONFIG } from '../../../configIp';
import Footer from '../../componentes/footer';
import { buscarProdutosNovos, ProdutoNovoFormatado } from './produtoNovoService';

// Tipos
interface Loja {
  nome: string;
  avaliacao: number;
  avaliacoes: number;
  endereco: string;
}

interface Produto {
  id: string; // Mantenha como string para consistência
  modelo: string;
  marca: string;
  btu: string;
  caracteristicas: string[];
  preco: number;
  precoOriginal?: number;
  desconto: number;
  frete: string;
  disponivel: boolean;
  loja: Loja;
  imagem?: string;
  descricaoCompleta?: string;
  views?: number;
}

interface PedidoConfirmado {
  numero: string;
  total: number;
  itens: number;
  data: string;
  produtos: { modelo: string; preco: number }[];
}

interface ComprarNovoProps {
  navigation: any;
}

// Função para enviar views para o backend - CORRIGIDA
const enviarViewParaBackend = async (produtoId: string, incremento: number) => {
  try {
    // URL centralizada no configIp
    const response = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.ADD_VIEW}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `id_produto=${produtoId}&view_count=${incremento}`
    });

    if (!response.ok) {
      throw new Error('Erro ao enviar views para o backend');
    }

    const data = await response.json();
    console.log('Views atualizadas com sucesso:', data);
    return data;
  } catch (error) {
    console.error('Erro ao enviar views:', error);
  }
};

const ComprarNovo: React.FC<ComprarNovoProps> = ({ navigation }) => {
  // Estados para produtos da API
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [carrinho, setCarrinho] = useState<Produto[]>([]);
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [sidebarCarrinhoOpen, setSidebarCarrinhoOpen] = useState(false);
  const [modalSandboxOpen, setModalSandboxOpen] = useState(false);
  const [telaPagamento, setTelaPagamento] = useState('');
  const [pedidoConfirmado, setPedidoConfirmado] = useState<PedidoConfirmado | null>(null);
  const [modalDadosUsuarioOpen, setModalDadosUsuarioOpen] = useState(false);
  
  // Estados de paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  // Estado para controlar views por produto
  const [produtosViews, setProdutosViews] = useState<{[key: string]: number}>({});

  // Função para carregar produtos da API
  const carregarProdutos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const produtosNovos = await buscarProdutosNovos();
      
      // Inicializar contadores de views para cada produto
      const viewsInicial: {[key: string]: number} = {};
      produtosNovos.forEach(produto => {
        viewsInicial[produto.id] = produto.views || 0;
      });
      
      setProdutosViews(viewsInicial);
      setProdutos(produtosNovos);
    } catch (err) {
      setError('Erro ao carregar produtos. Tente novamente.');
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar produtos ao montar o componente
  useEffect(() => {
    carregarProdutos();
  }, []);

  // Função para ver detalhes com contador - CORRIGIDA
  const verDetalhesComContador = async (produto: Produto) => {
    if (!produto.disponivel) return;

    try {
      const incremento = 1;
      
      // Atualiza o estado local - use produto.id como string
      setProdutosViews(prev => ({
        ...prev,
        [produto.id]: (prev[produto.id] || 0) + incremento
      }));

      // Abre o modal de detalhes
      setProdutoSelecionado(produto);
      setModalDetalhesOpen(true);

      // Envia APENAS O INCREMENTO (1) para o backend
      // O backend espera id_produto como int, então convertemos
      const produtoIdNumerico = parseInt(produto.id, 10);
      if (!isNaN(produtoIdNumerico)) {
        await enviarViewParaBackend(produtoIdNumerico.toString(), incremento);
      } else {
        console.warn('ID do produto inválido:', produto.id);
      }
      
    } catch (error) {
      console.error('Erro ao registrar view:', error);
    }
  };

  // Dados do usuário mockados
  const [dadosUsuario, setDadosUsuario] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    endereco: {
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
    },
    cartaoCredito: {
      numero: '',
      nome: '',
      vencimento: '',
      cvv: '',
    }
  });

  // Lógica de paginação
  const totalPaginas = Math.ceil(produtos.length / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const produtosPaginados = produtos.slice(indiceInicio, indiceFim);

  const handlePaginaChange = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
  };

  const goToHome = () => {
    navigation.navigate('dash_cliente');
  };

  const goToDadosUsuario = () => {
    setModalDadosUsuarioOpen(true);
  };

  const handleSalvarDadosUsuario = (novosDados: any) => {
    setDadosUsuario(novosDados);
    setModalDadosUsuarioOpen(false);
    Alert.alert('Sucesso', 'Dados salvos com sucesso!');
  };

  const gerarNumeroPedido = (): string => {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const adicionarAoCarrinho = (produto: Produto) => {
    const jaNoCarrinho = carrinho.some(item => item.id === produto.id);
    if (!jaNoCarrinho) {
      setCarrinho([...carrinho, produto]);
      setSidebarCarrinhoOpen(true);
    }
  };

  const verDetalhes = (produto: Produto) => {
    setProdutoSelecionado(produto);
    setModalDetalhesOpen(true);
  };

  const formatarPreco = (preco: number): string => {
    return preco.toFixed(2).replace('.', ',');
  };

  const ProdutoCard: React.FC<{ produto: Produto }> = ({ produto }) => {
    const jaNoCarrinho = carrinho.some(item => item.id === produto.id);
    
    return (
      <View style={[styles.produtoCard, !produto.disponivel && styles.produtoIndisponivel]}>
        {/* Imagem do Produto */}
        <View style={styles.imagemContainer}>
          <View style={styles.imagemPlaceholder}>
            <Ionicons name="snow-outline" size={40} color="#666" />
          </View>
          {produto.desconto > 0 && (
            <View style={styles.descontoTag}>
              <Text style={styles.descontoTexto}>-{produto.desconto}%</Text>
            </View>
          )}
          {!produto.disponivel && (
            <View style={styles.indisponivelOverlay}>
              <Text style={styles.indisponivelTexto}>Indisponível</Text>
            </View>
          )}
        </View>

        {/* Conteúdo do Produto */}
        <View style={styles.produtoConteudo}>
          <Text style={styles.produtoModelo} numberOfLines={2}>
            {produto.modelo}
          </Text>

          {/* Badges */}
          <View style={styles.badgesContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeTexto}>{produto.marca}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeTexto}>{produto.btu} BTU</Text>
            </View>
          </View>

          {/* Características */}
          <View style={styles.caracteristicasContainer}>
            {produto.caracteristicas.slice(0, 3).map((carac, index) => (
              <View key={index} style={styles.caracteristicaBadge}>
                <Text style={styles.caracteristicaTexto}>{carac}</Text>
              </View>
            ))}
            {produto.caracteristicas.length > 3 && (
              <View style={styles.caracteristicaBadge}>
                <Text style={styles.caracteristicaTexto}>
                  +{produto.caracteristicas.length - 3}
                </Text>
              </View>
            )}
          </View>

          {/* Informações da Loja */}
          <View style={styles.lojaContainer}>
            <View style={styles.lojaHeader}>
              <Text style={styles.lojaNome} numberOfLines={1}>
                {produto.loja.nome}
              </Text>
              <View style={styles.avaliacaoContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.avaliacaoTexto}>{produto.loja.avaliacao}</Text>
                <Text style={styles.avaliacaoCount}>({produto.loja.avaliacoes})</Text>
              </View>
            </View>
            <Text style={styles.lojaEndereco} numberOfLines={1}>
              {produto.loja.endereco}
            </Text>
          </View>

          {/* Preços */}
          <View style={styles.precoContainer}>
            {produto.precoOriginal && produto.precoOriginal > produto.preco && (
              <Text style={styles.precoOriginal}>
                De: R$ {formatarPreco(produto.precoOriginal)}
              </Text>
            )}
            <Text style={styles.precoAtual}>R$ {formatarPreco(produto.preco)}</Text>
            <Text style={styles.freteTexto}>Frete: {produto.frete}</Text>
          </View>

          {/* Botões */}
          <View style={styles.botoesContainer}>
            <TouchableOpacity
              style={[
                styles.botao,
                styles.botaoDetalhes,
                !produto.disponivel && styles.botaoDesabilitado,
              ]}
              disabled={!produto.disponivel}
              onPress={() => verDetalhesComContador(produto)}
            >
              <Text style={styles.botaoTexto}>
                {produto.disponivel ? 'Ver Detalhes' : 'Indisponível'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.botao,
                styles.botaoCarrinho,
                (!produto.disponivel || jaNoCarrinho) && styles.botaoDesabilitado,
              ]}
              disabled={!produto.disponivel || jaNoCarrinho}
              onPress={() => adicionarAoCarrinho(produto)}
            >
              <Text style={styles.botaoTexto}>
                {jaNoCarrinho ? 'No Carrinho' : 'Adicionar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
   
  return (
    <View style={styles.containerWrapper}>
      <Navbar />
      <ScrollView style={styles.container}>
        {/* Botão Voltar */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#0284c7" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

        {/* Título da Seção */}
        <View style={styles.tituloContainer}>
          <Text style={styles.titulo}>Ar Condicionados Novos</Text>
          <Text style={styles.subtitulo}>
            Encontre o ar condicionado perfeito com as melhores ofertas e garantia
          </Text>
        </View>

        {/* Loading */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0284c7" />
            <Text style={styles.loadingText}>Carregando produtos...</Text>
          </View>
        )}

        {/* Erro */}
        {error && !isLoading && (
          <View style={styles.erroContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text style={styles.erroText}>{error}</Text>
            <TouchableOpacity style={styles.botaoTentarNovamente} onPress={carregarProdutos}>
              <Text style={styles.botaoTentarNovamenteText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Grid de Produtos */}
        {!isLoading && !error && (
          <View style={styles.produtosGrid}>
            {produtosPaginados.length > 0 ? (
              produtosPaginados.map((produto) => (
                <ProdutoCard key={produto.id} produto={produto} />
              ))
            ) : (
              <View style={styles.vazioContainer}>
                <Ionicons name="bag-outline" size={48} color="#9ca3af" />
                <Text style={styles.vazioText}>Nenhum produto encontrado</Text>
              </View>
            )}
          </View>
        )}

        {/* Componente de Paginação */}
        {!isLoading && !error && produtos.length > 0 && (
          <PaginacaoProdutos
            paginaAtual={paginaAtual}
            totalPaginas={totalPaginas}
            onPaginaChange={handlePaginaChange}
            totalItens={produtos.length}
            itensPorPagina={itensPorPagina}
          />
        )}

        {/* Botão do Carrinho Flutuante */}
        {carrinho.length > 0 && (
          <TouchableOpacity
            style={styles.carrinhoFlutuante}
            onPress={() => setSidebarCarrinhoOpen(true)}
          >
            <Ionicons name="cart" size={24} color="white" />
            <View style={styles.carrinhoContador}>
              <Text style={styles.carrinhoContadorTexto}>{carrinho.length}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Modals */}
        <DetalhesModal 
          open={modalDetalhesOpen} 
          onClose={() => setModalDetalhesOpen(false)} 
          produto={produtoSelecionado} 
        />

        <CarrinhoSidebar 
          open={sidebarCarrinhoOpen} 
          onClose={() => setSidebarCarrinhoOpen(false)} 
          carrinho={carrinho} 
          onRemover={(idx) => setCarrinho(carrinho.filter((_, i) => i !== idx))}
          onFinalizar={() => { 
            setSidebarCarrinhoOpen(false); 
            setModalSandboxOpen(true); 
          }}
        />

        <SandboxPagamento 
          open={modalSandboxOpen} 
          onClose={() => setModalSandboxOpen(false)}
          onConfirm={() => { 
            const totalCarrinho = carrinho.reduce((acc, item) => acc + item.preco, 0);
            const novoPedido = {
              numero: gerarNumeroPedido(),
              total: totalCarrinho,
              itens: carrinho.length,
              data: new Date().toLocaleDateString('pt-BR'),
              produtos: carrinho.map(item => ({
                modelo: item.modelo,
                preco: item.preco
              }))
            };
            
            setPedidoConfirmado(novoPedido);
            setModalSandboxOpen(false); 
            setTelaPagamento('confirmacao');
            setCarrinho([]); // Limpar carrinho após pagamento
          }}
          totalValue={carrinho.reduce((acc, item) => acc + item.preco, 0)}
        />

        <ConfirmacaoPagamento 
          open={telaPagamento === 'confirmacao'}
          onClose={() => {
            setTelaPagamento('');
            setPedidoConfirmado(null);
          }}
          pedido={pedidoConfirmado}
        />

        <DadosUsuario 
          open={modalDadosUsuarioOpen}
          dadosUsuario={dadosUsuario}
          onSalvarDados={handleSalvarDadosUsuario}
          onVoltar={() => setModalDadosUsuarioOpen(false)}
        />
      </ScrollView>
      <Footer />
    </View>
  );
};

export default ComprarNovo;