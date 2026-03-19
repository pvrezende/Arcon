import React from 'react';
import { View, Text, Image } from 'react-native';
import styles from './ServicosGarantia.styles';
import ARSImage from '../../../assets/ARS.png';

const ServicosGarantia = () => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Image source={ARSImage} style={styles.arsImage} />
      </View>
      
      <View style={styles.rightSection}>
        <View style={styles.iconContainer}>
        </View>
        
        <Text style={styles.title}>
          Serviços com garantia de até <Text style={styles.highlightText}>3 meses</Text>.
        </Text>
        
        <Text style={styles.description}>
          Instalação, higienização e manutenção do seu ar-condicionado com total segurança e confiança.
        </Text>
        
        <Text style={styles.description}>
          Aqui, você conta com um atendimento sem complicações, rápido e eficiente.
        </Text>
        
        <Text style={styles.description}>
          Cuidamos do seu conforto como se fosse o nosso!
        </Text>
      </View>
    </View>
  );
};

export default ServicosGarantia;
