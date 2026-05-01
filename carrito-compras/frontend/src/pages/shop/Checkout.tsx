import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCartStore } from '../../stores/cartStore';
import { ordenService } from '../../services/orden.service';
import { cuponService } from '../../services/cupon.service';
import { pagoService } from '../../services/pago.service';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const checkoutSchema = z.object({
  direccion: z.string().min(5, 'La dirección es muy corta'),
  ciudad: z.string().min(2, 'La ciudad es requerida'),
  metodoPago: z.enum(['tarjeta', 'transferencia', 'contraentrega']),
});

const paymentSchema = z.object({
  nombreTarjeta: z.string().min(3, 'Nombre requerido'),
  numeroTarjeta: z.string().length(16, 'Deben ser 16 dígitos'),
  expiracion: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Formato MM/YY'),
  cvv: z.string().min(3, 'Mínimo 3 dígitos').max(4, 'Máximo 4 dígitos'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;
type PaymentFormData = z.infer<typeof paymentSchema>;

export default function Checkout() {
  const { items, total, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [orderData, setOrderData] = useState<CheckoutFormData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({ 
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      metodoPago: 'tarjeta'
    }
  });

  const { register: registerPayment, handleSubmit: handleSubmitPayment, formState: { errors: paymentErrors } } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema)
  });

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsValidating(true);
    try {
      const res = await cuponService.validar(couponCode);
      if (res.success) {
        setCouponApplied(res.data);
        toast.success('¡Cupón aplicado!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Cupón inválido');
      setCouponApplied(null);
    } finally {
      setIsValidating(false);
    }
  };

  const calculateDiscount = () => {
    if (!couponApplied) return 0;
    if (couponApplied.tipo === 'PORCENTAJE') {
      return total * (couponApplied.descuento / 100);
    }
    return Math.min(total, couponApplied.descuento);
  };

  const finalTotal = Math.max(0, total - calculateDiscount());

  const onShippingSubmit = (data: CheckoutFormData) => {
    setOrderData(data);
    if (data.metodoPago === 'tarjeta') {
      setStep('payment');
    } else {
      processOrder(data);
    }
  };

  const onPaymentSubmit = async (paymentData: PaymentFormData) => {
    if (!orderData) return;
    setIsProcessing(true);
    
    try {
      // 1. Crear la orden primero
      const resOrden = await ordenService.crear({
        cartId: 'current-cart',
        metodoPago: orderData.metodoPago.toUpperCase(),
        direccion: orderData.direccion,
        ciudad: orderData.ciudad,
        items: items,
        couponCode: couponApplied?.codigo
      });

      const ordenId = resOrden.data.id;

      // 2. Procesar el pago
      await pagoService.procesar({
        ordenId: ordenId,
        tarjeta: paymentData.numeroTarjeta,
        cvv: paymentData.cvv,
        expiracion: paymentData.expiracion,
        nombre: paymentData.nombreTarjeta
      });

      clearCart();
      toast.success('¡Pago exitoso y orden confirmada!');
      navigate('/mis-ordenes');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al procesar el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  const processOrder = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    try {
      await ordenService.crear({
        cartId: 'current-cart',
        metodoPago: data.metodoPago.toUpperCase(),
        direccion: data.direccion,
        ciudad: data.ciudad,
        items: items,
        couponCode: couponApplied?.codigo
      });
      clearCart();
      toast.success('¡Orden creada exitosamente!');
      navigate('/mis-ordenes');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al procesar orden');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 flex flex-col md:flex-row gap-8">
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Finalizar Compra</h1>

        {step === 'shipping' ? (
          <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="bg-blue-100 p-2 rounded-lg text-blue-600 text-sm">1</span>
                Información de Envío
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Completa</label>
                  <input 
                    {...register('direccion')}
                    className="w-full border rounded-xl shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Calle, Número, Depto"
                  />
                  {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion.message as string}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input 
                    {...register('ciudad')}
                    className="w-full border rounded-xl shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Ej: Madrid"
                  />
                  {errors.ciudad && <p className="text-red-500 text-xs mt-1">{errors.ciudad.message as string}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                  <select 
                    {...register('metodoPago')}
                    className="w-full border rounded-xl shadow-sm p-3 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="tarjeta">💳 Tarjeta de Crédito/Débito</option>
                    <option value="transferencia">🏦 Transferencia Bancaria</option>
                    <option value="contraentrega">💵 Pago contra entrega</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
            >
              Continuar al Pago
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="bg-blue-100 p-2 rounded-lg text-blue-600 text-sm">2</span>
                  Detalles de Pago
                </h2>
                <button 
                  onClick={() => setStep('shipping')}
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  ← Volver a envío
                </button>
              </div>

              <form onSubmit={handleSubmitPayment(onPaymentSubmit)} className="space-y-4">
                <div className="bg-gradient-to-br from-gray-800 to-black p-6 rounded-2xl text-white mb-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <span className="text-xl font-bold italic">PAYGATE</span>
                      <div className="flex gap-1">
                        <div className="w-8 h-8 bg-red-500 rounded-full opacity-80"></div>
                        <div className="w-8 h-8 bg-yellow-500 rounded-full -ml-4 opacity-80"></div>
                      </div>
                    </div>
                    <div className="text-lg tracking-widest mb-4 font-mono">
                      **** **** **** ****
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] uppercase opacity-50">Nombre</p>
                        <p className="text-sm tracking-wide">JUAN PÉREZ</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase opacity-50">Expira</p>
                        <p className="text-sm">MM/YY</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre en la Tarjeta</label>
                  <input 
                    {...registerPayment('nombreTarjeta')}
                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Como aparece en la tarjeta"
                  />
                  {paymentErrors.nombreTarjeta && <p className="text-red-500 text-xs mt-1">{paymentErrors.nombreTarjeta.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número de Tarjeta</label>
                  <input 
                    {...registerPayment('numeroTarjeta')}
                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                    placeholder="0000 0000 0000 0000"
                    maxLength={16}
                  />
                  {paymentErrors.numeroTarjeta && <p className="text-red-500 text-xs mt-1">{paymentErrors.numeroTarjeta.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiración</label>
                    <input 
                      {...registerPayment('expiracion')}
                      className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                    {paymentErrors.expiracion && <p className="text-red-500 text-xs mt-1">{paymentErrors.expiracion.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input 
                      {...registerPayment('cvv')}
                      className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="123"
                      maxLength={4}
                    />
                    {paymentErrors.cvv && <p className="text-red-500 text-xs mt-1">{paymentErrors.cvv.message}</p>}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Procesando Pago...
                    </>
                  ) : (
                    `Pagar $${finalTotal.toFixed(2)}`
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <div className="w-full md:w-80">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🛒</span> Tu Pedido
          </h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto mb-6 pr-2">
            {items.map(item => (
              <div key={item.id} className="flex gap-3">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-xl shrink-0">
                  📦
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{item.nombre}</p>
                  <p className="text-xs text-gray-500">x{item.cantidad} - ${(item.precio * item.cantidad).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span className="font-medium text-gray-800">${total.toFixed(2)}</span>
            </div>
            
            {couponApplied && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Descuento ({couponApplied.codigo})</span>
                <span className="font-medium">-${calculateDiscount().toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
              <span className="text-gray-800 font-bold">Total</span>
              <span className="text-2xl font-black text-blue-600">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cupón de Descuento</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="CÓDIGO"
                className="flex-1 border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                disabled={!!couponApplied}
              />
              {!couponApplied ? (
                <button
                  onClick={handleApplyCoupon}
                  disabled={isValidating || !couponCode}
                  className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-black transition-all disabled:opacity-50"
                >
                  {isValidating ? '...' : 'Aplicar'}
                </button>
              ) : (
                <button
                  onClick={() => { setCouponApplied(null); setCouponCode(''); }}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
