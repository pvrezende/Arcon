import { StyleSheet, Dimensions } from 'react-native'; 
const { width } = Dimensions.get('window'); 

export const styles = StyleSheet.create({ 
  container: { 
    flex: 1, 
    backgroundColor: 'white', 
  }, 
  header: { 
    backgroundColor: '#0284c7', 
    paddingTop: 20, 
    paddingBottom: 16, 
    paddingHorizontal: 20, 
  }, 
  headerContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
  }, 
  headerIcon: { 
    marginRight: 12, 
  }, 
  headerTexts: { 
    flex: 1, 
  }, 
  headerTitle: { 
    color: 'white', 
    fontSize: 12, 
    fontWeight: '600', 
  }, 
  headerSubtitle: { 
    color: '#BFDBFE', 
    fontSize: 12, 
    marginTop: 2, 
  }, 
  closeButton: { 
    padding: 4, 
  }, 
  content: { 
    flex: 1, 
  }, 
  scrollView: { 
    flex: 1, 
    paddingHorizontal: 20, 
    paddingTop: 16, 
  }, 
  emptyContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 60, 
  }, 
  emptyIcon: { 
    width: 96, 
    height: 96, 
    backgroundColor: '#F3F4F6', 
    borderRadius: 48, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 24, 
  }, 
  emptyTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#111827', 
    marginBottom: 8, 
  }, 
  emptySubtitle: { 
    fontSize: 12, 
    color: '#6B7280', 
    marginBottom: 24, 
    textAlign: 'center', 
  }, 
  continueButton: { 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderWidth: 1, 
    borderColor: '#0284c7', 
    borderRadius: 8, 
    backgroundColor: 'white', 
  }, 
  continueButtonText: { 
    color: '#0284c7', 
    fontSize: 10, 
    fontWeight: '500', 
  }, 
  itemsContainer: { 
    paddingBottom: 18, 
  }, 
  itemCard: { 
    backgroundColor: 'white', 
    borderRadius: 12, 
    marginBottom: 16, 
    padding: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 3, 
    elevation: 2, 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
  }, 
  itemContent: { 
    flexDirection: 'row', 
  }, 
  itemImage: { 
    width: 64, 
    height: 64, 
    backgroundColor: '#F3F4F6', 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12, 
    borderWidth: 1, 
    borderColor: '#E5E7EB',
  }, 
  itemInfo: { 
    flex: 1,
  }, 
  itemModelo: { 
    fontSize: 14, 
    fontWeight: '500',
    color: '#111827', 
    marginBottom: 8, 
  }, 
  itemBadges: { 
    flexDirection: 'row', 
    marginBottom: 8, 
  }, 
  badge: { 
    backgroundColor: '#F1F5F9', 
    paddingHorizontal: 8,
    paddingVertical: 4, 
    marginRight: 8, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
  }, 
  badgeText: { 
    fontSize: 10,
    color: '#64748B', 
  }, 
  itemBottom: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
  }, 
  itemPreco: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#10b981', 
  }, 
  removeButton: { 
    padding: 8, 
    borderRadius: 4, 
  }, 
  footer: { 
    backgroundColor: '#F9FAFB', 
    borderTopWidth: 1, 
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 20, 
    paddingVertical: 16,
  }, 
  summary: { 
    marginBottom: 16, 
  }, 
  summaryRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 8, 
  }, 
  summaryLabel: { 
    fontSize: 14, 
    color: '#6B7280', 
  }, 
  summaryValue: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#111827', 
  }, 
  summaryValueGreen: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#10b981', 
  }, 
  separator: { 
    height: 1, 
    backgroundColor: '#E5E7EB', 
    marginVertical: 12, 
  }, 
  totalRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
  }, 
  totalLabel: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#111827', 
  }, 
  totalValue: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#10b981', 
  }, 
  actionButtons: { 
    marginBottom: 16, 
  }, 
  checkoutButton: { 
    backgroundColor: '#10b981', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 16,
    borderRadius: 8, 
  },
  checkoutButtonText: { 
    color: 'white', 
    fontSize: 16,
    fontWeight: '600', 
    marginLeft: 8, 
  }, 
  continueShoppingButton: { 
    borderWidth: 1, 
    borderColor: '#0284c7', 
    paddingVertical: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    backgroundColor: 'white', 
    marginTop: 10,
  }, 
  continueShoppingButtonText: { 
    color: '#0284c7', 
    fontSize: 14, 
    fontWeight: '500', 
    
  }, 
  guarantees: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    paddingTop: 12, 
    borderTopWidth: 1, 
    borderTopColor: '#E5E7EB', 
  }, 
  guaranteeItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginHorizontal: 16, 
  }, 
  guaranteeDot: { 
    width: 8,
    height: 8,
    borderRadius: 4, 
    marginRight: 4, 
  }, 
  guaranteeText: { 
    fontSize: 12, 
    color: '#6B7280', 
  }, 
  // Estilos para sidebar  
  overlay: { 
    flex: 1, 
    flexDirection: 'row', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  }, 
  backdropTouchable: { 
    flex: 1, 
  }, 
  sidebarContainer: { 
    width: width * 0.85, // 85% da largura da tela    
    maxWidth: 400, 
    backgroundColor: '#fff', 
    shadowColor: '#000', 
    shadowOffset: { width: -2, height: 0 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 10, 
    elevation: 10, 
  }, 
});
