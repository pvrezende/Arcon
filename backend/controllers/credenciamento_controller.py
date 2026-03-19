from fastapi import APIRouter, Form, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
from service.credenciamento_service import CredenciamentoService
from DAO.credenciamento_dao import CredenciamentoDAO
import logging
from typing import Optional
from datetime import date

logger = logging.getLogger(__name__)

# Dependências
def get_credenciamento_dao():
    return CredenciamentoDAO()

def get_credenciamento_service(credenciamento_dao: CredenciamentoDAO = Depends(get_credenciamento_dao)):
    return CredenciamentoService(credenciamento_dao)

# Router
router = APIRouter(prefix="/credenciamento", tags=["credenciamento"])


@router.post("/")
async def criar_credenciamento(
    id_prestador: int = Form(..., description="ID do prestador (vem da tabela prestador)"),
    certificado_credenciado: Optional[bool] = Form(False, description="É credenciado?"),
    marca_credenciada: Optional[str] = Form(None, description="Marca credenciada (ex: Samsung, LG)"),
    numero_credenciamento: Optional[str] = Form(None, description="Número do credenciamento"),
    validade_credenciamento: Optional[str] = Form(None, description="Data de validade (YYYY-MM-DD)"),
    especialidades: Optional[str] = Form(None, description="Especialidades do prestador"),
    observacoes: Optional[str] = Form(None, description="Observações adicionais"),
    credenciamento_service: CredenciamentoService = Depends(get_credenciamento_service)
):
    """
    Cria novo credenciamento de prestador (agora suporta múltiplos credenciamentos)
    """
    try:
        logger.info(f"Criando novo credenciamento para id_prestador: {id_prestador}")
        
        dados = {
            "id_prestador": id_prestador,
            "certificado_credenciado": certificado_credenciado,
            "marca_credenciada": marca_credenciada,
            "numero_credenciamento": numero_credenciamento,
            "validade_credenciamento": validade_credenciamento,
            "especialidades": especialidades,
            "observacoes": observacoes
        }
        
        resultado = credenciamento_service.criar_credenciamento(dados)
        
        if resultado["success"]:
            return JSONResponse(content={
                "success": True,
                "message": resultado["message"],
                "data": resultado["data"]
            })
        else:
            raise HTTPException(status_code=400, detail=resultado.get("error", "Erro ao processar credenciamento"))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao criar credenciamento: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@router.get("/prestador/{prestador_id}")
async def listar_credenciamentos_prestador(
    prestador_id: int,
    credenciamento_service: CredenciamentoService = Depends(get_credenciamento_service)
):
    """
    Lista TODOS os credenciamentos de um prestador específico
    """
    try:
        logger.info(f"Listando credenciamentos do prestador ID: {prestador_id}")
        
        resultado = credenciamento_service.listar_credenciamentos_prestador(prestador_id)
        
        if resultado["success"]:
            return {
                "prestador_id": prestador_id,
                "credenciamentos": resultado["data"],
                "total": resultado["total"]
            }
        else:
            raise HTTPException(status_code=500, detail=resultado.get("error", "Erro ao listar credenciamentos"))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao listar credenciamentos do prestador: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@router.get("/{credenciamento_id}")
async def obter_credenciamento_por_id(
    credenciamento_id: int,
    credenciamento_service: CredenciamentoService = Depends(get_credenciamento_service)
):
    """
    Obtém um credenciamento específico pelo ID
    """
    try:
        logger.info(f"Buscando credenciamento ID: {credenciamento_id}")
        
        resultado = credenciamento_service.obter_credenciamento_por_id(credenciamento_id)
        
        if resultado["success"]:
            return resultado["data"]
        else:
            raise HTTPException(status_code=404, detail=resultado.get("error", "Credenciamento não encontrado"))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter credenciamento: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@router.put("/{credenciamento_id}")
async def atualizar_credenciamento(
    credenciamento_id: int,
    certificado_credenciado: Optional[bool] = Form(None),
    marca_credenciada: Optional[str] = Form(None),
    numero_credenciamento: Optional[str] = Form(None),
    validade_credenciamento: Optional[str] = Form(None),
    especialidades: Optional[str] = Form(None),
    observacoes: Optional[str] = Form(None),
    credenciamento_service: CredenciamentoService = Depends(get_credenciamento_service)
):
    """
    Atualiza um credenciamento específico
    """
    try:
        logger.info(f"Atualizando credenciamento ID: {credenciamento_id}")
        
        # 🔥 CORREÇÃO: Só incluir no dicionário os campos que foram realmente enviados
        dados = {}
        
        # Verificar cada campo individualmente
        if certificado_credenciado is not None:
            dados["certificado_credenciado"] = certificado_credenciado
            
        if marca_credenciada is not None:
            dados["marca_credenciada"] = marca_credenciada
            
        if numero_credenciamento is not None:
            dados["numero_credenciamento"] = numero_credenciamento
            
        if validade_credenciamento is not None:
            dados["validade_credenciamento"] = validade_credenciamento
            
        if especialidades is not None:
            dados["especialidades"] = especialidades
            
        if observacoes is not None:
            dados["observacoes"] = observacoes
        
        # 🔥 VERIFICAR SE HÁ CAMPOS PARA ATUALIZAR
        if not dados:
            raise HTTPException(status_code=400, detail="Nenhum campo fornecido para atualização")
        
        resultado = credenciamento_service.atualizar_credenciamento(credenciamento_id, dados)
        
        if resultado["success"]:
            return JSONResponse(content={
                "success": True,
                "message": resultado["message"],
                "data": resultado["data"]
            })
        else:
            raise HTTPException(status_code=400, detail=resultado.get("error", "Erro ao atualizar credenciamento"))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar credenciamento: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@router.delete("/{credenciamento_id}")
async def excluir_credenciamento(
    credenciamento_id: int,
    credenciamento_service: CredenciamentoService = Depends(get_credenciamento_service)
):
    """
    Exclui um credenciamento específico
    """
    try:
        logger.info(f"Excluindo credenciamento ID: {credenciamento_id}")
        
        resultado = credenciamento_service.excluir_credenciamento(credenciamento_id)
        
        if resultado["success"]:
            return JSONResponse(content={
                "success": True,
                "message": resultado["message"]
            })
        else:
            raise HTTPException(status_code=404, detail=resultado.get("error", "Credenciamento não encontrado"))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao excluir credenciamento: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


# 🔥 ROTAS LEGADAS (mantidas para compatibilidade)

@router.get("/prestador/{prestador_id}/legado")
async def obter_credenciamento(
    prestador_id: int,
    credenciamento_service: CredenciamentoService = Depends(get_credenciamento_service)
):
    """
    Obtém o credenciamento mais recente de um prestador (método legado)
    """
    try:
        logger.info(f"Buscando credenciamento (legado) do prestador ID: {prestador_id}")
        
        resultado = credenciamento_service.obter_credenciamento(prestador_id)
        
        if resultado["success"]:
            return resultado["data"]
        else:
            raise HTTPException(status_code=404, detail=resultado.get("error", "Credenciamento não encontrado"))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter credenciamento (legado): {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@router.get("/")
async def listar_credenciamentos(
    certificado_credenciado: Optional[bool] = Query(None, description="Filtrar por credenciados (true/false)"),
    marca_credenciada: Optional[str] = Query(None, description="Filtrar por marca"),
    cidade: Optional[str] = Query(None, description="Filtrar por cidade"),
    estado: Optional[str] = Query(None, description="Filtrar por estado (UF)"),
    credenciamento_service: CredenciamentoService = Depends(get_credenciamento_service)
):
    """
    Lista todos os credenciamentos com filtros opcionais (método legado)
    """
    try:
        logger.info("Listando credenciamentos (legado)")
        
        filtros = {}
        if certificado_credenciado is not None:
            filtros["certificado_credenciado"] = certificado_credenciado
        if marca_credenciada:
            filtros["marca_credenciada"] = marca_credenciada
        if cidade:
            filtros["cidade"] = cidade
        if estado:
            filtros["estado"] = estado
        
        resultado = credenciamento_service.listar_credenciamentos(filtros)
        
        if resultado["success"]:
            return {
                "credenciamentos": resultado["data"],
                "total": resultado["total"],
                "filtros_aplicados": filtros
            }
        else:
            raise HTTPException(status_code=500, detail=resultado.get("error", "Erro ao listar credenciamentos"))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao listar credenciamentos (legado): {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


# 🔥 ROTAS EXISTENTES (mantidas)

@router.get("/verificar/{prestador_id}")
async def verificar_credenciamento_valido(
    prestador_id: int,
    marca: Optional[str] = Query(None, description="Marca para verificar credenciamento específico"),
    credenciamento_service: CredenciamentoService = Depends(get_credenciamento_service)
):
    """
    Verifica se prestador tem credenciamento válido (opcionalmente para marca específica)
    """
    try:
        logger.info(f"Verificando validade do credenciamento - Prestador: {prestador_id}, Marca: {marca}")
        
        resultado = credenciamento_service.verificar_credenciamento_valido(prestador_id, marca)
        
        if resultado["success"]:
            return {
                "prestador_id": prestador_id,
                "marca_verificada": marca,
                "credenciamento_valido": resultado["valido"],
                "motivo": resultado.get("motivo"),
                "detalhes": resultado.get("data")
            }
        else:
            raise HTTPException(status_code=500, detail=resultado.get("error", "Erro ao verificar credenciamento"))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao verificar credenciamento: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@router.get("/relatorio/vencimentos")
async def relatorio_vencimentos(
    dias_antecedencia: int = Query(30, description="Dias de antecedência para alertar sobre vencimentos"),
    credenciamento_service: CredenciamentoService = Depends(get_credenciamento_service)
):
    """
    Relatório de credenciamentos que vencem em X dias
    """
    try:
        logger.info(f"Gerando relatório de vencimentos - {dias_antecedencia} dias")
        
        resultado = credenciamento_service.listar_credenciamentos({"certificado_credenciado": True})
        
        if resultado["success"]:
            credenciamentos = resultado["data"]
            
            # Filtrar por vencimentos próximos
            vencimentos_proximos = []
            vencidos = []
            
            for cred in credenciamentos:
                if cred.get("dias_para_vencimento") is not None:
                    dias = cred["dias_para_vencimento"]
                    if dias < 0:
                        vencidos.append(cred)
                    elif dias <= dias_antecedencia:
                        vencimentos_proximos.append(cred)
            
            return {
                "vencimentos_proximos": vencimentos_proximos,
                "total_vencimentos_proximos": len(vencimentos_proximos),
                "credenciamentos_vencidos": vencidos,
                "total_vencidos": len(vencidos),
                "dias_antecedencia": dias_antecedencia
            }
        else:
            raise HTTPException(status_code=500, detail=resultado.get("error", "Erro ao gerar relatório"))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao gerar relatório de vencimentos: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")