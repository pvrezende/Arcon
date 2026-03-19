// utils/userUtils.ts
import { WebUserData } from '../hooks/useWebAuth';
import { Platform } from 'react-native';

// Helper para acessar localStorage com segurança
const safeLocalStorage = {
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
  getItem: (key: string): string | null => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }
};

export interface UserValidationResult {
  isValid: boolean;
  userType: 'CLIENTE' | 'PRESTADOR_LOJA' | 'PRESTADOR_MANUAL' | 'UNKNOWN';
  redirectPath: string;
  displayInfo: {
    name: string;
    subtitle?: string;
  };
}

/**
 * Valida e processa dados do usuário após login
 */
export const validateAndProcessUser = (userData: WebUserData): UserValidationResult => {
  if (!userData || !userData.tipo_usuario) {
    return {
      isValid: false,
      userType: 'UNKNOWN',
      redirectPath: '/Home',
      displayInfo: { name: 'Usuário' }
    };
  }

  if (userData.tipo_usuario === 'CLIENTE') {
    return {
      isValid: true,
      userType: 'CLIENTE',
      redirectPath: '/dash_cliente',
      displayInfo: {
        name: userData.nome,
        subtitle: 'Cliente'
      }
    };
  }

  if (userData.tipo_usuario === 'PRESTADOR') {
    const tipoPrestador = userData.tipo_prestador || userData.subtipo_prestador;
    
    if (tipoPrestador === 'LOJA') {
      return {
        isValid: true,
        userType: 'PRESTADOR_LOJA',
        redirectPath: '/DashLojista',
        displayInfo: {
          name: userData.nome,
          subtitle: userData.categoria_loja ? `Loja - ${userData.categoria_loja}` : 'Loja'
        }
      };
    }
    
    if (tipoPrestador === 'MANUAL') {
      return {
        isValid: true,
        userType: 'PRESTADOR_MANUAL',
        redirectPath: '/areaprestador',
        displayInfo: {
          name: userData.nome,
          subtitle: userData.area_atuacao ? `Prestador - ${userData.area_atuacao}` : 'Prestador de Serviços'
        }
      };
    }

    // Fallback para prestadores sem tipo definido
    return {
      isValid: true,
      userType: 'PRESTADOR_MANUAL',
      redirectPath: '/areaprestador',
      displayInfo: {
        name: userData.nome,
        subtitle: 'Prestador de Serviços'
      }
    };
  }

  return {
    isValid: false,
    userType: 'UNKNOWN',
    redirectPath: '/home',
    displayInfo: { name: userData.nome || 'Usuário' }
  };
};

/**
 * Salva informações específicas do usuário no localStorage
 */
export const saveUserSpecificData = (userData: WebUserData): void => {
  if (userData.tipo_usuario === 'PRESTADOR') {
    if (userData.tipo_prestador === 'LOJA' && userData.categoria_loja) {
      safeLocalStorage.setItem('categoria_loja', userData.categoria_loja);
    } else if (userData.tipo_prestador === 'MANUAL' && userData.area_atuacao) {
      safeLocalStorage.setItem('area_atuacao', userData.area_atuacao);
    }
    
    if (userData.id_prestador) {
      safeLocalStorage.setItem('id_prestador', userData.id_prestador.toString());
    }
  }
};

/**
 * Limpa dados específicos do usuário do localStorage
 */
export const clearUserSpecificData = (): void => {
  safeLocalStorage.removeItem('categoria_loja');
  safeLocalStorage.removeItem('area_atuacao');
  safeLocalStorage.removeItem('id_prestador');
};

/**
 * Verifica se o usuário é um prestador de loja
 */
export const isPrestadorLoja = (userData: WebUserData | null): boolean => {
  return userData?.tipo_usuario === 'PRESTADOR' && 
         (userData.tipo_prestador === 'LOJA' || userData.subtipo_prestador === 'LOJA');
};

/**
 * Verifica se o usuário é um prestador manual
 */
export const isPrestadorManual = (userData: WebUserData | null): boolean => {
  return userData?.tipo_usuario === 'PRESTADOR' && 
         (userData.tipo_prestador === 'MANUAL' || userData.subtipo_prestador === 'MANUAL');
};

/**
 * Verifica se o usuário é um cliente
 */
export const isCliente = (userData: WebUserData | null): boolean => {
  return userData?.tipo_usuario === 'CLIENTE';
};

/**
 * Obtém informações de exibição do usuário
 */
export const getUserDisplayInfo = (userData: WebUserData | null): { name: string; subtitle?: string } => {
  if (!userData) return { name: 'Usuário' };
  
  const validation = validateAndProcessUser(userData);
  return validation.displayInfo;
};
