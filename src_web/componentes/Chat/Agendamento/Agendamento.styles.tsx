import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        width: 280,
        maxHeight: 400,
        marginRight: 12,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10b981',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    agendamentosList: {
        maxHeight: 350,
    },
    agendamentoCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    agendamentoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    agendamentoData: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginLeft: 8,
    },
    observacoes: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 8,
        marginLeft: 26,
    },
    statusContainer: {
        marginTop: 8,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    acceptButton: {
        backgroundColor: '#10b981',
    },
    rejectButton: {
        backgroundColor: '#ef4444',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 500,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
    },
    modalBody: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 12,
    },
    diasContainer: {
        marginBottom: 8,
    },
    diaButton: {
        width: 70,
        padding: 12,
        marginRight: 8,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    diaButtonSelected: {
        backgroundColor: '#0284c7',
        borderColor: '#0284c7',
    },
    diaSemana: {
        fontSize: 11,
        color: '#64748b',
        marginBottom: 4,
    },
    diaNumero: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 2,
    },
    diaNumeroSelected: {
        color: '#fff',
    },
    diaMes: {
        fontSize: 10,
        color: '#64748b',
    },
    horariosContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    horarioButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    horarioButtonSelected: {
        backgroundColor: '#0284c7',
        borderColor: '#0284c7',
    },
    horarioText: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '600',
    },
    horarioTextSelected: {
        color: '#fff',
    },
    textAreaContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f8fafc',
    },
    icon: {
        marginRight: 8,
        marginTop: 2,
    },
    textArea: {
        flex: 1,
        fontSize: 14,
        color: '#1e293b',
        border: 'none',
        outline: 'none',
        resize: 'none',
        fontFamily: 'inherit',
        backgroundColor: 'transparent',
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cancelButtonText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '600',
    },
    confirmButton: {
        backgroundColor: '#0284c7',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default styles;