from typing import Dict, Any, Optional, List
from DAO.proposta_dao import PropostaDAO
import logging

logger = logging.getLogger(__name__)

class PropostaService:
    """Service unificado para gerenciar Solicitações e Propostas"""
    
    def __init__(self, dao: PropostaDAO):
        self.dao = dao
    
    def criar_proposta_servico(self, proposta_data: Dict[str, Any]) -> Dict[str, Any]:
        """Cria uma nova solicitação com validações de negócio"""
        try:
            # Validar dados
            validacao = self._validar_dados_solicitacao(proposta_data)
            if not validacao['success']:
                return validacao
            
            # Criar solicitação no banco
            resultado = self.dao.criar_solicitacao(proposta_data)
            return resultado
            
        except Exception as e:
            logger.error(f"Erro ao criar solicitacao no service: {e}")
            return {"success": False, "error": str(e)}
    
    def _validar_dados_solicitacao(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """Valida dados de criação de solicitação"""
        try:
            # Campos obrigatórios (aceita diferentes chaves)
            required = ['user_id', 'id_usuario', 'USER_ID']
            if not any(dados.get(k) for k in required):
                return {"success": False, "error": "Campo user_id obrigatório"}
            
            for campo in ['tag', 'servico', 'marca']:
                if not dados.get(campo):
                    return {
                        "success": False, 
                        "error": f"Campo {campo} é obrigatório"
                    }
            
            return {"success": True}
            
        except Exception as e:
            logger.error(f"Erro ao validar dados: {e}")
            return {"success": False, "error": str(e)}
    
    def listar_servicos_disponiveis(self, prestador_id: int) -> Dict[str, Any]:
        """Lista serviços disponíveis para um prestador"""
        try:
            resultado = self.dao.listar_solicitacoes_para_prestador(prestador_id)
            return resultado
            
        except Exception as e:
            logger.error(f"Erro ao listar servicos disponiveis: {e}")
            return {"success": False, "error": str(e)}
    
    def enviar_proposta_prestador(self, proposta_data: Dict[str, Any]) -> Dict[str, Any]:
        """Envia proposta de um prestador para uma solicitação"""
        try:
            # Validar campos obrigatórios
            campos_obrigatorios = ['solicitacao_id', 'prestador_id', 'valor', 'mensagem']
            for campo in campos_obrigatorios:
                if proposta_data.get(campo) is None or (campo == 'valor' and proposta_data.get(campo) is None):
                    return {"success": False, "error": f"Campo {campo} é obrigatório"}
            
            # CORREÇÃO: Permite valor 0 ou positivo
            if proposta_data.get('valor') is not None and proposta_data['valor'] < 0:
                return {"success": False, "error": "Valor não pode ser negativo"}

            # Verificar se solicitação está disponível para propostas
            solicitacao = self.dao.buscar_solicitacao_por_id(proposta_data['solicitacao_id'])
            if not solicitacao['success'] or solicitacao['data']['status'] not in ['aberta', 'em_analise']:
                return {"success": False, "error": "Solicitação não disponível para propostas"}
            
            # Verificar se prestador já enviou proposta
            proposta_existente = self.dao.buscar_proposta_por_solicitacao_prestador(
                proposta_data['solicitacao_id'], proposta_data['prestador_id']
            )
            if proposta_existente['success'] and proposta_existente['data']:
                return {"success": False, "error": "Você já enviou uma proposta para esta solicitação"}
            
            # Enviar proposta
            resultado = self.dao.enviar_proposta(proposta_data)
            
            # CORREÇÃO: Manter status 'aberta' para permitir múltiplas propostas
            # Status só muda para 'fechada' quando cliente aceitar uma proposta
            
            return resultado
            
        except Exception as e:
            logger.error(f"Erro ao enviar proposta: {e}")
            return {"success": False, "error": str(e)}
    
    def listar_propostas_cliente(self, user_id: int) -> Dict[str, Any]:
        """Lista propostas recebidas por um cliente"""
        try:
            propostas = self.dao.listar_propostas_cliente(user_id)
            return {"success": True, "data": propostas}
            
        except Exception as e:
            logger.error(f"Erro ao listar propostas cliente: {e}")
            return {"success": False, "error": str(e)}
    
    def aceitar_proposta(self, proposta_id: int, user_id: int) -> Dict[str, Any]:
        """Cliente aceita uma proposta específica"""
        try:
            # Buscar proposta para validar
            proposta = self.dao.buscar_proposta_por_id(proposta_id)
            if not proposta['success']:
                return proposta
            
            # Validar se o usuário é dono da solicitação
            solicitacao = self.dao.buscar_solicitacao_por_id(proposta['data']['solicitacao_id'])
            if not solicitacao['success'] or solicitacao['data']['id_usuario'] != user_id:
                return {"success": False, "error": "Não autorizado a aceitar esta proposta"}
            
            # Aceitar proposta
            resultado = self.dao.aceitar_proposta(user_id, proposta_id)
            
            # Se sucesso, o DAO já faz o fechamento e rejeição automática
            # Não precisa fazer nada adicional aqui
            
            return resultado
            
        except Exception as e:
            logger.error(f"Erro ao aceitar proposta: {e}")
            return {"success": False, "error": str(e)}
    
    def rejeitar_proposta(self, proposta_id: int, user_id: int) -> Dict[str, Any]:
        """Cliente rejeita uma proposta específica"""
        try:
            # Buscar proposta para validar
            proposta = self.dao.buscar_proposta_por_id(proposta_id)
            if not proposta['success']:
                return proposta
            
            # Validar se o usuário é dono da solicitação
            solicitacao = self.dao.buscar_solicitacao_por_id(proposta['data']['solicitacao_id'])
            if not solicitacao['success'] or solicitacao['data']['id_usuario'] != user_id:
                return {"success": False, "error": "Não autorizado a rejeitar esta proposta"}
            
            # Rejeitar proposta
            resultado = self.dao.rejeitar_proposta(user_id, proposta_id)
            return resultado
            
        except Exception as e:
            logger.error(f"Erro ao rejeitar proposta: {e}")
            return {"success": False, "error": str(e)}
    
    def listar_propostas_prestador(self, prestador_id: int) -> Dict[str, Any]:
        """Lista propostas enviadas por um prestador"""
        try:
            resultado = self.dao.listar_propostas_prestador(prestador_id)
            return resultado
            
        except Exception as e:
            logger.error(f"Erro ao listar propostas prestador: {e}")
            return {"success": False, "error": str(e)}
    
    def buscar_detalhes_solicitacao(self, solicitacao_id: int) -> Dict[str, Any]:
        """Busca detalhes completos de uma solicitação"""
        try:
            resultado = self.dao.buscar_solicitacao_por_id(solicitacao_id)
            return resultado
            
        except Exception as e:
            logger.error(f"Erro ao buscar detalhes solicitacao: {e}")
            return {"success": False, "error": str(e)}

    # MÉTODOS DE COMPATIBILIDADE - Mantém funcionamento com frontend existente
    def criar_solicitacao(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """Método de compatibilidade - mesmo que criar_proposta_servico"""
        return self.criar_proposta_servico(dados)
    
    def listar_solicitacoes_para_prestador(self, prestador_id: int) -> Dict[str, Any]:
        """Método de compatibilidade - mesmo que listar_servicos_disponiveis"""
        return self.listar_servicos_disponiveis(prestador_id)
    
    def enviar_proposta(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """Método de compatibilidade - mesmo que enviar_proposta_prestador"""
        return self.enviar_proposta_prestador(dados)
    
    def listar_propostas_por_usuario(self, user_id: int) -> Dict[str, Any]:
        """Método de compatibilidade - mesmo que listar_propostas_cliente"""
        return self.listar_propostas_cliente(user_id)
    
    def recusar_solicitacao(self, solicitacao_id: int, prestador_id: int) -> Dict[str, Any]:
        """Prestador recusa uma solicitação"""
        try:
            resultado = self.dao.recusar_solicitacao(solicitacao_id, prestador_id)
            return resultado
            
        except Exception as e:
            logger.error(f"Erro ao recusar solicitacao no service: {e}")
            return {"success": False, "error": str(e)}
