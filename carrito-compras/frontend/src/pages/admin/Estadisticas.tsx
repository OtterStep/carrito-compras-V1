import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, ScatterChart, Scatter, ZAxis,
  ComposedChart, Area
} from 'recharts';
import { estadisticaService } from '../../services/estadistica.service';

const Estadisticas = () => {
  const [tendencia, setTendencia] = useState<any[]>([]);
  const [abc, setAbc] = useState<any[]>([]);
  const [rfm, setRfm] = useState<any[]>([]);
  const [abandono, setAbandono] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [cohorte, setCohorte] = useState<any[]>([]);
  const [correlacion, setCorrelacion] = useState<any[]>([]);
  const [ticketSegmento, setTicketSegmento] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          resTendencia, resABC, resRFM, resAbandono, 
          resHeatmap, resCohorte, resCorrelacion, resTicket
        ] = await Promise.all([
          estadisticaService.getTendencia(),
          estadisticaService.getAnalisisABC(),
          estadisticaService.getRFM(),
          estadisticaService.getAbandono(),
          estadisticaService.getHeatmap(),
          estadisticaService.getCohorte(),
          estadisticaService.getCorrelacionDescuento(),
          estadisticaService.getTicketSegmento()
        ]);
        
        setTendencia(resTendencia.data || []);
        setAbc(resABC.data || []);
        setRfm(resRFM.data || []);
        setAbandono(resAbandono.data);
        setHeatmap(resHeatmap.data || []);
        setCohorte(resCohorte.data || []);
        setCorrelacion(resCorrelacion.data || []);
        setTicketSegmento(resTicket.data || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-500 animate-pulse">Calculando métricas avanzadas...</p>
    </div>
  );

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="animate-fade-in p-6 space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Panel de Inteligencia de Negocios</h1>
          <p className="text-gray-500">Análisis descriptivo y predictivo del e-commerce</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-400">Tasa de Abandono</p>
          <p className="text-2xl font-bold text-red-500">{abandono?.tasaAbandono}%</p>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tendencia, Pronóstico y Regresión */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-1 text-gray-800">Tendencia y Pronóstico de Ventas</h2>
          <p className="text-xs text-gray-400 mb-6">Ingresos reales, Regresión Lineal y Promedio Móvil</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={tendencia}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="total" name="Ventas Reales" fill="#eff6ff" stroke="#3b82f6" strokeWidth={3} />
                <Line type="monotone" dataKey="pronostico" name="Pronóstico (PM3)" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey="regresion" name="Regresión Lineal" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mapa de Calor */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-1 text-gray-800">Distribución de Ventas (Heatmap)</h2>
          <p className="text-xs text-gray-400 mb-6">Ventas por día de la semana y hora del día</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis type="category" dataKey="dia" name="Día" />
                <YAxis type="number" dataKey="hora" name="Hora" unit=":00" range={[0, 23]} />
                <ZAxis type="number" dataKey="valor" range={[50, 400]} name="Ventas" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Ventas" data={heatmap} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Análisis ABC */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-1 text-gray-800">Análisis ABC de Productos</h2>
          <p className="text-xs text-gray-400 mb-6">Clasificación por contribución al ingreso (Ley de Pareto)</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={abc.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="nombre" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="ingresos" name="Ingresos ($)">
                  {abc.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.clase === 'A' ? '#10b981' : entry.clase === 'B' ? '#3b82f6' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-xs font-medium">
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-[#10b981] rounded-full"></div> Clase A (80%)</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-[#3b82f6] rounded-full"></div> Clase B (15%)</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-[#94a3b8] rounded-full"></div> Clase C (5%)</span>
          </div>
        </div>

        {/* Correlación Descuento vs Venta */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-1 text-gray-800">Correlación Descuento vs Volumen</h2>
          <p className="text-xs text-gray-400 mb-6">Relación entre el porcentaje de descuento y unidades vendidas</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" dataKey="descuento" name="Descuento" unit="%" />
                <YAxis type="number" dataKey="volumenVenta" name="Unidades" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Ventas" data={correlacion} fill="#ef4444" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cohorte de Clientes */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Análisis de Cohorte (Retención)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr>
                  <th className="p-2 border bg-gray-50">Cohorte (Mes)</th>
                  <th className="p-2 border bg-gray-50">Usuarios</th>
                  {[0, 1, 2, 3, 4, 5].map(m => (
                    <th key={m} className="p-2 border bg-gray-50">Mes {m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohorte.map((c, i) => (
                  <tr key={i}>
                    <td className="p-2 border font-bold">{c.mes}</td>
                    <td className="p-2 border text-center">{c.total}</td>
                    {[0, 1, 2, 3, 4, 5].map(m => {
                      const dataMes = c.data.find((d: any) => d.mesRelativo === m);
                      const porcentaje = dataMes ? dataMes.porcentaje : 0;
                      return (
                        <td 
                          key={m} 
                          className="p-2 border text-center font-medium"
                          style={{ backgroundColor: `rgba(59, 130, 246, ${porcentaje / 100})`, color: porcentaje > 50 ? 'white' : 'black' }}
                        >
                          {porcentaje}%
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Distribución Ticket por Segmento */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Ticket Promedio por Segmento</h2>
          <div className="space-y-4">
            {ticketSegmento.map((t, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-gray-600">
                  <span>{t.segmento}</span>
                  <span>Mediana: ${t.mediana}</span>
                </div>
                <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-blue-500 bg-opacity-30"
                    style={{ left: `${(t.q1 / t.max) * 100}%`, width: `${((t.q3 - t.q1) / t.max) * 100}%` }}
                  ></div>
                  <div 
                    className="absolute h-full w-1 bg-blue-700"
                    style={{ left: `${(t.mediana / t.max) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Min: ${t.min}</span>
                  <span>Max: ${t.max}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Segmentación RFM */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Segmentación RFM de Clientes</h2>
            <div className="flex gap-2">
              <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">Recencia</span>
              <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">Frecuencia</span>
              <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">Monetario</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-50">
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium">Segmento</th>
                  <th className="pb-3 font-medium">Recencia (días)</th>
                  <th className="pb-3 font-medium">Frecuencia</th>
                  <th className="pb-3 font-medium text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rfm.slice(0, 5).map((u, i) => (
                  <tr key={i} className="text-sm">
                    <td className="py-4 font-medium text-gray-700">{u.usuario}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                        u.segmento === 'VIP' ? 'bg-purple-100 text-purple-700' : 
                        u.segmento === 'Nuevo' ? 'bg-blue-100 text-blue-700' : 
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {u.segmento}
                      </span>
                    </td>
                    <td className="py-4 text-gray-500">{u.recencia}</td>
                    <td className="py-4 text-gray-500">{u.frecuencia}</td>
                    <td className="py-4 text-right font-bold text-gray-900">${u.valorMonetario.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen de Ticket Promedio */}
        <div className="bg-blue-600 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Resumen Ejecutivo</h2>
            <p className="text-blue-100 text-sm">Conversión y Abandono</p>
          </div>
          <div className="space-y-6">
            <div className="bg-blue-500 bg-opacity-30 p-4 rounded-xl">
              <p className="text-xs text-blue-100 mb-1 uppercase tracking-wider font-bold">Órdenes Finalizadas</p>
              <p className="text-3xl font-black">{abandono?.totalOrdenes}</p>
            </div>
            <div className="bg-blue-500 bg-opacity-30 p-4 rounded-xl">
              <p className="text-xs text-blue-100 mb-1 uppercase tracking-wider font-bold">Carritos Totales</p>
              <p className="text-3xl font-black">{abandono?.totalCarritos}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-blue-400">
            <p className="text-xs text-blue-100 italic">"La tasa de abandono de {abandono?.tasaAbandono}% sugiere optimizar el proceso de checkout."</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;
