import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { API_CONFIG } from '../../configIp';

const { width } = Dimensions.get('window');

const MySQLDataViewer = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [statusCounts, setStatusCounts] = useState({ PASS: 0, FAIL: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // URL centralizada no configIp
  const API_URL = `${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.DADOS}`;

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      
      setData(result.dados);
      setColumns(result.colunas);
      setStatusCounts(result.status_counts);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Erro ao carregar dados do servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Atualizar dados a cada 30 segundos (opcional)
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Sistema de Inspeção</Text>
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
    </View>
  );

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      {columns.map((column, index) => (
        <View key={index} style={styles.columnHeader}>
          <Text style={styles.columnHeaderText}>
            {column.toUpperCase()}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderTableRow = ({ item, index }) => (
    <View style={[
      styles.tableRow,
      index % 2 === 0 ? styles.evenRow : styles.oddRow
    ]}>
      {columns.map((column, colIndex) => (
        <View key={colIndex} style={styles.tableCell}>
          <Text style={[
            styles.cellText,
            column.toLowerCase().includes('status') && getStatusStyle(item[column])
          ]}>
            {String(item[column] || 'N/A')}
          </Text>
        </View>
      ))}
    </View>
  );

  const getStatusStyle = (status) => {
    const statusStr = String(status).toUpperCase();
    if (statusStr === 'PASS' || statusStr === 'APROVADO') {
      return styles.passText;
    } else if (statusStr === 'FAIL' || statusStr === 'REPROVADO') {
      return styles.failText;
    }
    return null;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={fetchData}>
          Tentar novamente
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View>
          {renderTableHeader()}
          <FlatList
            data={data}
            renderItem={renderTableRow}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={true}
            style={styles.tableContainer}
          />
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Última atualização: {new Date().toLocaleTimeString()}
        </Text>
        <Text style={styles.refreshText} onPress={fetchData}>
          Atualizar
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    minWidth: 80,
  },
  passStat: {
    backgroundColor: '#d4edda',
  },
  failStat: {
    backgroundColor: '#f8d7da',
  },
  totalStat: {
    backgroundColor: '#d1ecf1',
  },
  statCount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  tableContainer: {
    maxHeight: 500,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#343a40',
    minWidth: width,
  },
  columnHeader: {
    padding: 12,
    minWidth: 120,
    borderRightWidth: 1,
    borderRightColor: '#495057',
  },
  columnHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tableRow: {
    flexDirection: 'row',
    minWidth: width,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  evenRow: {
    backgroundColor: '#fff',
  },
  oddRow: {
    backgroundColor: '#f8f9fa',
  },
  tableCell: {
    padding: 10,
    minWidth: 120,
    borderRightWidth: 1,
    borderRightColor: '#dee2e6',
  },
  cellText: {
    fontSize: 12,
    color: '#333',
  },
  passText: {
    color: '#155724',
    fontWeight: 'bold',
  },
  failText: {
    color: '#721c24',
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryText: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
  refreshText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default MySQLDataViewer;