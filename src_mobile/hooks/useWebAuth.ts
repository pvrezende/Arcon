// hooks/useWebAuth.ts
import { useState, useEffect } from 'react';
import { saveUserSpecificData, clearUserSpecificData } from '../utils/userUtils';

export interface WebUserData {
  id_usuario?: number;
  id?: string;
  uid?: string;
  email: string;
  nome: string;
  tipo_usuario: 'CLIENTE' | 'PRESTADOR';
  telefone?: string;
  tipo_prestador?: 'LOJA' | 'MANUAL';
  subtipo_prestador?: 'LOJA' | 'MANUAL';
  id_prestador?: number;
  categoria_loja?: string;
  area_atuacao?: string;
  [key: string]: any;
}

export const useWebAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<WebUserData | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Mapear tipo_prestador para subtipo_prestador para compatibilidade
        if (parsedUser.tipo_prestador && !parsedUser.subtipo_prestador) {
          parsedUser.subtipo_prestador = parsedUser.tipo_prestador;
        }
        
        // Garantir que o tipo_prestador seja mapeado corretamente
        if (!parsedUser.tipo_prestador && parsedUser.subtipo_prestador) {
          parsedUser.tipo_prestador = parsedUser.subtipo_prestador;
        }

        // Salvar informações específicas no localStorage para fácil acesso
        saveUserSpecificData(parsedUser);
        
        console.log('🔍 Dados do usuário carregados:', parsedUser);
        setUser({ uid: parsedUser.id || parsedUser.uid });
        setUserData(parsedUser);
        return true;
      } catch (error) {
        console.error('Erro ao parsear usuário do localStorage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setUserData(null);
      }
    }
    return false;
  };

  useEffect(() => {
    checkAuth();
    setLoading(false);

    // Listener para mudanças de autenticação
    const handleAuthStateChange = () => {
      checkAuth();
    };

    window.addEventListener('authStateChanged', handleAuthStateChange);
    window.addEventListener('storage', handleAuthStateChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange);
      window.removeEventListener('storage', handleAuthStateChange);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    clearUserSpecificData();
    setUser(null);
    setUserData(null);
    
    // Disparar evento para notificar outros componentes
    window.dispatchEvent(new CustomEvent('authStateChanged'));
    
    // Recarregar a página para garantir limpeza completa
    window.location.reload();
  };

  return { user, userData, loading, logout, checkAuth };
};
