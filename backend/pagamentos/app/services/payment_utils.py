def create_payment_data(data):
    """Criar estrutura de dados para pagamento"""
    payment_method_id = map_payment_method(data['payment_method_id'])
    
    payment_data = {
        "transaction_amount": float(data['transaction_amount']),
        "token": data['token'],
        "description": "Compra via Checkout Transparente",
        "installments": int(data['installments']),
        "payment_method_id": payment_method_id,
        "payer": {
            "email": data['email'],
            "identification": {
                "type": "CPF",
                "number": data['cpf'].replace('.', '').replace('-', '')
            }
        },
        "additional_info": {
            "items": [
                {
                    "id": "1",
                    "title": "PlayStation 5",
                    "description": "Console PlayStation 5 Edition",
                    "quantity": 1,
                    "unit_price": float(data['transaction_amount']),
                    "category_id": "games"
                }
            ],
            "payer": {
                "first_name": "Test",
                "last_name": "User",
                "phone": {
                    "area_code": "11",
                    "number": "999999999"
                },
                "address": {
                    "street_name": "Rua Teste",
                    "street_number": "123",
                    "zip_code": "01234000"
                }
            }
        }
    }
    
    return payment_data

def map_payment_method(payment_method):
    """Mapear payment_method_id correto"""
    payment_method_map = {
        'visa': 'visa',
        'master': 'master',
        'mastercard': 'master', 
        'amex': 'amex',
        'american express': 'amex'
    }
    
    return payment_method_map.get(payment_method.lower(), 'visa')

def create_fallback_installments(amount):
    """Criar parcelas de fallback"""
    installments = []
    
    for i in range(1, 13):
        installment_amount = amount / i
        total_amount = amount
        
        # Adicionar juros a partir de 7x
        if i > 6:
            total_amount = amount * 1.2  # 20% de juros
            installment_amount = total_amount / i
        
        installments.append({
            'installments': i,
            'installment_amount': round(installment_amount, 2),
            'total_amount': round(total_amount, 2),
            'installment_rate': 0 if i <= 6 else 20.0,
        })
    
    return [{
        'payment_method_id': 'credit_card',
        'payment_type_id': 'credit_card',
        'payer_costs': installments
    }]