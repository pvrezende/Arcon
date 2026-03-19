import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

interface PromocaoCardProps {
  screenWidth: number;
}

const PromocaoCard: React.FC<PromocaoCardProps> = ({ screenWidth }) => {
  return (
    <View style={[
      styles.tecnicoCard,
      screenWidth <= 430 && styles.tecnicoCardMobile
    ]}>
      <Image 
        source={require('../assets/BannerAnuncio.png')}
        style={[
          styles.tecnicoImagemPromocional,
          screenWidth <= 430 && styles.tecnicoImagemPromocionalMobile
        ]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tecnicoCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 140,
    overflow: 'hidden',
  },
  tecnicoCardMobile: {
    width: "100%",
    minHeight: 120,
  },
  tecnicoImagemPromocional: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  tecnicoImagemPromocionalMobile: {
    borderRadius: 15,
  },
});

export default PromocaoCard;