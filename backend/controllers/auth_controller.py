from fastapi import APIRouter, Form, HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from service.auth_service import AuthService
import logging

# Configuração do logger
logger = logging.getLogger(__name__)

# Security scheme para JWT
security = HTTPBearer()

# Router principal
router = APIRouter(prefix="/api/auth", tags=["auth"])

# Router para compatibilidade com frontend (sem prefix)
router_compat = APIRouter(tags=["auth-compat"])

# Rotas do router principal
@router.post("/cadastro")
async def cadastrar_usuario(
    request: Request,
    nome: str = Form(...),
    email: str = Form(...),
    senha: str = Form(...),
    tipo_usuario: str = Form(...),
    telefone: str = Form(default=None),
    # Endereço - obrigatório
    cep: str = Form(...),
    endereco: str = Form(...),
    numero: str = Form(...),
    bairro: str = Form(...),
    cidade: str = Form(...),
    estado: str = Form(...),
    complemento: str = Form(default=None),
    # Campos específicos por tipo
    cpf: str = Form(default=None),
    cnpj: str = Form(default=None),
    razao_social: str = Form(default=None),
    nome_fantasia: str = Form(default=None),
    tipo_prestador: str = Form(default=None),
    area_atuacao: str = Form(default=None)
):
    """Middleware para cadastro completo de usuário - chama service"""
    try:
        logger.info(f"Requisição de cadastro recebida para email: {email}")
        return AuthService.cadastrar_usuario(
            nome, email, senha, tipo_usuario, telefone,
            cep, endereco, numero, bairro, cidade, estado, complemento,
            cpf, cnpj, razao_social, nome_fantasia, tipo_prestador, area_atuacao
        )
    except Exception as e:
        logger.error(f"Erro no controller ao cadastrar usuário: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@router.post("/login")
async def fazer_login(
    request: Request,
    email: str = Form(...),
    senha: str = Form(...)
):
    """Middleware para login - chama service"""
    try:
        logger.info(f"Requisição de login recebida para email: {email}")
        resultado = AuthService.fazer_login(email, senha)
        
        if not resultado["success"]:
            raise HTTPException(status_code=401, detail=resultado["error"])
        
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no controller ao fazer login: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@router.get("/me")
async def obter_usuario_atual(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Obtém dados do usuário autenticado pelo token"""
    try:
        token = credentials.credentials
        resultado_token = AuthService.verificar_token(token)
        
        if not resultado_token["success"]:
            raise HTTPException(status_code=401, detail=resultado_token["error"])
        
        user_data = resultado_token["user"]
        resultado_usuario = AuthService.buscar_usuario_por_id(user_data["user_id"])
        
        if not resultado_usuario["success"]:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        return resultado_usuario
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no controller ao obter usuário atual: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


# Rotas de compatibilidade (sem prefix para frontend)
@router_compat.post("/cadastro")
async def cadastrar_usuario_compat(
    request: Request,
    nome: str = Form(...),
    email: str = Form(...),
    senha: str = Form(...),
    tipo_usuario: str = Form(...),
    telefone: str = Form(default=None),
    # Endereço - obrigatório
    cep: str = Form(...),
    endereco: str = Form(...),
    numero: str = Form(...),
    bairro: str = Form(...),
    cidade: str = Form(...),
    estado: str = Form(...),
    complemento: str = Form(default=None),
    # Campos específicos por tipo
    cpf: str = Form(default=None),
    cnpj: str = Form(default=None),
    razao_social: str = Form(default=None),
    nome_fantasia: str = Form(default=None),
    tipo_prestador: str = Form(default=None),
    area_atuacao: str = Form(default=None)
):
    """Middleware para cadastro completo (compatibilidade) - chama service"""
    try:
        logger.info(f"Requisição de cadastro compat recebida para email: {email}")
        return AuthService.cadastrar_usuario(
            nome, email, senha, tipo_usuario, telefone,
            cep, endereco, numero, bairro, cidade, estado, complemento,
            cpf, cnpj, razao_social, nome_fantasia, tipo_prestador, area_atuacao
        )
    except Exception as e:
        logger.error(f"Erro no controller compat ao cadastrar usuário: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@router_compat.post("/login")
async def fazer_login_compat(
    request: Request,
    email: str = Form(...),
    senha: str = Form(...)
):
    """Middleware para login (compatibilidade) - chama service"""
    try:
        logger.info(f"Requisição de login compat recebida para email: {email}")
        resultado = AuthService.fazer_login(email, senha)
        
        if not resultado["success"]:
            raise HTTPException(status_code=401, detail=resultado["error"])
        
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no controller compat ao fazer login: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@router_compat.get("/me")
async def obter_usuario_atual_compat(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Obtém dados do usuário autenticado (compatibilidade)"""
    try:
        token = credentials.credentials
        resultado_token = AuthService.verificar_token(token)
        
        if not resultado_token["success"]:
            raise HTTPException(status_code=401, detail=resultado_token["error"])
        
        user_data = resultado_token["user"]
        resultado_usuario = AuthService.buscar_usuario_por_id(user_data["user_id"])
        
        if not resultado_usuario["success"]:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        return resultado_usuario
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no controller compat ao obter usuário atual: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")