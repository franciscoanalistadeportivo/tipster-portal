'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  AlertTriangle, TrendingUp, TrendingDown, Users, Calendar,
  CheckCircle, XCircle, Eye, Pause, Play, RefreshCw, 
  ChevronDown, ChevronUp, Bell, Activity, DollarSign,
  Shield, Clock, Filter, Search
} from 'lucide-react';

// ============================================================
// TIPOS
// ============================================================

interface ResumenAdmin {
  tipsters_activos: number;
  apuestas_hoy: number;
  apuestas_mes: number;
  ganancia_mes: number;
  alertas_criticas: number;
  alertas_alerta: number;
  alertas_precaucion: number;
  alertas_total_pendientes: number;
}

interface TipsterMonitor {
  tipster_id: number;
  alias: string;
  deporte: string;
  estrategia_activa: string;
  wr_historico: number;
  roi_historico: number;
  total_apuestas: number;
  estado: string;
  racha_actual: number;
  wr_mes: number;
  apuestas_mes: number;
  alertas_criticas: number;
  alertas_alerta: number;
  alertas_precaucion: number;
  mercados_config: Record<string, MercadoConfig>;
}

interface MercadoConfig {
  multiplicador: number;
  win_rate: number;
  prioridad: string;
  activo: boolean;
}

interface Alerta {
  id: number;
  tipster_id: number;
  alias: string;
  deporte: string;
  tipo_alerta: string;
  nivel: string;
  mercado: string | null;
  valor_anterior: number;
  valor_actual: number;
  diferencia: number;
  mensaje: string;
  recomendacion: string;
  fecha_alerta: string;
  dias_sin_revisar: number;
}

interface HistorialAccion {
  id: number;
  fecha_accion: string;
  alias: string;
  tipo_accion: string;
  mercado: string | null;
  valor_anterior: string;
  valor_nuevo: string;
  motivo: string;
  usuario: string;
}

// ============================================================
// API CLIENT CON SEGURIDAD
// ============================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://tu-api.pythonanywhere.com';

const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

const adminAPI = {
  getResumen: async (): Promise<ResumenAdmin> => {
    const res = await fetch(`${API_BASE}/api/admin/resumen`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Error al obtener resumen');
    const data = await res.json();
    return data.data;
  },
  
  getTipsters: async (): Promise<TipsterMonitor[]> => {
    const res = await fetch(`${API_BASE}/api/admin/tipsters`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Error al obtener tipsters');
    const data = await res.json();
    return data.data;
  },
  
  getAlertas: async (): Promise<Alerta[]> => {
    const res = await fetch(`${API_BASE}/api/admin/alertas`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Error al obtener alertas');
    const data = await res.json();
    return data.data;
  },
  
  getHistorial: async (): Promise<HistorialAccion[]> => {
    const res = await fetch(`${API_BASE}/api/admin/historial`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Error al obtener historial');
    const data = await res.json();
    return data.data;
  },
  
  resolverAlerta: async (alertaId: number, accion: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/admin/alertas/${alertaId}/resolver`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ accion_tomada: accion }),
    });
    if (!res.ok) throw new Error('Error al resolver alerta');
  },
  
  ignorarAlerta: async (alertaId: number, motivo: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/admin/alertas/${alertaId}/ignorar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ motivo }),
    });
    if (!res.ok) throw new Error('Error al ignorar alerta');
  },
  
  actualizarMultiplicador: async (tipsterId: number, mercado: string, multiplicador: number, motivo: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/admin/tipsters/${tipsterId}/mercado`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ mercado, multiplicador, motivo }),
    });
    if (!res.ok) throw new Error('Error al actualizar multiplicador');
  },
  
  pausarTipster: async (tipsterId: number, motivo: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/admin/tipsters/${tipsterId}/pausar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ motivo }),
    });
    if (!res.ok) throw new Error('Error al pausar tipster');
  },
  
  activarTipster: async (tipsterId: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/admin/tipsters/${tipsterId}/activar`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al activar tipster');
  },
  
  detectarAlertas: async (): Promise<string> => {
    const res = await fetch(`${API_BASE}/api/admin/detectar-alertas`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al detectar alertas');
    const data = await res.json();
    return data.message;
  },
};

// ============================================================
// COMPONENTES
// ============================================================

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CL', { 
    style: 'currency', 
    currency: 'CLP', 
    maximumFractionDigits: 0 
  }).format(value);
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Tarjeta de resumen
const ResumenCard = ({ 
  icon, 
  label, 
  value, 
  color = 'text-white',
  bgColor = 'bg-[#1E293B]'
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  color?: string;
  bgColor?: string;
}) => (
  <div className={`${bgColor} rounded-xl p-4 border border-[#334155]`}>
    <div className="flex items-center gap-2 mb-2">
      <span className="text-[#94A3B8]">{icon}</span>
      <span className="text-xs text-[#94A3B8] uppercase">{label}</span>
    </div>
    <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
  </div>
);

// Badge de alerta
const AlertaBadge = ({ nivel }: { nivel: string }) => {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    'CRITICO': { bg: 'bg-red-500/20', text: 'text-red-400', icon: <AlertTriangle className="h-3 w-3" /> },
    'ALERTA': { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: <AlertTriangle className="h-3 w-3" /> },
    'PRECAUCION': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: <Eye className="h-3 w-3" /> },
    'INFO': { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <Bell className="h-3 w-3" /> },
  };
  
  const c = config[nivel] || config['INFO'];
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
      {c.icon} {nivel}
    </span>
  );
};

// Badge de estado
const EstadoBadge = ({ estado }: { estado: string }) => {
  const isActive = estado === 'ACTIVO';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
      isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
    }`}>
      {isActive ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
      {estado}
    </span>
  );
};

// Badge de racha
const RachaBadge = ({ racha }: { racha: number }) => {
  const color = racha >= 3 ? 'text-amber-400' : racha > 0 ? 'text-green-400' : racha === 0 ? 'text-blue-400' : racha >= -2 ? 'text-yellow-400' : 'text-red-400';
  const emoji = racha >= 3 ? '🔥' : racha > 0 ? '📈' : racha === 0 ? '➡️' : '📉';
  
  return (
    <span className={`font-mono font-bold ${color}`}>
      {emoji} {racha > 0 ? `+${racha}` : racha}
    </span>
  );
};

// Tarjeta de alerta
const AlertaCard = ({ 
  alerta, 
  onResolver, 
  onIgnorar 
}: { 
  alerta: Alerta; 
  onResolver: (id: number) => void;
  onIgnorar: (id: number) => void;
}) => (
  <div className={`bg-[#1E293B] rounded-xl p-4 border ${
    alerta.nivel === 'CRITICO' ? 'border-red-500/50' :
    alerta.nivel === 'ALERTA' ? 'border-orange-500/50' :
    'border-yellow-500/50'
  }`}>
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        <AlertaBadge nivel={alerta.nivel} />
        <span className="text-white font-bold">{alerta.alias}</span>
        <span className="text-xs text-[#94A3B8]">• {alerta.deporte}</span>
      </div>
      <span className="text-xs text-[#94A3B8]">Hace {alerta.dias_sin_revisar} días</span>
    </div>
    
    <p className="text-sm text-[#94A3B8] mb-2">{alerta.mensaje}</p>
    
    {alerta.recomendacion && (
      <p className="text-xs text-[#00D1B2] mb-3">
        💡 {alerta.recomendacion}
      </p>
    )}
    
    <div className="flex gap-2">
      <button 
        onClick={() => onResolver(alerta.id)}
        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/30 transition-colors"
      >
        <CheckCircle className="h-3 w-3" /> Resolver
      </button>
      <button 
        onClick={() => onIgnorar(alerta.id)}
        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#334155] text-[#94A3B8] rounded-lg text-xs font-bold hover:bg-[#475569] transition-colors"
      >
        <XCircle className="h-3 w-3" /> Ignorar
      </button>
    </div>
  </div>
);

// Fila de tipster expandible
const TipsterRow = ({ 
  tipster, 
  onPausar, 
  onActivar,
  onActualizarMercado 
}: { 
  tipster: TipsterMonitor;
  onPausar: (id: number) => void;
  onActivar: (id: number) => void;
  onActualizarMercado: (tipsterId: number, mercado: string, mult: number) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const totalAlertas = tipster.alertas_criticas + tipster.alertas_alerta + tipster.alertas_precaucion;
  
  return (
    <>
      <tr 
        className="border-b border-[#334155] hover:bg-[#0F172A]/50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            {expanded ? <ChevronUp className="h-4 w-4 text-[#94A3B8]" /> : <ChevronDown className="h-4 w-4 text-[#94A3B8]" />}
            <span className="font-bold text-white">{tipster.alias}</span>
          </div>
        </td>
        <td className="py-3 px-4 text-[#94A3B8] text-sm">{tipster.deporte}</td>
        <td className="py-3 px-4"><RachaBadge racha={tipster.racha_actual || 0} /></td>
        <td className="py-3 px-4 font-mono text-sm text-white">{tipster.wr_mes?.toFixed(1) || '-'}%</td>
        <td className="py-3 px-4 font-mono text-sm">
          <span className={tipster.roi_historico >= 0 ? 'text-[#00D1B2]' : 'text-red-400'}>
            {tipster.roi_historico >= 0 ? '+' : ''}{tipster.roi_historico?.toFixed(2)}%
          </span>
        </td>
        <td className="py-3 px-4"><EstadoBadge estado={tipster.estado} /></td>
        <td className="py-3 px-4">
          {totalAlertas > 0 ? (
            <div className="flex gap-1">
              {tipster.alertas_criticas > 0 && <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">🔴 {tipster.alertas_criticas}</span>}
              {tipster.alertas_alerta > 0 && <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs">🟠 {tipster.alertas_alerta}</span>}
              {tipster.alertas_precaucion > 0 && <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">🟡 {tipster.alertas_precaucion}</span>}
            </div>
          ) : (
            <span className="text-green-400 text-xs">✅ OK</span>
          )}
        </td>
        <td className="py-3 px-4">
          {tipster.estado === 'ACTIVO' ? (
            <button 
              onClick={(e) => { e.stopPropagation(); onPausar(tipster.tipster_id); }}
              className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
              title="Pausar tipster"
            >
              <Pause className="h-4 w-4" />
            </button>
          ) : (
            <button 
              onClick={(e) => { e.stopPropagation(); onActivar(tipster.tipster_id); }}
              className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
              title="Activar tipster"
            >
              <Play className="h-4 w-4" />
            </button>
          )}
        </td>
      </tr>
      
      {expanded && tipster.mercados_config && (
        <tr>
          <td colSpan={8} className="bg-[#0F172A] p-4">
            <div className="text-xs text-[#94A3B8] mb-2">Configuración de Mercados:</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {Object.entries(tipster.mercados_config).map(([mercado, config]) => (
                <div 
                  key={mercado}
                  className={`p-2 rounded-lg border ${
                    config.multiplicador === 0 ? 'border-red-500/30 bg-red-500/10' :
                    config.multiplicador >= 1.3 ? 'border-green-500/30 bg-green-500/10' :
                    'border-[#334155] bg-[#1E293B]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-xs font-bold">{mercado}</span>
                    <span className={`text-xs ${config.activo ? 'text-green-400' : 'text-red-400'}`}>
                      {config.activo ? '✅' : '❌'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94A3B8]">WR: {config.win_rate}%</span>
                    <span className="text-[#00D1B2] font-mono">×{config.multiplicador}</span>
                  </div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function AdminDashboard() {
  const [resumen, setResumen] = useState<ResumenAdmin | null>(null);
  const [tipsters, setTipsters] = useState<TipsterMonitor[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [historial, setHistorial] = useState<HistorialAccion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'alertas' | 'tipsters' | 'historial'>('alertas');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [resumenData, tipstersData, alertasData, historialData] = await Promise.all([
        adminAPI.getResumen(),
        adminAPI.getTipsters(),
        adminAPI.getAlertas(),
        adminAPI.getHistorial(),
      ]);
      
      setResumen(resumenData);
      setTipsters(tipstersData);
      setAlertas(alertasData);
      setHistorial(historialData);
      setError(null);
    } catch (err) {
      setError('Error al cargar datos. Verifica tu conexión.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh cada 5 minutos
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleResolverAlerta = async (alertaId: number) => {
    const accion = prompt('¿Qué acción tomaste?');
    if (!accion) return;
    
    try {
      await adminAPI.resolverAlerta(alertaId, accion);
      fetchData();
    } catch (err) {
      alert('Error al resolver alerta');
    }
  };

  const handleIgnorarAlerta = async (alertaId: number) => {
    const motivo = prompt('¿Por qué ignoras esta alerta?', 'Racha temporal');
    if (!motivo) return;
    
    try {
      await adminAPI.ignorarAlerta(alertaId, motivo);
      fetchData();
    } catch (err) {
      alert('Error al ignorar alerta');
    }
  };

  const handlePausarTipster = async (tipsterId: number) => {
    const motivo = prompt('¿Por qué pausas este tipster?');
    if (!motivo) return;
    
    try {
      await adminAPI.pausarTipster(tipsterId, motivo);
      fetchData();
    } catch (err) {
      alert('Error al pausar tipster');
    }
  };

  const handleActivarTipster = async (tipsterId: number) => {
    if (!confirm('¿Activar este tipster?')) return;
    
    try {
      await adminAPI.activarTipster(tipsterId);
      fetchData();
    } catch (err) {
      alert('Error al activar tipster');
    }
  };

  const handleActualizarMercado = async (tipsterId: number, mercado: string, multiplicador: number) => {
    const motivo = prompt(`¿Por qué cambias el multiplicador de ${mercado}?`);
    if (!motivo) return;
    
    try {
      await adminAPI.actualizarMultiplicador(tipsterId, mercado, multiplicador, motivo);
      fetchData();
    } catch (err) {
      alert('Error al actualizar multiplicador');
    }
  };

  const handleDetectarAlertas = async () => {
    try {
      const message = await adminAPI.detectarAlertas();
      alert(message);
      fetchData();
    } catch (err) {
      alert('Error al detectar alertas');
    }
  };

  const filteredTipsters = tipsters.filter(t => 
    t.alias.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F172A]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#00D1B2]/30 border-t-[#00D1B2] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#94A3B8]">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F172A]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-[#00D1B2] text-white rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#00D1B2]" />
            Panel de Control Admin
          </h1>
          <p className="text-[#94A3B8] text-sm mt-1">
            Sistema de alertas y monitoreo de tipsters
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDetectarAlertas}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
          >
            <Bell className="h-4 w-4" />
            Detectar Alertas
          </button>
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] text-[#94A3B8] rounded-lg hover:bg-[#334155] transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Resumen Cards */}
      {resumen && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <ResumenCard 
            icon={<Users className="h-4 w-4" />} 
            label="Tipsters" 
            value={resumen.tipsters_activos} 
          />
          <ResumenCard 
            icon={<Calendar className="h-4 w-4" />} 
            label="Hoy" 
            value={resumen.apuestas_hoy} 
          />
          <ResumenCard 
            icon={<Activity className="h-4 w-4" />} 
            label="Este Mes" 
            value={resumen.apuestas_mes} 
          />
          <ResumenCard 
            icon={<DollarSign className="h-4 w-4" />} 
            label="Ganancia Mes" 
            value={formatCurrency(resumen.ganancia_mes)}
            color={resumen.ganancia_mes >= 0 ? 'text-[#00D1B2]' : 'text-red-400'}
          />
          <ResumenCard 
            icon={<AlertTriangle className="h-4 w-4" />} 
            label="Críticas" 
            value={resumen.alertas_criticas}
            color="text-red-400"
            bgColor={resumen.alertas_criticas > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-[#1E293B]'}
          />
          <ResumenCard 
            icon={<AlertTriangle className="h-4 w-4" />} 
            label="Alertas" 
            value={resumen.alertas_alerta}
            color="text-orange-400"
          />
          <ResumenCard 
            icon={<Eye className="h-4 w-4" />} 
            label="Precaución" 
            value={resumen.alertas_precaucion}
            color="text-yellow-400"
          />
          <ResumenCard 
            icon={<Bell className="h-4 w-4" />} 
            label="Total Pend." 
            value={resumen.alertas_total_pendientes}
            color={resumen.alertas_total_pendientes > 0 ? 'text-amber-400' : 'text-green-400'}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['alertas', 'tipsters', 'historial'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab 
                ? 'bg-[#00D1B2] text-white' 
                : 'bg-[#1E293B] text-[#94A3B8] hover:bg-[#334155]'
            }`}
          >
            {tab === 'alertas' && `🚨 Alertas (${alertas.length})`}
            {tab === 'tipsters' && `👥 Tipsters (${tipsters.length})`}
            {tab === 'historial' && `📜 Historial`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-[#1E293B] rounded-xl border border-[#334155]">
        {/* Tab: Alertas */}
        {activeTab === 'alertas' && (
          <div className="p-4">
            {alertas.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-green-400 font-bold">¡Todo en orden!</p>
                <p className="text-[#94A3B8] text-sm">No hay alertas pendientes</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {alertas.map(alerta => (
                  <AlertaCard 
                    key={alerta.id} 
                    alerta={alerta}
                    onResolver={handleResolverAlerta}
                    onIgnorar={handleIgnorarAlerta}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Tipsters */}
        {activeTab === 'tipsters' && (
          <div>
            <div className="p-4 border-b border-[#334155]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar tipster..."
                  className="w-full pl-10 pr-4 py-2 bg-[#0F172A] border border-[#334155] rounded-lg text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#00D1B2]"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0F172A]">
                  <tr className="text-left text-xs text-[#94A3B8] uppercase">
                    <th className="py-3 px-4">Tipster</th>
                    <th className="py-3 px-4">Deporte</th>
                    <th className="py-3 px-4">Racha</th>
                    <th className="py-3 px-4">WR Mes</th>
                    <th className="py-3 px-4">ROI</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Alertas</th>
                    <th className="py-3 px-4">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTipsters.map(tipster => (
                    <TipsterRow 
                      key={tipster.tipster_id}
                      tipster={tipster}
                      onPausar={handlePausarTipster}
                      onActivar={handleActivarTipster}
                      onActualizarMercado={handleActualizarMercado}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Historial */}
        {activeTab === 'historial' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0F172A]">
                <tr className="text-left text-xs text-[#94A3B8] uppercase">
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Tipster</th>
                  <th className="py-3 px-4">Acción</th>
                  <th className="py-3 px-4">Mercado</th>
                  <th className="py-3 px-4">Cambio</th>
                  <th className="py-3 px-4">Motivo</th>
                  <th className="py-3 px-4">Usuario</th>
                </tr>
              </thead>
              <tbody>
                {historial.map(accion => (
                  <tr key={accion.id} className="border-b border-[#334155] hover:bg-[#0F172A]/50">
                    <td className="py-3 px-4 text-xs text-[#94A3B8] font-mono">
                      {formatDate(accion.fecha_accion)}
                    </td>
                    <td className="py-3 px-4 text-white font-bold text-sm">{accion.alias}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-[#334155] text-[#94A3B8] rounded text-xs">
                        {accion.tipo_accion.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8] text-sm">{accion.mercado || '-'}</td>
                    <td className="py-3 px-4 text-sm">
                      {accion.valor_anterior && accion.valor_nuevo && (
                        <span className="font-mono">
                          <span className="text-red-400">{accion.valor_anterior}</span>
                          {' → '}
                          <span className="text-green-400">{accion.valor_nuevo}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8] text-xs max-w-[200px] truncate">
                      {accion.motivo}
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8] text-xs">{accion.usuario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
