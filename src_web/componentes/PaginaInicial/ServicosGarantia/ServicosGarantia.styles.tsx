import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
  },
  
  leftSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  arsImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  
  rightSection: {
    flex: 1,
    paddingLeft: 20,
  },
  
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  
  icon: {
    fontSize: 80,
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C2E4A',
    marginBottom: 15,
    lineHeight: 32,
  },
  
  highlightText: {
    color: '#00F0FF',
  },
  
  description: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
});

export default styles;
