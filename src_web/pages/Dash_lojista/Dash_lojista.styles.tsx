import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFC" 
  },
  conteudo: { flexGrow: 1, alignItems: "center" },

  contentWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },

  secaoWrapper: {
    marginBottom: 40,
  },

  divider: {
    height: 3,
    backgroundColor: '#4A90E2',
    width: 60,
    marginVertical: 15,
    borderRadius: 2,
    left: 15,
  },

  sectionTitle: {
    color: "#000000ff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "left",
    marginBottom: 5,
    paddingLeft: 30,
  },

  sessao: { width: "100%", paddingVertical: 10, alignItems: "center" },
  tituloOpcao: {
    color: "#1e40af",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 20,
  },
  cardsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 30,
    marginTop: 10,
    width: "100%",
    paddingHorizontal: 10,
  },
  cardsRowSmall: { paddingHorizontal: 5 },
  card: {
    width: "30%",
    minWidth: 200,
    maxWidth: 300,
    margin: 10,
    aspectRatio: 2.5,
  },
  cardSmall: {
    width: "28%",
    minWidth: 150,
    maxWidth: 180,
    margin: 4,
    aspectRatio: 2.2,
  },
  cardMobile: {
    width: "30%",
    minWidth: 95,
    maxWidth: 130,
    margin: 3,
    aspectRatio: 1,
  },
  solucoesWrapper: {
    width: "100%",
    alignSelf: "stretch",
  },
   title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default styles;
