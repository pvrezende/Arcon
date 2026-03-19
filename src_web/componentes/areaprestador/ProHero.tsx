import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProHeroProps {
  userName: string;
}

const { width: screenWidth } = Dimensions.get('window');

const ProHero: React.FC<ProHeroProps> = ({ userName }) => {
  return (
    <View style={styles.heroSection}>
      <View style={styles.heroBackground}>
        <View style={styles.logoContainer}>
          <View style={styles.proLogoIcon}>
            <Ionicons name="snow" size={32} color="#ffffffff" />
          </View>
        </View>
        
        <Text style={styles.proHeroTitle}>{userName}</Text>
        <Text style={styles.proHeroSubtitle}>
          Área Profissional - Recursos Avançados para Crescimento
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroSection: {
    backgroundColor: '#67b16aff',
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
  proLogoIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#269459ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffffff',
    shadowColor: '#50b852ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  proHeroTitle: {
    fontSize: screenWidth < 768 ? 24 : 32,
    fontWeight: '800',
    color: '#ffffffff',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  proHeroSubtitle: {
    fontSize: screenWidth < 768 ? 14 : 16,
    color: '#ffffffff',
    textAlign: 'center',
    lineHeight: screenWidth < 768 ? 20 : 24,
    fontWeight: '500',
    maxWidth: 400,
    paddingHorizontal: 20,
  },
});

export default ProHero;
