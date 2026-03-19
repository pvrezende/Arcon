import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Alert,
    
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../../contexts/AuthContext';
import { API_CONFIG } from '../../../../configIp';
import styles from './Agendamento.styles';

interface Agendamento {
    id?: number;
    data: string;
    horario: string;
    status: 'pendente' | 'aceito' | 'recusado_pelo_prestador' | 'confirmado';
    observacoes?: string;
}

interface AgendamentoProps {
    chatId: number;
    otherUserId: number;
    userId: number;
    onAgendamentoCriado?: (agendamento: {
        data: string;
        horario: string;
        observacoes?: string;
    }) => void;
}

const AgendamentoComponent: React.FC<AgendamentoProps> = ({ chatId, otherUserId, userId, onAgendamentoCriado }) => {
    const { userData } = useAuthContext();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [observacoes, setObservacoes] = useState('');
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [loading, setLoading] = useState(false);

    // Verifica se o usuário atual é cliente
    const isCliente = userData?.tipo_usuario === 'CLIENTE';
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // Gerar dias disponíveis (próximos 30 dias)
    const gerarDiasDisponiveis = () => {
        const dias = [];
        const hoje = new Date();
        
        for (let i = 1; i <= 30; i++) {
            const data = new Date(hoje);
            data.setDate(hoje.getDate() + i);
            
            // Não mostrar finais de semana (opcional - pode remover)
            const diaSemana = data.getDay();
            
            dias.push({
                data: data.toISOString().split('T')[0],
                dia: data.getDate(),
                mes: meses[data.getMonth()],
                diaSemana: diasSemana[diaSemana],
                disponivel: true
            });
        }
        
        return dias;
    };

    const diasDisponiveis = gerarDiasDisponiveis();
    const horariosDisponiveis = [
        '08:00', '09:00', '10:00', '11:00', 
        '14:00', '15:00', '16:00', '17:00', '18:00'
    ];

    const formatarData = (data: string) => {
        const date = new Date(data);
        return `${date.getDate()} de ${meses[date.getMonth()]}`;
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'aceito':
            case 'confirmado':
                return '#10b981'; 
            case 'recusado_pelo_prestador':
                return '#ef4444'; 
            case 'pendente':
                return '#f59e0b';
            default:
                return '#64748b';
        }
    };

    const getStatusText = (status: string) => {
        switch(status) {
            case 'aceito':
                return 'Aceito';
            case 'recusado_pelo_prestador':
                return 'Recusado';
            case 'pendente':
                return 'Pendente';
            case 'confirmado':
                return 'Confirmado';
            default:
                return 'Desconhecido';
        }
    };

    const criarAgendamento = async () => {
        if (!selectedDate || !selectedTime) {
            Alert.alert('Erro', 'Por favor, selecione uma data e horário.');
            return;
        }

        setLoading(true);

        try {
            const dataHoraISO = `${selectedDate}T${selectedTime}:00`;
            const { agendamentoService } = await import('../../../services/agendamentoService');
            
            // Determinar id_cliente e id_prestador baseado no tipo de usuário
            const isClienteUser = userData?.tipo_usuario === 'CLIENTE';
            const currentUser_id = userId || userData?.id_usuario || userData?.id;
            let finalOtherUserId = otherUserId;
            console.log('🔍 Verificando necessidade de buscar otherUserId:', { otherUserId, chatId, currentUser_id });
            
            if (!otherUserId && chatId) {
                try {
                    console.log('📡 Buscando prestador do chat no backend...');
                    const chatsResponse = await fetch(`${API_CONFIG.BACKEND_URL}/api/chats/usuario/${currentUser_id}`);
                    
                    if (chatsResponse.ok) {
                        const chatsResult = await chatsResponse.json();
                        console.log('Resultado dos chats:', chatsResult);
                        const chatsArray = chatsResult.chats || chatsResult.data?.chats || [];
                        console.log('Chats array:', chatsArray);
                        const currentChat = chatsArray.find((c: any) => c.id_chat === chatId);
                        console.log('Buscando chat com id_chat:', chatId);
                        
                        if (currentChat) {
                            console.log('Chat encontrado:', currentChat);
                            
                            // Extrair ID do prestador do chat - várias formas
                            if (typeof currentChat.id_prestador === 'number') {
                                finalOtherUserId = currentChat.id_prestador;
                                console.log('id_prestador encontrado como número:', finalOtherUserId);
                            } else if (currentChat.outro_participante?.id) {
                                finalOtherUserId = currentChat.outro_participante.id;
                                console.log('ID do outro participante:', finalOtherUserId);
                            } else if (typeof currentChat.prestador_id === 'number') {
                                finalOtherUserId = currentChat.prestador_id;
                                console.log('prestador_id encontrado:', finalOtherUserId);
                            } else {
                                console.log('Não foi possível extrair ID do prestador do chat');
                                console.log(' Dados completos do chat:', JSON.stringify(currentChat, null, 2));
                            }
                        } else {
                            console.log('Chat não encontrado na lista de chats');
                            console.log('Tentando buscar de outra forma...');
                        }
                    }
                } catch (error) {
                    console.error('Erro ao buscar otherUserId:', error);
                }
            }
            
            const idCliente = isClienteUser ? currentUser_id : finalOtherUserId;
            const idPrestador = isClienteUser ? finalOtherUserId : currentUser_id;
            
            console.log('Debug IDs:', {
                isClienteUser,
                userId,
                otherUserId,
                userData_id: userData?.id,
                userData_id_usuario: userData?.id_usuario,
                userData_id_prestador: userData?.id_prestador,
                idCliente: idCliente,
                idPrestador: idPrestador
            });
            
            // Validações importantes
            if (!idCliente || !idPrestador) {
                console.error('IDs inválidos:', { 
                    idCliente, 
                    idPrestador, 
                    userId, 
                    otherUserId, 
                    userData: userData 
                });
                Alert.alert('Erro', 'Erro ao identificar cliente e prestador. Por favor, tente novamente.');
                setLoading(false);
                return;
            }
            
            console.log('📅 Criando agendamento via API:', {
                id_chat: chatId,
                id_cliente: idCliente,
                id_prestador: idPrestador,
                data_hora: dataHoraISO,
                observacao: observacoes || undefined,
                debug: { 
                    userId, 
                    otherUserId, 
                    userData_id: userData?.id, 
                    tipo_usuario: userData?.tipo_usuario,
                    isClienteUser 
                }
            });

            // Chamar API do backend
            const response = await agendamentoService.criarAgendamento({
                id_chat: chatId,
                id_cliente: idCliente,
                id_prestador: idPrestador,
                data_hora: dataHoraISO,
                observacao: observacoes || undefined
            });

            console.log('gendamento criado com sucesso:', response);

            // Notificar o componente pai
            if (onAgendamentoCriado) {
                onAgendamentoCriado({
                    data: selectedDate,
                    horario: selectedTime,
                    observacoes: observacoes || '',
                });
            }

            setModalVisible(false);
            setSelectedDate('');
            setSelectedTime('');
            setObservacoes('');
            
            Alert.alert('Sucesso', 'Solicitação de agendamento enviada! Aguarde a confirmação do prestador.');
        } catch (error: any) {
            console.error('Erro ao criar agendamento:', error);
            Alert.alert('Erro', error.message || 'Não foi possível criar o agendamento.');
        } finally {
            setLoading(false);
        }
    };

    const responderAgendamento = async (agendamentoId: number, aceitar: boolean) => {
        setLoading(true);

        try {
          console.log('Respondendo agendamento:', agendamentoId, aceitar);
          setAgendamentos(agendamentos.map(ag => 
                ag.id === agendamentoId 
                    ? { ...ag, status: aceitar ? 'aceito' : 'recusado_pelo_prestador' as const }
                    : ag
            ));

            Alert.alert(
                'Sucesso', 
                aceitar ? 'Agendamento aceito!' : 'Agendamento recusado.'
            );
        } catch (error) {
            console.error('Erro ao responder agendamento:', error);
            Alert.alert('Erro', 'Não foi possível processar a resposta.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Botão para abrir modal (apenas para cliente) */}
            {isCliente && (
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="calendar-outline" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Agendar</Text>
                </TouchableOpacity>
            )}

            {/* Lista de agendamentos - removido, agendamentos aparecem no chat */}
            {false && agendamentos.length > 0 && (
                <ScrollView 
                    style={styles.agendamentosList}
                    showsVerticalScrollIndicator={false}
                >
                    {agendamentos.map((agendamento) => (
                        <View key={agendamento.id} style={styles.agendamentoCard}>
                            <View style={styles.agendamentoHeader}>
                                <Ionicons 
                                    name="calendar" 
                                    size={18} 
                                    color={getStatusColor(agendamento.status)} 
                                />
                                <Text style={styles.agendamentoData}>
                                    {formatarData(agendamento.data)} às {agendamento.horario}
                                </Text>
                            </View>
                            
                            {agendamento.observacoes && (
                                <Text style={styles.observacoes}>
                                    {agendamento.observacoes}
                                </Text>
                            )}

                            <View style={styles.statusContainer}>
                                <View 
                                    style={[
                                        styles.statusBadge, 
                                        { backgroundColor: getStatusColor(agendamento.status) }
                                    ]}
                                >
                                    <Text style={styles.statusText}>
                                        {getStatusText(agendamento.status)}
                                    </Text>
                                </View>
                            </View>

                            {/* Botões de ação (apenas para prestador com status pendente) */}
                            {!isCliente && agendamento.status === 'pendente' && (
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.acceptButton]}
                                        onPress={() => responderAgendamento(agendamento.id!, true)}
                                        disabled={loading}
                                    >
                                        <Ionicons name="checkmark" size={18} color="#fff" />
                                        <Text style={styles.actionButtonText}>Aceitar</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.rejectButton]}
                                        onPress={() => responderAgendamento(agendamento.id!, false)}
                                        disabled={loading}
                                    >
                                        <Ionicons name="close" size={18} color="#fff" />
                                        <Text style={styles.actionButtonText}>Recusar</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* Modal para criar agendamento (apenas cliente) */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Novo Agendamento</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {/* Seleção de Data */}
                            <Text style={styles.label}>Selecione a Data</Text>
                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false}
                                style={styles.diasContainer}
                            >
                                {diasDisponiveis.map((dia) => (
                                    <TouchableOpacity
                                        key={dia.data}
                                        style={[
                                            styles.diaButton,
                                            selectedDate === dia.data && styles.diaButtonSelected
                                        ]}
                                        onPress={() => setSelectedDate(dia.data)}
                                    >
                                        <Text style={styles.diaSemana}>{dia.diaSemana}</Text>
                                        <Text style={[
                                            styles.diaNumero,
                                            selectedDate === dia.data && styles.diaNumeroSelected
                                        ]}>
                                            {dia.dia}
                                        </Text>
                                        <Text style={styles.diaMes}>{dia.mes.substring(0, 3)}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Seleção de Horário */}
                            <Text style={[styles.label, { marginTop: 20 }]}>Selecione o Horário</Text>
                            <View style={styles.horariosContainer}>
                                {horariosDisponiveis.map((horario) => (
                                    <TouchableOpacity
                                        key={horario}
                                        style={[
                                            styles.horarioButton,
                                            selectedTime === horario && styles.horarioButtonSelected
                                        ]}
                                        onPress={() => setSelectedTime(horario)}
                                    >
                                        <Text style={[
                                            styles.horarioText,
                                            selectedTime === horario && styles.horarioTextSelected
                                        ]}>
                                            {horario}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Observações */}
                            <Text style={[styles.label, { marginTop: 20 }]}>Observações (opcional)</Text>
                            <View style={styles.textAreaContainer}>
                                <Ionicons 
                                    name="document-text-outline" 
                                    size={20} 
                                    color="#94a3b8" 
                                    style={styles.icon}
                                />
                                <textarea
                                    style={styles.textArea}
                                    value={observacoes}
                                    onChange={(e) => setObservacoes(e.target.value)}
                                    placeholder="Adicione informações relevantes..."
                                    rows={3}
                                />
                            </View>
                        </ScrollView>

                        {/* Botões do Modal */}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={criarAgendamento}
                                disabled={loading || !selectedDate || !selectedTime}
                            >
                                <Text style={styles.confirmButtonText}>
                                    {loading ? 'Salvando...' : 'Confirmar Agendamento'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default AgendamentoComponent;
