import React, { useState, useEffect } from 'react';
import { configService } from '../../services/config.service';
import toast from 'react-hot-toast';

const ConfigAdmin: React.FC = () => {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await configService.getAll();
      if (res.success) setConfigs(res.data);
    } catch (error) {
      console.error('Error fetching configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (clave: string, valor: string) => {
    setSaving(true);
    try {
      await configService.actualizar(clave, valor);
      toast.success('Configuración actualizada correctamente');
      fetchConfigs();
    } catch (error) {
      toast.error('Error actualizando configuración');
    } finally {
      setSaving(false);
    }
  };

  const getValor = (clave: string) => {
    return configs.find(c => c.clave === clave)?.valor || '';
  };

  const setLocalValor = (clave: string, valor: string) => {
    setConfigs(prev => {
      const exists = prev.find(c => c.clave === clave);
      if (exists) {
        return prev.map(c => c.clave === clave ? { ...c, valor } : c);
      }
      return [...prev, { clave, valor }];
    });
  };

  if (loading) return <div className="p-4">Cargando configuración...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configuración del Sistema</h1>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Pedidos</h2>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo límite para cancelación (minutos)
                </label>
                <input
                  type="number"
                  value={getValor('TIEMPO_CANCELACION_MINUTOS')}
                  onChange={(e) => setLocalValor('TIEMPO_CANCELACION_MINUTOS', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  placeholder="Ej: 30"
                />
                <p className="text-xs text-gray-500 mt-1">
                  El usuario podrá cancelar su pedido si no han pasado más de estos minutos desde su creación.
                </p>
              </div>
              <button
                onClick={() => handleUpdate('TIEMPO_CANCELACION_MINUTOS', getValor('TIEMPO_CANCELACION_MINUTOS'))}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 h-10"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>

          {/* Más configuraciones pueden ir aquí */}
        </div>
      </div>
    </div>
  );
};

export default ConfigAdmin;
