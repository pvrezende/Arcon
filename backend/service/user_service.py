from DAO.user_dao import UserDAO
import uuid
from fastapi import UploadFile
import logging

logger = logging.getLogger(__name__)

class UserService:
    @staticmethod
    async def upload_profile_image(user_id: str, image: UploadFile):
        try:
            contents = await image.read()
            file_extension = image.filename.split('.')[-1] if '.' in image.filename else 'jpg'
            file_name = f"profile_{user_id}_{uuid.uuid4()}.{file_extension}"

            # Upload para Supabase Storage
            response = UserDAO.upload_profile_image(file_name, contents, image.content_type)
            
            if response["success"]:
                return {
                    "success": True,
                    "message": "Imagem de perfil atualizada com sucesso",
                    "image_url": response["public_url"],
                    "file_name": file_name,
                    "user_id": user_id
                }
            else:
                return {"success": False, "error": response["error"]}
                
        except Exception as e:
            logger.error(f"Erro no upload da imagem: {str(e)}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def update_user_profile(user_id: str, user_name: str = None, profile_image: str = None):
        try:
            update_data = {}
            if user_name:
                update_data["user_name"] = user_name
            if profile_image:
                update_data["profile_image"] = profile_image

            result = UserDAO.update_user_profile(user_id, update_data)
            return result
            
        except Exception as e:
            logger.error(f"Erro ao atualizar perfil: {str(e)}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def get_user_profile(user_id: str):
        return UserDAO.get_user_profile(user_id)
    
    @staticmethod
    def get_user_by_firebase_uid(firebase_uid: str):
        return UserDAO.get_user_by_firebase_uid(firebase_uid)
    
    @staticmethod
    def buscar_nome_cliente(firebase_uid: str):
        return UserDAO.buscar_nome_cliente(firebase_uid)
    
    @staticmethod
    def buscar_nome_prestador(firebase_uid: str):
        return UserDAO.buscar_nome_prestador(firebase_uid)