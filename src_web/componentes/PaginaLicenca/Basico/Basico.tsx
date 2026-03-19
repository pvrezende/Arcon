import React, { useRef, useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import styles from './Basico.styles';
import ModalBasico from '../ModalBasico';

interface PlanoProps {
  nome: string;
  preco: string;
  descricao: string[];
  possuiAnuncios: boolean;
}

const Basico: React.FC = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [modalVisible, setModalVisible] = useState(false);

  const handleMouseEnter = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.05,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handleMouseLeave = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const plano: PlanoProps = {
    nome: 'Básico',
    preco: 'R$ 29,99',
    descricao: [
      'com anúncios',
      'até 10 propostas por dia',
      'Encontre clientes fácil',
      'Suporte básico por email',
      'Perfil profissional simples',
      'Histórico de serviços básico',
      'Notificações por email',
      'Acesso à plataforma web',
    ],
    possuiAnuncios: true,
  };

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }]
          }
        ]}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <LinearGradient
          colors={['#0752dbff', '#2818b8ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientContainer}
        >
        <View style={styles.iconeCirculo}>
          <Ionicons name="snow" size={28} color="#dde9ffff" />
        </View>
        
        <Text style={styles.nomePlano}>{plano.nome}</Text>

        <View style={styles.descricaoContainer}>
          {plano.descricao.map((item, index) => (
            <View key={index} style={styles.descricaoItem}>
              <Ionicons name="checkmark-circle" size={22} color="#3451f5ff" style={{ marginRight: 8 }} />
              <Text style={styles.descricao}>{item}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.botao} onPress={() => setModalVisible(true)}>
          <Text style={styles.textoBotao}>Selecionar Plano</Text>
        </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
      
      <ModalBasico 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAssinar={() => {
          setModalVisible(false);
          console.log('Assinando plano Básico...');
        }}
      />
    </>
  );
};

export default Basico;
