from fastapi import APIRouter, HTTPException, status, Form, Header
from fastapi.responses import JSONResponse
from typing import Optional
from pydantic import BaseModel
from service import LoginService

# Models Pydantic para documentação
class LoginRequest(BaseModel):
    email: str
    senha: str

class TokenResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

# Router FastAPI
router = APIRouter(prefix="/login", tags=["Authentication"])
login_service = LoginService()

@router.post("/", response_model=TokenResponse)
async def login(
    email: str = Form(..., description="Email do usuário"),
    senha: str = Form(..., description="Senha do usuário")
):
    """
    Rota de login que recebe email e senha via form-data
    """
    try:
        print(f"📥 Tentativa de login: {email}")
        
        # Autenticar usuário
        resultado = await login_service.autenticar(email, senha)
        
        if resultado['success']:
            print(f"✅ Login bem-sucedido para: {email}")
            return JSONResponse(
                content=resultado,
                status_code=status.HTTP_200_OK
            )
        else:
            print(f"❌ Falha no login para: {email} - {resultado['message']}")
            return JSONResponse(
                content=resultado,
                status_code=status.HTTP_401_UNAUTHORIZED
            )
            
    except Exception as e:
        print(f"❌ Erro no controller de login: {e}")
        return JSONResponse(
            content={
                'success': False,
                'message': 'Erro interno do servidor'
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@router.post("/validar-token", response_model=TokenResponse)
async def validar_token(authorization: Optional[str] = Header(None)):
    """
    Rota para validar token JWT
    """
    try:
        if not authorization:
            return JSONResponse(
                content={
                    'success': False,
                    'message': 'Token não fornecido'
                },
                status_code=status.HTTP_401_UNAUTHORIZED
            )
        
        # Extrair token do header Authorization
        token = authorization.replace('Bearer ', '') if authorization.startswith('Bearer ') else authorization
        
        resultado = await login_service.validar_token(token)
        
        if resultado['success']:
            return JSONResponse(
                content=resultado,
                status_code=status.HTTP_200_OK
            )
        else:
            return JSONResponse(
                content=resultado,
                status_code=status.HTTP_401_UNAUTHORIZED
            )
            
    except Exception as e:
        print(f"Erro ao validar token: {e}")
        return JSONResponse(
            content={
                'success': False,
                'message': 'Erro interno do servidor'
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@router.get("/health")
async def health_check():
    """
    Rota para verificar se o serviço está funcionando
    """
    return {
        'status': 'healthy',
        'service': 'login',
        'framework': 'FastAPI'
    }