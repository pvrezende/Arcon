import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ServicosConcluidosProps {
  onBack: () => void;
}

interface ServicoConcluido {
  id: number;
  cliente: string;
  servico: string;
  endereco: string;
  dataConclusao: string;
  valor: string;
  avaliacao: number;
}

const ServicosConcluidos: React.FC<ServicosConcluidosProps> = ({ onBack }) => {
  // Dados mockados de serviços concluídos
  const servicosConcluidos: ServicoConcluido[] = [
    {
      id: 1,
      cliente: "João Silva",
      servico: "Instalação Split 9000 BTU",
      endereco: "Rua das Flores, 123",
      dataConclusao: "10/03/2024",
      valor: "R$ 350,00",
      avaliacao: 5
    },
    {
      id: 2,
      cliente: "Maria Santos",
      servico: "Manutenção Preventiva",
      endereco: "Av. Principal, 456",
      dataConclusao: "08/03/2024",
      valor: "R$ 180,00",
      avaliacao: 4
    },
    {
      id: 3,
      cliente: "Carlos Oliveira",
      servico: "Limpeza Interna",
      endereco: "Rua Central, 789",
      dataConclusao: "05/03/2024",
      valor: "R$ 120,00",
      avaliacao: 5
    },
    {
      id: 4,
      cliente: "Ana Costa",
      servico: "Reparo no Compressor",
      endereco: "Rua das Palmeiras, 234",
      dataConclusao: "01/03/2024",
      valor: "R$ 420,00",
      avaliacao: 4
    },
    {
      id: 5,
      cliente: "Roberto Alves",
      servico: "Instalação Inverter 18000 BTU",
      endereco: "Av. Paulista, 1000",
      dataConclusao: "28/02/2024",
      valor: "R$ 580,00",
      avaliacao: 5
    },
    {
      id: 6,
      cliente: "Fernanda Lima",
      servico: "Manutenção Corretiva",
      endereco: "Rua Augusta, 500",
      dataConclusao: "25/02/2024",
      valor: "R$ 320,00",
      avaliacao: 4
    }
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={14}
          color={i <= rating ? "#f59e0b" : "#cbd5e1"}
        />
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#059669" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Ionicons name="checkmark-done-outline" size={24} color="#059669" />
          <Text style={styles.title}>Serviços Concluídos</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{servicosConcluidos.length}</Text>
        </View>
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {servicosConcluidos.map((servico) => (
          <View key={servico.id} style={styles.servicoCard}>
            <View style={styles.servicoHeader}>
              <Text style={styles.servicoTitulo}>{servico.servico}</Text>
              <View style={styles.avaliacaoContainer}>
                {renderStars(servico.avaliacao)}
              </View>
            </View>
            
            <View style={styles.servicoInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={14} color="#64748b" />
                <Text style={styles.infoText}>{servico.cliente}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={14} color="#64748b" />
                <Text style={styles.infoText}>{servico.endereco}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={14} color="#64748b" />
                <Text style={styles.infoText}>Concluído em: {servico.dataConclusao}</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.valorText}>{servico.valor}</Text>
              <View style={styles.statusConcluido}>
                <Ionicons name="checkmark" size={12} color="#ffffff" />
                <Text style={styles.statusText}>Concluído</Text>
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
    backgroundColor: '#059669',
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
    borderLeftColor: '#059669',
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
  avaliacaoContainer: {
    flexDirection: 'row',
  },
  servicoInfo: {
    gap: 6,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  valorText: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '700',
  },
  statusConcluido: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default ServicosConcluidos;