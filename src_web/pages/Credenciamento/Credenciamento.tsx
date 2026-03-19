import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../../componentes/navbar';
import Navegacao from '../../componentes/Navegacao';
import { CredenciamentoModal } from '../../componentes/credenciamento/CredenciamentoModal';
import { CredenciamentoCard } from '../../componentes/credenciamento/CredenciamentoCard';
import ConfirmacaoModal from '../../componentes/credenciamento/ConfirmacaoModal';
import SucessoModal from '../../componentes/credenciamento/SucessoModal';
import { useAuth } from '../../hooks/useAuth';
import { API_CONFIG } from '../../../configIp';
import { Credenciamento, CredenciamentoPageProps, CredenciamentoFormData } from '../../types/credenciamento';
import styles from './Credenciamento.styles';


const CredenciamentoPage: React.FC<CredenciamentoPageProps> = ({ navigation }) => {
  const { userData } = useAuth();
  const prestadorId = userData?.id_prestador || userData?.id_usuario;

  const [credenciamentos, setCredenciamentos] = useState<Credenciamento[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCredenciamento, setEditingCredenciamento] = useState<Credenciamento | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmacaoModalVisible, setConfirmacaoModalVisible] = useState(false);
  const [sucessoModalVisible, setSucessoModalVisible] = useState(false);
  const [credenciamentoToDelete, setCredenciamentoToDelete] = useState<number | null>(null);

  const fetchCredenciamentos = async () => {
    if (!prestadorId) return;
    
    try {
      setLoading(true);
      const url = `${API_CONFIG.BACKEND_URL}/credenciamento/prestador/${prestadorId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          setCredenciamentos([]);
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const credenciamentosList = data.credenciamentos || [];
      
      setCredenciamentos(credenciamentosList);
    } catch (error: unknown) {
      if (error instanceof Error && error.message && error.message.includes('404')) {
        setCredenciamentos([]);
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os credenciamentos');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (prestadorId) {
      fetchCredenciamentos();
    }
  }, [prestadorId]);

  const handleAddCredenciamento = () => {
    setEditingCredenciamento(null);
    setModalVisible(true);
  };

  const handleEditCredenciamento = (credenciamento: Credenciamento) => {
    console.log('✏️ Editando credenciamento:', credenciamento);
    console.log('✏️ Dados do credenciamento:', {
      id_credenciamento: credenciamento.id_credenciamento,
      marca_credenciada: credenciamento.marca_credenciada,
      certificado_credenciado: credenciamento.certificado_credenciado,
      numero_credenciamento: credenciamento.numero_credenciamento,
      validade_credenciamento: credenciamento.validade_credenciamento,
      especialidades: credenciamento.especialidades,
      observacoes: credenciamento.observacoes,
    });
    setEditingCredenciamento(credenciamento);
    setModalVisible(true);
  };

  const handleDeleteCredenciamento = async (id: number) => {
    setCredenciamentoToDelete(id);
    setConfirmacaoModalVisible(true);
  };

  const executeDelete = async (id: number) => {
    try {
      const url = `${API_CONFIG.BACKEND_URL}/credenciamento/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchCredenciamentos();
        setConfirmacaoModalVisible(false);
      } else {
        const errorText = await response.text();
        Alert.alert('Erro', `Não foi possível excluir o credenciamento: ${response.status}`);
      }
    } catch (error: unknown) {
      Alert.alert('Erro', 'Não foi possível excluir o credenciamento');
    }
  };

  const handleSaveCredenciamento = async (data: CredenciamentoFormData) => {
    if (!prestadorId) return;
    
    try {
      if (editingCredenciamento && (!editingCredenciamento.id_credenciamento || editingCredenciamento.id_credenciamento === undefined)) {
        Alert.alert('Erro', 'Não foi possível identificar o credenciamento para edição');
        return;
      }

      const url = editingCredenciamento 
        ? `${API_CONFIG.BACKEND_URL}/credenciamento/${editingCredenciamento.id_credenciamento}`
        : `${API_CONFIG.BACKEND_URL}/credenciamento/`;
      
      const method = editingCredenciamento ? 'PUT' : 'POST';
      
      const formData = new URLSearchParams();
      
      if (editingCredenciamento) {
        Object.entries(data).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            formData.append(key, value.toString());
          }
        });
      } else {
        formData.append('id_prestador', prestadorId.toString());
        Object.entries(data).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            formData.append(key, value.toString());
          }
        });
      }


      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });


      if (response.ok) {
        const responseData = await response.json();
        setModalVisible(false);
        fetchCredenciamentos();
        
        if (editingCredenciamento) {
          setSucessoModalVisible(true);
        } else {
          Alert.alert('Sucesso', 'Credenciamento criado!');
        }
      } else {
        const errorText = await response.text();
        Alert.alert('Erro', `Erro ${response.status}: ${errorText}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      Alert.alert('Erro', `Erro de conexão: ${errorMessage}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Navbar navigation={navigation} />
      
      <Navegacao 
        items={[
          { label: 'AreaPrestador', onPress: () => navigation.navigate('AreaPrestador') },
          { label: 'Credenciamento', isActive: true }
        ]}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="ribbon" size={28} color="#0284c7" />
            <Text style={styles.title}>Credenciamentos</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddCredenciamento}>
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Novo</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Gerencie seus credenciamentos e certificações
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        ) : credenciamentos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="ribbon-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>Nenhum credenciamento encontrado</Text>
            <Text style={styles.emptySubtext}>Adicione seu primeiro credenciamento</Text>
          </View>
        ) : (
          <FlatList
            data={credenciamentos}
            keyExtractor={(item, index) => {
              if (item && typeof item === 'object' && item.id_credenciamento) {
                return item.id_credenciamento.toString();
              }
              return `credenciamento-${index}`;
            }}
            renderItem={({ item }) => {
              if (!item || typeof item !== 'object') {
                return null;
              }
              
              return (
                <CredenciamentoCard
                  credenciamento={item}
                  onEdit={handleEditCredenciamento}
                  onDelete={handleDeleteCredenciamento}
                />
              );
            }}
            showsVerticalScrollIndicator={false}
          />
        )}

        <CredenciamentoModal
          visible={modalVisible}
          credenciamento={editingCredenciamento}
          onClose={() => setModalVisible(false)}
          onSave={handleSaveCredenciamento}
        />

        <ConfirmacaoModal
          visible={confirmacaoModalVisible}
          onClose={() => {
            setConfirmacaoModalVisible(false);
            setCredenciamentoToDelete(null);
          }}
          onConfirm={() => {
            if (credenciamentoToDelete) {
              executeDelete(credenciamentoToDelete);
            }
          }}
          title="Confirmar Exclusão"
          message="Tem certeza que deseja excluir este credenciamento?"
          confirmText="Excluir"
          cancelText="Cancelar"
        />

        <SucessoModal
          visible={sucessoModalVisible}
          onClose={() => setSucessoModalVisible(false)}
          title="Credenciamento Atualizado!"
          message="Seu credenciamento foi atualizado com sucesso."
          buttonText="Entendi"
        />
      </View>
    </SafeAreaView>
  );
};

export default CredenciamentoPage;