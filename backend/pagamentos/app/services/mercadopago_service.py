import mercadopago
from config import Config
from app.services.payment_utils import (
    create_payment_data, 
    create_fallback_installments,
    map_payment_method
)

class MercadoPagoService:
    def __init__(self):
        self.sdk = mercadopago.SDK(Config.ACCESS_TOKEN)
    
    def process_payment(self, data):
        """Processar pagamento"""
        payment_data = create_payment_data(data)
        
        print("💳 Processando pagamento:", payment_data)
        
        # Processar pagamento
        payment_response = self.sdk.payment().create(payment_data)
        payment = payment_response["response"]
        
        print("✅ Resposta do pagamento:", payment.get('status'), payment.get('status_detail'))
        
        # Construir resposta
        response_data = {
            'status': payment.get('status'),
            'id': payment.get('id'),
            'external_reference': payment.get('external_reference'),
            'transaction_amount': payment.get('transaction_amount')
        }
        
        # Adicionar status_detail apenas se existir
        if 'status_detail' in payment:
            response_data['status_detail'] = payment['status_detail']
            
        return response_data
    
    def get_payment_methods(self, bin_number):
        """Obter métodos de pagamento"""
        print(f"🔍 Buscando métodos para BIN: {bin_number}")
        
        payment_methods = self.sdk.payment_methods().list_all()
        
        # Filtrar manualmente
        all_methods = payment_methods.get('response', [])
        filtered_methods = []
        
        for method in all_methods:
            if (method.get('payment_type_id') == 'credit_card' and 
                method.get('status') == 'active'):
                filtered_methods.append(method)
        
        print(f"✅ Métodos encontrados: {len(filtered_methods)}")
        
        return {
            'success': True,
            'payment_methods': filtered_methods[:1]
        }
    
    def get_installments(self, bin_number, amount):
        """Obter parcelas"""
        print(f"🔍 Buscando parcelas para BIN: {bin_number}, Valor: {amount}")
        
        # Usar fallback para simplificar
        return {
            'success': True,
            'installments': create_fallback_installments(amount)
        }