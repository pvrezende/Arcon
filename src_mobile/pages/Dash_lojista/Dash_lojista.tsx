import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Componentes locais
import Navbar from "../../componentes/navbar";
import Footer from "../../componentes/footer";
import DashCard from "../../componentes/dashcliente/dashButton";
import DashButtonMobile from "../../componentes/dashcliente/dashButtonMobile";
import Banner from "../../componentes/dashcliente/Banner";
import DashboardSection from "../../componentes/dashcliente/DashboardSection";
import SolucoesSection from "../../componentes/dashcliente/SolucoesSection";
import PromotionalBanner from "../../componentes/dashcliente/PromotionalBanner";

interface DashLojistaProps {
  navigation: any;
}

const DashLojista: React.FC<DashLojistaProps> = ({ navigation }) => {
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );

  const scrollViewRef = useRef<ScrollView>(null);
  const conhecaRef = useRef<View>(null);
  const solucoesRef = useRef<View>(null);

  // Atualiza largura da tela
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Scroll suave até a sessão "Conheça o App"
  useEffect(() => {
    // @ts-ignore
    const section = navigation?.route?.params?.section;
    if (
      section === "sessaoConheca" &&
      conhecaRef.current &&
      scrollViewRef.current
    ) {
      conhecaRef.current.measureLayout(
        scrollViewRef.current.getInnerViewNode(),
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y, animated: true });
        },
        () => {
          console.log("Erro ao medir layout");
        }
      );
    }
  }, [navigation]);

  const iconSize = screenWidth >= 600 ? 40 : 20;

  return (
    <View style={styles.container}>
      <Navbar />

      <ScrollView contentContainerStyle={styles.conteudo} ref={scrollViewRef}>
        {/* BANNER */}
        <Banner screenWidth={screenWidth} />

        {/* SESSÃO DASHCARDS LOJISTA */}
        <View style={styles.sessao}>
          <Text style={styles.tituloOpcao}>
            GERENCIE SEUS ANÚNCIOS
          </Text>
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



      </ScrollView>

      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFC" // Cor de fundo solicitada
  },
  conteudo: { flexGrow: 1, alignItems: "center" },

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
    marginBottom: 50,
    marginTop: 50,
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
});

export default DashLojista;