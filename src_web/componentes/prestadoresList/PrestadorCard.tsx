import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

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
    distancia: number;
    concluidos: number;
    comentarios: Comentario[];
}

type RootStackParamList = {
    ListaPrestadores: undefined;
    ReceberPropostaScreen: { prestadorId: string };
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'ListaPrestadores'>;

interface PrestadorCardProps {
    item: Prestador;
    onCardPress: (prestador: Prestador) => void;
}

const renderEstrelas = (avaliacao: number) => {
    const estrelas = [];
    const avaliacaoArredondada = Math.round(avaliacao);

    for (let i = 1; i <= 5; i++) {
        estrelas.push(
            <Ionicons
                key={i}
                name={i <= avaliacaoArredondada ? 'star' : 'star-outline'}
                size={16}
                color="#FFD700"
            />
        );
    }
    return estrelas;
};

export default function PrestadorCard({ item, onCardPress }: PrestadorCardProps) {
    const navigation = useNavigation<NavigationProp>();
    
    const avatarElement = item.avatar ? (
        <Image 
            source={{ uri: item.avatar }} 
            style={styles.avatarImage} 
            accessibilityLabel={`Avatar de ${item.nome}`}
        />
    ) : (
        <Ionicons 
            name="person-circle-outline" 
            size={60} 
            color="#0284c7" 
            style={styles.avatarIcon} 
            accessibilityLabel="Ícone de perfil padrão"
        />
    );

    // Função para lidar com o clique no card - agora abre o modal de ações
    const handleCardPress = () => {
        onCardPress(item);
    };

    return (
        <View style={styles.cardContainer}>
            <View style={styles.card}>
                {/* Lado esquerdo: Perfil e Avaliação */}
                <TouchableOpacity style={styles.left} onPress={handleCardPress} activeOpacity={0.7}>
                    {avatarElement}
                    <Text style={styles.nome}>{item.nome}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {renderEstrelas(item.avaliacao)}
                        <Text style={styles.avaliacaoTexto}>{item.avaliacao.toFixed(1)}</Text>
                    </View>
                    <Text style={styles.concluidos}>
                        {item.concluidos} serviços concluídos
                    </Text>
                </TouchableOpacity>

                {/* Lado direito: Serviços, Distância e Botão */}
                <View style={styles.right}>
                    <View>
                        <Text style={styles.servicosTitle}>Serviços:</Text>
                        <Text style={styles.servicos}>{item.servicos.join(', ')}</Text>
                    </View>
                    
                    <View style={styles.infoBottom}>
                        <Text style={styles.distancia}>
                            <Ionicons name="location-outline" size={14} color="#555" /> {item.distancia.toFixed(1)} km
                        </Text>

                        {/* Botão de ação - agora abre o modal */}
                        <TouchableOpacity 
                            style={[styles.botao, styles.botaoEscolher]}
                            onPress={handleCardPress} 
                        >
                            <Text style={styles.textBotao}>Selecionar Prestador</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <View style={styles.separator} /> 
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: { 
        width: '100%', 
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    card: { 
        flexDirection: 'row', 
        backgroundColor: '#fff', 
        padding: 15,
        paddingHorizontal: Platform.OS === 'web' ? 20 : 15,
        borderRadius: 12,
        marginHorizontal: 5,
    },
    separator: { 
        height: 1, 
        backgroundColor: '#e0e0e0',
        marginHorizontal: 10,
    },
    left: { 
        width: '35%', 
        alignItems: 'center', 
        justifyContent: 'flex-start',
        paddingRight: 10,
        borderRightWidth: 1,
        borderRightColor: '#f0f0f0',
    },
    avatarIcon: { 
        marginBottom: 5, 
        height: 60,
    }, 
    avatarImage: { 
        width: 60, 
        height: 60, 
        borderRadius: 30, 
        marginBottom: 5,
        borderWidth: 2,
        borderColor: '#0284c7',
    },
    nome: { 
        fontWeight: 'bold', 
        fontSize: 15, 
        textAlign: 'center',
        color: '#0284c7',
        marginBottom: 5,
    },
    avaliacaoTexto: { 
        fontSize: 13, 
        color: '#666', 
        marginLeft: 5, 
        fontWeight: '600' 
    },
    concluidos: { 
        fontSize: 11, 
        color: '#666', 
        marginTop: 4,
        textAlign: 'center',
    },
    right: { 
        width: '65%', 
        justifyContent: 'space-between', 
        paddingLeft: 15 
    },
    servicosTitle: { 
        fontSize: 12, 
        fontWeight: 'bold', 
        color: '#333', 
        marginBottom: 3 
    },
    servicos: { 
        fontSize: 13, 
        color: '#555', 
        flexWrap: 'wrap',
        lineHeight: 18,
    },
    infoBottom: { 
        marginTop: 10 
    },
    distancia: { 
        color: '#555', 
        marginBottom: 10, 
        fontSize: 12, 
        alignItems: 'center',
        flexDirection: 'row',
    },
    botao: { 
        padding: 10, 
        borderRadius: 8, 
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    botaoEscolher: { 
        backgroundColor: '#0284c7' 
    },
    textBotao: { 
        color: '#fff', 
        fontSize: 14, 
        textAlign: 'center', 
        fontWeight: 'bold' 
    },
});

export type { Prestador, Comentario };
