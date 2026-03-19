import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isMobile = width < 1024;

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: isMobile ? 16 : 24,
    padding: isMobile ? 20 : 32,
    marginHorizontal: 0,
    marginBottom: isMobile ? 16 : 28,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: isMobile ? 2 : 6,
    },
    shadowOpacity: isMobile ? 0.08 : 0.15,
    shadowRadius: isMobile ? 4 : 12,
    elevation: isMobile ? 3 : 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: isMobile ? 16 : 24,
    paddingBottom: isMobile ? 12 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  titleContainer: {
    flex: 1,
  },
  marca: {
    fontSize: isMobile ? 18 : 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: isMobile ? 6 : 8,
    letterSpacing: isMobile ? 0.4 : 0.8,
  },
  statusBadge: {
    paddingHorizontal: isMobile ? 12 : 20,
    paddingVertical: isMobile ? 6 : 10,
    borderRadius: isMobile ? 20 : 28,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
  },
  inactiveBadge: {
    backgroundColor: '#fef2f2',
  },
  statusText: {
    fontSize: isMobile ? 12 : 14,
    fontWeight: '800',
    letterSpacing: isMobile ? 0.3 : 0.5,
  },
  activeText: {
    color: '#166534',
  },
  inactiveText: {
    color: '#dc2626',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  content: {
    gap: isMobile ? 16 : 20,
    paddingTop: isMobile ? 4 : 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: isMobile ? 6 : 8,
    paddingHorizontal: isMobile ? 8 : 4,
    backgroundColor: '#f8fafc',
    borderRadius: isMobile ? 8 : 12,
    marginBottom: isMobile ? 2 : 4,
  },
  label: {
    fontSize: isMobile ? 14 : 16,
    fontWeight: '800',
    color: '#475569',
    width: isMobile ? 100 : 130,
    flexShrink: 0,
    letterSpacing: isMobile ? 0.2 : 0.3,
  },
  value: {
    fontSize: isMobile ? 14 : 16,
    color: '#0f172a',
    flex: 1,
    fontWeight: '600',
    lineHeight: isMobile ? 20 : 24,
    paddingLeft: isMobile ? 4 : 8,
  },
  expiredText: {
    color: '#dc2626',
    fontWeight: '600',
  },
});