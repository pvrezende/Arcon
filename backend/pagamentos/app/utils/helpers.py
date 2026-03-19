from flask import jsonify

def validate_payment_data(data):
    """Validar dados do pagamento"""
    required_fields = ['token', 'transaction_amount', 'installments', 'payment_method_id', 'email', 'cpf']
    
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'Campo obrigatório: {field}'}), 400
    
    return None