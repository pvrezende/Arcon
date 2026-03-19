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
  tipo: 'proposta';
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  propostaId?: number;
}

interface DatabaseItem {
  id: number;
  CLIENTE: string;
  TAG: number;
  SERVICO: string;
  MARCA: string;
  CONFIRMAR: boolean;
  PROPOSTA: string;
  DECISAO: string;
  DECISAO2?: string;
  data_criacao?: string;
  user_id?: string;
  prestador_id?: string;
}

// --------------------------------------------------------------------
// FUNÇÃO DE LIMPEZA: Remove caracteres invisíveis e de controle
// --------------------------------------------------------------------
const limparCaracteresInvisiveis = (str: string): string => {
  if (!str) return '';
  // Expressão regular robusta contra caracteres de controle e Zero Width Space
  return str.replace(/[\u0000-\u001F\u007F-\u009F\u2000-\u200F\u2028-\u202F\u205F\u3000\uFEFF]/g, '').trim();
};

const SinoNotificacoes: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
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

  const formatarValor = (valor: string | number) => {
    if (!valor) return "Valor não informado";
    const valorNum = typeof valor === 'string' ? parseFloat(valor) : valor;
    return isNaN(valorNum)
      ? "Valor inválido"
      : valorNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const buscarNomePrestador = async (prestadorId: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.CHECK_PRESTADOR}/${prestadorId}`);
      if (response.ok) {
        const data = await response.json();
        // APLICA LIMPEZA NO NOME CASO VENHA SUJO DO BACKEND
        return data.cadastrado && data.data.NOME ? limparCaracteresInvisiveis(data.data.NOME) : "Prestador";
      }
      return "Prestador";
    } catch {
      return "Prestador";
    }
  };

  const buscarPropostas = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.PROPOSTAS}/${usuario.uid}`);
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      const data: DatabaseItem[] = await response.json();

      const propostasAtivas = data.filter(item =>
        item.CLIENTE && item.SERVICO && item.PROPOSTA && item.DECISAO && !item.DECISAO2
      );

      const novasNotificacoes: Notificacao[] = await Promise.all(
        propostasAtivas.map(async item => {
          const nomePrestador = item.prestador_id ? await buscarNomePrestador(item.prestador_id) : "Prestador";
          const valorFormatado = formatarValor(item.PROPOSTA);
          
          // APLICA LIMPEZA NAS STRINGS DA NOTIFICAÇÃO
          const tituloLimpo = limparCaracteresInvisiveis('Nova Proposta Recebida!');
          const mensagemLimpa = limparCaracteresInvisiveis(`${nomePrestador} enviou uma proposta de ${valorFormatado}`);

          return {
            id: item.id.toString(),
            tipo: 'proposta',
            titulo: tituloLimpo,
            mensagem: mensagemLimpa,
            data: item.data_criacao || new Date().toISOString(),
            lida: false,
            propostaId: item.id,
          };
        })
      );

      setNotificacoes(prev => {
        const existentes = new Set(prev.map(n => n.id));
        return [...novasNotificacoes.filter(n => !existentes.has(n.id)), ...prev];
      });
    } catch (error) {
      console.error('Erro ao buscar propostas:', error);
    }
  };

  // --------------------------------------------------------------------
  // USEEFFECT PARA POLLING (Busca em intervalos de tempo)
  // --------------------------------------------------------------------
  // useEffect(() => {
  //   let intervalId: NodeJS.Timeout | null = null;
  //   const POLLING_INTERVAL = 5000; // 5 segundos

  //   if (usuario) {
  //     // 1. Chamada inicial imediata
  //     buscarPropostas();

  //     // 2. Configura o intervalo de Polling
  //     intervalId = setInterval(buscarPropostas, POLLING_INTERVAL);
  //   }

  //   // 3. Limpeza: Essencial para parar o loop ao desmontar o componente
  //   return () => {
  //     if (intervalId) {
  //       clearInterval(intervalId);
  //     }
  //   };
  // }, [usuario]);
  
  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida).length;

  const toggleNotificacoes = () => {
    if (!mostrarNotificacoes) {
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    } else {
      Animated.timing(scaleAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
    setMostrarNotificacoes(!mostrarNotificacoes);
  };

  const handleNotificacaoPress = (notificacao: Notificacao) => {
    setNotificacoes(prev => prev.map(n => n.id === notificacao.id ? { ...n, lida: true } : n));
    setMostrarNotificacoes(false);

    if (navigation?.navigate && notificacao.propostaId) {
      navigation.navigate('PropostaCliente', { propostaId: notificacao.propostaId });
    }
  };

  const limparNotificacoes = () => setNotificacoes([]);

  const formatarData = (data: string) => new Date(data).toLocaleDateString("pt-BR");

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
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMostrarNotificacoes(false)}>
          <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }], opacity: scaleAnim }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notificações {notificacoesNaoLidas > 0 && `(${notificacoesNaoLidas})`}</Text>
              {notificacoes.length > 0 && (
                <TouchableOpacity onPress={limparNotificacoes}>
                  <Text style={styles.limparTexto}>Limpar</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.notificacoesList}>
              {notificacoes.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="notifications-off-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>Nenhuma notificação</Text>
                  <Text style={styles.emptySubtext}>Novas propostas aparecerão aqui</Text>
                </View>
              ) : (
                notificacoes.map(n => (
                  <TouchableOpacity
                    key={n.id}
                    style={[styles.notificacaoItem, !n.lida && styles.notificacaoNaoLida]}
                    onPress={() => handleNotificacaoPress(n)}
                  >
                    <Ionicons name="document-text" size={22} color="#0284c7" style={{ marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.notificacaoTitulo}>{n.titulo}</Text>
                      <Text style={styles.notificacaoMensagem}>{n.mensagem}</Text>
                      <Text style={styles.notificacaoData}>{formatarData(n.data)}</Text>
                    </View>
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
  sinoContainer: { width: 42, height: 42, justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: 4, right: 4, backgroundColor: '#ef4444', borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 80, paddingRight: 20 },
  modalContent: { width: 320, maxHeight: 500, backgroundColor: '#fff', borderRadius: 12, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  limparTexto: { color: '#0284c7', fontWeight: '600' },
  notificacoesList: { maxHeight: 400 },
  notificacaoItem: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  notificacaoNaoLida: { backgroundColor: '#f0f9ff' },
  notificacaoTitulo: { fontWeight: 'bold', color: '#1f2937' },
  notificacaoMensagem: { color: '#4b5563', fontSize: 13 },
  notificacaoData: { color: '#9ca3af', fontSize: 11 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#6b7280', fontSize: 16, marginTop: 8 },
  emptySubtext: { color: '#9ca3af', fontSize: 13 },
});

export default SinoNotificacoes;
