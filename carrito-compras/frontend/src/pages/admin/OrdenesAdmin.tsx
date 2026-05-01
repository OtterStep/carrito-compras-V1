import React, { useEffect, useState } from 'react';
import { ordenService } from '../../services/orden.service';
import { productoService } from '../../services/producto.service';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

const OrdenesAdmin = () => {
  const user = useAuthStore(state => state.user);
  const canCreate = user?.rol === 'ADMIN' || user?.rol === 'GERENTE_VENTAS';
  const isVendedor = user?.rol === 'VENDEDOR';

  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('TODAS');
  
  // Detalle de orden
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<any>(null);
  const [showDetalle, setShowDetalle] = useState(false);

  // Nueva Orden
  const [showNuevaOrden, setShowNuevaOrden] = useState(false);
  const [productosDisponibles, setProductosDisponibles] = useState<any[]>([]);
  const [nuevaOrdenData, setNuevaOrdenData] = useState({
    email: '',
    nombre: '',
    items: [] as any[],
    metodoPago: 'EFECTIVO'
  });

  useEffect(() => {
    loadOrdenes();
    loadProductos();
  }, []);

  const loadOrdenes = async () => {
    try {
      const data = await ordenService.getAll();
      setOrdenes(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      toast.error('Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  const loadProductos = async () => {
    try {
      const data = await productoService.getAll();
      setProductosDisponibles(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const handleDescargarFactura = async (id: string) => {
    try {
      const blob = await ordenService.descargarFactura(id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura-${id.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Error al descargar factura');
    }
  };

  const handleVerDetalle = async (id: string) => {
    try {
      const res = await ordenService.getById(id);
      setOrdenSeleccionada(res.data);
      setShowDetalle(true);
    } catch (error) {
      toast.error('Error al cargar detalle');
    }
  };

  const handleCrearOrdenAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaOrdenData.items.length === 0) return toast.error('Agregue al menos un producto');
    
    try {
      await ordenService.crearAdmin(nuevaOrdenData);
      toast.success('Orden creada exitosamente');
      setShowNuevaOrden(false);
      setNuevaOrdenData({ email: '', nombre: '', items: [], metodoPago: 'EFECTIVO' });
      loadOrdenes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear orden');
    }
  };

  const agregarItemANuevaOrden = (productoId: string) => {
    const prod = productosDisponibles.find(p => p.id === productoId);
    if (!prod) return;

    const exists = nuevaOrdenData.items.find(i => i.productId === productoId);
    if (exists) {
      setNuevaOrdenData({
        ...nuevaOrdenData,
        items: nuevaOrdenData.items.map(i => 
          i.productId === productoId ? { ...i, cantidad: i.cantidad + 1 } : i
        )
      });
    } else {
      setNuevaOrdenData({
        ...nuevaOrdenData,
        items: [...nuevaOrdenData.items, { productId: productoId, nombre: prod.nombre, cantidad: 1, precio: prod.precio }]
      });
    }
  };

  const exportarCSV = () => {
    const headers = ['ID', 'Cliente', 'Email', 'Total', 'Estado', 'Fecha'];
    const csvData = ordenes.map(o => [
      o.id,
      o.user?.nombre || 'N/A',
      o.user?.email || 'N/A',
      o.total.toFixed(2),
      o.estado,
      new Date(o.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...csvData].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ordenes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const ordenesFiltradas = filtroEstado === 'TODAS' 
    ? ordenes 
    : ordenes.filter(o => o.estado === filtroEstado);

  const handleEstadoChange = async (id: string, nuevoEstado: string) => {
    try {
      if (nuevoEstado === 'DEVUELTO') {
        const motivo = window.prompt('Motivo de la devolución:');
        if (!motivo) return;
        await ordenService.procesarDevolucion(id, motivo);
      } else {
        await ordenService.actualizarEstado(id, nuevoEstado);
      }
      loadOrdenes();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar el estado de la orden');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Cargando órdenes...</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Órdenes</h1>
        <div className="flex gap-4">
          {canCreate && (
            <button 
              onClick={() => setShowNuevaOrden(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
            >
              ➕ Nueva Orden
            </button>
          )}
          <select 
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="TODAS">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="PAGADO">Pagado</option>
            <option value="ENVIADO">Enviado</option>
            <option value="DEVUELTO">Devuelto</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
          <button 
            onClick={exportarCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-sm"
          >
            📊 Exportar CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Orden</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ordenesFiltradas.map((orden) => (
              <tr key={orden.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="font-mono">#{orden.id.substring(0, 8)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{orden.user?.nombre || 'Cliente'}</div>
                  <div className="text-xs text-gray-500">{orden.user?.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  ${orden.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${orden.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' : 
                      orden.estado === 'PAGADO' ? 'bg-green-100 text-green-800' : 
                      orden.estado === 'ENVIADO' ? 'bg-blue-100 text-blue-800' :
                      orden.estado === 'DEVUELTO' ? 'bg-purple-100 text-purple-800' :
                      orden.estado === 'CANCELADO' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                    {orden.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center gap-3">
                    <button 
                      onClick={() => handleVerDetalle(orden.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Ver detalle"
                    >
                      👁️
                    </button>
                    <button 
                      onClick={() => handleDescargarFactura(orden.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Descargar Factura"
                    >
                      📄
                    </button>
                    <select 
                      onChange={(e) => handleEstadoChange(orden.id, e.target.value)}
                      value={orden.estado}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="PAGADO">Pagado</option>
                      <option value="ENVIADO">Enviado</option>
                      {!isVendedor && <option value="DEVUELTO">Devolución</option>}
                      {!isVendedor && <option value="CANCELADO">Cancelar</option>}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Detalle */}
      {showDetalle && ordenSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Detalle de la Orden #{ordenSeleccionada.id.substring(0, 8)}</h2>
              <button onClick={() => setShowDetalle(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Cliente</h3>
                  <p className="text-gray-800 font-medium">{ordenSeleccionada.user?.nombre}</p>
                  <p className="text-gray-600 text-sm">{ordenSeleccionada.user?.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Estado y Pago</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    ordenSeleccionada.estado === 'PAGADO' ? 'bg-green-100 text-green-800' : 
                    ordenSeleccionada.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {ordenSeleccionada.estado}
                  </span>
                  <p className="text-gray-600 text-sm mt-2">ID: {ordenSeleccionada.id}</p>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Productos</h3>
              <div className="space-y-4">
                {ordenSeleccionada.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-4">
                      {item.product?.imagen && (
                        <img src={item.product.imagen} alt={item.product.nombre} className="w-12 h-12 object-cover rounded" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-800">{item.product?.nombre}</p>
                        <p className="text-sm text-gray-500">{item.cantidad} x ${item.precio}</p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-800">${(item.cantidad * item.precio).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 border-t pt-4 text-right">
                <p className="text-gray-600">Subtotal: ${(ordenSeleccionada.total / 1.15).toFixed(2)}</p>
                <p className="text-gray-600">IVA (15%): ${(ordenSeleccionada.total - (ordenSeleccionada.total / 1.15)).toFixed(2)}</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">Total: ${ordenSeleccionada.total.toFixed(2)}</p>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => handleDescargarFactura(ordenSeleccionada.id)}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Imprimir Factura
              </button>
              <button 
                onClick={() => setShowDetalle(false)}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Orden */}
      {showNuevaOrden && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Crear Nueva Orden (Admin)</h2>
              <button onClick={() => setShowNuevaOrden(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            
            <form onSubmit={handleCrearOrdenAdmin} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email del Cliente</label>
                  <input 
                    type="email" 
                    required
                    placeholder="cliente@ejemplo.com"
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={nuevaOrdenData.email}
                    onChange={e => setNuevaOrdenData({...nuevaOrdenData, email: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1">Si no existe, se creará un nuevo usuario.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Cliente</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Nombre Completo"
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={nuevaOrdenData.nombre}
                    onChange={e => setNuevaOrdenData({...nuevaOrdenData, nombre: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Selección de Productos */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Agregar Productos</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                    {productosDisponibles.map(prod => (
                      <div key={prod.id} className="flex justify-between items-center p-2 bg-gray-50 rounded hover:bg-gray-100 transition">
                        <div>
                          <p className="text-sm font-medium">{prod.nombre}</p>
                          <p className="text-xs text-gray-500">${prod.precio} - Stock: {prod.stock}</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => agregarItemANuevaOrden(prod.id)}
                          disabled={prod.stock <= 0}
                          className={`text-xs px-2 py-1 rounded ${prod.stock > 0 ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-400'}`}
                        >
                          {prod.stock > 0 ? 'Agregar' : 'Sin Stock'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resumen de la Orden */}
                <div className="bg-gray-50 p-4 rounded-xl border">
                  <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Resumen</h3>
                  <div className="space-y-3 mb-6 max-h-40 overflow-y-auto">
                    {nuevaOrdenData.items.length === 0 && <p className="text-gray-500 text-sm italic">No hay productos seleccionados</p>}
                    {nuevaOrdenData.items.map(item => (
                      <div key={item.productId} className="flex justify-between items-center text-sm">
                        <span>{item.nombre} x{item.cantidad}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">${(item.precio * item.cantidad).toFixed(2)}</span>
                          <button 
                            type="button"
                            onClick={() => setNuevaOrdenData({
                              ...nuevaOrdenData,
                              items: nuevaOrdenData.items.filter(i => i.productId !== item.productId)
                            })}
                            className="text-red-500 hover:text-red-700"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold text-blue-700">
                      <span>Total:</span>
                      <span>${nuevaOrdenData.items.reduce((sum, i) => sum + (i.precio * i.cantidad), 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowNuevaOrden(false)}
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition font-bold shadow-lg"
                >
                  Crear Orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdenesAdmin;
