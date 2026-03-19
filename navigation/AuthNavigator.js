import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppNavigator from "./AppNavigator";
import LoginCliente from "../pages/login/login_cli_pre/logincliente";
import Home from "../pages/home";
import Cliente from "../pages/login/cadastro/cliente";
import Prestador from "../pages/login/cadastro/prestador";
import LoginPrestador from "../pages/login/login_cli_pre/loginprestador";
import RecuperarSenhaCliente from "../pages/login/recuperacao/recuperarsenhacliente";
import RecuperarSenhaPrestador from "../pages/login/recuperacao/recuperarsenhaprestador";

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return subscriber;
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Se o usuário estiver logado, leva para a navegação principal (privada)
          <Stack.Screen name="AppNavigator" component={AppNavigator} />
        ) : (
          // Se não, leva para as telas públicas de entrada
          <Stack.Screen name="AuthStack">
            {() => (
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="logincliente" component={LoginCliente} />
                <Stack.Screen name="loginprestador" component={LoginPrestador} />
                <Stack.Screen name="cliente" component={Cliente} />
                <Stack.Screen name="prestador" component={Prestador} />
                <Stack.Screen name="RecuperarSenhaCliente" component={RecuperarSenhaCliente} />
                <Stack.Screen name="RecuperarSenhaPrestador" component={RecuperarSenhaPrestador} />
              </Stack.Navigator>
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AuthNavigator;