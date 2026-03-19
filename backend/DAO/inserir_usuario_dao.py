import psycopg2
from psycopg2 import sql
from datetime import datetime
from config import DB_CONFIG
import bcrypt
import logging

logger = logging.getLogger(__name__)

class UsuarioDAO:
    def __init__(self):
        self.conn = psycopg2.connect(**DB_CONFIG)
        self.conn.autocommit = True

    def inserir_usuario_completo(self, nome, email, senha, tipo_usuario, telefone, id_endereco, 
                                 cpf=None, cnpj=None, razao_social=None, nome_fantasia=None, 
                                 tipo_prestador=None, area_atuacao=None):
        """Insere um novo usuário com todos os dados relacionados, senha na tabela credencial"""
        try:
            with self.conn.cursor() as cursor:
                # Verificar se email já existe na tabela credencial
                cursor.execute("SELECT id_credencial FROM credencial WHERE email = %s", (email,))
                if cursor.fetchone():
                    logger.warning(f"Tentativa de cadastro com email existente: {email}")
                    return {"success": False, "error": "Email já cadastrado"}

                # 1. Inserir usuário principal sem senha
                query_usuario = sql.SQL("""
                    INSERT INTO usuario (
                        nome, email, telefone, tipo_usuario, data_criacao, id_endereco
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s
                    ) RETURNING id_usuario;
                """)
                data_criacao = datetime.now()
                cursor.execute(query_usuario, (nome, email, telefone, tipo_usuario, data_criacao, id_endereco))
                id_usuario = cursor.fetchone()[0]

                # Hash da senha
                senha_hash = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

                # 2. Inserir na tabela credencial
                query_credencial = """
                    INSERT INTO credencial (id_usuario, email, senha_hash, ultimo_login)
                    VALUES (%s, %s, %s, %s);
                """
                cursor.execute(query_credencial, (id_usuario, email, senha_hash, None))

                # 3. Inserir dados específicos conforme o tipo
                if tipo_usuario.upper() == "CLIENTE" and cpf:
                    # Cliente - pessoa física
                    cursor.execute("""
                        INSERT INTO pessoa_fisica (id_usuario, cpf)
                        VALUES (%s, %s)
                    """, (id_usuario, cpf))
                    logger.info(f"Cliente (pessoa física) cadastrado com CPF: {cpf}")

                elif tipo_usuario.upper() == "PRESTADOR" and cnpj:
                    # Prestador - pessoa jurídica
                    cursor.execute("""
                        INSERT INTO pessoa_juridica (id_usuario, cnpj, razao_social, nome_fantasia)
                        VALUES (%s, %s, %s, %s)
                    """, (id_usuario, cnpj, razao_social or nome, nome_fantasia))
                    
                    # Inserir na tabela prestador
                    cursor.execute("""
                        INSERT INTO prestador (id_usuario, tipo_prestador, descricao, ativo)
                        VALUES (%s, %s, %s, %s)
                        RETURNING id_prestador;
                    """, (id_usuario, tipo_prestador or "MANUAL", f"Prestador: {nome}", True))
                    id_prestador = cursor.fetchone()[0]
                    
                    # Inserir subtipo específico
                    if tipo_prestador == "LOJA":
                        cursor.execute("""
                            INSERT INTO lojista (id_prestador, categoria_loja)
                            VALUES (%s, %s)
                        """, (id_prestador, area_atuacao))
                    else:  # MANUAL/SERVICO
                        cursor.execute("""
                            INSERT INTO prestador_servico (id_prestador, area_atuacao)
                            VALUES (%s, %s)
                        """, (id_prestador, area_atuacao))
                    
                    logger.info(f"Prestador cadastrado - Tipo: {tipo_prestador}, ID: {id_prestador}")

                logger.info(f"Usuário completo cadastrado! ID: {id_usuario}, Email: {email}")
                return {
                    "success": True,
                    "message": "Usuário cadastrado com sucesso",
                    "data": {
                        "id_usuario": id_usuario,
                        "nome": nome,
                        "email": email,
                        "tipo_usuario": tipo_usuario,
                        "cpf": cpf,
                        "cnpj": cnpj
                    }
                }

        except Exception as e:
            logger.error(f"Erro ao inserir usuário completo: {e}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}

    def buscar_usuario_por_email(self, email):
        """Busca usuário por email para login na tabela credencial com informações de prestador"""
        try:
            with self.conn.cursor() as cursor:
                query = """
                    SELECT u.id_usuario, u.nome, u.email, u.tipo_usuario, u.telefone, u.data_criacao, 
                           c.senha_hash, p.tipo_prestador, p.id_prestador
                    FROM usuario u
                    INNER JOIN credencial c ON u.id_usuario = c.id_usuario
                    LEFT JOIN prestador p ON u.id_usuario = p.id_usuario
                    WHERE c.email = %s AND u.email = %s
                """
                cursor.execute(query, (email, email))
                result = cursor.fetchone()
                
                if result:
                    logger.info(f"Usuário encontrado para login: {email}")
                    
                    user_data = {
                        "id_usuario": result[0],
                        "nome": result[1],
                        "email": result[2],
                        "tipo_usuario": result[3],
                        "telefone": result[4],
                        "data_criacao": result[5].isoformat() if result[5] else None,
                        "senha": result[6]
                    }
                    
                    # Se for prestador, adicionar informações específicas
                    if result[3] == "PRESTADOR" and result[7]:
                        user_data["tipo_prestador"] = result[7]
                        user_data["id_prestador"] = result[8]
                        
                        # Buscar informações específicas do subtipo
                        if result[7] == "LOJA":
                            cursor.execute("""
                                SELECT categoria_loja 
                                FROM lojista 
                                WHERE id_prestador = %s
                            """, (result[8],))
                            loja_info = cursor.fetchone()
                            if loja_info:
                                user_data["categoria_loja"] = loja_info[0]
                        else:  # MANUAL
                            cursor.execute("""
                                SELECT area_atuacao 
                                FROM prestador_servico 
                                WHERE id_prestador = %s
                            """, (result[8],))
                            servico_info = cursor.fetchone()
                            if servico_info:
                                user_data["area_atuacao"] = servico_info[0]
                    
                    return {
                        "success": True,
                        "user": user_data
                    }
                else:
                    logger.warning(f"Usuário não encontrado para login: {email}")
                    return {"success": False, "error": "Usuário não encontrado"}

        except Exception as e:
            logger.error(f"Erro ao buscar usuário por email {email}: {e}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}

    def verificar_senha(self, senha_informada, senha_hash):
        """Verifica se a senha informada bate com o hash armazenado"""
        try:
            return bcrypt.checkpw(senha_informada.encode('utf-8'), senha_hash.encode('utf-8'))
        except Exception as e:
            logger.error(f"Erro ao verificar senha: {e}")
            return None

    def atualizar_ultimo_login(self, email):
        """Atualiza o último login na tabela credencial"""
        try:
            with self.conn.cursor() as cursor:
                query = """
                    UPDATE credencial 
                    SET ultimo_login = %s 
                    WHERE email = %s
                """
                ultimo_login = datetime.now()
                cursor.execute(query, (ultimo_login, email))
                logger.info(f"Último login atualizado para: {email}")
                return True
        except Exception as e:
            logger.error(f"Erro ao atualizar último login para {email}: {e}")
            return False
        
    def buscar_usuario(self, id_usuario):
        try:
            with self.conn.cursor() as cursor:
                query = sql.SQL("""
                    SELECT nome FROM usuario WHERE id_usuario = %s;
                """)
                cursor.execute(query, (id_usuario,))
                resultado = cursor.fetchone()
                if resultado:
                    return resultado[0] 
                else:
                    return None  
        except Exception as e:
            logger.error(f"Erro ao buscar usuário: {e}")
            return None

    def fechar_conexao(self):
        if self.conn:
            self.conn.close()
