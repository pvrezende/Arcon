// authService.ts - Serviço de autenticação unificado
import { storage, STORAGE_KEYS } from './storageService';

/**
 * Serviço de autenticação que funciona tanto na web quanto no mobile
 */
class AuthService {
  /**
   * Salva o token de autenticação
   */
  async saveToken(token: string): Promise<void> {
    try {
      await storage.setItem(STORAGE_KEYS.TOKEN, token);
      console.log('✅ Token salvo com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar token:', error);
      throw error;
    }
  }

  /**
   * Recupera o token de autenticação
   */
  async getToken(): Promise<string | null> {
    try {
      const token = await storage.getItem(STORAGE_KEYS.TOKEN);
      return token;
    } catch (error) {
      console.error('❌ Erro ao recuperar token:', error);
      return null;
    }
  }

  /**
   * Salva os dados do usuário
   */
  async saveUser(user: any): Promise<void> {
    try {
      await storage.setObject(STORAGE_KEYS.USER, user);
      console.log('✅ Dados do usuário salvos com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar dados do usuário:', error);
      throw error;
    }
  }

  /**
   * Recupera os dados do usuário
   */
  async getUser(): Promise<any | null> {
    try {
      const user = await storage.getObject(STORAGE_KEYS.USER);
      return user;
    } catch (error) {
      console.error('❌ Erro ao recuperar dados do usuário:', error);
      return null;
    }
  }

  /**
   * Salva os dados adicionais do usuário (userData)
   */
  async saveUserData(userData: any): Promise<void> {
    try {
      await storage.setObject(STORAGE_KEYS.USER_DATA, userData);
      console.log('✅ UserData salvo com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar userData:', error);
      throw error;
    }
  }

  /**
   * Recupera os dados adicionais do usuário (userData)
   */
  async getUserData(): Promise<any | null> {
    try {
      const userData = await storage.getObject(STORAGE_KEYS.USER_DATA);
      return userData;
    } catch (error) {
      console.error('❌ Erro ao recuperar userData:', error);
      return null;
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();
      return token !== null;
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error);
      return false;
    }
  }

  /**
   * Faz logout do usuário (remove todos os dados de autenticação)
   */
  async logout(): Promise<void> {
    try {
      await storage.removeItem(STORAGE_KEYS.TOKEN);
      await storage.removeItem(STORAGE_KEYS.USER);
      await storage.removeItem(STORAGE_KEYS.USER_DATA);
      await storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      throw error;
    }
  }

  /**
   * Faz login do usuário (salva token e dados)
   */
  async login(token: string, user: any, userData?: any): Promise<void> {
    try {
      await this.saveToken(token);
      await this.saveUser(user);
      if (userData) {
        await this.saveUserData(userData);
      }
      console.log('✅ Login realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao fazer login:', error);
      throw error;
    }
  }

  /**
   * Recupera todos os dados de autenticação
   */
  async getAuthData(): Promise<{
    token: string | null;
    user: any | null;
    userData: any | null;
  }> {
    try {
      const [token, user, userData] = await Promise.all([
        this.getToken(),
        this.getUser(),
        this.getUserData(),
      ]);

      return { token, user, userData };
    } catch (error) {
      console.error('❌ Erro ao recuperar dados de autenticação:', error);
      return { token: null, user: null, userData: null };
    }
  }
}

// Exporta uma instância única do serviço
export const authService = new AuthService();