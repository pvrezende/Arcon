import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PremiumHeroProps {
  userName: string;
}

const { width: screenWidth } = Dimensions.get('window');

const PremiumHero: React.FC<PremiumHeroProps> = ({ userName }) => {
  return (
    <View style={styles.heroSection}>
      <View style={styles.heroBackground}>
        <View style={styles.logoContainer}>
          <View style={styles.premiumLogoIcon}>
            <Ionicons name="diamond" size={32} color="#e9e9e9ff" />
          </View>
        </View>
        
        <Text style={styles.premiumHeroTitle}>{userName}</Text>
        <Text style={styles.premiumHeroSubtitle}>
          Área Premium - Acesso Exclusivo aos Melhores Serviços
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroSection: {
    backgroundColor: '#1a1a1a',
    paddingBottom: 40,
  },
  heroBackground: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  premiumLogoIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffffff',
    shadowColor: '#ffffffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  premiumHeroTitle: {
    fontSize: screenWidth < 768 ? 24 : 32,
    fontWeight: '800',
    color: '#ffffffff',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  premiumHeroSubtitle: {
    fontSize: screenWidth < 768 ? 14 : 16,
    color: '#C0C0C0',
    textAlign: 'center',
    lineHeight: screenWidth < 768 ? 20 : 24,
    fontWeight: '500',
    maxWidth: 400,
    paddingHorizontal: 20,
  },
});

export default PremiumHero;
