from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
import re

class PropostaUpdate(BaseModel):
    DECISAO: str = Field(..., description="Decisão sobre a proposta")
    
    @validator('DECISAO')
    def validate_decisao(cls, v):
        decisao_valida = v.strip().lower()
        if decisao_valida not in ['aceita', 'aceito', 'recusada', 'recusado', 'pendente']:
            raise ValueError('Decisão deve ser: aceita, aceito, recusada, recusado ou pendente')
        return v

class UserProfileUpdate(BaseModel):
    user_id: str = Field(..., description="ID do usuário no Firebase")
    user_name: Optional[str] = Field(None, max_length=100, description="Nome do usuário")
    profile_image: Optional[str] = Field(None, description="URL da imagem de perfil")

class ChatCreate(BaseModel):
    user1_id: str = Field(..., description="ID do cliente")
    user2_id: str = Field(..., description="ID do prestador")
    servico: Optional[str] = Field(None, max_length=200, description="Descrição do serviço")
    valor: Optional[str] = Field(None, max_length=50, description="Valor do serviço")
    prestador_nome: Optional[str] = Field(None, max_length=100, description="Nome do prestador")

class ServicoCreate(BaseModel):
    cliente: str = Field(..., max_length=200, description="Nome ou email do cliente")
    btu: str = Field(..., max_length=50, description="Capacidade BTU do equipamento")
    tag: str = Field(..., max_length=100, description="Tag ou identificação do equipamento")
    servico: str = Field(..., max_length=200, description="Tipo de serviço solicitado")
    marca: str = Field(..., max_length=100, description="Marca do equipamento")
    confirmar: str = Field(..., description="Confirmação do serviço")
    user_id: str = Field(..., description="ID do usuário que está criando o serviço")
    prestador_id: Optional[str] = Field(None, description="ID específico do prestador (opcional)")

    @validator('cliente')
    def validate_cliente(cls, v):
        if not v.strip():
            raise ValueError('Cliente não pode estar vazio')
        return v.strip()

    @validator('confirmar')
    def validate_confirmar(cls, v):
        confirmar_valido = str(v).lower()
        if confirmar_valido not in ['true', 'false', '1', '0', 'sim', 'não']:
            raise ValueError('Confirmação deve ser um valor booleano válido')
        return v

class PropostaCreate(BaseModel):
    id_registro: int = Field(..., description="ID do registro do serviço")
    proposta: int = Field(..., gt=0, description="Valor da proposta (deve ser maior que 0)")
    decisao: str = Field(..., description="Decisão do prestador")
    prestador_id: Optional[str] = Field(None, description="ID do prestador")

    @validator('decisao')
    def validate_decisao_proposta(cls, v):
        decisao_valida = v.strip().lower()
        if decisao_valida not in ['aceita', 'aceito', 'accept', 'accepted', 'recusada', 'recusado']:
            raise ValueError('Decisão deve ser: aceita, aceito, recusada ou recusado')
        return v

class DecisaoClienteCreate(BaseModel):
    id_registro: int = Field(..., description="ID do registro do serviço")
    decisao2: str = Field(..., description="Decisão do cliente sobre a proposta")

    @validator('decisao2')
    def validate_decisao2(cls, v):
        decisao_valida = v.strip().upper()
        if decisao_valida not in ['ACEITA', 'RECUSADA']:
            raise ValueError('DECISAO2 deve ser: ACEITA ou RECUSADA')
        return decisao_valida

class RecusaServicoCreate(BaseModel):
    id_registro: int = Field(..., description="ID do serviço a ser recusado")
    prestador_id: str = Field(..., description="ID do prestador que está recusando")

class AnuncioCreate(BaseModel):
    nome: str = Field(..., max_length=100, description="Nome do produto")
    marca: str = Field(..., max_length=100, description="Marca do produto")
    endereco: str = Field(..., max_length=200, description="Endereço para atendimento")
    valor1: str = Field(default="0", description="Valor inicial (opcional)")
    valor2: str = Field(..., description="Valor principal do serviço")
    btu: str = Field(..., description="Capacidade BTU")
    especificacao: str = Field(..., max_length=500, description="Especificações do produto")
    tipo: str = Field(..., description="Tipo: NOVO ou USADO")
    prestador_id: str = Field(..., description="ID do prestador")

    @validator('tipo')
    def validate_tipo(cls, v):
        tipo_valido = v.upper()
        if tipo_valido not in ['NOVO', 'USADO']:
            raise ValueError('Tipo deve ser: NOVO ou USADO')
        return tipo_valido

    @validator('valor2')
    def validate_valor2(cls, v):
        try:
            valor = float(v)
            if valor <= 0:
                raise ValueError('Valor2 deve ser maior que zero')
            return v
        except ValueError:
            raise ValueError('Valor2 deve ser um número válido')

class PrestadorCreate(BaseModel):
    prestador_id: str = Field(..., description="ID do prestador no Firebase")
    nome: str = Field(..., max_length=100, description="Nome do prestador")

    @validator('nome')
    def validate_nome(cls, v):
        if not v.strip():
            raise ValueError('Nome não pode estar vazio')
        if len(v.strip()) < 2:
            raise ValueError('Nome deve ter pelo menos 2 caracteres')
        return v.strip()

class ChatResponse(BaseModel):
    chat_id: str
    user1_id: str
    user2_id: str
    servico: Optional[str]
    valor: Optional[str]
    prestador_nome: Optional[str]
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

class ServicoResponse(BaseModel):
    id: int
    CLIENTE: str
    BTU: str
    TAG: str
    SERVICO: str
    MARCA: str
    CONFIRMAR: str
    user_id: str
    prestador_id: Optional[str]
    PROPOSTA: Optional[int]
    DECISAO: Optional[str]
    DECISAO2: Optional[str]
    data_solicitacao: Optional[str]

    class Config:
        from_attributes = True

class UserProfileResponse(BaseModel):
    firebase_uid: str
    user_name: Optional[str]
    profile_image: Optional[str]
    email: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

class PropostaResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
    error: Optional[str] = None

    class Config:
        from_attributes = True

# Modelos para responses padrão
class StandardResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
    error: Optional[str] = None

class ListResponse(BaseModel):
    success: bool
    data: list
    total: int
    error: Optional[str] = None

# Modelos para filtros e queries
class ServicoFilter(BaseModel):
    prestador_id: Optional[str] = None
    cliente: Optional[str] = None
    servico: Optional[str] = None
    status: Optional[str] = None  # disponivel, aceito, recusado, etc.

class Pagination(BaseModel):
    page: int = Field(1, ge=1, description="Número da página")
    limit: int = Field(10, ge=1, le=100, description="Itens por página")