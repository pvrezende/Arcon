from fastapi import FastAPI, Request, Form, HTTPException, UploadFile, File
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

# Import controllers - CORRIGIDO
from controllers.chat_controller import router as chat_router
from controllers.user_controller import router as user_router
from controllers.proposta_controller import router as proposta_router  
from controllers.anuncio_controller import router as anuncios_router, router_compat as anuncios_compat_router
from controllers.prestador_controller import router as prestador_router, router_compat as prestador_compat_router
from controllers.auth_controller import router as auth_router, router_compat as auth_compat_router
from controllers.credenciamento_controller import router as credenciamento_router
from controllers.agendamento_controller import router as agendamento_router

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="templates")

# Registrar routers (O WebSocket já está incluído no chat_router)
app.include_router(chat_router)  # ✅ JÁ TEM WEBSOCKET: /api/chats/ws/chat/{room_id}
app.include_router(user_router)
app.include_router(proposta_router)
app.include_router(anuncios_router)
app.include_router(anuncios_compat_router)
app.include_router(prestador_router)
app.include_router(prestador_compat_router)
app.include_router(auth_router)
app.include_router(auth_compat_router)
app.include_router(credenciamento_router)
app.include_router(agendamento_router)

# Health check
@app.get("/")
async def root():
    return {"message": "API está funcionando!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API está rodando normalmente"}

# ADICIONE ESTA ROTA PARA DEBUG
@app.get("/debug/routes")
async def debug_routes():
    routes = []
    for route in app.routes:
        routes.append({
            "path": route.path,
            "name": getattr(route, 'name', 'N/A'),
            "methods": list(route.methods) if hasattr(route, 'methods') else []
        })
    return routes

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)