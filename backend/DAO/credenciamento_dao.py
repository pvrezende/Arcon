import psycopg2
from psycopg2 import sql
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from config import DB_CONFIG
import logging

logger = logging.getLogger(__name__)


def _serialize_datetime(data_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Converte datetime e date para string ISO format para serialização JSON"""
    for key, value in data_dict.items():
        if isinstance(value, (datetime, date)):
            data_dict[key] = value.isoformat()
    return data_dict


class CredenciamentoDAO:
    """DAO para gerenciar credenciamento de prestadores"""

    def __init__(self):
        self.conn = psycopg2.connect(**DB_CONFIG)
        self.conn.autocommit = True

    def criar_credenciamento(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """Cria novo credenciamento - USA ESTRUTURA EXISTENTE COM UNIQUE CONSTRAINT"""
        try:
            with self.conn.cursor() as cur:
                # 🔥 BUSCAR DADOS DO PRESTADOR
                cur.execute("""
                    SELECT 
                        p.id_prestador,
                        p.tipo_prestador,
                        u.id_usuario,
                        u.nome,
                        u.email,
                        u.telefone,
                        pj.cnpj,
                        e.cidade,
                        e.estado
                    FROM prestador p
                    INNER JOIN usuario u ON p.id_usuario = u.id_usuario
                    LEFT JOIN pessoa_juridica pj ON u.id_usuario = pj.id_usuario
                    LEFT JOIN endereco e ON u.id_endereco = e.id_endereco
                    WHERE p.id_prestador = %s;
                """, (dados['id_prestador'],))
                
                prestador_data = cur.fetchone()
                
                if not prestador_data:
                    return {"success": False, "error": "Prestador não encontrado"}
                
                # Extrair dados
                (id_prestador, tipo_prestador, id_usuario, nome, email, 
                 telefone, cnpj, cidade, estado) = prestador_data
                
                if not cnpj:
                    return {"success": False, "error": "Prestador deve ser pessoa jurídica cadastrada"}

                # 🔥 SEMPRE TENTAR CRIAR NOVO - a UNIQUE constraint vai evitar duplicatas
                query = sql.SQL("""
                    INSERT INTO credenciamento_prestador (
                        id_prestador, nome, tipo_pessoa, cpf_cnpj, telefone, email, 
                        cidade, estado, certificado_credenciado, marca_credenciada, 
                        numero_credenciamento, validade_credenciamento, especialidades, 
                        observacoes
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    ) RETURNING *;
                """)
                
                cur.execute(query, (
                    id_prestador,           # id_prestador
                    nome,                   # usuario.nome
                    'Jurídica',             # FIXO
                    cnpj,                   # pessoa_juridica.cnpj
                    telefone,               # usuario.telefone
                    email,                  # usuario.email
                    cidade,                 # endereco.cidade
                    estado,                 # endereco.estado
                    dados.get('certificado_credenciado', False),
                    dados.get('marca_credenciada'),
                    dados.get('numero_credenciamento'),
                    dados.get('validade_credenciamento'),
                    dados.get('especialidades'),
                    dados.get('observacoes')
                ))
                
                row = cur.fetchone()
                if row:
                    columns = [desc[0] for desc in cur.description]
                    resultado = dict(zip(columns, row))
                    
                    logger.info(f"✅ Novo credenciamento CRIADO: id_credenciamento={resultado['id_credenciamento']} para id_prestador={id_prestador}")
                    
                    return {
                        "success": True,
                        "data": _serialize_datetime(resultado),
                        "message": "Credenciamento criado com sucesso"
                    }

        except psycopg2.IntegrityError as e:
            logger.error(f"❌ Erro de integridade: {str(e)}")
            # 🔥 A UNIQUE constraint vai capturar duplicatas
            if "unique_prestador_marca_numero" in str(e):
                return {
                    "success": False, 
                    "error": "Já existe um credenciamento com esta marca e número para este prestador"
                }
            return {"success": False, "error": "Dados inválidos ou duplicados"}
            
        except Exception as e:
            logger.error(f"❌ Erro ao criar credenciamento: {str(e)}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}

    def listar_credenciamentos_prestador(self, prestador_id: int) -> Dict[str, Any]:
        """Lista todos os credenciamentos de um prestador específico"""
        try:
            with self.conn.cursor() as cur:
                query = sql.SQL("""
                    SELECT * FROM credenciamento_prestador
                    WHERE id_prestador = %s
                    ORDER BY data_criacao DESC;
                """)
                
                cur.execute(query, (prestador_id,))
                rows = cur.fetchall()
                
                if rows:
                    columns = [desc[0] for desc in cur.description]
                    resultados = []
                    
                    for row in rows:
                        resultado = dict(zip(columns, row))
                        resultados.append(_serialize_datetime(resultado))
                    
                    return {
                        "success": True,
                        "data": resultados,
                        "total": len(resultados)
                    }
                else:
                    return {
                        "success": True,
                        "data": [],
                        "total": 0
                    }

        except Exception as e:
            logger.error(f"❌ Erro ao listar credenciamentos do prestador: {str(e)}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}

    def obter_credenciamento_por_id(self, credenciamento_id: int) -> Dict[str, Any]:
        """Obtém um credenciamento específico pelo id_credenciamento"""
        try:
            with self.conn.cursor() as cur:
                query = sql.SQL("""
                    SELECT * FROM credenciamento_prestador
                    WHERE id_credenciamento = %s;
                """)
                
                cur.execute(query, (credenciamento_id,))
                row = cur.fetchone()
                
                if row:
                    columns = [desc[0] for desc in cur.description]
                    resultado = dict(zip(columns, row))
                    
                    return {
                        "success": True,
                        "data": _serialize_datetime(resultado)
                    }
                else:
                    return {
                        "success": False,
                        "error": "Credenciamento não encontrado"
                    }

        except Exception as e:
            logger.error(f"❌ Erro ao obter credenciamento por ID: {str(e)}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}

    def atualizar_credenciamento(self, credenciamento_id: int, dados: Dict[str, Any]) -> Dict[str, Any]:
        """Atualiza um credenciamento específico"""
        try:
            with self.conn.cursor() as cur:

                campos_atualizacao = []
                params = []

                if 'certificado_credenciado' in dados:
                    campos_atualizacao.append("certificado_credenciado = %s")
                    params.append(dados['certificado_credenciado'])
                
                if 'marca_credenciada' in dados:
                    campos_atualizacao.append("marca_credenciada = %s")
                    params.append(dados['marca_credenciada'])
                
                if 'numero_credenciamento' in dados:
                    campos_atualizacao.append("numero_credenciamento = %s")
                    params.append(dados['numero_credenciamento'])
                
                if 'validade_credenciamento' in dados:
                    campos_atualizacao.append("validade_credenciamento = %s")
                    params.append(dados['validade_credenciamento'])
                
                if 'especialidades' in dados:
                    campos_atualizacao.append("especialidades = %s")
                    params.append(dados['especialidades'])
                
                if 'observacoes' in dados:
                    campos_atualizacao.append("observacoes = %s")
                    params.append(dados['observacoes'])
                
                # 🔥 SEMPRE atualizar data_atualizacao
                campos_atualizacao.append("data_atualizacao = NOW()")
                
                # 🔥 VERIFICAR SE HÁ CAMPOS PARA ATUALIZAR
                if len(campos_atualizacao) == 1:  # Só tem data_atualizacao
                    return {"success": False, "error": "Nenhum campo fornecido para atualização"}

                query = sql.SQL("""
                    UPDATE credenciamento_prestador SET
                        {campos}
                    WHERE id_credenciamento = %s
                    RETURNING *;
                """).format(
                    campos=sql.SQL(", ").join(map(sql.SQL, campos_atualizacao))
                )

                params.append(credenciamento_id)
                cur.execute(query, params)
                
                row = cur.fetchone()
                if row:
                    columns = [desc[0] for desc in cur.description]
                    resultado = dict(zip(columns, row))
                    
                    logger.info(f"Credenciamento ATUALIZADO: {credenciamento_id}")
                    
                    return {
                        "success": True,
                        "data": _serialize_datetime(resultado),
                        "message": "Credenciamento atualizado com sucesso"
                    }
                else:
                    return {"success": False, "error": "Credenciamento não encontrado"}

        except psycopg2.IntegrityError as e:
            logger.error(f"❌ Erro de integridade: {str(e)}")
            if "unique_prestador_marca_numero" in str(e):
                return {
                    "success": False, 
                    "error": "Já existe um credenciamento com esta marca e número para este prestador"
                }
            return {"success": False, "error": "Dados inválidos ou duplicados"}
        except Exception as e:
            logger.error(f"❌ Erro ao atualizar credenciamento: {str(e)}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}

    def excluir_credenciamento(self, credenciamento_id: int) -> Dict[str, Any]:
        """Exclui um credenciamento específico"""
        try:
            with self.conn.cursor() as cur:
                # Verificar se existe
                cur.execute("SELECT id_credenciamento FROM credenciamento_prestador WHERE id_credenciamento = %s", (credenciamento_id,))
                if not cur.fetchone():
                    return {"success": False, "error": "Credenciamento não encontrado"}
                
                # Excluir
                cur.execute("DELETE FROM credenciamento_prestador WHERE id_credenciamento = %s", (credenciamento_id,))
                
                logger.info(f"✅ Credenciamento excluído: {credenciamento_id}")
                
                return {
                    "success": True,
                    "message": "Credenciamento excluído com sucesso"
                }

        except Exception as e:
            logger.error(f"❌ Erro ao excluir credenciamento: {str(e)}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}

    def obter_credenciamento(self, prestador_id: int) -> Dict[str, Any]:
        """Obtém o credenciamento mais recente de um prestador (método legado)"""
        try:
            with self.conn.cursor() as cur:
                query = sql.SQL("""
                    SELECT * FROM credenciamento_prestador
                    WHERE id_prestador = %s
                    ORDER BY data_criacao DESC
                    LIMIT 1;
                """)
                
                cur.execute(query, (prestador_id,))
                row = cur.fetchone()
                
                if row:
                    columns = [desc[0] for desc in cur.description]
                    resultado = dict(zip(columns, row))
                    
                    return {
                        "success": True,
                        "data": _serialize_datetime(resultado)
                    }
                else:
                    return {
                        "success": False,
                        "error": "Credenciamento não encontrado"
                    }

        except Exception as e:
            logger.error(f"❌ Erro ao obter credenciamento: {str(e)}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}

    def listar_credenciamentos(self, filtros: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Lista todos os credenciamentos com filtros opcionais"""
        try:
            with self.conn.cursor() as cur:
                base_query = """
                    SELECT c.*, u.nome as nome_usuario 
                    FROM credenciamento_prestador c
                    LEFT JOIN usuario u ON c.id_prestador = u.id_usuario
                """
                
                where_clauses = []
                params = []
                
                if filtros:
                    if filtros.get('certificado_credenciado') is not None:
                        where_clauses.append("c.certificado_credenciado = %s")
                        params.append(filtros['certificado_credenciado'])
                    
                    if filtros.get('marca_credenciada'):
                        where_clauses.append("c.marca_credenciada ILIKE %s")
                        params.append(f"%{filtros['marca_credenciada']}%")
                    
                    if filtros.get('cidade'):
                        where_clauses.append("c.cidade ILIKE %s")
                        params.append(f"%{filtros['cidade']}%")
                    
                    if filtros.get('estado'):
                        where_clauses.append("c.estado = %s")
                        params.append(filtros['estado'])
                
                if where_clauses:
                    base_query += " WHERE " + " AND ".join(where_clauses)
                
                base_query += " ORDER BY c.data_criacao DESC"
                
                cur.execute(base_query, params)
                rows = cur.fetchall()
                
                if rows:
                    columns = [desc[0] for desc in cur.description]
                    resultados = []
                    
                    for row in rows:
                        resultado = dict(zip(columns, row))
                        resultados.append(_serialize_datetime(resultado))
                    
                    return {
                        "success": True,
                        "data": resultados,
                        "total": len(resultados)
                    }
                else:
                    return {
                        "success": True,
                        "data": [],
                        "total": 0
                    }

        except Exception as e:
            logger.error(f"❌ Erro ao listar credenciamentos: {str(e)}")
            return {"success": False, "error": f"Erro interno: {str(e)}"}

    def __del__(self):
        """Fechar conexão ao destruir objeto"""
        if hasattr(self, 'conn'):
            self.conn.close()