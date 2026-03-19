import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#edf5f8ff",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 30,
    marginTop: 20,
    marginHorizontal: 20,
  },
  containerMobile: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  content: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  contentMobile: {
    paddingHorizontal: 10,
  },
  contentTablet: {
    paddingHorizontal: 40,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'left',
    marginBottom: 8,
  },
  greetingMobile: {
    fontSize: 24,
  },
  greetingTablet: {
    fontSize: 36,
  },
  userName: {
    fontWeight: '700',
    color: '#0284c7',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'left',
    fontWeight: '500',
  },
  subtitleMobile: {
    fontSize: 14,
  },
  subtitleTablet: {
    fontSize: 18,
  },
});

export default styles;
