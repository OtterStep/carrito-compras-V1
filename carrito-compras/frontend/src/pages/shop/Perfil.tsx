import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clienteService } from '../../services/cliente.service';
import { toast } from 'react-hot-toast';

const Perfil = () => {
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  
  const [nuevaDireccion, setNuevaDireccion] = useState({
    direccion: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    pais: '',
    esPrincipal: false
  });

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const res = await clienteService.getPerfil();
      setPerfil(res.data);
      setNombre(res.data.nombre);
      setEmail(res.data.email);
    } catch (error) {
      toast.error('Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await clienteService.updatePerfil({ nombre, email });
      toast.success('Perfil actualizado');
      setEditando(false);
      cargarPerfil();
    } catch (error) {
      toast.error('Error al actualizar perfil');
    }
  };

  const handleAddDireccion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await clienteService.agregarDireccion(nuevaDireccion);
      toast.success('Dirección agregada');
      setNuevaDireccion({
        direccion: '',
        ciudad: '',
        estado: '',
        codigoPostal: '',
        pais: '',
        esPrincipal: false
      });
      cargarPerfil();
    } catch (error) {
      toast.error('Error al agregar dirección');
    }
  };

  const handleDeleteDireccion = async (id: string) => {
    try {
      await clienteService.eliminarDireccion(id);
      toast.success('Dirección eliminada');
      cargarPerfil();
    } catch (error) {
      toast.error('Error al eliminar dirección');
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando perfil...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Mi Perfil</h1>
        <Link 
          to="/mis-ordenes" 
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center gap-2"
        >
          <span>📦</span> Ver Mis Órdenes
        </Link>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-700">Datos Personales</h2>
          <button 
            onClick={() => setEditando(!editando)}
            className="text-blue-600 font-semibold hover:underline"
          >
            {editando ? 'Cancelar' : 'Editar'}
          </button>
        </div>

        {editando ? (
          <form onSubmit={handleUpdatePerfil} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input 
                type="text" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border p-2 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-2 rounded-xl"
                required
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">
              Guardar Cambios
            </button>
          </form>
        ) : (
          <div className="space-y-2">
            <p><span className="font-semibold text-gray-500">Nombre:</span> {perfil?.nombre}</p>
            <p><span className="font-semibold text-gray-500">Email:</span> {perfil?.email}</p>
            <p><span className="font-semibold text-gray-500">Rol:</span> {perfil?.rol}</p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-700 mb-6">Mis Direcciones</h2>
          <div className="space-y-4 mb-6">
            {perfil?.addresses.map((addr: any) => (
              <div key={addr.id} className="border p-4 rounded-xl relative group">
                <button 
                  onClick={() => handleDeleteDireccion(addr.id)}
                  className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  🗑️
                </button>
                <p className="font-bold">{addr.direccion}</p>
                <p className="text-sm text-gray-500">{addr.ciudad}, {addr.estado} {addr.codigoPostal}</p>
                <p className="text-sm text-gray-500">{addr.pais}</p>
                {addr.esPrincipal && (
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold mt-2 inline-block">
                    Principal
                  </span>
                )}
              </div>
            ))}
            {perfil?.addresses.length === 0 && (
              <p className="text-gray-400 text-center py-4">No tienes direcciones guardadas.</p>
            )}
          </div>

          <form onSubmit={handleAddDireccion} className="space-y-3 border-t pt-6">
            <h3 className="font-bold text-gray-700">Agregar Nueva Dirección</h3>
            <input 
              placeholder="Dirección" 
              className="w-full border p-2 rounded-xl text-sm"
              value={nuevaDireccion.direccion}
              onChange={(e) => setNuevaDireccion({...nuevaDireccion, direccion: e.target.value})}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <input 
                placeholder="Ciudad" 
                className="border p-2 rounded-xl text-sm"
                value={nuevaDireccion.ciudad}
                onChange={(e) => setNuevaDireccion({...nuevaDireccion, ciudad: e.target.value})}
                required
              />
              <input 
                placeholder="Estado" 
                className="border p-2 rounded-xl text-sm"
                value={nuevaDireccion.estado}
                onChange={(e) => setNuevaDireccion({...nuevaDireccion, estado: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input 
                placeholder="C.P." 
                className="border p-2 rounded-xl text-sm"
                value={nuevaDireccion.codigoPostal}
                onChange={(e) => setNuevaDireccion({...nuevaDireccion, codigoPostal: e.target.value})}
                required
              />
              <input 
                placeholder="País" 
                className="border p-2 rounded-xl text-sm"
                value={nuevaDireccion.pais}
                onChange={(e) => setNuevaDireccion({...nuevaDireccion, pais: e.target.value})}
                required
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input 
                type="checkbox" 
                checked={nuevaDireccion.esPrincipal}
                onChange={(e) => setNuevaDireccion({...nuevaDireccion, esPrincipal: e.target.checked})}
              />
              Establecer como principal
            </label>
            <button type="submit" className="w-full bg-gray-800 text-white py-2 rounded-xl font-bold text-sm">
              Agregar Dirección
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-700 mb-6">Acciones Rápidas</h2>
          <div className="grid gap-4">
            <Link to="/mis-ordenes" className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xl">🛍️</span>
                <div className="text-left">
                  <p className="font-bold text-gray-800">Mis Órdenes</p>
                  <p className="text-xs text-gray-500">Ver historial y facturas</p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
            <Link to="/wishlist" className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xl">❤️</span>
                <div className="text-left">
                  <p className="font-bold text-gray-800">Lista de Deseos</p>
                  <p className="text-xs text-gray-500">Productos que te gustan</p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
