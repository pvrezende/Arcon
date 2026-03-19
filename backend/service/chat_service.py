import logging
from typing import Tuple, Dict, Any, Optional
from DAO.chat_dao import ChatDAO
from websocket_manager import manager
import json

logger = logging.getLogger(__name__)

from DAO.chat_dao import ChatDAO
from typing import Tuple, Dict, Any

from DAO.agendamento_dao import AgendamentoDAO
from datetime import timedelta

class ChatService:
    def __init__(self):
        self.chat_dao = ChatDAO()
        self.agendamento_dao = AgendamentoDAO()

    async def enviar_mensagem(self, id_chat: int, id_remetente: int, mensagem: str) -> Tuple[Dict[str, Any], int]:
        """Envia uma mensagem no chat e notifica via WebSocket"""
        logger.info(f"🔄 Service: Enviando mensagem - Chat: {id_chat}, Remetente: {id_remetente}")

        if not all([id_chat, id_remetente, mensagem]):
            return {"error": "ID do chat, ID do remetente e mensagem são obrigatórios"}, 400
        
        if len(mensagem.strip()) == 0:
            return {"error": "A mensagem não pode estar vazia"}, 400

        # 🔥 CORREÇÃO: Converter id_prestador para id_usuario se necessário
        id_remetente_final = await self._converter_id_remetente(id_remetente)
        
        if id_remetente_final is None:
            return {"error": "Remetente não encontrado na base de dados"}, 404

        logger.info(f"✅ Service: ID convertido - Original: {id_remetente}, Final: {id_remetente_final}")

        # Envia mensagem para o banco (parte síncrona)
        id_mensagem = self.chat_dao.enviar_mensagem(id_chat, id_remetente_final, mensagem)
        
        if not id_mensagem:
            return {"error": "Erro ao enviar mensagem"}, 500
        
        logger.info(f"✅ Service: Mensagem salva no banco. ID: {id_mensagem}")
        
        # ✅ WEBSOCKET: Busca dados completos da mensagem para broadcast
        try:
            mensagens = self.chat_dao.buscar_mensagens_chat(id_chat)
            if mensagens:
                # Encontra a mensagem que acabou de ser enviada (última da lista)
                ultima_msg = None
                for msg in mensagens:
                    if msg[0] == id_mensagem:  # id_mensagem coincide
                        ultima_msg = msg
                        break
                
                if ultima_msg:
                    mensagem_data = {
                        "type": "new_message",
                        "id_mensagem": ultima_msg[0],
                        "id_chat": ultima_msg[1],
                        "id_remetente": ultima_msg[2],
                        "mensagem": ultima_msg[3],
                        "data_envio": ultima_msg[4].isoformat() if ultima_msg[4] else None,
                        "lida": ultima_msg[5],
                        "remetente_nome": ultima_msg[6],
                        "timestamp": ultima_msg[4].isoformat() if ultima_msg[4] else None
                    }
                    
                    # ✅ BROADCAST PARA TODOS NO CHAT
                    logger.info(f"📢 Enviando broadcast para chat {id_chat}")
                    await manager.broadcast_to_room(json.dumps(mensagem_data), id_chat)
                    logger.info(f"✅ Broadcast enviado com sucesso para chat {id_chat}")
                else:
                    logger.warning(f"⚠️ Mensagem {id_mensagem} não encontrada na lista")
            else:
                logger.warning(f"⚠️ Nenhuma mensagem encontrada para chat {id_chat}")
                
        except Exception as e:
            logger.error(f"❌ Erro no WebSocket broadcast: {e}")
            # Não falha o envio da mensagem por causa do WebSocket
        
        return {"message": "Mensagem enviada com sucesso", "id_mensagem": id_mensagem}, 201

    async def _converter_id_remetente(self, id_remetente: int) -> Optional[int]:
        """Converte id_prestador para id_usuario se necessário"""
        try:
            # Primeiro verifica se é um prestador (busca na tabela prestador)
            if self.chat_dao.verificar_se_eh_prestador(id_remetente):
                id_usuario = self.chat_dao.buscar_id_usuario_por_prestador(id_remetente)
                if id_usuario:
                    logger.info(f"🔧 Service: Prestador detectado - id_prestador {id_remetente} -> id_usuario {id_usuario}")
                    return id_usuario
                else:
                    logger.error(f"❌ Service: Prestador {id_remetente} não encontrado na tabela prestador")
                    return None
            else:
                # Verifica se é um usuário válido
                if self.chat_dao.verificar_se_eh_usuario(id_remetente):
                    logger.info(f"🔧 Service: Cliente detectado - id_usuario {id_remetente}")
                    return id_remetente
                else:
                    # ID não encontrado em nenhuma tabela
                    logger.error(f"❌ Service: ID {id_remetente} não encontrado como prestador nem como usuário")
                    return None
                        
        except Exception as e:
            logger.error(f"❌ Service: Erro ao converter ID remetente: {str(e)}")
            return None

    def iniciar_chat(self, id_solicitacao: int) -> Tuple[Dict[str, Any], int]:
        """Inicia um novo chat para uma solicitação"""
        if not id_solicitacao:
            return {"error": "ID da solicitação é obrigatório"}, 400
        
        id_chat = self.chat_dao.iniciar_chat(id_solicitacao)
        
        if not id_chat:
            return {"error": "Não foi possível criar o chat. Verifique se a solicitação existe e tem um prestador."}, 400
        
        return {"message": "Chat criado com sucesso", "id_chat": id_chat}, 201
    
    def buscar_mensagens_chat(self, id_chat: int, id_usuario: int = None) -> Tuple[Dict[str, Any], int]:
        """Busca mensagens de um chat e marca como lidas se usuário for especificado"""
        if not id_chat:
            return {"error": "ID do chat é obrigatório"}, 400
        
        # Marca mensagens como lidas se o usuário for especificado
        if id_usuario:
            self.chat_dao.marcar_mensagens_como_lidas(id_chat, id_usuario)
        
        mensagens = self.chat_dao.buscar_mensagens_chat(id_chat)
        
        agendamentos = self.agendamento_dao.listar_agendamentos_por_chat(id_chat)

        # Formata as mensagens para resposta
        mensagens_formatadas = []
        for msg in mensagens:
            mensagens_formatadas.append({
                "type": "message",
                "id_mensagem": msg[0],
                "id_chat": msg[1],
                "id_remetente": msg[2],
                "mensagem": msg[3],
                "data_envio": msg[4].isoformat() if msg[4] else None,
                "lida": msg[5],
                "remetente_nome": msg[6],
                "timestamp": msg[4].isoformat() if msg[4] else None
            })

        agendamentos_formatados = []
        for agendamento in agendamentos:
            agendamentos_formatados.append({
                "type": "agendamento",
                "id_agendamento": agendamento['id_agendamento'],
                "id_chat": agendamento['id_chat'],
                "data_hora": agendamento['data_hora'].isoformat() if agendamento['data_hora'] else None,
                "status": agendamento['status'],
                "observacao": agendamento['observacao'],
                "aceito_prestador": agendamento['aceito_prestador'],
                "motivo_recusa": agendamento['motivo_recusa'],
                "created_at": agendamento['created_at'].isoformat() if agendamento['created_at'] else None,
                "timestamp": agendamento['created_at'].isoformat() if agendamento['created_at'] else None
            })
        
        timeline = mensagens_formatadas + agendamentos_formatados
        timeline_ordenada = sorted(timeline, key=lambda x: x['timestamp'] if x['timestamp'] else '')

        return {
            "mensagens": mensagens_formatadas,
            "agendamentos": agendamentos_formatados,
            "timeline": timeline_ordenada
        }, 200

    def listar_chats_usuarios(self, id_usuario: int) -> Tuple[Dict[str, Any], int]:
        """Lista todos os chats de um usuário com informações dos participantes"""
        if not id_usuario:
            return {"error": "ID do usuário é obrigatório"}, 400
        
        chats = self.chat_dao.buscar_chats_por_usuario(id_usuario)

        chats_formatados = []
        for chat in chats:
            # Busca última mensagem do chat
            ultima_mensagem = self.chat_dao.buscar_ultima_mensagem_chat(chat[0])

            id_usuario_logado = chat[6] if chat[10] == "prestador" else chat[7]
            if id_usuario_logado == chat[6]:
                # Usuário logado é prestador, outro participante é cliente
                outro_nome = chat[8]
                outro_tipo = "cliente"
                meu_tipo = "prestador"
            else:
                # Usuário logado é cliente, outro participante é prestador
                outro_nome = chat[9]
                outro_tipo = "prestador"
                meu_tipo = "cliente"
            chats_formatados.append({
                "id_chat": chat[0],
                "id_solicitacao": chat[1],
                "data_criacao": chat[2].isoformat() if chat[2] else None,
                "ativo": chat[3],
                "encerrado": chat[4],
                "servico_descricao": chat[5],
                "prestador_id": chat[6],
                "cliente_id": chat[7],
                "mensagens_nao_lidas": chat[13] if len(chat) > 13 else 0,
                "outro_participante": {
                    "nome": outro_nome,
                    "tipo": outro_tipo
                },
                "meu_tipo": meu_tipo,
                "ultima_mensagem": {
                    "mensagem": ultima_mensagem[0] if ultima_mensagem else "Nenhuma mensagem",
                    "data_envio": ultima_mensagem[1].isoformat() if ultima_mensagem and ultima_mensagem[1] else None,
                    "id_remetente": ultima_mensagem[2] if ultima_mensagem else None
                } if ultima_mensagem else None
            })
        
        return {"chats": chats_formatados}, 200

    def contar_mensagens_nao_lidas(self, id_usuario: int) -> Tuple[Dict[str, Any], int]:
        """Conta total de mensagens não lidas de todos os chats do usuário"""
        if not id_usuario:
            return {"error": "ID do usuário é obrigatório"}, 400
        
        chats = self.chat_dao.buscar_chats_por_usuario(id_usuario)
        total_nao_lidas = sum(chat[13] for chat in chats if len(chat) > 13)
        
        return {"total_mensagens_nao_lidas": total_nao_lidas}, 200

    def buscar_detalhes_chat(self, id_chat: int) -> Tuple[Dict[str, Any], int]:
        """Busca detalhes específicos de um chat"""
        if not id_chat:
            return {"error": "ID do chat é obrigatório"}, 400
        
        # Busca informações básicas do chat
        chats = self.chat_dao.buscar_chats_por_usuario(None)
        # Para simplificar, vamos buscar pelas mensagens e inferir os participantes
        mensagens = self.chat_dao.buscar_mensagens_chat(id_chat)
        
        if not mensagens:
            return {"error": "Chat não encontrado"}, 404
        
        # Pega participantes da primeira mensagem (ou precisaríamos de um método específico no DAO)
        participantes = set(msg[2] for msg in mensagens)
        
        return {
            "id_chat": id_chat,
            "participantes": list(participantes),
            "total_mensagens": len(mensagens)
        }, 200

    def verificar_chat_existente(self, id_solicitacao: int) -> Tuple[Dict[str, Any], int]:
        """Verifica se já existe chat para uma solicitação"""
        if not id_solicitacao:
            return {"error": "ID da solicitação é obrigatório"}, 400
        
        id_chat = self.chat_dao.verificar_chat_existente(id_solicitacao)
        
        return {"existe_chat": id_chat is not None, "id_chat": id_chat}, 200
    
    def buscar_timeline_chat(self, id_chat: int, id_usuario: int = None) -> Tuple[Dict[str, Any], int]:
        """Busca timeline completa do chat (mensagens + agendamentos)"""
        if not id_chat:
            return {"error": "ID do chat é obrigatório"}, 400
        
        # Marca mensagens como lidas se o usuário for especificado
        if id_usuario:
            self.chat_dao.marcar_mensagens_como_lidas(id_chat, id_usuario)
        
        # Busca mensagens do chat
        mensagens = self.chat_dao.buscar_mensagens_chat(id_chat)
        
        # Busca agendamentos do chat
        agendamentos = self.agendamento_dao.listar_agendamentos_por_chat(id_chat)
        
        # Formata as mensagens
        mensagens_formatadas = []
        for msg in mensagens:
            mensagens_formatadas.append({
                "type": "message",
                "id": msg[0],  # id_mensagem
                "id_chat": msg[1],
                "id_remetente": msg[2],
                "conteudo": msg[3],
                "timestamp": msg[4].isoformat() if msg[4] else None,
                "lida": msg[5],
                "remetente_nome": msg[6],
                "data_envio": msg[4].isoformat() if msg[4] else None
            })
        
        # Formata os agendamentos
        agendamentos_formatados = []
        for agendamento in agendamentos:
            # Determina o texto do agendamento baseado no status
            status_text = self._get_agendamento_text(agendamento)
            
            agendamentos_formatados.append({
                "type": "agendamento",
                "id": agendamento['id_agendamento'],
                "id_chat": agendamento['id_chat'],
                "data_hora": agendamento['data_hora'].isoformat() if agendamento['data_hora'] else None,
                "status": agendamento['status'],
                "status_text": status_text,
                "observacao": agendamento['observacao'],
                "aceito_prestador": agendamento['aceito_prestador'],
                "motivo_recusa": agendamento['motivo_recusa'],
                "timestamp": agendamento['created_at'].isoformat() if agendamento['created_at'] else None,
                "pode_remarcar": self._pode_remarcar(agendamento),
                "pode_cancelar": self._pode_cancelar(agendamento)
            })
        
        # Combina e ordena a timeline
        timeline = mensagens_formatadas + agendamentos_formatados
        timeline_ordenada = sorted(timeline, key=lambda x: x['timestamp'] if x['timestamp'] else '')
        
        return {
            "timeline": timeline_ordenada,
            "total_mensagens": len(mensagens_formatadas),
            "total_agendamentos": len(agendamentos_formatados)
        }, 200

    def _get_agendamento_text(self, agendamento: Dict[str, Any]) -> str:
        """Gera texto descritivo para o agendamento"""
        data_hora = agendamento['data_hora'].strftime("%d/%m/%Y às %H:%M") if agendamento['data_hora'] else "Data não definida"
        status = agendamento['status']
        
        textos = {
            'pendente': f"📅 **Solicitação de agendamento**\nData: {data_hora}\nStatus: ⏳ Aguardando resposta do prestador",
            'confirmado': f"✅ **Agendamento confirmado**\nData: {data_hora}\nStatus: Confirmado",
            'recusado': f"❌ **Agendamento recusado**\nData: {data_hora}\nMotivo: {agendamento.get('motivo_recusa', 'Não informado')}",
            'cancelado': f"🚫 **Agendamento cancelado**\nData: {data_hora}",
            'realizado': f"🎉 **Serviço realizado**\nData: {data_hora}"
        }
        
        return textos.get(status, f"📅 Agendamento para {data_hora}")

    def _pode_remarcar(self, agendamento: Dict[str, Any], id_usuario: int = None) -> bool:
        """Verifica se o agendamento pode ser remarcado pelo usuário"""
        from datetime import datetime
        
        if agendamento['status'] not in ['confirmado', 'pendente']:
            return False
        
        if not agendamento['data_hora']:
            return False
            
        # Verifica regra das 2 horas (para ambos)
        tempo_restante = agendamento['data_hora'] - datetime.now()
        duas_horas = timedelta(hours=2)
        
        return tempo_restante > duas_horas

    def _pode_cancelar(self, agendamento: Dict[str, Any], id_usuario: int = None) -> bool:
        """Verifica se o agendamento pode ser cancelado pelo usuário"""
        from datetime import datetime
        
        if agendamento['status'] not in ['confirmado', 'pendente']:
            return False
        
        if not agendamento['data_hora']:
            return True
            
        # Verifica regra das 2 horas (para ambos)
        tempo_restante = agendamento['data_hora'] - datetime.now()
        duas_horas = timedelta(hours=2)
        
        return tempo_restante > duas_horas