import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator, StyleSheet, LogBox } from "react-native";
import { AuthProvider } from "./src_web/contexts/AuthContext";
import { useAuth } from "./src_web/hooks/useAuth";

// Ignora o aviso de navegação não tratada
LogBox.ignoreLogs([
  "The action 'NAVIGATE' with payload",
]);

// Import das telas
import Cliente from "./src_web/pages/login/cadastro/cliente";
import Prestador from "./src_web/pages/login/cadastro/prestador";
import LoginCliente from "./src_web/pages/login/login_cli_pre/logincliente";
import LoginPrestador from "./src_web/pages/login/login_cli_pre/loginprestador";
import RecuperarSenhaCliente from "./src_web/pages/login/recuperacao/recuperarsenhacliente"; 
import RecuperarSenhaPrestador from "./src_web/pages/login/recuperacao/recuperarsenhaprestador";
import Dash_cliente from "./src_web/pages/dashcliente/dash_cliente";
import AreaPrestador from "./src_web/pages/areaprestador/areaprestador";
import ComprarUsado from "./src_web/pages/comprarusado/ComprarUsado";
import ComprarNovo from "./src_web/pages/comprarNovo/ComprarNovo";
import Configuracoes from "./src_web/pages/Configuracoes/Configuracoes";
import Perfil from "./src_web/pages/Configuracoes/editarperfilcliente";
import Pagamentos from "./src_web/pages/Configuracoes/FormasPagamentoCliente";
import HistoricoCliente from "./src_web/pages/Configuracoes/HistoricoCliente";
import SobreConsertAR from "./src_web/pages/Configuracoes/Sobre";
import PropostaCliente from "./src_web/pages/propostaCliente/propostaCliente";
import ListaChats from "./src_web/pages/chatInterativo/ListaChats";
import ChatScreen from "./src_web/pages/ChatScreen";
import AnunciarProduto from "./src_web/pages/anunciarProduto/AnunciarProduto";
import ServicoCliente from "./src_web/pages/SolicitarServicoCliente/ServicoCliente2";
import Credenciamento from "./src_web/pages/Credenciamento/Credenciamento";
import ListaPrestadores from "./src_web/pages/prestadoresList/ListaPrestadores";
import DashLojista from "./src_web/pages/Dash_lojista/Dash_lojista";
import MeusAnuncios from "./src_web/pages/Dash_lojista/MeusAnuncios";
import Ajuda from "./src_web/pages/Configuracoes/Ajuda";
import PaginaLicenca from "./src_web/pages/PaginaLicenca/PaginaLicenca";
import PaginaInicial from "./src_web/pages/PaginaInicial/PaginaInicial";

const Stack = createNativeStackNavigator();
function AppContent() {
  const { user, userData, loading } = useAuth();

  // Debug: Log do estado atual
  console.log(' App.web.tsx - Estado atual:', { 
    user: user ? 'autenticado' : 'não autenticado', 
    userData: userData ? userData.tipo_usuario : 'null',
    loading 
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  // Criar uma key única baseada no estado de autenticação para forçar re-renderização
  const navigationKey = user && userData ? `auth-${userData.id_usuario || userData.id || 'user'}` : 'guest';

  return (
    <NavigationContainer
      key={navigationKey}
      onStateChange={(state) => {
        const currentRoute = state?.routes?.[state.index]?.name;
        if (!currentRoute) console.log(" Navegação indefinida detectada");
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Usuário não logado */}
        {!user || !userData ? (
          <>
            <Stack.Screen name="PaginaInicial" component={PaginaInicial} />
            <Stack.Screen name="logincliente" component={LoginCliente} />
            <Stack.Screen name="loginprestador" component={LoginPrestador} />
            <Stack.Screen name="cliente" component={Cliente} />
            <Stack.Screen name="prestador" component={Prestador} />
            <Stack.Screen name="RecuperarSenhaCliente" component={RecuperarSenhaCliente} />
            <Stack.Screen name="RecuperarSenhaPrestador" component={RecuperarSenhaPrestador} />
            <Stack.Screen name="PaginaLicenca" component={PaginaLicenca} />
          </>
        ) : (userData.tipo === "prestador" || userData.tipo_usuario === "PRESTADOR") ? (
          (() => {
            const isLojista = userData.subtipo === "loja" || userData.subtipo === "LOJA" ||
                             userData.tipo_prestador === "loja" || userData.tipo_prestador === "LOJA";
            console.log('É lojista?', isLojista);
            console.log('Verificando campos principais:', {
              tipo_prestador: userData.tipo_prestador
            });
            return isLojista;
          })(          ) ? (
            // LOJISTA
            <>
              <Stack.Screen name="DashLojista" component={DashLojista} initialParams={{ userData }} />
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
              <Stack.Screen name="PaginaLicenca" component={PaginaLicenca} />
            </>
          ) : (
            // PRESTADOR AUTÔNOMO
            <>
              <Stack.Screen name="AreaPrestador" component={AreaPrestador} initialParams={{ userData }} />
              <Stack.Screen name="Credenciamento" component={Credenciamento} />
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
              <Stack.Screen name="PaginaLicenca" component={PaginaLicenca} />
            </>
          )
        ) : (
          // CLIENTE
          <>
            <Stack.Screen name="dash_cliente" component={Dash_cliente} initialParams={{ userData }} />
            <Stack.Screen name="ComprarNovo" component={ComprarNovo} />
            <Stack.Screen name="ComprarUsado" component={ComprarUsado} />
            <Stack.Screen name="Configuracoes" component={Configuracoes} />
            <Stack.Screen name="Perfil" component={Perfil} />
            <Stack.Screen name="Pagamentos" component={Pagamentos} />
            <Stack.Screen name="HistoricoCliente" component={HistoricoCliente} />
            <Stack.Screen name="SobreConsertAR" component={SobreConsertAR} />
            <Stack.Screen name="Ajuda" component={Ajuda} />
            <Stack.Screen name="PropostaCliente" component={PropostaCliente} />
            <Stack.Screen name="ServicoCliente" component={ServicoCliente} />
            <Stack.Screen name="ListaPrestadores" component={ListaPrestadores} />
            <Stack.Screen name="AreaPrestador" component={AreaPrestador} />
            <Stack.Screen name="ListaChats" component={ListaChats} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            <Stack.Screen name="PaginaLicenca" component={PaginaLicenca} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
});
