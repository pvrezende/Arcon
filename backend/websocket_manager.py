# websocket_manager.py
from fastapi import WebSocket
from typing import Dict, List
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # { room_id: [websocket1, websocket2, ...] }
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # { user_id: [websocket1, websocket2, ...] } - PARA NOTIFICAÇÕES DE AGENDAMENTO
        self.user_connections: Dict[int, List[WebSocket]] = {}
        logger.info("✅ WebSocket Manager inicializado")

    async def connect(self, websocket: WebSocket, room_id: int):
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)
        logger.info(f"✅ Usuário conectado ao chat {room_id}. Conexões ativas: {len(self.active_connections[room_id])}")

    def disconnect(self, websocket: WebSocket, room_id: int):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
            logger.info(f"✅ Usuário desconectado do chat {room_id}. Conexões restantes: {len(self.active_connections.get(room_id, []))}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_to_room(self, message: str, room_id: int):
        if room_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[room_id]:
                try:
                    await connection.send_text(message)
                    logger.info(f"✅ Mensagem broadcast para chat {room_id}")
                except Exception as e:
                    logger.error(f"❌ Erro ao enviar para WebSocket: {e}")
                    disconnected.append(connection)
            
            # Remove conexões que falharam
            for connection in disconnected:
                self.disconnect(connection, room_id)

    # ========== NOVOS MÉTODOS PARA AGENDAMENTOS ==========

    async def connect_user(self, websocket: WebSocket, user_id: int):
        """Conectar usuário para receber notificações de agendamento"""
        if user_id not in self.user_connections:
            self.user_connections[user_id] = []
        self.user_connections[user_id].append(websocket)
        logger.info(f"✅ Usuário {user_id} conectado para notificações. Conexões: {len(self.user_connections[user_id])}")

    def disconnect_user(self, websocket: WebSocket, user_id: int):
        """Desconectar usuário das notificações"""
        if user_id in self.user_connections:
            self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
            logger.info(f"✅ Usuário {user_id} desconectado das notificações")

    async def notify_agendamento_criado(self, agendamento: dict, id_chat: int, id_prestador: int, id_cliente: int):
        """Notificar sobre novo agendamento criado"""
        message = {
            "type": "agendamento_criado",
            "agendamento": agendamento,
            "message": "Novo agendamento solicitado!",
            "timestamp": agendamento.get('created_at')
        }
        
        # 1. Broadcast para a sala do chat
        await self.broadcast_to_room(json.dumps(message, default=str), id_chat)
        
        # 2. Notificar específicamente o prestador (se estiver conectado)
        prestador_message = {
            "type": "agendamento_solicitado",
            "agendamento": agendamento,
            "message": "Você tem uma nova solicitação de agendamento!",
            "timestamp": agendamento.get('created_at')
        }
        
        if id_prestador in self.user_connections:
            disconnected = []
            for connection in self.user_connections[id_prestador]:
                try:
                    await connection.send_text(json.dumps(prestador_message, default=str))
                    logger.info(f"✅ Notificação de agendamento enviada para prestador {id_prestador}")
                except Exception as e:
                    logger.error(f"❌ Erro ao notificar prestador {id_prestador}: {e}")
                    disconnected.append(connection)
            
            for connection in disconnected:
                self.disconnect_user(connection, id_prestador)

    async def notify_agendamento_respondido(self, agendamento: dict, id_chat: int, id_cliente: int):
        """Notificar sobre resposta do prestador"""
        status = "confirmado" if agendamento.get('aceito_prestador') else "recusado"
        message = {
            "type": "agendamento_respondido",
            "agendamento": agendamento,
            "message": f"Agendamento {status} pelo prestador!",
            "status": status,
            "timestamp": agendamento.get('data_resposta')
        }
        
        # 1. Broadcast para a sala do chat
        await self.broadcast_to_room(json.dumps(message, default=str), id_chat)
        
        # 2. Notificar específicamente o cliente (se estiver conectado)
        cliente_message = {
            "type": "agendamento_resposta",
            "agendamento": agendamento,
            "message": f"Seu agendamento foi {status}!" + 
                      (f" Motivo: {agendamento.get('motivo_recusa')}" if not agendamento.get('aceito_prestador') else ""),
            "status": status,
            "timestamp": agendamento.get('data_resposta')
        }
        
        if id_cliente in self.user_connections:
            disconnected = []
            for connection in self.user_connections[id_cliente]:
                try:
                    await connection.send_text(json.dumps(cliente_message, default=str))
                    logger.info(f"✅ Notificação de resposta enviada para cliente {id_cliente}")
                except Exception as e:
                    logger.error(f"❌ Erro ao notificar cliente {id_cliente}: {e}")
                    disconnected.append(connection)
            
            for connection in disconnected:
                self.disconnect_user(connection, id_cliente)

    async def notify_agendamento_remarcado(self, agendamento: dict, id_chat: int, id_prestador: int, id_cliente: int, id_usuario_que_remarcou: int, motivo: str = None):
        """Notificar sobre remarcação de agendamento (com info de quem remarcou)"""
        # Determina quem remarcou com base no id informado
        if id_usuario_que_remarcou == id_prestador:
            quem_remarcou = "prestador"
            nome_quem_remarcou = "Prestador"
        elif id_usuario_que_remarcou == id_cliente:
            quem_remarcou = "cliente"
            nome_quem_remarcou = "Cliente"
        else:
            quem_remarcou = "desconhecido"
            nome_quem_remarcou = "Usuário"

        message = {
            "type": "agendamento_remarcado",
            "agendamento": agendamento,
            "message": f"Agendamento remarcado! {nome_quem_remarcou}",
            "quem_remarcou": quem_remarcou,
            "id_usuario_que_remarcou": id_usuario_que_remarcou,
            "motivo": motivo,
            "timestamp": agendamento.get('updated_at')
        }
        
        # Broadcast para a sala do chat
        await self.broadcast_to_room(json.dumps(message, default=str), id_chat)
        
        # Notificar ambos os usuários individualmente
        user_message = {
            "type": "agendamento_atualizado",
            "agendamento": agendamento,
            "message": f"O {nome_quem_remarcou} remarcou o agendamento" + (f". Motivo: {motivo}" if motivo else ""),
            "timestamp": agendamento.get('updated_at')
        }

        # Se cliente remarcou, notificar prestador
        if quem_remarcou == "cliente" and id_prestador in self.user_connections:
            for connection in self.user_connections[id_prestador]:
                try:
                    await connection.send_text(json.dumps(user_message, default=str))
                except Exception as e:
                    logger.error(f"❌ Erro ao notificar prestador na remarcação: {e}")

        # Se prestador remarcou, notificar cliente
        if quem_remarcou == "prestador" and id_cliente in self.user_connections:
            for connection in self.user_connections[id_cliente]:
                try:
                    await connection.send_text(json.dumps(user_message, default=str))
                except Exception as e:
                    logger.error(f"❌ Erro ao notificar cliente na remarcação: {e}")

    async def notify_agendamento_cancelado(self, agendamento: dict, id_chat: int, id_prestador: int, id_cliente: int, id_usuario_que_cancelou: int = None, motivo: str = None):
        """Notificar sobre cancelamento de agendamento"""
        # Determina quem cancelou
        if id_usuario_que_cancelou == id_prestador:
            quem_cancelou = "prestador"
            nome_quem_cancelou = "Prestador"
        elif id_usuario_que_cancelou == id_cliente:
            quem_cancelou = "cliente"
            nome_quem_cancelou = "Cliente"
        else:
            quem_cancelou = "desconhecido"
            nome_quem_cancelou = "Usuário"

        message = {
            "type": "agendamento_cancelado",
            "agendamento": agendamento,
            "message": "Agendamento cancelado!",
            "timestamp": agendamento.get('updated_at'),
            "quem_cancelou": quem_cancelou,
            "id_usuario_que_cancelou": id_usuario_que_cancelou,
            "motivo": motivo
        }
        
        # Broadcast para a sala do chat
        await self.broadcast_to_room(json.dumps(message, default=str), id_chat)
        
        # Notificar o usuário que NÃO cancelou
        user_message = {
            "type": "agendamento_cancelado",
            "agendamento": agendamento,
            "message": f"Agendamento cancelado. Motivo: {agendamento.get('observacao', 'Não informado')}",
            "timestamp": agendamento.get('updated_at')
        }
        
        # Se cliente cancelou, notificar prestador
        if id_prestador in self.user_connections:
            for connection in self.user_connections[id_prestador]:
                try:
                    await connection.send_text(json.dumps(user_message, default=str))
                except Exception as e:
                    logger.error(f"❌ Erro ao notificar prestador no cancelamento: {e}")

        # Se prestador cancelou, notificar cliente
        if id_cliente in self.user_connections:
            for connection in self.user_connections[id_cliente]:
                try:
                    await connection.send_text(json.dumps(user_message, default=str))
                except Exception as e:
                    logger.error(f"❌ Erro ao notificar cliente no cancelamento: {e}")

    async def notify_indisponibilidade_criada(self, indisponibilidade: dict, id_prestador: int):
        """Notificar sobre nova indisponibilidade (para atualizar disponibilidade em tempo real)"""
        message = {
            "type": "indisponibilidade_criada",
            "indisponibilidade": indisponibilidade,
            "message": "Horário marcado como indisponível",
            "timestamp": indisponibilidade.get('created_at')
        }
        
        # Notificar apenas o prestador (opcional: para confirmar)
        if id_prestador in self.user_connections:
            for connection in self.user_connections[id_prestador]:
                try:
                    await connection.send_text(json.dumps(message, default=str))
                    logger.info(f"✅ Notificação de indisponibilidade enviada para prestador {id_prestador}")
                except Exception as e:
                    logger.error(f"❌ Erro ao notificar prestador sobre indisponibilidade: {e}")

# Instância global do gerenciador
manager = ConnectionManager()