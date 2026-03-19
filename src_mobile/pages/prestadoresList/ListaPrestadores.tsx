import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, Alert, TouchableOpacity, Dimensions } from 'react-native';
import PrestadorCard from '../../componentes/prestadoresList/PrestadorCard';
import Navbar from '../../componentes/navbar';
import Footer from '../../componentes/footer';
import { Ionicons } from "@expo/vector-icons";
import { API_CONFIG } from '../../../configIp';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const { servicoData: initialServicoData, tagsString } = route.params as RouteParams;
    
    const [selectedPrestador, setSelectedPrestador] = useState<Prestador | null>(null);
    const [prestadores, setPrestadores] = useState<Prestador[]>([]);
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [modalSucesso, setModalSucesso] = useState(false);
    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    const [servicoDataCompleto, setServicoDataCompleto] = useState<ServicoData | null>(null);

    // Hook para obter user_id e completar os dados - CORRIGIDO
    useEffect(() => {
        const completarDadosServico = async () => {
            try {
                console.log('📋 Dados recebidos da tela anterior:', initialServicoData);
                
                // ✅ CORREÇÃO: Usar o user_id que já vem dos dados em vez de buscar do AsyncStorage
                let finalUserId = initialServicoData.user_id;
                
                // Se não tiver user_id nos dados, tentar do AsyncStorage como fallback
                if (!finalUserId) {
                    console.log('🔄 User_id não veio nos dados, buscando do AsyncStorage...');
                    const storedUserId = await AsyncStorage.getItem('user_id');
                    finalUserId = storedUserId;
                    console.log('👤 User_id do AsyncStorage:', finalUserId);
                } else {
                    console.log('✅ User_id dos dados recebidos:', finalUserId);
                }

                if (!finalUserId) {
                    Alert.alert('Erro', 'Usuário não identificado. Faça login novamente.');
                    navigation.goBack();
                    return;
                }

                // Completar os dados do serviço
                const dadosCompletos: ServicoData = {
                    ...initialServicoData,
                    user_id: finalUserId, // ✅ Usa o user_id final
                    data_solicitacao: initialServicoData.data_solicitacao || new Date().toISOString()
                };

                console.log('✅ Dados completos do serviço:', dadosCompletos);
                setServicoDataCompleto(dadosCompletos);
                
            } catch (error) {
                console.error('❌ Erro ao completar dados:', error);
                Alert.alert('Erro', 'Não foi possível carregar os dados do serviço');
            }
        };

        completarDadosServico();
    }, [initialServicoData]);

    // Hook para detectar mudanças de tamanho da tela
    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setScreenWidth(window.width);
        });
        return () => subscription?.remove();
    }, []);

    // Função para buscar prestadores da API
    const fetchPrestadores = async () => {
        try {
            setLoading(true);
            console.log('🔄 Buscando prestadores...');
            
            const response = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.PROPOSTAS_PRESTADORES_DISPONIVEIS}`);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📦 Prestadores recebidos:', data);
            
            // ✅ CORREÇÃO: Formatação melhorada dos prestadores
            const prestadoresFormatados: Prestador[] = data.map((prestador: any) => ({
                id: prestador.id_prestador?.toString() || prestador.id?.toString() || Math.random().toString(),
                nome: prestador.nome || prestador.NOME || 'Prestador sem nome',
                avatar: prestador.avatar || prestador.foto || '',
                avaliacao: prestador.avaliacao || 4.0,
                servicos: [prestador.area_atuacao || 'Serviços de Refrigeração'], // ✅ Usa area_atuacao
                distancia: prestador.distancia || Math.random() * 10,
                concluidos: prestador.concluidos || Math.floor(Math.random() * 200),
                comentarios: prestador.comentarios || []
            }));
            
            setPrestadores(prestadoresFormatados);
            console.log(`✅ ${prestadoresFormatados.length} prestadores carregados`);
            
        } catch (error) {
            console.error('❌ Erro ao buscar prestadores:', error);
            Alert.alert('Erro', 'Não foi possível carregar a lista de prestadores');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrestadores();
    }, []);

    // Função para mostrar modal de sucesso
    const mostrarSucesso = (mensagem: string) => {
        setMensagemSucesso(mensagem);
        setModalSucesso(true);
    };

    // Função para voltar para Home após sucesso
    const voltarParaHome = () => {
        setModalSucesso(false);
        navigation.navigate('dash_cliente');
    };

    // Função para validar dados antes do envio
    const validarDadosServico = (): boolean => {
        if (!servicoDataCompleto) {
            Alert.alert('Erro', 'Dados do serviço não carregados');
            return false;
        }

        const { cliente, btu, marca, descricao, user_id } = servicoDataCompleto;

        if (!cliente || !btu || !marca || !descricao || !user_id) {
            Alert.alert('Erro', 'Todos os campos obrigatórios devem ser preenchidos');
            console.log('❌ Validação falhou:', { cliente, btu, marca, descricao, user_id });
            return false;
        }

        console.log('✅ Validação passou');
        return true;
    };

    // Função para enviar serviço para UM prestador específico
    const enviarParaPrestador = async (prestadorId: string, prestadorNome: string) => {
        if (!validarDadosServico() || !servicoDataCompleto) {
            return;
        }

        setEnviando(true);
        try {
            const API_URL = `${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.PROPOSTAS_ADD}`;

            // ✅ CORREÇÃO: Preparar dados para envio com user_id garantido
            const dadosEnvio = {
                cliente: servicoDataCompleto.cliente,
                btu: servicoDataCompleto.btu,
                tag: tagsString || servicoDataCompleto.tags?.join(", ") || "",
                servico: servicoDataCompleto.descricao,
                marca: servicoDataCompleto.marca,
                confirmar: "true",
                user_id: servicoDataCompleto.user_id, // ✅ Já validado
                prestador_id: prestadorId,
                prestador_nome: prestadorNome,
                data_solicitacao: servicoDataCompleto.data_solicitacao
            };

            console.log('📤 Enviando para prestador específico:', dadosEnvio);

            const response = await fetch(API_URL, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams(dadosEnvio as any).toString(),
            });

            console.log('📨 Resposta do servidor:', response.status, response.statusText);

            if (response.ok) {
                const responseData = await response.text();
                console.log('✅ Serviço enviado com sucesso:', responseData);
                mostrarSucesso(`Serviço enviado para ${prestadorNome} com sucesso!`);
                fecharModal();
            } else {
                const errorText = await response.text();
                console.error('❌ Erro na resposta:', errorText);
                throw new Error(`Erro ${response.status}: ${errorText}`);
            }
        } catch (error) {
            console.error('❌ Erro ao enviar serviço:', error);
            Alert.alert(
                'Erro', 
                `Não foi possível enviar o serviço: ${error.message}`
            );
        } finally {
            setEnviando(false);
        }
    };

    // Função para enviar serviço para TODOS os prestadores
    const enviarParaTodos = async () => {
        if (!validarDadosServico() || !servicoDataCompleto) {
            return;
        }

        setEnviando(true);
        try {
            const API_URL = `${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.PROPOSTAS_ADD}`;

            // ✅ CORREÇÃO: Preparar dados para envio para todos com user_id garantido
            const dadosEnvio = {
                cliente: servicoDataCompleto.cliente,
                btu: servicoDataCompleto.btu,
                tag: tagsString || servicoDataCompleto.tags?.join(", ") || "",
                servico: servicoDataCompleto.descricao,
                marca: servicoDataCompleto.marca,
                confirmar: "true",
                user_id: servicoDataCompleto.user_id, // ✅ Já validado
                data_solicitacao: servicoDataCompleto.data_solicitacao
                // Não envia prestador_id - fica NULL no banco = VISÍVEL PARA TODOS
            };

            console.log('📤 Enviando para todos os prestadores:', dadosEnvio);

            const response = await fetch(API_URL, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams(dadosEnvio as any).toString(),
            });

            console.log('📨 Resposta do servidor (todos):', response.status, response.statusText);

            if (response.ok) {
                const responseData = await response.text();
                console.log('✅ Serviço enviado para todos com sucesso:', responseData);
                mostrarSucesso('Serviço enviado para todos os prestadores!');
            } else {
                const errorText = await response.text();
                console.error('❌ Erro na resposta (todos):', errorText);
                throw new Error(`Erro ${response.status}: ${errorText}`);
            }
        } catch (error) {
            console.error('❌ Erro ao enviar serviço para todos:', error);
            Alert.alert(
                'Erro', 
                `Não foi possível enviar o serviço para todos os prestadores: ${error.message}`
            );
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
                            style={[styles.actionButton, styles.primaryButton, enviando && styles.buttonDisabled]}
                            onPress={() => {
                                enviarParaPrestador(prestador.id, prestador.nome);
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
                                <Ionicons name="checkmark" size={25} color="#ffffff" />
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
                    disabled={enviando || !servicoDataCompleto}
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
    debugContainer: {
        backgroundColor: '#f3f4f6',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    debugText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
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