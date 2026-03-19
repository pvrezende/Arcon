import psycopg2
from psycopg2 import sql
from config import DB_CONFIG
from typing import Optional, Dict, List, Tuple, Any

class ChatDAO:
    def __init__(self):
        self.conn = psycopg2.connect(**DB_CONFIG)
        self.conn.autocommit = True

    def buscar_solicitacao_id(self, id_solicitacao: int) -> Optional[int]:
        """Busca uma solicitação pelo id_solicitacao"""
        try:
            with self.conn.cursor() as cur:
                query = """
                    SELECT id_solicitacao
                    FROM chat
                    WHERE id_solicitacao = %s
                """
                cur.execute(query, (id_solicitacao,))
                resultado = cur.fetchone()
                return resultado[0] if resultado else None
        except Exception as e:
            print(f"Erro ao buscar solicitação: {e}")
            return None

    def buscar_prestadores_cliente_para_chat(self, id_solicitacao: int) -> Optional[Dict]:
        """Busca prestador da tabela Propostas e cliente da tabela solicitar_servico"""
        try:
            with self.conn.cursor() as cur:
                query = """
                    SELECT 
                        p.prestador_id,
                        ss.id_usuario as cliente_id,
                        ss.id_solicitacao
                    FROM solicitar_servico ss
                    LEFT JOIN "Propostas" p ON ss.id_solicitacao = p.solicitacao_id
                    WHERE ss.id_solicitacao = %s
                    AND p.status_proposta = 'aceita'
                    LIMIT 1
                """
                cur.execute(query, (id_solicitacao,))
                resultado = cur.fetchone()
                
                if resultado:
                    return {
                        'prestador_id': resultado[0],
                        'cliente_id': resultado[1],
                        'solicitacao_id': resultado[2]
                    }
                return None
        except Exception as e:
            print(f"Erro ao buscar participantes: {e}")
            return None

    def criar_chat(self, id_solicitacao: int, prestador_id: int, cliente_id: int) -> Optional[int]:
        """Cria um novo chat na tabela chat"""
        try:
            with self.conn.cursor() as cur:
                query = """
                    INSERT INTO chat (id_solicitacao, data_inicio, ativo, encerrado)
                    VALUES (%s, NOW(), TRUE, FALSE)
                    RETURNING id_chat
                """
                cur.execute(query, (id_solicitacao,))
                id_chat = cur.fetchone()[0]
                return id_chat
        except Exception as e:
            print(f"Erro ao criar chat: {e}")
            return None

    def enviar_mensagem(self, id_chat: int, id_remetente: int, mensagem: str) -> Optional[int]:
        """Envia mensagem para o chat usando id_usuario (já convertido pelo service)"""
        try:
            print(f"📨 DAO: Inserindo mensagem - Chat: {id_chat}, Remetente: {id_remetente}")

            with self.conn.cursor() as cur:
                query = """
                    INSERT INTO mensagem_chat (id_chat, id_remetente, mensagem, data_envio, lida)
                    VALUES (%s, %s, %s, NOW(), FALSE)
                    RETURNING id_mensagem
                """
                cur.execute(query, (id_chat, id_remetente, mensagem))
                id_mensagem = cur.fetchone()[0]
                
                print(f"✅ DAO: Mensagem inserida com sucesso - ID: {id_mensagem}")
                return id_mensagem
                
        except Exception as e:
            print(f"❌ DAO: Erro ao enviar mensagem: {e}")
            return None

    def buscar_mensagens_chat(self, id_chat: int) -> List[Tuple]:
        """Busca todas as mensagens de um chat específico"""
        try:
            with self.conn.cursor() as cur:
                query = """
                    SELECT 
                        mc.id_mensagem,
                        mc.id_chat,
                        mc.id_remetente,
                        mc.mensagem,
                        mc.data_envio,
                        mc.lida,
                        u.nome as remetente_nome
                    FROM mensagem_chat mc
                    JOIN usuario u ON mc.id_remetente = u.id_usuario
                    WHERE mc.id_chat = %s
                    ORDER BY mc.data_envio ASC
                """
                cur.execute(query, (id_chat,))
                return cur.fetchall()
        except Exception as e:
            print(f"Erro ao buscar mensagens: {e}")
            return []

    def marcar_mensagens_como_lidas(self, id_chat: int, id_usuario: int) -> int:
        """Marca todas as mensagens não lidas como lidas (exceto as do próprio usuário)"""
        try:
            with self.conn.cursor() as cur:
                query = """
                    UPDATE mensagem_chat 
                    SET lida = TRUE 
                    WHERE id_chat = %s 
                    AND id_remetente != %s
                    AND lida = FALSE
                """
                cur.execute(query, (id_chat, id_usuario))
                return cur.rowcount
        except Exception as e:
            print(f"Erro ao marcar mensagens como lidas: {e}")
            return 0

    def contar_mensagens_nao_lidas(self, id_chat: int, id_usuario: int) -> int:
        """Conta quantas mensagens não lidas tem para um usuário específico"""
        try:
            with self.conn.cursor() as cur:
                query = """
                    SELECT COUNT(*) 
                    FROM mensagem_chat 
                    WHERE id_chat = %s 
                    AND id_remetente != %s
                    AND lida = FALSE
                """
                cur.execute(query, (id_chat, id_usuario))
                return cur.fetchone()[0]
        except Exception as e:
            print(f"Erro ao contar mensagens não lidas: {e}")
            return 0

    def verificar_chat_existente(self, id_solicitacao: int) -> Optional[int]:
        """Verifica se já existe um chat para esta solicitação"""
        try:
            with self.conn.cursor() as cur:
                query = """
                    SELECT id_chat 
                    FROM chat 
                    WHERE id_solicitacao = %s
                """
                cur.execute(query, (id_solicitacao,))
                resultado = cur.fetchone()
                return resultado[0] if resultado else None
        except Exception as e:
            print(f"Erro ao verificar chat existente: {e}")
            return None

    def buscar_id_usuario_por_prestador(self, id_prestador: int) -> Optional[int]:
        """Busca o id_usuario correspondente ao id_prestador"""
        try:
            with self.conn.cursor() as cur:
                query = "SELECT id_usuario FROM prestador WHERE id_prestador = %s"
                cur.execute(query, (id_prestador,))
                resultado = cur.fetchone()
                return resultado[0] if resultado else None
        except Exception as e:
            print(f"Erro ao buscar id_usuario do prestador: {e}")
            return None

    def verificar_se_eh_prestador(self, id_remetente: int) -> bool:
        """Verifica se o ID é de um prestador"""
        try:
            with self.conn.cursor() as cur:
                query = "SELECT 1 FROM prestador WHERE id_prestador = %s"
                cur.execute(query, (id_remetente,))
                return cur.fetchone() is not None
        except Exception as e:
            print(f"Erro ao verificar se é prestador: {e}")
            return False

    def verificar_se_eh_usuario(self, id_remetente: int) -> bool:
        """Verifica se o ID é de um usuário"""
        try:
            with self.conn.cursor() as cur:
                query = "SELECT 1 FROM usuario WHERE id_usuario = %s"
                cur.execute(query, (id_remetente,))
                return cur.fetchone() is not None
        except Exception as e:
            print(f"Erro ao verificar se é usuário: {e}")
            return False

    def debug_buscar_chats(self, id_usuario: int):
        """Método de debug para ver a estrutura da tupla"""
        try:
            with self.conn.cursor() as cur:
                query = """
                    SELECT 
                        c.id_chat,
                        c.id_solicitacao,
                        c.data_inicio,
                        c.ativo,
                        c.encerrado,
                        ss.servico as servico_descricao,
                        p.prestador_id,
                        ss.id_usuario as cliente_id,
                        uc.nome as cliente_nome,
                        up.nome as prestador_nome
                    FROM chat c
                    JOIN solicitar_servico ss ON c.id_solicitacao = ss.id_solicitacao
                    JOIN "Propostas" p ON ss.id_solicitacao = p.solicitacao_id AND p.status_proposta = 'aceita'
                    JOIN usuario uc ON ss.id_usuario = uc.id_usuario
                    JOIN prestador pr ON p.prestador_id = pr.id_prestador
                    JOIN usuario up ON pr.id_usuario = up.id_usuario
                    WHERE p.prestador_id = %s OR ss.id_usuario = %s
                    LIMIT 1
                """
                cur.execute(query, (id_usuario, id_usuario))
                resultado = cur.fetchone()
                
                if resultado:
                    print("🔍 DEBUG - Estrutura da tupla:")
                    for i, valor in enumerate(resultado):
                        print(f"  [{i}] = {valor} (tipo: {type(valor)})")
                return resultado
        except Exception as e:
            print(f"❌ Erro no debug: {e}")
            return None

    def buscar_chats_por_usuario(self, id_usuario: int) -> List[Tuple]:
        """Busca todos os chats onde o usuário participa (como cliente ou prestador)"""
        try:
            with self.conn.cursor() as cur:
                query = """
                    SELECT 
                        c.id_chat,
                        c.id_solicitacao,
                        c.data_inicio,
                        c.ativo,
                        c.encerrado,
                        ss.servico as servico_descricao,
                        p.prestador_id,
                        ss.id_usuario as cliente_id,
                        uc.nome as cliente_nome,
                        up.nome as prestador_nome,
                        CASE 
                            WHEN %s = p.prestador_id THEN 'prestador'
                            WHEN %s = ss.id_usuario THEN 'cliente'
                            ELSE 'erro'
                        END as tipo_usuario_atual,
                        CASE 
                            WHEN %s = p.prestador_id THEN uc.nome   
                            WHEN %s = ss.id_usuario THEN up.nome    
                            ELSE 'erro'
                        END as nome_outro_participante,
                        (
                            SELECT COUNT(*) 
                            FROM mensagem_chat mc 
                            WHERE mc.id_chat = c.id_chat 
                            AND mc.id_remetente != %s
                            AND mc.lida = FALSE
                        ) as mensagens_nao_lidas
                    FROM chat c
                    JOIN solicitar_servico ss ON c.id_solicitacao = ss.id_solicitacao
                    JOIN "Propostas" p ON ss.id_solicitacao = p.solicitacao_id AND p.status_proposta = 'aceita'
                    JOIN usuario uc ON ss.id_usuario = uc.id_usuario
                    JOIN prestador pr ON p.prestador_id = pr.id_prestador
                    JOIN usuario up ON pr.id_usuario = up.id_usuario
                    WHERE p.prestador_id = %s OR ss.id_usuario = %s
                    ORDER BY c.data_inicio DESC
                """
                cur.execute(query, (id_usuario, id_usuario, id_usuario, id_usuario, id_usuario, id_usuario, id_usuario))
                return cur.fetchall()
        except Exception as e:
            print(f"Erro ao buscar chats do usuário: {e}")
            return []

    def buscar_ultima_mensagem_chat(self, id_chat: int) -> Optional[Tuple]:
        """Busca a última mensagem de um chat"""
        try:
            with self.conn.cursor() as cur:
                query = """
                    SELECT 
                        mensagem,
                        data_envio,
                        id_remetente
                    FROM mensagem_chat
                    WHERE id_chat = %s
                    ORDER BY data_envio DESC
                    LIMIT 1
                """
                cur.execute(query, (id_chat,))
                return cur.fetchone()
        except Exception as e:
            print(f"Erro ao buscar última mensagem: {e}")
            return None

    def iniciar_chat(self, id_solicitacao: int) -> Optional[int]:
        """Método principal para iniciar um chat completo"""
        try:
            # Verifica se já existe chat
            chat_existente = self.verificar_chat_existente(id_solicitacao)
            if chat_existente:
                return chat_existente

            # Busca participantes
            participantes = self.buscar_prestadores_cliente_para_chat(id_solicitacao)
            if not participantes:
                print("Participantes não encontrados para esta solicitação")
                return None

            # Verifica se tem prestador_id
            if not participantes['prestador_id']:
                print("Nenhum prestador encontrado para esta solicitação")
                return None

            # Cria novo chat
            id_chat = self.criar_chat(
                id_solicitacao,
                participantes['prestador_id'],
                participantes['cliente_id']
            )

            return id_chat

        except Exception as e:
            print(f"Erro ao iniciar chat: {e}")
            return None