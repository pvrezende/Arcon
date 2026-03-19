from flask import Blueprint, request, jsonify, current_app
from app.services.mercadopago_service import MercadoPagoService
from app.utils.helpers import validate_payment_data

payments_bp = Blueprint('payments', __name__)
mercado_pago_service = MercadoPagoService()

@payments_bp.route('/process_payment', methods=['POST'])
def process_payment():
    """Processar pagamento com cartão"""
    try:
        data = request.get_json()
        print("📦 Dados recebidos para pagamento:", data)
        
        # Validar dados
        validation_error = validate_payment_data(data)
        if validation_error:
            return validation_error
        
        # Processar pagamento
        payment_response = mercado_pago_service.process_payment(data)
        
        return jsonify(payment_response)
        
    except Exception as e:
        print(f"❌ Erro ao processar pagamento: {str(e)}")
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/get_payment_methods', methods=['POST'])
def get_payment_methods():
    """Obter métodos de pagamento"""
    try:
        data = request.get_json()
        card_number = data.get('card_number', '').replace(' ', '')
        
        if len(card_number) < 6:
            return jsonify({'error': 'Número do cartão muito curto'}), 400
            
        payment_methods = mercado_pago_service.get_payment_methods(card_number[:6])
        return jsonify(payment_methods)
        
    except Exception as e:
        print(f"❌ Erro ao buscar métodos: {str(e)}")
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/get_installments', methods=['POST'])
def get_installments():
    """Obter parcelas"""
    try:
        data = request.get_json()
        card_number = data.get('card_number', '').replace(' ', '')
        amount = float(data.get('amount', 499.00))
        
        if len(card_number) < 6:
            return jsonify({'error': 'Número do cartão muito curto'}), 400
            
        installments = mercado_pago_service.get_installments(card_number[:6], amount)
        return jsonify(installments)
        
    except Exception as e:
        print(f"❌ Erro ao buscar parcelas: {str(e)}")
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/webhook', methods=['POST'])
def webhook():
    """Webhook para notificações"""
    try:
        data = request.get_json()
        print("📦 Webhook recebido:", data)
        
        if data.get('type') == 'payment':
            payment_id = data['data']['id']
            print(f"💰 Processando webhook para pagamento: {payment_id}")
            
        return jsonify({'status': 'success'}), 200
        
    except Exception as e:
        print(f"❌ Erro no webhook: {str(e)}")
        return jsonify({'error': str(e)}), 500