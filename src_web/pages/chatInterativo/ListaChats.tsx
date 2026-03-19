import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Navbar from '../../componentes/navbar';
import Footer from '../../componentes/footer';
import Navegacao from '../../componentes/Navegacao';
import { API_CONFIG } from '../../../configIp';
import { authService } from '../../services/authService';

const COR_PRINCIPAL = '#0284c7';
const COR_TEXTO_SECUNDARIO = '#6c757d';
const COR_FUNDO = '#f0f4f8';

interface Chat {
    id_chat: number;
    id_solicitacao: number;
    id_cliente: number;
    id_prestador: number;
    data_criacao: string;
    ultima_mensagem?: {
        id_mensagem: number;
        id_chat: number;
        id_remetente: number;
        mensagem: string;
        data_envio: string;
        lida: boolean;
    };
    mensagens_nao_lidas?: number;
    other_user?: {
        id: number;
        name: string;
        profile_image?: string;
    };
}

interface UserInfo {
    id: number;
    name: string;
    profile_image?: string;
    tipo?: string; 
}
const ListaChats = () => {
    const navigation = useNavigation();
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [authChecked, setAuthChecked] = useState(false);

    // Função para obter userId do authService
    const getUserId = async (): Promise<number | null> => {
        try {
            const { user, userData } = await authService.getAuthData();

            // Se for prestador, usar id_prestador ao invés de id_usuario
            if (userData?.tipo_usuario === 'PRESTADOR' && userData?.id_prestador) {
                return userData.id_prestador;
            }
            const possibleSources = [
                userData?.id_usuario,  
                user?.id_usuario,      
                userData?.id,          
                user?.id,              
                user?.uid,             
                userData?.uid          
            ];

            for (const source of possibleSources) {
                if (source) {
                    const id = parseInt(source);
                    if (!isNaN(id) && id > 0) {
                        return id;
                    }
                }
            }
            return null;
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            const user = await getUserId();
            setUserId(user);
            setAuthChecked(true);
        };
        checkAuth();
    }, []);

    const fetchUserInfo = async (userId: number): Promise<UserInfo> => {
        const { user, userData } = await authService.getAuthData();
        const currentUserId = await getUserId();
        
        // Se for o usuário logado, pega do authService
        if (currentUserId === userId) {
            const nome = user?.name || user?.nome || userData?.name || user?.email?.split('@')[0] || 'Usuário';
            return {
                id: userId,
                name: nome,
                profile_image: user?.photoURL || userData?.profile_image
            };
        }

        // Tenta buscar no backend usando a rota do chat.controller
        try {
            const usuarioResponse = await fetch(`${API_CONFIG.BACKEND_URL}/api/usuario/${userId}`);
            if (usuarioResponse.ok) {
                const usuarioData = await usuarioResponse.json();
                
                if (usuarioData.success && usuarioData.data && usuarioData.data.name) {
                    return {
                        id: userId,
                        name: usuarioData.data.name,
                        profile_image: usuarioData.data.profile_image
                    };
                }
            }
        } catch (error) {
            // Error handled silently
        }
        let nomeGerado = '';
        if (userId === 1) {
            nomeGerado = 'Prestador Teste';
        } else if (userId > 100 && userId < 1100) {
            nomeGerado = `Prestador_${userId - 100}`;
        } else {
            nomeGerado = `Usuario_${userId.toString().substring(0, 8)}`;
        }
        
        return { 
            id: userId, 
            name: nomeGerado, 
            profile_image: undefined 
        };
    };

    const carregarChats = async () => {
        const currentUserId = await getUserId();
        
        if (!currentUserId) {
            Alert.alert(
                'Erro de Autenticação', 
                'Usuário não identificado. Faça login novamente.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
            setLoading(false);
            setRefreshing(false);
            return;
        }
        
        try {
            // Busca chats usando o ID correto 
            const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/chats/usuario/${currentUserId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Verifica diferentes formatos de resposta do backend
            let chatsArray = null;
            if (result.data && result.data.chats) {
                chatsArray = result.data.chats;
            } else if (result.chats) {
                chatsArray = result.chats;
            } else if (Array.isArray(result)) {
                chatsArray = result;
            }
            
            if (chatsArray && chatsArray.length > 0) {
                const chatsProcessados = await Promise.all(
                    chatsArray.map(async (chat: any) => {
                        let clienteId = null;
                        let prestadorId = null;
                        if (chat.id_cliente === true) {
                            clienteId = currentUserId;
                        } else if (typeof chat.id_cliente === 'number') {
                            clienteId = chat.id_cliente;
                        } else if (typeof chat.id_cliente === 'string' && !isNaN(parseInt(chat.id_cliente))) {
                            clienteId = parseInt(chat.id_cliente);
                        }
                        
                        // Processa id_prestador 
                        if (chat.id_prestador === true) {
                            prestadorId = currentUserId;
                        } else if (typeof chat.id_prestador === 'number') {
                            prestadorId = chat.id_prestador;
                        } else if (typeof chat.id_prestador === 'string') {
                            const timestampStr = chat.id_prestador;
                            const numericPart = timestampStr.replace(/\D/g, '').substring(0, 8);
                            if (numericPart && !isNaN(parseInt(numericPart))) {
                                prestadorId = parseInt(numericPart);
                            } 
                            else {
                                prestadorId = 1; 
                            }
                        }
                        
                        // Determina o ID do  usuário
                        let otherUserId = null;
                        if (chat.id_cliente === true && prestadorId) {
                            otherUserId = prestadorId;
                        }
                        else if (chat.id_prestador === true && clienteId) {
                            otherUserId = clienteId;
                        }
                        else if (clienteId && clienteId !== currentUserId) {
                            otherUserId = clienteId;
                        }
                        else if (prestadorId && prestadorId !== currentUserId) {
                            otherUserId = prestadorId;
                        }
                        
                        let userInfo = null;
                        if (chat.outro_participante && chat.outro_participante.nome) {
                            const otherUserId = chat.outro_participante.id || 
                                               (chat.outro_participante.tipo === 'prestador' ? 1 : 2);
                            
                            userInfo = {
                                id: otherUserId,
                                name: chat.outro_participante.nome,
                                profile_image: undefined
                            };
                        } else if (otherUserId && otherUserId > 0) {
                            userInfo = await fetchUserInfo(otherUserId);
                        } else {
                            userInfo = {
                                id: 999,
                                name: 'Usuário Desconhecido',
                                profile_image: undefined
                            };
                        }
                        
                        return {
                            ...chat,
                            other_user: userInfo
                        };
                    })
                );
                
                setChats(chatsProcessados);
            } else {
                setChats([]);
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar os chats. Tente novamente.');
            setChats([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (authChecked) {
            carregarChats();
        }
    }, [authChecked]);

    const onRefresh = () => {
        setRefreshing(true);
        carregarChats();
    };

    const formatMessageTime = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diff = now.getTime() - date.getTime();
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            
            if (days === 0) {
                return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            }
            if (days === 1) return 'Ontem';
            if (days < 7) {
                return date.toLocaleDateString('pt-BR', { weekday: 'short' });
            }
            return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        } catch (e) {
            return '--:--';
        }
    };

    const getLastMessageContent = (chat: Chat) => {
        if (chat.ultima_mensagem) {
            return chat.ultima_mensagem.mensagem;
        }
        return 'Nenhuma mensagem ainda';
    };

    const isMessageUnread = (chat: Chat) => {
        return chat.mensagens_nao_lidas && chat.mensagens_nao_lidas > 0;
    };

    const getLastMessageStyle = (chat: Chat) => {
        return isMessageUnread(chat) ? styles.unreadMessage : styles.lastMessage;
    };

    const renderChatItem = ({ item }: { item: Chat }) => {
        const handleChatPress = async () => {
            const currentUserId = await getUserId();
            
            // Validação antes da navegação
            if (!item.id_chat || item.id_chat <= 0) {
                Alert.alert('Erro', 'ID do chat inválido. Tente novamente.');
                return;
            }
            
            if (!currentUserId) {
                Alert.alert('Erro', 'ID do usuário inválido. Faça login novamente.');
                return;
            }
            
            (navigation as any).navigate('ChatScreen', {
                chatId: item.id_chat,
                otherUser: item.other_user,
                currentUserId: currentUserId
            });
        };

        return (
            <TouchableOpacity
                style={styles.chatCard}
                onPress={handleChatPress}
            >
                {item.other_user?.profile_image ? (
                    <Image source={{ uri: item.other_user.profile_image }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={26} color="#fff" />
                    </View>
                )}
                <View style={styles.chatInfo}>
                    <Text style={styles.userName}>
                        {item.other_user?.name || 'Carregando...'}
                    </Text>
                    <Text
                        style={getLastMessageStyle(item)}
                        numberOfLines={1}
                    >
                        {getLastMessageContent(item)}
                    </Text>
                </View>
                <View style={styles.chatMeta}>
                    {item.ultima_mensagem && (
                        <Text style={styles.time}>
                            {formatMessageTime(item.ultima_mensagem.data_envio)}
                        </Text>
                    )}
                    {isMessageUnread(item) && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>
                                {item.mensagens_nao_lidas}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (!authChecked || loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COR_PRINCIPAL} />
                <Text style={styles.loadingText}>
                    {!authChecked ? 'Verificando autenticação...' : 'Carregando chats...'}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Navbar />
            <Navegacao 
                items={[
                    { label: 'PaginaInicial', onPress: () => navigation.navigate('dash_cliente') },
                    { label: 'Conversas', isActive: true }
                ]}
            />
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Conversas</Text>
                    <TouchableOpacity onPress={onRefresh}>
                        <Ionicons name="refresh" size={22} color={COR_PRINCIPAL} />
                    </TouchableOpacity>
                </View>
                
                <View style={styles.listContainer}>
                    <FlatList
                        data={chats}
                        renderItem={renderChatItem}
                        keyExtractor={(item) => item.id_chat.toString()}
                        refreshControl={
                            <RefreshControl 
                                refreshing={refreshing} 
                                onRefresh={onRefresh}
                                colors={[COR_PRINCIPAL]}
                                tintColor={COR_PRINCIPAL}
                            />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="chatbubbles-outline" size={60} color={COR_TEXTO_SECUNDARIO} />
                                <Text style={styles.emptyStateText}>Nenhum chat encontrado</Text>
                                <Text style={styles.emptyStateSubtext}>
                                    Inicie uma conversa a partir de uma proposta aceita
                                </Text>
                                <TouchableOpacity 
                                    style={styles.retryButton}
                                    onPress={onRefresh}
                                >
                                    <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                                </TouchableOpacity>
                            </View>
                        }
                        contentContainerStyle={chats.length === 0 ? { flex: 1 } : null}
                    />
                </View>
            </View>
            <Footer />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COR_FUNDO,
    },
    content: {
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 8,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#dfe4ea',
        width: '100%',
        maxWidth: 800,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222',
    },
    listContainer: {
        width: '100%',
        maxWidth: 800,
        alignSelf: 'center',
    },
    chatCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginVertical: 6,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        marginRight: 12,
    },
    avatarPlaceholder: {
        width: 54,
        height: 54,
        borderRadius: 27,
        marginRight: 12,
        backgroundColor: COR_PRINCIPAL,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        marginBottom: 3,
    },
    lastMessage: {
        fontSize: 14,
        color: COR_TEXTO_SECUNDARIO,
    },
    unreadMessage: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111',
    },
    chatMeta: {
        alignItems: 'flex-end',
        minWidth: 55,
    },
    time: {
        fontSize: 12,
        color: COR_TEXTO_SECUNDARIO,
        marginBottom: 4,
    },
    unreadBadge: {
        backgroundColor: COR_PRINCIPAL,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: COR_TEXTO_SECUNDARIO,
        fontSize: 16,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: COR_TEXTO_SECUNDARIO,
        marginTop: 16,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: COR_TEXTO_SECUNDARIO,
        textAlign: 'center',
        marginTop: 6,
        paddingHorizontal: 30,
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: COR_PRINCIPAL,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default ListaChats;