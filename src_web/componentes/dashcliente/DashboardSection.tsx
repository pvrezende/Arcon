import React from 'react';
import { View, StyleSheet } from 'react-native';
import HistoricoCard from '../VerPropostasCard';
import PromocaoCard from '../PromocaoCard';


interface DashboardSectionProps {
  screenWidth: number;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ screenWidth }) => {
  return (
    <View style={[
      styles.sessaoTecnico,
      screenWidth <= 430 && styles.sessaoTecnicoMobile
    ]}>
      <View style={[
        styles.tecnicoContainer,
        screenWidth <= 430 && styles.tecnicoContainerMobile
      ]}>
        
        <HistoricoCard 
          screenWidth={screenWidth} 
        />

        {/* Card Promocional */}
        <PromocaoCard screenWidth={screenWidth} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sessaoTecnico: {
    width: "100%",
    height: 280,
    backgroundColor: "#1e40af",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 0,
  },
  tecnicoContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 1200,
    height: 200,
    gap: 20,
  },
  tecnicoContainerMobile: {
    flexDirection: "column",
    alignItems: "stretch",
    height: "auto",
    gap: 15,
  },
  sessaoTecnicoMobile: {
    height: "auto",
    paddingBottom: 30,
  },
});

export default DashboardSection;