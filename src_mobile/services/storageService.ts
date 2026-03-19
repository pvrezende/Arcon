// storageService.ts - Gerenciamento unificado de storage para Web e Mobile
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Serviço de storage unificado que funciona tanto na web quanto no mobile
 * - Web: usa localStorage
 * - Mobile: usa AsyncStorage
 */
class StorageService {
  private isWeb: boolean;

  constructor() {
    this.isWeb = Platform.OS === 'web';
    
    // Verifica se localStorage está disponível no web
    if (this.isWeb) {
      this.testLocalStorage();
    }
  }

  /**
   * Testa se localStorage está disponível
   */
  private testLocalStorage(): boolean {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.warn('localStorage não está disponível, usando fallback');
      return false;
    }
  }

  /**
   * Salva um item no storage
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isWeb && typeof localStorage !== 'undefined') {
        // Web: usa localStorage
        localStorage.setItem(key, value);
      } else {
        // Mobile: usa AsyncStorage
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Erro ao salvar ${key}:`, error);
      throw error;
    }
  }

  /**
   * Recupera um item do storage
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (this.isWeb && typeof localStorage !== 'undefined') {
        // Web: usa localStorage
        return localStorage.getItem(key);
      } else {
        // Mobile: usa AsyncStorage
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error(`Erro ao recuperar ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove um item do storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (this.isWeb && typeof localStorage !== 'undefined') {
        // Web: usa localStorage
        localStorage.removeItem(key);
      } else {
        // Mobile: usa AsyncStorage
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Erro ao remover ${key}:`, error);
      throw error;
    }
  }

  /**
   * Limpa todo o storage
   */
  async clear(): Promise<void> {
    try {
      if (this.isWeb && typeof localStorage !== 'undefined') {
        // Web: usa localStorage
        localStorage.clear();
      } else {
        // Mobile: usa AsyncStorage
        await AsyncStorage.clear();
      }
    } catch (error) {
      console.error('Erro ao limpar storage:', error);
      throw error;
    }
  }

  /**
   * Salva um objeto JSON no storage
   */
  async setObject(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await this.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Erro ao salvar objeto ${key}:`, error);
      throw error;
    }
  }

  /**
   * Recupera um objeto JSON do storage
   */
  async getObject<T = any>(key: string): Promise<T | null> {
    try {
      const jsonValue = await this.getItem(key);
      if (jsonValue == null) return null;
      
      return JSON.parse(jsonValue) as T;
    } catch (error) {
      console.error(`Erro ao recuperar objeto ${key}:`, error);
      return null;
    }
  }

  /**
   * Verifica se uma chave existe no storage
   */
  async hasItem(key: string): Promise<boolean> {
    try {
      const value = await this.getItem(key);
      return value !== null;
    } catch (error) {
      console.error(`Erro ao verificar ${key}:`, error);
      return false;
    }
  }
}

// Exporta uma instância única do serviço
export const storage = new StorageService();

// Chaves constantes para o storage
export const STORAGE_KEYS = {
  TOKEN: '@app_token',
  USER: '@app_user',
  USER_DATA: '@app_userData',
  REFRESH_TOKEN: '@app_refresh_token',
  SERVICOS_RESPONDIDOS: '@servicos_respondidos',
} as const;