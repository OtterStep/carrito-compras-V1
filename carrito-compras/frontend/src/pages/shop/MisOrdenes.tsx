import React, { useEffect, useState } from 'react';
import { ordenService } from '../../services/orden.service';
import { configService } from '../../services/config.service';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { clienteService } from '../../services/cliente.service';

const MisOrdenes = () => {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tiempoCancelacion, setTiempoCancelacion] = useState(30);
  const [reviewForm, setReviewForm] = useState<{ productId: string, calificacion: number, comentario: string } | null>(null);

  useEffect(() => {
    cargarOrdenes();
    cargarConfig();
  }, []);

  const cargarConfig = async () => {
    try {
      const res = await configService.getAll();
      if (res.success) {
        const tiempo = res.data.find((c: any) => c.clave === 'TIEMPO_CANCELACION_MINUTOS');
        if (tiempo) setTiempoCancelacion(parseInt(tiempo.valor));
      }
    } catch (error) {
      console.error('Error cargando config:', error);
    }
  };

  const cargarOrdenes = async () => {
    try {
      const res = await ordenService.getMisOrdenes();
      setOrdenes(res.data);
    } catch (error) {
      toast.error('Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarOrden = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea cancelar esta orden?')) {
      try {
        await ordenService.cancelar(id);
        toast.success('Orden cancelada correctamente');
        cargarOrdenes();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Error al cancelar orden');
      }
    }
  };

  const puedeCancelar = (fechaCreacion: string) => {
    const diff = (new Date().getTime() - new Date(fechaCreacion).getTime()) / (1000 * 60);
    return diff <= tiempoCancelacion;
  };

  const handleDescargarFactura = async (id: string) => {
    try {
      const data = await ordenService.descargarFactura(id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Error al descargar factura');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm) return;
    try {
      await clienteService.agregarResena(reviewForm);
      toast.success('¡Gracias por tu reseña!');
      setReviewForm(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al enviar reseña');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando tus órdenes...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Mis Órdenes</h1>

      {ordenes.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
          <span className="text-5xl mb-4 block">📦</span>
          <p className="text-gray-500 text-lg">Aún no has realizado ninguna compra.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {ordenes.map((orden) => (
            <div key={orden.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Orden ID</p>
                  <p className="text-sm font-mono text-gray-600">{orden.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Fecha</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(orden.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total</p>
                  <p className="text-sm font-black text-blue-600">${orden.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Estado</p>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                    orden.estado === 'PAGADO' ? 'bg-green-100 text-green-600' : 
                    orden.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-600' : 
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {orden.estado}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDescargarFactura(orden.id)}
                    className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <span>📄</span> Factura
                  </button>
                  
                  {orden.estado === 'PENDIENTE' && puedeCancelar(orden.createdAt) && (
                    <button 
                      onClick={() => handleCancelarOrden(orden.id)}
                      className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors flex items-center gap-2"
                    >
                      <span>🚫</span> Cancelar
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Información de Envío</h3>
                    <p className="text-sm text-gray-700 font-medium">{orden.direccion || 'No especificada'}</p>
                    <p className="text-sm text-gray-500">{orden.ciudad || '-'}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Método de Pago</h3>
                    <p className="text-sm text-gray-700 font-medium flex items-center gap-2">
                      {orden.metodoPago === 'TARJETA' ? '💳 Tarjeta' : 
                       orden.metodoPago === 'TRANSFERENCIA' ? '🏦 Transferencia' : 
                       orden.metodoPago === 'CONTRAENTREGA' ? '💵 Contra entrega' : 
                       orden.metodoPago || '-'}
                    </p>
                    {orden.transactionId && (
                      <p className="text-[10px] font-mono text-gray-400 mt-1">Ref: {orden.transactionId}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {orden.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gray-50 rounded-lg flex items-center justify-center text-xl">
                        {item.product.imagen ? (
                          <img src={item.product.imagen} alt={item.product.nombre} className="h-full w-full object-cover rounded-lg" />
                        ) : '📦'}
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-bold text-gray-800">{item.product.nombre}</p>
                        <p className="text-xs text-gray-500">{item.cantidad} x ${item.precio.toFixed(2)}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-sm font-bold text-gray-700">${(item.cantidad * item.precio).toFixed(2)}</p>
                        {orden.estado === 'PAGADO' && (
                          <button 
                            onClick={() => setReviewForm({ productId: item.productId, calificacion: 5, comentario: '' })}
                            className="text-[10px] text-blue-600 font-bold hover:underline"
                          >
                            Dejar reseña
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Dejar Reseña</h2>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Calificación</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, calificacion: star })}
                      className={`text-2xl ${star <= reviewForm.calificacion ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tu comentario</label>
                <textarea
                  className="w-full border rounded-2xl p-4 text-sm h-32 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="¿Qué te pareció el producto?"
                  value={reviewForm.comentario}
                  onChange={(e) => setReviewForm({ ...reviewForm, comentario: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setReviewForm(null)}
                  className="flex-grow bg-gray-100 text-gray-600 py-3 rounded-2xl font-bold hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-grow bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700"
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisOrdenes;
