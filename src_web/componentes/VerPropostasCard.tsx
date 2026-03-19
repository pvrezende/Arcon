import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';


type RootStackParamList = {
    
    PropostaCliente: undefined;
    PrestadoresList: undefined;
   
};

type NavigationProp = StackNavigationProp<RootStackParamList, keyof RootStackParamList>;


interface HistoricoCardProps {
  screenWidth: number;
}

const HistoricoCard: React.FC<HistoricoCardProps> = ({ screenWidth }) => {
 
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={[styles.tecnicoCard, screenWidth <= 430 && styles.tecnicoCardMobile]}>
      <Text style={[styles.tecnicoCardTitulo, screenWidth <= 430 && styles.tecnicoCardTituloMobile]}>
        Propostas confirmadas
      </Text>

  
      {/* BOTÃO EXISTENTE: Ver propostas (Usa a rota PropostaCliente) */}
      <TouchableOpacity 
        style={[styles.tecnicoBotao, screenWidth <= 430 && styles.tecnicoBotaoMobile]}
        onPress={() => navigation.navigate("PropostaCliente")}
      >
        <Text style={[styles.tecnicoBotaoTexto, screenWidth <= 430 && styles.tecnicoBotaoTextoMobile]}>
          Ver propostas
        </Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  tecnicoCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 140,
    justifyContent: 'space-between', 
  },
  tecnicoCardMobile: {
    width: "100%",
    minHeight: 120,
    paddingVertical: 12, 
  },
  tecnicoCardTitulo: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e40af",
    marginBottom: 10,
    textAlign: "left",
  },
  tecnicoCardTituloMobile: {
    fontSize: 16,
    marginBottom: 8,
  },
  // ESTILOS DO BOTÃO PRIMÁRIO (Ver propostas)
  tecnicoBotao: {
    backgroundColor: "#1e40af",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  tecnicoBotaoMobile: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 6,
  },
  tecnicoBotaoTexto: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  tecnicoBotaoTextoMobile: {
    fontSize: 12,
  },

  // NOVO ESTILO DO BOTÃO SECUNDÁRIO (Ver prestadores)
  tecnicoBotaoSecondary: {
    backgroundColor: "transparent", 
    borderColor: "#1e40af", 
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0, 
  },
  tecnicoBotaoSecondaryMobile: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tecnicoBotaoTextoSecondary: {
    color: "#1e40af", 
    fontSize: 14,
    fontWeight: "600",
  },
  tecnicoBotaoTextoSecondaryMobile: {
    fontSize: 12,
  },
});

export default HistoricoCard;