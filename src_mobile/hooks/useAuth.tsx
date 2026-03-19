// hooks/useAuth.ts - Hook de autenticação UNIFICADO (Web + Mobile)
// Agora usa AuthContext para gerenciar estado global
import { useAuthContext } from '../contexts/AuthContext';

// Re-exportar interface para compatibilidade
export type { UserData } from '../contexts/AuthContext';

/**
 * Hook de autenticação unificado - Funciona em Web e Mobile
 * Usa AuthContext para gerenciar estado global de autenticação
 * Garante que mudanças de estado sejam propagadas automaticamente
 */
export const useAuth = () => {
  return useAuthContext();
};

