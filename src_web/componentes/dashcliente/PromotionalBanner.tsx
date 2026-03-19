import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PromotionalBannerProps {
  screenWidth: number;
}

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({ screenWidth }) => {
  return (
    <View style={styles.faixaPromocional}>
      <View style={[
        styles.faixaContainer,
        screenWidth <= 430 && styles.faixaContainerMobile
      ]}>
        <Text style={[
          styles.faixaTexto,
          screenWidth <= 430 && styles.faixaTextoMobile
        ]}>
          Transforme sua experiência com ar-condicionado! 
          Tenha conforto, economia e praticidade em um só lugar. 
          Sua satisfação é nossa prioridade!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  faixaPromocional: {
    width: "100%",
    backgroundColor: "#1e40af",
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  faixaContainer: {
    width: "100%",
    maxWidth: 1200,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  faixaContainerMobile: {
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  faixaTexto: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 28,
  },
  faixaTextoMobile: {
    fontSize: 12,
    lineHeight: 24,
  },
});

export default PromotionalBanner;
