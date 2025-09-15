import { Suspense } from 'react';
import OrderContent from './order-content';

// Loading component
function OrderLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 font-medium">Cargando detalles del pedido...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PedidoConfirmadoPage() {
  return (
    <Suspense fallback={<OrderLoadingFallback />}>
      <OrderContent />
    </Suspense>
  );
}
