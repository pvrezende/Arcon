import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AgendamentosProps {
  onBack: () => void;
}

interface Agendamento {
  id: number;
  cliente: string;
  servico: string;
  endereco: string;
  data: string;
  hora: string;
  status: string;
}

const Agendamentos: React.FC<AgendamentosProps> = ({ onBack }) => {
  // Dados mockados de agendamentos
  const agendamentos: Agendamento[] = [
    {
      id: 1,
      cliente: "Ana Costa",
      servico: "Instalação Inverter 12000 BTU",
      endereco: "Rua das Palmeiras, 234",
      data: "25/03/2024",
      hora: "09:00",
      status: "Confirmado"
    },
    {
      id: 2,
      cliente: "Pedro Almeida",
      servico: "Manutenção Corretiva",
      endereco: "Av. Brasil, 567",
      data: "26/03/2024",
      hora: "14:30",
      status: "Confirmado"
    },
    {
      id: 3,
      cliente: "Fernanda Lima",
      servico: "Instalação Split 7500 BTU",
      endereco: "Rua Central, 890",
      data: "28/03/2024",
      hora: "10:00",
      status: "Pendente"
    },
    {
      id: 4,
      cliente: "Roberto Souza",
      servico: "Limpeza Completa",
      endereco: "Alameda Santos, 123",
      data: "29/03/2024",
      hora: "15:00",
      status: "Confirmado"
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#dc2626" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Ionicons name="calendar-outline" size={24} color="#dc2626" />
          <Text style={styles.title}>Agendamentos</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{agendamentos.length}</Text>
        </View>
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {agendamentos.map((agendamento) => (
          <View key={agendamento.id} style={styles.agendamentoCard}>
            <View style={styles.dataHoraContainer}>
              <View style={styles.dataBox}>
                <Text style={styles.dia}>{agendamento.data.split('/')[0]}</Text>
                <Text style={styles.mes}>MAR</Text>
              </View>
              <View style={styles.horaContainer}>
                <Ionicons name="time-outline" size={16} color="#64748b" />
                <Text style={styles.hora}>{agendamento.hora}</Text>
              </View>
            </View>

            <View style={styles.detalhesContainer}>
              <Text style={styles.servicoTitulo}>{agendamento.servico}</Text>
              
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={14} color="#64748b" />
                <Text style={styles.infoText}>{agendamento.cliente}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={14} color="#64748b" />
                <Text style={styles.infoText}>{agendamento.endereco}</Text>
              </View>
              
              <View style={[
                styles.statusBadge,
                agendamento.status === 'Confirmado' ? styles.statusConfirmado : styles.statusPendente
              ]}>
                <Text style={styles.statusText}>{agendamento.status}</Text>
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
    backgroundColor: '#dc2626',
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
  agendamentoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  dataHoraContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  dataBox: {
    backgroundColor: '#dc2626',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 50,
  },
  dia: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  mes: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  horaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  hora: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
    fontWeight: '500',
  },
  detalhesContainer: {
    flex: 1,
  },
  servicoTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  statusConfirmado: {
    backgroundColor: '#d1fae5',
  },
  statusPendente: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#065f46',
  },
});

export default Agendamentos;