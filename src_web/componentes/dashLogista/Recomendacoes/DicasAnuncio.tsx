import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './DicasAnuncio.styles';

const { width: screenWidth } = Dimensions.get('window');

const DicasAnuncio: React.FC = () => {
  const dicas = [
    {
      id: 1,
      icon: 'camera' as const,
      titulo: 'Fotos de Qualidade',
      descricao: 'Use fotos de alta qualidade e boa iluminação para destacar seus produtos e atrair mais clientes.',
      cor: '#3b82f6',
    },
    {
      id: 2,
      icon: 'create' as const,
      titulo: 'Títulos Claros',
      descricao: 'Crie títulos claros e objetivos, com palavras-chave que o cliente realmente busca no dia a dia.',
      cor: '#10b981',
    },
    {
      id: 3,
      icon: 'document-text' as const,
      titulo: 'Descrições Detalhadas',
      descricao: 'Adicione descrições completas e informe todas as características importantes do seu produto.',
      cor: '#f59e0b',
    },
    {
      id: 4,
      icon: 'checkmark-circle' as const,
      titulo: 'Atualização Constante',
      descricao: 'Atualize seus anúncios regularmente e responda rapidamente aos interessados para melhor conversão.',
      cor: '#ef4444',
    },
  ];

  const isMobile = screenWidth < 768;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Dicas para Anunciar Melhor</Text>
        <Text style={styles.subtitulo}>
          Aprenda as melhores práticas para destacar seus produtos
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        {dicas.map((dica, index) => (
          <View
            key={dica.id}
            style={[
              styles.card,
              isMobile ? styles.cardMobile : styles.cardDesktop,
            ]}
          >
          
            <View style={[styles.iconContainer, { backgroundColor: `${dica.cor}15` }]}>
              <Ionicons name={dica.icon} size={40} color={dica.cor} />
            </View>

           
            <View style={styles.cardContent}>
              <Text style={styles.cardTitulo}>{dica.titulo}</Text>
              <Text style={styles.cardDescricao}>{dica.descricao}</Text>
            </View>

           
            <View style={[styles.decorativeLine, { backgroundColor: dica.cor }]} />
          </View>
        ))}
      </View>
    </View>
  );
};

export default DicasAnuncio;
