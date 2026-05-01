import React, { useEffect, useState } from 'react';
import { clienteService } from '../../services/cliente.service';
import { useCartStore } from '../../stores/cartStore';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    cargarWishlist();
  }, []);

  const cargarWishlist = async () => {
    try {
      const res = await clienteService.getWishlist();
      const wishlistItems = res?.data?.items || [];
      setItems(Array.isArray(wishlistItems) ? wishlistItems : []);
    } catch (error) {
      toast.error('Error al cargar lista de deseos');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await clienteService.eliminarDeWishlist(id);
      toast.success('Eliminado de la lista de deseos');
      cargarWishlist();
    } catch (error) {
      toast.error('Error al eliminar item');
    }
  };

  const handleAddToCart = (prod: any) => {
    addItem(prod);
    toast.success(`${prod.nombre} agregado al carrito`);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando tu lista de deseos...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Mi Lista de Deseos</h1>

      {items.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
          <span className="text-5xl mb-4 block">❤️</span>
          <p className="text-gray-500 text-lg mb-6">Tu lista de deseos está vacía.</p>
          <Link to="/catalogo" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">
            Explorar Productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group">
              <div className="h-48 bg-gray-50 relative">
                {item.product.imagen ? (
                  <img src={item.product.imagen} alt={item.product.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                )}
                <button 
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  ✕
                </button>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-800 mb-1">{item.product.nombre}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.product.descripcion}</p>
                <div className="mt-auto flex justify-between items-center">
                  <span className="text-xl font-black text-blue-600">${item.product.precio.toFixed(2)}</span>
                  <button 
                    onClick={() => handleAddToCart(item.product)}
                    className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-900 transition-colors"
                  >
                    Mover al Carrito
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
