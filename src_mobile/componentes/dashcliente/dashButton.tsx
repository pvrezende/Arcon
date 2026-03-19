import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, Dimensions, Image, ImageSourcePropType } from 'react-native';

interface DashCardProps {
  icon?: React.ReactNode;  
  iconImage?: ImageSourcePropType; // Para aceitar imagens como ícones
  titulo?: string;
  subtitulo?: string;
  onBotaoPress?: () => void;
  style?: ViewStyle; // <- receber estilo externo
}

const DashCard: React.FC<DashCardProps> = ({ icon, iconImage, titulo, subtitulo, onBotaoPress, style }) => {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const onChange = ({ window }: any) => setScreenWidth(window.width);
    const subscription = Dimensions.addEventListener("change", onChange);
    return () => subscription?.remove?.();
  }, []);

  const isSmallScreen = screenWidth <= 430;

  return (
    <View 
      style={[
        styles.cardContainer, 
        isSmallScreen && styles.cardContainerSmall,
        isHovered && styles.cardContainerHover,
        style
      ]}
      // @ts-ignore - React Native Web mouse events
      onMouseEnter={() => setIsHovered(true)}
      // @ts-ignore - React Native Web mouse events
      onMouseLeave={() => setIsHovered(false)}
    >
      <TouchableOpacity 
        style={[
          styles.cardContent,
          isSmallScreen && styles.cardContentSmall
        ]}
        onPress={onBotaoPress}
        activeOpacity={0.9}
      >
        <View style={styles.horizontalLayout}>
          {/* Ícone do lado esquerdo */}
          {(icon || iconImage) && (
            <View style={styles.iconWrapper}>
              {iconImage ? (
                <Image 
                  source={iconImage} 
                  style={[
                    styles.iconImage,
                    isSmallScreen && styles.iconImageSmall
                  ]} 
                  resizeMode="contain"
                />
              ) : (
                icon
              )}
            </View>
          )}
          
          {/* Textos do lado direito */}
          <View style={styles.textContainer}>
            <Text style={[
              styles.titulo,
              isSmallScreen && styles.tituloSmall
            ]}>{titulo || "TÍTULO"}</Text>
            
            <Text style={[
              styles.subtitulo,
              isSmallScreen && styles.subtituloSmall
            ]}>{subtitulo || "SUBTÍTULO"}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#0284c7", 
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    aspectRatio: 2.5, 
    minWidth: 190,
    maxWidth: 200,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContainerHover: {
    transform: [{ translateY: -12 }],
    backgroundColor: "#0678b1ff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 20,
  },
  cardContainerSmall: {
    minWidth: 150,
    maxWidth: 180,
    aspectRatio: 2.2, 
  },
  cardContentSmall: {
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
    flex: 1,
  },
  cardContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
    flex: 1,
  },
  horizontalLayout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
    height: "100%",
  },
  iconWrapper: {
    marginRight: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  iconImage: {
    width: 40,
    height: 40,
  },
  iconImageSmall: {
    width: 30,
    height: 30,
  },
  textContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  titulo: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 4,
    marginTop: 0,
    textAlign: "left",
    flexWrap: "wrap",
  },
  tituloSmall: {
    fontSize: 12,
    marginBottom: 3,
    marginTop: 0,
  },
  subtitulo: {
    fontSize: 14,
    color: "#FFFFFFFF",
    fontWeight: "bold",
    textAlign: "left",
    flexWrap: "wrap",
    marginTop: 0,
    marginBottom: 0,
  },
  subtituloSmall: {
    fontSize: 10,
  },
});

export default DashCard;
