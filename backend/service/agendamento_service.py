from DAO.agendamento_dao import AgendamentoDAO
from websocket_manager import manager
from datetime import datetime, timedelta
import logging
from typing import Tuple, Dict, Any, Optional

logger = logging.getLogger(__name__)

class AgendamentoService:
    def __init__(self):
        self.agendamento_dao = AgendamentoDAO()
    
    async def agendar_servico(self, id_chat: int, id_cliente: int, id_prestador: int, 
                       data_hora: str, observacao: str = None) -> Tuple[Dict[str, Any], int]:
        """Agendar um novo serviço (aguardando resposta do prestador)"""
        try:
            # Validar data/hora
            try:
                data_hora_obj = datetime.fromisoformat(data_hora.replace('Z', '+00:00'))
            except ValueError:
                return {"error": "Formato de data/hora inválido. Use ISO format."}, 400
            
            # Verificar se a data não é no passado
            if data_hora_obj < datetime.now() - timedelta(minutes=5):
                return {"error": "Não é possível agendar para datas passadas."}, 400
            
            # Verificar disponibilidade do prestador (agendamentos + indisponibilidades)
            disponivel, mensagem = self.agendamento_dao.verificar_disponibilidade_completa(
                id_prestador, data_hora_obj
            )
            
            if not disponivel:
                return {"error": mensagem}, 400
            
            # Criar agendamento com status "pendente"
            agendamento = self.agendamento_dao.criar_agendamento(
                id_chat=id_chat,
                id_cliente=id_cliente,
                id_prestador=id_prestador,
                data_hora=data_hora_obj,
                observacao=observacao
            )
            
            if agendamento:
                # NOTIFICAR VIA WEBSOCKET - TEMPO REAL
                await manager.notify_agendamento_criado(
                    agendamento=agendamento,
                    id_chat=id_chat,
                    id_prestador=id_prestador,
                    id_cliente=id_cliente
                )
                
                return {
                    "message": "Solicitação de agendamento enviada! Aguarde a confirmação do prestador.",
                    "agendamento": agendamento,
                    "status": "pendente"
                }, 201
            else:
                return {"error": "Erro ao criar agendamento."}, 500
                
        except Exception as e:
            logger.error(f"❌ Service: Erro ao agendar serviço: {e}")
            return {"error": "Erro interno ao agendar serviço."}, 500
    
    async def responder_agendamento(self, id_agendamento: int, id_prestador: int, 
                            aceito: bool, motivo_recusa: str = None) -> Tuple[Dict[str, Any], int]:
        """Prestador aceita ou recusa um agendamento"""
        try:
            # Buscar agendamento
            agendamento = self.agendamento_dao.buscar_agendamento_por_id(id_agendamento)
            
            if not agendamento:
                return {"error": "Agendamento não encontrado."}, 404
            
            # Verificar se o prestador é o dono do agendamento
            if agendamento['id_prestador'] != id_prestador:
                return {"error": "Apenas o prestador pode responder este agendamento."}, 403
            
            # Verificar se já não foi respondido
            if agendamento['aceito_prestador'] is not None:
                return {"error": "Este agendamento já foi respondido."}, 400
            
            # Atualizar agendamento
            sucesso = self.agendamento_dao.responder_agendamento(
                id_agendamento=id_agendamento,
                aceito=aceito,
                motivo_recusa=motivo_recusa
            )
            
            if sucesso:
                agendamento_atualizado = self.agendamento_dao.buscar_agendamento_por_id(id_agendamento)
                
                # NOTIFICAR VIA WEBSOCKET - TEMPO REAL
                await manager.notify_agendamento_respondido(
                    agendamento=agendamento_atualizado,
                    id_chat=agendamento['id_chat'],
                    id_cliente=agendamento['id_usuario']
                )
                
                status = "confirmado" if aceito else "recusado"
                return {
                    "message": f"Agendamento {status} com sucesso!",
                    "agendamento": agendamento_atualizado
                }, 200
            else:
                return {"error": "Erro ao responder agendamento."}, 500
                
        except Exception as e:
            logger.error(f"❌ Service: Erro ao responder agendamento: {e}")
            return {"error": "Erro interno ao responder agendamento."}, 500
    
    async def criar_indisponibilidade(self, id_prestador: int, data_inicio: str, 
                              data_fim: str, motivo: str = None) -> Tuple[Dict[str, Any], int]:
        """Criar um bloco de indisponibilidade para o prestador"""
        try:
            # Validar datas
            try:
                data_inicio_obj = datetime.fromisoformat(data_inicio.replace('Z', '+00:00'))
                data_fim_obj = datetime.fromisoformat(data_fim.replace('Z', '+00:00'))
            except ValueError:
                return {"error": "Formato de data/hora inválido. Use ISO format."}, 400
            
            # Verificar se data fim é depois da data início
            if data_fim_obj <= data_inicio_obj:
                return {"error": "Data fim deve ser após data início."}, 400
            
            # Verificar conflitos com agendamentos existentes
            conflitos = self.agendamento_dao.verificar_conflitos_agendamentos(
                id_prestador, data_inicio_obj, data_fim_obj
            )
            
            if conflitos:
                return {
                    "error": "Existem agendamentos confirmados neste período.",
                    "conflitos": conflitos
                }, 400
            
            # Criar indisponibilidade
            indisponibilidade = self.agendamento_dao.criar_indisponibilidade(
                id_prestador=id_prestador,
                data_inicio=data_inicio_obj,
                data_fim=data_fim_obj,
                motivo=motivo
            )
            
            if indisponibilidade:
                # NOTIFICAR VIA WEBSOCKET (opcional - para confirmar)
                await manager.notify_indisponibilidade_criada(
                    indisponibilidade=indisponibilidade,
                    id_prestador=id_prestador
                )
                
                return {
                    "message": "Indisponibilidade criada com sucesso!",
                    "indisponibilidade": indisponibilidade
                }, 201
            else:
                return {"error": "Erro ao criar indisponibilidade."}, 500
                
        except Exception as e:
            logger.error(f"❌ Service: Erro ao criar indisponibilidade: {e}")
            return {"error": "Erro interno ao criar indisponibilidade."}, 500
    
    async def remover_indisponibilidade(self, id_indisponibilidade: int, id_prestador: int) -> Tuple[Dict[str, Any], int]:
        """Remover uma indisponibilidade"""
        try:
            sucesso = self.agendamento_dao.remover_indisponibilidade(
                id_indisponibilidade=id_indisponibilidade,
                id_prestador=id_prestador
            )
            
            if sucesso:
                return {
                    "message": "Indisponibilidade removida com sucesso!"
                }, 200
            else:
                return {"error": "Erro ao remover indisponibilidade ou indisponibilidade não encontrada."}, 404
                
        except Exception as e:
            logger.error(f"❌ Service: Erro ao remover indisponibilidade: {e}")
            return {"error": "Erro interno ao remover indisponibilidade."}, 500
    
    def listar_indisponibilidades_prestador(self, id_prestador: int, data: str = None) -> Tuple[Dict[str, Any], int]:
        """Listar indisponibilidades do prestador"""
        try:
            indisponibilidades = self.agendamento_dao.listar_indisponibilidades_prestador(
                id_prestador, data
            )
            
            return {
                "prestador_id": id_prestador,
                "indisponibilidades": indisponibilidades,
                "total": len(indisponibilidades)
            }, 200
                
        except Exception as e:
            logger.error(f"❌ Service: Erro ao listar indisponibilidades: {e}")
            return {"error": "Erro interno ao listar indisponibilidades."}, 500
    
    async def remarcar_servico(self, id_agendamento: int, id_usuario: int, 
                        nova_data_hora: str, motivo: str = None) -> Tuple[Dict[str, Any], int]:
        """Remarcar um serviço (até 2 horas antes do horário marcado) - PARA CLIENTE E PRESTADOR"""
        try:
            # Buscar agendamento atual
            agendamento = self.agendamento_dao.buscar_agendamento_por_id(id_agendamento)
            
            if not agendamento:
                return {"error": "Agendamento não encontrado."}, 404
            
            # Verificar se o usuário tem permissão (cliente OU prestador)
            if agendamento['id_usuario'] != id_usuario and agendamento['id_prestador'] != id_usuario:
                return {"error": "Apenas o cliente ou prestador podem remarcar este agendamento."}, 403
            
            # Verificar se o status permite remarcação
            if agendamento['status'] not in ['confirmado', 'agendado', 'pendente']:
                return {"error": "Este agendamento não pode ser remarcado."}, 400
            
            # Converter data/hora atual do agendamento
            data_hora_agendamento = agendamento['data_hora']
            
            # Verificar regra das 2 horas (para ambos)
            tempo_restante = data_hora_agendamento - datetime.now()
            duas_horas = timedelta(hours=2)
            
            if tempo_restante < duas_horas:
                return {
                    "error": "Não é possível remarcar. Faltam menos de 2 horas para o serviço."
                }, 400
            
            # Validar nova data/hora
            try:
                nova_data_hora_obj = datetime.fromisoformat(nova_data_hora.replace('Z', '+00:00'))
            except ValueError:
                return {"error": "Formato de data/hora inválido. Use ISO format."}, 400
            
            # Verificar se nova data não é no passado
            if nova_data_hora_obj < datetime.now():
                return {"error": "Não é possível remarcar para datas passadas."}, 400
            
            # Verificar disponibilidade do prestador na nova data
            disponivel, mensagem = self.agendamento_dao.verificar_disponibilidade_completa(
                agendamento['id_prestador'], nova_data_hora_obj, id_agendamento
            )
            
            if not disponivel:
                return {"error": mensagem}, 400
            
            # Realizar remarcação
            sucesso = self.agendamento_dao.remarcar_agendamento(
                id_agendamento=id_agendamento,
                nova_data_hora=nova_data_hora_obj,
                motivo=motivo
            )
            
            if sucesso:
                agendamento_atualizado = self.agendamento_dao.buscar_agendamento_por_id(id_agendamento)
                
                # NOTIFICAR VIA WEBSOCKET - TEMPO REAL
                await manager.notify_agendamento_remarcado(
                    agendamento=agendamento_atualizado,
                    id_chat=agendamento['id_chat'],
                    id_prestador=agendamento['id_prestador'],
                    id_cliente=agendamento['id_usuario'],
                    id_usuario_que_remarcou=id_usuario,
                    motivo=motivo
                )
                
                return {
                    "message": "Serviço remarcado com sucesso!",
                    "agendamento": agendamento_atualizado
                }, 200
            else:
                return {"error": "Erro ao remarcar serviço."}, 500
                
        except Exception as e:
            logger.error(f"❌ Service: Erro ao remarcar serviço: {e}")
            return {"error": "Erro interno ao remarcar serviço."}, 500

    async def cancelar_agendamento(self, id_agendamento: int, id_usuario: int, 
                            motivo: str = None) -> Tuple[Dict[str, Any], int]:
        """Cancelar um agendamento - PARA CLIENTE E PRESTADOR"""
        try:
            # Buscar agendamento
            agendamento = self.agendamento_dao.buscar_agendamento_por_id(id_agendamento)
            
            if not agendamento:
                return {"error": "Agendamento não encontrado."}, 404
            
            # Verificar se o usuário tem permissão (cliente OU prestador)
            if agendamento['id_usuario'] != id_usuario and agendamento['id_prestador'] != id_usuario:
                return {"error": "Apenas o cliente ou prestador podem cancelar este agendamento."}, 403
            
            # Verificar se pode cancelar (regra das 2 horas para ambos)
            tempo_restante = agendamento['data_hora'] - datetime.now()
            duas_horas = timedelta(hours=2)
            
            if tempo_restante < duas_horas:
                return {
                    "error": "Não é possível cancelar. Faltam menos de 2 horas para o serviço."
                }, 400
            
            # Realizar cancelamento
            sucesso = self.agendamento_dao.cancelar_agendamento(
                id_agendamento=id_agendamento,
                motivo=motivo
            )
            
            if sucesso:
                agendamento_atualizado = self.agendamento_dao.buscar_agendamento_por_id(id_agendamento)
                
                # NOTIFICAR VIA WEBSOCKET - TEMPO REAL
                await manager.notify_agendamento_cancelado(
                    agendamento=agendamento_atualizado,
                    id_chat=agendamento['id_chat'],
                    id_prestador=agendamento['id_prestador'],
                    id_cliente=agendamento['id_usuario'],
                    id_usuario_que_cancelou=id_usuario,
                    motivo=motivo
                )
                
                return {
                    "message": "Agendamento cancelado com sucesso!",
                    "agendamento": agendamento_atualizado
                }, 200
            else:
                return {"error": "Erro ao cancelar agendamento."}, 500
                
        except Exception as e:
            logger.error(f"❌ Service: Erro ao cancelar agendamento: {e}")
            return {"error": "Erro interno ao cancelar agendamento."}, 500
    
    def listar_agendamentos_chat(self, id_chat: int) -> Tuple[Dict[str, Any], int]:
        """Listar todos os agendamentos de um chat"""
        try:
            agendamentos = self.agendamento_dao.listar_agendamentos_por_chat(id_chat)
            
            return {
                "agendamentos": agendamentos,
                "total": len(agendamentos)
            }, 200
                
        except Exception as e:
            logger.error(f"❌ Service: Erro ao listar agendamentos: {e}")
            return {"error": "Erro interno ao listar agendamentos."}, 500
    
    def listar_agendamentos_cliente(self, id_cliente: int, status: Optional[str] = None) -> Tuple[Dict[str, Any], int]:
        """Listar todos os agendamentos de um cliente"""
        try:
            agendamentos = self.agendamento_dao.listar_agendamentos_por_cliente(id_cliente, status)
            
            return {
                "cliente_id": id_cliente,
                "agendamentos": agendamentos,
                "total": len(agendamentos),
                "filtro_status": status
            }, 200
                
        except Exception as e:
            logger.error(f"❌ Service: Erro ao listar agendamentos do cliente: {e}")
            return {"error": "Erro interno ao listar agendamentos do cliente."}, 500
    
    def listar_agendamentos_prestador(self, id_prestador: int, status: Optional[str] = None) -> Tuple[Dict[str, Any], int]:
        """Listar todos os agendamentos de um prestador"""
        try:
            agendamentos = self.agendamento_dao.listar_agendamentos_por_prestador(id_prestador, status)
            
            return {
                "prestador_id": id_prestador,
                "agendamentos": agendamentos,
                "total": len(agendamentos),
                "filtro_status": status
            }, 200
                
        except Exception as e:
            logger.error(f"❌ Service: Erro ao listar agendamentos do prestador: {e}")
            return {"error": "Erro interno ao listar agendamentos do prestador."}, 500
    
    def verificar_disponibilidade_prestador(self, id_prestador: int, data: str) -> Tuple[Dict[str, Any], int]:
        """Verificar disponibilidade do prestador em uma data específica"""
        try:
            # Converter data
            try:
                data_obj = datetime.strptime(data, '%Y-%m-%d').date()
            except ValueError:
                return {"error": "Formato de data inválido. Use YYYY-MM-DD."}, 400
            
            # Buscar horários disponíveis
            horarios_disponiveis = self.agendamento_dao.buscar_horarios_disponiveis(
                id_prestador, data_obj
            )
            
            return {
                "data": data,
                "id_prestador": id_prestador,
                "horarios_disponiveis": horarios_disponiveis
            }, 200
                
        except Exception as e:
            logger.error(f"❌ Service: Erro ao verificar disponibilidade: {e}")
            return {"error": "Erro interno ao verificar disponibilidade."}, 500
    
    def buscar_agendamento(self, id_agendamento: int) -> Tuple[Dict[str, Any], int]:
        """Buscar detalhes de um agendamento específico"""
        try:
            agendamento = self.agendamento_dao.buscar_agendamento_por_id(id_agendamento)
            
            if not agendamento:
                return {"error": "Agendamento não encontrado."}, 404
            
            return {
                "agendamento": agendamento
            }, 200
                
        except Exception as e:
            logger.error(f"❌ Service: Erro ao buscar agendamento: {e}")
            return {"error": "Erro interno ao buscar agendamento."}, 500
    
    def buscar_historico_agendamento(self, id_agendamento: int) -> Tuple[Dict[str, Any], int]:
        """Buscar histórico de um agendamento"""
        try:
            historico = self.agendamento_dao.buscar_historico_agendamento(id_agendamento)
            
            return {
                "id_agendamento": id_agendamento,
                "historico": historico,
                "total_alteracoes": len(historico)
            }, 200
                
        except Exception as e:
            logger.error(f"❌ Service: Erro ao buscar histórico: {e}")
            return {"error": "Erro interno ao buscar histórico."}, 500