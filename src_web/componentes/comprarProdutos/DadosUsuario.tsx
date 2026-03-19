import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './DadosUsuario.styles';

interface Endereco {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface CartaoCredito {
  numero: string;
  nome: string;
  vencimento: string;
  cvv: string;
}

interface DadosUsuarioType {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: Endereco;
  cartaoCredito?: CartaoCredito;
}

interface DadosUsuarioProps {
  open: boolean;
  dadosUsuario: DadosUsuarioType;
  onSalvarDados: (dados: DadosUsuarioType) => void;
  onVoltar: () => void;
}

const DadosUsuario: React.FC<DadosUsuarioProps> = ({
  open,
  dadosUsuario,
  onSalvarDados,
  onVoltar,
}) => {
  const [formData, setFormData] = useState<DadosUsuarioType>(dadosUsuario);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string, section?: string) => {
    setFormData(prev => {
      if (section && section === 'endereco') {
        return {
          ...prev,
          endereco: {
            ...prev.endereco,
            [field]: value
          }
        };
      }
      if (section && section === 'cartaoCredito') {
        return {
          ...prev,
          cartaoCredito: {
            ...prev.cartaoCredito,
            numero: field === 'numeroCartao' ? value : prev.cartaoCredito?.numero || '',
            nome: field === 'nomeCartao' ? value : prev.cartaoCredito?.nome || '',
            vencimento: field === 'vencimentoCartao' ? value : prev.cartaoCredito?.vencimento || '',
            cvv: field === 'cvvCartao' ? value : prev.cartaoCredito?.cvv || '',
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatarCPF = (valor: string): string => {
    const numeros = valor.replace(/\\D/g, '');
    return numeros.replace(/(\\d{3})(\\d{3})(\\d{3})(\\d{2})/, '$1.$2.$3-$4');
  };

  const formatarCEP = (valor: string): string => {
    const numeros = valor.replace(/\\D/g, '');
    return numeros.replace(/(\\d{5})(\\d{3})/, '$1-$2');
  };

  const formatarTelefone = (valor: string): string => {
    const numeros = valor.replace(/\\D/g, '');
    if (numeros.length <= 10) {
      return numeros.replace(/(\\d{2})(\\d{4})(\\d{4})/, '($1) $2-$3');
    }
    return numeros.replace(/(\\d{2})(\\d{5})(\\d{4})/, '($1) $2-$3');
  };

  const validarFormulario = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    }

    if (!formData.endereco.cep.trim()) {
      newErrors['endereco.cep'] = 'CEP é obrigatório';
    }

    if (!formData.endereco.rua.trim()) {
      newErrors['endereco.rua'] = 'Rua é obrigatória';
    }

    if (!formData.endereco.numero.trim()) {
      newErrors['endereco.numero'] = 'Número é obrigatório';
    }

    if (!formData.endereco.bairro.trim()) {
      newErrors['endereco.bairro'] = 'Bairro é obrigatório';
    }

    if (!formData.endereco.cidade.trim()) {
      newErrors['endereco.cidade'] = 'Cidade é obrigatória';
    }

    if (!formData.endereco.estado.trim()) {
      newErrors['endereco.estado'] = 'Estado é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSalvar = async () => {
    if (!validarFormulario()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular API call
      onSalvarDados(formData);
      Alert.alert('Sucesso', 'Dados salvos com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onVoltar}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onVoltar}>
            <Ionicons name="arrow-back" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meus Dados</Text>
          <View style={styles.placeholder} />
        </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Seção Dados Pessoais */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color="#2563EB" />
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nome Completo *</Text>
            <TextInput
              style={[styles.input, errors.nome && styles.inputError]}
              value={formData.nome}
              onChangeText={(text) => handleInputChange('nome', text)}
              placeholder="Digite seu nome completo"
            />
            {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="Digite seu email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Telefone *</Text>
              <TextInput
                style={[styles.input, errors.telefone && styles.inputError]}
                value={formData.telefone}
                onChangeText={(text) => handleInputChange('telefone', formatarTelefone(text))}
                placeholder="(11) 99999-9999"
                keyboardType="phone-pad"
                maxLength={15}
              />
              {errors.telefone && <Text style={styles.errorText}>{errors.telefone}</Text>}
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>CPF *</Text>
              <TextInput
                style={[styles.input, errors.cpf && styles.inputError]}
                value={formData.cpf}
                onChangeText={(text) => handleInputChange('cpf', formatarCPF(text))}
                placeholder="000.000.000-00"
                keyboardType="numeric"
                maxLength={14}
              />
              {errors.cpf && <Text style={styles.errorText}>{errors.cpf}</Text>}
            </View>
          </View>
        </View>

        {/* Seção Cartão de Crédito */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={20} color="#2563EB" />
            <Text style={styles.sectionTitle}>Método de Pagamento</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Número do Cartão</Text>
            <TextInput
              style={[
                styles.input,
                errors.numeroCartao && styles.inputError,
              ]}
              placeholder="0000 0000 0000 0000"
              value={formData.cartaoCredito?.numero || ''}
              onChangeText={(text) => {
                // Formatação do número do cartão
                const cleanText = text.replace(/\D/g, '');
                const formattedText = cleanText.replace(/(\d{4})(?=\d)/g, '$1 ');
                handleInputChange('numeroCartao', formattedText.slice(0, 19), 'cartaoCredito');
              }}
              keyboardType="numeric"
              maxLength={19}
            />
            {errors.numeroCartao && (
              <Text style={styles.errorText}>{errors.numeroCartao}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nome no Cartão</Text>
            <TextInput
              style={[
                styles.input,
                errors.nomeCartao && styles.inputError,
              ]}
              placeholder="Nome conforme impresso no cartão"
              value={formData.cartaoCredito?.nome || ''}
              onChangeText={(text) => handleInputChange('nomeCartao', text.toUpperCase(), 'cartaoCredito')}
              autoCapitalize="characters"
            />
            {errors.nomeCartao && (
              <Text style={styles.errorText}>{errors.nomeCartao}</Text>
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Validade</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.vencimentoCartao && styles.inputError,
                ]}
                placeholder="MM/AA"
                value={formData.cartaoCredito?.vencimento || ''}
                onChangeText={(text) => {
                  // Formatação MM/AA
                  const cleanText = text.replace(/\D/g, '');
                  const formattedText = cleanText.replace(/(\d{2})(\d)/, '$1/$2');
                  handleInputChange('vencimentoCartao', formattedText.slice(0, 5), 'cartaoCredito');
                }}
                keyboardType="numeric"
                maxLength={5}
              />
              {errors.vencimentoCartao && (
                <Text style={styles.errorText}>{errors.vencimentoCartao}</Text>
              )}
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.cvvCartao && styles.inputError,
                ]}
                placeholder="123"
                value={formData.cartaoCredito?.cvv || ''}
                onChangeText={(text) => handleInputChange('cvvCartao', text.replace(/\D/g, ''), 'cartaoCredito')}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
              {errors.cvvCartao && (
                <Text style={styles.errorText}>{errors.cvvCartao}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Seção Endereço */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color="#2563EB" />
            <Text style={styles.sectionTitle}>Endereço</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>CEP *</Text>
              <TextInput
                style={[styles.input, errors['endereco.cep'] && styles.inputError]}
                value={formData.endereco.cep}
                onChangeText={(text) => handleInputChange('cep', formatarCEP(text), 'endereco')}
                placeholder="00000-000"
                keyboardType="numeric"
                maxLength={9}
              />
              {errors['endereco.cep'] && <Text style={styles.errorText}>{errors['endereco.cep']}</Text>}
            </View>

            <View style={[styles.inputContainer, { flex: 2, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Rua *</Text>
              <TextInput
                style={[styles.input, errors['endereco.rua'] && styles.inputError]}
                value={formData.endereco.rua}
                onChangeText={(text) => handleInputChange('rua', text, 'endereco')}
                placeholder="Nome da rua"
              />
              {errors['endereco.rua'] && <Text style={styles.errorText}>{errors['endereco.rua']}</Text>}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Número *</Text>
              <TextInput
                style={[styles.input, errors['endereco.numero'] && styles.inputError]}
                value={formData.endereco.numero}
                onChangeText={(text) => handleInputChange('numero', text, 'endereco')}
                placeholder="123"
                keyboardType="numeric"
              />
              {errors['endereco.numero'] && <Text style={styles.errorText}>{errors['endereco.numero']}</Text>}
            </View>

            <View style={[styles.inputContainer, { flex: 2, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Complemento</Text>
              <TextInput
                style={styles.input}
                value={formData.endereco.complemento}
                onChangeText={(text) => handleInputChange('complemento', text, 'endereco')}
                placeholder="Apt, bloco, etc."
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Bairro *</Text>
            <TextInput
              style={[styles.input, errors['endereco.bairro'] && styles.inputError]}
              value={formData.endereco.bairro}
              onChangeText={(text) => handleInputChange('bairro', text, 'endereco')}
              placeholder="Nome do bairro"
            />
            {errors['endereco.bairro'] && <Text style={styles.errorText}>{errors['endereco.bairro']}</Text>}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 2, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Cidade *</Text>
              <TextInput
                style={[styles.input, errors['endereco.cidade'] && styles.inputError]}
                value={formData.endereco.cidade}
                onChangeText={(text) => handleInputChange('cidade', text, 'endereco')}
                placeholder="Nome da cidade"
              />
              {errors['endereco.cidade'] && <Text style={styles.errorText}>{errors['endereco.cidade']}</Text>}
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Estado *</Text>
              <TextInput
                style={[styles.input, errors['endereco.estado'] && styles.inputError]}
                value={formData.endereco.estado}
                onChangeText={(text) => handleInputChange('estado', text.toUpperCase(), 'endereco')}
                placeholder="SP"
                maxLength={2}
                autoCapitalize="characters"
              />
              {errors['endereco.estado'] && <Text style={styles.errorText}>{errors['endereco.estado']}</Text>}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSalvar}
          disabled={isLoading}
        >
          <Ionicons name="save" size={20} color="white" />
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Salvando...' : 'Salvar Dados'}
          </Text>
        </TouchableOpacity>
      </View>
      </View>
    </Modal>
  );
};

export default DadosUsuario;

