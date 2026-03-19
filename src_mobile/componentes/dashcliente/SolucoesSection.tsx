import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SolucoesSectionProps {
  screenWidth: number;
}

const SolucoesSection: React.FC<SolucoesSectionProps> = ({ screenWidth }) => {
  const solucoes = [
    {
      icon: 'snow',
      titulo: 'Ar Condicionado Novos',
      descricao: 'Venda de equipamentos novos com garantia e qualidade'
    },
    {
      icon: 'construct',
      titulo: 'Manutenção',
      descricao: 'Serviços preventivos e corretivos para seu equipamento'
    },
    {
      icon: 'refresh',
      titulo: 'Ar Condicionado Usados',
      descricao: 'Equipamentos usados revisados e com garantia'
    },
    {
      icon: 'headset',
      titulo: 'Suporte 24h',
      descricao: 'Atendimento especializado sempre disponível'
    }
  ];

  return (
    <View style={[
      styles.sessaoSolucoes,
      screenWidth <= 450 && styles.sessaoSolucoesMobile
    ]}>
      <View style={[
        styles.solucoesContainer,
        screenWidth <= 450 && styles.solucoesContainerMobile
      ]}>
        <Text style={[
          styles.solucoesTitulo,
          screenWidth <= 450 && styles.solucoesTituloMobile
        ]}>
          Nossas Soluções
        </Text>
        
        <View style={[
          styles.solucoesGrid,
          screenWidth <= 450 && styles.solucoesGridMobile
        ]}>
          {solucoes.map((solucao, index) => (
            <View key={index} style={[
              styles.solucaoCard,
              screenWidth <= 450 && styles.solucaoCardMobile
            ]}>
              <Ionicons name={solucao.icon as any} size={25} color="#0284c7" />
              <Text style={[
                styles.solucaoTitulo,
                screenWidth <= 450 && styles.solucaoTituloMobile
              ]}>{solucao.titulo}</Text>
              <Text style={[
                styles.solucaoDescricao,
                screenWidth <= 450 && styles.solucaoDescricaoMobile
              ]}>{solucao.descricao}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sessaoSolucoes: {
    width: "100%",
    backgroundColor: "#DEEAF5FF",
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  sessaoSolucoesMobile: {
    paddingVertical: 40,
    minHeight: 400,
    marginTop: 20,
  },
  solucoesContainer: {
    width: "100%",
    maxWidth: 1200,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 0,
  },
  solucoesContainerMobile: {
    paddingHorizontal: 10,
  },
  solucoesTitulo: {
    fontSize: 35,
    fontWeight: "700",
    color: "#0284c7",
    marginBottom: 25,
    textAlign: "center",
  },
  solucoesTituloMobile: {
    fontSize: 28,
    marginBottom: 25,
  },
  solucoesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
    width: "100%",
    paddingHorizontal: 20,
  },
  solucoesGridMobile: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    paddingHorizontal: 20,
  },
  solucaoCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    width: 200,         // largura fixa
    aspectRatio: 1,     // deixa quadrado
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    margin: 10,
  },
  solucaoCardMobile: {
    width: "45%", // 45% para caber 2 por linha com gap
    aspectRatio: 1,
    padding: 12,
    margin: 0, // Remove margin para usar apenas gap
  },
  solucaoTitulo: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0284c7",
    marginTop: 10,
    marginBottom: 8,
    textAlign: "center",
  },
  solucaoTituloMobile: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 6,
  },
  solucaoDescricao: {
    fontSize: 18,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
  },
  solucaoDescricaoMobile: {
    fontSize: 8,
    lineHeight: 16,
  },
});

export default SolucoesSection;
