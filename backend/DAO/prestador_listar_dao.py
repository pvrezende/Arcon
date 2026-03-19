import psycopg2
from psycopg2 import sql
from typing import List, Dict, Any
from config import DB_CONFIG
import logging

logger = logging.getLogger(__name__)

class PrestadorDAO:
    """DAO para operações com prestadores"""
    
    def __init__(self):
        self.conn = psycopg2.connect(**DB_CONFIG)
        self.conn.autocommit = True
    
    def listar_prestadores_ativos(self) -> Dict[str, Any]:
        """Lista todos os prestadores ativos para seleção do cliente"""
        try:
            with self.conn.cursor() as cur:
                query = sql.SQL("""
                    SELECT 
                        p.id_prestador,
                        u.nome,
                        p.tipo_prestador,
                        u.telefone,
                        p.ativo,
                        l.categoria_loja,
                        ps.area_atuacao
                    FROM prestador p
                    INNER JOIN usuario u ON p.id_usuario = u.id_usuario
                    LEFT JOIN lojista l ON p.id_prestador = l.id_prestador
                    LEFT JOIN prestador_servico ps ON p.id_prestador = ps.id_prestador
                    WHERE p.ativo = TRUE AND p.tipo_prestador = 'MANUAL'
                    ORDER BY u.nome
                """)
                
                cur.execute(query)
                rows = cur.fetchall()
                
                prestadores = []
                for row in rows:
                    prestador = {
                        "id_prestador": row[0],
                        "nome": row[1],
                        "tipo_prestador": row[2],
                        "telefone": row[3],
                        "ativo": row[4]
                    }
                    
                    # Adicionar informações específicas do tipo
                    if row[2] == "LOJA" and row[5]:
                        prestador["categoria_loja"] = row[5]
                    elif row[2] == "MANUAL" and row[6]:
                        prestador["area_atuacao"] = row[6]
                    
                    prestadores.append(prestador)
                
                return {"success": True, "data": prestadores}
                
        except Exception as e:
            logger.error(f"Erro ao listar prestadores: {e}")
            return {"success": False, "error": str(e)}
    
    def fechar_conexao(self):
        if self.conn:
            self.conn.close()