import React from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';
import styles from './NossasVantagens.styles';

const { width: screenWidth } = Dimensions.get('window');

const NossasVantagens = () => {
  const { elementRef, fadeAnim, slideAnim, onLayout } = useScrollAnimation({
    threshold: 0.3,
    duration: 800,
    delay: 200
  });

  const vantagens = [
    {
      title: 'Vamos até você',
      description: 'Suporte completo para instalações,\nlimpezas, higienizações e manutenções.'
    },
    {
      title: 'Limpeza/Manutenção',
      description: 'Suporte para funcionamento do equipamento\ne prolongamento da vida útil.'
    },
    {
      title: 'Garantia',
      description: 'Instalação e manutenção com garantia\nde até 3 meses para sua tranquilidade.'
    },
    {
      title: 'Pagamento fácil',
      description: 'Pagamento parcelado em até 10x\nsem juros no cartão de crédito.'
    }
  ];

  return (
    <Animated.View 
      ref={elementRef}
      onLayout={onLayout}
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Text style={styles.title}>Nossas Vantagens</Text>
      
      <View style={styles.vantagensGrid}>
        {vantagens.map((vantagem, index) => (
          <Animated.View 
            key={index} 
            style={[
              styles.vantagemCard,
              {
                opacity: fadeAnim,
                transform: [
                  { 
                    translateY: slideAnim
                  }
                ]
              }
            ]}
          >
            <View style={styles.iconContainer}>
              <Ionicons 
                name="snow" 
                size={40} 
                color="#FFFFFF" 
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.vantagemTitle}>{vantagem.title}</Text>
              <Text style={styles.vantagemDescription}>{vantagem.description}</Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
};

export default NossasVantagens;
