import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './BannerPromocional.styles';
import { ParamListBase, NavigationProp } from '@react-navigation/native';
import { useResponsive } from '../../../hooks/useResponsive'; 

type BannerPromocionalProps = {
  navigation: NavigationProp<ParamListBase>;
};
const BannerPromocional = ({ navigation }: BannerPromocionalProps) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const imageFloatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Efeito de flutuação contínua na imagem
    const createFloatAnimation = () => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(imageFloatAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(imageFloatAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
    };

    createFloatAnimation().start();
  }, []);

  const handleButtonPress = () => {
    navigation.navigate('PaginaLicenca')
  }

  return (
    <LinearGradient
      colors={['#134f94ff', '#17A3EA']}     
      style={[
        styles.backgroundContainer,
        isMobile && styles.backgroundContainerMobile,
        isTablet && styles.backgroundContainerTablet
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={[
        styles.contentWrapper,
        isMobile && styles.contentWrapperMobile,
        isTablet && styles.contentWrapperTablet
      ]}>
        {/* Lado Esquerdo: Textos e Botão */}
        <View style={[
          styles.leftContent,
          isMobile && styles.leftContentMobile,
          isTablet && styles.leftContentTablet
        ]}>
          
          <View style={[
            styles.titleContainer,
            isMobile && styles.titleContainerMobile
          ]}>
            <Text style={[
              styles.mainTitle,
              isMobile && styles.mainTitleMobile,
              isTablet && styles.mainTitleTablet
            ]}>
              A confiança que você precisa para
            </Text>
            <Text style={[
              styles.mainTitle,
              isMobile && styles.mainTitleMobile,
              isTablet && styles.mainTitleTablet
            ]}>
              cuidar do seu <Text style={styles.highlightText}>Ar condicionado</Text>
            </Text>
          </View>
          
          <View style={[
            styles.descriptionContainer,
            isMobile && styles.descriptionContainerMobile
          ]}>
            <Text style={[
              styles.descriptionText,
              isMobile && styles.descriptionTextMobile,
              isTablet && styles.descriptionTextTablet
            ]}>
              Atendemos em toda cidade de Manaus
            </Text>
            <Text style={[
              styles.descriptionText,
              isMobile && styles.descriptionTextMobile,
              isTablet && styles.descriptionTextTablet
            ]}>
              Instalamos, higienizamos e também
            </Text>
            <Text style={[
              styles.descriptionText,
              isMobile && styles.descriptionTextMobile,
              isTablet && styles.descriptionTextTablet
            ]}>
              fazemos a manutenção da sua máquina.
            </Text>
          </View>


          <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
           <TouchableOpacity 
                style={[
                  styles.button,
                  isMobile && styles.buttonMobile,
                  isTablet && styles.buttonTablet
                ]}
                onPress={handleButtonPress} 
            >
            <Text style={[
              styles.buttonText,
              isMobile && styles.buttonTextMobile,
              isTablet && styles.buttonTextTablet
            ]}>Conheça nossos planos</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Lado Direito: Imagem com efeito de ar */}
        <View style={[
          styles.rightContent,
          isMobile && styles.rightContentMobile,
          isTablet && styles.rightContentTablet
        ]}>
          <View style={[
            styles.imageContainer,
            isMobile && styles.imageContainerMobile,
            isTablet && styles.imageContainerTablet
          ]}>
            <Animated.Image 
              source={require('../../../assets/ar.png')} 
              style={[
                styles.arImage,
                isMobile && styles.arImageMobile,
                isTablet && styles.arImageTablet,
                {
                  transform: [
                    {
                      translateY: imageFloatAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -10],
                      }),
                    },
                    {
                      scale: imageFloatAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 1.02, 1],
                      }),
                    },
                  ],
                },
              ]}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

export default BannerPromocional;