import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { configService } from '../services/config.service';

const Footer = () => {
  const [siteConfig, setSiteConfig] = useState<any>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await configService.getSiteConfig();
        if (res.success) setSiteConfig(res.data);
      } catch (error) {
        console.error('Error fetching config for footer:', error);
      }
    };
    fetchConfig();
  }, []);

  // No mostrar footer en rutas de admin
  if (window.location.pathname.startsWith('/admin')) return null;

  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10 px-4 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-black text-gray-900 mb-6">
              {siteConfig?.logoUrl ? (
                <img src={siteConfig.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
              ) : (
                siteConfig?.nombreTienda || 'Mi Tienda'
              )}
            </h2>
            <p className="text-gray-500 font-medium leading-relaxed max-w-sm">
              Ofrecemos la mejor experiencia de compra online con productos de alta calidad y envíos a todo el país.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Enlaces Rápidos</h4>
            <ul className="space-y-4">
              <li><Link to="/catalogo" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">Catálogo</Link></li>
              <li><Link to="/mis-ordenes" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">Mis Pedidos</Link></li>
              <li><Link to="/perfil" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">Mi Cuenta</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Contacto</h4>
            <p className="text-sm font-bold text-gray-600">soporte@mitienda.com</p>
            <p className="text-sm font-medium text-gray-400 mt-2">+51 987 654 321</p>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            © {new Date().getFullYear()} {siteConfig?.nombreTienda || 'Mi Tienda'}. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <span className="text-xl cursor-pointer hover:grayscale-0 grayscale transition-all" title="Pagos con Tarjeta">💳</span>
            <span className="text-xl cursor-pointer hover:grayscale-0 grayscale transition-all" title="Yape / Plin">📱</span>
            <span className="text-xl cursor-pointer hover:grayscale-0 grayscale transition-all" title="Transferencia Bancaria">🏦</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
