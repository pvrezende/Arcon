from fastapi import APIRouter, HTTPException, Form, Request
from fastapi.responses import JSONResponse
from service.prestador_service import PrestadorService
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/prestadores", tags=["prestadores"])
router_compat = APIRouter(tags=["prestadores-compat"])

@router.get("/")
async def get_all_prestadores():
    """Retorna todos os prestadores cadastrados"""
    try:
        result = await PrestadorService.obter_todos_prestadores()
        
        if result["success"]:
            return result["prestadores"]
        raise HTTPException(status_code=500, detail=result.get("error", "Erro ao buscar prestadores"))
    except Exception as e:
        logger.error(f"Erro no controller ao buscar prestadores: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router_compat.post("/add2")
async def add_proposta_decisao(
    request: Request,
    id_registro: str = Form(...),
    proposta: str = Form(...),
    decisao: str = Form(...),
    prestador_id: str = Form(None)
):
    """Middleware para adicionar proposta - chama service"""
    try:
        result = await PrestadorService.adicionar_proposta(
            id_registro=id_registro,
            proposta=proposta,
            decisao=decisao,
            prestador_id=prestador_id
        )
        
        if result["success"]:
            return result
        else:
            return JSONResponse(
                status_code=result.get("status_code", 500),
                content={"erro": result.get("error", "Erro ao processar proposta")}
            )
    except Exception as e:
        logger.error(f"Erro no controller add2: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"erro": f"Erro interno: {str(e)}"}
        )

@router_compat.get("/check-prestador/{prestador_id}")
async def check_prestador_compat(prestador_id: str):
    """Verifica se um prestador está cadastrado - rota compatível com frontend"""
    try:
        result = await PrestadorService.verificar_prestador(prestador_id)
        
        if result["success"]:
            return {
                "cadastrado": result["cadastrado"],
                "data": result.get("prestador")
            }
        raise HTTPException(status_code=500, detail=result.get("error", "Erro ao verificar prestador"))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no controller ao verificar prestador {prestador_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router_compat.get("/servicos-para-prestador/{prestador_id}")
async def get_servicos_para_prestador_compat(prestador_id: str):
    """Retorna serviços DISPONÍVEIS para o prestador aceitar (exclusivos + gerais)"""
    try:
        return PrestadorService.servicos_para_prestador(prestador_id)
    except Exception as e:
        logger.error(f"Erro no controller ao buscar serviços para prestador {prestador_id}: {str(e)}")
        return []

@router_compat.post("/recusar-servico-prestador")
async def recusar_servico_prestador(
    id_registro: int = Form(...),
    prestador_id: str = Form(...)
):
    """Rota para prestador recusar um serviço"""
    try:
        result = await PrestadorService.recusar_servico(id_registro, prestador_id)
        
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result.get("message", "Erro ao recusar serviço"))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no controller ao recusar serviço: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao recusar serviço: {str(e)}")
        logger.error(f"Erro no controller ao buscar serviços do prestador {prestador_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
