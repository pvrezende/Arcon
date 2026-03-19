import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './CredenciamentoModal.styles';
import { Credenciamento, CredenciamentoModalProps, CredenciamentoFormData } from '../../types/credenciamento';


export const CredenciamentoModal: React.FC<CredenciamentoModalProps> = ({
  visible,
  credenciamento,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    certificado_credenciado: false,
    marca_credenciada: '',
    numero_credenciamento: '',
    validade_credenciamento: '',
    especialidades: '',
    observacoes: '',
  });

  useEffect(() => {
    console.log('🔄 Modal useEffect - credenciamento recebido:', credenciamento);
    if (credenciamento) {
      // Converter data do formato do backend (AAAA-MM-DD) para formato brasileiro (DD/MM/AAAA)
      let dataFormatada = credenciamento.validade_credenciamento || '';
      if (dataFormatada && dataFormatada.includes('-') && !dataFormatada.includes('/')) {
        const partesData = dataFormatada.split('-');
        if (partesData.length === 3) {
          const [ano, mes, dia] = partesData;
          dataFormatada = `${dia}/${mes}/${ano}`;
        }
      }

      console.log('📝 Carregando dados para edição:', {
        certificado_credenciado: credenciamento.certificado_credenciado,
        marca_credenciada: credenciamento.marca_credenciada,
        numero_credenciamento: credenciamento.numero_credenciamento,
        validade_credenciamento: dataFormatada,
        especialidades: credenciamento.especialidades,
        observacoes: credenciamento.observacoes,
      });
      setFormData({
        certificado_credenciado: credenciamento.certificado_credenciado,
        marca_credenciada: credenciamento.marca_credenciada || '',
        numero_credenciamento: credenciamento.numero_credenciamento || '',
        validade_credenciamento: dataFormatada,
        especialidades: credenciamento.especialidades || '',
        observacoes: credenciamento.observacoes || '',
      });
    } else {
      console.log('📝 Limpando dados para novo credenciamento');
      setFormData({
        certificado_credenciado: false,
        marca_credenciada: '',
        numero_credenciamento: '',
        validade_credenciamento: '',
        especialidades: '',
        observacoes: '',
      });
    }
  }, [credenciamento]);

  const handleSave = () => {
    if (!formData.marca_credenciada.trim()) {
      Alert.alert('Erro', 'Marca é obrigatória');
      return;
    }

    // Converter data do formato brasileiro (DD/MM/AAAA) para formato do backend (AAAA-MM-DD)
    let dataParaEnvio = { ...formData };
    if (formData.validade_credenciamento && formData.validade_credenciamento.includes('/')) {
      const partesData = formData.validade_credenciamento.split('/');
      if (partesData.length === 3) {
        const [dia, mes, ano] = partesData;
        dataParaEnvio.validade_credenciamento = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
      }
    }

    onSave(dataParaEnvio);
  };

  const handleClose = () => {
    setFormData({
      certificado_credenciado: false,
      marca_credenciada: '',
      numero_credenciamento: '',
      validade_credenciamento: '',
      especialidades: '',
      observacoes: '',
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {credenciamento ? 'Editar Credenciamento' : 'Novo Credenciamento'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Marca *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.marca_credenciada}
                  onChangeText={(text) => setFormData({ ...formData, marca_credenciada: text })}
                  placeholder="Ex: Samsung, LG, Brastemp"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Número do Credenciamento</Text>
                <TextInput
                  style={styles.input}
                  value={formData.numero_credenciamento}
                  onChangeText={(text) => setFormData({ ...formData, numero_credenciamento: text })}
                  placeholder="Número único do credenciamento"
                  placeholderTextColor="#94a3b8"
                />
              </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data de Validade</Text>
              <TextInput
                style={styles.input}
                value={formData.validade_credenciamento}
                onChangeText={(text) => {
                  // Aplicar máscara DD/MM/AAAA
                  let formattedText = text.replace(/\D/g, ''); // Remove tudo que não é dígito
                  
                  if (formattedText.length >= 2) {
                    formattedText = formattedText.substring(0, 2) + '/' + formattedText.substring(2);
                  }
                  if (formattedText.length >= 5) {
                    formattedText = formattedText.substring(0, 5) + '/' + formattedText.substring(5, 9);
                  }
                  
                  setFormData({ ...formData, validade_credenciamento: formattedText });
                }}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#94a3b8"
                maxLength={10}
                keyboardType="numeric"
              />
            </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Especialidades</Text>
                <TextInput
                  style={styles.input}
                  value={formData.especialidades}
                  onChangeText={(text) => setFormData({ ...formData, especialidades: text })}
                  placeholder="Separe por vírgula: Ar condicionado, Instalação"
                  placeholderTextColor="#94a3b8"
                  multiline
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Observações</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.observacoes}
                  onChangeText={(text) => setFormData({ ...formData, observacoes: text })}
                  placeholder="Observações adicionais"
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.switchGroup}>
                <Text style={styles.label}>Certificado Ativo</Text>
                <Switch
                  value={formData.certificado_credenciado}
                  onValueChange={(value) => {
                    setFormData({ ...formData, certificado_credenciado: value });
                  }}
                  trackColor={{ false: '#e2e8f0', true: '#0284c7' }}
                  thumbColor={formData.certificado_credenciado ? '#ffffff' : '#ffffff'}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {credenciamento ? 'Atualizar' : 'Salvar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
