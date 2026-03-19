from DAO.anuncio_dao import AnuncioDAO
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class AnuncioService:
    @staticmethod
    def criar_anuncio(nome: str, marca: str, endereco: str, valor1: str, valor2: str, 
                     btu: str, especificacao: str, tipo: str, prestador_id: str) -> Dict[str, Any]:
        """Cria um novo anúncio com validações de negócio"""
        try:
            logger.info(f"Iniciando criação de anúncio para prestador {prestador_id}")
            
            # Validações de campos obrigatórios
            if not all([nome, marca, endereco, valor2, btu, especificacao, tipo, prestador_id]):
                logger.warning("Tentativa de criar anúncio com campos obrigatórios faltando")
                return {"success": False, "error": "Todos os campos obrigatórios devem ser preenchidos"}
            
            # Validação do tipo
            if tipo.upper() not in ["NOVO", "USADO"]:
                logger.warning(f"Tipo inválido fornecido: {tipo}")
                return {"success": False, "error": "Tipo deve ser 'NOVO' ou 'USADO'"}
            
            # Converter e validar valores numéricos
            try:
                btu_int = int(btu)
                if btu_int <= 0:
                    return {"success": False, "error": "BTU deve ser maior que zero"}
                    
                valor1_int = int(float(valor1)) if valor1 and valor1 != "0" else 0
                valor2_int = int(float(valor2))
                
                if valor2_int <= 0:
                    return {"success": False, "error": "Valor do produto deve ser maior que zero"}
                    
            except (ValueError, TypeError) as e:
                logger.error(f"Erro na conversão de valores numéricos: {str(e)}")
                return {"success": False, "error": "Valores numéricos inválidos"}

            # Preparar dados do anúncio
            anuncio_data = {
                "NOME": nome.strip(),
                "MARCA": marca.strip(),
                "ENDERECO": endereco.strip(),
                "VALOR1": valor1_int,
                "VALOR2": valor2_int,
                "BTU": btu_int,
                "ESPPRO": especificacao.strip(),
                "TIPO": tipo.upper(),
                "prestador_id": prestador_id,
            }

            logger.info(f"Dados validados, criando anúncio: {anuncio_data['NOME']} - {anuncio_data['TIPO']}")
            result = AnuncioDAO.criar_anuncio(anuncio_data)
            
            if result["success"]:
                logger.info(f"Anúncio criado com sucesso para prestador {prestador_id}")
                # Retornar no formato esperado pelo frontend
                return {
                    "success": True,
                    "message": "Produto anunciado com sucesso!",
                    "data": result["data"]
                }
            else:
                logger.error(f"Falha ao criar anúncio: {result.get('error')}")
                return result
                
        except Exception as e:
            logger.error(f"Erro geral na criação de anúncio para prestador {prestador_id}: {str(e)}")
            return {"success": False, "error": f"Erro interno na criação do anúncio: {str(e)}"}
    
    @staticmethod
    def obter_meus_anuncios(prestador_id: str) -> Dict[str, Any]:
        """Obtém todos os anúncios de um prestador específico"""
        try:
            logger.info(f"Buscando anúncios para prestador {prestador_id}")
            
            if not prestador_id or not prestador_id.strip():
                logger.warning("Tentativa de buscar anúncios sem ID do prestador")
                return {"success": False, "error": "ID do prestador é obrigatório"}
            
            result = AnuncioDAO.obter_anuncios_por_prestador(prestador_id.strip())
            
            if result["success"]:
                total_anuncios = len(result.get("products", []))
                logger.info(f"Encontrados {total_anuncios} anúncios para prestador {prestador_id}")
            else:
                logger.error(f"Erro ao buscar anúncios para prestador {prestador_id}: {result.get('error')}")
                
            return result
            
        except Exception as e:
            logger.error(f"Erro geral ao buscar anúncios do prestador {prestador_id}: {str(e)}")
            return {"success": False, "error": f"Erro interno ao buscar anúncios: {str(e)}"}
    
    @staticmethod
    def obter_todos_anuncios() -> Dict[str, Any]:
        """Obtém todos os anúncios disponíveis"""
        try:
            logger.info("Buscando todos os anúncios")
            result = AnuncioDAO.obter_todos_anuncios()
            
            if result["success"]:
                total = len(result.get("anuncios", []))
                logger.info(f"Encontrados {total} anúncios no total")
            else:
                logger.error(f"Erro ao buscar todos os anúncios: {result.get('error')}")
                
            return result
            
        except Exception as e:
            logger.error(f"Erro geral ao buscar todos os anúncios: {str(e)}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}
    
    @staticmethod
    def obter_anuncios_novos() -> Dict[str, Any]:
        """Obtém apenas anúncios de produtos novos"""
        try:
            logger.info("Buscando anúncios de produtos novos")
            result = AnuncioDAO.obter_anuncios_novos()
            
            if result["success"]:
                total = len(result.get("anuncios", []))
                logger.info(f"Encontrados {total} anúncios de produtos novos")
            else:
                logger.error(f"Erro ao buscar anúncios novos: {result.get('error')}")
                
            return result
            
        except Exception as e:
            logger.error(f"Erro geral ao buscar anúncios novos: {str(e)}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}
    
    @staticmethod
    def obter_anuncios_usados() -> Dict[str, Any]:
        """Obtém apenas anúncios de produtos usados"""
        try:
            logger.info("Buscando anúncios de produtos usados")
            result = AnuncioDAO.obter_anuncios_usados()
            
            if result["success"]:
                total = len(result.get("anuncios", []))
                logger.info(f"Encontrados {total} anúncios de produtos usados")
            else:
                logger.error(f"Erro ao buscar anúncios usados: {result.get('error')}")
                
            return result
            
        except Exception as e:
            logger.error(f"Erro geral ao buscar anúncios usados: {str(e)}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}
    
    @staticmethod
    def migrar_anuncios_antigos(prestador_id: str) -> Dict[str, Any]:
        """Migra anúncios antigos para um prestador"""
        try:
            logger.info(f"Iniciando migração de anúncios para prestador {prestador_id}")
            
            if not prestador_id or not prestador_id.strip():
                return {"success": False, "error": "ID do prestador é obrigatório"}
            
            result = AnuncioDAO.migrar_anuncios_antigos(prestador_id.strip())
            
            if result["success"]:
                logger.info(f"Migração concluída para prestador {prestador_id}")
            else:
                logger.error(f"Erro na migração para prestador {prestador_id}: {result.get('error')}")
                
            return result
            
        except Exception as e:
            logger.error(f"Erro geral na migração para prestador {prestador_id}: {str(e)}")
            return {"success": False, "error": f"Erro interno na migração: {str(e)}"}
    
    @staticmethod
    def atualizar_prestador_anuncio(anuncio_id: int, prestador_id: str) -> Dict[str, Any]:
        """Atualiza o prestador de um anúncio específico"""
        try:
            logger.info(f"Atualizando prestador do anúncio {anuncio_id} para {prestador_id}")
            
            if not prestador_id or not prestador_id.strip():
                return {"success": False, "error": "ID do prestador é obrigatório"}
            
            if not anuncio_id or anuncio_id <= 0:
                return {"success": False, "error": "ID do anúncio deve ser válido"}
            
            result = AnuncioDAO.atualizar_prestador_anuncio(anuncio_id, prestador_id.strip())
            
            if result["success"]:
                logger.info(f"Prestador do anúncio {anuncio_id} atualizado com sucesso")
            else:
                logger.error(f"Erro ao atualizar prestador do anúncio {anuncio_id}: {result.get('error')}")
                
            return result
            
        except Exception as e:
            logger.error(f"Erro geral ao atualizar prestador do anúncio {anuncio_id}: {str(e)}")
            return {"success": False, "error": f"Erro interno na atualização: {str(e)}"}
    
    @staticmethod
    def deletar_anuncio(anuncio_id: int, prestador_id: str) -> Dict[str, Any]:
        """Deleta um anúncio específico do prestador"""
        try:
            logger.info(f"Tentativa de deletar anúncio {anuncio_id} do prestador {prestador_id}")
            
            if not prestador_id or not prestador_id.strip():
                return {"success": False, "error": "ID do prestador é obrigatório"}
            
            if not anuncio_id or anuncio_id <= 0:
                return {"success": False, "error": "ID do anúncio deve ser válido"}
            
            result = AnuncioDAO.deletar_anuncio(anuncio_id, prestador_id.strip())
            
            if result["success"]:
                logger.info(f"Anúncio {anuncio_id} deletado com sucesso")
            else:
                logger.error(f"Erro ao deletar anúncio {anuncio_id}: {result.get('error')}")
                
            return result
            
        except Exception as e:
            logger.error(f"Erro geral ao deletar anúncio {anuncio_id}: {str(e)}")
            return {"success": False, "error": f"Erro interno na exclusão: {str(e)}"}
    
    @staticmethod
    def atualizar_view(id_produto: int, view_count: int) -> Dict[str, Any]:
        """Atualiza o contador de visualizações de um produto"""
        try:
            logger.info(f"Atualizando views do produto {id_produto} para {view_count}")
            
            if not id_produto or id_produto <= 0:
                return {"success": False, "error": "ID do produto deve ser válido"}
            
            if view_count < 0:
                return {"success": False, "error": "Contador de views não pode ser negativo"}
            
            result = AnuncioDAO.atualizar_view(id_produto, view_count)
            
            if result["success"]:
                logger.info(f"Views do produto {id_produto} atualizadas com sucesso")
            else:
                logger.error(f"Erro ao atualizar views do produto {id_produto}: {result.get('error')}")
                
            return result
            
        except Exception as e:
            logger.error(f"Erro geral ao atualizar views do produto {id_produto}: {str(e)}")
            return {"success": False, "error": f"Erro interno na atualização de views: {str(e)}"}
