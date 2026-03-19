import React from "react";
import { View, Text, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./EstatisticasSection.styles";

const { width } = Dimensions.get('window');

interface EstatisticasSectionProps {
  screenWidth?: number;
}

const EstatisticasSection: React.FC<EstatisticasSectionProps> = ({ screenWidth = width }) => {
  const isMobile = screenWidth < 768;

  // Dados mock 
  const estatisticas = [
    {
      id: 1,
      titulo: 'Total de Visualizações',
      valor: '1.247',
      variacao: '+12%',
      cor: '#4A90E2',
      icon: 'eye',
    },
    {
      id: 2,
      titulo: 'Anúncios Ativos',
      valor: '8',
      variacao: '+2 este mês',
      cor: '#4A90E2',
      icon: 'document-text',
    },
    {
      id: 3,
      titulo: 'Interações',
      valor: '156',
      variacao: '+28%',
      cor: '#4A90E2',
      icon: 'people',
    },
    {
      id: 4,
      titulo: 'Taxa de Conversão',
      valor: '23.5%',
      variacao: '+5.2%',
      cor: '#4A90E2',
      icon: 'trending-up',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Estatísticas de Vendas</Text>
        <Text style={styles.subtitle}>
          Acompanhe o desempenho dos seus anúncios em tempo real
        </Text>
      </View>
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      <View style={[styles.cardsGrid, isMobile && styles.cardsGridMobile]}>
        {estatisticas.map((stat) => (
          <View key={stat.id} style={[styles.card, isMobile && styles.cardMobile]}>
            <View style={[styles.iconCircle, { backgroundColor: `${stat.cor}15` }]}>
              <Ionicons name={stat.icon as any} size={24} color={stat.cor} />
            </View>
            <Text style={styles.cardTitulo}>{stat.titulo}</Text>
            <Text style={[styles.cardValor, { color: stat.cor }]}>{stat.valor}</Text>
            <View style={styles.variacaoContainer}>
              <Ionicons name="arrow-up" size={14} color="#52C9A2" />
              <Text style={styles.variacao}>{stat.variacao}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
    </View>
  );
};

export default EstatisticasSection;
