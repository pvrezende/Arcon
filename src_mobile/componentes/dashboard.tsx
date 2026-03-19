// pages/Dashboard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Dimensions } from 'react-native';
import Navbar from './navbar';
import Footer from './footer';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const Dashboard: React.FC = () => {
  const handleChoice = (type: 'cliente' | 'prestador') => {
    Alert.alert(
      type === 'cliente' ? 'Você escolheu Cliente' : 'Você escolheu Prestador',
      'Aqui você pode redirecionar para a tela correspondente.'
    );
  };

  return (
    <View style={styles.container}>
      <Navbar />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Seção de apresentação */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="snow" size={32} color="#fff" />
            </View>
          
          </View>
    <Text style={styles.title}>
  Bem-vindo ao Consert
  <Text style={styles.arHighlight}>AR</Text>!
</Text>


          <Text style={styles.subtitle}>
            Conectamos quem precisa de serviços de climatização com profissionais 
            especializados em manutenção de ar-condicionado.
          </Text>
        </View>

        {/* Caixa de escolha */}
        <View style={styles.choiceContainer}>
          <TouchableOpacity
            style={[styles.choiceBox, styles.clientBox]}
            onPress={() => handleChoice('cliente')}
            activeOpacity={0.8}
          >
            <View style={[styles.gradientBackground, styles.clientGradient]} />
            <View style={styles.choiceContent}>
              <View style={styles.iconContainer}>
                <View style={[styles.iconCircle, styles.clientIconCircle]}>
                  <FontAwesome5 name="user-alt" size={24} color="#fff" />
                </View>
              </View>
              <Text style={styles.choiceText}>Sou Cliente</Text>
              <Text style={styles.choiceSubText}>Encontre profissionais qualificados para manutenção</Text>
              <View style={styles.arrowContainer}>
                <View style={styles.arrowCircle}>
                  <Ionicons name="arrow-forward" size={20} color="#0284c7" />
                </View>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.choiceBox, styles.providerBox]}
            onPress={() => handleChoice('prestador')}
            activeOpacity={0.8}
          >
            <View style={[styles.gradientBackground, styles.providerGradient]} />
            <View style={styles.choiceContent}>
              <View style={styles.iconContainer}>
                <View style={[styles.iconCircle, styles.providerIconCircle]}>
                  <FontAwesome5 name="tools" size={24} color="#fff" />
                </View>
              </View>
              <Text style={styles.choiceText}>Sou Prestador</Text>
              <Text style={styles.choiceSubText}>Ofereça seus serviços e aumente sua clientela</Text>
              <View style={styles.arrowContainer}>
                <View style={styles.arrowCircle}>
                  <Ionicons name="arrow-forward" size={20} color="#0d9488" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recursos e benefícios */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Por que escolher o ConsertAR?</Text>
          
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#E0F7FA' }]}>
                <Ionicons name="time" size={20} color="#0288d1" />
              </View>
              <Text style={styles.featureTitle}>Agilidade</Text>
              <Text style={styles.featureDescription}>Encontre ou ofereça serviços rapidamente</Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="shield-checkmark" size={20} color="#388e3c" />
              </View>
              <Text style={styles.featureTitle}>Confiabilidade</Text>
              <Text style={styles.featureDescription}>Profissionais verificados e avaliados</Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#FFF8E1' }]}>
                <Ionicons name="cash" size={20} color="#f57c00" />
              </View>
              <Text style={styles.featureTitle}>Transparência</Text>
              <Text style={styles.featureDescription}>Orçamentos claros sem surpresas</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0284c7',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  arHighlight: {
  color: '#0284c7', // azul
},

  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '90%',
  },
  choiceContainer: {
    width: '100%',
    flexDirection: width > 500 ? 'row' : 'column',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  choiceBox: {
    width: width > 500 ? '48%' : '100%',
    height: 200,
    borderRadius: 20,
    marginBottom: width > 500 ? 0 : 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.9,
  },
  clientGradient: {
    backgroundColor: '#0284c7',
    backgroundImage: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
  },
  providerGradient: {
    backgroundColor: '#0d9488',
    backgroundImage: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
  },
  choiceContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  iconContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  clientIconCircle: {
    backgroundColor: '#0369a1',
  },
  providerIconCircle: {
    backgroundColor: '#0f766e',
  },
  choiceText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  choiceSubText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  featuresSection: {
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: width > 500 ? 'row' : 'column',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: width > 500 ? '30%' : '100%',
    alignItems: 'center',
    marginBottom: width > 500 ? 0 : 20,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Dashboard;