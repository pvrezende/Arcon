// Serviço de CEP com múltiplas APIs de fallback
export interface EnderecoData {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export class CepService {
  private static readonly TIMEOUT = 5000; // 5 segundos

  // Lista de APIs de CEP em ordem de prioridade
  private static readonly CEP_APIS = [
    {
      name: 'ViaCEP',
      url: (cep: string) => `https://viacep.com.br/ws/${cep}/json/`,
      transform: (data: any): EnderecoData => ({
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        localidade: data.localidade || '',
        uf: data.uf || '',
        erro: data.erro || false
      })
    },
    {
      name: 'BrasilAPI',
      url: (cep: string) => `https://brasilapi.com.br/api/cep/v1/${cep}`,
      transform: (data: any): EnderecoData => ({
        logradouro: data.street || '',
        bairro: data.neighborhood || '',
        localidade: data.city || '',
        uf: data.state || '',
        erro: false
      })
    },
    {
      name: 'OpenCEP',
      url: (cep: string) => `https://opencep.com/v1/${cep}`,
      transform: (data: any): EnderecoData => ({
        logradouro: data.logradouro || '',
        bairro: data.distrito || '',
        localidade: data.localidade || '',
        uf: data.uf || '',
        erro: false
      })
    }
  ];

  /**
   * Busca informações de endereço por CEP usando múltiplas APIs
   */
  static async buscarCep(cep: string): Promise<EnderecoData | null> {
    const cepLimpo = cep.replace(/\D/g, '');
    
    // Validação básica do CEP
    if (cepLimpo.length !== 8) {
      throw new Error('CEP deve conter exatamente 8 dígitos');
    }

    // Tenta cada API em sequência
    for (const api of this.CEP_APIS) {
      try {
        console.log(`🔍 Tentando buscar CEP ${cepLimpo} na API: ${api.name}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

        const response = await fetch(api.url(cepLimpo), {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const endereco = api.transform(data);

        // Verifica se a API retornou erro ou dados vazios
        if (endereco.erro || (!endereco.logradouro && !endereco.bairro && !endereco.localidade)) {
          throw new Error('CEP não encontrado nesta API');
        }

        console.log(`✅ CEP encontrado na API ${api.name}:`, endereco);
        return endereco;

      } catch (error) {
        console.warn(`❌ Erro na API ${api.name}:`, error);
        
        // Se foi o último da lista, propaga o erro
        if (api === this.CEP_APIS[this.CEP_APIS.length - 1]) {
          throw new Error('Nenhuma API de CEP está disponível no momento');
        }
        
        // Continua para a próxima API
        continue;
      }
    }

    return null;
  }

  /**
   * Formata CEP para exibição (00000-000)
   */
  static formatarCep(cep: string): string {
    const numbers = cep.replace(/\D/g, '');
    if (numbers.length <= 8) {
      if (numbers.length <= 5) return numbers;
      else return numbers.replace(/(\d{5})(\d{0,3})/, '$1-$2');
    }
    return cep;
  }

  /**
   * Valida se o CEP tem formato correto
   */
  static validarCep(cep: string): boolean {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.length === 8;
  }
}
