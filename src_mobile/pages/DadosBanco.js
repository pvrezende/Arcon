import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  FlatList, 
  ActivityIndicator, 
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_CONFIG } from '../../configIp';

const { width } = Dimensions.get('window');

const DadosBanco = () => {
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [statusCounts, setStatusCounts] = useState({ PASS: 0, FAIL: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // URL centralizada no configIp
  const API_URL = `${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.DADOS}`;

  const fetchData = async () => {
    try {
      setError(null);
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`Erro no servidor: ${response.status}`);
      }
      
      const result = await response.json();
      
      setData(result.dados);
      setColumns(result.colunas);
      setStatusCounts(result.status_counts || { PASS: 0, FAIL: 0 });
      
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Erro ao conectar com o servidor. Verifique a URL.');
      Alert.alert('Erro', 'Não foi possível carregar os dados do servidor.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Sistema de Inspeção - Dados do Banco</Text>
      
      <View style={styles.statsContainer}>
        <View style={[styles.statItem, styles.passStat]}>
          <Text style={styles.statCount}>{statusCounts.PASS}</Text>
          <Text style={styles.statLabel}>PASS</Text>
        </View>
        <View style={[styles.statItem, styles.failStat]}>
          <Text style={styles.statCount}>{statusCounts.FAIL}</Text>
          <Text style={styles.statLabel}>FAIL</Text>
        </View>
        <View style={[styles.statItem, styles.totalStat]}>
          <Text style={styles.statCount}>{data.length}</Text>
          <Text style={styles.statLabel}>TOTAL</Text>
        </View>
      </View>

      <Text style={styles.tableInfo}>Tabela: log_inspecao ({columns.length} colunas)</Text>
    </View>
  );

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      {columns.map((column, index) => (
        <View key={index} style={[
          styles.columnHeader,
          { minWidth: Math.max(120, width / columns.length) }
        ]}>
          <Text style={styles.columnHeaderText}>
            {formatColumnName(column)}
          </Text>
        </View>
      ))}
    </View>
  );

  const formatColumnName = (column) => {
    return column
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderTableRow = ({ item, index }) => (
    <View style={[
      styles.tableRow,
      index % 2 === 0 ? styles.evenRow : styles.oddRow
    ]}>
      {columns.map((column, colIndex) => (
        <View key={colIndex} style={[
          styles.tableCell,
          { minWidth: Math.max(120, width / columns.length) }
        ]}>
          <Text style={[
            styles.cellText,
            isStatusColumn(column) && getStatusStyle(item[column])
          ]}>
            {formatCellValue(item[column])}
          </Text>
        </View>
      ))}
    </View>
  );

  const isStatusColumn = (columnName) => {
    return columnName.toLowerCase().includes('status') || 
           columnName.toLowerCase().includes('resultado');
  };

  const getStatusStyle = (status) => {
    if (!status) return null;
    
    const statusStr = String(status).toUpperCase();
    if (statusStr === 'PASS' || statusStr === 'APROVADO' || statusStr === 'OK') {
      return styles.passText;
    } else if (statusStr === 'FAIL' || statusStr === 'REPROVADO' || statusStr === 'NOK') {
      return styles.failText;
    }
    return null;
  };

  const formatCellValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    
    const strValue = String(value);
    if (strValue.length > 20) {
      return strValue.substring(0, 20) + '...';
    }
    return strValue;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>Carregando dados do banco...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Botão Voltar */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Voltar</Text>
      </TouchableOpacity>

      {renderHeader()}
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={true}
            style={styles.horizontalScroll}
          >
            <View>
              {renderTableHeader()}
              <FlatList
                data={data}
                renderItem={renderTableRow}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={true}
                style={styles.tableContainer}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#0284c7']}
                  />
                }
              />
            </View>
          </ScrollView>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Última atualização: {new Date().toLocaleTimeString('pt-BR')}
            </Text>
            <TouchableOpacity onPress={fetchData}>
              <Text style={styles.refreshText}>🔄 Atualizar</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 50,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 15,
    zIndex: 10,
    backgroundColor: '#0284c7',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#1e293b',
  },
  tableInfo: {
    textAlign: 'center',
    fontSize: 14,
    color: '#64748b',
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  statItem: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    minWidth: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  passStat: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
    borderWidth: 1,
  },
  failStat: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    borderWidth: 1,
  },
  totalStat: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    borderWidth: 1,
  },
  statCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
    color: '#475569',
  },
  horizontalScroll: {
    flex: 1,
  },
  tableContainer: {
    maxHeight: 500,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    minWidth: width,
  },
  columnHeader: {
    padding: 15,
    borderRightWidth: 1,
    borderRightColor: '#334155',
    justifyContent: 'center',
  },
  columnHeaderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    minWidth: width,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  evenRow: {
    backgroundColor: 'white',
  },
  oddRow: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 12,
    color: '#334155',
    textAlign: 'center',
  },
  passText: {
    color: '#166534',
    fontWeight: 'bold',
  },
  failText: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
  },
  refreshText: {
    fontSize: 14,
    color: '#0284c7',
    fontWeight: '600',
  },
});

export default DadosBanco;