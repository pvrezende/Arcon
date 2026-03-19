import { StyleSheet, Platform, Dimensions } from "react-native";

const { width: screenWidth } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 0,
    alignItems: "center",
    justifyContent: "center",
    minWidth: "100%",
  },

  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 16,
    maxWidth: "100%",
    width: "100%",
    paddingHorizontal: 8,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: screenWidth < 768 ? 20 : 20,
    marginBottom: screenWidth < 768 ? 16 : 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    minHeight: screenWidth < 768 ? 320 : 350, 
    maxWidth: screenWidth < 768 ? '100%' : 400, 
    flexShrink: 0, 
    flexBasis: "auto", 
    marginHorizontal: screenWidth < 768 ? 0 : 4, 
    overflow: "visible",
    paddingBottom: screenWidth < 768 ? 20 : 16,
  },
  
  cardTransparent: {
    backgroundColor: "transparent",
    borderRadius: 0,
    marginBottom: 0,
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    elevation: 0,
    borderWidth: 0,
    borderColor: "transparent",
    minHeight: screenWidth < 768 ? 300 : 350, 
    maxWidth: screenWidth < 768 ? '100%' : 400, 
    flexShrink: 0, 
    flexBasis: "auto", 
    marginHorizontal: 0, 
    overflow: "visible", 
    // REMOVIDO: paddingTop: 40, ← ESTAVA CAUSANDO ESPAÇO EM BRANCO
  },

  // BADGE DO TIPO DE SERVIÇO (EXCLUSIVO/DISPONÍVEL) - CORRIGIDO
  tipoServicoBadge: {
    marginBottom: 16,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  tipoServicoDescricao: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },

  serviceHeaderSection: {
    backgroundColor: "#f8fafc",
    borderRadius: screenWidth < 768 ? 12 : 16,
    padding: screenWidth < 768 ? 16 : 20,
    marginBottom: screenWidth < 768 ? 12 : 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  // REMOVIDOS ESTILOS NÃO UTILIZADOS NO NOVO ServiceCard:
  // - newServiceBadge
  // - newServiceText  
  // - statusRow
  // - largeTagsContainer
  // - largeTag
  // - largeTagText
  // - tipoBadge (substituído por tipoServicoBadge)
  // - tipoText (substituído por badgeText)
  // - distanciaContainer
  // - distanciaText
  // - clienteContainer
  // - clienteNome
  // - infoRow
  // - marcaContainer
  // - marcaText
  // - tagContainer
  // - serviceTag
  // - serviceTagText
  // - statusContainer

  comentarioContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },

  comentarioTitulo: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    textAlign: "left",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  comentarioInput: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    textAlignVertical: "top",
    minHeight: 80,
    maxHeight: 120,
    ...(Platform.OS === 'web' && {
      outline: 'none',
      border: 'none',
      boxShadow: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      appearance: 'none',
    }),
  },

  infoButtonSection: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  infoButton: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  infoButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },

  infoButtonText: {
    color: "#64748b",
    fontWeight: "500",
    fontSize: 14,
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  propostaSection: {
    minHeight: 140,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  propostaLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  currencyPrefix: {
    backgroundColor: "#0284c7",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  currencyText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  input: {
    flex: 1,
    padding: 14,
    fontSize: 18,
    color: "#1e293b",
    fontWeight: "600",
    textAlign: "center",
    borderWidth: 0,
    ...(Platform.OS === 'web' && {
      outline: 'none',
      border: 'none',
      boxShadow: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      appearance: 'none',
    }),
  },

  inputDisabled: {
    backgroundColor: "#f8fafc",
    color: "#94a3b8",
  },

  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },

  btn: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: "40%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: screenWidth < 768 ? 16 : 14,
    paddingHorizontal: screenWidth < 768 ? 20 : 16,
    borderRadius: screenWidth < 768 ? 20 : 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  btnRecusar: {
    backgroundColor: "#ef4444",
  },

  btnEnviar: {
    backgroundColor: "#0284c7",
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 14,
    flexShrink: 1,
    flexWrap: "wrap",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  btnDisabled: {
    opacity: 0.6,
    transform: [{ scale: 0.98 }],
  },
});