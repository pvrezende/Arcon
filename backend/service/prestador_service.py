from supabase_client import supabase
from DAO.prestador_dao import PrestadorDAO
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class PrestadorService:
    
    @staticmethod
    def servicos_para_prestador(prestador_id: str):
        """Retorna serviços DISPONÍVEIS para o prestador aceitar (exclusivos + gerais)"""
        try:
            # Buscar todos os serviços
            response = supabase.table("bancodedadoscar").select("*").execute()
            if not response.data:
                return []

            # Buscar recusas do prestador
            recusas_response = supabase.table("recusas_servico") \
                .select("servico_id") \
                .eq("prestador_id", prestador_id) \
                .execute()

            # Criar set de IDs recusados
            recusados_ids = set()
            if recusas_response.data:
                for recusa in recusas_response.data:
                    servico_id = recusa.get("servico_id")
                    if servico_id is not None:
                        recusados_ids.add(str(servico_id))

            servicos_filtrados = []
            
            for item in response.data:
                item_id = str(item.get('id'))
                
                # Não mostrar serviços recusados
                if item_id in recusados_ids:
                    continue
                    
                # Verificar se o serviço é para esse prestador específico
                item_prestador_id = item.get('prestador_id')
                
                # Se o serviço tem prestador_id, só mostra para esse prestador específico
                if item_prestador_id:
                    if str(item_prestador_id) != str(prestador_id):
                        continue  # Pula serviços exclusivos de outros prestadores
                    
                # Verificar campos obrigatórios
                campos_obrigatorios = {
                    'CLIENTE': item.get('CLIENTE'),
                    'TAG': item.get('TAG'),
                    'BTU': item.get('BTU'),
                    'SERVICO': item.get('SERVICO'),
                    'MARCA': item.get('MARCA')
                }
                
                campos_faltando = [campo for campo, valor in campos_obrigatorios.items() if not valor]
                if campos_faltando:
                    continue
                    
                # Verificar confirmação
                confirmar = str(item.get('CONFIRMAR', '')).lower()
                if confirmar not in ['true', '1', 'sim', 'verdadeiro']:
                    continue
                    
                # Verificar decisões
                if item.get('DECISAO2') is not None:
                    continue
                    
                if item.get('DECISAO') == 'recusado_prestador':
                    continue
                    
                # Não mostrar serviços já com proposta e decisão
                if item.get('PROPOSTA') and item.get('DECISAO'):
                    continue
                
                servicos_filtrados.append(item)
            
            return servicos_filtrados
        except Exception as e:
            logger.error(f"Erro geral ao buscar serviços disponíveis para prestador {prestador_id}: {str(e)}")
            return []

    @staticmethod
    async def adicionar_proposta(id_registro: str, proposta: str, decisao: str, prestador_id: str = None):
        """Adiciona proposta a um serviço"""
        try:
            logger.info(f"Adicionando proposta para serviço {id_registro}")
            
            # Validações básicas
            if not all([id_registro, proposta, decisao]):
                return {"success": False, "error": "Campos obrigatórios faltando"}
            
            # Atualizar o serviço com proposta
            update_data = {
                "PROPOSTA": proposta,
                "DECISAO": decisao
            }
            
            if prestador_id:
                update_data["prestador_id"] = prestador_id
            
            response = supabase.table("bancodedadoscar") \
                .update(update_data) \
                .eq("id", id_registro) \
                .execute()
            
            if response.data:
                logger.info(f"Proposta adicionada com sucesso ao serviço {id_registro}")
                return {"success": True, "message": "Proposta adicionada com sucesso"}
            else:
                return {"success": False, "error": "Falha ao adicionar proposta"}
                
        except Exception as e:
            logger.error(f"Erro ao adicionar proposta: {str(e)}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}

    @staticmethod
    async def recusar_servico(id_registro: int, prestador_id: str):
        """Registra recusa de um serviço pelo prestador"""
        try:
            logger.info(f"Registrando recusa do serviço {id_registro} pelo prestador {prestador_id}")
            
            # Verificar se já foi recusado
            existing = supabase.table("recusas_servico") \
                .select("*") \
                .eq("servico_id", id_registro) \
                .eq("prestador_id", prestador_id) \
                .execute()
            
            if existing.data:
                return {"success": False, "message": "Serviço já foi recusado anteriormente"}
            
            # Registrar recusa
            recusa_data = {
                "servico_id": id_registro,
                "prestador_id": prestador_id
            }
            
            response = supabase.table("recusas_servico").insert(recusa_data).execute()
            
            if response.data:
                logger.info(f"Recusa registrada com sucesso")
                return {"success": True, "message": "Serviço recusado com sucesso"}
            else:
                return {"success": False, "message": "Erro ao registrar recusa"}
                
        except Exception as e:
            logger.error(f"Erro ao recusar serviço {id_registro}: {str(e)}")
            return {"success": False, "message": f"Erro ao recusar serviço: {str(e)}"}
    
    @staticmethod
    async def obter_todos_prestadores() -> Dict[str, Any]:
        """Obtém todos os prestadores cadastrados"""
        try:
            prestadores = await PrestadorDAO.buscar_todos_prestadores()
            return {
                "success": True,
                "prestadores": prestadores,
                "count": len(prestadores)
            }
        except Exception as e:
            logger.error(f"Erro no service ao buscar todos prestadores: {str(e)}")
            return {
                "success": False,
                "error": f"Erro ao buscar prestadores: {str(e)}",
                "prestadores": []
            }

    @staticmethod
    async def obter_prestador_por_id(prestador_id: str) -> Dict[str, Any]:
        """Obtém um prestador específico pelo ID"""
        try:
            if not prestador_id:
                return {
                    "success": False,
                    "error": "ID do prestador é obrigatório",
                    "prestador": None
                }
            
            prestador = await PrestadorDAO.buscar_prestador_por_id(prestador_id)
            return {
                "success": True,
                "prestador": prestador[0] if prestador else None,
                "encontrado": bool(prestador)
            }
        except Exception as e:
            logger.error(f"Erro no service ao buscar prestador {prestador_id}: {str(e)}")
            return {
                "success": False,
                "error": f"Erro ao buscar prestador: {str(e)}",
                "prestador": None
            }

    @staticmethod
    async def verificar_prestador(prestador_id: str) -> Dict[str, Any]:
        """Verifica se um prestador está cadastrado"""
        try:
            if not prestador_id:
                return {
                    "success": False,
                    "error": "ID do prestador é obrigatório",
                    "cadastrado": False
                }
            
            prestador = await PrestadorDAO.buscar_prestador_por_id(prestador_id)
            return {
                "success": True,
                "cadastrado": bool(prestador),
                "prestador": prestador[0] if prestador else None
            }
        except Exception as e:
            logger.error(f"Erro no service ao verificar prestador {prestador_id}: {str(e)}")
            return {
                "success": False,
                "error": f"Erro ao verificar prestador: {str(e)}",
                "cadastrado": False
            }

    @staticmethod
    async def obter_prestadores_ativos() -> Dict[str, Any]:
        """Obtém apenas prestadores ativos"""
        try:
            prestadores = await PrestadorDAO.buscar_prestadores_ativos()
            return {
                "success": True,
                "prestadores": prestadores,
                "count": len(prestadores)
            }
        except Exception as e:
            logger.error(f"Erro no service ao buscar prestadores ativos: {str(e)}")
            return {
                "success": False,
                "error": f"Erro ao buscar prestadores ativos: {str(e)}",
                "prestadores": []
            }

    @staticmethod
    async def obter_servicos_por_prestador(prestador_id: str) -> Dict[str, Any]:
        """Obtém todos os serviços vinculados a um prestador"""
        try:
            if not prestador_id:
                return {
                    "success": False,
                    "error": "ID do prestador é obrigatório",
                    "servicos": []
                }
            
            servicos = await PrestadorDAO.buscar_servicos_por_prestador(prestador_id)
            return {
                "success": True,
                "servicos": servicos,
                "count": len(servicos)
            }
        except Exception as e:
            logger.error(f"Erro no service ao buscar serviços do prestador {prestador_id}: {str(e)}")
            return {
                "success": False,
                "error": f"Erro ao buscar serviços do prestador: {str(e)}",
                "servicos": []
            }
