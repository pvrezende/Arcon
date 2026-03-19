import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, Alert, TouchableOpacity, Dimensions } from 'react-native';
import PrestadorCard from '../../componentes/prestadoresList/PrestadorCard';
import Navbar from '../../componentes/navbar';
import Footer from '../../componentes/footer';
import { Ionicons } from "@expo/vector-icons";
import { API_CONFIG } from '../../../configIp';

type RootStackParamList = {
    ListaPrestadores: undefined; 
    ReceberPropostaScreen: { prestadorId: string }; 
    EnviarParaTodosScreen: undefined; 
    dash_cliente: undefined;
};

interface Prestador {
    id: string;
    nome: string;
    avatar: string; 
    avaliacao: number;
    servicos: string[];
    distancia: number;
    concluidos: number;
    comentarios: any[]; 
}

interface ServicoData {
    cliente: string;
    btu: string;
    marca: string;
    descricao: string;
    tags: string[];
    user_id: string;
    data_solicitacao: string;
}

interface RouteParams {
    servicoData: ServicoData;
    tagsString: string;
}

const ItemSeparator = () => <View style={styles.separator} />;

export default function ListaPrestadores({ navigation, route }: any) {
    const { servicoData, tagsString } = route.params as RouteParams;
    
    const [selectedPrestador, setSelectedPrestador] = useState<Prestador | null>(null);
    const [prestadores, setPrestadores] = useState<Prestador[]>([]);
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [modalSucesso, setModalSucesso] = useState(false);
    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

    // Hook para detectar mudanças de tamanho da tela
    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setScreenWidth(window.width);
        });
        return () => subscription?.remove();
    }, []);

    // Função para buscar prestadores MANUAL disponíveis da API
    const fetchPrestadores = async () => {
        try {
            setLoading(true);
            // 🔥 NOVO ENDPOINT: Busca apenas prestadores MANUAL
            const response = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.PROPOSTAS_PRESTADORES_DISPONIVEIS}`);
            
            if (!response.ok) {
                throw new Error('Erro ao buscar prestadores');
            }
            
            const data = await response.json();
            
            // Resposta do backend: [{ id_prestador, nome, tipo_prestador, area_atuacao, display_name }]
            const prestadoresFormatados: Prestador[] = data.map((prestador: any) => ({
                id: prestador.id_prestador.toString(),
                nome: prestador.nome,
                avatar: '',
                avaliacao: 4.0,
                servicos: prestador.area_atuacao ? [prestador.area_atuacao] : ['Serviços de Refrigeração'],
                distancia: Math.random() * 10,
                concluidos: Math.floor(Math.random() * 200),
                comentarios: []
            }));
            
            setPrestadores(prestadoresFormatados);
        } catch (error) {
            console.error('Erro ao buscar prestadores:', error);
            Alert.alert('Erro', 'Não foi possível carregar a lista de prestadores MANUAL disponíveis');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrestadores();
    }, []);

    // Função para mostrar modal de sucesso e depois voltar para Home
    const mostrarSucesso = (mensagem: string) => {
        setMensagemSucesso(mensagem);
        setModalSucesso(true);
    };

    // Função para voltar para Home após sucesso
    const voltarParaHome = () => {
        setModalSucesso(false);
        navigation.navigate('dash_cliente');
    };

    // Função para enviar serviço para UM prestador específico
    const enviarParaPrestador = async (prestadorId: string) => {
        if (!servicoData) {
            Alert.alert('Erro', 'Dados do serviço não encontrados');
            return;
        }

        setEnviando(true);
        try {
            const API_URL = `${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.PROPOSTAS_ADD}`;

            const response = await fetch(API_URL, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    cliente: servicoData.cliente,
                    btu: servicoData.btu,
                    tag: tagsString || servicoData.tags?.join(", ") || "",
                    servico: servicoData.descricao,
                    marca: servicoData.marca,
                    confirmar: "true",
                    user_id: servicoData.user_id,
                    prestador_id: prestadorId, // 🔥 ENVIA APENAS PARA ESTE PRESTADOR
                }).toString(),
            });

            if (response.ok) {
                mostrarSucesso('Serviço enviado para o prestador com sucesso!');
                fecharModal();
            } else {
                throw new Error('Erro ao enviar serviço');
            }
        } catch (error) {
            console.error('Erro ao enviar serviço:', error);
            Alert.alert('Erro', 'Não foi possível enviar o serviço');
        } finally {
            setEnviando(false);
        }
    };

    // Função para enviar serviço para TODOS os prestadores
    const enviarParaTodos = async () => {
        if (!servicoData) {
            Alert.alert('Erro', 'Dados do serviço não encontrados');
            return;
        }

        setEnviando(true);
        try {
           const API_URL = `${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.PROPOSTAS_ADD}`;

            // 🔥 ENVIA APENAS 1 REGISTRO SEM prestador_id (VISÍVEL PARA TODOS)
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    cliente: servicoData.cliente,
                    btu: servicoData.btu,
                    tag: tagsString || servicoData.tags?.join(", ") || "",
                    servico: servicoData.descricao,
                    marca: servicoData.marca,
                    confirmar: "true",
                    user_id: servicoData.user_id,
                    // 🔥 NÃO envia prestador_id - fica NULL no banco = VISÍVEL PARA TODOS
                }).toString(),
            });

            if (response.ok) {
                mostrarSucesso('Serviço enviado para todos os prestadores!');
            } else {
                throw new Error('Erro ao enviar serviço para todos');
            }
        } catch (error) {
            console.error('Erro ao enviar serviço:', error);
            Alert.alert('Erro', 'Não foi possível enviar o serviço para todos os prestadores');
        } finally {
            setEnviando(false);
        }
    };

    const abrirModal = (prestador: Prestador) => {
        setSelectedPrestador(prestador);
    };
    
    const fecharModal = () => {
        setSelectedPrestador(null);
    }

    // Modal customizado para ações do prestador
    const PrestadorAcoesModal = ({ prestador, onClose }: { prestador: Prestador | null, onClose: () => void }) => {
        if (!prestador) return null;

        return (
            <Modal visible={!!prestador} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[
                        styles.modalContainer,
                        screenWidth >= 768 && styles.modalContainerWeb
                    ]}>
                        <Text style={styles.modalTitle}>Escolher Ação</Text>
                        <Text style={styles.modalSubtitle}>
                            Para: {prestador.nome}
                        </Text>
                        
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.primaryButton]}
                            onPress={() => {
                                enviarParaPrestador(prestador.id);
                            }}
                            disabled={enviando}
                        >
                            <Text style={styles.buttonText}>
                                {enviando ? 'Enviando...' : 'Enviar Serviço para este Prestador'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.actionButton, styles.secondaryButton]}
                            onPress={onClose}
                            disabled={enviando}
                        >
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    // Modal de sucesso
    const SucessoModal = () => {
        return (
            <Modal visible={modalSucesso} transparent animationType="fade" onRequestClose={voltarParaHome}>
                <View style={styles.modalOverlay}>
                    <View style={[
                        styles.modalContainer,
                        screenWidth >= 768 && styles.modalContainerWeb
                    ]}>
                        <View style={styles.successBox}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="snow" size={25} color="#ffffff" />
                            </View>
                            <Text style={styles.successTitle}>Sucesso!</Text>
                            <Text style={styles.successSubtitle}>{mensagemSucesso}</Text>
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.successButton}
                            onPress={voltarParaHome}
                        >
                            <Text style={styles.successButtonText}>Voltar para a Página Inicial</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    const renderCard = ({ item }: { item: Prestador }) => (
        <PrestadorCard 
            item={item} 
            onCardPress={abrirModal}
        />
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <Navbar />
                <View style={styles.loadingContainer}>
                    <Text>Carregando prestadores...</Text>
                </View>
                <Footer />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Navbar />
            
            {/* Botão Voltar */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()} 
            >
                <Ionicons name="arrow-back" size={24} color="#0284c7" />
                <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>

            {/* Header com botão Enviar para Todos */}
            <View style={[
                styles.header,
                screenWidth >= 768 && styles.headerWeb
            ]}>
                <Text style={styles.title}>Escolha um Prestador</Text>
                <Text style={styles.subtitle}>
                    Selecione um prestador específico ou envie para todos
                </Text>
                
                <TouchableOpacity 
                    style={[
                        styles.enviarTodosButton, 
                        enviando && styles.buttonDisabled
                    ]}
                    onPress={enviarParaTodos}
                    disabled={enviando}
                >
                    <Text style={styles.enviarTodosText}>
                        {enviando ? 'Enviando...' : '📨 Enviar para Todos os Prestadores'}
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={prestadores}
                keyExtractor={(item) => item.id}
                renderItem={renderCard}
                ItemSeparatorComponent={ItemSeparator}
                contentContainerStyle={[
                    styles.listContent,
                    screenWidth >= 768 && styles.listContentWeb
                ]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Nenhum prestador encontrado</Text>
                    </View>
                }
            />

            {/* Modal de ações do prestador */}
            <PrestadorAcoesModal 
                prestador={selectedPrestador} 
                onClose={fecharModal} 
            />
            
            {/* Modal de sucesso */}
            <SucessoModal />
            
            <Footer />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f8f9fa' 
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerWeb: {
        paddingHorizontal: 40,
        paddingVertical: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#0284c7',
        textAlign: 'center',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 15,
    },
    enviarTodosButton: {
        backgroundColor: '#10b981',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    enviarTodosText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    listContent: { 
        paddingHorizontal: 15, 
        paddingTop: 10, 
        paddingBottom: 10 
    },
    listContentWeb: {
        paddingHorizontal: 40,
        paddingTop: 20,
        paddingBottom: 20,
    },
    separator: { 
        height: 1, 
        backgroundColor: '#e0e0e0' 
    },
    backButton: { 
        flexDirection: "row", 
        alignItems: "center", 
        alignSelf: "flex-start", 
        marginLeft: 18, 
        marginBottom: 10, 
        marginTop: 10, 
    },
    backButtonText: { 
        color: "#0284c7", 
        fontSize: 16, 
        fontWeight: "600", 
        marginLeft: 6,
    },
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    emptyContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20 
    },
    emptyText: { 
        fontSize: 16, 
        color: '#666' 
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 350,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
    },
    modalContainerWeb: {
        maxWidth: 400,
        padding: 30,
    },
    successBox: {
        width: "100%",
        backgroundColor: "#d1fae5",
        borderRadius: 12,
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 16,
        marginBottom: 15,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#10b981",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#10b981",
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 14,
        color: "#334155",
        textAlign: "center",
        marginBottom: 20,
    },
    successButton: {
        backgroundColor: "#10b981",
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: "100%",
        alignItems: "center",
    },
    successButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "700",
        textAlign: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0284c7',
        textAlign: 'center',
        marginBottom: 5,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    actionButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    primaryButton: {
        backgroundColor: '#0284c7',
    },
    secondaryButton: {
        backgroundColor: '#a3aab7ff',
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
