import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configurações do Supabase (SEM valores hardcoded)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Inicializar cliente
try:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Variáveis de ambiente do Supabase não definidas")

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Conexão com Supabase estabelecida")
except Exception as e:
    print(f"❌ Erro ao conectar com Supabase: {e}")
    supabase = None