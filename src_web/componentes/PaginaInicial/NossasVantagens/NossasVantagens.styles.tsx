import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#edf5f8ff',
    paddingHorizontal: screenWidth > 768 ? 100 : 20,
    paddingVertical: screenWidth > 768 ? 80 : 50,
    alignItems: 'center',
  },
  
  title: {
    fontSize: screenWidth > 768 ? 32 : 26,
    fontWeight: 'bold',
    color: '#1C2E4A',
    textAlign: 'center',
    marginBottom: 50,
  },
  
  vantagensGrid: {
    width: '100%',
    maxWidth: screenWidth > 768 ? 900 : screenWidth - 40,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: screenWidth > 768 ? 40 : 25,
  },
  
  vantagemCard: {
    width: screenWidth > 768 ? '45%' : '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 20,
    paddingHorizontal: 15,
    height: 100,
  },
  
  iconContainer: {
    width: 70,
    height: 70,
    backgroundColor: '#0284c7',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    flexShrink: 0,
  },
  
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  
  vantagemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C2E4A',
    marginBottom: 6,
    lineHeight: 24,
  },
  
  vantagemDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});

export default styles;
