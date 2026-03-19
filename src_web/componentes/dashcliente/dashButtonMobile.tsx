import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, Image, ImageSourcePropType } from 'react-native';

interface DashButtonMobileProps {
  icon?: React.ReactNode;  
  iconImage?: ImageSourcePropType; // Para aceitar imagens como ícones
  titulo?: string;
  subtitulo?: string;
  onBotaoPress?: () => void;
  style?: ViewStyle; // <- receber estilo externo
}

const DashButtonMobile: React.FC<DashButtonMobileProps> = ({ 
  icon, 
  iconImage, 
  titulo, 
  subtitulo, 
  onBotaoPress, 
  style 
}) => {
  return (
    <View style={[styles.cardContainer, style]}>
      <TouchableOpacity 
        style={styles.cardContent}
        onPress={onBotaoPress}
        activeOpacity={0.9}
      >
        {/* Ícone no topo */}
        {(icon || iconImage) && (
          <View style={styles.iconWrapper}>
            {iconImage ? (
              <Image 
                source={iconImage} 
                style={styles.iconImage} 
                resizeMode="contain"
              />
            ) : (
              icon
            )}
          </View>
        )}
        
        {/* Título no meio */}
        <View style={styles.textContainer}>
          <Text style={styles.titulo}>{titulo || "TÍTULO"}</Text>
        </View>
        
        {/* Subtítulo embaixo */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitulo}>{subtitulo || "SUBTÍTULO"}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#0284c7",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    aspectRatio: 1, // Quadrado
    minWidth: 150,
    maxWidth: 170,
    flex: 1,
    
  },
  cardContent: {
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    flex: 1,
    width: "100%",
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minHeight: 30,
  },
  iconImage: {
    width: 24,
    height: 24,
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 2,
  },
  titulo: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
    flexWrap: "wrap",
    lineHeight: 14,
    marginBottom: 2,
  },
  subtitleContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 0.8,
  },
  subtitulo: {
    fontSize: 10,
    color: "#E5E7EB",
    fontWeight: "600",
    textAlign: "center",
    flexWrap: "wrap",
    lineHeight: 12,
  },
});

export default DashButtonMobile;
