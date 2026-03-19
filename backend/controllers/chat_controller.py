from fastapi import WebSocket, WebSocketDisconnect
from websocket_manager import manager
import json
import logging

logger = logging.getLogger(__name__)

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from service.chat_service import ChatService
from fastapi import Query

router = APIRouter(prefix="/api/chats", tags=["chats"])

# Pydantic Models
class IniciarChatRequest(BaseModel):
    id_solicitacao: int

class EnviarMensagemRequest(BaseModel):
    id_chat: int
    id_remetente: int
    mensagem: str

class BuscarMensagensQuery(BaseModel):
    id_usuario: Optional[int] = None

class ResponseModel(BaseModel):
    message: Optional[str] = None
    error: Optional[str] = None
    data: Optional[dict] = None

# Dependency
def get_chat_service():
    return ChatService()

@router.post("/iniciar", response_model=dict)
async def iniciar_chat(
    request: IniciarChatRequest,
    chat_service: ChatService = Depends(get_chat_service)
):
    """Endpoint para iniciar um novo chat"""
    try:
        if not request.id_solicitacao:
            raise HTTPException(status_code=400, detail="ID da solicitação é obrigatório")
        
        result, status_code = chat_service.iniciar_chat(request.id_solicitacao)
        
        if status_code != 201:
            raise HTTPException(status_code=status_code, detail=result.get("error"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro no controller ao iniciar chat: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.post("/mensagem", response_model=dict)
async def enviar_mensagem(
    request: EnviarMensagemRequest,
    chat_service: ChatService = Depends(get_chat_service)
):
    """Endpoint para enviar mensagem"""
    try:
        logger.info(f"🔄 Controller: Enviando mensagem para chat {request.id_chat}")

        if not all([request.id_chat, request.id_remetente, request.mensagem]):
            raise HTTPException(
                status_code=400, 
                detail="ID do chat, ID do remetente e mensagem são obrigatórios"
            )
        
        result, status_code = await chat_service.enviar_mensagem(
            request.id_chat, 
            request.id_remetente, 
            request.mensagem
        )

        logger.info(f"✅ Controller: Mensagem processada. Status: {status_code}")
        
        if status_code != 201:
            raise HTTPException(status_code=status_code, detail=result.get("error"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Controller: Erro ao enviar mensagem: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@router.get("/{id_chat}/mensagens", response_model=dict)
async def buscar_mensagens(
    id_chat: int,
    id_usuario: Optional[int] = None,
    chat_service: ChatService = Depends(get_chat_service)
):
    """Endpoint para buscar mensagens de um chat"""
    try:
        if not id_chat:
            raise HTTPException(status_code=400, detail="ID do chat é obrigatório")
        
        result, status_code = chat_service.buscar_mensagens_chat(id_chat, id_usuario)
        
        if status_code != 200:
            raise HTTPException(status_code=status_code, detail=result.get("error"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro no controller ao buscar mensagens: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.get("/usuario/{id_usuario}", response_model=dict)
async def listar_chats(
    id_usuario: int,
    chat_service: ChatService = Depends(get_chat_service)
):
    """Endpoint para listar chats de um usuário"""
    try:
        logger.info(f"🔄 Buscando chats para usuário: {id_usuario}")
        
        if not id_usuario:
            raise HTTPException(status_code=400, detail="ID do usuário é obrigatório")
        
        result, status_code = chat_service.listar_chats_usuarios(id_usuario)
        
        logger.info(f"✅ Chats encontrados: {len(result.get('chats', [])) if result else 0}")
        
        if status_code != 200:
            raise HTTPException(status_code=status_code, detail=result.get("error"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro no controller ao listar chats: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@router.get("/usuario/{id_usuario}/nao-lidas", response_model=dict)
async def contar_nao_lidas(
    id_usuario: int,
    chat_service: ChatService = Depends(get_chat_service)
):
    """Endpoint para contar mensagens não lidas"""
    try:
        if not id_usuario:
            raise HTTPException(status_code=400, detail="ID do usuário é obrigatório")
        
        result, status_code = chat_service.contar_mensagens_nao_lidas(id_usuario)
        
        if status_code != 200:
            raise HTTPException(status_code=status_code, detail=result.get("error"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro no controller ao contar mensagens não lidas: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.get("/verificar/{id_solicitacao}", response_model=dict)
async def verificar_chat(
    id_solicitacao: int,
    chat_service: ChatService = Depends(get_chat_service)
):
    """Endpoint para verificar se existe chat para uma solicitação"""
    try:
        if not id_solicitacao:
            raise HTTPException(status_code=400, detail="ID da solicitação é obrigatório")
        
        result, status_code = chat_service.verificar_chat_existente(id_solicitacao)
        
        if status_code != 200:
            raise HTTPException(status_code=status_code, detail=result.get("error"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro no controller ao verificar chat: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.get("/{id_chat}/detalhes", response_model=dict)
async def detalhes_chat(
    id_chat: int,
    chat_service: ChatService = Depends(get_chat_service)
):
    """Endpoint para detalhes de um chat específico"""
    try:
        if not id_chat:
            raise HTTPException(status_code=400, detail="ID do chat é obrigatório")
        
        result, status_code = chat_service.buscar_detalhes_chat(id_chat)
        
        if status_code != 200:
            raise HTTPException(status_code=status_code, detail=result.get("error"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro no controller ao buscar detalhes do chat: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.get("/{id_chat}/timeline", response_model=dict)
async def buscar_timeline_chat(
    id_chat: int,
    id_usuario: Optional[int] = Query(None, description="ID do usuário para marcar mensagens como lidas"),
    chat_service: ChatService = Depends(get_chat_service)
):
    """Endpoint para buscar timeline completa do chat (mensagens + agendamentos)"""
    try:
        logger.info(f"🔄 Buscando timeline do chat {id_chat}")
        
        if not id_chat:
            raise HTTPException(status_code=400, detail="ID do chat é obrigatório")
        
        result, status_code = chat_service.buscar_timeline_chat(id_chat, id_usuario)
        
        if status_code != 200:
            raise HTTPException(status_code=status_code, detail=result.get("error"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao buscar timeline do chat: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.websocket("/ws/chat/{room_id}")
async def websocket_chat(websocket: WebSocket, room_id: int):
        """
        WebSocket para chat em tempo real
        room_id = id_chat
        """
        try:
            logger.info(f"🔄 Tentando conectar WebSocket para chat {room_id}")
            
            # PRIMEIRO: Aceita a conexão WebSocket
            await websocket.accept()
            logger.info(f"✅ WebSocket aceito para chat {room_id}")

            # Conecta o WebSocket manager
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
                    # Aguarda mensagens do cliente
                    data = await websocket.receive_text()
                    message_data = json.loads(data)
                    logger.info(f"📨 Mensagem recebida via WebSocket: {message_data}")
                    
                    # Aqui você pode processar mensagens enviadas via WebSocket se quiser
                    # Por enquanto só vamos usar para receber notificações
                    
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