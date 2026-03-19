from fastapi import APIRouter, HTTPException, Depends, Query, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional, List
import logging
import json
from service.agendamento_service import AgendamentoService
from websocket_manager import manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/agendamentos", tags=["agendamentos"])

# Pydantic Models
class AgendarServicoRequest(BaseModel):
    id_chat: int
    id_cliente: int
    id_prestador: int
    data_hora: str
    observacao: Optional[str] = None

class ResponderAgendamentoRequest(BaseModel):
    id_agendamento: int
    id_prestador: int
    aceito: bool
    motivo_recusa: Optional[str] = None

class RemarcarServicoRequest(BaseModel):
    id_agendamento: int
    id_usuario: int # Agora pode ser cliente OU prestador
    nova_data_hora: str
    motivo: Optional[str] = None

class CancelarAgendamentoRequest(BaseModel):
    id_agendamento: int
    id_usuario: int # Agora pode ser cliente OU prestador
    motivo: Optional[str] = None

class CriarIndisponibilidadeRequest(BaseModel):
    id_prestador: int
    data_inicio: str
    data_fim: str
    motivo: Optional[str] = None

# Dependency
def get_agendamento_service():
    return AgendamentoService()

# ========== WEBSOCKET ENDPOINTS ==========

@router.websocket("/ws/user/{user_id}")
async def websocket_user_notifications(websocket: WebSocket, user_id: int):
    """WebSocket para notificações específicas do usuário (agendamentos)"""
    try:
        logger.info(f"🔄 Conectando usuário {user_id} para notificações")
        
        await websocket.accept()
        logger.info(f"✅ WebSocket aceito para notificações do usuário {user_id}")

        # Conectar usuário para notificações
        await manager.connect_user(websocket, user_id)
        logger.info(f"✅ Usuário {user_id} conectado para notificações")
        
        # Envia mensagem de confirmação
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "message": f"Conectado para notificações - Usuário {user_id}",
            "user_id": user_id
        }))
        
        # Loop principal
        while True:
            try:
                # Aguarda mensagens (pode ser usado para confirmar recebimento)
                data = await websocket.receive_text()
                message_data = json.loads(data)
                logger.info(f"📨 Mensagem recebida do usuário {user_id}: {message_data}")
                
                # Aqui você pode processar confirmações do frontend
                if message_data.get("type") == "notification_ack":
                    logger.info(f"✅ Notificação confirmada pelo usuário {user_id}")
                    
            except WebSocketDisconnect:
                logger.info(f"❌ WebSocket de notificações desconectado - Usuário {user_id}")
                break
            except Exception as e:
                logger.error(f"❌ Erro no WebSocket de notificações: {e}")
                break
                
    except Exception as e:
        logger.error(f"❌ Erro na conexão WebSocket de notificações: {e}")
    finally:
        # Sempre desconecta ao sair
        manager.disconnect_user(websocket, user_id)
        logger.info(f"✅ Conexão de notificações finalizada para usuário {user_id}")

@router.websocket("/ws/chat/{room_id}")
async def websocket_chat_agendamentos(websocket: WebSocket, room_id: int):
    """
    WebSocket para chat em tempo real E notificações de agendamento
    room_id = id_chat
    """
    try:
        logger.info(f"🔄 Tentando conectar WebSocket para chat {room_id}")
        
        await websocket.accept()
        logger.info(f"✅ WebSocket aceito para chat {room_id}")

        # Conecta o WebSocket manager (CHAT)
        await manager.connect(websocket, room_id)
        logger.info(f"✅ WebSocket conectado com sucesso para chat {room_id}")
        
        # Envia mensagem de confirmação
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "message": f"Conectado ao chat {room_id}",
            "room_id": room_id
        }))
        
        # Loop principal para receber mensagens
        while True:
            try:
                data = await websocket.receive_text()
                message_data = json.loads(data)
                logger.info(f"📨 Mensagem recebida via WebSocket: {message_data}")
                
                # Aqui você pode processar mensagens específicas de agendamento
                if message_data.get("type") == "agendamento_action":
                    # Processar ações relacionadas a agendamento
                    logger.info(f"🔄 Ação de agendamento recebida: {message_data}")
                
            except WebSocketDisconnect:
                logger.info(f"❌ WebSocket desconectado do chat {room_id}")
                break
            except Exception as e:
                logger.error(f"❌ Erro no WebSocket: {e}")
                break
                
    except Exception as e:
        logger.error(f"❌ Erro na conexão WebSocket: {e}")
    finally:
        # Sempre desconecta ao sair
        manager.disconnect(websocket, room_id)
        logger.info(f"✅ Conexão WebSocket finalizada para chat {room_id}")

# ========== HTTP ENDPOINTS ==========

@router.post("/agendar", response_model=dict)
async def agendar_servico(
    request: AgendarServicoRequest,
    agendamento_service: AgendamentoService = Depends(get_agendamento_service)
):
    """Endpoint para agendar um serviço (aguardando resposta do prestador)"""
    try:
        logger.info(f"🔄 Controller: Agendando serviço para chat {request.id_chat}")
        
        result, status_code = await agendamento_service.agendar_servico(
            id_chat=request.id_chat,
            id_cliente=request.id_cliente,
            id_prestador=request.id_prestador,
            data_hora=request.data_hora,
            observacao=request.observacao
        )
        
        if status_code != 201:
            raise HTTPException(status_code=status_code, detail=result.get("error"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Controller: Erro ao agendar serviço: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.post("/responder", response_model=dict)
async def responder_agendamento(
    request: ResponderAgendamentoRequest,
    agendamento_service: AgendamentoService = Depends(get_agendamento_service)
):
    """Endpoint para prestador aceitar ou recusar um agendamento"""
    try:
        logger.info(f"🔄 Controller: Prestador respondendo agendamento {request.id_agendamento}")
        
        result, status_code = await agendamento_service.responder_agendamento(
            id_agendamento=request.id_agendamento,
            id_prestador=request.id_prestador,
            aceito=request.aceito,
            motivo_recusa=request.motivo_recusa
        )
        
        if status_code != 200:
            raise HTTPException(status_code=status_code, detail=result.get("error"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Controller: Erro ao responder agendamento: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.post("/indisponibilidade", response_model=dict)
async def criar_indisponibilidade(
    request: CriarIndisponibilidadeRequest,
    agendamento_service: AgendamentoService = Depends(get_agendamento_service)
):
    """Endpoint para prestador criar um bloco de indisponibilidade"""
    try:
        logger.info(f"🔄 Controller: Criando indisponibilidade para prestador {request.id_prestador}")
        
        result, status_code = await agendamento_service.criar_indisponibilidade(
            id_prestador=request.id_prestador,
            data_inicio=request.data_inicio,
            data_fim=request.data_fim,
            motivo=request.motivo
        )
        
        if status_code != 201:
            raise HTTPException(status_code=status_code, detail=result.get("error"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Controller: Erro ao criar indisponibilidade: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.delete("/indisponibilidade/{id_indisponibilidade}", response_model=dict)
async def remover_indisponibilidade(
    id_indisponibilidade: int,
    id_prestador: int = Query(..., description="ID do prestador"),
    agendamento_service: AgendamentoService = Depends(get_agendamento_service)
):
    """Endpoint para remover indisponibilidade"""
    try:
        logger.info(f"🔄 Controller: Removendo indisponibilidade {id_indisponibilidade}")
        
        result, status_code = agendamento_service.remover_indisponibilidade(
            id_indisponibilidade=id_indisponibilidade,
            id_prestador=id_prestador
        )
        
        if status_code != 200:
            raise HTTPException(status_code=status_code, detail=result.get("error"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Controller: Erro ao remover indisponibilidade: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.get("/prestador/{id_prestador}/indisponibilidades", response_model=dict)
async def listar_indisponibilidades(
    id_prestador: int,
    data: Optional[str] = Query(None, description="Filtrar por data específica (YYYY-MM-DD)"),
    agendamento_service: AgendamentoService = Depends(get_agendamento_service)
):
    """Endpoint para listar indisponibilidades do prestador"""
    try:
        logger.info(f"🔄 Controller: Listando indisponibilidades do prestador {id_prestador}")
        
        result, status_code = agendamento_service.listar_indisponibilidades_prestador(
            id_prestador=id_prestador,
            data=data
        )
        
        if status_code != 200:
            raise HTTPException(status_code=status_code, detail=result.get("error"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Controller: Erro ao listar indisponibilidades: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.get("/chat/{id_chat}", response_model=dict)
async def listar_agendamentos_chat(
    id_chat: int,
    agendamento_service: AgendamentoService = Depends(get_agendamento_service)
):
    """Endpoint para listar agendamentos de um chat específico"""
    try:
        logger.info(f"🔄 Controller: Buscando agendamentos do chat {id_chat}")
        
        result, status_code = agendamento_service.listar_agendamentos_chat(id_chat)
        
        if status_code != 200:
            raise HTTPException(status_code=status_code, detail=result.get("error"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Controller: Erro ao buscar agendamentos: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.get("/cliente/{id_cliente}", response_model=dict)
async def listar_agendamentos_cliente(
    id_cliente: int,
    status: Optional[str] = Query(None, description="Filtrar por status: pendente, confirmado, cancelado, recusado"),
    agendamento_service: AgendamentoService = Depends(get_agendamento_service)
):
    """Endpoint para listar todos os agendamentos de um cliente"""
    try:
        logger.info(f"🔄 Controller: Buscando agendamentos do cliente {id_cliente}")
        
        result, status_code = agendamento_service.listar_agendamentos_cliente(id_cliente, status)
        
        if status_code != 200:
            raise HTTPException(status_code=status_code, detail=result.get("error"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Controller: Erro ao buscar agendamentos do cliente: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.get("/prestador/{id_prestador}", response_model=dict)
async def listar_agendamentos_prestador(
    id_prestador: int,
    status: Optional[str] = Query(None, description="Filtrar por status: pendente, confirmado, cancelado, recusado, realizado"),
    agendamento_service: AgendamentoService = Depends(get_agendamento_service)
):
    """Endpoint para listar todos os agendamentos de um prestador"""
    try:
        logger.info(f"🔄 Controller: Buscando agendamentos do prestador {id_prestador}")
        
        result, status_code = agendamento_service.listar_agendamentos_prestador(id_prestador, status)
        
        if status_code != 200:
            raise HTTPException(status_code=status_code, detail=result.get("error"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Controller: Erro ao buscar agendamentos do prestador: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.get("/prestador/{id_prestador}/disponibilidade", response_model=dict)
async def verificar_disponibilidade(
    id_prestador: int,
    data: str,
    agendamento_service: AgendamentoService = Depends(get_agendamento_service)
):
    """Endpoint para verificar disponibilidade do prestador em uma data"""
    try:
        logger.info(f"🔄 Controller: Verificando disponibilidade do prestador {id_prestador} para {data}")
        
        result, status_code = agendamento_service.verificar_disponibilidade_prestador(
            id_prestador=id_prestador,
            data=data
        )
        
        if status_code != 200:
            raise HTTPException(status_code=status_code, detail=result.get("error"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Controller: Erro ao verificar disponibilidade: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.get("/{id_agendamento}", response_model=dict)
async def buscar_agendamento(
    id_agendamento: int,
    agendamento_service: AgendamentoService = Depends(get_agendamento_service)
):
    """Endpoint para buscar detalhes de um agendamento"""
    try:
        logger.info(f"🔄 Controller: Buscando agendamento {id_agendamento}")
        
        result, status_code = agendamento_service.buscar_agendamento(id_agendamento)
        
        if status_code != 200:
            raise HTTPException(status_code=status_code, detail=result.get("error"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Controller: Erro ao buscar agendamento: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.get("/{id_agendamento}/historico", response_model=dict)
async def buscar_historico_agendamento(
    id_agendamento: int,
    agendamento_service: AgendamentoService = Depends(get_agendamento_service)
):
    """Endpoint para buscar histórico de um agendamento"""
    try:
        logger.info(f"🔄 Controller: Buscando histórico do agendamento {id_agendamento}")
        
        result, status_code = agendamento_service.buscar_historico_agendamento(id_agendamento)
        
        if status_code != 200:
            raise HTTPException(status_code=status_code, detail=result.get("error"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Controller: Erro ao buscar histórico: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.post("/remarcar", response_model=dict)
async def remarcar_servico(
    request: RemarcarServicoRequest,
    agendamento_service: AgendamentoService = Depends(get_agendamento_service)
):
    """Endpoint para remarcar um serviço (até 2 horas antes)"""
    try:
        logger.info(f"🔄 Controller: Remarcando agendamento {request.id_agendamento}")
        
        result, status_code = await agendamento_service.remarcar_servico(
            id_agendamento=request.id_agendamento,
            id_usuario=request.id_usuario,
            nova_data_hora=request.nova_data_hora,
            motivo=request.motivo
        )
        
        if status_code != 200:
            raise HTTPException(status_code=status_code, detail=result.get("error"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Controller: Erro ao remarcar serviço: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.post("/cancelar", response_model=dict)
async def cancelar_agendamento(
    request: CancelarAgendamentoRequest,
    agendamento_service: AgendamentoService = Depends(get_agendamento_service)
):
    """Endpoint para cancelar um agendamento"""
    try:
        logger.info(f"🔄 Controller: Cancelando agendamento {request.id_agendamento}")
        
        result, status_code = await agendamento_service.cancelar_agendamento(
            id_agendamento=request.id_agendamento,
            id_usuario=request.id_usuario,
            motivo=request.motivo
        )
        
        if status_code != 200:
            raise HTTPException(status_code=status_code, detail=result.get("error"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Controller: Erro ao cancelar agendamento: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")