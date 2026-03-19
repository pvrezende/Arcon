from supabase_client import supabase
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class PrestadorDAO:
    
    @staticmethod
    async def buscar_todos_prestadores() -> List[Dict[str, Any]]:
        """Busca todos os prestadores na base de dados"""
        try:
            response = supabase.table("TABELA_ID_PRESTADOR").select("*").execute()
            
            if hasattr(response, 'data'):
                return response.data
            return []
        except Exception as e:
            logger.error(f"Erro no DAO ao buscar todos prestadores: {str(e)}")
            raise e

    @staticmethod
    async def buscar_prestador_por_id(prestador_id: str) -> List[Dict[str, Any]]:
        """Busca um prestador específico pelo ID"""
        try:
            response = (
                supabase
                .table("TABELA_ID_PRESTADOR")
                .select("*")
                .eq("PRESTADOR_ID", prestador_id)
                .execute()
            )
            
            if hasattr(response, 'data'):
                return response.data
            return []
        except Exception as e:
            logger.error(f"Erro no DAO ao buscar prestador {prestador_id}: {str(e)}")
            raise e

    @staticmethod
    async def buscar_prestadores_ativos() -> List[Dict[str, Any]]:
        """Busca apenas prestadores ativos"""
        try:
            # Assumindo que existe um campo 'ativo' ou 'status' na tabela
            response = (
                supabase
                .table("TABELA_ID_PRESTADOR")
                .select("*")
                .eq("ativo", True)  # ou .eq("status", "ativo") dependendo do seu schema
                .execute()
            )
            
            if hasattr(response, 'data'):
                return response.data
            return []
        except Exception as e:
            logger.error(f"Erro no DAO ao buscar prestadores ativos: {str(e)}")
            raise e

    @staticmethod
    async def buscar_servicos_por_prestador(prestador_id: str) -> List[Dict[str, Any]]:
        """Busca serviços vinculados a um prestador"""
        try:
            # Assumindo que existe uma tabela de serviços relacionada
            # Ajuste conforme seu schema real
            response = (
                supabase
                .table("TABELA_SERVICOS")  # Ajuste para o nome real da tabela
                .select("*")
                .eq("prestador_id", prestador_id)
                .execute()
            )
            
            if hasattr(response, 'data'):
                return response.data
            return []
        except Exception as e:
            logger.error(f"Erro no DAO ao buscar serviços do prestador {prestador_id}: {str(e)}")
            raise e