import psycopg2
from config import DB_CONFIG

class LoginDAO:
    def __init__(self):
        self.db_config = DB_CONFIG

    async def autenticar_usuario(self, email: str, senha_hash: str):
        """
        Autentica usuário pelo email e senha hash
        Retorna os dados do usuário se as credenciais estiverem corretas
        """
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()
            
            query = """
            SELECT 
                u.id_usuario,
                u.nome,
                u.email,
                u.tipo_usuario,
                c.senha_hash
            FROM usuarios u
            INNER JOIN credencial c ON u.id_usuario = c.user_id
            WHERE u.email = %s AND c.senha_hash = %s
            """
            
            cursor.execute(query, (email, senha_hash))
            resultado = cursor.fetchone()
            
            cursor.close()
            conn.close()
            
            if resultado:
                return {
                    'id_usuario': resultado[0],
                    'nome': resultado[1],
                    'email': resultado[2],
                    'tipo_usuario': resultado[3]
                }
            return None
            
        except Exception as e:
            print(f"Erro no DAO ao autenticar usuário: {e}")
            raise e

    async def buscar_usuario_por_email(self, email: str):
        """
        Busca usuário apenas pelo email (para validações)
        """
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()
            
            query = """
            SELECT 
                u.id_usuario,
                u.nome,
                u.email,
                u.tipo_usuario
            FROM usuarios u
            WHERE u.email = %s
            """
            
            cursor.execute(query, (email,))
            resultado = cursor.fetchone()
            
            cursor.close()
            conn.close()
            
            if resultado:
                return {
                    'id_usuario': resultado[0],
                    'nome': resultado[1],
                    'email': resultado[2],
                    'tipo_usuario': resultado[3]
                }
            return None
            
        except Exception as e:
            print(f"Erro no DAO ao buscar usuário por email: {e}")
            raise e