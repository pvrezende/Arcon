import psycopg2
from config import DB_CONFIG

def ajustar_estrutura_banco():
    """Ajusta estrutura do banco conforme especificações"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print('✅ Conectado ao PostgreSQL!')
        
        with conn.cursor() as cursor:
            print('🔧 Ajustando estrutura do banco...')
            
            # 1. Criar FK entre usuario e endereco
            try:
                cursor.execute("""
                    ALTER TABLE usuario 
                    ADD CONSTRAINT fk_usuario_endereco 
                    FOREIGN KEY (id_endereco) REFERENCES endereco(id_endereco)
                """)
                print('✅ FK usuario -> endereco criada')
            except Exception as e:
                if 'already exists' in str(e):
                    print('ℹ️ FK usuario -> endereco já existe')
                else:
                    print(f'⚠️ Erro ao criar FK: {e}')
            
            # 2. Adicionar campo CPF na tabela usuario
            try:
                cursor.execute("ALTER TABLE usuario ADD COLUMN cpf VARCHAR(14)")
                print('✅ Campo CPF adicionado')
            except Exception as e:
                if 'already exists' in str(e):
                    print('ℹ️ Campo CPF já existe')
                else:
                    print(f'⚠️ Erro ao adicionar CPF: {e}')
            
            # 3. Adicionar campo CNPJ na tabela usuario  
            try:
                cursor.execute("ALTER TABLE usuario ADD COLUMN cnpj VARCHAR(18)")
                print('✅ Campo CNPJ adicionado')
            except Exception as e:
                if 'already exists' in str(e):
                    print('ℹ️ Campo CNPJ já existe')
                else:
                    print(f'⚠️ Erro ao adicionar CNPJ: {e}')
            
            # 4. Adicionar campo area_atuacao na tabela usuario
            try:
                cursor.execute("ALTER TABLE usuario ADD COLUMN area_atuacao VARCHAR(255)")
                print('✅ Campo area_atuacao adicionado')
            except Exception as e:
                if 'already exists' in str(e):
                    print('ℹ️ Campo area_atuacao já existe')
                else:
                    print(f'⚠️ Erro ao adicionar area_atuacao: {e}')
            
            # 5. Adicionar campo subtipo na tabela usuario (LOJA ou MANUAL para prestadores)
            try:
                cursor.execute("ALTER TABLE usuario ADD COLUMN subtipo VARCHAR(20)")
                print('✅ Campo subtipo adicionado')
            except Exception as e:
                if 'already exists' in str(e):
                    print('ℹ️ Campo subtipo já existe')
                else:
                    print(f'⚠️ Erro ao adicionar subtipo: {e}')
            
            # 6. Atualizar constraint para tornar id_endereco obrigatório
            try:
                cursor.execute("ALTER TABLE usuario ALTER COLUMN id_endereco SET NOT NULL")
                print('✅ Campo id_endereco tornado obrigatório')
            except Exception as e:
                print(f'⚠️ Aviso id_endereco: {e}')
            
            conn.commit()
            
            # Mostrar estrutura atualizada
            cursor.execute("""
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'usuario'
                ORDER BY ordinal_position
            """)
            columns = cursor.fetchall()
            print('\\n📋 Estrutura atualizada da tabela usuario:')
            for col in columns:
                print(f'  - {col[0]} ({col[1]}) - Nullable: {col[2]}')
        
        conn.close()
        return True
        
    except Exception as e:
        print(f'❌ Erro: {str(e)}')
        return False

if __name__ == "__main__":
    ajustar_estrutura_banco()