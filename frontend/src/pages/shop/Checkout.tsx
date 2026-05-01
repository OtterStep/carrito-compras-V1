import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { ordenService } from '../../services/orden.service';
import { cuponService } from '../../services/cupon.service';
import { clienteService } from '../../services/cliente.service';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const checkoutSchema = z.object({
  direccion: z.string().min(5, 'La dirección es muy corta'),
  ciudad: z.string().min(2, 'La ciudad es requerida'),
  metodoPago: z.enum(['tarjeta', 'transferencia', 'billetera_digital']),
  // Campos de tarjeta
  nombreTarjeta: z.string().optional(),
  numeroTarjeta: z.string().optional(),
  expiracion: z.string().optional(),
  cvv: z.string().optional(),
  saveCard: z.boolean().default(false),
  useSavedCard: z.string().optional(),
  // Campos de transferencia
  comprobanteRef: z.string().optional(),
  // Campos de billetera digital
  numeroTelefono: z.string().optional(),
}).refine((data) => {
  if (data.metodoPago === 'tarjeta') {
    if (data.useSavedCard && data.useSavedCard !== 'new') return true;
    return !!data.nombreTarjeta && !!data.numeroTarjeta && !!data.expiracion && !!data.cvv;
  }
  if (data.metodoPago === 'transferencia') {
    return !!data.comprobanteRef;
  }
  if (data.metodoPago === 'billetera_digital') {
    return !!data.numeroTelefono;
  }
  return true;
}, {
  message: "Faltan datos requeridos para el método de pago seleccionado",
  path: ["metodoPago"]
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, total, clearCart } = useCartStore();
  const { user, isAuthenticated, login: loginAction } = useAuthStore();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  
  // Login fields for step 1
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Perfil y datos guardados
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [cardIsValid, setCardIsValid] = useState(false);
  const [isValidatingCard, setIsValidatingCard] = useState(false);
  const [addressMode, setAddressMode] = useState<'saved' | 'new'>('new');

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<CheckoutFormData>({ 
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      metodoPago: 'tarjeta',
      useSavedCard: 'new'
    }
  });

  const metodoPago = watch('metodoPago');
  const useSavedCard = watch('useSavedCard');
  const numeroTarjeta = watch('numeroTarjeta');
  const direccion = watch('direccion');
  const ciudad = watch('ciudad');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await clienteService.getPerfil();
        if (profileRes.success) {
          const addresses = profileRes.data.addresses || [];
          setSavedAddresses(addresses);
          if (addresses.length > 0) {
            setAddressMode('saved');
            setValue('direccion', addresses[0].direccion);
            setValue('ciudad', addresses[0].ciudad);
          }
        }
        const cardsRes = await clienteService.getTarjetas();
        if (cardsRes.success) {
          setSavedCards(cardsRes.data || []);
        }
      } catch (error) {
        console.error("Error fetching profile data", error);
      }
    };
    fetchData();
  }, [setValue]);

  // Validación de tarjeta (simulada)
  useEffect(() => {
    if (metodoPago === 'tarjeta' && useSavedCard === 'new' && numeroTarjeta?.length === 16) {
      setIsValidatingCard(true);
      const timer = setTimeout(() => {
        setCardIsValid(true);
        setIsValidatingCard(false);
        toast.success('Tarjeta válida', { id: 'card-valid' });
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCardIsValid(false);
    }
  }, [numeroTarjeta, metodoPago, useSavedCard]);

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

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1 && !isAuthenticated) {
      toast.error('Debes identificar tu cuenta para continuar');
      return;
    }
    if (currentStep === 2) {
      fieldsToValidate = ['direccion', 'ciudad'];
    } else if (currentStep === 3) {
      fieldsToValidate = ['metodoPago'];
      if (metodoPago === 'tarjeta' && useSavedCard === 'new') {
        fieldsToValidate.push('nombreTarjeta', 'numeroTarjeta', 'expiracion', 'cvv');
      } else if (metodoPago === 'transferencia') {
        fieldsToValidate.push('comprobanteRef');
      } else if (metodoPago === 'billetera_digital') {
        fieldsToValidate.push('numeroTelefono');
      }
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate as any);
      if (!isValid) return;
    }

    if (currentStep === 3 && metodoPago === 'tarjeta' && useSavedCard === 'new' && !cardIsValid) {
      toast.error('La tarjeta no es válida');
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Ingresa tu email y contraseña');
      return;
    }
    setIsLoggingIn(true);
    try {
      await loginAction(loginEmail, loginPassword);
      toast.success('¡Identificación exitosa!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al identificar cuenta');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    try {
      if (data.metodoPago === 'tarjeta' && data.useSavedCard === 'new' && data.saveCard) {
        setProcessingStep('Guardando tarjeta...');
        await clienteService.agregarTarjeta({
          nombre: data.nombreTarjeta,
          numero: data.numeroTarjeta,
          expiracion: data.expiracion,
          cvv: data.cvv
        });
      }

      if (data.metodoPago === 'tarjeta') {
        setProcessingStep('Procesando pago con tarjeta...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success('Pago autorizado correctamente 💳');
      } else if (data.metodoPago === 'transferencia') {
        setProcessingStep('Verificando referencia...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success('Referencia registrada.');
      } else if (data.metodoPago === 'billetera_digital') {
        setProcessingStep('Validando Yape...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success('Pago con Yape recibido 📱');
      }

      setProcessingStep('Creando tu orden...');
      await ordenService.crear({
        cartId: 'current-cart',
        metodoPago: data.metodoPago.toUpperCase(),
        items: items,
        couponCode: couponApplied?.codigo,
        direccion: data.direccion,
        ciudad: data.ciudad
      });
      
      setProcessingStep('¡Todo listo!');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      clearCart();
      toast.success('¡Orden creada exitosamente!', { duration: 5000 });
      navigate('/mis-ordenes');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al procesar orden');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const steps = [
    { id: 1, name: 'Identificación', icon: '👤' },
    { id: 2, name: 'Envío', icon: '🚚' },
    { id: 3, name: 'Pago', icon: '💳' },
    { id: 4, name: 'Revisión', icon: '📋' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-black mb-8 text-center text-gray-900 tracking-tight">Finalizar Compra</h1>
      
      {/* Stepper */}
      <div className="mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>
        <div className="flex justify-between relative z-10">
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center">
              <div 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-500 border-4 ${
                  currentStep >= s.id 
                    ? 'bg-blue-600 border-blue-100 text-white scale-110 shadow-lg shadow-blue-200' 
                    : 'bg-white border-gray-100 text-gray-400'
                }`}
              >
                {currentStep > s.id ? '✅' : s.icon}
              </div>
              <span className={`mt-3 text-[10px] font-black uppercase tracking-widest ${currentStep >= s.id ? 'text-blue-600' : 'text-gray-400'}`}>
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* STEP 1: Identificación */}
            {currentStep === 1 && (
              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-black mb-8 flex items-center gap-3 text-gray-800">
                  <span className="bg-blue-100 p-2 rounded-xl text-blue-600">👤</span> Identificación del Cliente
                </h2>
                
                {!isAuthenticated ? (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">¿Ya tienes una cuenta?</p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Email</label>
                          <input 
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full bg-white border-2 border-blue-50 rounded-2xl p-4 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all"
                            placeholder="tu@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Contraseña</label>
                          <input 
                            type="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full bg-white border-2 border-blue-50 rounded-2xl p-4 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleLogin}
                          disabled={isLoggingIn}
                          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {isLoggingIn ? 'IDENTIFICANDO...' : 'INICIAR SESIÓN'}
                        </button>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">O continúa como invitado si prefieres, pero perderás tus beneficios</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Datos de tu cuenta</p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl text-white font-black">
                          {user?.nombre?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="text-lg font-black text-gray-800">{user?.nombre || 'Cargando...'}</p>
                          <p className="text-sm font-bold text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 font-medium">Estás comprando como cliente registrado. Tus datos de envío y pago se cargarán automáticamente en los siguientes pasos.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={nextStep}
                    className={`bg-gray-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200 flex items-center gap-2 ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    CONTINUAR A ENVÍO <span>➡️</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Envío */}
            {currentStep === 2 && (
              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-xl font-black mb-8 flex items-center gap-3 text-gray-800">
                  <span className="bg-purple-100 p-2 rounded-xl text-purple-600">🚚</span> Información de Envío
                </h2>
                
                <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
                  <button
                    type="button"
                    onClick={() => setAddressMode('new')}
                    className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${addressMode === 'new' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Nueva Dirección
                  </button>
                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAddressMode('saved')}
                      className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${addressMode === 'saved' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      Dirección Guardada
                    </button>
                  )}
                </div>

                {addressMode === 'saved' && savedAddresses.length > 0 && (
                  <div className="mb-8 space-y-4">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Selecciona una de tus direcciones</label>
                    <div className="grid grid-cols-1 gap-3">
                      {savedAddresses.map(addr => (
                        <div 
                          key={addr.id}
                          onClick={() => {
                            setValue('direccion', addr.direccion);
                            setValue('ciudad', addr.ciudad);
                          }}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${watch('direccion') === addr.direccion ? 'border-blue-500 bg-blue-50' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                        >
                          <p className="font-bold text-gray-800">{addr.direccion}</p>
                          <p className="text-xs text-gray-500 font-bold uppercase">{addr.ciudad}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Dirección Completa</label>
                    <div className="relative">
                      <input 
                        {...register('direccion')}
                        className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all"
                        placeholder="Calle, Número, Depto, Referencia"
                      />
                      <div className="absolute right-4 top-4 text-[10px] text-blue-500 font-black italic bg-blue-50 px-2 py-1 rounded-lg">AUTOCOMPLETE ACTIVADO</div>
                    </div>
                    {errors.direccion && <p className="text-red-500 text-xs font-bold mt-2 ml-2">{errors.direccion.message as string}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Ciudad</label>
                    <input 
                      {...register('ciudad')}
                      className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all"
                      placeholder="Ej: Madrid"
                    />
                    {errors.ciudad && <p className="text-red-500 text-xs font-bold mt-2 ml-2">{errors.ciudad.message as string}</p>}
                  </div>
                </div>

                <div className="mt-12 flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="text-gray-400 font-black hover:text-gray-600 transition-all flex items-center gap-2 px-6"
                  >
                    <span>⬅️</span> ATRÁS
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200 flex items-center gap-2"
                  >
                    MÉTODO DE PAGO <span>➡️</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Pago */}
            {currentStep === 3 && (
              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-xl font-black mb-8 flex items-center gap-3 text-gray-800">
                  <span className="bg-orange-100 p-2 rounded-xl text-orange-600">💳</span> Método de Pago y Cupones
                </h2>

                {/* Cupón en el paso de pago */}
                <div className="mb-10 bg-orange-50/50 p-6 rounded-3xl border-2 border-orange-100">
                  <label className="block text-[10px] font-black text-orange-400 uppercase tracking-widest mb-3 ml-2">¿Tienes un cupón?</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="CÓDIGO"
                      className="flex-1 bg-white border-2 border-orange-100 rounded-2xl p-4 focus:ring-orange-500 focus:border-orange-500 outline-none font-bold text-gray-700 transition-all"
                      disabled={!!couponApplied}
                    />
                    {!couponApplied ? (
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={isValidating || !couponCode}
                        className="bg-orange-600 text-white px-6 py-4 rounded-2xl font-black hover:bg-orange-700 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isValidating ? '...' : 'APLICAR'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setCouponApplied(null); setCouponCode(''); }}
                        className="bg-red-100 text-red-600 px-6 py-4 rounded-2xl font-black hover:bg-red-200 transition-all"
                      >
                        QUITAR
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Selecciona cómo deseas pagar</label>
                  <select 
                    {...register('metodoPago')}
                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all appearance-none cursor-pointer"
                  >
                    <option value="tarjeta">💳 TARJETA DE CRÉDITO</option>
                    <option value="billetera_digital">📱 BILLETERA DIGITAL (YAPE)</option>
                    <option value="transferencia">🏦 TRANSFERENCIA BANCARIA</option>
                  </select>
                </div>

                {metodoPago === 'tarjeta' && (
                  <div className={`p-6 rounded-3xl border-2 transition-all duration-500 ${cardIsValid ? 'bg-green-50 border-green-400 shadow-lg shadow-green-100' : 'bg-blue-50/30 border-blue-50'}`}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className={`font-black text-sm uppercase tracking-widest flex items-center gap-3 ${cardIsValid ? 'text-green-600' : 'text-blue-600'}`}>
                        <span className={`${cardIsValid ? 'bg-green-600' : 'bg-blue-600'} text-white p-1 rounded-lg text-xs`}>
                          {cardIsValid ? '✅' : '🔒'}
                        </span> 
                        {cardIsValid ? 'Tarjeta Validada' : 'Datos de Tarjeta'}
                      </h3>
                      {isValidatingCard && (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    
                    {savedCards.length > 0 && (
                      <div className="mb-6">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-2">Usar Tarjeta Guardada</label>
                        <select 
                          {...register('useSavedCard')}
                          className="w-full bg-white border-2 border-blue-100 rounded-2xl p-4 outline-none font-bold text-gray-700"
                          onChange={(e) => {
                            setValue('useSavedCard', e.target.value);
                            setCardIsValid(e.target.value !== 'new');
                          }}
                        >
                          <option value="new">+ Registrar nueva tarjeta</option>
                          {savedCards.map(card => (
                            <option key={card.id} value={card.id}>**** **** **** {card.numero.slice(-4)} ({card.nombre})</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {useSavedCard === 'new' && (
                      <div className="space-y-4">
                        <input {...register('nombreTarjeta')} className="w-full bg-white border-2 border-blue-100 rounded-2xl p-4 font-bold" placeholder="NOMBRE EN TARJETA" />
                        <input {...register('numeroTarjeta')} maxLength={16} className="w-full bg-white border-2 border-blue-100 rounded-2xl p-4 font-bold" placeholder="0000 0000 0000 0000" />
                        <div className="grid grid-cols-2 gap-4">
                          <input {...register('expiracion')} maxLength={5} className="w-full bg-white border-2 border-blue-100 rounded-2xl p-4 font-bold" placeholder="MM/AA" />
                          <input {...register('cvv')} maxLength={4} className="w-full bg-white border-2 border-blue-100 rounded-2xl p-4 font-bold" placeholder="CVV" />
                        </div>
                        <label className="flex items-center gap-3 p-4 bg-white/50 rounded-2xl border-2 border-blue-100 cursor-pointer">
                          <input type="checkbox" {...register('saveCard')} className="w-5 h-5 rounded-lg border-2 border-blue-400 text-blue-600 focus:ring-blue-500" />
                          <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Guardar esta tarjeta para futuras compras</span>
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {metodoPago === 'billetera_digital' && (
                  <div className="p-8 bg-blue-50 rounded-3xl border-2 border-blue-100">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-3xl">📱</div>
                      <div>
                        <h3 className="font-black text-blue-900 uppercase tracking-tight">Pago con Yape</h3>
                        <p className="text-xs font-bold text-blue-600 uppercase">Rápido y Seguro</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-2xl border-2 border-blue-100 text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Número de destino</p>
                        <p className="text-3xl font-black text-blue-900 tracking-tighter">987 654 321</p>
                        <p className="text-xs font-bold text-gray-500 mt-1 uppercase">Titular: Carrito Compras SAC</p>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 ml-2">Tu número de celular Yape</label>
                        <input 
                          {...register('numeroTelefono')}
                          className="w-full bg-white border-2 border-blue-100 rounded-2xl p-4 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold text-gray-700"
                          placeholder="9XXXXXXXX"
                          maxLength={9}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {metodoPago === 'transferencia' && (
                  <div className="p-8 bg-blue-50 rounded-3xl border-2 border-blue-100">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl text-white">🏦</div>
                      <div>
                        <h3 className="font-black text-blue-900 uppercase tracking-tight">Transferencia Bancaria</h3>
                        <p className="text-xs font-bold text-blue-600 uppercase">BCP / BBVA / Interbank</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-2xl border-2 border-blue-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cuenta BCP Soles</p>
                        <p className="font-black text-blue-900">191-12345678-0-99</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">CCI</p>
                        <p className="font-black text-blue-900 text-sm">002-1911234567809954</p>
                      </div>
                      <input 
                        {...register('comprobanteRef')}
                        className="w-full bg-white border-2 border-blue-100 rounded-2xl p-4 font-bold"
                        placeholder="NÚMERO DE OPERACIÓN"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-12 flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="text-gray-400 font-black hover:text-gray-600 transition-all flex items-center gap-2 px-6"
                  >
                    <span>⬅️</span> ATRÁS
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200 flex items-center gap-2"
                  >
                    REVISAR PEDIDO <span>➡️</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Revisión */}
            {currentStep === 4 && (
              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-xl font-black mb-8 flex items-center gap-3 text-gray-800">
                  <span className="bg-green-100 p-2 rounded-xl text-green-600">📋</span> Revisión Final
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Dirección de Envío</p>
                      <p className="font-black text-gray-800">{direccion}</p>
                      <p className="text-xs font-bold text-gray-500 uppercase">{ciudad}</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Método de Pago</p>
                      <p className="font-black text-gray-800 uppercase">
                        {metodoPago === 'tarjeta' ? '💳 Tarjeta de Crédito' : 
                         metodoPago === 'billetera_digital' ? '📱 Yape' : '🏦 Transferencia'}
                      </p>
                      <p className="text-xs font-bold text-gray-500 uppercase">Estado: Listo para procesar</p>
                    </div>
                  </div>

                  <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-2xl shadow-gray-300">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-black text-xl">Total a Pagar</h3>
                      <span className="text-3xl font-black">${finalTotal.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-400 font-medium mb-8">Al hacer clic en el botón inferior, confirmas que toda la información es correcta y autorizas el cargo por el total indicado.</p>
                    
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-white text-gray-900 py-6 rounded-2xl font-black text-xl hover:bg-blue-50 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isProcessing ? (
                        <>
                          <div className="h-6 w-6 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                          <span>{processingStep}</span>
                        </>
                      ) : (
                        <>CONFIRMAR Y PAGAR <span>✨</span></>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-8 flex justify-start">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={isProcessing}
                    className="text-gray-400 font-black hover:text-gray-600 transition-all flex items-center gap-2 px-6"
                  >
                    <span>⬅️</span> MODIFICAR DATOS
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Sidebar Resumen (Visible en todos los pasos) */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 sticky top-8">
            <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-gray-800">
              <span className="bg-blue-100 p-2 rounded-xl text-blue-600">🛒</span> Tu Carrito
            </h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                      {item.imagen ? (
                        <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm leading-tight line-clamp-1">{item.nombre}</p>
                      <p className="text-[10px] font-black text-blue-500 uppercase">x{item.cantidad}</p>
                    </div>
                  </div>
                  <span className="font-black text-gray-900">${(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-dashed pt-6 mt-6 space-y-3">
              <div className="flex justify-between text-gray-500 font-bold text-sm">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              {couponApplied && (
                <div className="flex justify-between text-green-600 font-bold bg-green-50 p-3 rounded-2xl text-sm">
                  <span>🎟️ Descuento</span>
                  <span>-${calculateDiscount().toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center font-black text-xl text-blue-600 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-400 uppercase tracking-widest">Total</span>
                <span className="text-2xl">${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-center text-gray-400 text-[10px] font-black uppercase tracking-widest mt-8 flex items-center justify-center gap-2">
        <span className="text-green-500">🛡️</span> PAGO 100% SEGURO Y ENCRIPTADO
      </p>
    </div>
  );
}
