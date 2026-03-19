import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../../../hooks/useAuth';
import { useResponsive } from '../../../hooks/useResponsive';
import styles from './WelcomeGreeting.styles';

const WelcomeGreeting: React.FC = () => {
  const { userData, loading } = useAuth();
  const { isMobile, isTablet } = useResponsive();

  // Pegar o nome do usuário do useAuth
  const userName = userData?.nome || 'Usuário';

  if (loading) {
    return null;
  }

  return (
    <View style={[
      styles.container,
      isMobile && styles.containerMobile
    ]}>
      <View style={[
        styles.content,
        isMobile && styles.contentMobile,
        isTablet && styles.contentTablet
      ]}>
        <Text style={[
          styles.greeting,
          isMobile && styles.greetingMobile,
          isTablet && styles.greetingTablet
        ]}>
          Olá, <Text style={styles.userName}>{userName}</Text>
        </Text>
        <Text style={[
          styles.subtitle,
          isMobile && styles.subtitleMobile,
          isTablet && styles.subtitleTablet
        ]}>
          Bem-vindo ao seu painel de gerenciamento
        </Text>
      </View>
    </View>
  );
};

export default WelcomeGreeting;

