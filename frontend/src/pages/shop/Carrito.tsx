import React, { useState } from 'react';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { ordenService } from '../../services/orden.service';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Carrito = () => {
  const { items, total, removeItem, clearCart, addItem, updateQuantity } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para finalizar la compra', {
        icon: '🔒',
      });
      navigate('/login');
      return;
    }

    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-8 max-w-xs">¡Parece que aún no has agregado nada a tu carrito!</p>
        <Link to="/catalogo" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
          Explorar Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-4xl font-black text-gray-900">Tu Carrito</h1>
        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
          {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Lista de Productos */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="h-20 w-20 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                  {item.imagen ? (
                    <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">📦</span>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{item.nombre}</h2>
                  <p className="text-blue-600 font-bold">${item.precio.toFixed(2)} c/u</p>
                  <p className="text-xs text-gray-400">Stock disponible: {item.stock}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button 
                      onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                      className="px-3 py-1 hover:bg-gray-50 text-gray-500 font-bold disabled:opacity-30"
                      disabled={item.cantidad <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-1 font-bold text-gray-700 min-w-[40px] text-center">{item.cantidad}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                      className="px-3 py-1 hover:bg-gray-50 text-gray-500 font-bold disabled:opacity-30"
                      disabled={item.cantidad >= item.stock}
                    >
                      +
                    </button>
                  </div>
                  {item.cantidad >= item.stock && (
                    <span className="text-[10px] text-orange-500 font-bold">Máximo stock</span>
                  )}
                </div>
                <div className="text-right min-w-[100px]">
                  <p className="text-xl font-black text-gray-900">${(item.precio * item.cantidad).toFixed(2)}</p>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 text-xs font-bold hover:text-red-700 transition-colors"
                  >
                    ELIMINAR
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-4">
            <button 
              onClick={clearCart}
              className="text-gray-400 text-sm font-bold hover:text-red-500 transition-colors flex items-center gap-2"
            >
              🗑️ Vaciar todo el carrito
            </button>
          </div>
        </div>

        {/* Resumen de Compra */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 text-white rounded-3xl p-8 sticky top-24 shadow-xl">
            <h2 className="text-2xl font-black mb-6">Resumen</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal ({totalItems} items)</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Envío</span>
                <span className="text-green-400 font-bold">GRATIS</span>
              </div>
              <div className="h-px bg-gray-800 my-4"></div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total</span>
                <span className="text-3xl font-black text-blue-400">${total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
            >
              {isProcessing ? 'Procesando...' : 'COMPRAR AHORA'}
            </button>

            <p className="text-center text-gray-500 text-xs mt-6">
              Pago seguro y encriptado 🛡️
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carrito;
