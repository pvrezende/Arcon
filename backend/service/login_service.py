import hashlib
import jwt
import datetime
import os
from typing import Optional, Dict, Any
from DAO import LoginDAO

class LoginService:
    def __init__(self):
        self.login_dao = LoginDAO()
        # Em produção, use uma chave segura em variáveis de ambiente
        self.secret_key = os.getenv('JWT_SECRET_KEY', 'chave_secreta_padrao_para_desenvolvimento')

    def gerar_token_jwt(self, user_data: Dict[str, Any]) -> str:
        """
        Gera token JWT com os dados do usuário
        """
        payload = {
            'user_id': user_data['id_usuario'],
            'email': user_data['email'],
            'tipo_usuario': user_data['tipo_usuario'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24),
            'iat': datetime.datetime.utcnow()
        }
        
        token = jwt.encode(payload, self.secret_key, algorithm='HS256')
        return token

    def verificar_token_jwt(self, token: str) -> Dict[str, Any]:
        """
        Verifica e decodifica token JWT
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            raise ValueError("Token expirado")
        except jwt.InvalidTokenError:
            raise ValueError("Token inválido")

    def calcular_hash_senha(self, senha: str) -> str:
        """
        Calcula o hash SHA-256 da senha
        """
        return hashlib.sha256(senha.encode()).hexdigest()

    async def autenticar(self, email: str, senha: str) -> Dict[str, Any]:
        """
        Autentica usuário com email e senha
        """
        try:
            # Validar email
            if not email or not isinstance(email, str):
                raise ValueError("Email é obrigatório")
            
            # Validar senha
            if not senha or not isinstance(senha, str):
                raise ValueError("Senha é obrigatória")
            
            # Calcular hash da senha
            senha_hash = self.calcular_hash_senha(senha)
            
            # Buscar usuário no banco
            usuario = await self.login_dao.autenticar_usuario(email, senha_hash)
            
            if not usuario:
                raise ValueError("Credenciais inválidas")
            
            # Gerar token JWT
            token = self.gerar_token_jwt(usuario)
            
            return {
                'success': True,
                'message': 'Login realizado com sucesso',
                'data': {
                    'token': token,
                    'user': usuario
                }
            }
            
        except ValueError as e:
            return {
                'success': False,
                'message': str(e),
                'data': None
            }
        except Exception as e:
            print(f"Erro no service durante autenticação: {e}")
            return {
                'success': False,
                'message': 'Erro interno do servidor',
                'data': None
            }

    async def validar_token(self, token: str) -> Dict[str, Any]:
        """
        Valida token JWT e retorna dados do usuário
        """
        try:
            payload = self.verificar_token_jwt(token)
            return {
                'success': True,
                'data': payload
            }
        except Exception as e:
            return {
                'success': False,
                'message': str(e),
                'data': None
            }