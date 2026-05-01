import React from 'react';
import { Link } from 'react-router-dom';

interface DashboardProps {
  resumen: any;
}

export const DashboardVentas: React.FC<DashboardProps> = ({ resumen }) => {
  const stats = [
    { label: 'Ventas Totales', value: `$${resumen?.ventasTotales.toLocaleString() || 0}`, icon: '💰', color: 'bg-green-500' },
    { label: 'Órdenes Hoy', value: resumen?.ordenesHoy || 0, icon: '🛒', color: 'bg-blue-500' },
    { label: 'Clientes Nuevos', value: resumen?.clientesNuevos || 0, icon: '👤', color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat: any, idx: number) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`${stat.color} text-white p-3 rounded-xl text-2xl`}>{stat.icon}</div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-4">Gestión de Ventas</h3>
          <div className="space-y-4">
            <Link to="/admin/ordenes" className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              <span className="text-2xl mr-4">📦</span>
              <div>
                <p className="font-bold text-blue-900">Gestionar Órdenes</p>
                <p className="text-sm text-blue-700">Ver pedidos y cambiar estados</p>
              </div>
            </Link>
            <Link to="/admin/cupones" className="flex items-center p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
              <span className="text-2xl mr-4">🎟️</span>
              <div>
                <p className="font-bold text-indigo-900">Administrar Cupones</p>
                <p className="text-sm text-indigo-700">Crear ofertas y descuentos</p>
              </div>
            </Link>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-4">Análisis y Clientes</h3>
          <div className="space-y-4">
            <Link to="/admin/estadisticas" className="flex items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
              <span className="text-2xl mr-4">📈</span>
              <div>
                <p className="font-bold text-purple-900">Estadísticas Detalladas</p>
                <p className="text-sm text-purple-700">Reportes de rendimiento de ventas</p>
              </div>
            </Link>
            <Link to="/admin/clientes" className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
              <span className="text-2xl mr-4">👥</span>
              <div>
                <p className="font-bold text-green-900">Ver Clientes</p>
                <p className="text-sm text-green-700">Listado de clientes registrados</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardInventario: React.FC<DashboardProps> = ({ resumen }) => {
  const stats = [
    { label: 'Stock Bajo', value: `${resumen?.stockBajo || 0} productos`, icon: '⚠️', color: 'bg-orange-500' },
    { label: 'Ventas Totales (Ref)', value: `$${resumen?.ventasTotales.toLocaleString() || 0}`, icon: '💰', color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat: any, idx: number) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`${stat.color} text-white p-3 rounded-xl text-2xl`}>{stat.icon}</div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-4">Control de Catálogo</h3>
          <div className="space-y-4">
            <Link to="/admin/productos" className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              <span className="text-2xl mr-4">📦</span>
              <div>
                <p className="font-bold text-blue-900">Gestión de Productos</p>
                <p className="text-sm text-blue-700">CRUD de productos, categorías y marcas</p>
              </div>
            </Link>
            <Link to="/admin/inventario" className="flex items-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
              <span className="text-2xl mr-4">🏭</span>
              <div>
                <p className="font-bold text-orange-900">Ajustes de Stock</p>
                <p className="text-sm text-orange-700">Movimientos y órdenes de compra</p>
              </div>
            </Link>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-4">Reportes de Inventario</h3>
          <div className="space-y-4">
            <Link to="/admin/reportes" className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <span className="text-2xl mr-4">📄</span>
              <div>
                <p className="font-bold text-gray-900">Generar Reportes</p>
                <p className="text-sm text-gray-700">Reportes de existencias y movimientos</p>
              </div>
            </Link>
            <Link to="/admin/estadisticas" className="flex items-center p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
              <span className="text-2xl mr-4">📈</span>
              <div>
                <p className="font-bold text-indigo-900">Ventas (Lectura)</p>
                <p className="text-sm text-indigo-700">Seguimiento de demanda</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardVendedor: React.FC<DashboardProps> = ({ resumen }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 w-full md:w-1/3">
        <div className="bg-blue-500 text-white p-3 rounded-xl text-2xl">🛒</div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Órdenes Hoy</p>
          <p className="text-2xl font-black text-gray-900">{resumen?.ordenesHoy || 0}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-4">Atención al Cliente</h3>
          <div className="space-y-4">
            <Link to="/admin/ordenes" className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
              <span className="text-2xl mr-4">📋</span>
              <div>
                <p className="font-bold text-green-900">Ver Órdenes</p>
                <p className="text-sm text-green-700">Cambiar estados (En proceso/Enviada)</p>
              </div>
            </Link>
            <Link to="/admin/clientes" className="flex items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
              <span className="text-2xl mr-4">👤</span>
              <div>
                <p className="font-bold text-purple-900">Clientes</p>
                <p className="text-sm text-purple-700">Ver información de contacto</p>
              </div>
            </Link>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-4">Consulta de Productos</h3>
          <div className="space-y-4">
            <Link to="/admin/productos" className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              <span className="text-2xl mr-4">📦</span>
              <div>
                <p className="font-bold text-blue-900">Catálogo y Stock</p>
                <p className="text-sm text-blue-700">Ver precios y disponibilidad</p>
              </div>
            </Link>
            <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-sm text-gray-500 italic text-center">Acceso limitado por rol de Vendedor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
