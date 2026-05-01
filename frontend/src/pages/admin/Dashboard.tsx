import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { estadisticaService } from '../../services/estadistica.service';
import { toast } from 'react-hot-toast';
import { DashboardVentas, DashboardInventario, DashboardVendedor } from './RoleDashboards';
import LoadingSpinner from '../../components/LoadingSpinner';

const Dashboard = () => {
  const user = useAuthStore(state => state.user);
  const [resumen, setResumen] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const res = await estadisticaService.getResumen();
        if (res.success) {
          setResumen(res.data);
        }
      } catch (error: any) {
        toast.error('Error al cargar resumen');
      } finally {
        setLoading(false);
      }
    };
    fetchResumen();
  }, []);

  const stats = [
    { label: 'Ventas Totales', value: resumen?.ventasTotales ? `$${resumen.ventasTotales.toLocaleString()}` : '$0', icon: '💰', color: 'bg-green-500', roles: ['ADMIN', 'GERENTE_VENTAS', 'GERENTE_INVENTARIO'] },
    { label: 'Órdenes Hoy', value: resumen?.ordenesHoy ? resumen.ordenesHoy.toString() : '0', icon: '🛒', color: 'bg-blue-500', roles: ['ADMIN', 'GERENTE_VENTAS', 'VENDEDOR'] },
    { label: 'Stock Bajo', value: resumen?.stockBajo ? `${resumen.stockBajo} productos` : '0 productos', icon: '⚠️', color: 'bg-orange-500', roles: ['ADMIN', 'GERENTE_INVENTARIO'] },
    { label: 'Clientes Nuevos', value: resumen?.clientesNuevos ? resumen.clientesNuevos.toString() : '0', icon: '👤', color: 'bg-purple-500', roles: ['ADMIN', 'GERENTE_VENTAS'] },
  ];

  const actions = [
    { 
      title: 'Productos', 
      desc: 'Gestiona el inventario, precios y categorías.', 
      icon: '📦', 
      link: '/admin/productos' 
    },
    { 
      title: 'Órdenes', 
      desc: 'Revisa pedidos y actualiza estados de envío.', 
      icon: '🛒', 
      link: '/admin/ordenes' 
    },
    { 
      title: 'Cupones', 
      desc: 'Crea y gestiona cupones de descuento.', 
      icon: '🎟️', 
      link: '/admin/cupones' 
    },
    { 
      title: 'Inventario', 
      desc: 'Ajustes de stock y movimientos.', 
      icon: '🏭', 
      link: '/admin/inventario' 
    },
    { 
      title: 'Estadísticas', 
      desc: 'Analiza el rendimiento del negocio.', 
      icon: '📈', 
      link: '/admin/estadisticas' 
    },
    { 
      title: 'Usuarios', 
      desc: 'Administra cuentas y permisos.', 
      icon: '👥', 
      link: '/admin/usuarios' 
    }
  ];

  const renderRoleDashboard = () => {
    const rol = user?.rol?.toUpperCase();
    switch (rol) {
      case 'GERENTE_VENTAS':
        return <DashboardVentas resumen={resumen} />;
      case 'GERENTE_INVENTARIO':
        return <DashboardInventario resumen={resumen} />;
      case 'VENDEDOR':
        return <DashboardVendedor resumen={resumen} />;
      default:
        // Vista para ADMIN (ve todo)
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat: any, idx: number) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className={`${stat.color} text-white p-3 rounded-xl text-2xl`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                    <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Acciones del Administrador</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {actions.map((action: any, idx: number) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                    <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">
                      {action.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">{action.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{action.desc}</p>
                    <Link to={action.link} className="text-blue-600 font-bold hover:text-blue-700 inline-flex items-center text-sm">
                      Ir ahora <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) return <LoadingSpinner message="Analizando datos del panel..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">
          Bienvenido, <span className="text-blue-600">{user?.nombre}</span>
        </h1>
        <p className="text-gray-500 mt-2">
          Panel de control para: <span className="font-bold uppercase text-blue-800">{user?.rol.replace('_', ' ')}</span>
        </p>
      </div>

      {renderRoleDashboard()}
    </div>
  );
};

export default Dashboard;
