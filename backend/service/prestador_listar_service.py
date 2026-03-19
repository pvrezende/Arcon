from DAO.prestador_listar_dao import PrestadorDAO
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class PrestadorListarService:
    """Service para listar prestadores para seleção do cliente"""
    
    def __init__(self, prestador_dao: PrestadorDAO):
        self.prestador_dao = prestador_dao
    
    def obter_prestadores_disponiveis(self) -> Dict[str, Any]:
        """Obtém lista de prestadores ativos para o cliente escolher"""
        try:
            result = self.prestador_dao.listar_prestadores_ativos()
            
            if result["success"]:
                prestadores = result["data"]
                
                # Adicionar informações extras para o frontend
                for prestador in prestadores:
                    prestador["display_name"] = self._format_display_name(prestador)
                
                logger.info(f"Retornando {len(prestadores)} prestadores disponíveis")
                return {"success": True, "data": prestadores}
            else:
                return result
                
        except Exception as e:
            logger.error(f"Erro no service ao listar prestadores: {e}")
            return {"success": False, "error": str(e)}
    
    def _format_display_name(self, prestador: Dict[str, Any]) -> str:
        """Formata nome para exibição no frontend"""
        nome = prestador["nome"]
        tipo = prestador["tipo_prestador"]
        
        if tipo == "LOJA" and prestador.get("categoria_loja"):
            return f"{nome} - {prestador['categoria_loja']}"
        elif tipo == "MANUAL" and prestador.get("area_atuacao"):
            return f"{nome} - {prestador['area_atuacao']}"
        else:
            return f"{nome} - {tipo}"