import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isMobile = width < 1024; // Aumentado para incluir tablets e telas menores

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    paddingHorizontal: isMobile ? 20 : 64,
  },
  header: {
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: isMobile ? 20 : 64,
    paddingVertical: isMobile ? 20 : 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isMobile ? 8 : 12,
    marginBottom: isMobile ? 16 : 0,
  },
  title: {
    fontSize: isMobile ? 24 : 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: isMobile ? 15 : 16,
    color: '#64748b',
    marginBottom: isMobile ? 24 : 32,
    lineHeight: isMobile ? 22 : 24,
    paddingTop: isMobile ? 16 : 24,
  },
  addButton: {
    backgroundColor: '#0284c7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isMobile ? 14 : 16,
    paddingVertical: isMobile ? 10 : 10,
    borderRadius: isMobile ? 10 : 12,
    gap: isMobile ? 5 : 6,
    minWidth: isMobile ? 90 : 100,
    alignSelf: isMobile ? 'flex-start' : 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default styles;