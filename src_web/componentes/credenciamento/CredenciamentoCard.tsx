import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './CredenciamentoCard.styles';
import { Credenciamento, CredenciamentoCardProps } from '../../types/credenciamento';


export const CredenciamentoCard: React.FC<CredenciamentoCardProps> = ({
  credenciamento,
  onEdit,
  onDelete,
}) => {
  // Verificação de segurança
  if (!credenciamento) {
    return null;
  }
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const isExpired = (dateString: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date < today;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.marca}>{credenciamento.marca_credenciada || 'Marca não informada'}</Text>
          <View style={[
            styles.statusBadge,
            credenciamento.certificado_credenciado ? styles.activeBadge : styles.inactiveBadge
          ]}>
            <Text style={[
              styles.statusText,
              credenciamento.certificado_credenciado ? styles.activeText : styles.inactiveText
            ]}>
              {credenciamento.certificado_credenciado ? 'Ativo' : 'Inativo'}
            </Text>
          </View>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              onEdit(credenciamento);
            }}
          >
            <Ionicons name="pencil" size={18} color="#0284c7" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              if (credenciamento.id_credenciamento) {
                onDelete(credenciamento.id_credenciamento);
              } else {
              }
            }}
          >
            <Ionicons name="trash" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>Número:</Text>
          <Text style={styles.value}>{credenciamento.numero_credenciamento || 'Não informado'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Validade:</Text>
          <Text style={[
            styles.value,
            isExpired(credenciamento.validade_credenciamento) && styles.expiredText
          ]}>
            {formatDate(credenciamento.validade_credenciamento)}
            {isExpired(credenciamento.validade_credenciamento) && ' (Expirado)'}
          </Text>
        </View>

        {credenciamento.especialidades && (
          <View style={styles.row}>
            <Text style={styles.label}>Especialidades:</Text>
            <Text style={styles.value}>{credenciamento.especialidades}</Text>
          </View>
        )}

        {credenciamento.observacoes && (
          <View style={styles.row}>
            <Text style={styles.label}>Observações:</Text>
            <Text style={styles.value}>{credenciamento.observacoes}</Text>
          </View>
        )}
      </View>
    </View>
  );
};
