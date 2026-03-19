import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Animated } from 'react-native';
import Basico from '../../componentes/PaginaLicenca/Basico/Basico';
import Premium from '../../componentes/PaginaLicenca/Premium/Premium';
import Pro from '../../componentes/PaginaLicenca/Pro/Pro';
import Navbar from '../../componentes/navbar';
import Footer from '../../componentes/footer';

const { width } = Dimensions.get('window');

const PaginaLicenca = () => {
  const isMobile = width < 600;
  
  // Animações para os cards
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.screenContainer}>
      <View style={styles.fullWidthContainer}> 
        <Navbar />
      </View>

      <ScrollView
        style={styles.scrollViewContent} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <Animated.View 
          style={[
            styles.heroSection,
            { 
              opacity: titleAnim,
              transform: [{ translateY: titleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0]
              })}]
            }
          ]}
        >
          <View style={styles.badgeContainer}>
            <Text style={styles.badge}>7 dias grátis</Text>
          </View>
          
          <Text style={styles.titulo}>
            Escolha o melhor plano para você
          </Text>
          
          <Text style={styles.subtitulo}>
            Conecte-se com clientes e aumente seus ganhos com nossa plataforma completa
          </Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1000+</Text>
              <Text style={styles.statLabel}>Profissionais</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>5000+</Text>
              <Text style={styles.statLabel}>Serviços</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>Satisfação</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.planosContainer, 
            isMobile && styles.planosContainerMobile,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.planoWrapper}>
            <Basico />
          </View>
          <View style={styles.planoWrapper}>
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>MAIS POPULAR</Text>
            </View>
            <Pro />
          </View>
          <View style={styles.planoWrapper}>
            <Premium />
          </View>
        </Animated.View>

        {/* Testimonials Section */}
        <Animated.View 
          style={[
            styles.testimonialsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.testimonialsTitle}>O que nossos clientes dizem</Text>
          <View style={styles.testimonialsContainer}>
            <View style={styles.testimonialCard}>
              <Text style={styles.testimonialText}>
                "Aumentei minha renda em 300% em apenas 2 meses!"
              </Text>
              <Text style={styles.testimonialAuthor}>- Maria Silva, Técnica</Text>
            </View>
            <View style={styles.testimonialCard}>
              <Text style={styles.testimonialText}>
                "Melhor plataforma para encontrar clientes!"
              </Text>
              <Text style={styles.testimonialAuthor}>- João Santos, Instalador</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.fullWidthContainer}> 
        <Footer />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  
  screenContainer: {
    flex: 1,
    backgroundColor: '#DEEAF5FF',
  },
  
  fullWidthContainer: {
    width: '100%',
  },

  scrollViewContent: {
    flex: 1,
  },
  
  scrollContent: {
    alignItems: 'center',
    padding: 20, 
  },
  
  titulo: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#000000ff',
    lineHeight: 50,
  },
  subtitulo: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
    color: '#000000ff',
    lineHeight: 24,
    maxWidth: 600,
  },
  planosContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 10,
    flexWrap: 'wrap',
  },
  planosContainerMobile: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  
  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  badgeContainer: {
    marginBottom: 20,
  },
  badge: {
    backgroundColor: '#0284c7',
    color: '#ffffffff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 400,
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0284c7',
  },
  statLabel: {
    fontSize: 14,
    color: '#000000ff',
    marginTop: 4,
  },
  
  // Planos
  planoWrapper: {
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: '50%',
    transform: [{ translateX: -60 }],
    backgroundColor: '#FF6B35',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    zIndex: 10,
  },
  popularBadgeText: {
    color: '#000000ff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  
  // Depoimentos 
  testimonialsSection: {
    marginTop: 60,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  testimonialsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#000000ff',
  },
  testimonialsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 800,
    gap: 20,
  },
  testimonialCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    flex: 1,
    marginHorizontal: 10,
  },
  testimonialText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#333',
    marginBottom: 10,
    lineHeight: 22,
  },
  testimonialAuthor: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
});

export default PaginaLicenca;