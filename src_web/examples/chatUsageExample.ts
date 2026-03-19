// Exemplo de como usar as novas rotas de chat do backend FastAPI
// Este arquivo serve como referência para implementar funcionalidades de chat

import { API_CONFIG } from '../../configIp';

// ========== EXEMPLOS DE USO DAS ROTAS DE CHAT ==========

// 1. INICIAR UM NOVO CHAT
export const iniciarChat = async (idSolicitacao: number) => {
    try {
        const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/chats/iniciar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id_solicitacao: idSolicitacao
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Chat iniciado:', result);
        return result.id_chat; // Retorna o ID do chat criado
    } catch (error) {
        console.error('❌ Erro ao iniciar chat:', error);
        throw error;
    }
};

// 2. ENVIAR MENSAGEM
export const enviarMensagem = async (idChat: number, idRemetente: number, mensagem: string) => {
    try {
        const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/chats/mensagem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id_chat: idChat,
                id_remetente: idRemetente,
                mensagem: mensagem
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Mensagem enviada:', result);
        return result.id_mensagem; // Retorna o ID da mensagem enviada
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        throw error;
    }
};

// 3. BUSCAR MENSAGENS DE UM CHAT
export const buscarMensagens = async (idChat: number, idUsuario?: number) => {
    try {
        let url = `${API_CONFIG.BACKEND_URL}/api/chats/${idChat}/mensagens`;
        if (idUsuario) {
            url += `?id_usuario=${idUsuario}`;
        }

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Mensagens carregadas:', result.mensagens.length);
        return result.mensagens; // Array de mensagens
    } catch (error) {
        console.error('❌ Erro ao buscar mensagens:', error);
        throw error;
    }
};

// 4. LISTAR CHATS DE UM USUÁRIO
export const listarChatsUsuario = async (idUsuario: number) => {
    try {
        const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/chats/usuario/${idUsuario}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Chats carregados:', result.chats.length);
        return result.chats; // Array de chats
    } catch (error) {
        console.error('❌ Erro ao listar chats:', error);
        throw error;
    }
};

// 5. CONTAR MENSAGENS NÃO LIDAS
export const contarMensagensNaoLidas = async (idUsuario: number) => {
    try {
        const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/chats/usuario/${idUsuario}/nao-lidas`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Mensagens não lidas:', result.total_mensagens_nao_lidas);
        return result.total_mensagens_nao_lidas; // Número total de mensagens não lidas
    } catch (error) {
        console.error('❌ Erro ao contar mensagens não lidas:', error);
        throw error;
    }
};

// 6. VERIFICAR SE EXISTE CHAT PARA UMA SOLICITAÇÃO
export const verificarChatExistente = async (idSolicitacao: number) => {
    try {
        const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/chats/verificar/${idSolicitacao}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Chat existe:', result.existe_chat);
        return result; // { existe_chat: boolean, id_chat?: number }
    } catch (error) {
        console.error('❌ Erro ao verificar chat:', error);
        throw error;
    }
};

// 7. BUSCAR DETALHES DE UM CHAT
export const buscarDetalhesChat = async (idChat: number) => {
    try {
        const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/chats/${idChat}/detalhes`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Detalhes do chat:', result);
        return result; // { id_chat: number, participantes: number[], total_mensagens: number }
    } catch (error) {
        console.error('❌ Erro ao buscar detalhes do chat:', error);
        throw error;
    }
};

// ========== EXEMPLO DE FLUXO COMPLETO ==========

// Exemplo de como usar todas as funções juntas
export const exemploFluxoCompleto = async () => {
    try {
        const idUsuario = 123;
        const idSolicitacao = 456;

        // 1. Verificar se já existe chat para esta solicitação
        const chatExistente = await verificarChatExistente(idSolicitacao);
        
        let idChat;
        if (chatExistente.existe_chat) {
            idChat = chatExistente.id_chat;
            console.log('✅ Usando chat existente:', idChat);
        } else {
            // 2. Criar novo chat se não existir
            idChat = await iniciarChat(idSolicitacao);
            console.log('✅ Novo chat criado:', idChat);
        }

        // 3. Enviar uma mensagem
        const idMensagem = await enviarMensagem(idChat, idUsuario, 'Olá! Como posso ajudar?');
        console.log('✅ Mensagem enviada com ID:', idMensagem);

        // 4. Buscar todas as mensagens do chat
        const mensagens = await buscarMensagens(idChat, idUsuario);
        console.log('✅ Mensagens do chat:', mensagens);

        // 5. Listar todos os chats do usuário
        const chats = await listarChatsUsuario(idUsuario);
        console.log('✅ Chats do usuário:', chats);

        // 6. Contar mensagens não lidas
        const naoLidas = await contarMensagensNaoLidas(idUsuario);
        console.log('✅ Mensagens não lidas:', naoLidas);

        return {
            idChat,
            idMensagem,
            mensagens,
            chats,
            naoLidas
        };

    } catch (error) {
        console.error('❌ Erro no fluxo completo:', error);
        throw error;
    }
};

// ========== INTERFACES TYPESCRIPT ==========

export interface MensagemBackend {
    id_mensagem: number;
    id_chat: number;
    id_remetente: number;
    mensagem: string;
    data_envio: string;
    lida: boolean;
    remetente_nome: string;
}

export interface ChatBackend {
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

export interface DetalhesChatBackend {
    id_chat: number;
    participantes: number[];
    total_mensagens: number;
}

export interface VerificacaoChatBackend {
    existe_chat: boolean;
    id_chat?: number;
}
