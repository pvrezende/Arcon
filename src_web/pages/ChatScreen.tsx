// src/screens/ChatScreen.tsx (VERSÃO CORRIGIDA)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import Navbar from '../componentes/navbar';
import Footer from '../componentes/footer';
import Navegacao from '../componentes/Navegacao';
import { API_CONFIG } from '../../configIp';
import { authService } from '../services/authService';
import AgendamentoComponent from '../componentes/Chat/Agendamento/Agendamento';
import AgendamentoButtons from '../componentes/Chat/Agendamento/AgendamentoButtons';

const COR_PRINCIPAL = '#0284c7';
const COR_SECUNDARIA = '#0ea5e9';

interface Message {
    id_mensagem: number;
    id_chat: number;
    id_remetente: number;
    mensagem: string;
    data_envio: string;
    lida: boolean;
    tipo?: 'mensagem' | 'agendamento';
    agendamento?: {
        data: string;
        horario: string;
        status?: 'pendente' | 'aceito' | 'recusado' | 'confirmado' | 'recusado_pelo_prestador' | string;
        observacoes?: string;
        id_agendamento?: number;
        id_prestador?: number;
        id_usuario?: number;
    };
}

interface RouteParams {
    chatId: number;
    otherUser: {
        id: number;
        name: string;
        profile_image?: string;
    };
    currentUserId: number;
}

const ChatScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { chatId, otherUser, currentUserId } = route.params as RouteParams;
    
    // Debug dos parâmetros recebidos
    console.log('🔍 ChatScreen - Parâmetros recebidos:', {
        chatId,
        currentUserId,
        otherUser
    });

    

    // Validação dos parâmetros obrigatórios
    if (!chatId || chatId <= 0) {
        console.error('❌ ChatScreen - chatId inválido:', chatId);
        return (
            <View style={styles.fullContainer}>
                <Navbar />
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>Erro: ID do chat inválido</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.retryButtonText}>Voltar</Text>
                    </TouchableOpacity>
                </View>
                <Footer />
            </View>
        );
    }

    if (!currentUserId || currentUserId <= 0) {
        console.error('❌ ChatScreen - currentUserId inválido:', currentUserId);
        return (
            <View style={styles.fullContainer}>
                <Navbar />
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>Erro: ID do usuário inválido</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.retryButtonText}>Voltar</Text>
                    </TouchableOpacity>
                </View>
                <Footer />
            </View>
        );
    }
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const [userInfo, setUserInfo] = useState(otherUser);
    const [chatClienteId, setChatClienteId] = useState<number | null>(null);
    const [chatPrestadorId, setChatPrestadorId] = useState<number | null>(null);
    
    const ws = useRef<WebSocket | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const reconnectAttempts = useRef<number>(0);
    const maxReconnectAttempts = 3; // Máximo de 3 tentativas

    // Função para lidar com criação de agendamento
    const handleAgendamentoCriado = (agendamento: { data: string, horario: string, observacoes?: string, id_agendamento?: number, status?: string }) => {
        console.log('📅 Agendamento criado com sucesso:', agendamento);
        
        const { data, horario, observacoes, id_agendamento, status } = agendamento;
        const mensagemTexto = `📅 Novo Agendamento\nData: ${formatDate(data)}\nHorário: ${horario}${observacoes ? `\nObservações: ${observacoes}` : ''}`;
        
        // Criar mensagem especial com tipo agendamento
        const messageId = Date.now();
        const novaMensagem = {
            id_mensagem: messageId,
            id_chat: chatId,
            id_remetente: currentUserId,
            mensagem: mensagemTexto,
            data_envio: new Date().toISOString(),
            lida: false,
            tipo: 'agendamento' as const,
            agendamento: {
                data,
                horario,
                status: status || 'pendente',
                observacoes,
                id_agendamento,
                id_prestador: otherUser?.id || chatPrestadorId || undefined, // IMPORTANTE: ID do prestador para botões
                id_usuario: currentUserId // ID do cliente
            }
        };

        // Adicionar mensagem ao estado local
        setMessages(prev => [...prev, novaMensagem]);
        
        // Roll para o final
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        return `${date.getDate()} de ${meses[date.getMonth()]}`;
    };

    const enviarMensagemComTipo = async (mensagem: string, tipo: string, agendamento?: any) => {
        try {
            // Salvar no localStorage para persistência
            const storageKey = `mensagens_chat_${chatId}`;
            const storedMessages = localStorage.getItem(storageKey);
            const messagesArray = storedMessages ? JSON.parse(storedMessages) : [];
            
            // Usar o mesmo ID da mensagem criada acima
            const now = Date.now();
            const novaMensagem = {
                id_mensagem: now,
                id_chat: chatId,
                id_remetente: currentUserId,
                mensagem,
                data_envio: new Date().toISOString(),
                lida: false,
                tipo,
                agendamento
            };
            
            messagesArray.push(novaMensagem);
            localStorage.setItem(storageKey, JSON.stringify(messagesArray));
            
            console.log('💾 Mensagem com agendamento salva no localStorage:', novaMensagem);
            
            // Disparar evento para atualizar outras abas
            if (Platform.OS === 'web' && typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('agendamentoCriado', { detail: novaMensagem }));
            }
        } catch (error) {
            console.error('Erro ao salvar mensagem:', error);
        }
    };

    // Função para buscar nome do usuário
    const buscarNomeUsuario = async (userId: number) => {
        console.log('🔍 ChatScreen - Buscando dados para UID:', userId);

        // Primeiro tenta buscar dados reais do usuário logado do authService
        const { user, userData } = await authService.getAuthData();
        const currentUserId = userData?.id_usuario || user?.id_usuario || userData?.id || user?.id;
        
        // Se for o usuário logado, pega do authService
        if (currentUserId && parseInt(currentUserId) === userId) {
            const nome = userData?.nome || user?.nome || userData?.name || user?.name || userData?.email?.split('@')[0] || 'Usuário';
            console.log('✅ ChatScreen - Usuário logado encontrado:', nome);
            return nome;
        }

        // Tenta buscar no backend usando a rota do chat.controller
        try {
            console.log(`📡 ChatScreen - Buscando usuário: ${API_CONFIG.BACKEND_URL}/api/usuario/${userId}`);
            const usuarioResponse = await fetch(`${API_CONFIG.BACKEND_URL}/api/usuario/${userId}`);
            if (usuarioResponse.ok) {
                const usuarioData = await usuarioResponse.json();
                console.log('📊 ChatScreen - Resposta usuário:', usuarioData);
                
                if (usuarioData.success && usuarioData.data && usuarioData.data.name) {
                    console.log('✅ ChatScreen - Usuário encontrado:', usuarioData.data.name);
                    return usuarioData.data.name;
                }
            }
        } catch (error) {
            console.log('❌ ChatScreen - Erro ao buscar usuário:', error);
        }

        // Fallback final - usa parte do ID como identificador
        const nomeGerado = `Usuario_${userId.toString().substring(0, 8)}`;
        console.log('⚠️ ChatScreen - Usando nome gerado:', nomeGerado);
        
        return nomeGerado;
    };

    // Carregar nome do usuário
    useEffect(() => {
        const loadUserName = async () => {
            if (otherUser?.id) {
                // Se o nome já vem no otherUser, usa diretamente
                if (otherUser.name && otherUser.name !== 'Carregando...') {
                    console.log('✅ ChatScreen - Usando nome do otherUser:', otherUser.name);
                    setUserInfo(otherUser);
                } else {
                    // Fallback: busca o nome via API
                    const nome = await buscarNomeUsuario(otherUser.id);
                    setUserInfo({
                        ...otherUser,
                        name: nome
                    });
                }
            }
        };
        loadUserName();
    }, [otherUser?.id]);

    // Configurar WebSocket para comunicação em tempo real
    useEffect(() => {
        connectWebSocket();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [chatId, currentUserId]);

    // Monitorar mudanças no estado messages
    useEffect(() => {
        console.log('🔄 Estado messages atualizado:', messages.length, 'mensagens');
        
        // Validação simples
        if (!messages || !Array.isArray(messages)) {
            console.error('❌ Messages não é um array válido!', messages);
        }
    }, [messages]);

    const connectWebSocket = () => {
        try {
            // Conecta ao WebSocket do backend FastAPI
            const wsUrl = `${API_CONFIG.WS_URL}/api/chats/ws/chat/${chatId}`;
            console.log('🔗 Conectando WebSocket:', wsUrl);
            
            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                console.log('✅ WebSocket conectado');
                setWsConnected(true);
                
                // Carrega mensagens existentes apenas se ainda não foram carregadas
                if (messages.length === 0) {
                    carregarMensagens();
                }
            };

            ws.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('📩 Mensagem WebSocket recebida:', data);

                    if (data.type === 'agendamento_criado') {
                        // Processar agendamento criado - mensagem automática para o prestador
                        console.log('📅 Agendamento criado recebido via WebSocket:', data.agendamento);
                        
                        if (!data.agendamento) {
                            console.log('⚠️ Agendamento inválido recebido');
                            return;
                        }

                        const agendamento = data.agendamento;
                        const dataHora = new Date(agendamento.data_hora);
                        const horario = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                        const dataFormatada = formatDate(agendamento.data_hora);
                        
                        // FALLBACK: Encontrar id_prestador mesmo se não vier do backend
                        const idPrestadorWs = agendamento.id_prestador || 
                                               agendamento.prestador_id || 
                                               (agendamento.id_usuario !== currentUserId ? otherUser?.id : undefined);
                        
                        console.log('🔍 WebSocket - id_prestador identificado:', idPrestadorWs);

                        // Criar mensagem tipo agendamento
                        const agendamentoMsg = {
                            id_mensagem: agendamento.id_agendamento,
                            id_chat: chatId,
                            id_remetente: agendamento.id_usuario, // ID do cliente que criou
                            mensagem: `📅 Novo Agendamento\nData: ${dataFormatada}\nHorário: ${horario}${agendamento.observacao ? `\nObservações: ${agendamento.observacao}` : ''}`,
                            data_envio: agendamento.created_at || new Date().toISOString(),
                            lida: false,
                            tipo: 'agendamento' as const,
                            agendamento: {
                                data: agendamento.data_hora?.split('T')[0],
                                horario: horario,
                                status: agendamento.status || 'pendente',
                                observacoes: agendamento.observacao,
                                id_agendamento: agendamento.id_agendamento,
                                id_prestador: idPrestadorWs, // CRÍTICO: ID do prestador com fallback
                                id_usuario: agendamento.id_usuario // ID do cliente
                            }
                        };

                        setMessages(prev => {
                            if (!prev || !Array.isArray(prev)) {
                                return [agendamentoMsg];
                            }
                            
                            // Evita duplicatas
                            const hasDuplicate = prev.some(msg => 
                                msg.tipo === 'agendamento' && 
                                msg.agendamento?.id_agendamento === agendamento.id_agendamento
                            );
                            
                            if (hasDuplicate) {
                                console.log('⚠️ Agendamento duplicado detectado, ignorando');
                                return prev;
                            }
                            
                            console.log('✅ Adicionando agendamento ao chat via WebSocket');
                            return [...prev, agendamentoMsg];
                        });

                        setTimeout(() => {
                            flatListRef.current?.scrollToEnd({ animated: true });
                        }, 100);
                    } else if (data.type === 'new_message') {
                        // Nova mensagem em tempo real - formato do backend
                        // O backend envia os dados diretamente no objeto principal, não em data.message
                        const newMsg = {
                            id_mensagem: data.id_mensagem,
                            id_chat: data.id_chat,
                            id_remetente: data.id_remetente,
                            mensagem: data.mensagem,
                            data_envio: data.data_envio,
                            lida: data.lida,
                            remetente_nome: data.remetente_nome
                        };
                        
                        // Validação da nova mensagem
                        if (!newMsg || !newMsg.id_mensagem) {
                            console.log('⚠️ Nova mensagem inválida recebida:', newMsg);
                            return;
                        }
                        
                        console.log('📩 Processando nova mensagem via WebSocket:', newMsg);
                        
                        setMessages(prev => {
                            // Validação de segurança
                            if (!prev || !Array.isArray(prev)) {
                                console.log('⚠️ prev messages inválido, inicializando array');
                                return [newMsg];
                            }
                            
                            // Evita duplicatas - validação mais robusta
                            const hasDuplicate = prev.some(msg => {
                                if (!msg || !msg.id_mensagem || !newMsg || !newMsg.id_mensagem) {
                                    return false;
                                }
                                return msg.id_mensagem === newMsg.id_mensagem;
                            });
                            
                            if (hasDuplicate) {
                                console.log('⚠️ Mensagem duplicada detectada, ignorando');
                                return prev;
                            }
                            console.log('✅ Adicionando nova mensagem ao estado via WebSocket');
                            return [...prev, newMsg];
                        });
                        
                        // Rola para a última mensagem
                        setTimeout(() => {
                            flatListRef.current?.scrollToEnd({ animated: true });
                        }, 100);
                    } else if (data.type === 'agendamento_status_updated') {
                        // Atualização de status de agendamento em tempo real
                        const agendamentoUpdate = data.agendamento;
                        if (!agendamentoUpdate || !agendamentoUpdate.id_agendamento) {
                            return;
                        }

                        // Atualizar o status no agendamento existente
                        const novasMensagens = messages.map(msg => {
                            if (msg.tipo === 'agendamento' && 
                                msg.agendamento && 
                                msg.agendamento.id_agendamento === agendamentoUpdate.id_agendamento) {
                                return { 
                                    ...msg, 
                                    agendamento: { 
                                        ...msg.agendamento, 
                                        status: agendamentoUpdate.status 
                                    } 
                                } as Message;
                            }
                            return msg;
                        });
                        
                        setMessages(novasMensagens);
                    } else if (data.type === 'connection_established') {
                        console.log('✅ Conexão WebSocket estabelecida');
                    }
                } catch (error) {
                    console.error('❌ Erro ao processar mensagem WebSocket:', error);
                }
            };

            ws.current.onerror = (error) => {
                console.error('❌ Erro WebSocket:', error);
                setWsConnected(false);
            };

            ws.current.onclose = (event) => {
                console.log('🔴 WebSocket desconectado:', event.code, event.reason);
                setWsConnected(false);
                
                // Tenta reconectar após 3 segundos
                setTimeout(() => {
                    console.log('🔄 Tentando reconectar WebSocket...');
                    connectWebSocket();
                }, 3000);
            };

        } catch (error) {
            console.error('❌ Erro ao conectar WebSocket:', error);
        }
    };

    const carregarMensagens = async () => {
        try {
            console.log('📨 Carregando mensagens do chat:', chatId);
            
            // Validação de segurança
            if (!chatId || chatId <= 0) {
                console.error('❌ chatId inválido:', chatId);
                setMessages([]);
                setLoading(false);
                return;
            }
            
            let mensagensArray: Message[] = [];
            
            // Carregar mensagens do backend (incluindo agendamentos)
            try {
                const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/chats/${chatId}/mensagens`);
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('📊 Resposta do backend:', result);
                    
                    // O backend retorna timeline que combina mensagens e agendamentos
                    let backendMessages = null;
                    if (result.timeline && Array.isArray(result.timeline)) {
                        // Usar timeline que já combina mensagens e agendamentos ordenados por data
                        backendMessages = result.timeline;
                        console.log(`✅ ${backendMessages.length} itens na timeline (mensagens + agendamentos)`);
                    } else if (result.mensagens && Array.isArray(result.mensagens)) {
                        // Fallback: usar apenas mensagens se timeline não existir
                        backendMessages = result.mensagens;
                        console.log(`✅ ${backendMessages.length} mensagens do backend`);
                    } else if (Array.isArray(result)) {
                        backendMessages = result;
                    }
                    
                    // Convert timeline items to messages format
                    if (backendMessages && Array.isArray(backendMessages)) {
                        mensagensArray = backendMessages.map((item: any) => {
                            // Se for agendamento, converter para formato de mensagem
                            if (item.type === 'agendamento') {
                                const data = new Date(item.data_hora);
                                const horario = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                                const dataFormatada = formatDate(item.data_hora);
                                
                                // DEBUG: Ver o que está vindo do backend
                                console.log('🔍 Agendamento backend - item completo:', item);
                                console.log('🔍 Campos disponíveis:', {
                                    id_prestador: item.id_prestador,
                                    prestador_id: item.prestador_id,
                                    id_usuario: item.id_usuario,
                                    currentUserId,
                                    otherUserId: otherUser?.id
                                });
                                
                                // FALLBACK: Tentar encontrar o ID do prestador de várias formas
                                const idPrestador = item.id_prestador || 
                                                    item.prestador_id || 
                                                    (item.id_usuario !== currentUserId ? otherUser?.id : undefined);
                                
                                console.log('✅ ID Prestador identificado:', idPrestador);
                                
                                return {
                                    id_mensagem: item.id_agendamento,
                                    id_chat: item.id_chat,
                                    id_remetente: item.id_usuario || currentUserId, // ID do cliente que criou o agendamento
                                    mensagem: `📅 Novo Agendamento\nData: ${dataFormatada}\nHorário: ${horario}${item.observacao ? `\nObservações: ${item.observacao}` : ''}`,
                                    data_envio: item.created_at || item.timestamp,
                                    lida: false,
                                    tipo: 'agendamento',
                                    agendamento: {
                                        data: item.data_hora?.split('T')[0],
                                        horario: horario,
                                        status: item.status,
                                        observacoes: item.observacao,
                                        id_agendamento: item.id_agendamento,
                                        id_prestador: idPrestador, // IMPORTANTE: id_prestador com fallback
                                        id_usuario: item.id_usuario // ID do cliente
                                    }
                                };
                            } else {
                                // É uma mensagem normal
                                return {
                                    id_mensagem: item.id_mensagem,
                                    id_chat: item.id_chat,
                                    id_remetente: item.id_remetente,
                                    mensagem: item.mensagem,
                                    data_envio: item.data_envio || item.timestamp,
                                    lida: item.lida
                                };
                            }
                        });
                        console.log(`✅ ${mensagensArray.length} itens processados do backend`);
                    }
                }
            } catch (error) {
                console.error('❌ Erro ao carregar do backend:', error);
            }
            
            // DEFINIR AS MENSAGENS
            if (mensagensArray && mensagensArray.length > 0) {
                console.log(`✅ Total de ${mensagensArray.length} mensagens carregadas`);
                // Ordenar por data
                mensagensArray.sort((a: Message, b: Message) => {
                    return new Date(a.data_envio).getTime() - new Date(b.data_envio).getTime();
                });
                setMessages(mensagensArray as Message[]);
            } else {
                console.log('⚠️ Nenhuma mensagem encontrada');
                setMessages([]);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar mensagens:', error);
            console.log('⚠️ Mantendo mensagens existentes devido ao erro');
        } finally {
            setLoading(false);
        }
    };

    const enviarMensagem = async () => {
        if (!newMessage.trim() || sending) return;

        const mensagemContent = newMessage.trim();
        
        console.log('📤 Enviando mensagem com parâmetros:', {
            id_chat: chatId,
            id_remetente: currentUserId,
            mensagem: mensagemContent
        });

        setNewMessage('');
        setSending(true);

        try {
            // Envia mensagem via API REST do backend FastAPI
            const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/chats/mensagem`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_chat: chatId,
                    id_remetente: currentUserId,
                    mensagem: mensagemContent
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Resposta do servidor:', response.status, errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Mensagem enviada via API:', result);

            // Não precisa recarregar mensagens - o WebSocket vai atualizar automaticamente
            console.log('✅ Mensagem enviada com sucesso. Aguardando atualização via WebSocket...');

        } catch (error) {
            console.error('❌ Erro ao enviar mensagem:', error);
            
            // Restaura a mensagem em caso de erro
            setNewMessage(mensagemContent);
            
            // Mostra erro para o usuário
            Alert.alert(
                'Erro ao Enviar', 
                'Não foi possível enviar a mensagem. Verifique sua conexão e tente novamente.'
            );
        } finally {
            setSending(false);
        }
    };

    const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => {
        // Validação de segurança
        if (!item) {
            return null;
        }
        
        const isMyMessage = item.id_remetente === currentUserId;
        const showAvatar = !isMyMessage && shouldShowAvatar(messages, index);
        
        return (
            <View style={[
                styles.messageContainer,
                isMyMessage ? styles.myMessage : styles.otherMessage
            ]}>
                {showAvatar && (
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </Text>
                        </View>
                    </View>
                )}
                
                <View style={styles.messageContent}>
                    {showAvatar && (
                        <Text style={styles.userName}>
                            {userInfo?.name}
                        </Text>
                    )}
                    
                    <View style={[
                        styles.messageBubble,
                        isMyMessage ? styles.myBubble : styles.otherBubble,
                        !showAvatar && styles.messageWithoutAvatar
                    ]}>
                        {item.tipo === 'agendamento' && (
                            <Ionicons name="calendar" size={20} color={isMyMessage ? '#fff' : '#0284c7'} style={{ marginBottom: 8 }} />
                        )}
                        <Text style={[
                            styles.messageText,
                            isMyMessage ? styles.myMessageText : styles.otherMessageText
                        ]}>
                            {item.mensagem || 'Mensagem não disponível'}
                        </Text>
                        
                        {/* Botões de aceitar/recusar para prestador */}
                       {/* Botões de aceitar/recusar para prestador */}
{item.tipo === 'agendamento' && item.agendamento && (
    <AgendamentoButtons
        agendamento={item.agendamento}
        messageId={item.id_mensagem}
        idPrestador={otherUser?.id} // ← IMPORTANTE: Passar o ID do prestador explicitamente
        currentUserId={currentUserId}
        chatId={chatId} // ← NOVO: Passar chatId para envio de mensagens automáticas
        onStatusChanged={(msgId, newStatus) => {
            const novasMensagens = messages.map(msg => {
                if (msg.id_mensagem === msgId && msg.agendamento) {
                    return { 
                        ...msg, 
                        agendamento: { 
                            ...msg.agendamento, 
                            status: newStatus 
                        } 
                    };
                }
                return msg;
            }) as Message[];
            
            setMessages(novasMensagens);
        }}
    />
)}
                    </View>
                    
                    <Text style={[
                        styles.messageTime,
                        isMyMessage ? styles.myMessageTime : styles.otherMessageTime
                    ]}>
                        {formatMessageTime(item.data_envio)}
                        {isMyMessage && (
                            <Text style={styles.readStatus}>
                                {item.lida ? ' ✓✓' : ' ✓'}
                            </Text>
                        )}
                    </Text>
                </View>
            </View>
        );
    }, [currentUserId, messages]);

    const shouldShowAvatar = useCallback((messages: Message[], index: number) => {
        // Validações de segurança
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return true;
        }
        
        if (index < 0 || index >= messages.length) {
            return true;
        }
        
        if (index === 0) {
            return true;
        }
        
        const currentMessage = messages[index];
        const previousMessage = messages[index - 1];
        
        // Validações de segurança para as mensagens
        if (!currentMessage || !previousMessage) {
            return true;
        }
        
        if (!currentMessage.id_remetente || !previousMessage.id_remetente) {
            return true;
        }
        
        // Mostra avatar se a mensagem anterior for de outro usuário
        // ou se houver mais de 5 minutos entre as mensagens
        if (previousMessage.id_remetente !== currentMessage.id_remetente) {
            return true;
        }
        
        // Validação de data_envio
        if (!currentMessage.data_envio || !previousMessage.data_envio) {
            return false;
        }
        
        const currentTime = new Date(currentMessage.data_envio).getTime();
        const previousTime = new Date(previousMessage.data_envio).getTime();
        const timeDiff = (currentTime - previousTime) / (1000 * 60); // diferença em minutos
        
        return timeDiff > 5;
    }, []);

    const formatMessageTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    // Configurar header da navegação
    useEffect(() => {
        navigation.setOptions({
            title: userInfo?.name || 'Chat',
            headerBackTitle: 'Voltar',
            headerStyle: {
                backgroundColor: COR_PRINCIPAL,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: '600',
            },
        });
    }, [navigation, userInfo]);

    console.log('🎬 ChatScreen renderizando - loading:', loading, 'messages.length:', messages.length);
    
    if (loading) {
        return (
            <View style={styles.fullContainer}>
                <Navbar />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COR_PRINCIPAL} />
                    <Text style={styles.loadingText}>Carregando chat...</Text>
                </View>
                <Footer />
            </View>
        );
    }

    // Validação adicional para evitar renderização com dados inválidos
    if (!chatId || chatId <= 0) {
        return (
            <View style={styles.fullContainer}>
                <Navbar />
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>Erro: ID do chat inválido</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.retryButtonText}>Voltar</Text>
                    </TouchableOpacity>
                </View>
                <Footer />
            </View>
        );
    }

    console.log('🎯 Iniciando renderização do chat principal');
    
    return (
        <View style={styles.fullContainer}>
            <Navbar />
            <Navegacao 
                items={[
                    { label: 'PaginaInicial', onPress: () => navigation.navigate('dash_cliente') },
                    { label: 'Conversas', onPress: () => navigation.goBack() },
                    { label: userInfo?.name || 'Chat', isActive: true }
                ]}
            />
            
            <View style={styles.chatWrapper}>
                <KeyboardAvoidingView 
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                    {/* Header do Chat */}
                    <View style={styles.chatHeader}>
                    <View style={styles.userInfo}>
                        <View style={styles.headerAvatar}>
                            <Text style={styles.headerAvatarText}>
                                {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <View style={styles.userDetails}>
                            <Text style={styles.userNameHeader}>{userInfo?.name}</Text>
                            <View style={styles.connectionInfo}>
                                <View style={[
                                    styles.statusIndicator,
                                    wsConnected ? styles.connected : styles.disconnected
                                ]} />
                                <Text style={styles.statusText}>
                                    {wsConnected ? 'Online' : 'Offline'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Lista de mensagens */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item, index) => item?.id_mensagem?.toString() || `message_${index}`}
                    style={styles.messagesList}
                    contentContainerStyle={styles.messagesContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="chatbubble-ellipses-outline" size={60} color="#cbd5e1" />
                            <Text style={styles.emptyStateText}>Nenhuma mensagem ainda</Text>
                            <Text style={styles.emptyStateSubtext}>
                                Envie a primeira mensagem para iniciar a conversa
                            </Text>
                        </View>
                    }
                />

                {/* Input de mensagem com agendamento */}
                <View style={styles.inputContainer}>
                    <View style={styles.inputWithAgendamento}>
                        {/* Componente de Agendamento */}
                        <AgendamentoComponent 
                            chatId={chatId}
                            otherUserId={otherUser?.id}
                            userId={currentUserId}
                            onAgendamentoCriado={handleAgendamentoCriado}
                        />
                        
                        {/* Input de mensagem */}
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.textInput}
                                value={newMessage}
                                onChangeText={setNewMessage}
                                placeholder="Digite sua mensagem..."
                                placeholderTextColor="#94a3b8"
                                multiline
                                maxLength={500}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    (!newMessage.trim() || sending) && styles.sendButtonDisabled
                                ]}
                                onPress={enviarMensagem}
                                disabled={!newMessage.trim() || sending}
                            >
                                {sending ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Ionicons name="send" size={20} color="#fff" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={styles.charCount}>
                        {newMessage.length}/500
                    </Text>
                </View>
                </KeyboardAvoidingView>
            </View>
            
            <Footer />
        </View>
    );
};

const styles = StyleSheet.create({
    fullContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    chatWrapper: {
        flex: 1,
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        width: '100%',
        maxWidth: 800,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        color: '#64748b',
        fontSize: 16,
        fontWeight: '500',
    },
    chatHeader: {
        backgroundColor: '#fff',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COR_PRINCIPAL,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerAvatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userDetails: {
        flex: 1,
    },
    userNameHeader: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    connectionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    connected: {
        backgroundColor: '#10b981',
    },
    disconnected: {
        backgroundColor: '#ef4444',
    },
    statusText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    messagesList: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
        paddingBottom: 8,
        alignItems: 'center',
    },
    messageContainer: {
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    myMessage: {
        justifyContent: 'flex-end',
    },
    otherMessage: {
        justifyContent: 'flex-start',
    },
    avatarContainer: {
        width: 32,
        marginRight: 8,
        alignItems: 'center',
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COR_SECUNDARIA,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    messageContent: {
        flex: 1,
        maxWidth: 600,
        width: '100%',
    },
    userName: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 2,
        marginLeft: 8,
        fontWeight: '500',
    },
    messageBubble: {
        padding: 12,
        borderRadius: 18,
        marginBottom: 4,
    },
    myBubble: {
        backgroundColor: COR_PRINCIPAL,
        borderBottomRightRadius: 6,
        marginLeft: 'auto',
    },
    otherBubble: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 6,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    messageWithoutAvatar: {
        marginLeft: 40, // Compensa a falta do avatar
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    myMessageText: {
        color: '#fff',
    },
    otherMessageText: {
        color: '#1e293b',
    },
    messageTime: {
        fontSize: 11,
        marginHorizontal: 8,
    },
    myMessageTime: {
        textAlign: 'right',
        color: '#64748b',
    },
    otherMessageTime: {
        textAlign: 'left',
        color: '#94a3b8',
    },
    readStatus: {
        color: COR_PRINCIPAL,
        fontWeight: 'bold',
    },
    inputContainer: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        padding: 16,
    },
    inputWithAgendamento: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        flex: 1,
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        maxHeight: 100,
        backgroundColor: '#f8fafc',
        marginRight: 12,
        fontSize: 16,
        color: '#1e293b',
        textAlignVertical: 'center',
    },
    sendButton: {
        backgroundColor: COR_PRINCIPAL,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COR_PRINCIPAL,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    sendButtonDisabled: {
        backgroundColor: '#cbd5e1',
        shadowOpacity: 0,
        elevation: 0,
    },
    charCount: {
        fontSize: 11,
        color: '#94a3b8',
        textAlign: 'right',
        marginTop: 4,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyStateText: {
        fontSize: 18,
        color: '#475569',
        marginTop: 16,
        fontWeight: '600',
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#ef4444',
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: '600',
    },
    retryButton: {
        backgroundColor: COR_PRINCIPAL,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ChatScreen;