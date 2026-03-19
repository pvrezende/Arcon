import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, Button, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Comentario {
    usuario: string;
    texto: string;
    nota: number; // 1-5
    data: string;
}

interface Prestador {
    id: string;
    nome: string;
    avatar: string; 
    avaliacao: number; // 0-5
    servicos: string[];
    distancia: number; // em km
    concluidos: number;
    comentarios: Comentario[]; // OBRIGATÓRIO A PARTIR DE AGORA
}

interface Proposta {
    id: number;
    servicos: string;
    prestador: string;
    valor: string;
    data: string;
    horario: string;
    prestadorData?: {
        nome: string;
        foto?: string;
        rating: number;
        servicosRealizados: number;
        comentarios: Array<{
            id: string;
            clienteNome: string;
            clienteFoto?: string;
            rating: number;
            comentario: string;
            data: string;
        }>;
    };
}

interface PrestadorDetalhesModalProps {
    prestador: Prestador | null; 
    onClose: () => void;
}

// Dados de teste para simular o carregamento de mais detalhes (com comentários)
const prestadorComComentarios: Prestador = {
    id: '1', 
    nome: 'João AC Silva', 
    avatar: '', 
    avaliacao: 4.5, 
    servicos: ['Instalação Split', 'Limpeza'], 
    distancia: 2.3, 
    concluidos: 125,
    comentarios: [
        { usuario: 'Márcia F.', texto: 'Excelente serviço e pontualidade! O ar ficou perfeito.', nota: 5, data: '12/05/2024' },
        { usuario: 'R. Oliveira', texto: 'Bom trabalho, mas demorou um pouco para dar o orçamento.', nota: 4, data: '01/04/2024' },
    ]
};

// Dados de exemplo para as propostas
const propostasExemplo: Proposta[] = [
    {
        id: 1,
        servicos: "Instalação e Limpeza de Ar-condicionado",
        prestador: "Carlos Santos",
        valor: "R$ 350,00",
        data: "15/10/2025",
        horario: "14:30",
        prestadorData: {
            nome: "Carlos Santos",
            foto: undefined,
            rating: 4,
            servicosRealizados: 24,
            comentarios: [
                {
                    id: "1",
                    clienteNome: "Maria Silva",
                    clienteFoto: undefined,
                    rating: 5,
                    comentario: "Excelente serviço! Muito profissional e pontual.",
                    data: "15/03/2024"
                },
                {
                    id: "2",
                    clienteNome: "João Oliveira",
                    clienteFoto: undefined,
                    rating: 4,
                    comentario: "Bom trabalho, mas poderia ser mais rápido.",
                    data: "10/03/2024"
                }
            ]
        }
    },
    {
        id: 2,
        servicos: "Manutenção preventiva Split",
        prestador: "Ana Costa",
        valor: "R$ 180,00",
        data: "18/10/2025",
        horario: "09:00",
        prestadorData: {
            nome: "Ana Costa",
            foto: undefined,
            rating: 5,
            servicosRealizados: 47,
            comentarios: [
                {
                    id: "3",
                    clienteNome: "Pedro Santos",
                    clienteFoto: undefined,
                    rating: 5,
                    comentario: "Muito atenciosa e competente. Recomendo!",
                    data: "20/02/2024"
                }
            ]
        }
    },
    {
        id: 3,
        servicos: "Reparo de vazamento",
        prestador: "Roberto Lima",
        valor: "R$ 220,00",
        data: "20/10/2025",
        horario: "16:00",
        prestadorData: {
            nome: "Roberto Lima",
            foto: undefined,
            rating: 3.5,
            servicosRealizados: 12,
            comentarios: [
                {
                    id: "4",
                    clienteNome: "Lucia Ferreira",
                    clienteFoto: undefined,
                    rating: 4,
                    comentario: "Resolveu o problema, mas chegou atrasado.",
                    data: "05/01/2024"
                }
            ]
        }
    }
];

// Componente do Modal do Prestador
interface PrestadorModalProps {
    visible: boolean;
    prestadorData: Proposta['prestadorData'] | null;
    onClose: () => void;
}

const PrestadorModal: React.FC<PrestadorModalProps> = ({ visible, prestadorData, onClose }) => {
    if (!prestadorData) return null;

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= rating ? "star" : "star-outline"}
                    size={16}
                    color="#fbbf24"
                />
            );
        }
        return stars;
    };

    return (
        <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
            <View style={styles.prestadorModalOverlay}>
                <View style={styles.prestadorModalContainer}>
                    {/* Header */}
                    <View style={styles.prestadorModalHeader}>
                        <Text style={styles.prestadorModalTitle}>Perfil do Prestador</Text>
                        <TouchableOpacity 
                            style={styles.prestadorCloseButton}
                            onPress={onClose}
                        >
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.prestadorScrollContainer} showsVerticalScrollIndicator={false}>
                        {/* Perfil */}
                        <View style={styles.prestadorSection}>
                            <View style={styles.prestadorProfileRow}>
                                {/* Avatar */}
                                <View style={styles.prestadorAvatarContainer}>
                                    {prestadorData.foto ? (
                                        <Text>Foto aqui</Text>
                                    ) : (
                                        <View style={[styles.prestadorAvatar, styles.prestadorAvatarPlaceholder]}>
                                            <Text style={styles.prestadorAvatarText}>
                                                {prestadorData.nome.split(' ').map(n => n[0]).join('')}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Informações básicas */}
                                <View style={styles.prestadorInfoContainer}>
                                    <Text style={styles.prestadorNome}>{prestadorData.nome}</Text>
                                    <View style={styles.prestadorRatingRow}>
                                        {renderStars(prestadorData.rating)}
                                        <Text style={styles.prestadorRatingText}>
                                            {prestadorData.rating} ({prestadorData.servicosRealizados} serviços)
                                        </Text>
                                    </View>
                                    <Text style={styles.prestadorServicos}>
                                        Especialista em serviços de ar-condicionado
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Comentários */}
                        <View style={styles.prestadorSection}>
                            <View style={styles.prestadorSectionHeader}>
                                <Ionicons name="chatbubbles-outline" size={20} color="#0284c7" />
                                <Text style={styles.prestadorSectionTitle}>
                                    Avaliações ({prestadorData.comentarios.length})
                                </Text>
                            </View>
                            
                            {prestadorData.comentarios.map((comentario) => (
                                <View key={comentario.id} style={styles.comentarioCard}>
                                    <View style={styles.comentarioHeader}>
                                        <View style={styles.comentarioUsuario}>
                                            <Text style={styles.comentarioNome}>{comentario.clienteNome}</Text>
                                            <View style={styles.comentarioRating}>
                                                {renderStars(comentario.rating)}
                                            </View>
                                        </View>
                                        <Text style={styles.comentarioData}>{comentario.data}</Text>
                                    </View>
                                    <Text style={styles.comentarioTexto}>{comentario.comentario}</Text>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

// Componente principal do modal modificado para incluir propostas
export default function PrestadorDetalhesModal({ prestador, onClose }: PrestadorDetalhesModalProps) {
    const modalVisible = prestador !== null;
    const [prestadorModalVisible, setPrestadorModalVisible] = useState(false);
    const [selectedPrestadorData, setSelectedPrestadorData] = useState<Proposta['prestadorData'] | null>(null);

    // Simula o carregamento dos dados completos (incluindo comentários) se o prestador for o João.
    // Para os outros, usa o prestador sem comentários (mas a interface agora exige).
    // Corrigido: Se não for o João, inicializa 'comentarios' como array vazio para evitar erro.
    const dadosCompletos: Prestador | null = 
        prestador?.id === '1' 
        ? prestadorComComentarios 
        : (prestador ? { ...prestador, comentarios: [] } : null);

    // Função para abrir modal do prestador quando clicar em uma proposta
    const handlePropostaPress = (proposta: Proposta) => {
        if (proposta.prestadorData) {
            setSelectedPrestadorData(proposta.prestadorData);
            setPrestadorModalVisible(true);
        }
    };

    // Função para fechar modal do prestador
    const handleClosePrestadorModal = () => {
        setPrestadorModalVisible(false);
        setSelectedPrestadorData(null);
    };

    // Renderizar item da proposta
    const renderPropostaItem = ({ item }: { item: Proposta }) => (
        <TouchableOpacity 
            style={styles.propostaItem} 
            onPress={() => handlePropostaPress(item)}
        >
            <View style={styles.propostaHeader}>
                <Text style={styles.propostaTitulo}>{item.servicos}</Text>
                <Text style={styles.propostaValor}>{item.valor}</Text>
            </View>
            <View style={styles.propostaInfo}>
                <Text style={styles.propostaPrestador}>
                    <Ionicons name="person-outline" size={14} color="#64748b" /> {item.prestador}
                </Text>
                <Text style={styles.propostaData}>
                    <Ionicons name="calendar-outline" size={14} color="#64748b" /> {item.data} às {item.horario}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (!dadosCompletos) return null;

    return (
        <>
            <Modal 
                visible={modalVisible} 
                animationType="fade" 
                transparent={true} 
                onRequestClose={onClose}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.modalNome}>Propostas Recebidas</Text>
                            <TouchableOpacity onPress={onClose} style={{ padding: 5 }}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {/* Lista de Propostas */}
                        <FlatList
                            data={propostasExemplo}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderPropostaItem}
                            showsVerticalScrollIndicator={false}
                            style={{ flex: 1 }}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />

                        {/* Informações adicionais */}
                        <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0' }}>
                            <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center' }}>
                                Clique em uma proposta para ver os detalhes do prestador
                            </Text>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal do Prestador */}
            <PrestadorModal
                visible={prestadorModalVisible}
                prestadorData={selectedPrestadorData}
                onClose={handleClosePrestadorModal}
            />
        </>
    );
}

const styles = StyleSheet.create({
    modalContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        backgroundColor: 'rgba(0,0,0,0.6)' 
    },
    modalContent: { 
        backgroundColor: '#fff', 
        margin: 20, 
        borderRadius: 12, 
        padding: 20,
        maxHeight: '80%', 
    },
    header: {
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 5
    },
    modalNome: { 
        fontWeight: 'bold', 
        fontSize: 22, 
        color: '#0284c7' 
    },
    concluidosText: {
        fontWeight: '600',
        fontSize: 14,
        color: '#0d9488', 
        marginBottom: 10,
    },
    modalSeparator: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 15,
    },
    
    // --- ESTILOS DOS SERVIÇOS ---
    servicesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    serviceTag: {
        backgroundColor: '#e0f2f1',
        color: '#0d9488',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 15,
        marginRight: 8,
        marginBottom: 8,
        fontSize: 12,
        fontWeight: '600',
    },

    // --- ESTILOS DOS COMENTÁRIOS ---
    commentCard: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#0284c7',
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    commentUser: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#495057',
    },
    commentText: {
        fontSize: 14,
        marginBottom: 5,
        color: '#343a40',
    },
    commentDate: {
        fontSize: 10,
        color: '#adb5bd',
        textAlign: 'right',
    },

    // --- ESTILOS DAS PROPOSTAS ---
    propostaItem: {
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    propostaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    propostaTitulo: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        flex: 1,
    },
    propostaValor: {
        fontSize: 16,
        fontWeight: '700',
        color: '#059669',
    },
    propostaInfo: {
        flexDirection: 'column',
        gap: 4,
    },
    propostaPrestador: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 4,
    },
    propostaData: {
        fontSize: 14,
        color: '#64748b',
    },

    // --- ESTILOS DO MODAL DO PRESTADOR ---
    prestadorModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    prestadorModalContainer: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
    },
    prestadorModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        backgroundColor: '#0284c7',
    },
    prestadorModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: 'white',
    },
    prestadorCloseButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    prestadorScrollContainer: {
        flex: 1,
    },
    prestadorSection: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    prestadorProfileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    prestadorAvatarContainer: {
        marginRight: 16,
    },
    prestadorAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    prestadorAvatarPlaceholder: {
        backgroundColor: '#e2e8f0',
    },
    prestadorAvatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#64748b',
    },
    prestadorInfoContainer: {
        flex: 1,
    },
    prestadorNome: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
    },
    prestadorRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    prestadorRatingText: {
        fontSize: 16,
        color: '#64748b',
        marginLeft: 8,
    },
    prestadorServicos: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    prestadorSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    prestadorSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginLeft: 8,
    },

    // --- ESTILOS DOS COMENTÁRIOS NO MODAL DO PRESTADOR ---
    comentarioCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#0284c7',
    },
    comentarioHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    comentarioUsuario: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    comentarioNome: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginRight: 8,
    },
    comentarioRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    comentarioTexto: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    comentarioData: {
        fontSize: 12,
        color: '#94a3b8',
    },
});
