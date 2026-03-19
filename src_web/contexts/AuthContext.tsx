// contexts/AuthContext.tsx - Context de autenticação para mobile e web
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import { authService } from '../services/authService';

export interface UserData {
  id_usuario?: number;
  id?: string;
  email: string;
  nome: string;
  tipo_usuario: 'CLIENTE' | 'PRESTADOR';
  telefone?: string;
  tipo_prestador?: 'LOJA' | 'MANUAL' | 'loja' | 'manual';
  subtipo?: 'LOJA' | 'MANUAL' | 'loja' | 'manual';
  tipo?: string;
  id_prestador?: number;
  categoria_loja?: string;
  area_atuacao?: string;
  [key: string]: any;
}

interface AuthContextData {
  user: any;
  userData: UserData | null;
  loading: boolean;
  login: (token: string, userData: UserData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar autenticação salva
  const loadStoredAuth = useCallback(async () => {
    try {
      const { token, user: storedUser } = await authService.getAuthData();

      if (token && storedUser) {
        console.log('✅ Usuário autenticado encontrado:', storedUser.nome);
        setUser({ uid: storedUser.id_usuario || storedUser.id });
        setUserData(storedUser);
      } else {
        console.log('ℹ️ Nenhum usuário autenticado');
        setUser(null);
        setUserData(null);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar autenticação:', error);
      setUser(null);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Inicializar autenticação ao montar
  useEffect(() => {
    loadStoredAuth();
    
    // Listener para mudanças (apenas web)
    if (Platform.OS === 'web') {
      const handleStorageChange = () => {
        console.log('🔄 Storage alterado, recarregando auth...');
        loadStoredAuth();
      };
      
      window.addEventListener('authStateChanged', handleStorageChange);
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('authStateChanged', handleStorageChange);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [loadStoredAuth]);

  // Login - Salva e atualiza estado em tempo real
  const login = useCallback(async (token: string, newUserData: UserData): Promise<boolean> => {
    try {
      console.log('🔐 Fazendo login:', newUserData.nome, '- Platform:', Platform.OS);
      
      // Salvar usando authService (funciona em web e mobile)
      await authService.login(token, newUserData, newUserData);

      // Atualizar estado IMEDIATAMENTE - navegação automática
      setUser({ uid: newUserData.id_usuario || newUserData.id });
      setUserData(newUserData);
      
      // Disparar evento (apenas web)
      if (Platform.OS === 'web') {
        window.dispatchEvent(new CustomEvent('authStateChanged'));
      }
      
      console.log('✅ Login bem-sucedido! Redirecionando...');
      return true;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      return false;
    }
  }, []);

  // Logout - Limpa e atualiza estado em tempo real
  const logout = useCallback(async () => {
    try {
      console.log('🚪 Fazendo logout...');
      
      // Limpar usando authService
      await authService.logout();

      // Atualizar estado IMEDIATAMENTE - volta para tela de login
      setUser(null);
      setUserData(null);
      
      // Disparar evento e recarregar (apenas web)
      if (Platform.OS === 'web') {
        window.dispatchEvent(new CustomEvent('authStateChanged'));
        setTimeout(() => window.location.reload(), 100);
      }
      
      console.log('✅ Logout bem-sucedido!');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    }
  }, []);

  // Refresh manual da autenticação
  const refreshAuth = useCallback(async () => {
    console.log('🔄 Atualizando estado de autenticação...');
    await loadStoredAuth();
  }, [loadStoredAuth]);

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto de autenticação
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

