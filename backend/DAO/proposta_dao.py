import psycopg2
from psycopg2 import sql
from typing import List, Optional, Dict, Any
from datetime import datetime
from config import DB_CONFIG
import logging

logger = logging.getLogger(__name__)


def _serialize_datetime(data_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Converte datetime para string ISO format para serialização JSON"""
    for key, value in data_dict.items():
        if hasattr(value, 'isoformat'):
            data_dict[key] = value.isoformat()
    return data_dict


class PropostaDAO:
    """DAO unificado para gerenciar Solicitações e Propostas"""

    def __init__(self):
        self.conn = psycopg2.connect(**DB_CONFIG)
        self.conn.autocommit = True

    def criar_solicitacao(self, dados_solicitacao: Dict[str, Any]) -> Dict[str, Any]:
        """Cria uma nova solicitação (sem propostas ainda)"""
        try:
            with self.conn.cursor() as cur:
                query = sql.SQL("""
                    INSERT INTO solicitar_servico (
                        data_criacao, id_usuario, tag, servico, marca, 
                        confirmar_solicitacao, btu, status, id_prestador
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s
                    ) RETURNING id_solicitacao, data_criacao;
                """)

                now = datetime.now()
                cur.execute(query, (
                    now,
                    dados_solicitacao['id_usuario'],
                    dados_solicitacao['tag'],
                    dados_solicitacao['servico'],
                    dados_solicitacao['marca'],
                    dados_solicitacao.get('confirmar_solicitacao', 'true'),
                    dados_solicitacao.get('btu'),
                    'aberta',  # Sempre começa como 'aberta'
                    dados_solicitacao.get('prestador_especifico')  # Pode ser None para broadcast
                ))

                row = cur.fetchone()
                id_solicitacao = row[0]
                data_criacao = row[1]

                logger.info(f"Solicitação criada: {id_solicitacao} por usuário {dados_solicitacao['id_usuario']}")
                
                return {
                    "success": True,
                    "data": {
                        "id_solicitacao": id_solicitacao,
                        "data_criacao": data_criacao.isoformat(),
                        "id_usuario": dados_solicitacao['id_usuario'],
                        "tag": dados_solicitacao['tag'],
                        "servico": dados_solicitacao['servico'],
                        "marca": dados_solicitacao['marca'],
                        "status": "aberta"
                    }
                }

        except Exception as e:
            logger.error(f"Erro ao criar solicitação: {str(e)}")
            return {"success": False, "error": f"Erro ao criar solicitação: {str(e)}"}

    def listar_solicitacoes_abertas(self, prestador_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Lista solicitações abertas que prestadores podem ver"""
        try:
            with self.conn.cursor() as cur:
                # Buscar solicitações abertas
                if prestador_id:
                    # Prestador específico: só vê solicitações direcionadas para ele ou gerais (id_prestador NULL)
                    query = sql.SQL("""
                        SELECT s.*, u.nome as cliente_nome
                        FROM solicitar_servico s
                        LEFT JOIN usuario u ON CAST(s.id_usuario AS INTEGER) = u.id_usuario
                        LEFT JOIN "Recusas" r ON s.id_solicitacao = r.solicitacao_id AND r.prestador_id = %s
                        WHERE s.status IN ('aberta', 'em_analise')
                        AND s.confirmar_solicitacao IN ('sim', 'true')
                        AND (s.id_prestador = %s OR s.id_prestador IS NULL)
                        AND r.id_recusa IS NULL
                        ORDER BY s.data_criacao DESC;
                    """)
                    cur.execute(query, (prestador_id, prestador_id))
                else:
                    # Sem prestador específico: vê todas as solicitações gerais
                    query = sql.SQL("""
                        SELECT s.*, u.nome as cliente_nome
                        FROM solicitar_servico s
                        LEFT JOIN usuario u ON CAST(s.id_usuario AS INTEGER) = u.id_usuario
                        WHERE s.status IN ('aberta', 'em_analise')
                        AND s.confirmar_solicitacao IN ('sim', 'true')
                        AND s.id_prestador IS NULL
                        ORDER BY s.data_criacao DESC;
                    """)
                    cur.execute(query)
                rows = cur.fetchall()

                if not rows:
                    return []

                columns = [desc[0] for desc in cur.description]
                solicitacoes = []

                for row in rows:
                    solicitacao = dict(zip(columns, row))
                    
                    # Verificar se prestador já enviou proposta para esta solicitação
                    if prestador_id:
                        cur.execute("""
                            SELECT COUNT(*) FROM "Propostas" 
                            WHERE solicitacao_id = %s AND prestador_id = %s;
                        """, (solicitacao['id_solicitacao'], prestador_id))
                        
                        ja_proposta = cur.fetchone()[0] > 0
                        solicitacao['ja_enviou_proposta'] = ja_proposta
                    
                    # Contar quantas propostas já foram enviadas
                    cur.execute("""
                        SELECT COUNT(*) FROM "Propostas" 
                        WHERE solicitacao_id = %s;
                    """, (solicitacao['id_solicitacao'],))
                    
                    solicitacao['total_propostas'] = cur.fetchone()[0]
                    
                    solicitacoes.append(_serialize_datetime(solicitacao))

                return solicitacoes

        except Exception as e:
            logger.error(f"Erro ao listar solicitações: {str(e)}")
            return []

    def enviar_proposta(self, dados_proposta: Dict[str, Any]) -> Dict[str, Any]:
        """Prestador envia proposta para uma solicitação"""
        try:
            with self.conn.cursor() as cur:
                # Verificar se solicitação está aberta
                cur.execute("""
                    SELECT status FROM solicitar_servico 
                    WHERE id_solicitacao = %s;
                """, (dados_proposta['solicitacao_id'],))
                
                result = cur.fetchone()
                if not result:
                    return {"success": False, "error": "Solicitação não encontrada"}
                
                if result[0] != 'aberta':
                    return {"success": False, "error": "Solicitação não está mais aberta"}

                # Verificar se prestador já enviou proposta
                cur.execute("""
                    SELECT id_proposta FROM "Propostas" 
                    WHERE solicitacao_id = %s AND prestador_id = %s;
                """, (dados_proposta['solicitacao_id'], dados_proposta['prestador_id']))
                
                if cur.fetchone():
                    return {"success": False, "error": "Você já enviou uma proposta para esta solicitação"}

                # Inserir proposta
                query = sql.SQL("""
                    INSERT INTO "Propostas" (
                        solicitacao_id, prestador_id, valor, mensagem, 
                        data_envio, status_proposta
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s
                    ) RETURNING id_proposta, data_envio;
                """)

                cur.execute(query, (
                    dados_proposta['solicitacao_id'],
                    dados_proposta['prestador_id'],
                    dados_proposta.get('valor'),
                    dados_proposta.get('mensagem', ''),
                    datetime.now(),
                    'enviada'
                ))

                row = cur.fetchone()
                id_proposta = row[0]
                data_envio = row[1]

                logger.info(f"Proposta enviada: {id_proposta} por prestador {dados_proposta['prestador_id']}")

                return {
                    "success": True,
                    "data": {
                        "id_proposta": id_proposta,
                        "solicitacao_id": dados_proposta['solicitacao_id'],
                        "prestador_id": dados_proposta['prestador_id'],
                        "valor": dados_proposta.get('valor'),
                        "mensagem": dados_proposta.get('mensagem', ''),
                        "data_envio": data_envio.isoformat(),
                        "status_proposta": "enviada"
                    }
                }

        except Exception as e:
            logger.error(f"Erro ao enviar proposta: {str(e)}")
            return {"success": False, "error": f"Erro ao enviar proposta: {str(e)}"}

    def listar_propostas_cliente(self, cliente_id: int, solicitacao_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Cliente lista propostas recebidas"""
        try:
            with self.conn.cursor() as cur:
                if solicitacao_id:
                    # Propostas para solicitação específica
                    query = sql.SQL("""
                        SELECT p.*, s.servico, s.tag, s.marca, u.nome as prestador_nome, uc.nome as cliente_nome
                        FROM "Propostas" p
                        JOIN solicitar_servico s ON p.solicitacao_id = s.id_solicitacao
                        LEFT JOIN prestador pr ON p.prestador_id = pr.id_prestador
                        LEFT JOIN usuario u ON pr.id_usuario = u.id_usuario
                        LEFT JOIN usuario uc ON CAST(s.id_usuario AS INTEGER) = uc.id_usuario
                        WHERE s.id_usuario = %s AND p.solicitacao_id = %s
                        ORDER BY p.data_envio ASC;
                    """)
                    cur.execute(query, (cliente_id, solicitacao_id))
                else:
                    # Todas as propostas do cliente
                    query = sql.SQL("""
                        SELECT p.*, s.servico, s.tag, s.marca, u.nome as prestador_nome, uc.nome as cliente_nome
                        FROM "Propostas" p
                        JOIN solicitar_servico s ON p.solicitacao_id = s.id_solicitacao
                        LEFT JOIN prestador pr ON p.prestador_id = pr.id_prestador
                        LEFT JOIN usuario u ON pr.id_usuario = u.id_usuario
                        LEFT JOIN usuario uc ON CAST(s.id_usuario AS INTEGER) = uc.id_usuario
                        WHERE s.id_usuario = %s
                        ORDER BY p.data_envio DESC;
                    """)
                    cur.execute(query, (cliente_id,))

                rows = cur.fetchall()
                if not rows:
                    return []

                columns = [desc[0] for desc in cur.description]
                propostas = []

                for row in rows:
                    proposta = dict(zip(columns, row))
                    propostas.append(_serialize_datetime(proposta))

                return propostas

        except Exception as e:
            logger.error(f"Erro ao listar propostas do cliente: {str(e)}")
            return []

    def aceitar_proposta(self, cliente_id: int, proposta_id: int) -> Dict[str, Any]:
        """Cliente aceita uma proposta específica"""
        try:
            with self.conn.cursor() as cur:
                # Verificar se proposta pertence ao cliente
                cur.execute("""
                    SELECT p.solicitacao_id, p.prestador_id, s.id_usuario
                    FROM "Propostas" p
                    JOIN solicitar_servico s ON p.solicitacao_id = s.id_solicitacao
                    WHERE p.id_proposta = %s;
                """, (proposta_id,))

                result = cur.fetchone()
                if not result:
                    return {"success": False, "error": "Proposta não encontrada"}

                solicitacao_id, prestador_id, dono_solicitacao = result
                if dono_solicitacao != cliente_id:
                    return {"success": False, "error": "Esta proposta não pertence a você"}

                # Aceitar a proposta
                cur.execute("""
                    UPDATE "Propostas" 
                    SET status_proposta = 'aceita' 
                    WHERE id_proposta = %s;
                """, (proposta_id,))

                # Rejeitar todas as outras propostas da mesma solicitação
                cur.execute("""
                    UPDATE "Propostas" 
                    SET status_proposta = 'rejeitada' 
                    WHERE solicitacao_id = %s AND id_proposta != %s AND status_proposta = 'enviada';
                """, (solicitacao_id, proposta_id))

                # Fechar a solicitação
                cur.execute("""
                    UPDATE solicitar_servico 
                    SET status = 'fechada' 
                    WHERE id_solicitacao = %s;
                """, (solicitacao_id,))

                cur.execute("""
                    INSERT INTO chat (id_solicitacao) 
                    VALUES (%s)
                    RETURNING id_chat;
                """, (solicitacao_id,))
        
                id_chat = cur.fetchone()[0]
                logger.info(f"✅ Chat criado: id_chat={id_chat} para id_solicitacao={solicitacao_id}")

                return {
                    "success": True,
                    "message": "Proposta aceita com sucesso",
                    "data": {
                        "proposta_id": proposta_id,
                        "solicitacao_id": solicitacao_id,
                        "prestador_id": prestador_id,
                        "status_solicitacao": "fechada",
                        "id_chat": id_chat 
                    }
                }

        except Exception as e:
            logger.error(f"Erro ao aceitar proposta: {str(e)}")
            return {"success": False, "error": f"Erro ao aceitar proposta: {str(e)}"}

    def rejeitar_proposta(self, cliente_id: int, proposta_id: int) -> Dict[str, Any]:
        """Cliente rejeita uma proposta específica"""
        try:
            with self.conn.cursor() as cur:
                # Verificar se proposta pertence ao cliente
                cur.execute("""
                    SELECT p.solicitacao_id, s.id_usuario
                    FROM "Propostas" p
                    JOIN solicitar_servico s ON p.solicitacao_id = s.id_solicitacao
                    WHERE p.id_proposta = %s;
                """, (proposta_id,))

                result = cur.fetchone()
                if not result:
                    return {"success": False, "error": "Proposta não encontrada"}

                solicitacao_id, dono_solicitacao = result
                if dono_solicitacao != cliente_id:
                    return {"success": False, "error": "Esta proposta não pertence a você"}

                # Rejeitar a proposta
                cur.execute("""
                    UPDATE "Propostas" 
                    SET status_proposta = 'rejeitada' 
                    WHERE id_proposta = %s;
                """, (proposta_id,))

                logger.info(f"Proposta {proposta_id} rejeitada pelo cliente {cliente_id}")

                return {
                    "success": True,
                    "message": "Proposta rejeitada",
                    "data": {
                        "proposta_id": proposta_id,
                        "solicitacao_id": solicitacao_id
                    }
                }

        except Exception as e:
            logger.error(f"Erro ao rejeitar proposta: {str(e)}")
            return {"success": False, "error": f"Erro ao rejeitar proposta: {str(e)}"}

    def listar_solicitacoes_cliente(self, cliente_id: int) -> List[Dict[str, Any]]:
        """Cliente lista suas solicitações com resumo de propostas"""
        try:
            with self.conn.cursor() as cur:
                query = sql.SQL("""
                    SELECT s.*, 
                           COUNT(p.id_proposta) as total_propostas,
                           COUNT(CASE WHEN p.status_proposta = 'enviada' THEN 1 END) as propostas_pendentes,
                           COUNT(CASE WHEN p.status_proposta = 'aceita' THEN 1 END) as propostas_aceitas,
                           COUNT(CASE WHEN p.status_proposta = 'rejeitada' THEN 1 END) as propostas_rejeitadas
                    FROM solicitar_servico s
                    LEFT JOIN "Propostas" p ON s.id_solicitacao = p.solicitacao_id
                    WHERE s.id_usuario = %s
                    GROUP BY s.id_solicitacao, s.data_criacao, s.id_usuario, s.tag, s.servico, 
                             s.marca, s.confirmar_solicitacao, s.proposta_prestador, s.decisao_prestaor, 
                             s.decisao_cliente, s.btu, s.id_prestador, s.status
                    ORDER BY s.data_criacao DESC;
                """)

                cur.execute(query, (cliente_id,))
                rows = cur.fetchall()

                if not rows:
                    return []

                columns = [desc[0] for desc in cur.description]
                solicitacoes = []

                for row in rows:
                    solicitacao = dict(zip(columns, row))
                    solicitacoes.append(_serialize_datetime(solicitacao))

                return solicitacoes

        except Exception as e:
            logger.error(f"Erro ao listar solicitações do cliente: {str(e)}")
            return []

    # MÉTODOS ADICIONAIS PARA COMPATIBILIDADE COM SERVICE
    
    def listar_solicitacoes_para_prestador(self, prestador_id: int) -> Dict[str, Any]:
        """Lista solicitações disponíveis para um prestador específico"""
        try:
            solicitacoes = self.listar_solicitacoes_abertas(prestador_id)
            return {"success": True, "data": solicitacoes}
        except Exception as e:
            logger.error(f"Erro ao listar solicitações para prestador: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def buscar_solicitacao_por_id(self, solicitacao_id: int) -> Dict[str, Any]:
        """Busca uma solicitação específica por ID"""
        try:
            with self.conn.cursor() as cur:
                query = sql.SQL("""
                    SELECT id_solicitacao, data_criacao, id_usuario, tag, servico, 
                           marca, confirmar_solicitacao, btu, status
                    FROM solicitar_servico 
                    WHERE id_solicitacao = %s
                """)
                
                cur.execute(query, (solicitacao_id,))
                row = cur.fetchone()
                
                if row:
                    solicitacao = {
                        'id_solicitacao': row[0],
                        'data_criacao': row[1],
                        'id_usuario': row[2],
                        'tag': row[3],
                        'servico': row[4],
                        'marca': row[5],
                        'confirmar_solicitacao': row[6],
                        'btu': row[7],
                        'status': row[8]
                    }
                    return {"success": True, "data": _serialize_datetime(solicitacao)}
                else:
                    return {"success": False, "error": "Solicitação não encontrada"}
                    
        except Exception as e:
            logger.error(f"Erro ao buscar solicitação por ID: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def buscar_proposta_por_id(self, proposta_id: int) -> Dict[str, Any]:
        """Busca uma proposta específica por ID"""
        try:
            with self.conn.cursor() as cur:
                query = sql.SQL("""
                    SELECT p.*, u.nome as prestador_nome
                    FROM "Propostas" p
                    LEFT JOIN prestador pr ON p.prestador_id = pr.id_prestador
                    LEFT JOIN usuario u ON pr.id_usuario = u.id_usuario
                    WHERE p.id_proposta = %s
                """)
                
                cur.execute(query, (proposta_id,))
                row = cur.fetchone()
                
                if row:
                    proposta = {
                        'solicitacao_id': row[0],
                        'prestador_id': row[1],
                        'valor': float(row[2]) if row[2] else 0.0,
                        'mensagem': row[3],
                        'data_envio': row[4],
                        'status_proposta': row[5],
                        'id_proposta': row[6],
                        'prestador_nome': row[7] if row[7] else 'Prestador não encontrado'
                    }
                    return {"success": True, "data": _serialize_datetime(proposta)}
                else:
                    return {"success": False, "error": "Proposta não encontrada"}
                    
        except Exception as e:
            logger.error(f"Erro ao buscar proposta por ID: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def buscar_proposta_por_solicitacao_prestador(self, solicitacao_id: int, prestador_id: int) -> Dict[str, Any]:
        """Busca se já existe proposta de um prestador para uma solicitação"""
        try:
            with self.conn.cursor() as cur:
                query = sql.SQL("""
                    SELECT * FROM "Propostas" 
                    WHERE solicitacao_id = %s AND prestador_id = %s
                """)
                
                cur.execute(query, (solicitacao_id, prestador_id))
                row = cur.fetchone()
                
                if row:
                    proposta = {
                        'id_proposta': row[0],
                        'solicitacao_id': row[1],
                        'prestador_id': row[2],
                        'valor': float(row[3]) if row[3] else 0.0,
                        'mensagem': row[4],
                        'data_envio': row[5],
                        'status_proposta': row[6]
                    }
                    return {"success": True, "data": _serialize_datetime(proposta)}
                else:
                    return {"success": True, "data": None}  # Não encontrou = ok
                    
        except Exception as e:
            logger.error(f"Erro ao buscar proposta por solicitação/prestador: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def atualizar_status_solicitacao(self, solicitacao_id: int, novo_status: str) -> Dict[str, Any]:
        """Atualiza o status de uma solicitação"""
        try:
            with self.conn.cursor() as cur:
                query = sql.SQL("""
                    UPDATE solicitar_servico 
                    SET status = %s 
                    WHERE id_solicitacao = %s
                """)
                
                cur.execute(query, (novo_status, solicitacao_id))
                
                if cur.rowcount > 0:
                    return {"success": True, "message": f"Status atualizado para {novo_status}"}
                else:
                    return {"success": False, "error": "Solicitação não encontrada"}
                    
        except Exception as e:
            logger.error(f"Erro ao atualizar status da solicitação: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def rejeitar_outras_propostas(self, solicitacao_id: int, proposta_aceita_id: int) -> Dict[str, Any]:
        """Rejeita todas as outras propostas quando uma é aceita"""
        try:
            with self.conn.cursor() as cur:
                query = sql.SQL("""
                    UPDATE "Propostas" 
                    SET status_proposta = 'rejeitada' 
                    WHERE solicitacao_id = %s AND id_proposta != %s AND status_proposta = 'enviada'
                """)
                
                cur.execute(query, (solicitacao_id, proposta_aceita_id))
                
                return {"success": True, "message": f"{cur.rowcount} propostas rejeitadas"}
                    
        except Exception as e:
            logger.error(f"Erro ao rejeitar outras propostas: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def listar_propostas_prestador(self, prestador_id: int) -> Dict[str, Any]:
        """Lista propostas enviadas por um prestador"""
        try:
            with self.conn.cursor() as cur:
                query = sql.SQL("""
                    SELECT p.*, s.tag, s.servico, s.marca, u.nome as cliente_nome
                    FROM "Propostas" p
                    LEFT JOIN solicitar_servico s ON p.solicitacao_id = s.id_solicitacao
                    LEFT JOIN usuario u ON s.id_usuario = u.id_usuario
                    WHERE p.prestador_id = %s
                    ORDER BY p.data_envio DESC
                """)
                
                cur.execute(query, (prestador_id,))
                rows = cur.fetchall()
                
                propostas = []
                for row in rows:
                    proposta = {
                        'id_proposta': row[0],
                        'solicitacao_id': row[1],
                        'prestador_id': row[2],
                        'valor': float(row[3]) if row[3] else 0.0,
                        'mensagem': row[4],
                        'data_envio': row[5],
                        'status_proposta': row[6],
                        'tag': row[7],
                        'servico': row[8],
                        'marca': row[9],
                        'cliente_nome': row[10]
                    }
                    propostas.append(_serialize_datetime(proposta))
                
                return {"success": True, "data": propostas}
                    
        except Exception as e:
            logger.error(f"Erro ao listar propostas do prestador: {str(e)}")
            return {"success": False, "error": str(e)}

    def recusar_solicitacao(self, solicitacao_id: int, prestador_id: int) -> Dict[str, Any]:
        """Registra que um prestador recusou uma solicitação"""
        try:
            with self.conn.cursor() as cur:
                # Verificar se já foi recusado
                cur.execute("""
                    SELECT COUNT(*) FROM "Recusas" 
                    WHERE solicitacao_id = %s AND prestador_id = %s;
                """, (solicitacao_id, prestador_id))
                
                if cur.fetchone()[0] > 0:
                    return {"success": False, "error": "Serviço já foi recusado anteriormente"}

                # Inserir recusa
                cur.execute("""
                    INSERT INTO "Recusas" (solicitacao_id, prestador_id, data_recusa)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (solicitacao_id, prestador_id) DO NOTHING;
                """, (solicitacao_id, prestador_id, datetime.now()))

                logger.info(f"Prestador {prestador_id} recusou solicitação {solicitacao_id}")
                
                return {
                    "success": True,
                    "message": "Serviço recusado com sucesso",
                    "data": {
                        "solicitacao_id": solicitacao_id,
                        "prestador_id": prestador_id
                    }
                }

        except Exception as e:
            logger.error(f"Erro ao recusar solicitação: {str(e)}")
            return {"success": False, "error": f"Erro ao recusar solicitação: {str(e)}"}

    def __del__(self):
        """Fechar conexão ao destruir objeto"""
        if hasattr(self, 'conn'):
            self.conn.close()
