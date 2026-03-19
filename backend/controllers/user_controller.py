from fastapi import APIRouter, Form, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from service.user_service import UserService
from models.schemas import UserProfileUpdate
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/users", tags=["users"])

@router.post("/upload-profile-image")
async def upload_profile_image(user_id: str = Form(...), image: UploadFile = File(...)):
    result = await UserService.upload_profile_image(user_id, image)
    
    if result["success"]:
        return JSONResponse(content=result)
    else:
        raise HTTPException(status_code=500, detail=result.get("error", "Erro ao fazer upload"))

@router.post("/update-profile")
async def update_user_profile(
    user_id: str = Form(...), 
    user_name: str = Form(None), 
    profile_image: str = Form(None)
):
    result = UserService.update_user_profile(user_id, user_name, profile_image)
    
    if result["success"]:
        return JSONResponse(content=result)
    else:
        raise HTTPException(status_code=500, detail=result.get("error", "Erro ao atualizar perfil"))

@router.get("/{user_id}")
async def get_user_profile(user_id: str):
    result = UserService.get_user_profile(user_id)
    
    if result["success"]:
        return JSONResponse(content=result)
    else:
        raise HTTPException(status_code=404, detail=result.get("error", "Usuário não encontrado"))

@router.get("/firebase/{firebase_uid}")
async def get_user_by_firebase_uid(firebase_uid: str):
    result = UserService.get_user_by_firebase_uid(firebase_uid)
    return JSONResponse(content=result)

@router.get("/cliente/{firebase_uid}")
async def buscar_nome_cliente(firebase_uid: str):
    result = UserService.buscar_nome_cliente(firebase_uid)
    return JSONResponse(content=result)

@router.get("/prestador/{firebase_uid}")
async def buscar_nome_prestador(firebase_uid: str):
    result = UserService.buscar_nome_prestador(firebase_uid)
    return JSONResponse(content=result)