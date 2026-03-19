from flask import Blueprint, render_template
from config import Config

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """Página principal"""
    return render_template('index.html', public_key=Config.PUBLIC_KEY)