from flask import Flask
import mercadopago
from config import Config

def create_app():
    app = Flask(__name__)
    
    # Configurações
    app.config.from_object(Config)
    
    # Inicializar SDK do Mercado Pago
    app.sdk = mercadopago.SDK(Config.ACCESS_TOKEN)
    
    # Registrar blueprints
    from app.routes.main import main_bp
    from app.routes.payments import payments_bp
    
    app.register_blueprint(main_bp)
    app.register_blueprint(payments_bp)
    
    return app