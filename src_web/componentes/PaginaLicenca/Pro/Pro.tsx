import React, { useRef, useState } from 'react';
import { Text, TouchableOpacity, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import styles from './Pro.styles';
import ModalPro from '../ModalPro';

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
    nome: 'Profissional',
    preco: 'R$ 49,99',
    descricao: [
      'Propostas todos os dias',
      'Faça seu horário fácil',
      'Aumente sua clientela',
      'Suporte prioritário 24/7',
      'Relatórios detalhados',
      'Integração com calendário',
      'Notificações personalizadas',
      'Histórico de serviços',
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
        colors={['#67b16aff', '#296829ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientContainer}
      >
      <View style={styles.iconeCirculo}>
        <Ionicons name="snow" size={28} color="#ffffffff" />
      </View>
      
      <Text style={styles.nomePlano}>{plano.nome}</Text>

      <View style={styles.descricaoContainer}>
        {plano.descricao.map((item, index) => (
          <View key={index} style={styles.descricaoItem}>
            <Ionicons name="checkmark-circle" size={22} color="#50b852ff" style={{ marginRight: 8 }} />
            <Text style={styles.descricao}>{item}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.botao} onPress={() => setModalVisible(true)}>
        <Text style={styles.textoBotao}>Selecionar Plano</Text>
      </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
    
      <ModalPro 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAssinar={() => {
          setModalVisible(false);
          console.log('Assinando plano Pro...');
        }}
      />
    </>
  );
};

export default Basico;
