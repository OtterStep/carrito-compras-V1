import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cuponService } from '../../services/cupon.service';
import { productoService } from '../../services/producto.service';
import { configService } from '../../services/config.service';
import { useCartStore } from '../../stores/cartStore';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const Home = () => {
  const [cupones, setCupones] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [siteConfig, setSiteConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cuponesRes, productosRes, configRes] = await Promise.all([
          cuponService.getActivos(),
          productoService.getAll({}),
          configService.getSiteConfig()
        ]);

        if (cuponesRes.success) setCupones(cuponesRes.data);
        if (Array.isArray(productosRes)) setProductos(productosRes.slice(0, 8));
        if (configRes.success) setSiteConfig(configRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddToCart = (prod: any) => {
    addItem(prod);
    toast.success(`${prod.nombre} agregado`, { icon: '🛒', position: 'bottom-right' });
  };

  if (loading) return <LoadingSpinner fullScreen message="Cargando tienda..." />;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Banner Editable */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        {siteConfig?.bannerUrl ? (
          <img 
            src={siteConfig.bannerUrl} 
            alt="Banner" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        )}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
            {siteConfig?.bannerTexto || 'Bienvenido a nuestra Tienda'}
          </h1>
          <p className="text-xl text-blue-50 font-medium mb-10 opacity-90">
            Descubre nuestra colección exclusiva con los mejores precios del mercado.
          </p>
          <Link to="/catalogo" className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-2xl active:scale-95 inline-block">
            EXPLORAR CATÁLOGO 🚀
          </Link>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-3">Nuestra Selección</h2>
            <h3 className="text-4xl font-black text-gray-900">Productos Destacados</h3>
          </div>
          <Link to="/catalogo" className="hidden md:flex items-center gap-2 font-black text-gray-400 hover:text-blue-600 transition-colors uppercase text-xs tracking-widest">
            Ver catálogo completo <span>➡️</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {productos.map((prod) => (
            <div key={prod.id} className="bg-white border border-gray-50 rounded-3xl p-5 shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
              <div className="h-56 w-full bg-gray-50 rounded-2xl mb-5 overflow-hidden relative">
                <Link to={`/producto/${prod.id}`}>
                  {prod.imagen ? (
                    <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">📦</div>
                  )}
                </Link>
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black text-blue-600 uppercase tracking-wider shadow-sm">
                    {prod.categoria}
                  </span>
                </div>
              </div>
              <Link to={`/producto/${prod.id}`}>
                <h4 className="text-lg font-black text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{prod.nombre}</h4>
              </Link>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                <span className="text-2xl font-black text-gray-900">${prod.precio.toFixed(2)}</span>
                <button 
                  onClick={() => handleAddToCart(prod)}
                  className="bg-gray-900 text-white p-3 rounded-xl hover:bg-blue-600 transition-all active:scale-90"
                >
                  🛒
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link to="/catalogo" className="inline-flex items-center gap-3 bg-gray-50 text-gray-900 px-12 py-5 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95 border-2 border-gray-100">
            Ver más productos <span>➕</span>
          </Link>
        </div>
      </section>

      {/* Cupones - Visibilidad controlada por Admin */}
      {siteConfig?.cuponesVisibles && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-3">Beneficios Exclusivos</h2>
              <h3 className="text-4xl font-black text-gray-900">🎁 Ofertas Especiales</h3>
            </div>
            
            {cupones.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cupones.map((cupon) => (
                  <div key={cupon.id} className="bg-white p-8 rounded-[40px] shadow-2xl shadow-blue-100 border-2 border-white flex justify-between items-center relative overflow-hidden group hover:scale-[1.02] transition-transform">
                    <div className="relative z-10">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Cupón Activo</p>
                      <h3 className="text-4xl font-black text-gray-900 mb-1">{cupon.codigo}</h3>
                      <p className="text-lg font-bold text-blue-600">
                        {cupon.tipo === 'PORCENTAJE' ? `${cupon.descuento}% DTO.` : `$${cupon.descuento} OFF`}
                      </p>
                    </div>
                    <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest relative z-10 shadow-lg shadow-blue-200">
                      COPIAR
                    </div>
                    {/* Estética de cupón */}
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-50 rounded-full border-2 border-white"></div>
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-50 rounded-full border-2 border-white"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center bg-white p-12 rounded-[40px] shadow-xl shadow-gray-100 border-2 border-dashed border-gray-200">
                <div className="text-5xl mb-6">📢</div>
                <h4 className="text-xl font-black text-gray-800 mb-4">No hay cupones disponibles</h4>
                <button className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-100">
                  ESTATE ATENTO A NUESTRAS OFERTAS
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
