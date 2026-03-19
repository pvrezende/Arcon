// App.Mobile.tsx - AUTENTICAÇÃO CENTRALIZADA E EM TEMPO REAL
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator, StyleSheet, LogBox } from "react-native";

LogBox.ignoreLogs(["The action 'NAVIGATE' with payload"]);

// Provider e Hook de autenticação
import { AuthProvider } from "./src_mobile/contexts/AuthContext";
import { useAuth } from "./src_mobile/hooks/useAuth";

// ========== TELAS PÚBLICAS (SEM LOGIN) ==========
import Home from "./src_mobile/pages/home";
import Cliente from "./src_mobile/pages/login/cadastro/cliente";
import Prestador from "./src_mobile/pages/login/cadastro/prestador";
import LoginCliente from "./src_mobile/pages/login/login_cli_pre/logincliente";
import LoginPrestador from "./src_mobile/pages/login/login_cli_pre/loginprestador";
import RecuperarSenhaCliente from "./src_mobile/pages/login/recuperacao/recuperarsenhacliente"; 
import RecuperarSenhaPrestador from "./src_mobile/pages/login/recuperacao/recuperarsenhaprestador";

// ========== TELAS PRIVADAS (COM LOGIN) ==========
import Dash_cliente from "./src_mobile/pages/dashcliente/dash_cliente";
import AreaPrestador from "./src_mobile/pages/areaprestador/areaprestador";
import DashLojista from "./src_mobile/pages/Dash_lojista/Dash_lojista";
import ComprarUsado from "./src_mobile/pages/comprarusado/ComprarUsado";
import ComprarNovo from "./src_mobile/pages/comprarNovo/ComprarNovo";
import Configuracoes from "./src_mobile/pages/Configuracoes/Configuracoes";
import Perfil from "./src_mobile/pages/Configuracoes/editarperfilcliente";
import Pagamentos from "./src_mobile/pages/Configuracoes/FormasPagamentoCliente";
import HistoricoCliente from "./src_mobile/pages/Configuracoes/HistoricoCliente";
import TrialScreen from "./src_mobile/pages/areaprestador/trial";
import SobreConsertAR from "./src_mobile/pages/Configuracoes/Sobre";
import Ajuda from "./src_mobile/pages/Configuracoes/Ajuda";
import PropostaCliente from "./src_mobile/pages/propostaCliente/propostaCliente";
import ListaChats from "./src_mobile/pages/chatInterativo/ListaChats";
import ChatScreen from "./src_mobile/pages/ChatScreen";
import AnunciarProduto from "./src_mobile/pages/anunciarProduto/AnunciarProduto";
import ServicoCliente from "./src_mobile/pages/SolicitarServicoCliente/ServicoCliente2";
import PerfilModal from "./src_mobile/componentes/ModalCliente";
import ListaPrestadores from "./src_mobile/pages/prestadoresList/ListaPrestadores";
import MeusAnuncios from "./src_mobile/pages/Dash_lojista/MeusAnuncios";

const Stack = createNativeStackNavigator();

// Componente interno que usa o hook de autenticação
function AppContent() {
  // Hook de autenticação - controla tudo em tempo real
  const { user, userData, loading } = useAuth();

  // Tela de loading enquanto verifica autenticação
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  // Determinar tipo de usuário logado
  const isLoggedIn = !!(user && userData);
  const isCliente = userData?.tipo_usuario === "CLIENTE";
  const isPrestador = userData?.tipo_usuario === "PRESTADOR";
  const isLojista = isPrestador && (
    userData?.tipo_prestador?.toLowerCase() === "loja" ||
    userData?.subtipo?.toLowerCase() === "loja"
  );

  console.log('🔐 Estado:', { isLoggedIn, isCliente, isPrestador, isLojista, nome: userData?.nome });

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {/* ========== USUÁRIO NÃO LOGADO ========== */}
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="logincliente" component={LoginCliente} />
            <Stack.Screen name="loginprestador" component={LoginPrestador} />
            <Stack.Screen name="cliente" component={Cliente} />
            <Stack.Screen name="prestador" component={Prestador} />
            <Stack.Screen name="RecuperarSenhaCliente" component={RecuperarSenhaCliente} />
            <Stack.Screen name="RecuperarSenhaPrestador" component={RecuperarSenhaPrestador} />
          </>
        )
        
        /* ========== CLIENTE LOGADO ========== */
        : isCliente ? (
          <>
            <Stack.Screen name="dash_cliente" component={Dash_cliente} />
            <Stack.Screen name="ComprarNovo" component={ComprarNovo} />
            <Stack.Screen name="ComprarUsado" component={ComprarUsado} />
            <Stack.Screen name="Configuracoes" component={Configuracoes} />
            <Stack.Screen name="Perfil" component={Perfil} />
            <Stack.Screen name="Pagamentos" component={Pagamentos} />
            <Stack.Screen name="HistoricoCliente" component={HistoricoCliente} />
            <Stack.Screen name="SobreConsertAR" component={SobreConsertAR} />
            <Stack.Screen name="PerfilModal" component={PerfilModal} />
            <Stack.Screen name="Ajuda" component={Ajuda} />
            <Stack.Screen name="PropostaCliente" component={PropostaCliente} />
            <Stack.Screen name="ServicoCliente" component={ServicoCliente} />
            <Stack.Screen name="ListaPrestadores" component={ListaPrestadores} />
            <Stack.Screen name="AreaPrestador" component={AreaPrestador} />
            <Stack.Screen name="ListaChats" component={ListaChats} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            {/* TRIALSCREEN APENAS COMO TELA SECUNDÁRIA */}
            <Stack.Screen name="TrialScreen" component={TrialScreen} />
          </>
        )
        
        /* ========== PRESTADOR LOJISTA ========== */
        : isLojista ? (
          <>
            <Stack.Screen name="DashLojista" component={DashLojista} />
            <Stack.Screen name="MeusAnuncios" component={MeusAnuncios} />
            <Stack.Screen name="AnunciarProduto" component={AnunciarProduto} />
            <Stack.Screen name="Configuracoes" component={Configuracoes} />
            <Stack.Screen name="Perfil" component={Perfil} />
            <Stack.Screen name="Pagamentos" component={Pagamentos} />
            <Stack.Screen name="HistoricoCliente" component={HistoricoCliente} />
            <Stack.Screen name="SobreConsertAR" component={SobreConsertAR} />
            <Stack.Screen name="Ajuda" component={Ajuda} />
            <Stack.Screen name="ComprarNovo" component={ComprarNovo} />
            <Stack.Screen name="ComprarUsado" component={ComprarUsado} />
            <Stack.Screen name="ListaChats" component={ListaChats} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            {/* TRIALSCREEN APENAS COMO TELA SECUNDÁRIA */}
            <Stack.Screen name="TrialScreen" component={TrialScreen} />
          </>
        )
        
        /* ========== PRESTADOR AUTÔNOMO ========== */
        : (
          <>
            <Stack.Screen name="AreaPrestador" component={AreaPrestador} />
            <Stack.Screen name="Configuracoes" component={Configuracoes} />
            <Stack.Screen name="Perfil" component={Perfil} />
            <Stack.Screen name="Pagamentos" component={Pagamentos} />
            <Stack.Screen name="HistoricoCliente" component={HistoricoCliente} />
            <Stack.Screen name="dash_cliente" component={Dash_cliente} />
            <Stack.Screen name="ComprarNovo" component={ComprarNovo} />
            <Stack.Screen name="ComprarUsado" component={ComprarUsado} />
            <Stack.Screen name="PropostaCliente" component={PropostaCliente} />
            <Stack.Screen name="ServicoCliente" component={ServicoCliente} />
            <Stack.Screen name="Ajuda" component={Ajuda} />
            <Stack.Screen name="SobreConsertAR" component={SobreConsertAR} />
            <Stack.Screen name="ListaPrestadores" component={ListaPrestadores} />
            <Stack.Screen name="ListaChats" component={ListaChats} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            {/* TRIALSCREEN APENAS COMO TELA SECUNDÁRIA */}
            <Stack.Screen name="TrialScreen" component={TrialScreen} />
          </>
        )}
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Componente principal que fornece o contexto de autenticação
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
});