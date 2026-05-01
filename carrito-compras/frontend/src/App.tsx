import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/shop/Home';
import Catalogo from './pages/shop/Catalogo';
import Carrito from './pages/shop/Carrito';
import Login from './pages/shop/Login';
import Registro from './pages/shop/Registro';
import Perfil from './pages/shop/Perfil';
import MisOrdenes from './pages/shop/MisOrdenes';
import Checkout from './pages/shop/Checkout';
import Wishlist from './pages/shop/Wishlist';
import ProductoDetalle from './pages/shop/ProductoDetalle';
import Dashboard from './pages/admin/Dashboard';
import ProductosAdmin from './pages/admin/ProductosAdmin';
import OrdenesAdmin from './pages/admin/OrdenesAdmin';
import Estadisticas from './pages/admin/Estadisticas';
import Reportes from './pages/admin/Reportes';
import UsuariosAdmin from './pages/admin/UsuariosAdmin';
import ClientesAdmin from './pages/admin/ClientesAdmin';
import InventarioAdmin from './pages/admin/InventarioAdmin';
import CuponesAdmin from './pages/admin/CuponesAdmin';
import ConfigAdmin from './pages/admin/ConfigAdmin';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import AdminLayout from './pages/admin/AdminLayout';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          
          {/* Cliente Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['CLIENTE', 'ADMIN', 'GERENTE_VENTAS', 'GERENTE_INVENTARIO', 'VENDEDOR', 'GERENTE']} />}>
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/mis-ordenes" element={<MisOrdenes />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Route>
          
          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'GERENTE_VENTAS', 'GERENTE_INVENTARIO', 'VENDEDOR', 'GERENTE']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/productos" element={<ProductosAdmin />} />
              <Route path="/admin/inventario" element={<InventarioAdmin />} />
              <Route path="/admin/ordenes" element={<OrdenesAdmin />} />
              <Route path="/admin/clientes" element={<ClientesAdmin />} />
              <Route path="/admin/estadisticas" element={<Estadisticas />} />
              <Route path="/admin/reportes" element={<Reportes />} />
              <Route path="/admin/usuarios" element={<UsuariosAdmin />} />
              <Route path="/admin/cupones" element={<CuponesAdmin />} />
              <Route path="/admin/config" element={<ConfigAdmin />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
