import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

const InventarioAdmin = () => {
  const user = useAuthStore(state => state.user);
  const canManage = user?.rol === 'ADMIN' || user?.rol === 'GERENTE_INVENTARIO';

  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStock, setNewStock] = useState<number>(0);

  useEffect(() => {
    loadInventario();
  }, []);

  const loadInventario = async () => {
    try {
      const res = await api.get('/inventario/bajo-stock');
      setProductos(res.data.data);
    } catch (error) {
      toast.error('Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (id: string) => {
    try {
      await api.patch(`/inventario/ajuste/${id}`, { cantidad: newStock });
      toast.success('Stock actualizado');
      setEditingId(null);
      loadInventario();
    } catch (error) {
      toast.error('Error al actualizar stock');
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Gestión de Inventario</h1>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-yellow-700">Mostrando productos con bajo stock (≤ 10 unidades)</p>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Actual</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {productos.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingId === p.id ? (
                    <input 
                      type="number" 
                      value={newStock}
                      onChange={(e) => setNewStock(parseInt(e.target.value))}
                      className="border rounded px-2 py-1 w-20"
                    />
                  ) : (
                    <span className={`font-bold ${p.stock <= 5 ? 'text-red-600' : 'text-yellow-600'}`}>
                      {p.stock}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {!canManage ? (
                    <span className="text-gray-400">Lectura solamente</span>
                  ) : editingId === p.id ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleUpdateStock(p.id)} className="text-green-600 hover:text-green-900">Guardar</button>
                      <button onClick={() => setEditingId(null)} className="text-gray-600 hover:text-gray-900">Cancelar</button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setEditingId(p.id);
                        setNewStock(p.stock);
                      }} 
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Ajustar Stock
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventarioAdmin;
