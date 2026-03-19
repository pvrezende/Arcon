// Serviço para buscar produtos usados
import { API_CONFIG } from '../../../configIp';

export interface ProdutoUsado {
  id: number;
  NOME: string;
  MARCA: string;
  ENDERECO: string;
  VALOR1: number;
  VALOR2: number;
  BTU: number;
  ESPPRO: string;
  created_at: string;
  VIEW?: number; // Adicionando VIEW que vem do banco
}

export interface ProdutoFormatado {
  id: string;
  modelo: string;
  marca: string;
  btu: string;
  caracteristicas: string[];
  preco: number;
  precoOriginal?: number;
  desconto: number;
  frete: string;
  disponivel: boolean;
  loja: {
    nome: string;
    avaliacao: number;
    avaliacoes: number;
    endereco: string;
  };
  imagem?: string;
  descricaoCompleta?: string;
  views?: number;
}

export const buscarProdutosUsados = async (): Promise<ProdutoFormatado[]> => {
  try {
    // 🔥 MUDANÇA AQUI: Usar a rota MVC correta
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/anuncios/usados`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar produtos: ${response.status}`);
    }

    const result = await response.json();
    
    // 🔥 MUDANÇA AQUI: A estrutura da resposta mudou no MVC
    if (result.success && result.anuncios) {
      // Converter dados do banco para o formato esperado pela tela
      return result.anuncios.map((produto: ProdutoUsado): ProdutoFormatado => {
        const desconto = produto.VALOR1 > 0 
          ? Math.round(((produto.VALOR1 - produto.VALOR2) / produto.VALOR1) * 100)
          : 0;

        // Gerar palavras-chave baseadas na descrição
        const gerarPalavrasChave = (descricao: string): string[] => {
          const palavrasChave = [];
          const descricaoLower = descricao.toLowerCase();
          
          // Adicionar tipo baseado na descrição
          if (descricaoLower.includes('split') || descricaoLower.includes('hi wall')) {
            palavrasChave.push('Split Hi Wall');
          } else if (descricaoLower.includes('janela')) {
            palavrasChave.push('Ar de Janela');
          } else if (descricaoLower.includes('cassete')) {
            palavrasChave.push('Cassete');
          } else if (descricaoLower.includes('piso')) {
            palavrasChave.push('Piso Teto');
          } else {
            palavrasChave.push('Split');
          }
          
          // Adicionar função baseada na descrição
          if (descricaoLower.includes('frio') && descricaoLower.includes('quente')) {
            palavrasChave.push('Quente/Frio');
          } else if (descricaoLower.includes('frio')) {
            palavrasChave.push('Só Frio');
          }
          
          // Adicionar tecnologia inverter se mencionada
          if (descricaoLower.includes('inverter')) {
            palavrasChave.push('Inverter');
          }
          
          // Adicionar eficiência energética se mencionada
          if (descricaoLower.includes('selo a') || descricaoLower.includes('classe a')) {
            palavrasChave.push('Selo A');
          }
          
          // Se não encontrou características específicas, usar as primeiras palavras da descrição
          if (palavrasChave.length < 2) {
            const primeiraParte = produto.ESPPRO.split('.')[0]?.trim();
            if (primeiraParte && primeiraParte.length < 20) {
              palavrasChave.push(primeiraParte);
            }
          }
          
          return palavrasChave.slice(0, 3);
        };

        return {
          id: produto.id.toString(),
          modelo: produto.NOME,
          marca: produto.MARCA,
          btu: produto.BTU.toString(),
          caracteristicas: gerarPalavrasChave(produto.ESPPRO),
          preco: produto.VALOR2,
          precoOriginal: produto.VALOR1 > 0 ? produto.VALOR1 : undefined,
          desconto,
          frete: 'A combinar',
          disponivel: true,
          loja: {
            nome: 'Vendedor Particular',
            avaliacao: 4.5,
            avaliacoes: 1,
            endereco: produto.ENDERECO,
          },
          imagem: undefined,
          descricaoCompleta: produto.ESPPRO,
          views: produto.VIEW || 0 // 🔥 Agora usando o VIEW real do banco
        };
      });
    }

    return [];
  } catch (error) {
    console.error('Erro ao buscar produtos usados:', error);
    throw error;
  }
};