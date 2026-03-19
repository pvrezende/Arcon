import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatisticsCardsProps {
  totalServicos: number;
  servicosEspecificos: number;
  servicosDisponiveis: number;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  totalServicos,
  servicosEspecificos,
  servicosDisponiveis,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768;
  const isSmallMobile = screenWidth < 480;
  return (
    <View style={styles.statsSection}>
      <View style={styles.headerSection}>
        <View style={styles.titleContainer}>
          <Ionicons name="analytics" size={24} color="#0284c7" />
          <Text style={styles.sectionTitle}>Estatísticas</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Visão geral dos seus serviços
        </Text>
      </View>
      
      <View style={[
        styles.statsContainer,
        isMobile && styles.statsContainerMobile,
        isSmallMobile && styles.statsContainerSmallMobile
      ]}>
        <View style={[
          styles.statCard,
          isMobile && styles.statCardMobile,
          isSmallMobile && styles.statCardSmallMobile
        ]}>
          <View style={styles.cardGradient} />
          <View style={[
            styles.statIconContainer,
            isMobile && styles.statIconContainerMobile,
            isSmallMobile && styles.statIconContainerSmallMobile
          ]}>
            <Ionicons 
              name="list" 
              size={isSmallMobile ? 18 : isMobile ? 20 : 24} 
              color="#ffffffff" 
            />
          </View>
          <View style={styles.statTextContainer}>
            <View style={styles.numberRow}>
              <Text style={[
                styles.statNumber,
                isMobile && styles.statNumberMobile,
                isSmallMobile && styles.statNumberSmallMobile
              ]}>{totalServicos}</Text>
              <Text style={[
                styles.statDescription,
                isMobile && styles.statDescriptionMobile,
                isSmallMobile && styles.statDescriptionSmallMobile
              ]}>Todos os serviços</Text>
            </View>
            <Text style={[
              styles.statLabel,
              isMobile && styles.statLabelMobile,
              isSmallMobile && styles.statLabelSmallMobile
            ]}>Total de Serviços</Text>
          </View>
        </View>
        
        <View style={[
          styles.statCard,
          isMobile && styles.statCardMobile,
          isSmallMobile && styles.statCardSmallMobile
        ]}>
          <View style={styles.cardGradient} />
          <View style={[
            styles.statIconContainer,
            isMobile && styles.statIconContainerMobile,
            isSmallMobile && styles.statIconContainerSmallMobile
          ]}>
            <Ionicons 
              name="person" 
              size={isSmallMobile ? 18 : isMobile ? 20 : 24} 
              color="#ffffffff" 
            />
          </View>
          <View style={styles.statTextContainer}>
            <View style={styles.numberRow}>
              <Text style={[
                styles.statNumber,
                isMobile && styles.statNumberMobile,
                isSmallMobile && styles.statNumberSmallMobile
              ]}>{servicosEspecificos}</Text>
              <Text style={[
                styles.statDescription,
                isMobile && styles.statDescriptionMobile,
                isSmallMobile && styles.statDescriptionSmallMobile
              ]}>Exclusivos para você</Text>
            </View>
            <Text style={[
              styles.statLabel,
              isMobile && styles.statLabelMobile,
              isSmallMobile && styles.statLabelSmallMobile
            ]}>Serviços Diretos</Text>
          </View>
        </View>
        
        <View style={[
          styles.statCard,
          isMobile && styles.statCardMobile,
          isSmallMobile && styles.statCardSmallMobile
        ]}>
          <View style={styles.cardGradient} />
          <View style={[
            styles.statIconContainer,
            isMobile && styles.statIconContainerMobile,
            isSmallMobile && styles.statIconContainerSmallMobile
          ]}>
            <Ionicons 
              name="location" 
              size={isSmallMobile ? 18 : isMobile ? 20 : 24} 
              color="#ffffffff" 
            />
          </View>
          <View style={styles.statTextContainer}>
            <View style={styles.numberRow}>
              <Text style={[
                styles.statNumber,
                isMobile && styles.statNumberMobile,
                isSmallMobile && styles.statNumberSmallMobile
              ]}>{servicosDisponiveis}</Text>
              <Text style={[
                styles.statDescription,
                isMobile && styles.statDescriptionMobile,
                isSmallMobile && styles.statDescriptionSmallMobile
              ]}>Próximos a você</Text>
            </View>
            <Text style={[
              styles.statLabel,
              isMobile && styles.statLabelMobile,
              isSmallMobile && styles.statLabelSmallMobile
            ]}>Disponíveis na Área</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 400,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainerMobile: {
    flexDirection: 'column',
    gap: 16,
    alignItems: 'stretch',
  },
  statsContainerSmallMobile: {
    gap: 12,
  },
  statCard: {
    backgroundColor: '#0284c7',
    padding: 18,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0,
    minHeight: 100,
    width: 280,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  statCardMobile: {
    width: '100%',
    minHeight: 80,
    padding: 16,
    borderRadius: 16,
  },
  statCardSmallMobile: {
    minHeight: 70,
    padding: 12,
    borderRadius: 12,
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statIconContainerMobile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  statIconContainerSmallMobile: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  statTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
    gap: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statNumberMobile: {
    fontSize: 24,
  },
  statNumberSmallMobile: {
    fontSize: 20,
  },
  statLabel: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  statLabelMobile: {
    fontSize: 13,
  },
  statLabelSmallMobile: {
    fontSize: 12,
  },
  statDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'left',
    fontWeight: '500',
    lineHeight: 14,
  },
  statDescriptionMobile: {
    fontSize: 11,
    lineHeight: 13,
  },
  statDescriptionSmallMobile: {
    fontSize: 10,
    lineHeight: 12,
  },
});

export default StatisticsCards;
