import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);

  const allMenuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊', roles: ['ADMIN', 'GERENTE_VENTAS', 'GERENTE_INVENTARIO', 'VENDEDOR', 'GERENTE'] },
    { path: '/admin/productos', label: 'Productos', icon: '📦', roles: ['ADMIN', 'GERENTE_INVENTARIO', 'VENDEDOR', 'GERENTE'] },
    { path: '/admin/inventario', label: 'Inventario', icon: '🏭', roles: ['ADMIN', 'GERENTE_INVENTARIO', 'GERENTE'] },
    { path: '/admin/ordenes', label: 'Órdenes', icon: '🛒', roles: ['ADMIN', 'GERENTE_VENTAS', 'VENDEDOR', 'GERENTE'] },
    { path: '/admin/clientes', label: 'Clientes', icon: '👤', roles: ['ADMIN', 'GERENTE_VENTAS', 'VENDEDOR', 'GERENTE'] },
    { path: '/admin/cupones', label: 'Cupones', icon: '🎟️', roles: ['ADMIN', 'GERENTE_VENTAS', 'GERENTE'] },
    { path: '/admin/estadisticas', label: 'Estadísticas', icon: '📈', roles: ['ADMIN', 'GERENTE_VENTAS', 'GERENTE_INVENTARIO', 'GERENTE'] },
    { path: '/admin/reportes', label: 'Reportes', icon: '📄', roles: ['ADMIN', 'GERENTE_VENTAS', 'GERENTE_INVENTARIO', 'VENDEDOR', 'GERENTE'] },
    { path: '/admin/usuarios', label: 'Usuarios', icon: '👥', roles: ['ADMIN'] },
    { path: '/admin/config', label: 'Configuración', icon: '⚙️', roles: ['ADMIN'] },
  ];

  const menuItems = allMenuItems.filter(item => 
    item.roles.includes(user?.rol?.toUpperCase() || '')
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <span className="mr-3">🚪</span>
            Cerrar Sesión
          </button>
          <Link
            to="/"
            className="flex items-center w-full px-4 py-2 mt-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="mr-3">🏠</span>
            Ir a la Tienda
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
