// src/screens/ChatScreen.tsx (CORREÇÃO PARA PRESTADOR)
import React, { useState, useEffect, useRef } from 'react';
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
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../contexts/AuthContext';
import Navbar from '../componentes/navbar';
import Footer from '../componentes/footer';
import { API_CONFIG } from '../../configIp';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COR_PRINCIPAL = '#0284c7';
const COR_SECUNDARIA = '#0ea5e9';

interface Message {
    id_mensagem: string;
    id_chat: string;
    id_remetente: string;
    mensagem: string;
    data_envio: string;
    lida: boolean;
    remetente_nome: string;
    remetente_tipo?: 'cliente' | 'prestador'; // 🔥 NOVO: tipo do remetente
}

interface RouteParams {
    chatId: string;
    solicitacaoId?: string;
    otherUser: {
        id: string;
        name: string;
        profile_image?: string;
    };
    currentUserId: string;
    userType?: 'cliente' | 'prestador';
}

const ChatScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { userData } = useAuthContext();
    
    const { chatId, solicitacaoId, otherUser, currentUserId, userType } = route.params as RouteParams;
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [userInfo, setUserInfo] = useState(otherUser);
    const [myUserType, setMyUserType] = useState<'cliente' | 'prestador'>(userType || 'cliente');
    
    const flatListRef = useRef<FlatList>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    // 🔥 CORREÇÃO CRÍTICA: Função simplificada e robusta para detectar mensagens
    const isMyMessage = (message: Message): boolean => {
        // Se a mensagem tem informação do tipo do remetente, use isso
        if (message.remetente_tipo) {
            return message.remetente_tipo === myUserType;
        }
        
        // 🔥 CORREÇÃO PRINCIPAL: Para prestador, lógica específica
        if (myUserType === 'prestador') {
            // Opção 1: Verificar se o ID do remetente corresponde ao ID do prestador
            if (userData?.id_prestador && message.id_remetente.toString() === userData.id_prestador.toString()) {
                return true;
            }
            
            // Opção 2: Verificar se o ID do remetente corresponde ao ID do usuário (caso o prestador use id_usuario)
            if (userData?.id_usuario && message.id_remetente.toString() === userData.id_usuario.toString()) {
                return true;
            }
            
            // Opção 3: Fallback - se não é do cliente, então é minha
            if (userInfo?.id && message.id_remetente.toString() !== userInfo.id.toString()) {
                return true;
            }
            
            return false;
        }
        
        // Para cliente é mais simples
        if (myUserType === 'cliente') {
            if (userData?.id_usuario && message.id_remetente.toString() === userData.id_usuario.toString()) {
                return true;
            }
            
            // Fallback para cliente
            if (userInfo?.id && message.id_remetente.toString() !== userInfo.id.toString()) {
                return true;
            }
            
            return false;
        }
        
        // Fallback final
        return message.id_remetente.toString() === currentUserId.toString();
    };

    // 🔥 MELHORIA: Detecção automática mais precisa do tipo de usuário
    useEffect(() => {
        console.log('👤 DETECÇÃO DE USUÁRIO - INÍCIO:');
        console.log('📊 userData completo:', userData);
        console.log('🆔 currentUserId recebido:', currentUserId);
        console.log('👥 otherUser recebido:', otherUser);
        console.log('📋 userType recebido:', userType);
        
        // Se userType já foi passado, use-o
        if (userType) {
            setMyUserType(userType);
            console.log(`✅ Tipo definido pelos params: ${userType}`);
            return;
        }
        
        // Detecção automática baseada no userData
        if (userData) {
            // 🔥 CORREÇÃO: Verificação mais robusta para prestador
            const isPrestador = 
                userData.tipo_usuario === 'prestador' ||
                (userData.id_prestador && userData.id_prestador > 0) ||
                (userData.id_usuario && userData.id_prestador !== null && userData.id_prestador !== undefined);
            
            if (isPrestador) {
                setMyUserType('prestador');
                console.log('✅ Usuário detectado como PRESTADOR (automático)');
            } else {
                setMyUserType('cliente');
                console.log('✅ Usuário detectado como CLIENTE (automático)');
            }
        } else {
            // Fallback baseado no currentUserId vs otherUser
            if (otherUser?.id && currentUserId !== otherUser.id) {
                setMyUserType('prestador');
                console.log('✅ Usuário detectado como PRESTADOR (fallback)');
            } else {
                setMyUserType('cliente');
                console.log('✅ Usuário detectado como CLIENTE (fallback)');
            }
        }
        
        setUserInfo(otherUser);
    }, [otherUser, currentUserId, userType, userData]);

    // Buscar mensagens do chat - COM MELHORIAS
    const carregarMensagens = async () => {
        try {
            console.log(`📨 Carregando mensagens do chat ${chatId} como ${myUserType}`);
            
            const url = `${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.CHAT.BUSCAR_MENSAGENS.replace('{id_chat}', chatId)}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                console.log(`❌ HTTP error! status: ${response.status}`);
                return;
            }
            
            const result = await response.json();
            
            let mensagensCarregadas: Message[] = [];
            
            if (Array.isArray(result)) {
                mensagensCarregadas = result;
            } else if (result.mensagens && Array.isArray(result.mensagens)) {
                mensagensCarregadas = result.mensagens;
            } else if (result.messages && Array.isArray(result.messages)) {
                mensagensCarregadas = result.messages;
            }
            
            console.log(`✅ ${mensagensCarregadas.length} mensagens carregadas`);
            
            // 🔥 DEBUG: Log para analisar as mensagens
            mensagensCarregadas.forEach((msg, index) => {
                const isMine = isMyMessage(msg);
                console.log(`📝 Msg ${index}: "${msg.mensagem}" | Remetente: ${msg.id_remetente} | É minha: ${isMine ? 'SIM' : 'NÃO'}`);
            });
            
            // Ordena por data (mais antiga primeiro para scroll)
            const mensagensOrdenadas = mensagensCarregadas.sort((a, b) => 
                new Date(a.data_envio).getTime() - new Date(b.data_envio).getTime()
            );
            
            setMessages(mensagensOrdenadas);
            
        } catch (error) {
            console.error('❌ Erro ao carregar mensagens:', error);
        }
    };

    // Iniciar polling para atualizações
    const iniciarPolling = () => {
        pollingRef.current = setInterval(() => {
            carregarMensagens();
        }, 3000);
    };

    // Parar polling
    const pararPolling = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    };

    // Inicializar chat - ATUALIZADO
    useEffect(() => {
        console.log('🚀 Inicializando chat:', {
            chatId,
            myUserType,
            currentUserId,
            otherUserId: otherUser?.id
        });
        
        setLoading(true);
        
        carregarMensagens().finally(() => {
            setLoading(false);
        });
        
        iniciarPolling();

        return () => {
            pararPolling();
        };
    }, [chatId, myUserType]); // 🔥 ADICIONADO myUserType como dependência

    // 🔥 CORREÇÃO: Função de envio melhorada
    const enviarMensagem = async () => {
        if (!newMessage.trim() || sending) return;

        const mensagemContent = newMessage.trim();
        setNewMessage('');
        setSending(true);

        try {
            console.log('📤 Enviando mensagem como:', myUserType);
            
            const numericChatId = parseInt(chatId.toString().replace(/[^\d]/g, ''));
            
            let numericUserId: number;
            let userTypeForApi = myUserType;
            
            // 🔥 CORREÇÃO: Lógica de ID baseada no tipo de usuário
            if (myUserType === 'prestador') {
                if (userData?.id_prestador) {
                    numericUserId = parseInt(userData.id_prestador.toString());
                } else if (userData?.id_usuario) {
                    numericUserId = parseInt(userData.id_usuario.toString());
                } else {
                    numericUserId = parseInt(currentUserId.toString());
                }
            } else {
                // Cliente
                if (userData?.id_usuario) {
                    numericUserId = parseInt(userData.id_usuario.toString());
                } else {
                    numericUserId = parseInt(currentUserId.toString());
                }
            }

            if (numericChatId === 0 || numericUserId === 0) {
                throw new Error('IDs inválidos para envio da mensagem');
            }

            const payload = {
                id_chat: numericChatId,
                id_remetente: numericUserId,
                mensagem: mensagemContent,
                tipo_remetente: userTypeForApi // 🔥 NOVO: Informar o tipo do remetente
            };

            console.log('📦 Payload de envio:', payload);

            const response = await fetch(
                `${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.CHAT.ENVIAR_MENSAGEM}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            );
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Mensagem enviada com sucesso');
                
                // Recarregar mensagens após envio
                setTimeout(() => {
                    carregarMensagens();
                }, 500);
                
            } else {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

        } catch (error: any) {
            console.error('❌ Erro ao enviar mensagem:', error);
            Alert.alert(
                'Erro', 
                'Não foi possível enviar a mensagem. Tente novamente.'
            );
            
            setNewMessage(mensagemContent);
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const isMyMsg = isMyMessage(item);
        const showAvatar = !isMyMsg && shouldShowAvatar(messages, index);
        
        console.log(`💬 Renderizando mensagem ${index}:`, {
            id: item.id_mensagem,
            remetente: item.id_remetente,
            mensagem: item.mensagem,
            éMinha: isMyMsg,
            lado: isMyMsg ? 'DIREITA' : 'ESQUERDA'
        });
        
        return (
            <View style={[
                styles.messageRow,
                isMyMsg ? styles.myMessageRow : styles.otherMessageRow
            ]}>
                {/* MENSAGEM DO OUTRO USUÁRIO (ESQUERDA) */}
                {!isMyMsg && (
                    <View style={styles.otherMessageContainer}>
                        {showAvatar && (
                            <View style={styles.avatarContainer}>
                                <View style={[
                                    styles.avatar,
                                    myUserType === 'prestador' && styles.avatarCliente,
                                    myUserType === 'cliente' && styles.avatarPrestador
                                ]}>
                                    <Text style={styles.avatarText}>
                                        {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </Text>
                                </View>
                            </View>
                        )}
                        
                        <View style={styles.otherMessageContent}>
                            {showAvatar && (
                                <Text style={styles.userName}>
                                    {userInfo?.name}
                                </Text>
                            )}
                            
                            <View style={[
                                styles.messageBubble,
                                styles.otherBubble,
                                !showAvatar && styles.messageWithoutAvatar
                            ]}>
                                <Text style={styles.otherMessageText}>
                                    {item.mensagem}
                                </Text>
                            </View>
                            
                            <Text style={styles.otherMessageTime}>
                                {formatMessageTime(item.data_envio)}
                            </Text>
                        </View>
                    </View>
                )}
                
                {/* MINHA MENSAGEM (DIREITA) */}
                {isMyMsg && (
                    <View style={styles.myMessageContainer}>
                        <View style={styles.myMessageContent}>
                            <View style={[
                                styles.messageBubble,
                                styles.myBubble
                            ]}>
                                <Text style={styles.myMessageText}>
                                    {item.mensagem}
                                </Text>
                            </View>
                            
                            <Text style={styles.myMessageTime}>
                                {formatMessageTime(item.data_envio)}
                                {item.lida ? ' ✓✓' : ' ✓'}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    // 🔥 CORREÇÃO: Função shouldShowAvatar melhorada
    const shouldShowAvatar = (messages: Message[], index: number) => {
        if (index === 0) return true;
        
        const currentMessage = messages[index];
        const previousMessage = messages[index - 1];
        
        if (!previousMessage) return true;
        
        const currentIsMyMessage = isMyMessage(currentMessage);
        const previousIsMyMessage = isMyMessage(previousMessage);
        
        // Se a mensagem anterior é de um remetente diferente, mostrar avatar
        if (previousIsMyMessage !== currentIsMyMessage) {
            return true;
        }
        
        // Se são do mesmo remetente, verificar intervalo de tempo
        try {
            const currentTime = new Date(currentMessage.data_envio).getTime();
            const previousTime = new Date(previousMessage.data_envio).getTime();
            const timeDiff = (currentTime - previousTime) / (1000 * 60); // diferença em minutos
            
            return timeDiff > 5; // Mostrar avatar se diferença > 5 minutos
        } catch (e) {
            return true;
        }
    };

    const formatMessageTime = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return '--:--';
        }
    };

    // Configurar header da navegação
    useEffect(() => {
        navigation.setOptions({
            title: userInfo?.name || 'Chat',
            headerBackTitle: 'Voltar',
        });
    }, [navigation, userInfo]);

    // Rolar para baixo quando novas mensagens chegarem
    useEffect(() => {
        if (messages.length > 0 && !loading) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages, loading]);

    if (loading) {
        return (
            <View style={styles.fullContainer}>
                <Navbar />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COR_PRINCIPAL} />
                    <Text style={styles.loadingText}>Carregando conversa...</Text>
                </View>
                <Footer />
            </View>
        );
    }

    return (
        <View style={styles.fullContainer}>
            <Navbar />
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color="#1e40af" />
                <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
            
            <KeyboardAvoidingView 
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Header do Chat */}
                <View style={styles.chatHeader}>
                    <View style={styles.userInfo}>
                        <View style={[
                            styles.headerAvatar,
                            myUserType === 'prestador' && styles.headerAvatarCliente,
                            myUserType === 'cliente' && styles.headerAvatarPrestador
                        ]}>
                            <Text style={styles.headerAvatarText}>
                                {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <View style={styles.userDetails}>
                            <Text style={styles.userNameHeader}>{userInfo?.name}</Text>
                            <View style={styles.connectionInfo}>
                                <View style={[
                                    styles.statusIndicator,
                                    styles.connected
                                ]} />
                                <Text style={styles.statusText}>
                                    {myUserType === 'prestador' ? 'Cliente' : 'Prestador'} • Online
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
                    keyExtractor={(item) => item.id_mensagem?.toString() || `msg-${item.data_envio}-${Math.random()}`}
                    style={styles.messagesList}
                    contentContainerStyle={styles.messagesContent}
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

                {/* Input de mensagem */}
                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.textInput}
                            value={newMessage}
                            onChangeText={setNewMessage}
                            placeholder="Digite sua mensagem..."
                            placeholderTextColor="#94a3b8"
                            multiline
                            maxLength={500}
                            editable={!sending}
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
                    <Text style={styles.charCount}>
                        {newMessage.length}/500
                    </Text>
                </View>
            </KeyboardAvoidingView>
            
            <Footer />
        </View>
    );
};

// Os estyles permanecem os mesmos...
const styles = StyleSheet.create({
    fullContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
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
    headerAvatarCliente: {
        backgroundColor: '#10b981',
    },
    headerAvatarPrestador: {
        backgroundColor: '#f59e0b',
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
    },
    messageRow: {
        marginBottom: 16,
        width: '100%',
    },
    myMessageRow: {
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
    },
    otherMessageRow: {
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    myMessageContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '100%',
    },
    otherMessageContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        width: '100%',
    },
    myMessageContent: {
        maxWidth: '80%',
        alignItems: 'flex-end',
    },
    otherMessageContent: {
        maxWidth: '80%',
        flex: 1,
        flexDirection: 'column',
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
    avatarCliente: {
        backgroundColor: '#10b981',
    },
    avatarPrestador: {
        backgroundColor: '#f59e0b',
    },
    avatarText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
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
        marginLeft: 40,
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
    myMessageTime: {
        fontSize: 11,
        color: '#64748b',
        textAlign: 'right',
        marginRight: 8,
    },
    otherMessageTime: {
        fontSize: 11,
        color: '#94a3b8',
        textAlign: 'left',
        marginLeft: 8,
    },
    inputContainer: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        padding: 16,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
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
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        marginLeft: 16,
        marginBottom: 10,
    },
    backButtonText: {
        color: "#1e40af",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 6,
    },
});

export default ChatScreen;