import React, { useState, useEffect } from "react";
import { View, ScrollView, Dimensions, Text } from "react-native";
import ServiceCard from "./ServiceCard";
import { styles } from "./ServiceCardsResponsiveGrid.styles";

interface ServiceCardsResponsiveGridProps {
  services: any[];
  prestadorId: string | null;
  prestadorNome?: string;
  onPropostaEnviada: (id: string | number) => void;
  onRecusarServico: (id: string | number) => void;
}

const ServiceCardsResponsiveGrid: React.FC<ServiceCardsResponsiveGridProps> = ({
  services,
  prestadorId,
  prestadorNome,
  onPropostaEnviada,
  onRecusarServico,
}) => {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Determinar número de colunas baseado no tamanho da tela
  const getColumnsPerRow = () => {
    if (screenWidth >= 768) {
      return 2; // Tablet: 2 colunas
    } else {
      return 1; // Mobile: 1 coluna
    }
  };

  const columnsPerRow = getColumnsPerRow();
  
  // Calcular largura dos cards baseado no número de colunas
  const getCardWidth = () => {
    const padding = 32; // padding total (16 de cada lado)
    const gap = 16; // gap entre cards
    const availableWidth = screenWidth - padding - (gap * (columnsPerRow - 1));
    return availableWidth / columnsPerRow;
  };

  const cardWidth = getCardWidth();

  return (
    <View style={styles.responsiveContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>
          Serviços Disponíveis ({services.length})
        </Text>
        <Text style={styles.headerSubtitle}>
          Escolha um serviço e envie sua proposta
        </Text>
      </View>
      
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.cardsGrid}>
          {services.map((item) => (
            <ServiceCard
              key={item.id.toString()}
              item={item}
              prestadorId={prestadorId}
              prestadorNome={prestadorNome}
              onPropostaEnviada={onPropostaEnviada}
              onRecusarServico={onRecusarServico}
              cardWidth={cardWidth}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default ServiceCardsResponsiveGrid;
