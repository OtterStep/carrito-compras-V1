import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { productoService } from '../../services/producto.service';
import { clienteService } from '../../services/cliente.service';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';

const ProductoDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const [producto, setProducto] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (id) {
      cargarDatos();
    }
  }, [id]);

  const cargarDatos = async () => {
    try {
      const prod = await productoService.getById(id!);
      setProducto(prod);
      const resReviews = await clienteService.getResenasProducto(id!);
      setReviews(resReviews.data);
    } catch (error) {
      toast.error('Error al cargar producto');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    const success = addItem(producto);
    if (success) {
      toast.success(`${producto.nombre} agregado al carrito`);
    } else {
      toast.error(`No hay suficiente stock de ${producto.nombre}`);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) return toast.error('Debes iniciar sesión');
    try {
      await clienteService.agregarAWishlist(producto.id);
      toast.success('Agregado a la lista de deseos');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error');
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;
  if (!producto) return <div className="p-8 text-center">Producto no encontrado</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div className="bg-gray-50 rounded-3xl overflow-hidden h-[500px]">
          {producto.imagen ? (
            <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">📦</div>
          )}
        </div>
        
        <div className="flex flex-col">
          <span className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-2">{producto.categoria}</span>
          <h1 className="text-4xl font-black text-gray-800 mb-4">{producto.nombre}</h1>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">{producto.descripcion}</p>
          
          <div className="flex items-center gap-4 mb-8">
            <span className="text-4xl font-black text-blue-600">${producto.precio.toFixed(2)}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${producto.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {producto.stock > 0 ? `${producto.stock} en stock` : 'Sin stock'}
            </span>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleAddToCart}
              disabled={producto.stock <= 0}
              className="flex-grow bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-100"
            >
              Agregar al Carrito
            </button>
            <button 
              onClick={handleAddToWishlist}
              className="bg-white border-2 border-gray-100 p-4 rounded-2xl hover:bg-gray-50 transition-all"
            >
              ❤️
            </button>
          </div>
        </div>
      </div>

      <div className="border-t pt-12">
        <h2 className="text-2xl font-bold mb-8">Reseñas de Clientes ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No hay reseñas para este producto aún.</p>
        ) : (
          <div className="grid gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {rev.user.nombre.charAt(0)}
                    </div>
                    <span className="font-bold text-gray-700">{rev.user.nombre}</span>
                  </div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{i < rev.calificacion ? '★' : '☆'}</span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">{rev.comentario}</p>
                <p className="text-[10px] text-gray-400 mt-4 uppercase font-bold">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductoDetalle;
