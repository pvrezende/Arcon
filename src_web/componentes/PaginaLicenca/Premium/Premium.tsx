import React, { useRef, useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import styles from './Premium.styles';
import ModalPremium from '../ModalPremium';

interface PlanoProps {
  nome: string;
  preco: string;
  descricao: string[];
  possuiAnuncios: boolean;
}

const Premium: React.FC = () => {
  const navigation = useNavigation();
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
    nome: 'Premium',
    preco: 'R$ 69,99',
    descricao: [
      'Seja o primeiro a ver as propostas',
      'Agende sua visita via chat',
      'Pagamento sem burocracia',
      'Suporte prioritário 24/7',
      'Perfil premium destacado',
      'Relatórios avançados',
      'Integração com WhatsApp',
      'Histórico de serviços',
    ],
    possuiAnuncios: true,
  };

  // brilho animado no diamante
  const brilho = useRef(new Animated.Value(0.5)).current;

  // estado e animação do diamante girando dentro do card
  const [carregando, setCarregando] = useState(false);
  const rotacaoY = useRef(new Animated.Value(0)).current;

  // animação de brilho no diamante
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(brilho, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(brilho, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [brilho]);

  const handleAssinar = () => {
    setCarregando(true);

    rotacaoY.setValue(0);
    Animated.loop(
      Animated.timing(rotacaoY, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();

    // redirecionamento
    setTimeout(() => {
      setCarregando(false);
      console.log('Redirecionando para a página de pagamento...');
      // navigation.navigate('PaginaPagamento');
    }, 2000);
  };

  // rotaciona de 0 a 360 graus no eixo Y
  const rotacaoInterpolate = rotacaoY.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
        colors={['#201e1eff', '#000000ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientContainer}
      >
      <Animated.View style={[styles.iconeCirculo, { opacity: brilho }]}>
        <Ionicons name="diamond" size={28} color="#ffffffff" />
      </Animated.View>
      
      <Text style={styles.nomePlano}>{plano.nome}</Text>

      <View style={styles.descricaoContainer}>
        {plano.descricao.map((item, index) => (
          <View key={index} style={styles.descricaoItem}>
            <Ionicons name="checkmark-circle" size={22} color="#ffffffff" style={{ marginRight: 8 }} />
            <Text style={styles.descricao}>{item}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.botao} onPress={() => setModalVisible(true)}>
        <Text style={styles.textoBotao}>Selecionar Plano</Text>
      </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
    
      <ModalPremium 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAssinar={() => {
          setModalVisible(false);
          console.log('Assinando plano Premium...');
        }}
        navigation={navigation}
      />
    </>
  );
};

export default Premium;
