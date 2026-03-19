import psycopg2
from psycopg2 import sql
from datetime import datetime
from config import DB_CONFIG
import logging

logger = logging.getLogger(__name__)

class EnderecoDAO:
    def __init__(self):
        self.conn = psycopg2.connect(**DB_CONFIG)
        self.conn.autocommit = True

    def inserir_endereco(self, cep, endereco, numero, bairro, cidade, estado, complemento=None):
        """Insere um novo endereço no banco de dados"""
        try:
            with self.conn.cursor() as cursor:
                query = sql.SQL("""
                    INSERT INTO endereco (
                        cep, endereco, numero, bairro, cidade, estado, complemento, data_criacao
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s
                    ) RETURNING id_endereco;
                """)
                data_criacao = datetime.now()
                cursor.execute(query, (
                    cep, endereco, numero, bairro, cidade, estado, complemento, data_criacao
                ))
                id_endereco = cursor.fetchone()[0]
                
                logger.info(f"Endereço inserido com sucesso! ID: {id_endereco}")
                return {
                    "success": True,
                    "message": "Endereço cadastrado com sucesso",
                    "data": {
                        "id_endereco": id_endereco,
                        "cep": cep,
                        "endereco": endereco,
                        "numero": numero,
                        "bairro": bairro,
                        "cidade": cidade,
                        "estado": estado,
                        "complemento": complemento
                    }
                }

        except Exception as e:
            logger.error(f"Erro ao inserir endereço: {e}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}

    def buscar_endereco_por_id(self, id_endereco):
        """Busca endereço por ID"""
        try:
            with self.conn.cursor() as cursor:
                query = """
                    SELECT id_endereco, cep, endereco, numero, bairro, cidade, estado, complemento, data_criacao
                    FROM endereco 
                    WHERE id_endereco = %s
                """
                cursor.execute(query, (id_endereco,))
                result = cursor.fetchone()
                
                if result:
                    return {
                        "success": True,
                        "endereco": {
                            "id_endereco": result[0],
                            "cep": result[1],
                            "endereco": result[2],
                            "numero": result[3],
                            "bairro": result[4],
                            "cidade": result[5],
                            "estado": result[6],
                            "complemento": result[7],
                            "data_criacao": result[8].isoformat() if result[8] else None
                        }
                    }
                else:
                    return {"success": False, "error": "Endereço não encontrado"}

        except Exception as e:
            logger.error(f"Erro ao buscar endereço por ID {id_endereco}: {e}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}

    def atualizar_endereco(self, id_endereco, cep, endereco, numero, bairro, cidade, estado, complemento=None):
        """Atualiza um endereço existente"""
        try:
            with self.conn.cursor() as cursor:
                query = sql.SQL("""
                    UPDATE endereco SET
                        cep = %s, endereco = %s, numero = %s, bairro = %s,
                        cidade = %s, estado = %s, complemento = %s
                    WHERE id_endereco = %s
                    RETURNING id_endereco;
                """)
                cursor.execute(query, (
                    cep, endereco, numero, bairro, cidade, estado, complemento, id_endereco
                ))
                result = cursor.fetchone()
                
                if result:
                    logger.info(f"Endereço {id_endereco} atualizado com sucesso")
                    return {
                        "success": True,
                        "message": "Endereço atualizado com sucesso",
                        "data": {"id_endereco": result[0]}
                    }
                else:
                    return {"success": False, "error": "Endereço não encontrado"}

        except Exception as e:
            logger.error(f"Erro ao atualizar endereço {id_endereco}: {e}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}

    def deletar_endereco(self, id_endereco):
        """Remove um endereço do banco de dados"""
        try:
            with self.conn.cursor() as cursor:
                query = "DELETE FROM endereco WHERE id_endereco = %s RETURNING id_endereco"
                cursor.execute(query, (id_endereco,))
                result = cursor.fetchone()
                
                if result:
                    logger.info(f"Endereço {id_endereco} deletado com sucesso")
                    return {"success": True, "message": "Endereço deletado com sucesso"}
                else:
                    return {"success": False, "error": "Endereço não encontrado"}

        except Exception as e:
            logger.error(f"Erro ao deletar endereço {id_endereco}: {e}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}

    def fechar_conexao(self):
        if self.conn:
            self.conn.close()