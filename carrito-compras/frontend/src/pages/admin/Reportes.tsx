import React, { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const Reportes = () => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const reportesOperacionales = [
    { id: 'ordenes', nombre: 'Listado de Órdenes', icono: '📦', requiereFechas: true },
    { id: 'inventario', nombre: 'Inventario Valorizado', icono: '💰', requiereFechas: false },
    { id: 'movimientos', nombre: 'Movimientos de Inventario', icono: '🔄', requiereFechas: true },
    { id: 'stock-bajo', nombre: 'Stock Bajo / Agotado', icono: '⚠️', requiereFechas: false },
    { id: 'pagos', nombre: 'Pagos Recibidos', icono: '💳', requiereFechas: true },
    { id: 'devoluciones', nombre: 'Devoluciones', icono: '🔙', requiereFechas: true },
    { id: 'factura', nombre: 'Factura Individual', icono: '📄', requiereOrderId: true },
    { id: 'comprobante', nombre: 'Comprobante Simplificado', icono: '🎫', requiereOrderId: true },
  ];

  const reportesGestion = [
    { id: 'rentabilidad', nombre: 'Rentabilidad por Producto', icono: '📈' },
    { id: 'ventas-categoria', nombre: 'Ventas por Categoría', icono: '🏷️' },
    { id: 'carritos', nombre: 'Comportamiento de Carritos', icono: '🛒' },
    { id: 'clientes', nombre: 'Reporte de Clientes (Segmentado)', icono: '👥' },
    { id: 'rotacion', nombre: 'Rotación de Inventario', icono: '♻️' },
    { id: 'ingresos-costos', nombre: 'Ingresos vs Costos', icono: '⚖️' },
  ];

  const descargarReporte = async (categoria: 'operacional' | 'gestion', tipo: string, requiereFechas: boolean = false, requiereOrderId: boolean = false) => {
    if (requiereFechas && (!fechaInicio || !fechaFin)) {
      toast.error('Por favor seleccione ambas fechas');
      return;
    }
    if (requiereOrderId && !orderId) {
      toast.error('Por favor ingrese un ID de Orden');
      return;
    }

    setLoading(tipo);
    try {
      let endpoint = `/reportes/${categoria}?tipo=${tipo}`;
      if (requiereFechas) endpoint += `&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
      if (requiereOrderId) endpoint += `&id=${orderId}`;
        
      const response = await api.get(endpoint, { responseType: 'blob' });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tipo}_reporte_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('Reporte generado correctamente');
    } catch (error: any) {
      console.error('Error descargando reporte:', error);
      toast.error('Error al generar el reporte.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="animate-fade-in p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Centro de Reportes</h1>
        <p className="text-gray-500">Genera reportes operativos y estratégicos para la toma de decisiones.</p>
      </div>
      
      {/* Filtros Globales */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Fecha Inicio</label>
          <input 
            type="date" 
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Fecha Fin</label>
          <input 
            type="date" 
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">ID de Orden (opcional)</label>
          <input 
            type="text" 
            placeholder="Ej: order_123..."
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Reportes Operacionales */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">📋</span>
            <h2 className="text-xl font-bold text-gray-800">Reportes Operativos</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reportesOperacionales.map((rep) => (
              <button
                key={rep.id}
                onClick={() => descargarReporte('operacional', rep.id, rep.requiereFechas, rep.requiereOrderId)}
                disabled={loading !== null}
                className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all text-left group disabled:opacity-50"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{rep.icono}</span>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{rep.nombre}</div>
                  <div className="text-xs text-gray-400">
                    {rep.requiereFechas ? 'Requiere rango de fechas' : rep.requiereOrderId ? 'Requiere ID de Orden' : 'Reporte instantáneo'}
                  </div>
                </div>
                {loading === rep.id && <div className="ml-auto animate-spin">⏳</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Reportes de Gestión */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 bg-green-50 text-green-600 rounded-lg">📊</span>
            <h2 className="text-xl font-bold text-gray-800">Reportes de Gestión (Estratégicos)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reportesGestion.map((rep) => (
              <button
                key={rep.id}
                onClick={() => descargarReporte('gestion', rep.id)}
                disabled={loading !== null}
                className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-green-500 hover:shadow-md transition-all text-left group disabled:opacity-50"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{rep.icono}</span>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{rep.nombre}</div>
                  <div className="text-xs text-gray-400">Análisis estratégico</div>
                </div>
                {loading === rep.id && <div className="ml-auto animate-spin">⏳</div>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
