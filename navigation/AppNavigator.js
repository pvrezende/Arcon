import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import dash_cliente from "../pages/dash_cliente";
import AreaPrestador from "../pages/areaprestador";
import Credenciamento from "../pages/Credenciamento";
import ComprarNovo from "../pages/comprarNovo/ComprarNovo";
import ComprarUsado from "../pages/ComprarUsado";
import AnunciarProduto from "../pages/anunciarProduto/AnunciarProduto";
import Perfil from "../pages/editarperfilcliente";
import Configuracoes from "../pages/Configuracoes";
import DashLojista from "../pages/dashlojista/dash_lojista";
import MeusAnuncios from "../pages/dashlojista/MeusAnuncios";
import ListaChats from "../src_web/pages/chatInterativo/ListaChats";
import ChatScreen from "../src_web/pages/ChatScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right' // Animação suave entre telas
      }}
    >
      {/* Telas principais */}
      <Stack.Screen name="dash_cliente" component={dash_cliente} />
      <Stack.Screen name="AreaPrestador" component={AreaPrestador} />
      <Stack.Screen name="Credenciamento" component={Credenciamento} />
      <Stack.Screen name="ComprarNovo" component={ComprarNovo} />
      <Stack.Screen name="ComprarUsado" component={ComprarUsado} />
      <Stack.Screen name="AnunciarProduto" component={AnunciarProduto} />
      <Stack.Screen name="Perfil" component={Perfil} />
      <Stack.Screen name="Configuracoes" component={Configuracoes} />
      <Stack.Screen name="DashLojista" component={DashLojista} />
      <Stack.Screen name="MeusAnuncios" component={MeusAnuncios} />
      
      {/* Telas de Chat - com header personalizado */}
      <Stack.Screen 
        name="ListaChats" 
        component={ListaChats}
        options={{
          headerShown: true,
          title: 'Conversas',
          headerStyle: {
            backgroundColor: '#0284c7',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="ChatScreen" 
        component={ChatScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params?.otherUser?.name || 'Chat',
          headerStyle: {
            backgroundColor: '#0284c7',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitle: 'Voltar',
        })}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;