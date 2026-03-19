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

interface DashClienteProps {
  navigation: any;
}

const Dash_cliente: React.FC<DashClienteProps> = ({ navigation }) => {
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );
  const [modalHistoricoVisible, setModalHistoricoVisible] = useState(false);

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
      {/* NAVBAR COM SINO PARA CLIENTE (NÃO É PRESTADOR) */}
      <Navbar navigation={navigation} showSino={true} isPrestador={false} />
      <ScrollView contentContainerStyle={styles.conteudo} ref={scrollViewRef}>
        {/* BANNER */}
        <Banner screenWidth={screenWidth} />

        {/* SESSÃO DASHCARDS */}
        <View style={styles.sessao}>
          <View style={[
            styles.opcoesContainer,
            screenWidth <= 633 && styles.opcoesContainerMobile
          ]}>
            <Text style={[
              styles.tituloOpcao,
              screenWidth <= 633 && styles.tituloOpcaoMobile
            ]}>
              ESCOLHA UMA OPÇÃO ABAIXO PARA COMEÇAR:
            </Text>
            <View
              style={[
                styles.cardsRow,
                screenWidth <= 450 && styles.cardsRowSmall,
                screenWidth <= 633 && styles.cardsRowMobile,
              ]}
            >
              {screenWidth <= 633 ? (
                <>
                  <DashButtonMobile
                    icon={<Ionicons name="snow" size={24} color="#ffffff" />}
                    titulo="Comprar Novo"
                    subtitulo="Ar condicionado"
                    onBotaoPress={() => navigation.navigate("ComprarNovo")}
                    style={styles.cardMobile}
                  />
                  <DashButtonMobile
                    icon={<Ionicons name="snow" size={24} color="#ffffff" />}
                    titulo="Comprar Usado"
                    subtitulo="Ar condicionado"
                    onBotaoPress={() => navigation.navigate("ComprarUsado")}
                    style={styles.cardMobile}
                  />
                  <DashButtonMobile
                    icon={<Ionicons name="construct" size={24} color="#ffffff" />}
                    titulo="Solicitar Serviço"
                    subtitulo="Visita Técnica"
                    onBotaoPress={() => navigation.navigate("ServicoCliente")}
                    style={styles.cardMobile}
                  />
                </>
              ) : (
                <>
                  <DashCard
                    icon={<Ionicons name="snow" size={iconSize} color="#ffffffff" />}
                    titulo="Comprar Novo"
                    subtitulo="Ar condicionado"
                    onBotaoPress={() => navigation.navigate("ComprarNovo")}
                    style={styles.card}
                  />
                  <DashCard
                    icon={<Ionicons name="snow" size={iconSize} color="#ffffffff" />}
                    titulo="Comprar Usado"
                    subtitulo="Ar condicionado"
                    onBotaoPress={() => navigation.navigate("ComprarUsado")}
                    style={styles.card}
                  />
                  <DashCard
                    icon={
                      <Ionicons
                        name="construct"
                        size={iconSize}
                        color="#ffffffff"
                      />
                    }
                    titulo="Solicitar Serviço"
                    subtitulo="Visita Técnica"
                    onBotaoPress={() => navigation.navigate("ServicoCliente")}
                    style={styles.card}
                  />
                </>
              )}
            </View>
          </View>
        </View>

        {/* SESSÃO DASHBOARD */}
        <DashboardSection
          screenWidth={screenWidth}
          onHistoricoPress={() => setModalHistoricoVisible(true)}
        />

        {/* SESSÃO NOSSAS SOLUÇÕES */}
        <View ref={solucoesRef} style={styles.solucoesWrapper}>
          <SolucoesSection screenWidth={screenWidth} />
        </View>

        {/* FAIXA PROMOCIONAL */}
        <PromotionalBanner screenWidth={screenWidth} />
      </ScrollView>

      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#DEEAF5FF" },
  conteudo: { flexGrow: 1, alignItems: "center" },

  sessao: { width: "100%", paddingVertical: 10, alignItems: "center" },
  opcoesContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: -50,
    marginBottom: 20,
    width: "90%",
    maxWidth: 1200,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
      },
    }),
  },
  opcoesContainerMobile: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    width: "95%",
    marginHorizontal: 10,
    marginTop: -20,
  },
  tituloOpcao: {
    color: "#0284c7",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 0,
    marginBottom: 10,
    backgroundColor: "#eff6ffff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
  },
  tituloOpcaoMobile: {
    fontSize: 13,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  cardsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 10,
  },
  cardsRowSmall: { paddingHorizontal: 5 },
  cardsRowMobile: {
    marginTop: 10,
    paddingHorizontal: 5,
    gap: 8,
  },
  card: {
    width: "30%",
    minWidth: 200,
    maxWidth: 300,
    margin: 10,
    aspectRatio: 2.5,
  },
  cardMobile: {
    width: "30%",
    minWidth: 100,
    maxWidth: 140,
    margin: 2,
    aspectRatio: 0.9,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  solucoesWrapper: {
    width: "100%",
    alignSelf: "stretch",
  },
});

export default Dash_cliente;