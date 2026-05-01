import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productoService } from '../../services/producto.service';
import { clienteService } from '../../services/cliente.service';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

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

  const cartItems = useCartStore((state) => state.items);

  const handleAddToCart = (prod: any) => {
    const existingInCart = cartItems.find(item => item.id === prod.id);
    const availableStock = existingInCart ? prod.stock - existingInCart.cantidad : prod.stock;

    if (availableStock <= 0) {
      toast.error('No hay más stock disponible para este producto');
      return;
    }

    addItem(prod);
    toast.success(`${prod.nombre} agregado al carrito`, {
      icon: '🛒',
      duration: 2000,
      position: 'bottom-right',
    });
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
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Nuestro Catálogo</h1>
          <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">Descubre lo mejor para ti</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto bg-white p-4 rounded-[32px] shadow-xl shadow-gray-100 border border-gray-50">
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
        <LoadingSpinner message="Buscando productos..." />
      ) : productos.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[40px] shadow-xl shadow-gray-100 border-2 border-dashed border-gray-100">
          <div className="text-6xl mb-6">🔍</div>
          <h3 className="text-2xl font-black text-gray-800 mb-2">No encontramos resultados</h3>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Intenta con otros filtros o términos de búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {productos.map((prod: any) => (
            <div key={prod.id} className="bg-white border border-gray-50 rounded-[40px] p-6 shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col">
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
                    {prod.stock <= 0 && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase shadow-sm">
                        Sin Stock
                      </span>
                    )}
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
                    disabled={prod.stock <= 0}
                    className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 active:scale-95 transition-all font-semibold shadow-md shadow-blue-100 disabled:opacity-50 disabled:bg-gray-400"
                  >
                    {prod.stock > 0 ? 'Agregar' : 'Agotado'}
                  </button>
                </div>
              </div>
            ))}
          </div>
      )}
    </div>
  );
};

export default Catalogo;
