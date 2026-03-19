import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Navbar from "../../componentes/navbar";
import Footer from "../../componentes/footer";
import { StackNavigationProp } from '@react-navigation/stack';

// Use o MESMO RootStackParamList da tela de Configurações
type RootStackParamList = {
  Perfil: undefined;
  Pagamentos: undefined;
  HistoricoCliente: undefined;
  Configuracoes: undefined;
};

// Corrigindo o tipo da navegação
type HistoricoClienteNavigationProp = StackNavigationProp<RootStackParamList, 'HistoricoCliente'>;

interface HistoricoClienteProps {
  navigation: HistoricoClienteNavigationProp;
}

// Interface para os serviços
interface Servico {
  id: string;
  tipo: string;
  descricao: string;
  data: string;
  horario: string;
  tecnico: string;
  valor: number;
  status: 'concluido' | 'cancelado';
  avaliacao?: number;
}

const HistoricoCliente: React.FC<HistoricoClienteProps> = ({ navigation }) => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'concluidos' | 'cancelados'>('todos');

  // Função para voltar para a página anterior
  const goBack = (): void => {
    navigation.goBack();
  };

  // Dados mockados - substitua por dados reais do Firebase
  const servicosMock: Servico[] = [
    {
      id: '1',
      tipo: 'Manutenção Preventiva',
      descricao: 'Manutenção periódica do ar condicionado split',
      data: '15/12/2024',
      horario: '14:30',
      tecnico: 'Carlos Silva',
      valor: 150.00,
      status: 'concluido',
      avaliacao: 5
    },
    {
      id: '2',
      tipo: 'Limpeza Interna',
      descricao: 'Limpeza completa das bobinas e filtros',
      data: '02/12/2024',
      horario: '10:00',
      tecnico: 'Ana Oliveira',
      valor: 120.00,
      status: 'concluido',
      avaliacao: 4
    },
    {
      id: '3',
      tipo: 'Troca de Gás',
      descricao: 'Troca completa do gás refrigerante R22',
      data: '20/11/2024',
      horario: '16:15',
      tecnico: 'Roberto Santos',
      valor: 320.00,
      status: 'concluido',
      avaliacao: 5
    },
    {
      id: '4',
      tipo: 'Reparo Elétrico',
      descricao: 'Substituição da placa de controle',
      data: '05/11/2024',
      horario: '09:00',
      tecnico: 'Carlos Silva',
      valor: 280.00,
      status: 'concluido',
      avaliacao: 4
    },
    {
      id: '5',
      tipo: 'Manutenção Corretiva',
      descricao: 'Reparo no compressor',
      data: '18/10/2024',
      horario: '13:45',
      tecnico: 'Ana Oliveira',
      valor: 450.00,
      status: 'concluido',
      avaliacao: 5
    },
    {
      id: '6',
      tipo: 'Limpeza Externa',
      descricao: 'Limpeza da unidade condensadora',
      data: '30/09/2024',
      horario: '11:30',
      tecnico: 'Roberto Santos',
      valor: 100.00,
      status: 'cancelado'
    }
  ];

  useEffect(() => {
    // Simulando carregamento de dados
    setServicos(servicosMock);
  }, []);

  const servicosFiltrados = servicos.filter(servico => {
    if (filtro === 'todos') return true;
    if (filtro === 'concluidos') return servico.status === 'concluido';
    if (filtro === 'cancelados') return servico.status === 'cancelado';
    return true;
  });

  const getIconByTipo = (tipo: string): keyof typeof Ionicons.glyphMap => {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes('manutenção')) return 'build';
    if (tipoLower.includes('limpeza')) return 'water';
    if (tipoLower.includes('gás')) return 'flask';
    if (tipoLower.includes('elétrico') || tipoLower.includes('elétrico')) return 'flash';
    return 'settings';
  };

  const getColorByStatus = (status: string): string => {
    return status === 'concluido' ? '#10b981' : '#ef4444';
  };

  const getAvaliacaoStars = (avaliacao?: number) => {
    if (!avaliacao) return null;
    
    return (
      <View style={styles.avaliacaoContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= avaliacao ? "star" : "star-outline"}
            size={16}
            color="#f59e0b"
          />
        ))}
      </View>
    );
  };

  const handleDetalhesServico = (servico: Servico) => {
    Alert.alert(
      `Detalhes do Serviço - ${servico.tipo}`,
      `Descrição: ${servico.descricao}\n\nTécnico: ${servico.tecnico}\nData: ${servico.data} às ${servico.horario}\nValor: R$ ${servico.valor.toFixed(2)}\nStatus: ${servico.status === 'concluido' ? 'Concluído' : 'Cancelado'}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Navbar no topo */}
      <Navbar />
      
      {/* Container principal sem ScrollView no botão voltar */}
      <View style={styles.mainContainer}>
        {/* Botão Voltar simplificado - FORA do ScrollView */}
        <TouchableOpacity 
          style={styles.botaoVoltar} 
          onPress={goBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#0284c7" />
          <Text style={styles.botaoVoltarTexto}>Voltar</Text>
        </TouchableOpacity>

        <ScrollView 
          style={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>Histórico de Serviços</Text>
          
          {/* Seção de Informações */}
          <View style={styles.infoSection}>
            <Ionicons name="time-outline" size={24} color="#0284c7" />
            <Text style={styles.infoText}>
              Confira todo o histórico de serviços de ar condicionado solicitados
            </Text>
          </View>

          {/* Filtros */}
          <View style={styles.filtrosSection}>
            <Text style={styles.sectionTitle}>Filtrar por Status</Text>
            <View style={styles.filtrosContainer}>
              <TouchableOpacity 
                style={[
                  styles.filtroButton,
                  filtro === 'todos' && styles.filtroButtonActive
                ]}
                onPress={() => setFiltro('todos')}
              >
                <Text style={[
                  styles.filtroText,
                  filtro === 'todos' && styles.filtroTextActive
                ]}>
                  Todos
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.filtroButton,
                  filtro === 'concluidos' && styles.filtroButtonActive
                ]}
                onPress={() => setFiltro('concluidos')}
              >
                <Ionicons 
                  name="checkmark-circle" 
                  size={16} 
                  color={filtro === 'concluidos' ? "#fff" : "#10b981"} 
                />
                <Text style={[
                  styles.filtroText,
                  filtro === 'concluidos' && styles.filtroTextActive
                ]}>
                  Concluídos
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.filtroButton,
                  filtro === 'cancelados' && styles.filtroButtonActive
                ]}
                onPress={() => setFiltro('cancelados')}
              >
                <Ionicons 
                  name="close-circle" 
                  size={16} 
                  color={filtro === 'cancelados' ? "#fff" : "#ef4444"} 
                />
                <Text style={[
                  styles.filtroText,
                  filtro === 'cancelados' && styles.filtroTextActive
                ]}>
                  Cancelados
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Lista de Serviços */}
          <View style={styles.servicosSection}>
            <Text style={styles.sectionTitle}>
              {servicosFiltrados.length} serviço(s) encontrado(s)
            </Text>
            
            {servicosFiltrados.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="file-tray-outline" size={64} color="#cbd5e1" />
                <Text style={styles.emptyStateText}>
                  Nenhum serviço encontrado para o filtro selecionado
                </Text>
              </View>
            ) : (
              servicosFiltrados.map((servico) => (
                <TouchableOpacity 
                  key={servico.id}
                  style={styles.servicoCard}
                  onPress={() => handleDetalhesServico(servico)}
                >
                  <View style={styles.servicoHeader}>
                    <View style={styles.servicoIcon}>
                      <Ionicons 
                        name={getIconByTipo(servico.tipo)} 
                        size={20} 
                        color="#0284c7" 
                      />
                    </View>
                    <View style={styles.servicoInfo}>
                      <Text style={styles.servicoTipo}>{servico.tipo}</Text>
                      <Text style={styles.servicoDescricao} numberOfLines={1}>
                        {servico.descricao}
                      </Text>
                    </View>
                    <View style={styles.servicoStatus}>
                      <Ionicons 
                        name={servico.status === 'concluido' ? "checkmark-circle" : "close-circle"} 
                        size={16} 
                        color={getColorByStatus(servico.status)} 
                      />
                      <Text style={[
                        styles.statusText,
                        { color: getColorByStatus(servico.status) }
                      ]}>
                        {servico.status === 'concluido' ? 'Concluído' : 'Cancelado'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.servicoDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="calendar" size={14} color="#64748b" />
                      <Text style={styles.detailText}>{servico.data}</Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Ionicons name="time" size={14} color="#64748b" />
                      <Text style={styles.detailText}>{servico.horario}</Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Ionicons name="person" size={14} color="#64748b" />
                      <Text style={styles.detailText}>{servico.tecnico}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.servicoFooter}>
                    <Text style={styles.valorText}>
                      R$ {servico.valor.toFixed(2)}
                    </Text>
                    
                    {servico.avaliacao && (
                      getAvaliacaoStars(servico.avaliacao)
                    )}
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.detalhesButton}
                    onPress={() => handleDetalhesServico(servico)}
                  >
                    <Text style={styles.detalhesButtonText}>Ver Detalhes</Text>
                    <Ionicons name="chevron-forward" size={16} color="#0284c7" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Estatísticas */}
          <View style={styles.estatisticasSection}>
            <Text style={styles.sectionTitle}>Estatísticas</Text>
            <View style={styles.estatisticasContainer}>
              <View style={styles.estatisticaItem}>
                <Text style={styles.estatisticaNumero}>
                  {servicos.filter(s => s.status === 'concluido').length}
                </Text>
                <Text style={styles.estatisticaLabel}>Concluídos</Text>
              </View>
              
              <View style={styles.estatisticaItem}>
                <Text style={styles.estatisticaNumero}>
                  {servicos.filter(s => s.status === 'cancelado').length}
                </Text>
                <Text style={styles.estatisticaLabel}>Cancelados</Text>
              </View>
              
              <View style={styles.estatisticaItem}>
                <Text style={styles.estatisticaNumero}>
                  R$ {servicos.filter(s => s.status === 'concluido').reduce((sum, s) => sum + s.valor, 0).toFixed(2)}
                </Text>
                <Text style={styles.estatisticaLabel}>Total Gasto</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Footer na base */}
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC',
  },
  mainContainer: {
    flex: 1,
  },
  // Botão voltar FORA do ScrollView
  botaoVoltar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    zIndex: 10, // Garante que fique acima de outros elementos
  },
  botaoVoltarTexto: {
    marginLeft: 8,
    color: '#0284c7',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0, // Remove o padding top pois o botão já está fora
    marginBottom: 10,
  },
  title: { 
    fontSize: 28, 
    fontWeight: "800",
    color: '#0284c7',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#0369a1',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 15,
  },
  filtrosSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  filtrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filtroButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginHorizontal: 5,
  },
  filtroButtonActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  filtroText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  filtroTextActive: {
    color: '#fff',
  },
  servicosSection: {
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  servicoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  servicoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  servicoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  servicoInfo: {
    flex: 1,
  },
  servicoTipo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  servicoDescricao: {
    fontSize: 14,
    color: '#64748b',
  },
  servicoStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  servicoDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#64748b',
  },
  servicoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  valorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  avaliacaoContainer: {
    flexDirection: 'row',
  },
  detalhesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#f0f9ff',
    borderRadius: 6,
  },
  detalhesButtonText: {
    color: '#0284c7',
    fontWeight: '600',
    marginRight: 4,
  },
  estatisticasSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  estatisticasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  estatisticaItem: {
    alignItems: 'center',
    flex: 1,
  },
  estatisticaNumero: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0284c7',
    marginBottom: 4,
  },
  estatisticaLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default HistoricoCliente;