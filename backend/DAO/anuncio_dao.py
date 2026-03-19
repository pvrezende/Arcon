from .database import db
from typing import List

class AnuncioDAO:
    @staticmethod
    def criar_anuncio(anuncio_data: dict):
        try:
            response = db.supabase.table("novoevelho").insert(anuncio_data).execute()
            return {"success": True, "data": response.data}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def obter_anuncios_por_prestador(prestador_id: str):
        try:
            response = db.supabase.table("novoevelho").select("*").eq("prestador_id", prestador_id).execute()
            return {"success": True, "products": response.data or []}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def obter_todos_anuncios():
        try:
            response = db.supabase.table("novoevelho").select("*").execute()
            return {"success": True, "anuncios": response.data or []}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def obter_anuncios_novos():
        try:
            response = db.supabase.table("novoevelho").select("*").eq("TIPO", "NOVO").execute()
            return {"success": True, "anuncios": response.data or []}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def obter_anuncios_usados():
        try:
            response = db.supabase.table("novoevelho").select("*").eq("TIPO", "USADO").execute()
            return {"success": True, "anuncios": response.data or []}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def migrar_anuncios_antigos(prestador_id: str):
        try:
            # Buscar todos os registros
            all_response = db.supabase.table("novoevelho").select("*").execute()
            todos_registros = all_response.data or []
            
            # Filtrar registros sem prestador_id
            registros_sem_prestador = [
                reg for reg in todos_registros 
                if not reg.get('prestador_id') or reg.get('prestador_id') in ['', None]
            ]
            
            if not registros_sem_prestador:
                return {"success": True, "message": "Todos os registros já têm prestador_id", "updated_count": 0}
            
            # Atualizar cada registro individualmente
            updated_count = 0
            for registro in registros_sem_prestador:
                try:
                    update_response = db.supabase.table("novoevelho").update({
                        "prestador_id": prestador_id
                    }).eq("id", registro['id']).execute()
                    
                    if update_response.data:
                        updated_count += 1
                except Exception:
                    continue
            
            return {
                "success": True, 
                "message": f"{updated_count} registros migrados com sucesso",
                "updated_count": updated_count,
                "total_found": len(registros_sem_prestador)
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def atualizar_prestador_anuncio(anuncio_id: int, prestador_id: str):
        try:
            response = db.supabase.table("novoevelho").update({
                "prestador_id": prestador_id
            }).eq("id", anuncio_id).execute()
            
            if response.data:
                return {"success": True, "data": response.data[0]}
            return {"success": False, "error": "Anúncio não encontrado"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def deletar_anuncio(anuncio_id: int, prestador_id: str):
        try:
            # Verificar se o anúncio pertence ao prestador
            produto_response = db.supabase.table("novoevelho").select("*").eq("id", anuncio_id).eq("prestador_id", prestador_id).execute()
            
            if not produto_response.data:
                return {"success": False, "error": "Anúncio não encontrado ou não autorizado"}
            
            # Deletar o anúncio
            delete_response = db.supabase.table("novoevelho").delete().eq("id", anuncio_id).execute()
            
            if delete_response.data:
                return {"success": True, "message": "Anúncio deletado com sucesso"}
            return {"success": False, "error": "Erro ao deletar anúncio"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def atualizar_view(id_produto: int, view_count: int):
        try:
            # Buscar o registro atual
            existing = db.supabase.table("novoevelho").select("VIEW").eq("id", id_produto).execute()

            if not existing.data:
                return {"success": False, "error": f"Produto com ID {id_produto} não encontrado"}

            # Obter o valor atual de VIEW
            current_views = existing.data[0].get("VIEW", 0) or 0
            
            # Incrementar o valor atual
            new_view_count = current_views + view_count
            
            # Atualizar o registro
            update_response = db.supabase.table("novoevelho").update({"VIEW": new_view_count}).eq("id", id_produto).execute()
            
            if update_response.data:
                return {
                    "success": True, 
                    "id_produto": id_produto, 
                    "previous_views": current_views,
                    "increment": view_count,
                    "new_view_count": new_view_count
                }
            return {"success": False, "error": "Falha ao atualizar VIEW no banco de dados"}
        except Exception as e:
            return {"success": False, "error": str(e)}
