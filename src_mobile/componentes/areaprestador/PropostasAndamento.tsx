import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PropostasAndamentoProps {
  onBack: () => void;
}

interface ServicoAndamento {
  id: number;
  cliente: string;
  servico: string;
  endereco: string;
  dataInicio: string;
  status: string;
  valor: string;
}

const PropostasAndamento: React.FC<PropostasAndamentoProps> = ({ onBack }) => {
  // Dados mockados de serviços em andamento
  const servicosAndamento: ServicoAndamento[] = [
    {
      id: 1,
      cliente: "João Silva",
      servico: "Instalação Split 9000 BTU",
      endereco: "Rua das Flores, 123",
      dataInicio: "15/03/2024",
      status: "Em andamento",
      valor: "R$ 350,00"
    },
    {
      id: 2,
      cliente: "Maria Santos",
      servico: "Manutenção Preventiva",
      endereco: "Av. Principal, 456",
      dataInicio: "18/03/2024",
      status: "Aguardando peças",
      valor: "R$ 180,00"
    },
    {
      id: 3,
      cliente: "Carlos Oliveira",
      servico: "Limpeza Interna",
      endereco: "Rua Central, 789",
      dataInicio: "20/03/2024",
      status: "Em andamento",
      valor: "R$ 120,00"
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0284c7" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Ionicons name="construct-outline" size={24} color="#0284c7" />
          <Text style={styles.title}>Propostas em Andamento</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{servicosAndamento.length}</Text>
        </View>
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {servicosAndamento.map((servico) => (
          <View key={servico.id} style={styles.servicoCard}>
            <View style={styles.servicoHeader}>
              <Text style={styles.servicoTitulo}>{servico.servico}</Text>
              <View style={[
                styles.statusBadge,
                servico.status === 'Em andamento' ? styles.statusAndamento : styles.statusAguardando
              ]}>
                <Text style={styles.statusText}>{servico.status}</Text>
              </View>
            </View>
            
            <View style={styles.servicoInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={16} color="#64748b" />
                <Text style={styles.infoText}>{servico.cliente}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color="#64748b" />
                <Text style={styles.infoText}>{servico.endereco}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={16} color="#64748b" />
                <Text style={styles.infoText}>Início: {servico.dataInicio}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="cash-outline" size={16} color="#64748b" />
                <Text style={styles.valorText}>{servico.valor}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginLeft: 8,
  },
  badge: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  listContainer: {
    maxHeight: 400,
  },
  servicoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0284c7',
  },
  servicoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  servicoTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusAndamento: {
    backgroundColor: '#dbeafe',
  },
  statusAguardando: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1e40af',
  },
  servicoInfo: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
  },
  valorText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default PropostasAndamento;