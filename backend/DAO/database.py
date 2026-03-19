from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Carregar .env
load_dotenv()

class Database:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")

        if not url or not key:
            raise ValueError("Variáveis SUPABASE_URL ou SUPABASE_KEY não definidas")

        self.supabase: Client = create_client(url, key)

db = Database()