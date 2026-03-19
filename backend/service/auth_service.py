from DAO.inserir_usuario_dao import UsuarioDAO
from DAO.endereco_dao import EnderecoDAO
import logging
from typing import Dict, Any
import jwt
from datetime import datetime, timedelta
import os

logger = logging.getLogger(__name__)

class AuthService:
    SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'arcon_secret_key_2025')
    ALGORITHM = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 horas

    @staticmethod
    def cadastrar_usuario(nome: str, email: str, senha: str, tipo_usuario: str, telefone: str = None, 
                         cep: str = None, endereco: str = None, numero: str = None, bairro: str = None,
                         cidade: str = None, estado: str = None, complemento: str = None,
                         cpf: str = None, cnpj: str = None, razao_social: str = None, 
                         nome_fantasia: str = None, tipo_prestador: str = None, area_atuacao: str = None) -> Dict[str, Any]:
        """Cadastra um novo usuário com endereço e dados específicos por tipo"""
        try:
            logger.info(f"Iniciando cadastro de usuário: {email}, Tipo: {tipo_usuario}")
            
            # Validações básicas obrigatórias
            if not all([nome, email, senha, tipo_usuario]):
                logger.warning("Tentativa de cadastro com campos obrigatórios vazios")
                return {"success": False, "error": "Nome, email, senha e tipo de usuário são obrigatórios"}
            
            if len(senha) < 6:
                logger.warning("Tentativa de cadastro com senha muito curta")
                return {"success": False, "error": "A senha deve ter pelo menos 6 caracteres"}
            
            if tipo_usuario.upper() not in ["CLIENTE", "PRESTADOR"]:
                logger.warning(f"Tipo de usuário inválido: {tipo_usuario}")
                return {"success": False, "error": "Tipo de usuário deve ser 'CLIENTE' ou 'PRESTADOR'"}
            
            # Validar formato de email (básico)
            if "@" not in email or "." not in email:
                return {"success": False, "error": "Formato de email inválido"}

            # Validações específicas por tipo de usuário
            if tipo_usuario.upper() == "CLIENTE":
                if not cpf:
                    return {"success": False, "error": "CPF é obrigatório para clientes"}
                if len(cpf.replace(".", "").replace("-", "")) != 11:
                    return {"success": False, "error": "CPF deve ter 11 dígitos"}
            
            elif tipo_usuario.upper() == "PRESTADOR":
                if not cnpj:
                    return {"success": False, "error": "CNPJ é obrigatório para prestadores"}
                if len(cnpj.replace(".", "").replace("/", "").replace("-", "")) != 14:
                    return {"success": False, "error": "CNPJ deve ter 14 dígitos"}
                if not tipo_prestador or tipo_prestador.upper() not in ["LOJA", "MANUAL"]:
                    return {"success": False, "error": "Tipo de prestador deve ser 'LOJA' ou 'MANUAL'"}
                if not area_atuacao:
                    return {"success": False, "error": "Área de atuação é obrigatória para prestadores"}

            # Validar endereço - OBRIGATÓRIO para todos
            if not all([cep, endereco, numero, bairro, cidade, estado]):
                return {"success": False, "error": "Todos os campos de endereço são obrigatórios: CEP, endereço, número, bairro, cidade, estado"}
            
            if len(estado) != 2:
                return {"success": False, "error": "Estado deve ter 2 caracteres (ex: SP, RJ)"}

            # 1. Cadastrar endereço (obrigatório)
            endereco_dao = EnderecoDAO()
            resultado_endereco = endereco_dao.inserir_endereco(
                cep=cep.strip(),
                endereco=endereco.strip(),
                numero=numero.strip(),
                bairro=bairro.strip(),
                cidade=cidade.strip(),
                estado=estado.upper().strip(),
                complemento=complemento.strip() if complemento else None
            )
            endereco_dao.fechar_conexao()
            
            if not resultado_endereco["success"]:
                return {"success": False, "error": f"Erro ao cadastrar endereço: {resultado_endereco['error']}"}
            
            id_endereco = resultado_endereco["data"]["id_endereco"]
            logger.info(f"Endereço cadastrado com ID: {id_endereco}")

            # 2. Cadastrar usuário completo
            usuario_dao = UsuarioDAO()
            resultado = usuario_dao.inserir_usuario_completo(
                nome=nome.strip(),
                email=email.lower().strip(),
                senha=senha,
                tipo_usuario=tipo_usuario.upper(),
                telefone=telefone.strip() if telefone else None,
                id_endereco=id_endereco,
                cpf=cpf.strip() if cpf else None,
                cnpj=cnpj.strip() if cnpj else None,
                razao_social=razao_social.strip() if razao_social else None,
                nome_fantasia=nome_fantasia.strip() if nome_fantasia else None,
                tipo_prestador=tipo_prestador.upper() if tipo_prestador else None,
                area_atuacao=area_atuacao.strip() if area_atuacao else None
            )
            
            usuario_dao.fechar_conexao()
            
            if resultado["success"]:
                logger.info(f"Usuário completo cadastrado com sucesso: {email}")
                # Adicionar dados de endereço na resposta
                resultado["data"]["endereco"] = resultado_endereco["data"]
            
            return resultado

        except Exception as e:
            logger.error(f"Erro no AuthService ao cadastrar usuário {email}: {str(e)}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}

    @staticmethod
    def fazer_login(email: str, senha: str) -> Dict[str, Any]:
        """Realiza login do usuário"""
        try:
            logger.info(f"Tentativa de login para: {email}")
            
            # Validações básicas
            if not email or not senha:
                logger.warning("Tentativa de login com campos vazios")
                return {"success": False, "error": "Email e senha são obrigatórios"}

            # Buscar usuário no banco
            usuario_dao = UsuarioDAO()
            resultado_busca = usuario_dao.buscar_usuario_por_email(email.lower().strip())
            
            if not resultado_busca["success"]:
                usuario_dao.fechar_conexao()
                logger.warning(f"Tentativa de login com email inexistente: {email}")
                return {"success": False, "error": "Email ou senha incorretos"}

            usuario = resultado_busca["user"]
            
            # Verificar senha
            if not usuario_dao.verificar_senha(senha, usuario["senha"]):
                usuario_dao.fechar_conexao()
                logger.warning(f"Tentativa de login com senha incorreta para: {email}")
                return {"success": False, "error": "Email ou senha incorretos"}
            
            # Atualizar último login na tabela credencial
            usuario_dao.atualizar_ultimo_login(email)
            usuario_dao.fechar_conexao()

            # Gerar JWT token
            token_payload = {
                "user_id": usuario["id_usuario"],
                "email": usuario["email"],
                "tipo_usuario": usuario["tipo_usuario"],
                "exp": datetime.utcnow() + timedelta(minutes=AuthService.ACCESS_TOKEN_EXPIRE_MINUTES)
            }
            
            # Adicionar informações de prestador no token se aplicável
            if usuario["tipo_usuario"] == "PRESTADOR" and usuario.get("tipo_prestador"):
                token_payload["tipo_prestador"] = usuario["tipo_prestador"]
                token_payload["id_prestador"] = usuario.get("id_prestador")
            
            token = jwt.encode(token_payload, AuthService.SECRET_KEY, algorithm=AuthService.ALGORITHM)
            
            logger.info(f"Login realizado com sucesso para: {email}")
            
            # Preparar dados do usuário para retorno
            user_response = {
                "id_usuario": usuario["id_usuario"],
                "nome": usuario["nome"],
                "email": usuario["email"],
                "tipo_usuario": usuario["tipo_usuario"],
                "telefone": usuario["telefone"]
            }
            
            # Adicionar informações específicas de prestador
            if usuario["tipo_usuario"] == "PRESTADOR":
                if usuario.get("tipo_prestador"):
                    user_response["tipo_prestador"] = usuario["tipo_prestador"]
                    user_response["id_prestador"] = usuario.get("id_prestador")
                    
                    if usuario.get("categoria_loja"):
                        user_response["categoria_loja"] = usuario["categoria_loja"]
                    if usuario.get("area_atuacao"):
                        user_response["area_atuacao"] = usuario["area_atuacao"]
            
            return {
                "success": True,
                "message": "Login realizado com sucesso",
                "data": {
                    "token": token,
                    "user": user_response
                }
            }

        except Exception as e:
            logger.error(f"Erro no AuthService ao fazer login {email}: {str(e)}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}

    @staticmethod
    def verificar_token(token: str) -> Dict[str, Any]:
        """Verifica e decodifica um JWT token"""
        try:
            payload = jwt.decode(token, AuthService.SECRET_KEY, algorithms=[AuthService.ALGORITHM])
            return {"success": True, "user": payload}
        except jwt.ExpiredSignatureError:
            return {"success": False, "error": "Token expirado"}
        except jwt.InvalidTokenError:
            return {"success": False, "error": "Token inválido"}
        except Exception as e:
            logger.error(f"Erro ao verificar token: {str(e)}")
            return {"success": False, "error": "Erro ao verificar token"}

    @staticmethod
    def buscar_usuario_por_id(user_id: int) -> Dict[str, Any]:
        """Busca dados do usuário por ID"""
        try:
            usuario_dao = UsuarioDAO()
            resultado = usuario_dao.buscar_usuario_por_id(user_id)
            usuario_dao.fechar_conexao()
            return resultado
        except Exception as e:
            logger.error(f"Erro ao buscar usuário por ID {user_id}: {str(e)}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}
