// notificacoes/Sino.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated, Vibration } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface Notificacao {
  id: string;
  tipo: 'proposta' | 'servico' | 'mensagem' | 'sistema';
  titulo: string;
  mensagem: string;
  lida: boolean;
  data: Date;
  userId: string;
  link?: string;
}

const Sino = () => {
  const navigation = useNavigation();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
  const [animacao] = useState(new Animated.Value(1));

  const notificacoesNaoLidas = notificacoes.filter(notif => !notif.lida);

  useEffect(() => {
    if (notificacoesNaoLidas.length > 0) {
      const animarSino = () => {
        Animated.sequence([
          Animated.timing(animacao, { toValue: 1.2, duration: 200, useNativeDriver: true }),
          Animated.timing(animacao, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start(() => setTimeout(animarSino, 2000));
      };
      animarSino();
    }
  }, [notificacoesNaoLidas.length]);

  useEffect(() => {
    // TODO: Implementar busca de notificações via API backend
    // Por enquanto, o componente não terá notificações
  }, []);


  const toggleNotificacoes = () => setMostrarNotificacoes(!mostrarNotificacoes);

  const marcarComoLida = async (notificacaoId: string) => {
    console.log('Marcar como lida:', notificacaoId);
    // Aqui você atualizaria no Firestore, ex:
    // await updateDoc(doc(db, 'notificacoes', notificacaoId), { lida: true });
  };

  const handleNotificacaoPress = (notificacao: Notificacao) => {
    marcarComoLida(notificacao.id);
    if (notificacao.tipo === 'proposta') navigation.navigate('PropostaCliente' as never);
    if (notificacao.tipo === 'servico') navigation.navigate('ServicoCliente' as never);
    if (notificacao.tipo === 'mensagem') navigation.navigate('chatInterativo' as never);
    setMostrarNotificacoes(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.sinoContainer} onPress={toggleNotificacoes}>
        <Animated.Text style={[styles.sino, { transform: [{ scale: animacao }] }]}>🔔</Animated.Text>
        {notificacoesNaoLidas.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notificacoesNaoLidas.length > 9 ? '9+' : notificacoesNaoLidas.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      {mostrarNotificacoes && (
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notificações</Text>
            {notificacoes.length > 0 && (
              <TouchableOpacity onPress={() => console.log('Limpar todas')}>
                <Text style={styles.limparTexto}>Limpar</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={{ maxHeight: 400 }}>
            {notificacoes.length === 0 ? <Text style={{ padding: 20 }}>Nenhuma notificação</Text> :
              notificacoes.slice(0, 10).map((n) => (
                <TouchableOpacity key={n.id} style={[styles.notificacaoItem, !n.lida && { backgroundColor: '#F0F9FF' }]} onPress={() => handleNotificacaoPress(n)}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '600' }}>{n.titulo}</Text>
                    <Text numberOfLines={2}>{n.mensagem}</Text>
                    <Text style={{ fontSize: 12 }}>{n.data.toLocaleDateString('pt-BR')}</Text>
                  </View>
                  {!n.lida && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6', marginLeft: 8, marginTop: 4 }} />}
                </TouchableOpacity>
              ))
            }
          </View>
        </View>
      )}

      {mostrarNotificacoes && <TouchableOpacity style={styles.overlay} onPress={() => setMostrarNotificacoes(false)} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'relative' },
  sinoContainer: { padding: 8, position: 'relative' },
  sino: { fontSize: 24 },
  badge: { position: 'absolute', top: 4, right: 4, backgroundColor: '#EF4444', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  modal: { position: 'absolute', top: 50, right: 0, width: 320, backgroundColor: '#fff', borderRadius: 12, zIndex: 1000 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  limparTexto: { color: '#3B82F6', fontWeight: '600' },
  notificacaoItem: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 },
});

export default Sino;
