import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from './Dash_lojista.styles';


import Navbar from "../../componentes/navbar";
import Footer from "../../componentes/footer";
import DashCard from "../../componentes/dashcliente/dashButton";
import DashButtonMobile from "../../componentes/dashcliente/dashButtonMobile";
import Banner from "../../componentes/dashcliente/Banner";
import EstatisticasSection from "../../componentes/dashLogista/EstatisticasSection/EstatisticasSection";
import DicasAnuncio from "../../componentes/dashLogista/Recomendacoes/DicasAnuncio";
import WelcomeGreeting from "../../componentes/dashLogista/WelcomeGreeting/WelcomeGreeting";

interface DashLojistaProps {
  navigation: any;
}

const DashLojista: React.FC<DashLojistaProps> = ({ navigation }) => {
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const iconSize = screenWidth >= 600 ? 40 : 20;

  return (
    <View style={styles.container}>
      <Navbar />

      <ScrollView style={{ flex: 1}}>
        <Banner screenWidth={screenWidth} />
        <WelcomeGreeting />

        {/* WRAPPER PRINCIPAL */}
        <View style={styles.contentWrapper}>
          <View style={styles.secaoWrapper}>
            
            <Text style={styles.sectionTitle}>SEUS ANÚNCIOS</Text>
            <View style={styles.divider} />
            <View>
            <Text style={styles.title}>Faça um anúncio</Text>
            <Text style={styles.subtitle}>
               Gerencie e visualize os seus Anúncios
        </Text>
      </View>
            <View
            
              style={[
                styles.cardsRow,
                screenWidth <= 450 && styles.cardsRowSmall,
              ]}
            >
              {screenWidth <= 633 ? (
                <>
                  <DashButtonMobile
                    icon={<Ionicons name="add-circle" size={20} color="#7dd3fc" />}
                    titulo="Anunciar Novo"
                    subtitulo="Produto Novo"
                    onBotaoPress={() => navigation.navigate('AnunciarProduto', { tipo: 'NOVO' })}
                    style={styles.cardMobile}
                  />
                  <DashButtonMobile
                    icon={<Ionicons name="add-circle-outline" size={20} color="#7dd3fc" />}
                    titulo="Anunciar Usado"
                    subtitulo="Produto Usado"
                    onBotaoPress={() => navigation.navigate('AnunciarProduto', { tipo: 'USADO' })}
                    style={styles.cardMobile}
                  />
                  <DashButtonMobile
                    icon={<Ionicons name="list" size={20} color="#7dd3fc" />}
                    titulo="Meus Anúncios"
                    subtitulo="Gerenciar"
                    onBotaoPress={() => navigation.navigate('MeusAnuncios')}
                    style={styles.cardMobile}
                  />
                </>
              ) : (
                <>
                  <DashCard
                    icon={<Ionicons name="add-circle" size={iconSize} color="#ffffffff" />}
                    titulo="Anunciar Novo"
                    subtitulo="Produto Novo"
                    onBotaoPress={() => navigation.navigate('AnunciarProduto', { tipo: 'NOVO' })}
                    style={styles.card}
                  />
                  <DashCard
                    icon={<Ionicons name="add-circle-outline" size={iconSize} color="#ffffffff" />}
                    titulo="Anunciar Usado"
                    subtitulo="Produto Usado"
                    onBotaoPress={() => navigation.navigate('AnunciarProduto', { tipo: 'USADO' })}
                    style={styles.card}
                  />
                  <DashCard
                    icon={<Ionicons name="list" size={iconSize} color="#ffffffff" />}
                    titulo="Meus Anúncios"
                    subtitulo="Gerenciar Produtos"
                    onBotaoPress={() => navigation.navigate('MeusAnuncios')}
                    style={styles.card}
                  />
                </>
              )}
            </View>
          </View>

          {/* SESSÃO ESTATÍSTICAS */}
          <View style={styles.secaoWrapper}>
            <Text style={styles.sectionTitle}>PERFORMANCE DOS SEUS ANÚNCIOS</Text>
            <View style={styles.divider} />
            <EstatisticasSection screenWidth={screenWidth} />
          </View>

          {/* SESSÃO RECOMENDAÇÕES */}
          <View style={styles.secaoWrapper}>
            <Text style={styles.sectionTitle}>DICAS</Text>
            <View style={styles.divider} />
           <DicasAnuncio />
          </View>
        </View>
        
        <Footer />
      </ScrollView>
    </View>
  );
};

export default DashLojista;
