import psycopg2
from psycopg2 import sql
from datetime import datetime, timedelta, time
import logging
from typing import List, Dict, Any, Tuple, Optional
from config import DB_CONFIG

logger = logging.getLogger(__name__)

class AgendamentoDAO:
    def __init__(self):
        self.conn = psycopg2.connect(**DB_CONFIG)
        self.conn.autocommit = True
        self.horarios_trabalho = {
            'inicio': time(8, 0),
            'fim': time(18, 0)
        }
        self.intervalo_agendamento = 60

    def criar_agendamento(self, id_chat: int, id_cliente: int, id_prestador: int,
                         data_hora: datetime, observacao: str = None) -> Optional[Dict[str, Any]]:
        """Criar um novo agendamento no banco de dados"""
        try:
            with self.conn.cursor() as cur:
                # Status inicial: "pendente" (aguardando resposta do prestador)
                query = """
                    INSERT INTO agendamento_servico 
                    (id_chat, id_usuario, id_prestador, data_hora, observacao, status, aceito_prestador)
                    VALUES (%s, %s, %s, %s, %s, 'pendente', NULL)
                    RETURNING *
                """
                cur.execute(query, (id_chat, id_cliente, id_prestador, data_hora, observacao))
                agendamento = cur.fetchone()
                
                if agendamento:
                    return self._format_agendamento(agendamento)
                return None
        except Exception as e:
            logger.error(f"❌ DAO: Erro ao criar agendamento: {e}")    
            return None

    def responder_agendamento(self, id_agendamento: int, aceito: bool, 
                            motivo_recusa: str = None) -> bool:
        """Prestador responde ao agendamento"""
        try:
            with self.conn.cursor() as cur:
                # Definir status baseado na resposta
                status = 'confirmado' if aceito else 'recusado'
            
                query = """
                    UPDATE agendamento_servico 
                    SET aceito_prestador = %s, 
                        data_resposta = NOW(),
                        motivo_recusa = %s,
                        status = %s,
                        updated_at = NOW()
                    WHERE id_agendamento = %s
                """

                cur.execute(query, (aceito, motivo_recusa, status, id_agendamento))
                return True
            
        except Exception as e:
            logger.error(f"❌ DAO: Erro ao responder agendamento: {e}")
            return False

    def verificar_disponibilidade_completa(self, id_prestador: int, data_hora: datetime, id_agendamento_excluir: int = None) -> Tuple[bool, str]:
        """Verificar disponibilidade considerando agendamentos E indisponibilidades"""
        try:
            with self.conn.cursor() as cur:
                # 1. Verificar se está dentro do horário de trabalho
                hora_agendamento = data_hora.time()
                if hora_agendamento < self.horarios_trabalho['inicio'] or hora_agendamento > self.horarios_trabalho['fim']:
                    return False, "Fora do horário de trabalho (08:00 - 18:00)"
                
                # 2. Verificar conflitos com agendamentos CONFIRMADOS
                query_agendamentos = """
                    SELECT id_agendamento, data_hora 
                    FROM agendamento_servico 
                    WHERE id_prestador = %s 
                    AND data_hora BETWEEN %s AND %s
                    AND status IN ('confirmado', 'agendado')
                """
                
                inicio_intervalo = data_hora - timedelta(minutes=30)
                fim_intervalo = data_hora + timedelta(minutes=30)
                
                cur.execute(query_agendamentos, (id_prestador, inicio_intervalo, fim_intervalo))
                conflitos_agendamentos = cur.fetchall()
                
                # Filtrar conflitos (excluir o próprio agendamento se for remarcação)
                if id_agendamento_excluir and conflitos_agendamentos:
                    conflitos_agendamentos = [c for c in conflitos_agendamentos if c[0] != id_agendamento_excluir]
                
                if conflitos_agendamentos:
                    return False, "Horário indisponível. Conflito com outro agendamento confirmado."
                
                # 3. Verificar conflitos com indisponibilidades
                query_indisponibilidades = """
                    SELECT id_indisponibilidade, data_inicio, data_fim
                    FROM prestador_indisponibilidade 
                    WHERE id_prestador = %s 
                    AND (data_inicio, data_fim) OVERLAPS (%s, %s)
                """
                
                cur.execute(query_indisponibilidades, (id_prestador, data_hora, data_hora))
                conflitos_indisponibilidades = cur.fetchall()
                
                if conflitos_indisponibilidades:
                    return False, "Horário indisponível. Prestador marcou este horário como indisponível."
                
                return True, "Horário disponível"
            
        except Exception as e:
            logger.error(f"❌ DAO: Erro ao verificar disponibilidade completa: {e}")
            return False, "Erro ao verificar disponibilidade"

    def criar_indisponibilidade(self, id_prestador: int, data_inicio: datetime,
                              data_fim: datetime, motivo: str = None) -> Optional[Dict[str, Any]]:
        """Criar bloco de indisponibilidade"""
        try:
            with self.conn.cursor() as cur:
                query = """
                    INSERT INTO prestador_indisponibilidade 
                    (id_prestador, data_inicio, data_fim, motivo)
                    VALUES (%s, %s, %s, %s)
                    RETURNING *
                """
                
                cur.execute(query, (id_prestador, data_inicio, data_fim, motivo))
                indisponibilidade = cur.fetchone()
                
                if indisponibilidade:
                    return self._format_indisponibilidade(indisponibilidade)
                return None
                
        except Exception as e:
            logger.error(f"❌ DAO: Erro ao criar indisponibilidade: {e}")
            return None

    def remover_indisponibilidade(self, id_indisponibilidade: int, id_prestador: int) -> bool:
        """Remover indisponibilidade"""
        try:
            with self.conn.cursor() as cur:
                query = """
                    DELETE FROM prestador_indisponibilidade 
                    WHERE id_indisponibilidade = %s AND id_prestador = %s
                """
                
                cur.execute(query, (id_indisponibilidade, id_prestador))
                return cur.rowcount > 0
                
        except Exception as e:
            logger.error(f"❌ DAO: Erro ao remover indisponibilidade: {e}")
            return False

    def listar_indisponibilidades_prestador(self, id_prestador: int, data: str = None) -> List[Dict[str, Any]]:
        """Listar indisponibilidades do prestador"""
        try:
            with self.conn.cursor() as cur:
                if data:
                    # Filtrar por data específica
                    data_obj = datetime.strptime(data, '%Y-%m-%d').date()
                    query = """
                        SELECT * FROM prestador_indisponibilidade 
                        WHERE id_prestador = %s 
                        AND (data_inicio::date = %s OR data_fim::date = %s
                             OR (data_inicio <= %s AND data_fim >= %s))
                        ORDER BY data_inicio
                    """
                    cur.execute(query, (id_prestador, data_obj, data_obj, data_obj, data_obj))
                else:
                    # Listar todas
                    query = """
                        SELECT * FROM prestador_indisponibilidade 
                        WHERE id_prestador = %s 
                        ORDER BY data_inicio
                    """
                    cur.execute(query, (id_prestador,))
                
                indisponibilidades = cur.fetchall()
                
                return [self._format_indisponibilidade(ind) for ind in indisponibilidades] if indisponibilidades else []
                
        except Exception as e:
            logger.error(f"❌ DAO: Erro ao listar indisponibilidades: {e}")
            return []

    def verificar_conflitos_agendamentos(self, id_prestador: int, data_inicio: datetime, 
                                       data_fim: datetime) -> List[Dict[str, Any]]:
        """Verificar se há agendamentos confirmados no período da indisponibilidade"""
        try:
            with self.conn.cursor() as cur:
                query = """
                    SELECT id_agendamento, data_hora, status
                    FROM agendamento_servico 
                    WHERE id_prestador = %s 
                    AND status IN ('confirmado', 'agendado')
                    AND (data_hora BETWEEN %s AND %s 
                         OR %s BETWEEN data_hora - INTERVAL '30 minutes' AND data_hora + INTERVAL '30 minutes')
                """
                
                cur.execute(query, (id_prestador, data_inicio, data_fim, data_inicio))
                conflitos = cur.fetchall()
                
                return [{"id_agendamento": c[0], "data_hora": c[1], "status": c[2]} for c in conflitos] if conflitos else []
            
        except Exception as e:
            logger.error(f"❌ DAO: Erro ao verificar conflitos: {e}")
            return []

    def _format_indisponibilidade(self, indisponibilidade) -> Dict[str, Any]:
        """Formatar indisponibilidade do banco para dicionário"""
        return {
            "id_indisponibilidade": indisponibilidade[0],
            "id_prestador": indisponibilidade[1],
            "data_inicio": indisponibilidade[2],
            "data_fim": indisponibilidade[3],
            "motivo": indisponibilidade[4],
            "created_at": indisponibilidade[5]
        }

    def _format_agendamento(self, agendamento) -> Dict[str, Any]:
        """Formatar agendamento do banco para dicionário"""
        return {
            "id_agendamento": agendamento[0],
            "id_usuario": agendamento[1],
            "id_prestador": agendamento[2],
            "data_hora": agendamento[3],
            "status": agendamento[4],
            "observacao": agendamento[5],
            "id_chat": agendamento[6],
            "created_at": agendamento[7],
            "updated_at": agendamento[8],
            "aceito_prestador": agendamento[9] if len(agendamento) > 9 else None,
            "data_resposta": agendamento[10] if len(agendamento) > 10 else None,
            "motivo_recusa": agendamento[11] if len(agendamento) > 11 else None
        }

    def remarcar_agendamento(self, id_agendamento: int, nova_data_hora: datetime, 
                           motivo: str = None) -> bool:
        """Remarcar um agendamento existente"""
        try:
            with self.conn.cursor() as cur:
                # Buscar agendamento atual para histórico
                cur.execute("SELECT data_hora FROM agendamento_servico WHERE id_agendamento = %s", 
                         (id_agendamento,))
                agendamento_atual = cur.fetchone()
                
                if not agendamento_atual:
                    return False
                
                # Atualizar agendamento
                query = """
                    UPDATE agendamento_servico 
                    SET data_hora = %s, updated_at = NOW()
                    WHERE id_agendamento = %s
                """
                
                cur.execute(query, (nova_data_hora, id_agendamento))
                
                # Registrar no histórico
                query_historico = """
                    INSERT INTO agendamento_historico 
                    (id_agendamento, data_hora_anterior, data_hora_nova, motivo)
                    VALUES (%s, %s, %s, %s)
                """
                
                cur.execute(query_historico, (
                    id_agendamento, 
                    agendamento_atual[0], 
                    nova_data_hora, 
                    motivo
                ))
                
                return True
                
        except Exception as e:
            logger.error(f"❌ DAO: Erro ao remarcar agendamento: {e}")
            return False

    def cancelar_agendamento(self, id_agendamento: int, motivo: str = None) -> bool:
        """Cancelar um agendamento"""
        try:
            with self.conn.cursor() as cur:
                query = """
                    UPDATE agendamento_servico 
                    SET status = 'cancelado', observacao = COALESCE(%s, observacao), updated_at = NOW()
                    WHERE id_agendamento = %s
                """
                
                cur.execute(query, (motivo, id_agendamento))
                return True
                
        except Exception as e:
            logger.error(f"❌ DAO: Erro ao cancelar agendamento: {e}")
            return False

    def listar_agendamentos_por_chat(self, id_chat: int) -> List[Dict[str, Any]]:
        """Listar todos os agendamentos de um chat específico"""
        try:
            with self.conn.cursor() as cur:
                query = """
                    SELECT * FROM agendamento_servico 
                    WHERE id_chat = %s 
                    ORDER BY data_hora DESC
                """
                
                cur.execute(query, (id_chat,))
                agendamentos = cur.fetchall()
                
                return [self._format_agendamento(ag) for ag in agendamentos] if agendamentos else []
                
        except Exception as e:
            logger.error(f"❌ DAO: Erro ao listar agendamentos: {e}")
            return []

    def listar_agendamentos_por_cliente(self, id_cliente: int, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Listar todos os agendamentos de um cliente"""
        try:
            with self.conn.cursor() as cur:
                if status:
                    query = """
                        SELECT * FROM agendamento_servico 
                        WHERE id_usuario = %s AND status = %s
                        ORDER BY data_hora DESC
                    """
                    cur.execute(query, (id_cliente, status))
                else:
                    query = """
                        SELECT * FROM agendamento_servico 
                        WHERE id_usuario = %s
                        ORDER BY data_hora DESC
                    """
                    cur.execute(query, (id_cliente,))
                
                agendamentos = cur.fetchall()
                
                return [self._format_agendamento(ag) for ag in agendamentos] if agendamentos else []
                
        except Exception as e:
            logger.error(f"❌ DAO: Erro ao listar agendamentos do cliente: {e}")
            return []

    def listar_agendamentos_por_prestador(self, id_prestador: int, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Listar todos os agendamentos de um prestador"""
        try:
            with self.conn.cursor() as cur:
                if status:
                    query = """
                        SELECT * FROM agendamento_servico 
                        WHERE id_prestador = %s AND status = %s
                        ORDER BY data_hora DESC
                    """
                    cur.execute(query, (id_prestador, status))
                else:
                    query = """
                        SELECT * FROM agendamento_servico 
                        WHERE id_prestador = %s
                        ORDER BY data_hora DESC
                    """
                    cur.execute(query, (id_prestador,))
                
                agendamentos = cur.fetchall()
                
                return [self._format_agendamento(ag) for ag in agendamentos] if agendamentos else []
                
        except Exception as e:
            logger.error(f"❌ DAO: Erro ao listar agendamentos do prestador: {e}")
            return []

    def buscar_agendamento_por_id(self, id_agendamento: int) -> Optional[Dict[str, Any]]:
        """Buscar um agendamento específico por ID"""
        try:
            with self.conn.cursor() as cur:
                query = "SELECT * FROM agendamento_servico WHERE id_agendamento = %s"
                
                cur.execute(query, (id_agendamento,))
                agendamento = cur.fetchone()
                
                if agendamento:
                    return self._format_agendamento(agendamento)
                return None
                
        except Exception as e:
            logger.error(f"❌ DAO: Erro ao buscar agendamento: {e}")
            return None

    def buscar_horarios_disponiveis(self, id_prestador: int, data: datetime.date) -> List[str]:
        """Buscar horários disponíveis para um prestador em uma data específica"""
        try:
            horarios_disponiveis = []
            
            # Gerar todos os horários possíveis no dia
            hora_atual = datetime.combine(data, self.horarios_trabalho['inicio'])
            hora_final = datetime.combine(data, self.horarios_trabalho['fim'])
            
            while hora_atual <= hora_final:
                # Verificar disponibilidade para este horário
                disponivel, _ = self.verificar_disponibilidade_completa(id_prestador, hora_atual)
                
                if disponivel:
                    horarios_disponiveis.append(hora_atual.isoformat())
                
                hora_atual += timedelta(minutes=self.intervalo_agendamento)
            
            return horarios_disponiveis
            
        except Exception as e:
            logger.error(f"❌ DAO: Erro ao buscar horários disponíveis: {e}")
            return []

    def buscar_historico_agendamento(self, id_agendamento: int) -> List[Dict[str, Any]]:
        """Buscar histórico de um agendamento"""
        try:
            with self.conn.cursor() as cur:
                query = """
                    SELECT * FROM agendamento_historico 
                    WHERE id_agendamento = %s
                    ORDER BY created_at DESC
                """
                
                cur.execute(query, (id_agendamento,))
                historico = cur.fetchall()
                
                return [self._format_historico(h) for h in historico] if historico else []
                
        except Exception as e:
            logger.error(f"❌ DAO: Erro ao buscar histórico: {e}")
            return []

    def _format_historico(self, historico) -> Dict[str, Any]:
        """Formatar histórico do banco para dicionário"""
        return {
            "id_historico": historico[0],
            "id_agendamento": historico[1],
            "data_hora_anterior": historico[2],
            "data_hora_nova": historico[3],
            "motivo": historico[4],
            "created_at": historico[5]
        }

    def __del__(self):
        """Fechar conexão ao destruir objeto"""
        if hasattr(self, 'conn'):
            self.conn.close()