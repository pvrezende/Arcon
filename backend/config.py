import os
from dotenv import load_dotenv

# Carrega variáveis do arquivo .env
load_dotenv()

# Configurações do banco de dados
DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'port': os.getenv('DB_PORT'),
    'database': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'options': '-c client_encoding=utf8'
}

# Você pode adicionar outras configurações aqui
APP_NAME = "Sistema ARCON"