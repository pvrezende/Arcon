import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './PaginacaoProdutos.styles';

interface PaginacaoProdutosProps {
  paginaAtual: number;
  totalPaginas: number;
  onPaginaChange: (pagina: number) => void;
  totalItens: number;
  itensPorPagina: number;
}

const PaginacaoProdutos: React.FC<PaginacaoProdutosProps> = ({
  paginaAtual,
  totalPaginas,
  onPaginaChange,
  totalItens,
  itensPorPagina,
}) => {
  const paginasVisiveis = () => {
    const paginas = [];
    const inicio = Math.max(1, paginaAtual - 2);
    const fim = Math.min(totalPaginas, inicio + 4);
    
    for (let i = inicio; i <= fim; i++) {
      paginas.push(i);
    }
    
    return paginas;
  };

  const itemInicio = (paginaAtual - 1) * itensPorPagina + 1;
  const itemFim = Math.min(paginaAtual * itensPorPagina, totalItens);

  if (totalPaginas <= 1) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Informações dos itens */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Mostrando {itemInicio}-{itemFim} de {totalItens} produtos
        </Text>
      </View>

      {/* Controles de paginação */}
      <View style={styles.paginacaoContainer}>
        {/* Botão Anterior */}
        <TouchableOpacity
          style={[
            styles.botaoNavegacao,
            paginaAtual === 1 && styles.botaoDesabilitado,
          ]}
          onPress={() => onPaginaChange(paginaAtual - 1)}
          disabled={paginaAtual === 1}
        >
          <Ionicons 
            name="chevron-back" 
            size={16} 
            color={paginaAtual === 1 ? '#9CA3AF' : '#374151'} 
          />
        </TouchableOpacity>

        {/* Primeira página se não estiver visível */}
        {paginasVisiveis()[0] > 1 && (
          <>
            <TouchableOpacity
              style={styles.botaoPagina}
              onPress={() => onPaginaChange(1)}
            >
              <Text style={styles.textoPagina}>1</Text>
            </TouchableOpacity>
            {paginasVisiveis()[0] > 2 && (
              <Text style={styles.reticencias}>...</Text>
            )}
          </>
        )}

        {/* Páginas visíveis */}
        {paginasVisiveis().map((pagina) => (
          <TouchableOpacity
            key={pagina}
            style={[
              styles.botaoPagina,
              paginaAtual === pagina && styles.botaoPaginaAtiva,
            ]}
            onPress={() => onPaginaChange(pagina)}
          >
            <Text
              style={[
                styles.textoPagina,
                paginaAtual === pagina && styles.textoPaginaAtiva,
              ]}
            >
              {pagina}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Última página se não estiver visível */}
        {paginasVisiveis()[paginasVisiveis().length - 1] < totalPaginas && (
          <>
            {paginasVisiveis()[paginasVisiveis().length - 1] < totalPaginas - 1 && (
              <Text style={styles.reticencias}>...</Text>
            )}
            <TouchableOpacity
              style={styles.botaoPagina}
              onPress={() => onPaginaChange(totalPaginas)}
            >
              <Text style={styles.textoPagina}>{totalPaginas}</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Botão Próximo */}
        <TouchableOpacity
          style={[
            styles.botaoNavegacao,
            paginaAtual === totalPaginas && styles.botaoDesabilitado,
          ]}
          onPress={() => onPaginaChange(paginaAtual + 1)}
          disabled={paginaAtual === totalPaginas}
        >
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={paginaAtual === totalPaginas ? '#9CA3AF' : '#374151'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PaginacaoProdutos;