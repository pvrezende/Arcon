export const API_CONFIG = {
  //BACKEND_URL: 'http://192.168.0.183:8000',
  BACKEND_URL: 'http://192.168.0.184:8000',
  PAYMENT_URL: 'http://192.168.1.247:5000',
  WS_URL: 'ws://192.168.0.184:8000',
  
  // URLs externas
  EXTERNAL: {
    VIA_CEP: 'https://viacep.com.br/ws',
    WHATSAPP: 'https://wa.me/551134567890'
  },
  

  ENDPOINTS: {
    // Autenticação e Cadastro
    LOGIN: '/login',
    CADASTRO: '/cadastro',
    
    // Dados do banco
    DADOS: '/dados',
    
    // Prestadores
    PRESTADORES: '/prestadores',
    ADD_PRESTADOR: '/add-prestador',
    SERVICOS_PRESTADOR: '/servicos-para-prestador',
    
    // Propostas
    PROPOSTAS_PRESTADORES_DISPONIVEIS: '/propostas/prestadores-disponiveis',
    PROPOSTAS_ADD: '/propostas/add',
    PROPOSTAS_SERVICOS_DISPONIVEIS: '/propostas/servicos-disponiveis',
    PROPOSTAS_PRESTADOR_ENVIA: '/propostas/add2',
    PROPOSTAS_CLIENTE_DECIDE: '/propostas/add3',
    PROPOSTAS: '/propostas',
    
    // Endpoints antigos mantidos para compatibilidade
    ADD_PROPOSTA: '/add3',
    ADD_SERVICO: '/add2',
    RECUSAR_SERVICO: '/propostas/recusar-servico',
    
    // ========== NOVOS ENDPOINTS DE CHAT (FASTAPI) ==========
    CHAT: {
      // Iniciar novo chat
      INICIAR: '/api/chats/iniciar',
      
      // Enviar mensagem
      ENVIAR_MENSAGEM: '/api/chats/mensagem',
      
      // Buscar mensagens de um chat específico
      BUSCAR_MENSAGENS: '/api/chats/{id_chat}/mensagens',
      
      // Listar todos os chats de um usuário
      LISTAR_CHATS_USUARIO: '/api/chats/usuario/{id_usuario}',
      
      // Contar mensagens não lidas de um usuário
      CONTAR_NAO_LIDAS: '/api/chats/usuario/{id_usuario}/nao-lidas',
      
      // Verificar se existe chat para uma solicitação
      VERIFICAR_CHAT: '/api/chats/verificar/{id_solicitacao}',
      
      // Buscar detalhes de um chat específico
      DETALHES_CHAT: '/api/chats/{id_chat}/detalhes'
    },
    
    // Endpoints antigos de chat (mantidos para referência)
    CHAT_CREATE: '/criar-chat',
    CHAT_CLIENTE: '/api/chats/cliente',
    CHAT_PRESTADOR: '/api/chats/prestador',
    CHAT_USER: '/api/chats/user',
    CHAT_MESSAGES: '/api/chats',
    CHAT_WS: '/ws',
    
    // Usuários
    CLIENTE: '/api/cliente',
    PRESTADOR: '/api/prestador',
    
    // Anúncios
    MEUS_ANUNCIOS: '/meus-anuncios',
    ANUNCIO: '/anuncio',
    
    // Outros serviços
    ADD_VIEW: '/add-view',
    
    // Pagamento
    INSCRICAO: '/inscricao'
  }
};

// Funções auxiliares para construir URLs
export const buildUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  let url = `${API_CONFIG.BACKEND_URL}${endpoint}`;
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, String(value));
    });
  }
  
  return url;
};

export const buildPaymentUrl = (endpoint: string): string => {
  return `${API_CONFIG.PAYMENT_URL}${endpoint}`;
};

export const buildWsUrl = (endpoint: string): string => {
  return `${API_CONFIG.WS_URL}${endpoint}`;
};

// Funções específicas para os novos endpoints de chat
export const buildChatUrl = {
  // Iniciar chat
  iniciar: () => buildUrl(API_CONFIG.ENDPOINTS.CHAT.INICIAR),
  
  // Enviar mensagem
  enviarMensagem: () => buildUrl(API_CONFIG.ENDPOINTS.CHAT.ENVIAR_MENSAGEM),
  
  // Buscar mensagens de um chat
  buscarMensagens: (idChat: number) => 
    buildUrl(API_CONFIG.ENDPOINTS.CHAT.BUSCAR_MENSAGENS, { id_chat: idChat }),
  
  // Listar chats do usuário
  listarChatsUsuario: (idUsuario: number) => 
    buildUrl(API_CONFIG.ENDPOINTS.CHAT.LISTAR_CHATS_USUARIO, { id_usuario: idUsuario }),
  
  // Contar mensagens não lidas
  contarNaoLidas: (idUsuario: number) => 
    buildUrl(API_CONFIG.ENDPOINTS.CHAT.CONTAR_NAO_LIDAS, { id_usuario: idUsuario }),
  
  // Verificar chat existente
  verificarChat: (idSolicitacao: number) => 
    buildUrl(API_CONFIG.ENDPOINTS.CHAT.VERIFICAR_CHAT, { id_solicitacao: idSolicitacao }),
  
  // Detalhes do chat
  detalhesChat: (idChat: number) => 
    buildUrl(API_CONFIG.ENDPOINTS.CHAT.DETALHES_CHAT, { id_chat: idChat })
};

// Interfaces TypeScript para os dados do chat
export interface IniciarChatRequest {
  id_solicitacao: number;
}

export interface EnviarMensagemRequest {
  id_chat: number;
  id_remetente: number;
  mensagem: string;
}

export interface Mensagem {
  id_mensagem: number;
  id_chat: number;
  id_remetente: number;
  mensagem: string;
  data_envio: string;
  lida: boolean;
  remetente_nome: string;
}

export interface Chat {
  id_chat: number;
  id_solicitacao: number;
  prestador_id: number;
  cliente_id: number;
  data_criacao: string;
  servico_descricao: string;
  mensagens_nao_lidas: number;
  ultima_mensagem?: {
    mensagem: string;
    data_envio: string;
    id_remetente: number;
  };
}

export interface DetalhesChat {
  id_chat: number;
  participantes: number[];
  total_mensagens: number;
}