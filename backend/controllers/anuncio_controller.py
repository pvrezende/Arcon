from fastapi import APIRouter, Form, HTTPException, Request
from service.anuncio_service import AnuncioService
import logging

# Configuração do logger
logger = logging.getLogger(__name__)

# Router principal
router = APIRouter(prefix="/api/anuncios", tags=["anuncios"])

# Router para compatibilidade com frontend (sem prefix)
router_compat = APIRouter(tags=["anuncios-compat"])

# Rotas do router principal
@router.post("/anunciar")
async def anunciar_produto(
    request: Request,
    nome: str = Form(...),
    marca: str = Form(...),
    endereco: str = Form(...),
    valor1: str = Form(default="0"),
    valor2: str = Form(...),
    btu: str = Form(...),
    especificacao: str = Form(...),
    tipo: str = Form(...),
    prestador_id: str = Form(...)
):
    """Middleware para criar anúncio - chama service"""
    try:
        return AnuncioService.criar_anuncio(nome, marca, endereco, valor1, valor2, btu, especificacao, tipo, prestador_id)
    except Exception as e:
        logger.error(f"Erro no controller ao criar anúncio: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@router.get("/meus-anuncios/{prestador_id}")
async def obter_meus_anuncios(prestador_id: str):
    """Middleware para buscar anúncios do prestador - chama service"""
    try:
        return AnuncioService.obter_meus_anuncios(prestador_id)
    except Exception as e:
        logger.error(f"Erro no controller ao buscar anúncios do prestador {prestador_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@router.get("/")
async def obter_produtos():
    """Middleware para buscar todos os produtos - chama service"""
    try:
        return AnuncioService.obter_todos_anuncios()
    except Exception as e:
        logger.error(f"Erro no controller ao buscar todos anúncios: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


# Rotas de compatibilidade (sem prefix para frontend)
@router_compat.post("/anunciar")
async def anunciar_produto_compat(
    request: Request,
    nome: str = Form(...),
    marca: str = Form(...),
    endereco: str = Form(...),
    valor1: str = Form(default="0"),
    valor2: str = Form(...),
    btu: str = Form(...),
    especificacao: str = Form(...),
    tipo: str = Form(...),
    prestador_id: str = Form(...)
):
    """Middleware para criar anúncio (compatibilidade) - chama service"""
    try:
        return AnuncioService.criar_anuncio(nome, marca, endereco, valor1, valor2, btu, especificacao, tipo, prestador_id)
    except Exception as e:
        logger.error(f"Erro no controller compat ao criar anúncio: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@router_compat.get("/meus-anuncios/{prestador_id}")
async def obter_meus_anuncios_compat(prestador_id: str):
    """Middleware para buscar anúncios do prestador (compatibilidade) - chama service"""
    try:
        return AnuncioService.obter_meus_anuncios(prestador_id)
    except Exception as e:
        logger.error(f"Erro no controller compat ao buscar anúncios do prestador {prestador_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@router_compat.get("/produtos")
async def obter_produtos_compat():
    """Middleware para buscar todos os produtos (compatibilidade) - chama service"""
    try:
        return AnuncioService.obter_todos_anuncios()
    except Exception as e:
        logger.error(f"Erro no controller compat ao buscar todos anúncios: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
