/**
 * safeStorage.ts - Wrapper seguro para localStorage que funciona em web e mobile
 * 
 * Use este helper ao invés de localStorage direto para evitar erros no mobile.
 * Para autenticação, prefira usar authService.
 */

import { Platform } from 'react-native';

/**
 * Wrapper seguro para localStorage que funciona em web e mobile
 */
export const safeLocalStorage = {
  /**
   * Salva um item no localStorage (apenas na web)
   */
  setItem: (key: string, value: string): void => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn(`Erro ao salvar ${key} no localStorage:`, error);
    }
  },

  /**
   * Recupera um item do localStorage (apenas na web)
   */
  getItem: (key: string): string | null => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.warn(`Erro ao recuperar ${key} do localStorage:`, error);
      return null;
    }
  },

  /**
   * Remove um item do localStorage (apenas na web)
   */
  removeItem: (key: string): void => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Erro ao remover ${key} do localStorage:`, error);
    }
  },

  /**
   * Limpa todo o localStorage (apenas na web)
   */
  clear: (): void => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
    } catch (error) {
      console.warn('Erro ao limpar localStorage:', error);
    }
  },

  /**
   * Verifica se localStorage está disponível
   */
  isAvailable: (): boolean => {
    return Platform.OS === 'web' && typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
};

/**
 * Alias para compatibilidade (use safeLocalStorage de preferência)
 */
export default safeLocalStorage;

