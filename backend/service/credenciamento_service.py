from typing import Dict, Any, Optional, List
from DAO.credenciamento_dao import CredenciamentoDAO
from datetime import datetime, date
import logging

logger = logging.getLogger(__name__)


class CredenciamentoService:
    """Service para gerenciar credenciamento de prestadores"""

    def __init__(self, credenciamento_dao: CredenciamentoDAO):
        self.credenciamento_dao = credenciamento_dao

    def _validar_dados_credenciamento(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """Valida e normaliza dados de credenciamento - AGORA SIMPLIFICADA"""
        try:
            # 🔥 AGORA SÓ VALIDA id_prestador - resto vem automaticamente do banco
            if not dados.get('id_prestador'):
                return {
                    "success": False,
                    "error": "ID do prestador (id_prestador) é obrigatório"
                }

            # Converter id_prestador para inteiro
            try:
                dados['id_prestador'] = int(dados['id_prestador'])
            except (ValueError, TypeError):
                return {
                    "success": False,
                    "error": "ID do prestador deve ser um número inteiro"
                }

            # 🔥 VALIDAÇÃO DA DATA DE VALIDADE (se fornecida)
            if dados.get('validade_credenciamento'):
                if isinstance(dados['validade_credenciamento'], str):
                    try:
                        dados['validade_credenciamento'] = datetime.strptime(
                            dados['validade_credenciamento'], '%Y-%m-%d'
                        ).date()
                    except ValueError:
                        return {
                            "success": False,
                            "error": "Data de validade deve estar no formato YYYY-MM-DD"
                        }

            # Converter boolean se necessário
            if 'certificado_credenciado' in dados:
                if isinstance(dados['certificado_credenciado'], str):
                    dados['certificado_credenciado'] = dados['certificado_credenciado'].lower() in ['true', '1', 'sim', 'yes']

            return {"success": True, "data": dados}

        except Exception as e:
            logger.error(f"Erro na validação: {str(e)}")
            return {"success": False, "error": f"Erro na validação: {str(e)}"}

    def criar_credenciamento(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """Cria novo credenciamento de prestador"""
        try:
            # Validar dados
            validacao = self._validar_dados_credenciamento(dados)
            if not validacao["success"]:
                return validacao

            dados_validados = validacao["data"]
            
            # Chamar DAO
            resultado = self.credenciamento_dao.criar_credenciamento(dados_validados)
            
            if resultado["success"]:
                logger.info(f"Credenciamento processado com sucesso para id_prestador: {dados_validados['id_prestador']}")
            
            return resultado

        except Exception as e:
            logger.error(f"Erro no service de credenciamento: {str(e)}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}

    def listar_credenciamentos_prestador(self, prestador_id: int) -> Dict[str, Any]:
        """Lista TODOS os credenciamentos de um prestador específico"""
        try:
            resultado = self.credenciamento_dao.listar_credenciamentos_prestador(prestador_id)
            
            if resultado["success"] and resultado["data"]:
                # Adicionar informações derivadas para cada item
                for item in resultado["data"]:
                    item["status_credenciamento"] = "Ativo" if item.get("certificado_credenciado") else "Não Credenciado"
                    
                    if item.get("validade_credenciamento"):
                        validade = datetime.strptime(item["validade_credenciamento"], '%Y-%m-%d').date()
                        hoje = date.today()
                        item["credenciamento_vencido"] = validade < hoje
                        item["dias_para_vencimento"] = (validade - hoje).days
                    else:
                        item["credenciamento_vencido"] = False
                        item["dias_para_vencimento"] = None
            
            return resultado

        except Exception as e:
            logger.error(f"Erro ao listar credenciamentos do prestador: {str(e)}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}

    def obter_credenciamento_por_id(self, credenciamento_id: int) -> Dict[str, Any]:
        """Obtém um credenciamento específico pelo ID"""
        try:
            resultado = self.credenciamento_dao.obter_credenciamento_por_id(credenciamento_id)
            
            if resultado["success"] and resultado["data"]:
                # Adicionar informações derivadas
                data = resultado["data"]
                data["status_credenciamento"] = "Ativo" if data.get("certificado_credenciado") else "Não Credenciado"
                
                # Verificar validade
                if data.get("validade_credenciamento"):
                    validade = datetime.strptime(data["validade_credenciamento"], '%Y-%m-%d').date()
                    hoje = date.today()
                    data["credenciamento_vencido"] = validade < hoje
                    data["dias_para_vencimento"] = (validade - hoje).days
                else:
                    data["credenciamento_vencido"] = False
                    data["dias_para_vencimento"] = None
            
            return resultado

        except Exception as e:
            logger.error(f"Erro ao obter credenciamento por ID: {str(e)}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}

    def atualizar_credenciamento(self, credenciamento_id: int, dados: Dict[str, Any]) -> Dict[str, Any]:
        """Atualiza um credenciamento específico"""
        try:
            # Validar dados de atualização
            if dados.get('validade_credenciamento'):
                if isinstance(dados['validade_credenciamento'], str):
                    try:
                        dados['validade_credenciamento'] = datetime.strptime(
                            dados['validade_credenciamento'], '%Y-%m-%d'
                        ).date()
                    except ValueError:
                        return {
                            "success": False,
                            "error": "Data de validade deve estar no formato YYYY-MM-DD"
                        }

            # Converter boolean se necessário
            if 'certificado_credenciado' in dados:
                if isinstance(dados['certificado_credenciado'], str):
                    dados['certificado_credenciado'] = dados['certificado_credenciado'].lower() in ['true', '1', 'sim', 'yes']

            resultado = self.credenciamento_dao.atualizar_credenciamento(credenciamento_id, dados)
            
            if resultado["success"]:
                logger.info(f"Credenciamento atualizado com sucesso: {credenciamento_id}")
            
            return resultado

        except Exception as e:
            logger.error(f"Erro ao atualizar credenciamento: {str(e)}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}

    def excluir_credenciamento(self, credenciamento_id: int) -> Dict[str, Any]:
        """Exclui um credenciamento específico"""
        try:
            return self.credenciamento_dao.excluir_credenciamento(credenciamento_id)
        except Exception as e:
            logger.error(f"Erro ao excluir credenciamento: {str(e)}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}

    # 🔥 MÉTODOS LEGADOS (mantidos para compatibilidade)
    
    def obter_credenciamento(self, prestador_id: int) -> Dict[str, Any]:
        """Obtém o credenciamento mais recente de um prestador (método legado)"""
        try:
            resultado = self.credenciamento_dao.obter_credenciamento(prestador_id)
            
            if resultado["success"] and resultado["data"]:
                # Adicionar informações derivadas
                data = resultado["data"]
                data["status_credenciamento"] = "Ativo" if data.get("certificado_credenciado") else "Não Credenciado"
                
                # Verificar validade
                if data.get("validade_credenciamento"):
                    validade = datetime.strptime(data["validade_credenciamento"], '%Y-%m-%d').date()
                    hoje = date.today()
                    data["credenciamento_vencido"] = validade < hoje
                    data["dias_para_vencimento"] = (validade - hoje).days
                else:
                    data["credenciamento_vencido"] = False
                    data["dias_para_vencimento"] = None
            
            return resultado

        except Exception as e:
            logger.error(f"Erro ao obter credenciamento: {str(e)}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}

    def listar_credenciamentos(self, filtros: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Lista credenciamentos com filtros (método legado)"""
        try:
            resultado = self.credenciamento_dao.listar_credenciamentos(filtros)
            
            if resultado["success"] and resultado["data"]:
                # Adicionar informações derivadas para cada item
                for item in resultado["data"]:
                    item["status_credenciamento"] = "Ativo" if item.get("certificado_credenciado") else "Não Credenciado"
                    
                    if item.get("validade_credenciamento"):
                        validade = datetime.strptime(item["validade_credenciamento"], '%Y-%m-%d').date()
                        hoje = date.today()
                        item["credenciamento_vencido"] = validade < hoje
                        item["dias_para_vencimento"] = (validade - hoje).days
                    else:
                        item["credenciamento_vencido"] = False
                        item["dias_para_vencimento"] = None
            
            return resultado

        except Exception as e:
            logger.error(f"Erro ao listar credenciamentos: {str(e)}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}

    def verificar_credenciamento_valido(self, prestador_id: int, marca: str = None) -> Dict[str, Any]:
        """Verifica se prestador tem credenciamento válido para uma marca específica"""
        try:
            # 🔥 AGORA VERIFICA TODOS OS CREDENCIAMENTOS DO PRESTADOR
            resultado = self.listar_credenciamentos_prestador(prestador_id)
            
            if not resultado["success"]:
                return resultado
            
            credenciamentos = resultado["data"]
            
            # Se não há credenciamentos
            if not credenciamentos:
                return {
                    "success": True,
                    "valido": False,
                    "motivo": "Prestador não possui credenciamentos"
                }
            
            # Se foi especificada uma marca, busca credenciamento para aquela marca
            if marca:
                credenciamento_marca = next(
                    (c for c in credenciamentos 
                     if c.get("marca_credenciada") and marca.lower() in c["marca_credenciada"].lower()), 
                    None
                )
                
                if not credenciamento_marca:
                    return {
                        "success": True,
                        "valido": False,
                        "motivo": f"Não credenciado para a marca {marca}"
                    }
                
                # Verificar se é credenciado
                if not credenciamento_marca.get("certificado_credenciado"):
                    return {
                        "success": True,
                        "valido": False,
                        "motivo": "Credenciamento não está ativo para esta marca"
                    }
                
                # Verificar validade
                if credenciamento_marca.get("credenciamento_vencido"):
                    return {
                        "success": True,
                        "valido": False,
                        "motivo": "Credenciamento vencido para esta marca"
                    }
                
                return {
                    "success": True,
                    "valido": True,
                    "data": credenciamento_marca
                }
            
            # Se não foi especificada marca, verifica se tem algum credenciamento válido
            credenciamento_valido = next(
                (c for c in credenciamentos 
                 if c.get("certificado_credenciado") and not c.get("credenciamento_vencido")), 
                None
            )
            
            if credenciamento_valido:
                return {
                    "success": True,
                    "valido": True,
                    "data": credenciamento_valido
                }
            else:
                return {
                    "success": True,
                    "valido": False,
                    "motivo": "Nenhum credenciamento ativo e válido encontrado"
                }

        except Exception as e:
            logger.error(f"Erro ao verificar credenciamento: {str(e)}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}