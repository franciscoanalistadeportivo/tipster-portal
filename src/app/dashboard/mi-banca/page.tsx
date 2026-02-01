'use client';

import { useEffect, useState } from 'react';
import { 
  Wallet, TrendingUp, TrendingDown, Plus, Check, X, 
  Calendar, Target, BarChart3, PiggyBank, Lightbulb,
  Edit3, Save, Filter, ChevronDown, ChevronUp, Flame
} from 'lucide-react';
import { apuestasUsuarioAPI, tipstersAPI } from '@/lib/api';

// ============================================================================
// TIPOS
// ============================================================================
interface ApuestaUsuario {
  id: number;
  fecha: string;
  apuesta: string;
  cuota: number;
  stake: number;
  resultado: 'PENDIENTE' | 'GANADA' | 'PERDIDA';
  tipster_alias?: string;
  ganancia_neta?: number;
}

interface PickRecomendado {
  id: number;
  tipster_alias: string;
  tipster_yield: number;
  apuesta: string;
  cuota: number;
  tipo_mercado: string;
  fecha: string;
}

interface EstadisticasUsuario {
  banca_actual: number;
  total_apostado: number;
  ganancia_neta: number;
  roi: number;
  yield: number;
  total_apuestas: number;
  ganadas: number;
  perdidas: number;
  pendientes: number;
  mejor_racha: number;
}

// ============================================================================
// COMPONENTE: Intro Mi Banca
// ============================================================================
const IntroBanca = () => (
  <div className="rounded-2xl p-4 border border-[#00D1B2]/30 bg-gradient-to-br from-[#00D1B2]/10 to-transparent">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#00D1B2]/20 flex items-center justify-center flex-shrink-0">
        <Lightbulb className="h-5 w-5 text-[#00D1B2]" />
      </div>
      <div>
        <h3 className="text-white font-bold mb-1">Tu Banca = Tu Inversión</h3>
        <p className="text-[#94A3B8] text-sm">
          Gestiona tus apuestas como un inversionista. Define tu banca, registra cada apuesta, 
          y mira crecer tu capital a largo plazo con disciplina y buenos picks.
        </p>
      </div>
    </div>
  </div>
);

// ============================================================================
// COMPONENTE: Banca Editable
// ============================================================================
const BancaEditable = ({ 
  banca, 
  onSave 
}: { 
  banca: number; 
  onSave: (nuevaBanca: number) => void;
}) => {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(banca.toString());

  const handleSave = () => {
    const nuevaBanca = parseFloat(valor) || 0;
    if (nuevaBanca > 0) {
      onSave(nuevaBanca);
      setEditando(false);
    }
  };

  return (
    <div className="rounded-2xl p-6 border border-white/10" style={{ background: 'rgba(30,41,59,0.7)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-[#00D1B2]" />
          Mi Banca
        </h3>
        {!editando ? (
          <button 
            onClick={() => setEditando(true)}
            className="p-2 rounded-lg bg-[#334155] hover:bg-[#475569] transition-colors"
          >
            <Edit3 className="h-4 w-4 text-[#94A3B8]" />
          </button>
        ) : (
          <button 
            onClick={handleSave}
            className="p-2 rounded-lg bg-[#00D1B2] hover:bg-[#00B89F] transition-colors"
          >
            <Save className="h-4 w-4 text-white" />
          </button>
        )}
      </div>
      
      {editando ? (
        <div className="flex items-center gap-2">
          <span className="text-[#94A3B8] text-2xl">$</span>
          <input
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="text-4xl font-bold font-mono text-[#00D1B2] bg-transparent border-b-2 border-[#00D1B2] focus:outline-none w-full"
            autoFocus
          />
        </div>
      ) : (
        <p className="text-4xl font-bold font-mono text-[#00D1B2]">
          ${banca.toLocaleString()}
        </p>
      )}
      
      <p className="text-[#64748B] text-sm mt-2">
        Capital inicial para apuestas
      </p>
    </div>
  );
};

// ============================================================================
// COMPONENTE: Modal Registrar Apuesta
// ============================================================================
const ModalRegistrarApuesta = ({ 
  isOpen, 
  onClose, 
  onSave,
  banca,
  picksDelDia
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (apuesta: Omit<ApuestaUsuario, 'id' | 'resultado' | 'ganancia_neta'>) => void;
  banca: number;
  picksDelDia: PickRecomendado[];
}) => {
  const [modo, setModo] = useState<'picks' | 'manual'>('picks');
  const [apuesta, setApuesta] = useState('');
  const [cuota, setCuota] = useState('');
  const [stake, setStake] = useState('');
  const [pickSeleccionado, setPickSeleccionado] = useState<PickRecomendado | null>(null);

  // Calcular stake recomendado (1-3% de banca según confianza)
  const calcularStakeRecomendado = (cuotaVal: number): number => {
    const porcentaje = cuotaVal <= 1.5 ? 0.03 : cuotaVal <= 2.0 ? 0.02 : 0.01;
    return Math.round(banca * porcentaje);
  };

  const handleSelectPick = (pick: PickRecomendado) => {
    setPickSeleccionado(pick);
    setApuesta(pick.apuesta);
    setCuota(pick.cuota.toString());
    setStake(calcularStakeRecomendado(pick.cuota).toString());
    setModo('manual'); // Pasar a edición para ajustar si quiere
  };

  const handleSubmit = () => {
    if (!apuesta || !cuota || !stake) return;
    
    onSave({
      fecha: new Date().toISOString().split('T')[0],
      apuesta,
      cuota: parseFloat(cuota),
      stake: parseFloat(stake),
      tipster_alias: pickSeleccionado?.tipster_alias
    });
    
    // Reset
    setApuesta('');
    setCuota('');
    setStake('');
    setPickSeleccionado(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1E293B] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-white font-bold text-xl mb-4">Registrar Apuesta</h3>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setModo('picks')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              modo === 'picks' 
                ? 'bg-[#00D1B2] text-white' 
                : 'bg-[#334155] text-[#94A3B8]'
            }`}
          >
            Picks del Día
          </button>
          <button
            onClick={() => setModo('manual')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              modo === 'manual' 
                ? 'bg-[#00D1B2] text-white' 
                : 'bg-[#334155] text-[#94A3B8]'
            }`}
          >
            Manual
          </button>
        </div>

        {/* Picks del día */}
        {modo === 'picks' && (
          <div className="space-y-2 mb-4">
            {picksDelDia.length === 0 ? (
              <p className="text-[#64748B] text-center py-4">No hay picks pendientes hoy</p>
            ) : (
              picksDelDia.map((pick) => (
                <button
                  key={pick.id}
                  onClick={() => handleSelectPick(pick)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    pickSeleccionado?.id === pick.id
                      ? 'border-[#00D1B2] bg-[#00D1B2]/10'
                      : 'border-white/10 bg-[#0F172A]/50 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[#00D1B2] text-sm font-medium">{pick.tipster_alias}</span>
                    <span className="text-xs text-[#64748B]">Yield: +{pick.tipster_yield.toFixed(1)}%</span>
                  </div>
                  <p className="text-white text-sm">{pick.apuesta}</p>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-[#94A3B8]">{pick.tipo_mercado}</span>
                    <span className="text-white font-mono">@{pick.cuota.toFixed(2)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Formulario manual */}
        {modo === 'manual' && (
          <div className="space-y-4">
            <div>
              <label className="text-[#94A3B8] text-sm mb-1 block">Apuesta</label>
              <input
                type="text"
                value={apuesta}
                onChange={(e) => setApuesta(e.target.value)}
                placeholder="Ej: Real Madrid vs Barcelona - Over 2.5"
                className="w-full px-4 py-3 rounded-xl bg-[#0F172A] border border-white/10 text-white placeholder-[#64748B] focus:outline-none focus:border-[#00D1B2]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[#94A3B8] text-sm mb-1 block">Cuota</label>
                <input
                  type="number"
                  step="0.01"
                  value={cuota}
                  onChange={(e) => {
                    setCuota(e.target.value);
                    if (e.target.value) {
                      setStake(calcularStakeRecomendado(parseFloat(e.target.value)).toString());
                    }
                  }}
                  placeholder="@1.85"
                  className="w-full px-4 py-3 rounded-xl bg-[#0F172A] border border-white/10 text-white placeholder-[#64748B] focus:outline-none focus:border-[#00D1B2]"
                />
              </div>
              <div>
                <label className="text-[#94A3B8] text-sm mb-1 block">Stake ($)</label>
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  placeholder="10000"
                  className="w-full px-4 py-3 rounded-xl bg-[#0F172A] border border-white/10 text-white placeholder-[#64748B] focus:outline-none focus:border-[#00D1B2]"
                />
              </div>
            </div>

            {cuota && stake && (
              <div className="p-3 rounded-xl bg-[#00D1B2]/10 border border-[#00D1B2]/30">
                <p className="text-sm text-[#94A3B8]">Recomendación IA</p>
                <p className="text-[#00D1B2] font-medium">
                  Stake sugerido: ${calcularStakeRecomendado(parseFloat(cuota)).toLocaleString()} 
                  <span className="text-xs text-[#64748B]"> ({((calcularStakeRecomendado(parseFloat(cuota)) / banca) * 100).toFixed(1)}% de tu banca)</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[#334155] text-[#94A3B8] font-medium hover:bg-[#475569] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!apuesta || !cuota || !stake}
            className="flex-1 py-3 rounded-xl bg-[#00D1B2] text-white font-medium hover:bg-[#00B89F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: Card Apuesta Usuario
// ============================================================================
const CardApuestaUsuario = ({ 
  apuesta, 
  onMarcarResultado 
}: { 
  apuesta: ApuestaUsuario;
  onMarcarResultado: (id: number, resultado: 'GANADA' | 'PERDIDA') => void;
}) => {
  const isPendiente = apuesta.resultado === 'PENDIENTE';
  const isGanada = apuesta.resultado === 'GANADA';
  const isPerdida = apuesta.resultado === 'PERDIDA';

  return (
    <div className={`rounded-xl p-4 border ${
      isGanada ? 'border-[#00D1B2]/30 bg-[#00D1B2]/5' :
      isPerdida ? 'border-[#EF4444]/30 bg-[#EF4444]/5' :
      'border-[#F59E0B]/30 bg-[#F59E0B]/5'
    }`}>
      {/* Apuesta */}
      <p className="text-white font-medium mb-2">{apuesta.apuesta}</p>
      
      {/* Detalles */}
      <div className="flex items-center justify-between text-sm mb-3">
        <div className="flex items-center gap-2 text-[#94A3B8]">
          <span>{apuesta.fecha}</span>
          {apuesta.tipster_alias && (
            <>
              <span>•</span>
              <span className="text-[#00D1B2]">{apuesta.tipster_alias}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-white">@{apuesta.cuota.toFixed(2)}</span>
          <span className="text-[#64748B]">|</span>
          <span className="font-mono text-[#FFDD57]">${apuesta.stake.toLocaleString()}</span>
        </div>
      </div>

      {/* Resultado o Botones */}
      {isPendiente ? (
        <div className="flex gap-2">
          <button
            onClick={() => onMarcarResultado(apuesta.id, 'GANADA')}
            className="flex-1 py-2 rounded-lg bg-[#00D1B2]/20 text-[#00D1B2] font-medium hover:bg-[#00D1B2]/30 transition-colors flex items-center justify-center gap-2"
          >
            <Check className="h-4 w-4" /> Ganada
          </button>
          <button
            onClick={() => onMarcarResultado(apuesta.id, 'PERDIDA')}
            className="flex-1 py-2 rounded-lg bg-[#EF4444]/20 text-[#EF4444] font-medium hover:bg-[#EF4444]/30 transition-colors flex items-center justify-center gap-2"
          >
            <X className="h-4 w-4" /> Perdida
          </button>
        </div>
      ) : (
        <div className={`flex items-center justify-between py-2 px-3 rounded-lg ${
          isGanada ? 'bg-[#00D1B2]/20' : 'bg-[#EF4444]/20'
        }`}>
          <span className={`font-medium ${isGanada ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
            {isGanada ? '✓ Ganada' : '✗ Perdida'}
          </span>
          <span className={`font-mono font-bold ${isGanada ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
            {isGanada ? '+' : ''}{apuesta.ganancia_neta?.toLocaleString() || 
              (isGanada 
                ? `+${Math.round(apuesta.stake * (apuesta.cuota - 1)).toLocaleString()}` 
                : `-${apuesta.stake.toLocaleString()}`
              )
            }
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENTE: Estadísticas
// ============================================================================
const Estadisticas = ({ stats }: { stats: EstadisticasUsuario }) => {
  const winRate = stats.total_apuestas > 0 
    ? ((stats.ganadas / (stats.ganadas + stats.perdidas)) * 100) || 0
    : 0;

  return (
    <div className="rounded-2xl p-4 border border-white/10" style={{ background: 'rgba(30,41,59,0.7)' }}>
      <h3 className="text-white font-bold flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-[#00D1B2]" />
        Mis Estadísticas
      </h3>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#0F172A]/50 rounded-xl p-3 text-center">
          <p className={`text-2xl font-bold font-mono ${stats.ganancia_neta >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
            {stats.ganancia_neta >= 0 ? '+' : ''}${stats.ganancia_neta.toLocaleString()}
          </p>
          <p className="text-xs text-[#64748B]">Ganancia Neta</p>
        </div>
        <div className="bg-[#0F172A]/50 rounded-xl p-3 text-center">
          <p className={`text-2xl font-bold font-mono ${stats.yield >= 0 ? 'text-[#00D1B2]' : 'text-[#EF4444]'}`}>
            {stats.yield >= 0 ? '+' : ''}{stats.yield.toFixed(1)}%
          </p>
          <p className="text-xs text-[#64748B]">Yield</p>
        </div>
        <div className="bg-[#0F172A]/50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold font-mono text-white">
            {winRate.toFixed(1)}%
          </p>
          <p className="text-xs text-[#64748B]">Win Rate</p>
        </div>
        <div className="bg-[#0F172A]/50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold font-mono text-white">
            <span className="text-[#00D1B2]">{stats.ganadas}</span>
            <span className="text-[#64748B]">/</span>
            <span className="text-[#EF4444]">{stats.perdidas}</span>
          </p>
          <p className="text-xs text-[#64748B]">W/L</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
        <div className="text-center">
          <p className="text-lg font-bold text-white">{stats.total_apuestas}</p>
          <p className="text-xs text-[#64748B]">Apuestas</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-[#F59E0B]">{stats.pendientes}</p>
          <p className="text-xs text-[#64748B]">Pendientes</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-[#FFDD57]">+{stats.mejor_racha}</p>
          <p className="text-xs text-[#64748B]">Mejor Racha</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PÁGINA PRINCIPAL
// ============================================================================
export default function MiBancaPage() {
  const [banca, setBanca] = useState(100000); // CLP
  const [apuestas, setApuestas] = useState<ApuestaUsuario[]>([]);
  const [picksDelDia, setPicksDelDia] = useState<PickRecomendado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filtro, setFiltro] = useState<'TODAS' | 'PENDIENTE' | 'GANADA' | 'PERDIDA'>('TODAS');
  const [mostrarTodas, setMostrarTodas] = useState(false);

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Aquí irían las llamadas a la API
        // Por ahora simulamos datos
        const apuestasMock: ApuestaUsuario[] = [
          { id: 1, fecha: '2026-01-31', apuesta: 'Real Madrid vs Barcelona - Over 2.5 goles', cuota: 1.85, stake: 5000, resultado: 'PENDIENTE', tipster_alias: 'Golden Picks' },
          { id: 2, fecha: '2026-01-30', apuesta: 'Lakers vs Celtics - Lakers ML', cuota: 2.10, stake: 3000, resultado: 'GANADA', tipster_alias: 'Canasta VIP', ganancia_neta: 3300 },
          { id: 3, fecha: '2026-01-30', apuesta: 'Djokovic vs Alcaraz - Over 3.5 sets', cuota: 1.75, stake: 4000, resultado: 'PERDIDA', tipster_alias: 'Raqueta Oro', ganancia_neta: -4000 },
        ];
        
        const picksMock: PickRecomendado[] = [
          { id: 101, tipster_alias: 'Pro Master', tipster_yield: 12.5, apuesta: 'Man City vs Arsenal - BTTS Sí', cuota: 1.72, tipo_mercado: 'BTTS', fecha: '2026-01-31' },
          { id: 102, tipster_alias: 'Golden Picks', tipster_yield: 8.3, apuesta: 'PSG vs Bayern - Over 2.5', cuota: 1.65, tipo_mercado: 'Over/Under', fecha: '2026-01-31' },
        ];

        setApuestas(apuestasMock);
        setPicksDelDia(picksMock);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Guardar banca
  const handleSaveBanca = (nuevaBanca: number) => {
    setBanca(nuevaBanca);
    // Aquí guardarías en la API
  };

  // Registrar apuesta
  const handleRegistrarApuesta = (nuevaApuesta: Omit<ApuestaUsuario, 'id' | 'resultado' | 'ganancia_neta'>) => {
    const apuesta: ApuestaUsuario = {
      ...nuevaApuesta,
      id: Date.now(),
      resultado: 'PENDIENTE'
    };
    setApuestas([apuesta, ...apuestas]);
    // Aquí guardarías en la API
  };

  // Marcar resultado
  const handleMarcarResultado = (id: number, resultado: 'GANADA' | 'PERDIDA') => {
    setApuestas(apuestas.map(a => {
      if (a.id === id) {
        const ganancia = resultado === 'GANADA' 
          ? Math.round(a.stake * (a.cuota - 1))
          : -a.stake;
        return { ...a, resultado, ganancia_neta: ganancia };
      }
      return a;
    }));
    // Aquí actualizarías en la API
  };

  // Calcular estadísticas
  const calcularStats = (): EstadisticasUsuario => {
    const ganadas = apuestas.filter(a => a.resultado === 'GANADA');
    const perdidas = apuestas.filter(a => a.resultado === 'PERDIDA');
    const pendientes = apuestas.filter(a => a.resultado === 'PENDIENTE');
    
    const gananciaTotal = ganadas.reduce((acc, a) => acc + (a.ganancia_neta || 0), 0);
    const perdidaTotal = Math.abs(perdidas.reduce((acc, a) => acc + (a.ganancia_neta || 0), 0));
    const gananciaNeta = gananciaTotal - perdidaTotal;
    
    const totalApostado = apuestas
      .filter(a => a.resultado !== 'PENDIENTE')
      .reduce((acc, a) => acc + a.stake, 0);
    
    const resueltas = ganadas.length + perdidas.length;
    const yield_ = resueltas > 0 ? (gananciaNeta / resueltas / (totalApostado / resueltas || 1)) * 100 : 0;
    const roi = totalApostado > 0 ? (gananciaNeta / totalApostado) * 100 : 0;

    return {
      banca_actual: banca + gananciaNeta,
      total_apostado: totalApostado,
      ganancia_neta: gananciaNeta,
      roi,
      yield: yield_,
      total_apuestas: apuestas.length,
      ganadas: ganadas.length,
      perdidas: perdidas.length,
      pendientes: pendientes.length,
      mejor_racha: 5 // Esto se calcularía del historial
    };
  };

  const stats = calcularStats();

  // Filtrar apuestas
  const apuestasFiltradas = apuestas.filter(a => 
    filtro === 'TODAS' || a.resultado === filtro
  );
  const apuestasMostradas = mostrarTodas ? apuestasFiltradas : apuestasFiltradas.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#00D1B2]/30 border-t-[#00D1B2] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn pb-20 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Wallet className="h-7 w-7 text-[#00D1B2]" />
          Mi Banca
        </h1>
        <p className="text-[#94A3B8] text-sm mt-1">Gestiona tus apuestas como inversión</p>
      </div>

      {/* Intro */}
      <IntroBanca />

      {/* Banca + Botón */}
      <div className="grid md:grid-cols-2 gap-4">
        <BancaEditable banca={banca} onSave={handleSaveBanca} />
        
        <div className="rounded-2xl p-6 border border-white/10 flex flex-col justify-center" style={{ background: 'rgba(30,41,59,0.7)' }}>
          <button
            onClick={() => setModalOpen(true)}
            className="w-full py-4 rounded-xl bg-[#00D1B2] text-white font-bold text-lg hover:bg-[#00B89F] transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-6 w-6" />
            Registrar Apuesta
          </button>
          <p className="text-[#64748B] text-sm text-center mt-3">
            {picksDelDia.length} picks pendientes hoy
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <Estadisticas stats={stats} />

      {/* Picks Recomendados */}
      {picksDelDia.length > 0 && (
        <div className="rounded-2xl p-4 border border-white/10" style={{ background: 'rgba(30,41,59,0.7)' }}>
          <h3 className="text-white font-bold flex items-center gap-2 mb-3">
            <Flame className="h-5 w-5 text-[#FFDD57]" />
            Picks Recomendados Hoy
          </h3>
          <div className="space-y-2">
            {picksDelDia.slice(0, 3).map((pick) => (
              <div key={pick.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A]/50 border border-white/10">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#00D1B2] text-sm font-medium">{pick.tipster_alias}</span>
                    <span className="text-xs text-[#64748B]">+{pick.tipster_yield.toFixed(1)}% yield</span>
                  </div>
                  <p className="text-white text-sm">{pick.apuesta}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-mono font-bold">@{pick.cuota.toFixed(2)}</p>
                  <button
                    onClick={() => {
                      setModalOpen(true);
                    }}
                    className="text-xs text-[#00D1B2] hover:underline"
                  >
                    Agregar →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mis Apuestas */}
      <div className="rounded-2xl p-4 border border-white/10" style={{ background: 'rgba(30,41,59,0.7)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#00D1B2]" />
            Mis Apuestas
          </h3>
          <div className="flex gap-1">
            {(['TODAS', 'PENDIENTE', 'GANADA', 'PERDIDA'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  filtro === f 
                    ? f === 'GANADA' ? 'bg-[#00D1B2] text-white' 
                    : f === 'PERDIDA' ? 'bg-[#EF4444] text-white'
                    : f === 'PENDIENTE' ? 'bg-[#F59E0B] text-white'
                    : 'bg-[#00D1B2] text-white'
                    : 'bg-[#334155] text-[#94A3B8]'
                }`}
              >
                {f === 'TODAS' ? 'Todas' : f === 'PENDIENTE' ? '○' : f === 'GANADA' ? '✓' : '✗'}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de apuestas */}
        <div className="space-y-3">
          {apuestasMostradas.length === 0 ? (
            <p className="text-[#64748B] text-center py-4">No hay apuestas registradas</p>
          ) : (
            apuestasMostradas.map((apuesta) => (
              <CardApuestaUsuario 
                key={apuesta.id} 
                apuesta={apuesta} 
                onMarcarResultado={handleMarcarResultado}
              />
            ))
          )}
        </div>

        {apuestasFiltradas.length > 5 && !mostrarTodas && (
          <button 
            onClick={() => setMostrarTodas(true)}
            className="w-full mt-4 py-2 text-center text-[#00D1B2] text-sm font-medium hover:underline"
          >
            Ver todas ({apuestasFiltradas.length})
          </button>
        )}
      </div>

      {/* Modal */}
      <ModalRegistrarApuesta
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleRegistrarApuesta}
        banca={banca}
        picksDelDia={picksDelDia}
      />
    </div>
  );
}
