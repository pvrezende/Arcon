import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  paginacaoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  botaoNavegacao: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoDesabilitado: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  botaoPagina: {
    minWidth: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  botaoPaginaAtiva: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  textoPagina: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  textoPaginaAtiva: {
    color: 'white',
  },
  reticencias: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 4,
  },
});