# user_dao.py

from .database import db
from datetime import datetime

class UserDAO:
    @staticmethod
    def upload_profile_image(file_name: str, contents: bytes, content_type: str):
        try:
            response = db.supabase.storage.from_("profiles").upload(
                file_name,
                contents,
                {"content-type": content_type or "image/jpeg"}
            )

            public_url = db.supabase.storage.from_("profiles").get_public_url(file_name)
            return {"success": True, "public_url": public_url}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def update_user_profile(user_id: str, update_data: dict):
        try:
            existing_user = db.supabase.table("users").select("*").eq("firebase_uid", user_id).execute()

            if existing_user.data:
                response = db.supabase.table("users").update(update_data).eq("firebase_uid", user_id).execute()
            else:
                update_data["firebase_uid"] = user_id
                update_data["email"] = f"{user_id}@temp.com"
                response = db.supabase.table("users").insert(update_data).execute()

            if response.data:
                return {
                    "success": True,
                    "message": "Perfil atualizado com sucesso",
                    "user_data": response.data[0]
                }
            return {"success": False, "error": "Erro ao atualizar perfil"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def get_user_profile(user_id: str):
        try:
            response = db.supabase.table("users").select("*").eq("firebase_uid", user_id).execute()
            if response.data:
                return {"success": True, "user_data": response.data[0]}
            return {"success": False, "error": "Usuário não encontrado"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def get_user_by_firebase_uid(firebase_uid: str):
        try:
            # Buscar na tabela de prestadores
            response = db.supabase.table("TABELA_ID_PRESTADOR") \
                .select("*") \
                .eq("PRESTADOR_ID", firebase_uid) \
                .execute()
            
            if response.data:
                return {
                    "success": True,
                    "user": response.data[0],
                    "user_type": "prestador"
                }
            
            # Buscar na tabela users
            try:
                response = db.supabase.table("users") \
                    .select("*") \
                    .eq("firebase_uid", firebase_uid) \
                    .execute()
                
                if response.data:
                    return {
                        "success": True,
                        "user": response.data[0],
                        "user_type": "cliente"
                    }
            except Exception:
                pass
            
            # Criar usuário temporário
            return {
                "success": True,
                "user": {
                    "firebase_uid": firebase_uid,
                    "user_name": f"Usuário {firebase_uid[:8]}",
                    "email": f"{firebase_uid}@temp.com",
                    "is_temp": True
                },
                "user_type": "temp",
                "message": "Usuário temporário criado"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    # 🔥 NOVOS MÉTODOS PARA BUSCAR NOMES DE USUÁRIOS
    
    @staticmethod
    def obter_prestador_por_id(prestador_id: str):
        """
        Busca um prestador na tabela TABELA_ID_PRESTADOR
        """
        try:
            response = db.supabase.table("TABELA_ID_PRESTADOR") \
                .select("*") \
                .eq("PRESTADOR_ID", prestador_id) \
                .execute()
            
            if response.data:
                return {"success": True, "prestador": response.data[0]}
            return {"success": True, "prestador": None}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def obter_cliente_por_id(user_id: str):
        """
        Busca um cliente na tabela bancodedadoscar
        """
        try:
            response = db.supabase.table("bancodedadoscar") \
                .select("CLIENTE, user_id") \
                .eq("user_id", user_id) \
                .limit(1) \
                .execute()
            
            if response.data:
                return {"success": True, "cliente": response.data[0]}
            return {"success": True, "cliente": None}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def obter_dados_prestador(prestador_id: str):
        """
        Busca dados completos do prestador (mantendo compatibilidade)
        """
        return UserDAO.obter_prestador_por_id(prestador_id)
    
    @staticmethod
    def buscar_nome_usuario_completo(firebase_uid: str):
        """
        Busca o nome completo de um usuário (prestador ou cliente)
        Retorna dados formatados para uso no chat
        """
        try:
            # Primeiro tenta buscar como prestador
            prestador_result = UserDAO.obter_prestador_por_id(firebase_uid)
            if prestador_result["success"] and prestador_result.get("prestador"):
                prestador = prestador_result["prestador"]
                return {
                    "id": firebase_uid,
                    "name": prestador.get("NOME", f"Prestador_{firebase_uid[:8]}"),
                    "user_type": "prestador",
                    "email": None
                }
            
            # Se não encontrou como prestador, tenta como cliente
            cliente_result = UserDAO.obter_cliente_por_id(firebase_uid)
            if cliente_result["success"] and cliente_result.get("cliente"):
                cliente = cliente_result["cliente"]
                email_cliente = cliente.get('CLIENTE', '')
                
                # Extrai o nome do email (parte antes do @)
                if email_cliente and '@' in email_cliente:
                    nome = email_cliente.split('@')[0].replace('.', ' ').title()
                else:
                    nome = email_cliente or 'Cliente'
                
                return {
                    "id": firebase_uid,
                    "name": nome,
                    "email": email_cliente,
                    "user_type": "cliente"
                }
            
            # Fallback: se não encontrou em nenhuma tabela
            return {
                "id": firebase_uid,
                "name": f"Usuário_{firebase_uid[:8]}",
                "email": None,
                "user_type": "desconhecido"
            }
            
        except Exception as e:
            return {
                "id": firebase_uid,
                "name": "Usuário",
                "email": None,
                "user_type": "erro"
            }