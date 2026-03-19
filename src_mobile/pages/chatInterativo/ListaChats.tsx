// src/screens/ListaChats.tsx (VERSÃO CORRIGIDA PARA PRESTADOR)
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
import { useAuthContext } from '../../contexts/AuthContext';
import Navbar from '../../componentes/navbar';
import Footer from '../../componentes/footer';
import { API_CONFIG } from '../../../configIp';

const COR_PRINCIPAL = '#0284c7';
const COR_TEXTO_SECUNDARIO = '#6c757d';
const COR_FUNDO = '#f0f4f8';

interface Chat {
    id_chat: string;
    cliente_id: string;
    prestador_id: string;
    id_solicitacao: string;
    data_criacao: string;
    ativo: boolean;
    encerrado: boolean;
    mensagens_nao_lidas: number;
    meu_tipo: string;
    servico_descricao: string;
    outro_participante: {
        id: string;
        nome: string;
        foto_perfil?: string;
        tipo?: string;
    };
    ultima_mensagem?: {
        id_mensagem?: string;
        conteudo: string;
        data_envio: string;
        enviada_por_mim: boolean;
        lida: boolean;
        tipo_mensagem?: string;
    };
}

const ListaChats = () => {
    const navigation = useNavigation();
    const { userData, loading: authLoading } = useAuthContext();
    
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // 🔥 CORREÇÃO: Função melhorada para extrair ID do prestador
    const extractUserId = (userData: any): string | null => {
        if (!userData) return null;
        
        console.log('🔍 Extraindo ID do userData:', userData);
        
        // PRIORIDADE PARA PRESTADOR: id_prestador > id_usuario > id > uid
        const possibleIds = [
            userData.id_prestador,
            userData.id_usuario, 
            userData.id,
            userData.uid
        ];
        
        for (const id of possibleIds) {
            if (id && id !== 'null' && id !== 'undefined') {
                console.log(`✅ ID encontrado: ${id}`);
                return id.toString();
            }
        }
        
        console.log('❌ Nenhum ID válido encontrado');
        return null;
    };

    useEffect(() => {
        console.log('🔄 useEffect - verificando autenticação via Context');
        console.log('📊 userData do Context:', userData);
        
        if (!authLoading) {
            if (userData) {
                // 🔥 CORREÇÃO: Usar função melhorada para extrair ID
                const uid = extractUserId(userData);
                console.log('✅ Usuário autenticado via Context - ID:', uid);
                console.log('👤 Nome:', userData.nome);
                console.log('🔧 Tipo:', userData.tipo_usuario);
                
                if (uid) {
                    setUserId(uid);
                } else {
                    console.log('❌ ID do usuário não encontrado no userData');
                    setUserId(null);
                    setLoading(false);
                }
            } else {
                console.log('❌ Nenhum usuário autenticado no Context');
                setUserId(null);
                setLoading(false);
            }
        }
    }, [userData, authLoading]);

    const carregarChats = async () => {
        if (!userId) {
            console.log('❌ userId não disponível para carregar chats');
            setLoading(false);
            setRefreshing(false);
            return;
        }
        
        try {
            console.log('📡 Buscando chats para usuário:', userId);
            
            // 🔥 CORREÇÃO: Usar a rota correta LISTAR_CHATS_USUARIO
            const url = `${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.CHAT.LISTAR_CHATS_USUARIO.replace('{id_usuario}', userId)}`;
            console.log('🌐 URL correta:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} - ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('📨 Resposta completa da API:', JSON.stringify(result, null, 2));

            // 🔥 CORREÇÃO: A API retorna os chats diretamente no array, não tem campo "success"
            if (Array.isArray(result)) {
                console.log(`✅ ${result.length} chats carregados diretamente do array`);
                
                // Mapeia os dados da API para nossa interface
                const chatsMapeados: Chat[] = result.map((chat: any) => ({
                    id_chat: chat.id_chat?.toString(),
                    cliente_id: chat.cliente_id?.toString(),
                    prestador_id: chat.prestador_id?.toString(),
                    id_solicitacao: chat.id_solicitacao?.toString(),
                    data_criacao: chat.data_criacao,
                    ativo: chat.ativo,
                    encerrado: chat.encerrado,
                    mensagens_nao_lidas: chat.mensagens_nao_lidas || 0,
                    meu_tipo: chat.meu_tipo,
                    servico_descricao: chat.servico_descricao,
                    outro_participante: {
                        id: chat.outro_participante?.id?.toString(),
                        nome: chat.outro_participante?.nome || 'Usuário',
                        foto_perfil: chat.outro_participante?.foto_perfil,
                        tipo: chat.outro_participante?.tipo
                    },
                    ultima_mensagem: chat.ultima_mensagem ? {
                        id_mensagem: chat.ultima_mensagem.id_mensagem?.toString(),
                        conteudo: chat.ultima_mensagem.conteudo,
                        data_envio: chat.ultima_mensagem.data_envio,
                        enviada_por_mim: chat.ultima_mensagem.enviada_por_mim,
                        lida: chat.ultima_mensagem.lida,
                        tipo_mensagem: chat.ultima_mensagem.tipo_mensagem
                    } : undefined
                }));

                console.log('📊 Chats mapeados:', chatsMapeados);
                
                // Ordena por última mensagem ou data de criação
                const ordenados = chatsMapeados.sort((a, b) => {
                    const tA = new Date(a.ultima_mensagem?.data_envio || a.data_criacao).getTime();
                    const tB = new Date(b.ultima_mensagem?.data_envio || b.data_criacao).getTime();
                    return tB - tA;
                });
                
                console.log(`✅ ${ordenados.length} chats ordenados`);
                setChats(ordenados);
            } else if (result.chats && Array.isArray(result.chats)) {
                // Fallback: se vier dentro de um objeto com campo "chats"
                console.log(`✅ ${result.chats.length} chats carregados do campo "chats"`);
                
                const chatsMapeados: Chat[] = result.chats.map((chat: any) => ({
                    id_chat: chat.id_chat?.toString(),
                    cliente_id: chat.cliente_id?.toString(),
                    prestador_id: chat.prestador_id?.toString(),
                    id_solicitacao: chat.id_solicitacao?.toString(),
                    data_criacao: chat.data_criacao,
                    ativo: chat.ativo,
                    encerrado: chat.encerrado,
                    mensagens_nao_lidas: chat.mensagens_nao_lidas || 0,
                    meu_tipo: chat.meu_tipo,
                    servico_descricao: chat.servico_descricao,
                    outro_participante: {
                        id: chat.outro_participante?.id?.toString(),
                        nome: chat.outro_participante?.nome || 'Usuário',
                        foto_perfil: chat.outro_participante?.foto_perfil,
                        tipo: chat.outro_participante?.tipo
                    },
                    ultima_mensagem: chat.ultima_mensagem ? {
                        id_mensagem: chat.ultima_mensagem.id_mensagem?.toString(),
                        conteudo: chat.ultima_mensagem.conteudo,
                        data_envio: chat.ultima_mensagem.data_envio,
                        enviada_por_mim: chat.ultima_mensagem.enviada_por_mim,
                        lida: chat.ultima_mensagem.lida,
                        tipo_mensagem: chat.ultima_mensagem.tipo_mensagem
                    } : undefined
                }));

                const ordenados = chatsMapeados.sort((a, b) => {
                    const tA = new Date(a.ultima_mensagem?.data_envio || a.data_criacao).getTime();
                    const tB = new Date(b.ultima_mensagem?.data_envio || b.data_criacao).getTime();
                    return tB - tA;
                });
                
                setChats(ordenados);
            } else {
                console.log('⚠️ Nenhum chat encontrado ou formato inesperado');
                setChats([]);
            }
        } catch (e: any) {
            console.error('❌ Erro ao carregar chats:', e);
            Alert.alert(
                'Erro de Conexão', 
                'Falha ao carregar chats. Verifique sua conexão com a internet.\n\n' + 
                'Detalhes: ' + (e.message || 'Erro desconhecido')
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        console.log('🔄 useEffect executado - userId:', userId);
        if (userId) {
            console.log('🚀 Iniciando carregamento de chats...');
            carregarChats();
        }
    }, [userId]);

    const onRefresh = () => {
        console.log('🔄 Refresh manual iniciado');
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

    const renderChatItem = ({ item }: { item: Chat }) => (
        <TouchableOpacity
            style={styles.chatCard}
            onPress={() => {
                console.log('👆 Chat selecionado:', item.id_chat);
                console.log('👤 Other user:', item.outro_participante);
                (navigation as any).navigate('ChatScreen', {
                    chatId: item.id_chat,
                    otherUser: {
                        id: item.outro_participante.id,
                        name: item.outro_participante.nome,
                        profile_image: item.outro_participante.foto_perfil
                    },
                    currentUserId: userId,
                    solicitacaoId: item.id_solicitacao
                });
            }}
        >
            {item.outro_participante.foto_perfil ? (
                <Image source={{ uri: item.outro_participante.foto_perfil }} style={styles.avatar} />
            ) : (
                <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={26} color="#fff" />
                </View>
            )}
            <View style={styles.chatInfo}>
                <Text style={styles.userName}>
                    {item.outro_participante.nome}
                </Text>
                <Text style={styles.serviceDescription}>
                    {item.servico_descricao}
                </Text>
                <Text
                    style={[
                        styles.lastMessage,
                        item.ultima_mensagem &&
                            !item.ultima_mensagem.lida &&
                            !item.ultima_mensagem.enviada_por_mim &&
                            styles.unreadMessage
                    ]}
                    numberOfLines={1}
                >
                    {item.ultima_mensagem?.conteudo || 'Nenhuma mensagem ainda'}
                </Text>
            </View>
            <View style={styles.chatMeta}>
                {item.ultima_mensagem && (
                    <Text style={styles.time}>
                        {formatMessageTime(item.ultima_mensagem.data_envio)}
                    </Text>
                )}
                {item.mensagens_nao_lidas > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>
                            {item.mensagens_nao_lidas > 9 ? '9+' : item.mensagens_nao_lidas}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    // Mostrar loading enquanto verifica autenticação OU carrega chats
    if (authLoading || loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COR_PRINCIPAL} />
                <Text style={styles.loadingText}>
                    {authLoading ? 'Verificando autenticação...' : 'Carregando chats...'}
                </Text>
            </View>
        );
    }

    // Se não tem usuário autenticado
    if (!userId) {
        return (
            <View style={styles.container}>
                <Navbar />
                <View style={styles.centerContainer}>
                    <Ionicons name="warning-outline" size={60} color="#ef4444" />
                    <Text style={styles.errorText}>Usuário não autenticado</Text>
                    <Text style={styles.errorSubtext}>
                        Faça login para acessar seus chats
                    </Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={() => navigation.navigate('Login' as never)}
                    >
                        <Text style={styles.retryButtonText}>Fazer Login</Text>
                    </TouchableOpacity>
                </View>
                <Footer />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Navbar />
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                    console.log('⬅️ Voltar pressionado');
                    navigation.goBack();
                }}
            >
                <Ionicons name="arrow-back" size={24} color="#1e40af" />
                <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Conversas</Text>
                    <TouchableOpacity onPress={onRefresh}>
                        <Ionicons name="refresh" size={22} color={COR_PRINCIPAL} />
                    </TouchableOpacity>
                </View>
                
                <FlatList
                    data={chats}
                    renderItem={renderChatItem}
                    keyExtractor={(item) => item.id_chat}
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
            <Footer />
        </View>
    );
};

// ... (estilos permanecem os mesmos)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COR_FUNDO,
    },
    content: {
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#dfe4ea',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222',
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
        marginBottom: 2,
    },
    serviceDescription: {
        fontSize: 12,
        color: COR_TEXTO_SECUNDARIO,
        marginBottom: 4,
        fontStyle: 'italic',
    },
    lastMessage: {
        fontSize: 14,
        color: COR_TEXTO_SECUNDARIO,
    },
    unreadMessage: {
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
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        color: COR_TEXTO_SECUNDARIO,
        fontSize: 16,
    },
    errorText: {
        marginTop: 12,
        color: '#ef4444',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    errorSubtext: {
        marginTop: 8,
        color: '#64748b',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 20,
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