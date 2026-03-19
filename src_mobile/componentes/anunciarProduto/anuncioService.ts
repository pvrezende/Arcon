// Serviço para integração com API de anúncios
import { API_CONFIG } from '../../../configIp';

export interface AnuncioData {
  nome: string;
  marca: string;
  endereco: string;
  valor1: string;
  valor2: string;
  btu: string;
  especificacao: string;
  tipo: string;
  prestador_id: string;
}

export const anunciarProduto = async (dados: AnuncioData): Promise<any> => {
  try {
    // Validar e limpar dados antes do envio
    const dadosLimpos = {
      nome: dados.nome.trim(),
      marca: dados.marca,
      endereco: dados.endereco.trim(),
      valor1: dados.valor1 ? dados.valor1.replace(/[^0-9.,]/g, '').replace(',', '.') : '0',
      valor2: dados.valor2.replace(/[^0-9.,]/g, '').replace(',', '.'),
      btu: dados.btu,
      especificacao: dados.especificacao.trim(),
      tipo: dados.tipo,
      prestador_id: dados.prestador_id
    };

    const formData = new URLSearchParams();
    formData.append('nome', dadosLimpos.nome);
    formData.append('marca', dadosLimpos.marca);
    formData.append('endereco', dadosLimpos.endereco);
    formData.append('valor1', dadosLimpos.valor1);
    formData.append('valor2', dadosLimpos.valor2);
    formData.append('btu', dadosLimpos.btu);
    formData.append('especificacao', dadosLimpos.especificacao);
    formData.append('tipo', dadosLimpos.tipo);
    formData.append('prestador_id', dadosLimpos.prestador_id);

    const response = await fetch(`${API_CONFIG.BACKEND_URL}/anunciar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao anunciar produto. Tente novamente.`);
    }

    const result = await response.text();
    return result;
  } catch (error) {
    throw error;
  }
};