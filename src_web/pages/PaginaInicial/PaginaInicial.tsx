import React from "react";
import {View, ScrollView } from "react-native";
import BannerPromocional from "../../componentes/PaginaInicial/BannerPromocional/BannerPromocional"

import Footer from "../../componentes/footer";
import Rodape from "../../componentes/PaginaInicial/Rodape/Rodape/Rodape";
import ServicosGarantia from "../../componentes/PaginaInicial/ServicosGarantia/ServicosGarantia";
import NossasVantagens from "../../componentes/PaginaInicial/NossasVantagens/NossasVantagens";
import Navbar from "../../componentes/PaginaInicial/NavBar/navbar";

const PaginaInicial = ({ navigation }: any) => {
  return (
    
    <View style={{ flex: 1 }}> 
      <Navbar navigation={navigation} />
      <ScrollView style={{ flex: 1 }}> 
        <BannerPromocional navigation={navigation}/>
        <ServicosGarantia />
        <NossasVantagens />
        <Rodape />
        <Footer />
      </ScrollView>
    </View>
  );
};

export default PaginaInicial;
