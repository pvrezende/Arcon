import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  gradientContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    height: 500,
    width: 300,
  }, 
  iconeCirculo: {
    width: 52, 
    height: 52,
    borderRadius: 24, 
    backgroundColor: "#213ac4ff", 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 10, 
  },
  nomePlano: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#ffffffff",
    marginBottom: 15,
  },
  descricaoContainer: {
    alignSelf: "center",
    marginTop: 10,
    width: "80%",
  },
  descricaoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  descricao: {
    fontSize: 14,
    color: "#ffffffff",
    textAlign: "left",
  },
  botao: {
    marginTop: 15,
    backgroundColor: "#ffffffff",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  textoBotao: {
    color: "#000000ff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});

export default styles;
