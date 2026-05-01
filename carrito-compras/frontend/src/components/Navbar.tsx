import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';

const Navbar = () => {
  const items = useCartStore((state) => state.items);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-black text-blue-600 tracking-tight">
              TIENDA<span className="text-gray-900">APP</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Inicio</Link>
              <Link to="/catalogo" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Catálogo</Link>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <Link to="/carrito" className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <span className="text-2xl">🛒</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                  {totalItems}
                </span>
              )}
            </Link>

            <div className="h-6 w-px bg-gray-200 mx-1"></div>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-500 font-medium">Hola,</p>
                  <p className="text-sm font-bold text-gray-800">{user?.nombre || 'Usuario'}</p>
                </div>
                {user?.rol?.toUpperCase() !== 'CLIENTE' && (
                  <Link 
                    to="/admin" 
                    className="text-sm bg-gray-800 text-white px-4 py-2 rounded-xl font-bold hover:bg-gray-900 transition-all shadow-md shadow-gray-200"
                  >
                    Panel Admin
                  </Link>
                )}
                <Link to="/perfil" className="text-sm text-gray-600 font-bold hover:text-blue-600 transition-colors">
                  Mi Perfil
                </Link>
                <Link to="/mis-ordenes" className="text-sm text-gray-600 font-bold hover:text-blue-600 transition-colors">
                  Mis Órdenes
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-sm text-red-600 font-bold hover:text-red-700 transition-colors"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors">
                  Entrar
                </Link>
                <Link to="/registro" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
                  Crear Cuenta
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
