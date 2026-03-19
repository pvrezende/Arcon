/**
 * COMPONENTE DE EXEMPLO - Sistema de Autenticação Unificado
 * 
 * Este arquivo demonstra como usar o sistema de autenticação
 * que funciona tanto na web quanto no mobile.
 * 
 * VOCÊ PODE DELETAR ESTE ARQUIVO - É APENAS PARA REFERÊNCIA
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Platform } from 'react-native';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

// ============================================
// EXEMPLO 1: Usando o Hook useAuth (Recomendado)
// ============================================
export const ExemploComHook = () => {
  const { user, userData, loading, login, logout } = useAuth();

  const handleLogin = async () => {
    // Simular login
    const fakeToken = 'fake_token_12345';
    const fakeUser = {
      id: 1,
      email: 'usuario@exemplo.com',
      nome: 'João Silva',
      tipo_usuario: 'CLIENTE'
    };

    await login(fakeToken, fakeUser);
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return <Text>Carregando...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exemplo com Hook useAuth</Text>
      
      {user ? (
        <View>
          <Text>✅ Usuário autenticado</Text>
          <Text>Nome: {userData?.nome}</Text>
          <Text>Email: {userData?.email}</Text>
          <Button title="Logout" onPress={handleLogout} />
        </View>
      ) : (
        <View>
          <Text>❌ Usuário não autenticado</Text>
          <Button title="Login" onPress={handleLogin} />
        </View>
      )}
      
      <Text style={styles.platform}>
        Plataforma: {Platform.OS}
      </Text>
    </View>
  );
};

// ============================================
// EXEMPLO 2: Usando authService diretamente
// ============================================
export const ExemploComService = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    // Verificar se está autenticado
    const authenticated = await authService.isAuthenticated();
    setIsAuth(authenticated);

    if (authenticated) {
      // Pegar dados do usuário
      const user = await authService.getUser();
      setUserName(user?.nome || 'Usuário');
    }
  };

  const handleLogin = async () => {
    try {
      // Exemplo de login
      const token = 'exemplo_token_abc123';
      const user = {
        id: 1,
        email: 'teste@exemplo.com',
        nome: 'Maria Santos',
        tipo_usuario: 'PRESTADOR'
      };

      await authService.login(token, user);
      await checkAuthStatus();
      
      console.log('✅ Login realizado com sucesso!');
    } catch (error) {
      console.error('❌ Erro no login:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      await checkAuthStatus();
      console.log('✅ Logout realizado com sucesso!');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exemplo com authService</Text>
      
      <Text>Status: {isAuth ? '✅ Autenticado' : '❌ Não autenticado'}</Text>
      
      {isAuth && <Text>Usuário: {userName}</Text>}
      
      <View style={styles.buttonContainer}>
        <Button title="Login" onPress={handleLogin} />
        <Button title="Logout" onPress={handleLogout} />
        <Button title="Verificar Status" onPress={checkAuthStatus} />
      </View>
    </View>
  );
};

// ============================================
// EXEMPLO 3: Login completo com API
// ============================================
export const ExemploLoginCompleto = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    
    try {
      // Fazer requisição ao backend
      const response = await fetch('http://seu-backend.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (data.success) {
        // Salvar token e dados do usuário
        await authService.login(data.data.token, data.data.user);
        
        // Disparar evento para web (opcional)
        if (Platform.OS === 'web') {
          window.dispatchEvent(new CustomEvent('authStateChanged'));
        }
        
        console.log('✅ Login realizado com sucesso!');
        // Navegar para tela apropriada
        // navigation.navigate('Dashboard');
      } else {
        console.log('❌ Credenciais inválidas');
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Completo</Text>
      
      {/* Adicione seus inputs de email e senha aqui */}
      
      <Button 
        title={loading ? "Carregando..." : "Entrar"} 
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
};

// ============================================
// EXEMPLO 4: Pegar todos os dados de autenticação
// ============================================
export const ExemploDebug = () => {
  const [authData, setAuthData] = useState<any>(null);

  const loadAuthData = async () => {
    const data = await authService.getAuthData();
    setAuthData(data);
    console.log('📦 Dados de autenticação:', data);
  };

  useEffect(() => {
    loadAuthData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug - Dados de Autenticação</Text>
      
      <Text>Token: {authData?.token ? '✅ Presente' : '❌ Ausente'}</Text>
      <Text>User: {authData?.user ? '✅ Presente' : '❌ Ausente'}</Text>
      <Text>UserData: {authData?.userData ? '✅ Presente' : '❌ Ausente'}</Text>
      
      {authData?.user && (
        <View style={styles.debugInfo}>
          <Text>Nome: {authData.user.nome}</Text>
          <Text>Email: {authData.user.email}</Text>
          <Text>Tipo: {authData.user.tipo_usuario}</Text>
        </View>
      )}
      
      <Button title="Recarregar" onPress={loadAuthData} />
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  platform: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
  },
  buttonContainer: {
    marginTop: 15,
    gap: 10,
  },
  debugInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
});

// Exportar todos os exemplos
export default {
  ExemploComHook,
  ExemploComService,
  ExemploLoginCompleto,
  ExemploDebug,
};

