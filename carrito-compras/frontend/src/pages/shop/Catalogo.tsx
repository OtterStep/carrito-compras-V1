import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productoService } from '../../services/producto.service';
import { clienteService } from '../../services/cliente.service';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';

const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    buscar: '',
    categoria: '',
    minPrecio: '',
    maxPrecio: ''
  });
  
  const addItem = useCartStore((state) => state.addItem);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const fetchProductos = () => {
    setLoading(true);
    productoService.getAll(filtros)
      .then(setProductos)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductos();
    }, 500);
    return () => clearTimeout(timer);
  }, [filtros]);

  const handleAddToCart = (prod: any) => {
    const success = addItem(prod);
    if (success) {
      toast.success(`${prod.nombre} agregado al carrito`, {
        icon: '🛒',
        duration: 2000,
        position: 'bottom-right',
      });
    } else {
      toast.error(`No hay suficiente stock de ${prod.nombre}`);
    }
  };

  const handleAddToWishlist = async (productId: string) => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para agregar a tu lista de deseos');
      return;
    }
    try {
      await clienteService.agregarAWishlist(productId);
      toast.success('Agregado a tu lista de deseos', { icon: '❤️' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al agregar a la lista de deseos');
    }
  };

  const categorias = Array.from(new Set(productos.map((p: any) => p.categoria)));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Nuestro Catálogo</h1>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Buscar productos..." 
            className="border p-2 rounded-xl flex-grow md:w-64"
            value={filtros.buscar}
            onChange={(e) => setFiltros({...filtros, buscar: e.target.value})}
          />
          <select 
            className="border p-2 rounded-xl"
            value={filtros.categoria}
            onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="flex gap-2 items-center">
            <input 
              type="number" 
              placeholder="Min $" 
              className="border p-2 rounded-xl w-24"
              value={filtros.minPrecio}
              onChange={(e) => setFiltros({...filtros, minPrecio: e.target.value})}
            />
            <span>-</span>
            <input 
              type="number" 
              placeholder="Max $" 
              className="border p-2 rounded-xl w-24"
              value={filtros.maxPrecio}
              onChange={(e) => setFiltros({...filtros, maxPrecio: e.target.value})}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center">Cargando productos...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {productos.map((prod: any) => (
              <div key={prod.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
                <div className="h-48 w-full bg-gray-50 rounded-xl mb-4 overflow-hidden relative">
                  <Link to={`/producto/${prod.id}`}>
                    {prod.imagen ? (
                      <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <span className="text-4xl">📦</span>
                      </div>
                    )}
                  </Link>
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-blue-600 shadow-sm">
                      {prod.categoria}
                    </span>
                    <button 
                      onClick={() => handleAddToWishlist(prod.id)}
                      className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg text-red-500 shadow-sm hover:scale-110 transition-transform"
                      title="Agregar a favoritos"
                    >
                      ❤️
                    </button>
                  </div>
                </div>
                <Link to={`/producto/${prod.id}`}>
                  <h2 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1 hover:text-blue-600 transition-colors">{prod.nombre}</h2>
                </Link>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">{prod.descripcion}</p>
                
                {prod.reviews && prod.reviews.length > 0 && (
                  <div className="mb-2 flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm font-medium text-gray-600">
                      {(prod.reviews.reduce((acc: any, r: any) => acc + r.calificacion, 0) / prod.reviews.length).toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-400">({prod.reviews.length})</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <span className="text-xl font-black text-blue-600">${prod.precio.toFixed(2)}</span>
                  <button 
                    onClick={() => handleAddToCart(prod)}
                    className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 active:scale-95 transition-all font-semibold shadow-md shadow-blue-100"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
          {productos.length === 0 && <p className="text-center text-gray-500">No hay productos que coincidan con los filtros.</p>}
        </>
      )}
    </div>
  );
};

export default Catalogo;
