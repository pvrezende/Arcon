import { API_CONFIG } from '../../configIp';

export interface AgendamentoRequest {
  id_chat: number;
  id_cliente: number;
  id_prestador: number;
  data_hora: string;
  observacao?: string;
}

export interface AgendamentoResponse {
  success: boolean;
  message: string;
  agendamento: {
    id_agendamento: number;
    id_usuario: number;
    id_prestador: number;
    data_hora: string;
    status: string;
    observacao?: string;
    id_chat: number;
    created_at: string;
    aceito_prestador: boolean | null;
    data_resposta: string | null;
  };
  status: string;
}

export interface ResponderAgendamentoRequest {
  id_agendamento: number;
  id_prestador: number;
  aceito: boolean;
  motivo_recusa?: string;
}

class AgendamentoService {
  private readonly baseUrl = `${API_CONFIG.BACKEND_URL}/api/agendamentos`;

  /**
   * Criar um novo agendamento
   */
  async criarAgendamento(data: AgendamentoRequest): Promise<AgendamentoResponse> {
    try {
      console.log('📅 Enviando agendamento para o backend:', data);
      
      const response = await fetch(`${this.baseUrl}/agendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Agendamento criado com sucesso:', result);
      
      return {
        success: true,
        ...result
      };
    } catch (error) {
      console.error('❌ Erro ao criar agendamento:', error);
      throw error;
    }
  }

  /**
   * Responder um agendamento (aceitar ou recusar)
   */
  async responderAgendamento(data: ResponderAgendamentoRequest): Promise<any> {
    try {
      console.log('📅 Respondendo agendamento:', data);
      
      const response = await fetch(`${this.baseUrl}/responder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Resposta ao agendamento enviada:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao responder agendamento:', error);
      throw error;
    }
  }

  /**
   * Listar agendamentos de um chat
   */
  async listarAgendamentosChat(idChat: number): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/${idChat}`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao listar agendamentos:', error);
      throw error;
    }
  }

  /**
   * Listar agendamentos de um cliente
   */
  async listarAgendamentosCliente(idCliente: number, status?: string): Promise<any> {
    try {
      let url = `${this.baseUrl}/cliente/${idCliente}`;
      if (status) {
        url += `?status=${status}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao listar agendamentos do cliente:', error);
      throw error;
    }
  }

  /**
   * Listar agendamentos de um prestador
   */
  async listarAgendamentosPrestador(idPrestador: number, status?: string): Promise<any> {
    try {
      let url = `${this.baseUrl}/prestador/${idPrestador}`;
      if (status) {
        url += `?status=${status}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao listar agendamentos do prestador:', error);
      throw error;
    }
  }

  /**
   * Buscar detalhes de um agendamento
   */
  async buscarAgendamento(idAgendamento: number): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/${idAgendamento}`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao buscar agendamento:', error);
      throw error;
    }
  }
}

export const agendamentoService = new AgendamentoService();
