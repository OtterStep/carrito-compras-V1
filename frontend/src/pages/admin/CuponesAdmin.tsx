import React, { useState, useEffect } from 'react';
import { cuponService } from '../../services/cupon.service';
import { useAuthStore } from '../../stores/authStore';

const CuponesAdmin: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const canManage = user?.rol === 'ADMIN' || user?.rol === 'GERENTE_VENTAS';
  
  const [cupones, setCupones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCupon, setEditingCupon] = useState<any>(null);

  const [formData, setFormData] = useState({
    codigo: '',
    descuento: 0,
    tipo: 'PORCENTAJE',
    fechaExpiracion: '',
    usoMaximo: 0,
    activo: true
  });

  useEffect(() => {
    fetchCupones();
  }, []);

  const fetchCupones = async () => {
    try {
      const res = await cuponService.getAll();
      const data = res?.data || res || [];
      setCupones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        usoMaximo: formData.usoMaximo || null,
        fechaExpiracion: formData.fechaExpiracion || null
      };

      if (editingCupon) {
        await cuponService.actualizar(editingCupon.id, dataToSubmit);
      } else {
        await cuponService.crear(dataToSubmit);
      }
      setIsModalOpen(false);
      setEditingCupon(null);
      setFormData({ codigo: '', descuento: 0, tipo: 'PORCENTAJE', fechaExpiracion: '', usoMaximo: 0, activo: true });
      fetchCupones();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving coupon');
    }
  };

  const handleEdit = (cupon: any) => {
    setEditingCupon(cupon);
    setFormData({
      codigo: cupon.codigo,
      descuento: cupon.descuento,
      tipo: cupon.tipo,
      fechaExpiracion: cupon.fechaExpiracion ? cupon.fechaExpiracion.split('T')[0] : '',
      usoMaximo: cupon.usoMaximo || 0,
      activo: cupon.activo
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este cupón?')) {
      try {
        await cuponService.eliminar(id);
        fetchCupones();
      } catch (error) {
        alert('Error eliminando cupón');
      }
    }
  };

  if (loading) return <div className="p-4">Cargando cupones...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Cupones</h1>
        {canManage && (
          <button
            onClick={() => { setEditingCupon(null); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Nuevo Cupón
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descuento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cupones.map((cupon) => (
              <tr key={cupon.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">{cupon.codigo}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cupon.descuento}{cupon.tipo === 'PORCENTAJE' ? '%' : '$'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cupon.tipo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cupon.usosActuales} / {cupon.usoMaximo || '∞'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cupon.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {cupon.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {canManage ? (
                    <>
                      <button onClick={() => handleEdit(cupon)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                      <button onClick={() => handleDelete(cupon.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                    </>
                  ) : (
                    <span className="text-gray-400">Sin acciones</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingCupon ? 'Editar Cupón' : 'Nuevo Cupón'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Código</label>
                <input
                  type="text"
                  required
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  placeholder="EJ: VERANO2024"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descuento</label>
                  <input
                    type="number"
                    required
                    value={formData.descuento}
                    onChange={(e) => setFormData({ ...formData, descuento: parseFloat(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  >
                    <option value="PORCENTAJE">Porcentaje (%)</option>
                    <option value="FIJO">Fijo ($)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha Expiración (Opcional)</label>
                <input
                  type="date"
                  value={formData.fechaExpiracion}
                  onChange={(e) => setFormData({ ...formData, fechaExpiracion: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Uso Máximo (Opcional, 0 para ilimitado)</label>
                <input
                  type="number"
                  value={formData.usoMaximo}
                  onChange={(e) => setFormData({ ...formData, usoMaximo: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Cupón Activo</label>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CuponesAdmin;
