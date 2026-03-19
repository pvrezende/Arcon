import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  gradientContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    height: 500,
    width: 300,
    borderWidth: 2,
    borderColor: '#201e1eff',
  },
  
  iconeCirculo: {
    width: 52, 
    height: 52,
    borderRadius: 26, 
    backgroundColor: '#000000ff', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 10, 
  },
  nomePlano: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffffff',
    marginBottom: 15,
  },
  descricaoContainer: {
    alignSelf: 'center',
    marginTop: 10,
    width: '80%',
  },
  descricaoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  descricao: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'left',
  },
  botao: {
    backgroundColor: '#ffffffff',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  textoBotao: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default styles;
