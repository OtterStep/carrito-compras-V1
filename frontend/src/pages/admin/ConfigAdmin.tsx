import React, { useState, useEffect } from 'react';
import { configService } from '../../services/config.service';
import { toast } from 'react-hot-toast';

const ConfigAdmin: React.FC = () => {
  const [configs, setConfigs] = useState<any[]>([]);
  const [siteConfig, setSiteConfig] = useState<any>({
    nombreTienda: '',
    logoUrl: '',
    bannerUrl: '',
    bannerTexto: '',
    cuponesVisibles: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfigs();
    fetchSiteConfig();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await configService.getAll();
      if (res.success) setConfigs(res.data);
    } catch (error) {
      console.error('Error fetching configs:', error);
    }
  };

  const fetchSiteConfig = async () => {
    try {
      const res = await configService.getSiteConfig();
      if (res.success) {
        setSiteConfig(res.data);
      }
    } catch (error) {
      console.error('Error fetching site config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (clave: string, valor: string) => {
    setSaving(true);
    try {
      await configService.actualizar(clave, valor);
      toast.success('Configuración actualizada');
      fetchConfigs();
    } catch (error) {
      toast.error('Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSite = async () => {
    setSaving(true);
    try {
      await configService.updateSiteConfig(siteConfig);
      toast.success('Diseño de la página actualizado');
    } catch (error) {
      toast.error('Error al actualizar diseño');
    } finally {
      setSaving(false);
    }
  };

  const getValor = (clave: string) => {
    return configs.find(c => c.clave === clave)?.valor || '';
  };

  const setLocalValor = (clave: string, valor: string) => {
    setConfigs(prev => prev.map(c => c.clave === clave ? { ...c, valor } : c));
  };

  if (loading) return <div className="p-4">Cargando configuración...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Configuración del Sitio</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Panel de Diseño de Inicio */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-8">
          <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <span className="bg-blue-100 p-2 rounded-xl text-blue-600">🎨</span> Diseño de Inicio
          </h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Nombre de la Tienda</label>
              <input
                type="text"
                value={siteConfig.nombreTienda}
                onChange={(e) => setSiteConfig({ ...siteConfig, nombreTienda: e.target.value })}
                className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all"
                placeholder="Mi Tienda Online"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">URL del Logo</label>
              <input
                type="text"
                value={siteConfig.logoUrl || ''}
                onChange={(e) => setSiteConfig({ ...siteConfig, logoUrl: e.target.value })}
                className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all"
                placeholder="https://ejemplo.com/logo.png"
              />
              {siteConfig.logoUrl && (
                <div className="mt-3 p-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                  <img src={siteConfig.logoUrl} alt="Preview Logo" className="h-12 object-contain" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">URL del Banner</label>
              <input
                type="text"
                value={siteConfig.bannerUrl || ''}
                onChange={(e) => setSiteConfig({ ...siteConfig, bannerUrl: e.target.value })}
                className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all"
                placeholder="https://ejemplo.com/banner.jpg"
              />
              {siteConfig.bannerUrl && (
                <div className="mt-3 aspect-video bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                  <img src={siteConfig.bannerUrl} alt="Preview Banner" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Texto del Banner</label>
              <textarea
                value={siteConfig.bannerTexto || ''}
                onChange={(e) => setSiteConfig({ ...siteConfig, bannerTexto: e.target.value })}
                className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all h-24 resize-none"
                placeholder="¡Bienvenidos a nuestra tienda!"
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border-2 border-gray-50">
              <input
                type="checkbox"
                checked={siteConfig.cuponesVisibles}
                onChange={(e) => setSiteConfig({ ...siteConfig, cuponesVisibles: e.target.checked })}
                className="w-6 h-6 rounded-lg border-2 border-blue-400 text-blue-600 focus:ring-blue-500"
                id="cuponesVisibles"
              />
              <label htmlFor="cuponesVisibles" className="text-xs font-black text-gray-600 uppercase tracking-widest cursor-pointer">
                Mostrar sección de cupones
              </label>
            </div>

            <button
              onClick={handleUpdateSite}
              disabled={saving}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-100"
            >
              {saving ? 'GUARDANDO...' : 'ACTUALIZAR DISEÑO'}
            </button>
          </div>
        </div>

        {/* Panel de Configuración de Sistema */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-8">
            <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-orange-100 p-2 rounded-xl text-orange-600">⚙️</span> Sistema
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">
                  Tiempo límite para cancelación (minutos)
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={getValor('TIEMPO_CANCELACION_MINUTOS')}
                    onChange={(e) => setLocalValor('TIEMPO_CANCELACION_MINUTOS', e.target.value)}
                    className="flex-1 bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 focus:ring-orange-500 focus:border-orange-500 outline-none font-bold text-gray-700 transition-all"
                    placeholder="30"
                  />
                  <button
                    onClick={() => handleUpdate('TIEMPO_CANCELACION_MINUTOS', getValor('TIEMPO_CANCELACION_MINUTOS'))}
                    disabled={saving}
                    className="bg-orange-600 text-white px-6 rounded-2xl font-black hover:bg-orange-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    OK
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 font-bold mt-3 ml-2 italic">
                  * Máximo tiempo que el cliente tiene para cancelar una orden PENDIENTE.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-900 text-white rounded-3xl p-8 shadow-2xl shadow-blue-200">
            <h3 className="text-lg font-black mb-2 flex items-center gap-2">
              <span>🚀</span> Modo Administrador
            </h3>
            <p className="text-xs text-blue-200 font-medium leading-relaxed">
              Los cambios realizados aquí se reflejarán instantáneamente para todos los clientes en la tienda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigAdmin;
