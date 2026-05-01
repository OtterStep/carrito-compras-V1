import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cuponService } from '../../services/cupon.service';

const Home = () => {
  const [cupones, setCupones] = useState<any[]>([]);

  useEffect(() => {
    fetchCupones();
  }, []);

  const fetchCupones = async () => {
    try {
      const res = await cuponService.getActivos();
      if (res.success) setCupones(res.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen pt-20">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold mb-4 text-gray-800">Bienvenido a nuestra Tienda</h1>
        <p className="text-xl text-gray-600 mb-8">Encuentra los mejores productos al mejor precio.</p>
        <Link to="/catalogo" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">
          Explorar Catálogo
        </Link>
      </div>

      {cupones.length > 0 && (
        <div className="w-full max-w-4xl px-4">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">🎁 Ofertas Especiales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cupones.map((cupon) => (
              <div key={cupon.id} className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-2xl shadow-md text-white flex justify-between items-center overflow-hidden relative">
                <div className="relative z-10">
                  <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Cupón de Descuento</p>
                  <h3 className="text-3xl font-black mt-1">{cupon.codigo}</h3>
                  <p className="text-lg mt-2 font-bold">
                    {cupon.tipo === 'PORCENTAJE' ? `${cupon.descuento}% DTO.` : `$${cupon.descuento} DTO. EXTRA`}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/30 text-center relative z-10">
                  <p className="text-[10px] font-bold uppercase">Úsalo en el</p>
                  <p className="text-xs font-black">CHECKOUT</p>
                </div>
                {/* Decorative circles */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full"></div>
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/10 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
