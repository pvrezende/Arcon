import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  column: {
    flex: 1,
    marginHorizontal: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0284c7',
    marginBottom: 20,
  },
  link: {
    marginBottom: 12,
  },
  linkText: {
    fontSize: 14,
    color: '#64748b',
    textDecorationLine: 'underline',
  },
  socialIcons: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  socialIcon: {
    marginRight: 15,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  storeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  storeButton: {
    flex: 1,
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  storeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});