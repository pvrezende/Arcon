from fastapi import APIRouter, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from service.proposta_service import PropostaService
from service.prestador_listar_service import PrestadorListarService
from DAO.proposta_dao import PropostaDAO
from DAO.prestador_listar_dao import PrestadorDAO
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Dependências - SISTEMA UNIFICADO
def get_proposta_dao():
    return PropostaDAO()

def get_prestador_dao():
    return PrestadorDAO()

def get_proposta_service(dao: PropostaDAO = Depends(get_proposta_dao)):
    return PropostaService(dao)

def get_prestador_service(prestador_dao: PrestadorDAO = Depends(get_prestador_dao)):
    return PrestadorListarService(prestador_dao)

# Router (mantém compatibilidade com prefix /propostas)
router = APIRouter(prefix="/propostas", tags=["propostas"])

@router.get("/prestadores-disponiveis")
async def listar_prestadores_disponiveis(
    prestador_service: PrestadorListarService = Depends(get_prestador_service)
):
    """
    Lista todos os prestadores ativos para o cliente escolher
    """
    try:
        logger.info("Buscando prestadores disponíveis para seleção")
        
        result = prestador_service.obter_prestadores_disponiveis()
        
        if result["success"]:
            return result["data"]
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Erro ao buscar prestadores"))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar prestadores disponíveis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar prestadores: {str(e)}")

@router.post("/add")
async def criar_proposta(
    cliente: str = Form(...),
    btu: str = Form(...),
    tag: str = Form(...),
    servico: str = Form(...),
    marca: str = Form(...),
    confirmar: str = Form(...),
    user_id: str = Form(...),
    prestador_id: Optional[str] = Form(None),
    service: PropostaService = Depends(get_proposta_service)
):
    """
    Cria nova solicitação (COMPATIBILIDADE - usa novo sistema)
    """
    try:
        logger.info(f"Criando solicitação para usuário: {user_id}")
        
        dados = {
            "id_usuario": user_id,
            "tag": tag,
            "servico": servico,
            "marca": marca,
            "btu": btu,
            "confirmar_solicitacao": confirmar,
            "prestador_especifico": prestador_id  # Novo campo
        }
        
        resultado = service.criar_solicitacao(dados)
        
        if resultado["success"]:
            # Compatibilidade com resposta antiga
            data = resultado["data"]
            
            # Determinar tipo de envio baseado no prestador_id
            if prestador_id:
                data["tipo_envio"] = "especifico"
                data["visivel_para"] = f"Prestador ID {prestador_id}"
                data["prestador_especifico"] = prestador_id
            else:
                data["tipo_envio"] = "broadcast"
                data["visivel_para"] = "Todos os prestadores"
                data["prestador_especifico"] = None
            
            return JSONResponse(content={
                "message": "Serviço adicionado com sucesso!",
                "data": data
            })
        else:
            raise HTTPException(status_code=400, detail=resultado.get("error", "Erro ao criar solicitação"))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao criar solicitação: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao criar solicitação: {str(e)}")

@router.post("/add2")
async def enviar_proposta_prestador(
    id_solicitacao: str = Form(...),
    id_prestador: str = Form(...),
    valor: str = Form(...),
    descricao: str = Form(""),
    service: PropostaService = Depends(get_proposta_service)
):
    """
    Prestador envia proposta (COMPATIBILIDADE - usa novo sistema)
    """
    try:
        logger.info(f"Prestador {id_prestador} enviando proposta para solicitação: {id_solicitacao}")
        
        # Conversão segura
        try:
            solicitacao_id_int = int(id_solicitacao)
            prestador_id_int = int(id_prestador)
            valor_float = float(valor) if valor else 0.0
        except (ValueError, TypeError):
            return JSONResponse(
                status_code=422,
                content={"erro": "Parâmetros devem ser números válidos"}
            )
        
        if valor_float < 0:
            return JSONResponse(
                status_code=422,
                content={"erro": "Valor não pode ser negativo"}
            )

        dados = {
            "solicitacao_id": solicitacao_id_int,
            "prestador_id": prestador_id_int,
            "valor": valor_float,
            "mensagem": descricao
        }

        resultado = service.enviar_proposta(dados)
        
        if resultado["success"]:
            return JSONResponse(content={
                "success": True,
                "msg": "✅ Proposta enviada com sucesso!",
                "registro_atualizado": resultado["data"],
                "dados_recebidos": {
                    "id_solicitacao": id_solicitacao,
                    "id_prestador": id_prestador,
                    "valor": valor,
                    "descricao": descricao
                }
            })
        else:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "msg": resultado.get("error", "Erro ao enviar proposta"),
                    "id_procurado": solicitacao_id_int
                }
            )
            
    except Exception as e:
        logger.error(f"Erro ao enviar proposta: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"erro": f"Erro interno: {str(e)}"}
        )

# Endpoint /add3 REMOVIDO - use as novas rotas /solicitacoes/propostas/{id}/aceitar

@router.get("/{user_id}")
async def obter_propostas_usuario(
    user_id: str,
    service: PropostaService = Depends(get_proposta_service)
):
    """
    Cliente lista propostas recebidas (COMPATIBILIDADE - usa novo sistema)
    """
    try:
        logger.info(f"Buscando propostas para cliente: {user_id}")
        
        try:
            cliente_id = int(user_id)
        except (ValueError, TypeError):
            raise HTTPException(status_code=422, detail="ID do usuário deve ser um número válido")
        
        resultado = service.listar_propostas_cliente(cliente_id)
        
        if resultado["success"]:
            # Formato compatível com resposta antiga
            propostas_formatadas = []
            for proposta in resultado["data"]:
                proposta_formatada = {
                    "id_proposta": proposta["id_proposta"],
                    "solicitacao_id": proposta["solicitacao_id"],
                    "prestador_id": proposta["prestador_id"],
                    "prestador_nome": proposta.get("prestador_nome", "Prestador não encontrado"),
                    "cliente_nome": proposta.get("cliente_nome", "Cliente não encontrado"),
                    "valor": proposta["valor"],
                    "descricao": proposta.get("mensagem", ""),  # Compatibilidade
                    "mensagem": proposta.get("mensagem", ""),
                    "servico": proposta.get("servico", ""),
                    "tag": proposta.get("tag", ""),
                    "marca": proposta.get("marca", ""),
                    "data_envio": proposta["data_envio"],
                    "status_proposta": proposta["status_proposta"]
                }
                propostas_formatadas.append(proposta_formatada)
            
            return propostas_formatadas
        else:
            raise HTTPException(status_code=500, detail=resultado.get("error", "Erro ao buscar propostas"))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar propostas: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar propostas: {str(e)}")

@router.get("/servicos-disponiveis/{prestador_id}")
async def obter_servicos_disponiveis(
    prestador_id: str,
    service: PropostaService = Depends(get_proposta_service)
):
    """
    Prestador lista solicitações abertas (COMPATIBILIDADE - usa novo sistema)
    """
    try:
        logger.info(f"Buscando serviços disponíveis para prestador: {prestador_id}")
        
        try:
            prestador_id_int = int(prestador_id)
        except (ValueError, TypeError):
            raise HTTPException(status_code=422, detail="ID do prestador deve ser um número válido")
        
        resultado = service.listar_solicitacoes_para_prestador(prestador_id_int)
        
        if resultado["success"]:
            # Formato compatível com resposta antiga
            servicos_formatados = []
            for solicitacao in resultado["data"]:
                servico_formatado = {
                    "id_solicitacao": solicitacao["id_solicitacao"],
                    "data_criacao": solicitacao["data_criacao"],
                    "id_usuario": solicitacao["id_usuario"],
                    "tag": solicitacao["tag"],
                    "servico": solicitacao["servico"],
                    "marca": solicitacao.get("marca", ""),
                    "btu": solicitacao.get("btu", ""),
                    "status": solicitacao["status"],
                    "id_prestador": solicitacao.get("id_prestador"),
                    "cliente_nome": solicitacao["cliente_nome"],
                    "ja_enviou_proposta": solicitacao.get("ja_enviou_proposta", False),
                    "total_propostas": solicitacao.get("total_propostas", 0)
                }
                servicos_formatados.append(servico_formatado)
            
            return servicos_formatados
        else:
            raise HTTPException(status_code=500, detail=resultado.get("error", "Erro ao buscar serviços disponíveis"))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar serviços disponíveis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar serviços disponíveis: {str(e)}")

# ========== ROTAS EXTRAS (funcionalidades avançadas) ==========

@router.get("/cliente/{cliente_id}/dashboard")
async def dashboard_cliente(
    cliente_id: int,
    service: PropostaService = Depends(get_proposta_service)
):
    """
    Dashboard completo do cliente com suas solicitações e estatísticas
    """
    try:
        logger.info(f"Carregando dashboard do cliente: {cliente_id}")
        
        resultado = service.listar_propostas_cliente(cliente_id)
        
        if resultado["success"]:
            return {
                "propostas": resultado["data"],
                "total": len(resultado["data"]) if isinstance(resultado["data"], list) else 0
            }
        else:
            raise HTTPException(status_code=500, detail=resultado.get("error", "Erro ao carregar dashboard"))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao carregar dashboard: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao carregar dashboard: {str(e)}")


@router.post("/{proposta_id}/aceitar")
async def aceitar_proposta(
    proposta_id: int,
    cliente_id: int = Form(...),
    service: PropostaService = Depends(get_proposta_service)
):
    """
    Cliente aceita uma proposta específica (fecha solicitação automaticamente)
    """
    try:
        logger.info(f"🔍 CONTROLLER DEBUG: Cliente {cliente_id} ({type(cliente_id)}) aceitando proposta {proposta_id} ({type(proposta_id)})")
        
        # Log adicional antes da chamada do service
        logger.info(f"🔍 Chamando service.aceitar_proposta({proposta_id}, {cliente_id})")
        
        resultado = service.aceitar_proposta(proposta_id, cliente_id)
        
        logger.info(f"🔍 Service retornou: {resultado}")
        
        if resultado["success"]:
            return JSONResponse(content={
                "message": resultado["message"],
                "data": resultado["data"]
            })
        else:
            raise HTTPException(status_code=400, detail=resultado.get("error", "Erro ao aceitar proposta"))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ CONTROLLER EXCEPTION: {str(e)}")
        logger.error(f"❌ Exception type: {type(e)}")
        import traceback
        logger.error(f"❌ Stack trace: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Erro ao aceitar proposta: {str(e)}")


@router.post("/{proposta_id}/rejeitar")
async def rejeitar_proposta(
    proposta_id: int,
    cliente_id: int = Form(...),
    service: PropostaService = Depends(get_proposta_service)
):
    """
    Cliente rejeita uma proposta específica
    """
    try:
        logger.info(f"Cliente {cliente_id} rejeitando proposta {proposta_id}")
        
        resultado = service.rejeitar_proposta(proposta_id, cliente_id)
        
        if resultado["success"]:
            return JSONResponse(content={
                "message": resultado["message"],
                "data": resultado["data"]
            })
        else:
            raise HTTPException(status_code=400, detail=resultado.get("error", "Erro ao rejeitar proposta"))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao rejeitar proposta: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao rejeitar proposta: {str(e)}")


@router.get("/solicitacao/{solicitacao_id}/estatisticas")
async def obter_estatisticas_solicitacao(
    solicitacao_id: int,
    cliente_id: int = Form(...),
    service: PropostaService = Depends(get_proposta_service)
):
    """
    Obter estatísticas detalhadas de uma solicitação (min/max/média valores)
    """
    try:
        logger.info(f"Obtendo estatísticas da solicitação {solicitacao_id}")
        
        resultado = service.obter_estatisticas_solicitacao(solicitacao_id, cliente_id)
        
        if resultado["success"]:
            return resultado["data"]
        else:
            raise HTTPException(status_code=500, detail=resultado.get("error", "Erro ao obter estatísticas"))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao obter estatísticas: {str(e)}")


@router.get("/cliente/{cliente_id}/propostas-detalhadas")
async def listar_propostas_detalhadas(
    cliente_id: int,
    solicitacao_id: Optional[int] = None,
    service: PropostaService = Depends(get_proposta_service)
):
    """
    Cliente lista propostas com informações detalhadas e agrupamento
    """
    try:
        logger.info(f"Listando propostas detalhadas para cliente {cliente_id}")
        
        resultado = service.listar_propostas_cliente(cliente_id, solicitacao_id)
        
        if resultado["success"]:
            return resultado
        else:
            raise HTTPException(status_code=500, detail=resultado.get("error", "Erro ao listar propostas"))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao listar propostas detalhadas: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao listar propostas detalhadas: {str(e)}")

@router.post("/recusar-servico")
async def recusar_servico(
    id_registro: int = Form(...),
    prestador_id: str = Form(...),
    service: PropostaService = Depends(get_proposta_service)
):
    """Prestador recusa uma solicitação de serviço"""
    try:
        logger.info(f"Prestador {prestador_id} recusando solicitação {id_registro}")
        
        resultado = service.recusar_solicitacao(id_registro, int(prestador_id))
        
        if resultado["success"]:
            return resultado
        else:
            raise HTTPException(status_code=400, detail=resultado.get("error", "Erro ao recusar serviço"))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao recusar serviço: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao recusar serviço: {str(e)}")
