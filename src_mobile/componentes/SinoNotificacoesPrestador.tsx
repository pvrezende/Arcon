import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_CONFIG } from '../../configIp';
import { authService } from '../services/authService';

interface Notificacao {
  id: string;
  tipo: 'servico';
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  servicoId?: number;
}

interface DatabaseItem {
  id: number;
  CLIENTE: string;
  SERVICO: string;
  MARCA: string;
  BTU: string;
  data_criacao?: string;
  prestador_id?: string;
}

const limparCaracteresInvisiveis = (str: string): string => {
  if (!str) return '';
  return str.replace(/[\u0000-\u001F\u007F-\u009F\u2000-\u200F\u2028-\u202F\u205F\u3000\uFEFF]/g, '').trim();
};

// 🔥 CACHE EM MEMÓRIA PARA NOTIFICAÇÕES LIDAS
let notificacoesLidasCache: Set<string> = new Set();

const SinoNotificacoesPrestador: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadUser = async () => {
      const user = await authService.getUser();
      setUsuario(user);
    };
    loadUser();
  }, []);

  // Se não há usuário logado, não renderiza nada
  if (!usuario) {
    return null;
  }

  const buscarServicosPrestador = async () => {
    try {
      setLoading(true);
      
      // Verifica se o usuário é um prestador cadastrado
      const checkResponse = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.CHECK_PRESTADOR}/${usuario.uid}`);
      const checkResult = await checkResponse.json();

      if (!checkResult.cadastrado) {
        console.log('❌ Usuário não é prestador cadastrado');
        setNotificacoes([]);
        return;
      }

      // Busca serviços disponíveis para o prestador
      const response = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.SERVICOS_PRESTADOR}/${usuario.uid}`);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status} ao buscar serviços`);
      }
      
      const data: DatabaseItem[] = await response.json();
      console.log(`📦 Total de serviços recebidos: ${data.length}`);

      // 🔥 FILTRO SIMPLIFICADO: Apenas serviços disponíveis (sem proposta ainda)
      const servicosDisponiveis = data.filter(item => {
        const temProposta = item.prestador_id && item.prestador_id === usuario.uid;
        const camposObrigatorios = item.CLIENTE && item.SERVICO && item.MARCA && item.BTU;
        
        return !temProposta && camposObrigatorios;
      });

      console.log(`🎯 Serviços disponíveis para notificação: ${servicosDisponiveis.length}`);

      // Cria notificações apenas para serviços novos
      const novasNotificacoes: Notificacao[] = servicosDisponiveis.map(item => {
        const titulo = '🆕 Novo Serviço Disponível!';
        const mensagem = `Cliente "${item.CLIENTE}" solicitou ${item.SERVICO} para ${item.MARCA} ${item.BTU} BTU`;

        const tituloLimpo = limparCaracteresInvisiveis(titulo);
        const mensagemLimpa = limparCaracteresInvisiveis(mensagem);

        // 🔥 VERIFICA SE JÁ FOI LIDA NO CACHE
        const notificacaoId = `servico-${item.id}`;
        const jaFoiLida = notificacoesLidasCache.has(notificacaoId);

        return {
          id: notificacaoId,
          tipo: 'servico',
          titulo: tituloLimpo,
          mensagem: mensagemLimpa,
          data: item.data_criacao || new Date().toISOString(),
          lida: jaFoiLida, // 🔥 USA O ESTADO DO CACHE
          servicoId: item.id,
        };
      });

      console.log(`📨 Novas notificações de serviço: ${novasNotificacoes.length}`);
      console.log(`👀 Notificações lidas: ${novasNotificacoes.filter(n => n.lida).length}`);

      setNotificacoes(prev => {
        // Remove notificações duplicadas mantendo apenas as mais recentes
        const todasNotificacoes = [...novasNotificacoes, ...prev];
        const notificacoesUnicas = todasNotificacoes.reduce((acc, current) => {
          const existe = acc.find(item => item.servicoId === current.servicoId);
          if (!existe) {
            return [...acc, current];
          }
          // 🔥 MANTÉM O ESTADO DE "LIDA" SE JÁ EXISTIR
          if (existe && existe.lida) {
            return acc.map(item => 
              item.servicoId === current.servicoId ? { ...item, lida: true } : item
            );
          }
          return acc;
        }, [] as Notificacao[]);

        // Ordena por data (mais recentes primeiro) e limita a 20
        return notificacoesUnicas
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
          .slice(0, 20);
      });

    } catch (error) {
      console.error('❌ Erro ao buscar serviços do prestador:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    const POLLING_INTERVAL = 45000; // 🔥 AUMENTADO para 45 segundos

    if (usuario) {
      // Busca inicial
      buscarServicosPrestador();
      
      // Configura polling com intervalo maior
      intervalId = setInterval(buscarServicosPrestador, POLLING_INTERVAL);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [usuario]);

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida).length;

  const toggleNotificacoes = () => {
    if (!mostrarNotificacoes) {
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
      // Atualiza notificações quando abre o modal
      buscarServicosPrestador();
    } else {
      Animated.timing(scaleAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
    setMostrarNotificacoes(!mostrarNotificacoes);
  };

  const handleNotificacaoPress = (notificacao: Notificacao) => {
    // 🔥 ADICIONA AO CACHE DE NOTIFICAÇÕES LIDAS
    notificacoesLidasCache.add(notificacao.id);
    
    // 🔥 ATUALIZA O ESTADO LOCAL
    setNotificacoes(prev => prev.map(n => 
      n.id === notificacao.id ? { ...n, lida: true } : n
    ));
    
    setMostrarNotificacoes(false);

    // Navega para a área do prestador para ver os serviços
    if (navigation?.navigate) {
      navigation.navigate('AreaPrestador');
    }
  };

  const limparNotificacoes = () => {
    // 🔥 LIMPA O CACHE TAMBÉM
    notificacoesLidasCache.clear();
    setNotificacoes([]);
  };

  const marcarTodasComoLidas = () => {
    // 🔥 MARCA TODAS COMO LIDAS NO CACHE
    notificacoes.forEach(n => {
      notificacoesLidasCache.add(n.id);
    });
    
    // 🔥 ATUALIZA O ESTADO LOCAL
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
  };

  const formatarData = (data: string) => {
    try {
      const dataObj = new Date(data);
      const agora = new Date();
      const diffMs = agora.getTime() - dataObj.getTime();
      const diffMinutos = Math.floor(diffMs / (1000 * 60));
      const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMinutos < 1) {
        return 'Agora';
      } else if (diffMinutos < 60) {
        return `Há ${diffMinutos} min`;
      } else if (diffHoras < 24) {
        return `Há ${diffHoras} h`;
      } else if (diffDias === 1) {
        return 'Ontem';
      } else if (diffDias < 7) {
        return `Há ${diffDias} dias`;
      } else {
        return dataObj.toLocaleDateString("pt-BR");
      }
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.sinoContainer} onPress={toggleNotificacoes} activeOpacity={0.7}>
        <Ionicons name="notifications-outline" size={28} color="#fff" />
        {notificacoesNaoLidas > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notificacoesNaoLidas > 9 ? '9+' : notificacoesNaoLidas}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={mostrarNotificacoes} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setMostrarNotificacoes(false)}
        >
          <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }], opacity: scaleAnim }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Serviços {notificacoesNaoLidas > 0 && `(${notificacoesNaoLidas})`}
              </Text>
              <View style={styles.headerActions}>
                {notificacoes.length > 0 && notificacoesNaoLidas > 0 && (
                  <TouchableOpacity onPress={marcarTodasComoLidas} style={styles.actionButton}>
                    <Text style={styles.limparTexto}>Marcar como lidas</Text>
                  </TouchableOpacity>
                )}
                {notificacoes.length > 0 && (
                  <TouchableOpacity onPress={limparNotificacoes} style={styles.actionButton}>
                    <Text style={styles.limparTexto}>Limpar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <ScrollView style={styles.notificacoesList}>
              {loading ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Carregando serviços...</Text>
                </View>
              ) : notificacoes.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="construct-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>Nenhum serviço novo</Text>
                  <Text style={styles.emptySubtext}>
                    Novos serviços aparecerão aqui
                  </Text>
                </View>
              ) : (
                notificacoes.map(n => (
                  <TouchableOpacity
                    key={n.id}
                    style={[styles.notificacaoItem, !n.lida && styles.notificacaoNaoLida]}
                    onPress={() => handleNotificacaoPress(n)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name="construct" 
                      size={22} 
                      color={n.lida ? "#94a3b8" : "#0284c7"} 
                      style={{ marginRight: 10 }} 
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[
                        styles.notificacaoTitulo,
                        n.lida && styles.notificacaoLida
                      ]}>
                        {n.titulo}
                      </Text>
                      <Text style={styles.notificacaoMensagem}>{n.mensagem}</Text>
                      <Text style={styles.notificacaoData}>{formatarData(n.data)}</Text>
                    </View>
                    {!n.lida && <View style={styles.pontoNaoLido} />}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'relative' },
  sinoContainer: { 
    width: 42, 
    height: 42, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  badge: { 
    position: 'absolute', 
    top: 4, 
    right: 4, 
    backgroundColor: '#ef4444', 
    borderRadius: 8, 
    minWidth: 16, 
    height: 16, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  badgeText: { 
    color: '#fff', 
    fontSize: 10, 
    fontWeight: 'bold' 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.3)', 
    justifyContent: 'flex-start', 
    alignItems: 'flex-end', 
    paddingTop: 80, 
    paddingRight: 20 
  },
  modalContent: { 
    width: 350, 
    maxHeight: 500, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#e5e7eb' 
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 8,
  },
  modalTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#111827' 
  },
  limparTexto: { 
    color: '#0284c7', 
    fontWeight: '600',
    fontSize: 12,
  },
  notificacoesList: { 
    maxHeight: 400 
  },
  notificacaoItem: { 
    flexDirection: 'row', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f3f4f6',
    alignItems: 'flex-start',
    position: 'relative',
  },
  notificacaoNaoLida: { 
    backgroundColor: '#f0f9ff' 
  },
  notificacaoTitulo: { 
    fontWeight: 'bold', 
    color: '#1f2937',
    fontSize: 14,
    marginBottom: 4,
  },
  notificacaoLida: {
    color: '#6b7280',
    fontWeight: 'normal',
  },
  notificacaoMensagem: { 
    color: '#4b5563', 
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  notificacaoData: { 
    color: '#9ca3af', 
    fontSize: 11 
  },
  pontoNaoLido: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0284c7',
    position: 'absolute',
    top: 16,
    right: 12,
  },
  emptyState: { 
    padding: 40, 
    alignItems: 'center' 
  },
  emptyText: { 
    color: '#6b7280', 
    fontSize: 16, 
    marginTop: 8,
    fontWeight: '500',
  },
  emptySubtext: { 
    color: '#9ca3af', 
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default SinoNotificacoesPrestador;
